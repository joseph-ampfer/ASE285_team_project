import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  verifyToken,
  getFutureIncompletePlannerAssignments,
  getCanvasApiBase,
} from './canvas.js'

/**
 * build a minimal Response-like object that the service can read.
 *   - `ok` and `status` come from `init.status`
 *   - `headers.get('link')` returns init.linkHeader (for pagination)
 *   - `json()` resolves to the provided body
 */
function mockResponse(body, { status = 200, linkHeader = '' } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    headers: {
      get: (name) => (name?.toLowerCase() === 'link' ? linkHeader : null),
    },
  }
}

/**
 * build a Canvas planner item that the service classifies as
 * "future, incomplete assignment".
 */
function plannerItem({
  assignmentId,
  courseId = 5001,
  courseName = 'Algorithms',
  name = 'HW 1',
  dueAt,
  workflowState = 'published',
}) {
  return {
    plannable_type: 'assignment',
    plannable_id: assignmentId,
    course_id: courseId,
    context_name: courseName,
    plannable: {
      id: assignmentId,
      name,
      due_at: dueAt,
      workflow_state: workflowState,
      locked_for_user: false,
    },
  }
}

describe('canvas service', () => {
  let originalFetch

  beforeEach(() => {
    originalFetch = global.fetch
    delete process.env.CANVAS_BASE_URL
    delete process.env.CANVAS_API_BASE_URL
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  describe('getCanvasApiBase()', () => {
    it('falls back to canvas.instructure.com when no env var is set', () => {
      expect(getCanvasApiBase()).toBe('https://canvas.instructure.com/api/v1')
    })

    it('honors CANVAS_BASE_URL env var', () => {
      process.env.CANVAS_BASE_URL = 'https://nku.instructure.com/api/v1'
      expect(getCanvasApiBase()).toBe('https://nku.instructure.com/api/v1')
    })
  })

  describe('verifyToken()', () => {
    it('returns ok:false when token is empty', async () => {
      const result = await verifyToken('')
      expect(result.ok).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('returns ok:false when token is whitespace only', async () => {
      const result = await verifyToken('    ')
      expect(result.ok).toBe(false)
    })

    it('returns ok:true and the user payload on a 200 response', async () => {
      const fakeUser = { id: 999, name: 'Test Student' }
      global.fetch = vi.fn().mockResolvedValue(mockResponse(fakeUser))

      const result = await verifyToken('valid-token')

      expect(result.ok).toBe(true)
      expect(result.user).toEqual(fakeUser)
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // The Authorization header MUST contain the token (R5.1 safety)
      const [, init] = global.fetch.mock.calls[0]
      expect(init.headers.Authorization).toBe('Bearer valid-token')
    })

    it('returns ok:false with a Canvas API error code on non-2xx response', async () => {
      global.fetch = vi.fn().mockResolvedValue(mockResponse({}, { status: 401 }))

      const result = await verifyToken('bad-token')

      expect(result.ok).toBe(false)
      expect(result.error).toContain('401')
    })

    it('returns ok:false on a network failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'))

      const result = await verifyToken('any-token')

      expect(result.ok).toBe(false)
      expect(result.error).toBe('ECONNREFUSED')
    })
  })

  describe('getFutureIncompletePlannerAssignments()', () => {
    it('returns ok:false if no token is provided', async () => {
      const result = await getFutureIncompletePlannerAssignments('')
      expect(result.ok).toBe(false)
    })

    it('returns assignments mapped from planner items with course names', async () => {
      const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const items = [
        plannerItem({ assignmentId: 1, name: 'HW 1', dueAt: future, courseName: 'Algorithms' }),
        plannerItem({ assignmentId: 2, name: 'HW 2', dueAt: future, courseId: 5002, courseName: 'OS' }),
      ]
      global.fetch = vi.fn().mockResolvedValue(mockResponse(items))

      const result = await getFutureIncompletePlannerAssignments('token')

      expect(result.ok).toBe(true)
      expect(result.assignments).toHaveLength(2)
      expect(result.assignments[0]).toMatchObject({
        id: 1,
        course_id: 5001,
        course_name: 'Algorithms',
        name: 'HW 1',
        due_at: future,
      })
      expect(result.assignments[1]).toMatchObject({ id: 2, course_name: 'OS' })
    })

    it('skips planner items whose due_at is in the past', async () => {
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      const items = [
        plannerItem({ assignmentId: 11, dueAt: past }),
        plannerItem({ assignmentId: 12, dueAt: future }),
      ]
      global.fetch = vi.fn().mockResolvedValue(mockResponse(items))

      const result = await getFutureIncompletePlannerAssignments('token')

      expect(result.ok).toBe(true)
      expect(result.assignments.map((a) => a.id)).toEqual([12])
    })

    it('skips locked, unpublished, and graded planner items', async () => {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      const items = [
        // valid baseline
        plannerItem({ assignmentId: 21, dueAt: future }),
        // locked
        {
          ...plannerItem({ assignmentId: 22, dueAt: future }),
          plannable: {
            ...plannerItem({ assignmentId: 22, dueAt: future }).plannable,
            locked_for_user: true,
          },
        },
        // unpublished
        plannerItem({ assignmentId: 23, dueAt: future, workflowState: 'unpublished' }),
        // already graded
        {
          ...plannerItem({ assignmentId: 24, dueAt: future }),
          plannable: {
            ...plannerItem({ assignmentId: 24, dueAt: future }).plannable,
            submission: { workflow_state: 'graded' },
          },
        },
      ]
      global.fetch = vi.fn().mockResolvedValue(mockResponse(items))

      const result = await getFutureIncompletePlannerAssignments('token')

      expect(result.ok).toBe(true)
      expect(result.assignments.map((a) => a.id)).toEqual([21])
    })

    it('skips non-assignment plannable types (e.g. quizzes, announcements)', async () => {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      const items = [
        plannerItem({ assignmentId: 31, dueAt: future }),
        { ...plannerItem({ assignmentId: 32, dueAt: future }), plannable_type: 'announcement' },
      ]
      global.fetch = vi.fn().mockResolvedValue(mockResponse(items))

      const result = await getFutureIncompletePlannerAssignments('token')

      expect(result.assignments.map((a) => a.id)).toEqual([31])
    })

    it('deduplicates the same assignment id appearing on multiple planner pages', async () => {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      const sameItem = plannerItem({ assignmentId: 42, dueAt: future, name: 'Project' })

      const page1 = mockResponse([sameItem], {
        linkHeader: '<https://canvas.instructure.com/api/v1/planner/items?page=2>; rel="next"',
      })
      const page2 = mockResponse([sameItem]) // no link header → ends pagination

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce(page1)
        .mockResolvedValueOnce(page2)

      const result = await getFutureIncompletePlannerAssignments('token')

      expect(global.fetch).toHaveBeenCalledTimes(2)
      expect(result.assignments).toHaveLength(1)
      expect(result.assignments[0].id).toBe(42)
    })

    it('returns ok:false when Canvas responds with a non-2xx status', async () => {
      global.fetch = vi.fn().mockResolvedValue(mockResponse({}, { status: 500 }))

      const result = await getFutureIncompletePlannerAssignments('token')

      expect(result.ok).toBe(false)
      expect(result.error).toContain('500')
    })
  })
})

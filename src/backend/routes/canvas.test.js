import 'dotenv/config'
import request from 'supertest'
import express from 'express'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import jwt from 'jsonwebtoken'
import { createApiRouter } from '../routes/api.js'
import User from '../models/User.js'
import Post, { KanbanStatus } from '../models/Post.js'
import { JWT_SECRET } from '../util/env.js'

/**
 * These tests cover the user-facing Canvas integration HTTP surface
 * end-to-end (route → service → DB), with the actual outbound `fetch`
 * to canvas.instructure.com replaced by a vitest mock. They exercise
 * the same code path the real frontend hits.
 *
 * Coverage map:
 *   R5.1 — Connect Canvas account: PUT /api/settings + GET /api/canvas/verify
 *   R5.2 — Import Canvas assignments: POST /api/canvas/sync
 *   R5.3 — Auto-sync Canvas updates: second POST /api/canvas/sync skips dups
 */

let userSeq = 0
async function createTestUser({ canvasApiToken = '' } = {}) {
  userSeq += 1
  const tag = `${Date.now()}_${userSeq}`
  return User.create({
    username: `naeun_${tag}`,
    email: `naeun_${tag}@test.com`,
    passwordHash: 'hashed',
    canvasApiToken,
  })
}

function generateTestToken(user) {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' })
}

function mockFetchOnce(body, { status = 200, linkHeader = '' } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    headers: { get: (n) => (n?.toLowerCase() === 'link' ? linkHeader : null) },
  }
}

function plannerItem({ assignmentId, courseId = 5001, courseName = 'Algorithms', name = 'HW', dueAt }) {
  return {
    plannable_type: 'assignment',
    plannable_id: assignmentId,
    course_id: courseId,
    context_name: courseName,
    plannable: {
      id: assignmentId,
      name,
      due_at: dueAt,
      workflow_state: 'published',
      locked_for_user: false,
    },
  }
}

describe('Canvas API routes', () => {
  let app
  let user
  let token
  let originalFetch

  beforeEach(async () => {
    app = express()
    app.use(express.json())
    app.use('/api', createApiRouter())

    user = await createTestUser({ canvasApiToken: 'stored-token' })
    token = generateTestToken(user)

    originalFetch = global.fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  const auth = (req) => req.set('Authorization', `Bearer ${token}`)

  // ────────────────────────────────────────────────────────────
  // R5.1 — Connect Canvas account
  // ────────────────────────────────────────────────────────────
  describe('R5.1: Connect Canvas account', () => {
    it('PUT /api/settings saves the Canvas API token to the user', async () => {
      const res = await auth(request(app).put('/api/settings'))
        .send({ canvasApiToken: 'fresh-token-xyz' })

      expect(res.status).toBe(200)
      expect(res.body.canvasApiToken).toBe('fresh-token-xyz')

      const updated = await User.findById(user._id)
      expect(updated.canvasApiToken).toBe('fresh-token-xyz')
    })

    it('GET /api/settings returns the saved token for the logged-in user', async () => {
      const res = await auth(request(app).get('/api/settings'))

      expect(res.status).toBe(200)
      expect(res.body.canvasApiToken).toBe('stored-token')
    })

    it('GET /api/canvas/verify returns success when Canvas accepts the token', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        mockFetchOnce({ id: 999, name: 'Naeun Kim' })
      )

      const res = await auth(request(app).get('/api/canvas/verify'))

      expect(res.status).toBe(200)
      expect(res.body.ok).toBe(true)
      expect(res.body.user).toMatchObject({ id: 999, name: 'Naeun Kim' })

      // Verify we actually sent the user's token to Canvas
      const [, init] = global.fetch.mock.calls[0]
      expect(init.headers.Authorization).toBe('Bearer stored-token')
    })

    it('GET /api/canvas/verify returns 502 with an error when Canvas rejects the token', async () => {
      global.fetch = vi.fn().mockResolvedValue(mockFetchOnce({}, { status: 401 }))

      const res = await auth(request(app).get('/api/canvas/verify'))

      expect(res.status).toBe(502)
      expect(res.body.ok).toBe(false)
      expect(res.body.error).toContain('401')
    })

    it('GET /api/canvas/verify returns 400 when no token is saved on the user', async () => {
      const noTokenUser = await createTestUser({ canvasApiToken: '' })
      const noTokenToken = generateTestToken(noTokenUser)

      const res = await request(app)
        .get('/api/canvas/verify')
        .set('Authorization', `Bearer ${noTokenToken}`)

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/token/i)
    })

    it('rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/canvas/verify')
      expect(res.status).toBe(401)
    })
  })

  // ────────────────────────────────────────────────────────────
  // R5.2 — Import Canvas assignments as tasks
  // ────────────────────────────────────────────────────────────
  describe('R5.2: Import Canvas assignments', () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    it('POST /api/canvas/sync creates a Post for each future Canvas assignment', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        mockFetchOnce([
          plannerItem({ assignmentId: 101, name: 'HW 1', dueAt: future, courseName: 'Algorithms' }),
          plannerItem({ assignmentId: 102, name: 'HW 2', dueAt: future, courseId: 5002, courseName: 'OS' }),
        ])
      )

      const res = await auth(request(app).post('/api/canvas/sync'))

      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({
        synced: true,
        created: 2,
        skipped: 0,
        assignmentCount: 2,
      })

      const tasks = await Post.find({ owner: user._id }).sort({ canvasAssignmentId: 1 })
      expect(tasks).toHaveLength(2)
      expect(tasks[0].canvasAssignmentId).toBe(101)
      expect(tasks[0].title).toBe('HW 1')
      expect(tasks[0].description).toBe('Algorithms') // course name
      expect(tasks[0].status).toBe(KanbanStatus.TODO)
    })

    it('imported Posts carry the Canvas assignment due date (R5.2 acceptance)', async () => {
      // Pick a date well in the future so the planner filter accepts it.
      const dueIso = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      const expectedDateStr = dueIso.split('T')[0]

      global.fetch = vi.fn().mockResolvedValue(
        mockFetchOnce([
          plannerItem({ assignmentId: 201, name: 'Project', dueAt: dueIso, courseName: 'AI' }),
        ])
      )

      const res = await auth(request(app).post('/api/canvas/sync'))

      expect(res.status).toBe(200)
      expect(res.body.created).toBe(1)

      const task = await Post.findOne({ owner: user._id, canvasAssignmentId: 201 })
      // The route splits the ISO string at the "T" → just the date portion
      expect(task.date).toBe(expectedDateStr)
    })

    it('returns 502 when Canvas itself fails', async () => {
      global.fetch = vi.fn().mockResolvedValue(mockFetchOnce({}, { status: 500 }))

      const res = await auth(request(app).post('/api/canvas/sync'))

      expect(res.status).toBe(502)
      expect(res.body.error).toBeDefined()
    })

    it('returns 400 when the user has not saved a Canvas token', async () => {
      const noTokenUser = await createTestUser({ canvasApiToken: '' })
      const noTokenToken = generateTestToken(noTokenUser)

      const res = await request(app)
        .post('/api/canvas/sync')
        .set('Authorization', `Bearer ${noTokenToken}`)

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/token/i)
    })
  })

  // ────────────────────────────────────────────────────────────
  // R5.3 — Sync Canvas assignment updates without duplicating
  // ────────────────────────────────────────────────────────────
  describe('R5.3: Auto-sync Canvas updates', () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    it('skips Canvas assignments the user already has (idempotent re-sync)', async () => {
      const planner = [
        plannerItem({ assignmentId: 301, name: 'Quiz 1', dueAt: future, courseName: 'DB' }),
      ]
      // Two consecutive Canvas calls return the same single planner item
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce(mockFetchOnce(planner))
        .mockResolvedValueOnce(mockFetchOnce(planner))

      const first = await auth(request(app).post('/api/canvas/sync'))
      expect(first.body.created).toBe(1)
      expect(first.body.skipped).toBe(0)

      const second = await auth(request(app).post('/api/canvas/sync'))
      expect(second.body.created).toBe(0)
      expect(second.body.skipped).toBe(1)

      // Only ONE Post in DB despite two sync calls
      const tasks = await Post.find({ owner: user._id, canvasAssignmentId: 301 })
      expect(tasks).toHaveLength(1)
    })

    it('does not collide with another user\'s identical Canvas assignment id', async () => {
      // Two users importing the same Canvas assignment should each get their own copy
      const otherUser = await createTestUser({ canvasApiToken: 'other-token' })
      const otherToken = generateTestToken(otherUser)

      const planner = [
        plannerItem({ assignmentId: 401, name: 'Shared HW', dueAt: future, courseName: 'Shared' }),
      ]
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce(mockFetchOnce(planner))
        .mockResolvedValueOnce(mockFetchOnce(planner))

      await auth(request(app).post('/api/canvas/sync'))
      await request(app)
        .post('/api/canvas/sync')
        .set('Authorization', `Bearer ${otherToken}`)

      const mine = await Post.find({ owner: user._id, canvasAssignmentId: 401 })
      const theirs = await Post.find({ owner: otherUser._id, canvasAssignmentId: 401 })
      expect(mine).toHaveLength(1)
      expect(theirs).toHaveLength(1)
    })

    it('returns a friendly message when Canvas has zero matching assignments', async () => {
      global.fetch = vi.fn().mockResolvedValue(mockFetchOnce([]))

      const res = await auth(request(app).post('/api/canvas/sync'))

      expect(res.status).toBe(200)
      expect(res.body.created).toBe(0)
      expect(res.body.message).toMatch(/no matching assignments/i)
    })
  })
})

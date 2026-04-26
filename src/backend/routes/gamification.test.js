import 'dotenv/config'
import request from 'supertest'
import express from 'express'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import jwt from 'jsonwebtoken'
import { createApiRouter } from '../routes/api.js'
import User from '../models/User.js'
import Post, { KanbanStatus } from '../models/Post.js'
import GamificationStats from '../models/GamificationStats.js'
import GamificationEvent from '../models/GamificationEvent.js'
import { JWT_SECRET } from '../util/env.js'

/**
 * Integration tests for the gamification flow as exposed through the REST
 * API. These cover the user-visible acceptance criteria from the sprint
 * plan:
 *
 *   R6.1 — Complete a task → verify points increase (+10 base)
 *   R6.2 — View profile → verify points total and current level returned
 *          by GET /api/gamification/stats and GET /api/gamification/history
 *   R6.3 — Complete task 2 days early → verify bonus points awarded
 */

let userSeq = 0
async function createTestUser() {
  userSeq += 1
  const tag = `${Date.now()}_${userSeq}`
  return User.create({
    username: `naeun_${tag}`,
    email: `naeun_${tag}@test.com`,
    passwordHash: 'hashed',
  })
}

function generateTestToken(user) {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' })
}

const FIXED_NOW = new Date('2026-03-10T12:00:00Z')

describe('Gamification API (integration)', () => {
  let app
  let user
  let token

  beforeEach(async () => {
    app = express()
    app.use(express.json())
    app.use('/api', createApiRouter())

    user = await createTestUser()
    token = generateTestToken(user)

    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const auth = (req) => req.set('Authorization', `Bearer ${token}`)

  // ────────────────────────────────────────────────────────────
  // R6.1 — earn points on task completion
  // ────────────────────────────────────────────────────────────
  describe('R6.1: Earn points when a task is completed', () => {
    it('PUT /api/posts/:id with status=done returns gamification + base 10 points', async () => {
      const post = await Post.create({
        owner: user._id,
        title: 'Math HW',
        date: '2026-03-10',
        status: KanbanStatus.TODO,
      })

      const res = await auth(request(app).put(`/api/posts/${post._id}`))
        .send({ status: KanbanStatus.DONE })

      expect(res.status).toBe(200)
      // Route returns { post, gamification } when a task transitions to DONE
      expect(res.body.post.status).toBe(KanbanStatus.DONE)
      expect(res.body.post.completed).toBe(true)
      expect(res.body.gamification).toBeDefined()
      expect(res.body.gamification.breakdown.base).toBe(10)
      // base 10 + early 0 + combo 2 (first streak) = 12
      expect(res.body.gamification.gained).toBe(12)
      expect(res.body.gamification.stats.points).toBe(12)
    })

    it('does NOT re-award points when an already-done task is updated again', async () => {
      const post = await Post.create({
        owner: user._id,
        title: 'Already done',
        date: '2026-03-10',
        status: KanbanStatus.TODO,
      })
      // First transition to done → awards
      await auth(request(app).put(`/api/posts/${post._id}`))
        .send({ status: KanbanStatus.DONE })

      // Now update something else while still done — should NOT award again
      const res = await auth(request(app).put(`/api/posts/${post._id}`))
        .send({ status: KanbanStatus.DONE, title: 'Renamed' })

      // When no points are awarded, the route returns the post directly (no { post, gamification } wrapper)
      expect(res.status).toBe(200)
      expect(res.body.gamification).toBeUndefined()

      // Stats stayed at the original 12 from the first completion
      const statsRes = await auth(request(app).get('/api/gamification/stats'))
      expect(statsRes.body.points).toBe(12)
    })

    it('does not award points when status changes between todo and in-progress only', async () => {
      const post = await Post.create({
        owner: user._id,
        title: 'In progress',
        date: '2026-03-10',
        status: KanbanStatus.TODO,
      })

      const res = await auth(request(app).put(`/api/posts/${post._id}`))
        .send({ status: KanbanStatus.IN_PROGRESS })

      expect(res.status).toBe(200)
      expect(res.body.gamification).toBeUndefined()
      const statsRes = await auth(request(app).get('/api/gamification/stats'))
      expect(statsRes.body.points).toBe(0)
    })
  })

  // ────────────────────────────────────────────────────────────
  // R6.2 — see total points and level on profile
  // ────────────────────────────────────────────────────────────
  describe('R6.2: View profile points and level', () => {
    it('GET /api/gamification/stats returns default zeros for a new user', async () => {
      const res = await auth(request(app).get('/api/gamification/stats'))

      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({
        points: 0,
        level: 1,
        streakCount: 0,
        nextLevelAt: 100,
        completedLast7Days: 0,
      })
    })

    it('GET /api/gamification/stats reflects points after completing tasks', async () => {
      // Pre-seed stats so we don't have to complete 9 tasks
      await GamificationStats.create({
        _id: String(user._id),
        points: 250,
        level: 1, // route should recompute level from points
        streakCount: 4,
      })

      const res = await auth(request(app).get('/api/gamification/stats'))

      expect(res.status).toBe(200)
      expect(res.body.points).toBe(250)
      expect(res.body.level).toBe(3) // floor(250/100) + 1
      expect(res.body.nextLevelAt).toBe(300)
      expect(res.body.streakCount).toBe(4)
    })

    it('GET /api/gamification/history returns recent completion events', async () => {
      const post = await Post.create({
        owner: user._id,
        title: 'Visible event',
        date: '2026-03-10',
        status: KanbanStatus.TODO,
      })
      await auth(request(app).put(`/api/posts/${post._id}`))
        .send({ status: KanbanStatus.DONE })

      const res = await auth(request(app).get('/api/gamification/history'))

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body).toHaveLength(1)
      expect(res.body[0]).toMatchObject({
        title: 'Visible event',
        date: '2026-03-10',
        gained: 12,
        completionDay: '2026-03-10',
      })
    })

    it('only returns the current user\'s history (no leakage between users)', async () => {
      const otherUser = await createTestUser()
      const otherToken = generateTestToken(otherUser)

      // Other user completes a task
      await GamificationEvent.create({
        _id: 'other-event-1',
        owner: otherUser._id,
        postId: 'p1',
        title: 'Other user task',
        date: '2026-03-10',
        gained: 10,
        breakdown: { base: 10, earlyBonus: 0, comboBonus: 0, daysEarly: 0 },
        completionDay: '2026-03-10',
      })

      const res = await auth(request(app).get('/api/gamification/history'))
      expect(res.body).toHaveLength(0)

      // And the other user does see their own
      const otherRes = await request(app)
        .get('/api/gamification/history')
        .set('Authorization', `Bearer ${otherToken}`)
      expect(otherRes.body).toHaveLength(1)
    })
  })

  // ────────────────────────────────────────────────────────────
  // R6.3 — bonus points for completing tasks early
  // ────────────────────────────────────────────────────────────
  describe('R6.3: Bonus points for early completion', () => {
    it('awards a +6 early bonus (3 pts/day × 2 days) when completing 2 days early', async () => {
      const post = await Post.create({
        owner: user._id,
        title: 'Essay',
        date: '2026-03-12', // due 2 days after FIXED_NOW
        status: KanbanStatus.TODO,
      })

      const res = await auth(request(app).put(`/api/posts/${post._id}`))
        .send({ status: KanbanStatus.DONE })

      expect(res.status).toBe(200)
      expect(res.body.gamification.breakdown.daysEarly).toBe(2)
      expect(res.body.gamification.breakdown.earlyBonus).toBe(6)
      // base 10 + early 6 + combo 2 = 18
      expect(res.body.gamification.gained).toBe(18)
      expect(res.body.gamification.stats.points).toBe(18)
    })

    it('does NOT award an early bonus when the task is overdue', async () => {
      const post = await Post.create({
        owner: user._id,
        title: 'Late HW',
        date: '2026-03-05',
        status: KanbanStatus.TODO,
      })

      const res = await auth(request(app).put(`/api/posts/${post._id}`))
        .send({ status: KanbanStatus.DONE })

      expect(res.body.gamification.breakdown.earlyBonus).toBe(0)
      expect(res.body.gamification.breakdown.daysEarly).toBe(0)
    })

    it('awards a larger early bonus the further ahead the task is finished', async () => {
      const post = await Post.create({
        owner: user._id,
        title: 'Big project',
        date: '2026-03-20', // 10 days early
        status: KanbanStatus.TODO,
      })

      const res = await auth(request(app).put(`/api/posts/${post._id}`))
        .send({ status: KanbanStatus.DONE })

      expect(res.body.gamification.breakdown.daysEarly).toBe(10)
      expect(res.body.gamification.breakdown.earlyBonus).toBe(30)
    })
  })
})

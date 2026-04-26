import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import mongoose from 'mongoose'
import {
  awardForTaskCompletion,
  getStats,
  getHistory,
  deleteHistoryEvent,
} from './gamification.js'
import GamificationStats from '../models/GamificationStats.js'
import GamificationEvent from '../models/GamificationEvent.js'
import Post, { KanbanStatus } from '../models/Post.js'

/**
 * Build an in-memory todo object that mimics what the API hands to
 * `awardForTaskCompletion` after marking a task as DONE.
 */
function makeTodo({ title = 'Math HW', date = '2026-03-10', _id } = {}) {
  return { _id: _id || new mongoose.Types.ObjectId(), title, date }
}

const FIXED_NOW = new Date('2026-03-10T15:00:00Z') // matches `date` for daysEarly=0 baseline

describe('gamification service', () => {
  let userId

  beforeEach(async () => {
    userId = new mongoose.Types.ObjectId()
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  // ────────────────────────────────────────────────────────────
  // R6.1 — earn points when a task is completed
  // ────────────────────────────────────────────────────────────
  describe('R6.1: awardForTaskCompletion — base points', () => {
    it('awards exactly the +10 base points the first time a task is completed', async () => {
      const todo = makeTodo({ date: '2026-03-10' }) // due today → no early bonus

      const result = await awardForTaskCompletion(todo, userId)

      expect(result.breakdown.base).toBe(10)
      expect(result.breakdown.earlyBonus).toBe(0)
      // streak = 1 → comboBonus = 2
      expect(result.breakdown.comboBonus).toBe(2)
      expect(result.gained).toBe(12)
      expect(result.stats.points).toBe(12)
    })

    it('persists awarded points to the GamificationStats document', async () => {
      const todo = makeTodo({ date: '2026-03-10' })
      await awardForTaskCompletion(todo, userId)

      const stats = await GamificationStats.findById(String(userId))
      expect(stats).not.toBeNull()
      expect(stats.points).toBe(12) // base 10 + combo 2
    })

    it('writes a GamificationEvent history row for every completion', async () => {
      const todo = makeTodo({ title: 'Lab 3', date: '2026-03-10' })
      await awardForTaskCompletion(todo, userId)

      const events = await GamificationEvent.find({ owner: userId })
      expect(events).toHaveLength(1)
      expect(events[0].title).toBe('Lab 3')
      expect(events[0].gained).toBe(12)
    })

    it('keeps each user\'s points isolated (no cross-user contamination)', async () => {
      const otherUser = new mongoose.Types.ObjectId()
      await awardForTaskCompletion(makeTodo({ date: '2026-03-10' }), userId)
      await awardForTaskCompletion(makeTodo({ date: '2026-03-10' }), otherUser)

      const myStats = await getStats(userId)
      const theirStats = await getStats(otherUser)
      expect(myStats.points).toBe(12)
      expect(theirStats.points).toBe(12)
    })
  })

  // ────────────────────────────────────────────────────────────
  // R6.2 — points and level visible on profile
  // ────────────────────────────────────────────────────────────
  describe('R6.2: getStats — points & level', () => {
    it('returns default stats (points=0, level=1) for a brand new user', async () => {
      const stats = await getStats(userId)

      expect(stats.points).toBe(0)
      expect(stats.level).toBe(1)
      expect(stats.streakCount).toBe(0)
      expect(stats.nextLevelAt).toBe(100)
      expect(stats.completedLast7Days).toBe(0)
    })

    it('promotes the level once the user crosses 100 points', async () => {
      // Manually set high point total
      await GamificationStats.create({ _id: String(userId), points: 150 })

      const stats = await getStats(userId)

      expect(stats.points).toBe(150)
      expect(stats.level).toBe(2) // floor(150/100) + 1
      expect(stats.nextLevelAt).toBe(200)
    })

    it('counts only completions from the last 7 days', async () => {
      const recent = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      const old = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      await Post.create({
        owner: userId,
        title: 'Recent done',
        date: '2026-03-09',
        status: KanbanStatus.DONE,
        completedAt: recent,
      })
      await Post.create({
        owner: userId,
        title: 'Old done',
        date: '2026-02-01',
        status: KanbanStatus.DONE,
        completedAt: old,
      })

      const stats = await getStats(userId)
      expect(stats.completedLast7Days).toBe(1)
    })
  })

  // ────────────────────────────────────────────────────────────
  // R6.3 — bonus for completing tasks before the due date
  // ────────────────────────────────────────────────────────────
  describe('R6.3: awardForTaskCompletion — early-completion bonus', () => {
    it('adds +3 points per day when a task is completed before its due date', async () => {
      // Due 2 days after "today" → expect +6 early bonus
      const todo = makeTodo({ date: '2026-03-12' })

      const result = await awardForTaskCompletion(todo, userId)

      expect(result.breakdown.daysEarly).toBe(2)
      expect(result.breakdown.earlyBonus).toBe(6)
      expect(result.breakdown.base).toBe(10)
      // base 10 + early 6 + combo 2 (streak=1) = 18
      expect(result.gained).toBe(18)
    })

    it('does not award an early bonus when the task is overdue', async () => {
      // Due in the past
      const todo = makeTodo({ date: '2026-03-05' })

      const result = await awardForTaskCompletion(todo, userId)

      expect(result.breakdown.daysEarly).toBe(0)
      expect(result.breakdown.earlyBonus).toBe(0)
    })

    it('does not award an early bonus when the task is completed on the due date', async () => {
      const todo = makeTodo({ date: '2026-03-10' })

      const result = await awardForTaskCompletion(todo, userId)

      expect(result.breakdown.earlyBonus).toBe(0)
    })
  })

  // ────────────────────────────────────────────────────────────
  // Streak behavior (supports both R6.1 and R6.2)
  // ────────────────────────────────────────────────────────────
  describe('streak tracking', () => {
    it('starts streakCount at 1 for the user\'s first ever completion', async () => {
      const result = await awardForTaskCompletion(makeTodo({ date: '2026-03-10' }), userId)
      expect(result.stats.streakCount).toBe(1)
    })

    it('does not increment streak when two completions happen on the same day', async () => {
      await awardForTaskCompletion(makeTodo({ date: '2026-03-10' }), userId)
      const second = await awardForTaskCompletion(makeTodo({ date: '2026-03-10' }), userId)

      expect(second.stats.streakCount).toBe(1)
    })

    it('increments streak when completion day is the day after lastCompletionDay', async () => {
      // Day 1
      await awardForTaskCompletion(makeTodo({ date: '2026-03-10' }), userId)

      // Move clock forward 1 day
      vi.setSystemTime(new Date('2026-03-11T15:00:00Z'))
      const second = await awardForTaskCompletion(makeTodo({ date: '2026-03-11' }), userId)

      expect(second.stats.streakCount).toBe(2)
    })

    it('resets streak to 1 when there is a multi-day gap', async () => {
      await awardForTaskCompletion(makeTodo({ date: '2026-03-10' }), userId)

      vi.setSystemTime(new Date('2026-03-15T15:00:00Z')) // 5-day gap
      const second = await awardForTaskCompletion(makeTodo({ date: '2026-03-15' }), userId)

      expect(second.stats.streakCount).toBe(1)
    })
  })

  // ────────────────────────────────────────────────────────────
  // History deletion (refund points)
  // ────────────────────────────────────────────────────────────
  describe('deleteHistoryEvent', () => {
    it('removes an event and subtracts its gained points from the user', async () => {
      const todo = makeTodo({ date: '2026-03-12' })
      const award = await awardForTaskCompletion(todo, userId)

      const history = await getHistory(userId)
      const eventId = history[0].id

      const result = await deleteHistoryEvent(userId, eventId)

      expect(result).not.toBeNull()
      expect(result.stats.points).toBe(0) // 18 - 18
      const remaining = await GamificationEvent.find({ owner: userId })
      expect(remaining).toHaveLength(0)
      expect(award.gained).toBe(18)
    })

    it('returns null when the event does not exist for the user', async () => {
      const result = await deleteHistoryEvent(userId, 'non-existent-id')
      expect(result).toBeNull()
    })

    it('does not let a user delete another user\'s history event', async () => {
      const otherUser = new mongoose.Types.ObjectId()
      await awardForTaskCompletion(makeTodo({ date: '2026-03-10' }), otherUser)

      const otherHistory = await getHistory(otherUser)
      const eventId = otherHistory[0].id

      const result = await deleteHistoryEvent(userId, eventId)

      expect(result).toBeNull() // not found for `userId`
      const stillThere = await GamificationEvent.findById(eventId)
      expect(stillThere).not.toBeNull()
    })
  })
})

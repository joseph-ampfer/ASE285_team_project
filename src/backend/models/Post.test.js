import mongoose from 'mongoose';
import { describe, it, expect } from 'vitest'
import Post, { KanbanStatus } from './Post.js'

describe('Post model', () => {
  it('requires title and date', async () => {
    const post = new Post({
      owner: new mongoose.Types.ObjectId(),
  })

    await expect(post.validate()).rejects.toThrow()
  })

  it('applies default values', async () => {
    const post = new Post({
      owner: new mongoose.Types.ObjectId(),
      title: 'Test',
      date: '2026-01-01',
    })

    await post.validate()

    expect(post.status).toBe(KanbanStatus.TODO) 
    expect(post.description).toBe('')
  })

  it('rejects invalid status', async () => {
    const post = new Post({
      owner: new mongoose.Types.ObjectId(),
      title: 'Test',
      date: '2026-01-01',
      status: 'invalid',
    })

    await expect(post.validate()).rejects.toThrow()
  })

  it('creates subtasks with default completed state', async () => {
    const post = new Post({
      owner: new mongoose.Types.ObjectId(),
      title: 'Task',
      date: '2026-01-01',
      subtasks: [{ title: 'Subtask' }]
    })

    await post.validate()

    expect(post.subtasks[0].completed).toBe(false)
  })
})


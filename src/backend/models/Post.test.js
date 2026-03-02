import { describe, it, expect, beforeEach } from 'vitest'
import Post, { KanbanStatus } from './Post.js'

describe('Post model', () => {
  it('requires title and date', async () => {
    const post = new Post({ _id: 1 })

    await expect(post.validate()).rejects.toThrow()
  })

  it('applies default values', async () => {
    const post = new Post({
      _id: 1,
      title: 'Test',
      date: '2026-01-01',
    })

    await post.validate()

    expect(post.status).toBe(KanbanStatus.TODO)
    expect(post.completed).toBe(false)
    expect(post.description).toBe('')
  })

  it('rejects invalid status', async () => {
    const post = new Post({
      _id: 1,
      title: 'Test',
      date: '2026-01-01',
      status: 'invalid',
    })

    await expect(post.validate()).rejects.toThrow()
  })
})


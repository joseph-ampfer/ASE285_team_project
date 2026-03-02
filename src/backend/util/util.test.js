import { describe, it, expect, beforeEach } from 'vitest'
import mongoose from 'mongoose'
import Counter from '../models/Counter.js'
import { getNextId } from './util.js'

describe('getNextId', () => {
  beforeEach(async () => {
    await Counter.deleteMany({})
  })

  it('creates counter and returns 1 on first call', async () => {
    const id = await getNextId()

    expect(id).toBe(1)

    const counter = await Counter.findById('postId')
    expect(counter.seq).toBe(1)
  })

  it('increments sequentially', async () => {
    const id1 = await getNextId()
    const id2 = await getNextId()
    const id3 = await getNextId()

    expect(id1).toBe(1)
    expect(id2).toBe(2)
    expect(id3).toBe(3)
  })

  it('persists value between calls', async () => {
    await getNextId()
    await getNextId()

    const counter = await Counter.findById('postId')
    expect(counter.seq).toBe(2)
  })
})


import request from 'supertest'
import express from 'express'
import { describe, it, expect, beforeEach } from 'vitest'
import { createApiRouter } from '../routes/api.js'
import Post from '../models/Post.js'
import { KanbanStatus } from '../models/Post.js'

describe('API Routes', () => {
  let app

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api', createApiRouter())
  })

  describe('POST /api/posts', () => {
    it('returns 400 if title missing', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({ date: '2026-03-01' })

      expect(res.status).toBe(400)
    })

    it('creates post successfully', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({
          title: 'Test Post',
          date: '2026-03-01',
          status: KanbanStatus.DONE
        })

      expect(res.status).toBe(201)
      expect(res.body.title).toBe('Test Post')
    })
  })

  describe('GET /api/posts/:id', () => {
    it('returns 404 if not found', async () => {
      const res = await request(app).get('/api/posts/999')
      expect(res.status).toBe(404)
    })
  })

  describe('PUT /api/posts/:id', () => {
    it('updates a post', async () => {
      const post = await Post.create({
        _id: 1,
        title: 'Old',
        date: '2026-03-01'
      })

      const res = await request(app)
        .put(`/api/posts/${post._id}`)
        .send({ title: 'Updated' })

      expect(res.status).toBe(200)
      expect(res.body.title).toBe('Updated')
    })
  })

  describe('DELETE /api/posts/:id', () => {
    it('deletes a post', async () => {
      await Post.create({
        _id: 1,
        title: 'Delete Me',
        date: '2026-03-01'
      })

      const res = await request(app)
        .delete('/api/posts/1')

      expect(res.status).toBe(200)
      expect(res.body.ok).toBe(true)
    })
  })
})


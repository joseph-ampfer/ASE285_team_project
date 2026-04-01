import 'dotenv/config'
import request from 'supertest'
import express from 'express'
import mongoose from 'mongoose'
import { describe, it, expect, beforeEach } from 'vitest'
import { createApiRouter } from '../routes/api.js'
import Post, { KanbanStatus } from '../models/Post.js'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { requireAuth } from '../util/auth.js'

const JWT_SECRET = process.env.JWT_SECRET

async function createTestUser() {
  const user = await User.create({
    username: 'testuser',
    email: `test_${Date.now()}@test.com`,
    passwordHash: 'hashed' // not used in these tests
  })

  return user
}

function generateTestToken(user) {
  return jwt.sign(
    { id: user._id },
    JWT_SECRET,
    { expiresIn: '1h' }
  )
}

describe('API Routes', () => {
  let app
  let user
  let token

  beforeEach(async () => {
    app = express()
    app.use(express.json())

    user = await createTestUser()
    token = generateTestToken(user)

    app.use('/api', requireAuth, createApiRouter())
  })

  const authHeader = (req) =>
    req.set('Authorization', `Bearer ${token}`)

  describe('POST /api/posts', () => {
    it('returns 400 if title missing', async () => {
      const res = await authHeader(
        request(app).post('/api/posts')
      ).send({ date: '2026-03-01' })

      expect(res.status).toBe(400)
    })

    it('creates post successfully', async () => {
      const res = await authHeader(
        request(app).post('/api/posts')
      ).send({
        title: 'Test Post',
        date: '2026-03-01',
        status: KanbanStatus.DONE
      })

      expect(res.status).toBe(201)
      expect(res.body.title).toBe('Test Post')
      expect(res.body.owner).toBeDefined()
    })
  })

  describe('GET /api/posts/:id', () => {
    it('returns 404 if not found', async () => {
      const fakeId = new mongoose.Types.ObjectId()

      const res = await authHeader(
        request(app).get(`/api/posts/${fakeId}`)
      )

      expect(res.status).toBe(404)
    })
  })

  describe('PUT /api/posts/:id', () => {
    it('updates a post', async () => {
      const post = await Post.create({
        owner: user._id,
        title: 'Old',
        date: '2026-03-01'
      })

      const res = await authHeader(
        request(app).put(`/api/posts/${post._id}`)
      ).send({ title: 'Updated' })

      expect(res.status).toBe(200)
      expect(res.body.title).toBe('Updated')
    })
  })

  describe('DELETE /api/posts/:id', () => {
    it('deletes a post', async () => {
      const post = await Post.create({
        owner: user._id,
        title: 'Delete Me',
        date: '2026-03-01'
      })

      const res = await authHeader(
        request(app).delete(`/api/posts/${post._id}`)
      )

      expect(res.status).toBe(200)
      expect(res.body.ok).toBe(true)
    })
  })

  describe('Subtasks', () => {
    let post

    beforeEach(async () => {
      post = await Post.create({
        owner: user._id,
        title: 'Task',
        date: '2026-03-01'
      })
    })

    it('adds a subtask', async () => {
      const res = await authHeader(
        request(app).post(`/api/posts/${post._id}/subtasks`)
      ).send({ title: 'First subtask' })

      expect(res.status).toBe(200)
      expect(res.body.subtasks.length).toBe(1)
    })

    it('toggles subtask completion', async () => {
      const subtaskId = new mongoose.Types.ObjectId()

      post.subtasks.push({
        _id: subtaskId,
        title: 'Test subtask',
        completed: false
      })

      await post.save()

      const res = await authHeader(
        request(app).patch(`/api/posts/${post._id}/subtasks/${subtaskId}`)
      )

      expect(res.status).toBe(200)
      expect(res.body.subtasks[0].completed).toBe(true)
    })
  })
})


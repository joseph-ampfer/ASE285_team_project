import request from 'supertest'
import express from 'express'
import { describe, it, expect, beforeEach } from 'vitest'
import { createApiRouter } from '../routes/api.js'
import User from '../models/User.js'
import { hashPassword } from '../util/password.js'

describe('Auth API', () => {
  let app

  beforeEach(async () => {
    app = express()
    app.use(express.json())
    app.use('/api', createApiRouter())

    await User.deleteMany({})
  })

  describe('POST /api/auth/register', () => {
    it('registers a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        })

      expect(res.status).toBe(201)
      expect(res.body.token).toBeDefined()
      expect(res.body.user.email).toBe('test@example.com')
    })

    it('returns 400 if missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' })

      expect(res.status).toBe(400)
    })

    it('returns 400 if email already exists', async () => {
      await User.create({
        username: 'existing',
        email: 'test@example.com',
        passwordHash: 'hashed'
      })

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'test@example.com',
          password: 'password123'
        })

      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    it('logs in with valid credentials', async () => {
      const passwordHash = await hashPassword('password123')

      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash
      })

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })

      expect(res.status).toBe(200)
      expect(res.body.token).toBeDefined()
      expect(res.body.user.email).toBe('test@example.com')
    })

    it('returns 401 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'password123'
        })

      expect(res.status).toBe(401)
    })

    it('returns 401 for wrong password', async () => {
      const passwordHash = await hashPassword('password123')

      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash
      })

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })

      expect(res.status).toBe(401)
    })

    it('returns 400 if missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })

      expect(res.status).toBe(400)
    })
  })
})


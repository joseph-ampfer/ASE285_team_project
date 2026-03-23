// routes/api.js - REST API endpoints using Mongoose
import express from 'express';
import Post, { KanbanStatus } from '../models/Post.js';
import AppSettings from '../models/AppSettings.js';
import { getNextId } from '../util/util.js';
import { awardForTaskCompletion, getStats, getHistory } from '../services/gamification.js';
import { verifyToken, getCourses, getAssignments } from '../services/canvas.js';

const SETTINGS_ID = 'global';

export function createApiRouter() {
  const router = express.Router();

  // GET /api/posts - List all posts
  router.get('/posts', async (req, res) => {
    try {
      const posts = await Post.find({}).sort({ _id: 1 });
      res.json(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  });

  // GET /api/posts/:id - Get a single post
  router.get('/posts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Invalid id' });
      }

      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json(post);
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ error: 'Failed to fetch post' });
    }
  });

  // POST /api/posts - Create a new post
  router.post('/posts', async (req, res) => {
    try {
      const { title, date, description, status, subtasks } = req.body || {};
      
      if (!title) {
        return res.status(400).json({ error: 'title is required' });
      }
      if (!date) {
        return res.status(400).json({ error: 'date is required' });
      }

      const nextId = await getNextId();
      
      const newPost = new Post({
        _id: nextId,
        title,
        date,
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(subtasks !== undefined && { subtasks }),
      });

      await newPost.save();
      console.log('Post created:', newPost);
      res.status(201).json(newPost);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  });

  // PUT /api/posts/:id - Update a post
  router.put('/posts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Invalid id' });
      }

      const { title, date, description, status, subtasks } = req.body || {};
      const previous = await Post.findById(id);
      if (!previous) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const update = {};
      if (title !== undefined) update.title = title;
      if (date !== undefined) update.date = date;
      if (description !== undefined) update.description = description;
      if (status !== undefined) update.status = status;
      if (subtasks !== undefined) update.subtasks = subtasks;

      const updatedPost = await Post.findByIdAndUpdate(
        id,
        update,
        { new: true, runValidators: true } // Return the updated document
      );

      let gamification = null;
      const isNowDone = updatedPost.status === KanbanStatus.DONE;
      const wasDoneBefore = previous?.status === KanbanStatus.DONE;

      if (isNowDone && !wasDoneBefore) {
        updatedPost.completedAt = new Date();
        await updatedPost.save();
        gamification = await awardForTaskCompletion(updatedPost);
      }

      console.log('Post updated:', updatedPost);
      if (gamification) {
        return res.json({ post: updatedPost, gamification });
      }

      res.json(updatedPost);
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ error: 'Failed to update post' });
    }
  });

  // DELETE /api/posts/:id - Delete a post
  router.delete('/posts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Invalid id' });
      }

      const deletedPost = await Post.findByIdAndDelete(id);
      
      if (!deletedPost) {
        return res.status(404).json({ error: 'Post not found' });
      }

      console.log('Post deleted:', id);
      res.json({ ok: true, deletedId: id });
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ error: 'Failed to delete post' });
    }
  });

  // GET /api/gamification/stats - current points/level/streak
  router.get('/gamification/stats', async (_req, res) => {
    try {
      const stats = await getStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching gamification stats:', error);
      res.status(500).json({ error: 'Failed to fetch gamification stats' });
    }
  });

  // GET /api/gamification/history - recent completion history
  router.get('/gamification/history', async (_req, res) => {
    try {
      const events = await getHistory(100);
      res.json(events);
    } catch (error) {
      console.error('Error fetching gamification history:', error);
      res.status(500).json({ error: 'Failed to fetch gamification history' });
    }
  });

  // GET /api/settings - get app settings (e.g. theme)
  router.get('/settings', async (_req, res) => {
    try {
      let settings = await AppSettings.findById(SETTINGS_ID);
      if (!settings) {
        settings = await AppSettings.create({ _id: SETTINGS_ID });
      }
      res.json({
        theme: settings.theme,
        canvasApiToken: settings.canvasApiToken ?? '',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  // PUT /api/settings - update app settings
  router.put('/settings', async (req, res) => {
    try {
      const { theme, canvasApiToken } = req.body || {};
      if (theme !== undefined && theme !== 'dark' && theme !== 'light') {
        return res.status(400).json({ error: 'theme must be "dark" or "light"' });
      }
      const update = {};
      if (theme !== undefined) update.theme = theme;
      if (canvasApiToken !== undefined) update.canvasApiToken = String(canvasApiToken);
      const settings = await AppSettings.findByIdAndUpdate(
        SETTINGS_ID,
        update,
        { new: true, upsert: true }
      );
      res.json({
        theme: settings.theme,
        canvasApiToken: settings.canvasApiToken ?? '',
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  // GET /api/canvas/verify - verify saved Canvas token
  router.get('/canvas/verify', async (_req, res) => {
    try {
      const settings = await AppSettings.findById(SETTINGS_ID);
      const token = settings?.canvasApiToken?.trim();
      if (!token) {
        return res.status(400).json({ ok: false, error: 'Canvas API token not set' });
      }
      const result = await verifyToken(token);
      if (!result.ok) {
        return res.status(502).json({ ok: false, error: result.error });
      }
      return res.json({ ok: true, user: result.user });
    } catch (error) {
      console.error('Error verifying Canvas token:', error);
      return res.status(500).json({ ok: false, error: 'Failed to verify Canvas token' });
    }
  });

  // POST /api/canvas/sync - import Canvas assignments and prevent duplicates by assignment id
  router.post('/canvas/sync', async (_req, res) => {
    try {
      const settings = await AppSettings.findById(SETTINGS_ID);
      const token = settings?.canvasApiToken?.trim();
      if (!token) {
        return res.status(400).json({ error: 'Canvas API token not set' });
      }

      const { ok: coursesOk, courses, error: coursesError } = await getCourses(token);
      if (!coursesOk) {
        return res.status(502).json({ error: coursesError || 'Failed to fetch courses' });
      }
      if (!courses?.length) {
        return res.json({
          synced: true,
          created: 0,
          updated: 0,
          courseCount: 0,
          message: 'No active courses found for this account',
        });
      }

      let created = 0;
      let updated = 0;
      const errors = [];

      for (const course of courses) {
        const courseId = Number(course.id);
        if (Number.isNaN(courseId)) {
          errors.push({ course: course.name || String(course.id), error: 'Invalid course id' });
          continue;
        }

        const { ok: assignOk, assignments, error: assignError } = await getAssignments(token, courseId);
        if (!assignOk) {
          errors.push({ course: course.name || String(courseId), error: assignError });
          continue;
        }

        for (const assignment of assignments || []) {
          const assignmentId = Number(assignment.id);
          if (Number.isNaN(assignmentId)) continue;

          const title = assignment.name || assignment.title || 'Untitled assignment';
          const date = assignment.due_at
            ? String(assignment.due_at).split('T')[0]
            : new Date().toISOString().slice(0, 10);

          const existing = await Post.findOne({ canvasAssignmentId: assignmentId });
          if (existing) {
            existing.title = title;
            existing.date = date;
            existing.canvasCourseId = courseId;
            await existing.save();
            updated += 1;
            continue;
          }

          const nextId = await getNextId();
          const newPost = new Post({
            _id: nextId,
            title,
            date,
            description: '',
            status: KanbanStatus.TODO,
            subtasks: [],
            canvasAssignmentId: assignmentId,
            canvasCourseId: courseId,
          });
          await newPost.save();
          created += 1;
        }
      }

      return res.json({
        synced: true,
        created,
        updated,
        courseCount: courses.length,
        ...(errors.length ? { errors } : {}),
      });
    } catch (error) {
      console.error('Error syncing Canvas:', error);
      return res.status(500).json({ error: 'Failed to sync Canvas' });
    }
  });
  
  // POST /api/posts/:id/subtasks - Add a subtask
  router.post('/posts/:id/subtasks', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Invalid id' });
      }

      const { title } = req.body || {};

      if (!title) {
        return res.status(400).json({ error: 'title is required' });
      }

      const post = await Post.findById(id);

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const nextSubtaskId =
        post.subtasks?.length > 0
          ? Math.max(...post.subtasks.map(s => s.id)) + 1
          : 1;

      const newSubtask = {
        id: nextSubtaskId,
        title,
        completed: false
      };

      post.subtasks = [...(post.subtasks || []), newSubtask];

      await post.save();
      
      res.json(post);
    } catch (error) {
      console.error('Error adding subtask:', error);
      res.status(500).json({ error: 'Failed to add subtask' });
    }
  });

  // PATCH /api/posts/:postId/subtasks/:subtaskId
  router.patch('/posts/:postId/subtasks/:subtaskId', async (req, res) => {
    try {
      const postId = parseInt(req.params.postId, 10);
      const subtaskId = parseInt(req.params.subtaskId, 10);

      if (Number.isNaN(postId) || Number.isNaN(subtaskId)) {
        return res.status(400).json({ error: 'Invalid id' });
      }

      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const subtask = post.subtasks?.find(s => s.id === subtaskId);

      if (!subtask) {
        return res.status(404).json({ error: 'Subtask not found' });
      }

      subtask.completed = !subtask.completed;

      await post.save();

      res.json(post);
    } catch (error) {
      console.error('Error updating subtask:', error);
      res.status(500).json({ error: 'Failed to update subtask' });
    }
  });

  // DELETE /api/posts/:postId/subtasks/:subtaskId
  router.delete('/posts/:postId/subtasks/:subtaskId', async (req, res) => {
    try {
      const postId = parseInt(req.params.postId, 10);
      const subtaskId = parseInt(req.params.subtaskId, 10);

      if (Number.isNaN(postId) || Number.isNaN(subtaskId)) {
        return res.status(400).json({ error: 'Invalid id' });
      }

      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const subtaskIndex = post.subtasks?.findIndex(s => s.id === subtaskId);

      if (subtaskIndex === -1 || subtaskIndex === undefined) {
        return res.status(404).json({ error: 'Subtask not found' });
      }

      post.subtasks.splice(subtaskIndex, 1);

      await post.save();

      res.json({ ok: true, deletedSubtaskId: subtaskId });
    } catch (error) {
      console.error('Error deleting subtask:', error);
      res.status(500).json({ error: 'Failed to delete subtask' });
    }
  });

  return router;
}


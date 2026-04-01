import express from 'express';
import User from '../models/User.js'
import { hashPassword, comparePassword } from '../util/password.js'
import { generateToken } from '../util/token.js'
import { requireAuth } from '../util/auth.js';
import Post, { KanbanStatus } from '../models/Post.js';
import AppSettings from '../models/AppSettings.js';
import { awardForTaskCompletion, getStats, getHistory } from '../services/gamification.js';
import {
  verifyToken,
  getFutureIncompletePlannerAssignments,
} from '../services/canvas.js';

const SETTINGS_ID = 'global';

export function createApiRouter() {
  const router = express.Router();
  
  router.use(requireAuth);

  // POST /api/auth/register - Register account
  router.post('/auth/register', async (req, res) => {
    try {
      const { email, password, username } = req.body || {};

      if (!email || !password || !username) {
        return res.status(400).json({ error: 'missing fields' });
      }

      const existing = await User.findOne({ email })
      if (existing) {
        return res.status(400).json({ error: 'email already in use' })
      }

      const passwordHash = await hashPassword(password)

      const user = await User.create({
        email: email.toLowerCase(),
        passwordHash
      })

      const token = generateToken(user);

      res.status(201).json({
        token,
        user: { id: user._id, email: user.email }
      });
    } catch (err) {
      res.status(500).json({ error: 'failed to register' })
    }
  })

  // POST /api/auth/login - Login account
  router.post('/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body || {}

      if (!email || !password) {
        return res.status(400).json({ error: 'email and password required' })
      }

      const user = await User.findOne({ email })
      if (!user) {
        return res.status(401).json({ error: 'invalid credentials' })
      }

      const valid = await comparePassword(password, user.passwordHash)
      if (!valid) {
        return res.status(401).json({ error: 'invalid credentials' })
      }

      const token = generateToken(user);

      res.json({
        token,
        user: { id: user._id, email: user.email }
      });
    } catch (err) {
      res.status(500).json({ error: 'failed to login' })
    }
  })

  // GET /api/posts - List all posts
  router.get('/posts', requireAuth, async (req, res) => {
    try {
      const posts = await Post
        .find({ owner: req.user.id })
        .sort({ createdAt: 1 })

      res.json(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  });

  // GET /api/posts/:id - Get a single post
  router.get('/posts/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;

      const post = await Post.findOne({
        _id: id,
        owner: req.user.id
      });

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
  router.post('/posts', requireAuth, async (req, res) => {
    try {
      const { title, date, description, status, subtasks } = req.body || {};
      
      if (!title) {
        return res.status(400).json({ error: 'title is required' });
      }
      if (!date) {
        return res.status(400).json({ error: 'date is required' });
      }
      
      const newPost = new Post({
        owner: req.user.id,
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
  router.put('/posts/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { title, date, description, status, subtasks } = req.body || {};
      const update = {};
      if (title !== undefined) update.title = title;
      if (date !== undefined) update.date = date;
      if (description !== undefined) update.description = description;
      if (status !== undefined && previous.canvasAssignmentId == null) {
        update.status = status;
        update.completed = status === KanbanStatus.DONE;
      }
      if (subtasks !== undefined) update.subtasks = subtasks;

      const previous = await Post.findOne({
        _id: id,
        owner: req.user.id
      });

      if (!previous) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const updatedPost = await Post.findOneAndUpdate(
        { _id: id, owner: req.user.id },
        update,
        { new: true, runValidators: true }
      );

      let gamification = null;
      const isNowDone = updatedPost.status === KanbanStatus.DONE;
      const wasDoneBefore = previous?.status === KanbanStatus.DONE;

      if (isNowDone && !wasDoneBefore) {
        updatedPost.completedAt = new Date();
        await updatedPost.save();
        gamification = await awardForTaskCompletion(updatedPost, req.user.id);
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
  router.delete('/posts/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;

      const deletedPost = await Post.findOneAndDelete({
        _id: id,
        owner: req.user.id
      });

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
  router.get('/gamification/stats', requireAuth, async (_req, res) => {
    try {
      const stats = await getStats(_req.user.id);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching gamification stats:', error);
      res.status(500).json({ error: 'Failed to fetch gamification stats' });
    }
  });

  // GET /api/gamification/history - recent completion history
  router.get('/gamification/history', requireAuth, async (_req, res) => {
    try {
      const events = await getHistory(100);
      res.json(events);
    } catch (error) {
      console.error('Error fetching gamification history:', error);
      res.status(500).json({ error: 'Failed to fetch gamification history' });
    }
  });

  // GET /api/settings - get app settings (e.g. theme)
  router.get('/settings', requireAuth, async (_req, res) => {
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
  router.put('/settings', requireAuth, async (req, res) => {
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

  // POST /api/canvas/sync — planner: future due + incomplete; skip existing canvasAssignmentId
  router.post('/canvas/sync', async (_req, res) => {
    try {
      const settings = await AppSettings.findById(SETTINGS_ID);
      const token = settings?.canvasApiToken?.trim();
      if (!token) {
        return res.status(400).json({ error: 'Canvas API token not set' });
      }

      const plannerResult = await getFutureIncompletePlannerAssignments(token);
      if (!plannerResult.ok) {
        return res
          .status(502)
          .json({ error: plannerResult.error || 'Failed' });
      }

      const assignments = plannerResult.assignments || [];
      let created = 0;
      let skipped = 0;
      const courseIds = new Set();

      for (const assignment of assignments) {
        const assignmentId = Number(assignment.id);
        if (Number.isNaN(assignmentId)) continue;

        const cidRaw = assignment.course_id;
        const courseId =
          cidRaw != null && !Number.isNaN(Number(cidRaw)) ? Number(cidRaw) : null;
        if (courseId != null) courseIds.add(courseId);

        const title =
          assignment.name ||
          assignment.title ||
          `Canvas assignment ${assignmentId}`;
        const date = assignment.due_at
          ? String(assignment.due_at).split('T')[0]
          : new Date().toISOString().slice(0, 10);
        const description =
          typeof assignment.course_name === 'string' ? assignment.course_name.trim() : '';

        const existing = await Post.findOne({ canvasAssignmentId: assignmentId });
        if (existing) {
          skipped += 1;
          continue;
        }

        const nextId = await getNextId();
        const newPost = new Post({
          _id: nextId,
          title,
          date,
          description,
          status: KanbanStatus.TODO,
          subtasks: [],
          canvasAssignmentId: assignmentId,
          canvasCourseId: courseId,
        });
        await newPost.save();
        created += 1;
      }

      const payload = {
        synced: true,
        source: 'planner',
        created,
        skipped,
        assignmentCount: assignments.length,
        courseCount: courseIds.size,
      };
      if (assignments.length === 0) {
        payload.message =
          'No matching assignments in the planner window (future due, not completed).';
      } else if (created === 0 && skipped > 0) {
        payload.message = 'All matching Canvas assignments are already in your list.';
      }
      return res.json(payload);
    } catch (error) {
      console.error('Error syncing Canvas:', error);
      return res.status(500).json({ error: 'Failed to sync Canvas' });
    }
  });
  
  // POST /api/posts/:id/subtasks - Add a subtask
  router.post('/posts/:id/subtasks', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { title } = req.body || {};

      if (!title) {
        return res.status(400).json({ error: 'title is required' });
      }

      const post = await Post.findOne({
        _id: id,
        owner: req.user.id,
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      post.subtasks.push({ title, completed: false });

      await post.save();

      res.json(post);
    } catch (error) {
      console.error('Error adding subtask:', error);
      res.status(500).json({ error: 'Failed to add subtask' });
    }
  });

  // PATCH /api/posts/:postId/subtasks/:subtaskId - Toggle subtask completion 
  router.patch('/posts/:postId/subtasks/:subtaskId', requireAuth, async (req, res) => {
    try {
      const { postId, subtaskId } = req.params;

      const post = await Post.findOne({
        _id: postId,
        owner: req.user.id,
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const subtask = post.subtasks.id(subtaskId);

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

  // DELETE /api/posts/:postId/subtasks/:subtaskId - Delete a subtask
  router.delete('/posts/:postId/subtasks/:subtaskId', requireAuth, async (req, res) => {
    try {
      const { postId, subtaskId } = req.params;

      const post = await Post.findOne({
        _id: postId,
        owner: req.user.id,
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const subtask = post.subtasks.id(subtaskId);

      if (!subtask) {
        return res.status(404).json({ error: 'Subtask not found' });
      }

      subtask.remove();

      await post.save();

      res.json({ ok: true, deletedSubtaskId: subtaskId });
    } catch (error) {
      console.error('Error deleting subtask:', error);
      res.status(500).json({ error: 'Failed to delete subtask' });
    }
  });

  // GET /api/canvas/verify - verify stored Canvas token
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
      res.json({ ok: true, user: result.user });
    } catch (error) {
      console.error('Error verifying Canvas token:', error);
      res.status(500).json({ ok: false, error: 'Failed to verify' });
    }
  });

  // POST /api/canvas/sync
  router.post('/canvas/sync', async (req, res) => {
    try {
      const settings = await AppSettings.findById(SETTINGS_ID);
      const token = settings?.canvasApiToken?.trim();
      if (!token) {
        return res.status(400).json({ error: 'Canvas API token not set' });
      }

      const { ok: coursesOk, courses, error: coursesError } = await getCourses(token);
      if (!coursesOk) {
        return res.status(502).json({
          error: coursesError || 'Canvas API error',
          details: coursesError,
        });
      }
      if (!courses?.length) {
        return res.status(200).json({
          synced: true,
          created: 0,
          updated: 0,
          courseCount: 0,
          message: 'No courses found for this account',
        });
      }

      let created = 0;
      let updated = 0;
      const errors = [];
      const courseId = (c) => (c.id != null ? Number(c.id) : c.id);
      const courseName = (c) => c.name || c.course_code || `Course ${c.id}`;

      for (const course of courses) {
        const cid = courseId(course);
        if (cid == null || Number.isNaN(cid)) {
          errors.push({ course: courseName(course), error: 'Invalid course id' });
          continue;
        }
        const { ok: assignOk, assignments, error: assignError } = await getAssignments(
          token,
          cid
        );
        if (!assignOk) {
          console.warn('[Canvas sync] Assignments failed for course', courseName(course), assignError);
          errors.push({ course: courseName(course), error: assignError });
          continue;
        }
        if (!assignments?.length) continue;

        for (const a of assignments) {
          const aid = a.id != null ? Number(a.id) : a.id;
          const title = a.name || a.title || 'Assignment';
          const dateStr = a.due_at
            ? a.due_at.split('T')[0]
            : new Date().toISOString().slice(0, 10);

          const existing = await Post.findOne({ canvasAssignmentId: aid });
          if (existing) {
            existing.title = title;
            existing.date = dateStr;
            const subResult = await getSubmission(token, cid, aid);
            if (subResult.ok && subResult.submitted) {
              existing.status = KanbanStatus.DONE;
              existing.completed = true;
              if (!existing.completedAt) existing.completedAt = new Date();
            }
            await existing.save();
            updated += 1;
          } else {
            const nextId = await getNextId();
            const newPost = new Post({
              _id: nextId,
              title,
              date: dateStr,
              description: '',
              status: KanbanStatus.TODO,
              completed: false,
              completedAt: null,
              canvasAssignmentId: aid,
              canvasCourseId: cid,
            });
            await newPost.save();
            created += 1;
          }
        }
      }

      const payload = {
        synced: true,
        created,
        updated,
        courseCount: courses.length,
      };
      if (errors.length) payload.errors = errors;
      res.json(payload);
    } catch (error) {
      console.error('Error syncing Canvas:', error);
      res.status(500).json({ error: 'Failed to sync Canvas' });
    }
  });

  return router;
}


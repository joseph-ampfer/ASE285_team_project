import express from 'express';
import User from '../models/User.js'
import { hashPassword, comparePassword } from '../util/password.js'
import { generateToken } from '../util/token.js'
import { requireAuth } from '../util/auth.js';
import Post, { KanbanStatus } from '../models/Post.js';
import { awardForTaskCompletion, getStats, getHistory } from '../services/gamification.js';
import {
  verifyToken,
  getFutureIncompletePlannerAssignments,
} from '../services/canvas.js';

export function createApiRouter() {
  const router = express.Router();
  
  // POST /api/auth/register - Register account
  router.post('/auth/register', async (req, res) => {
    try {
      const { email, password, username } = req.body || {};

      if (!email || !password || !username) {
        return res.status(400).json({ error: 'Missing fields' });
      }

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      const passwordHash = await hashPassword(password);

      const user = await User.create({
        username,
        email: email.toLowerCase(),
        passwordHash
      });

      const token = generateToken(user);

      res.status(201).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username
        }
      });
    } catch (error) {
      console.error('Error registering:', error);
      res.status(500).json({ error: 'Failed to register' });
    }
  });

  // POST /api/auth/login - Login account
  router.post('/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const valid = await comparePassword(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(user);

      res.json({
        token,
        user: { id: user._id, email: user.email }
      });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  });

  router.use(requireAuth);

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
        return res.status(400).json({ error: 'Title is required' });
      }
      if (!date) {
        return res.status(400).json({ error: 'Date is required' });
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

      const previous = await Post.findOne({
        _id: id,
        owner: req.user.id
      });

      if (!previous) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Prepare updates
      const update = {};
      if (title !== undefined) update.title = title;
      if (date !== undefined) update.date = date;
      if (description !== undefined) update.description = description;
      if (status !== undefined) {
        update.status = status;
        update.completed = status === KanbanStatus.DONE;
      }
      if (subtasks !== undefined) update.subtasks = subtasks;

      const updatedPost = await Post.findOneAndUpdate(
        { _id: id, owner: req.user.id },
        update,
        { new: true, runValidators: true }
      );

      let gamification = null;
      const isNowDone = updatedPost.status === KanbanStatus.DONE;
      const wasDoneBefore = previous.status === KanbanStatus.DONE;

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

  // GET /api/settings - get the current user's settings (theme, token)
  router.get('/settings', requireAuth, async (req, res) => {
    try {
      const user = await User.findById(req.user.id, {
        theme: 1,
        canvasApiToken: 1,
      });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      res.json({
        theme: user.theme || 'dark',
        canvasApiToken: user.canvasApiToken ?? '',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  // PUT /api/settings - update the current user's settings
  router.put('/settings', requireAuth, async (req, res) => {
    try {
      const { theme, canvasApiToken } = req.body || {};
      if (theme !== undefined && theme !== 'dark' && theme !== 'light') {
        return res.status(400).json({ error: 'theme must be "dark" or "light"' });
      }
      const update = {};
      if (theme !== undefined) update.theme = theme;
      if (canvasApiToken !== undefined) update.canvasApiToken = String(canvasApiToken);

      const user = await User.findByIdAndUpdate(
        req.user.id,
        update,
        { new: true, projection: { theme: 1, canvasApiToken: 1 } }
      );
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      res.json({
        theme: user.theme || 'dark',
        canvasApiToken: user.canvasApiToken ?? '',
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  // GET /api/canvas/verify - verify the current user's saved Canvas token
  router.get('/canvas/verify', requireAuth, async (req, res) => {
    try {
      const user = await User.findById(req.user.id, { canvasApiToken: 1 });
      const token = user?.canvasApiToken?.trim();
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

  // POST /api/canvas/sync — planner: future due + incomplete; skip existing
  // Canvas assignments that the current user already has
  router.post('/canvas/sync', requireAuth, async (req, res) => {
    try {
      const user = await User.findById(req.user.id, { canvasApiToken: 1 });
      const token = user?.canvasApiToken?.trim();
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

        // Scope the duplicate-check (Canvas assignment id)
        const existing = await Post.findOne({
          owner: req.user.id,
          canvasAssignmentId: assignmentId,
        });
        if (existing) {
          skipped += 1;
          continue;
        }

        const newPost = new Post({
          owner: req.user.id,
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

  return router;
}

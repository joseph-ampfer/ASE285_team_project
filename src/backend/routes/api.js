// routes/api.js - REST API endpoints using Mongoose
import express from 'express';
import Post from '../models/Post.js';
import { getNextId } from '../util/util.js';

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

      if (!updatedPost) {
        return res.status(404).json({ error: 'Post not found' });
      }

      console.log('Post updated:', updatedPost);
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


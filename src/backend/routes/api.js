// routes/api.js - REST API endpoints using Mongoose
import express from 'express';
import Post, { KanbanStatus } from '../models/Post.js';
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
      const { title, date, description, status } = req.body || {};
      
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
        completed: status === KanbanStatus.DONE,
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

      const { title, date, description, status } = req.body || {};
      const update = {};
      if (title !== undefined) update.title = title;
      if (date !== undefined) update.date = date;
      if (description !== undefined) update.description = description;
      if (status !== undefined) {
        update.status = status;
        update.completed = status === KanbanStatus.DONE;
      }

      const updatedPost = await Post.findByIdAndUpdate(
        id,
        update,
        { new: true, runValidators: true } // Return the updated document      );
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

  return router;
}


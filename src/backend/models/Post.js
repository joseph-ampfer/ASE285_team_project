import mongoose from 'mongoose';

const KanbanStatus = Object.freeze({
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
});

const postSchema = new mongoose.Schema({  
  _id: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: Object.values(KanbanStatus),
    default: KanbanStatus.TODO,
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null,
  },
  subtasks: {
    type: [
      {
        id: {
          type: Number,
          required: true
        },
        title: {
          type: String,
          required: true
        },
        completed: {
          type: Boolean,
          default: false
        }
      }
    ],
    default: []
  }
});

const Post = mongoose.model('Post', postSchema, 'posts');

export { KanbanStatus };
export default Post;

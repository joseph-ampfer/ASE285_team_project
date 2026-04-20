import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true,
  },
  
  // Per-user settings
  // user can has own Canvas token
  canvasApiToken: {
    type: String,
    default: '',
  },
  theme: {
    type: String,
    enum: ['dark', 'light'],
    default: 'dark',
  },
})

const User = mongoose.model('User', userSchema)

export default User

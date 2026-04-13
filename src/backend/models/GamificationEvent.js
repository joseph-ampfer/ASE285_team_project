import mongoose from 'mongoose';

const gamificationEventSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    postId: {
      type: String,
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
    gained: {
      type: Number,
      required: true,
    },
    breakdown: {
      base: Number,
      earlyBonus: Number,
      comboBonus: Number,
      daysEarly: Number,
    },
    completionDay: {
      type: String, // YYYY-MM-DD
      required: true,
    },
  },
  { timestamps: true }
);

const GamificationEvent = mongoose.model(
  'GamificationEvent',
  gamificationEventSchema,
  'gamification_events'
);

export default GamificationEvent;


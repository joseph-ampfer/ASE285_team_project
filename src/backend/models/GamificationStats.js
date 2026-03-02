import mongoose from 'mongoose';

const gamificationStatsSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    streakCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastCompletionDay: {
      type: String, // YYYY-MM-DD
      default: null,
    },
  },
  { timestamps: true }
);

const GamificationStats = mongoose.model(
  'GamificationStats',
  gamificationStatsSchema,
  'gamification_stats'
);

export default GamificationStats;


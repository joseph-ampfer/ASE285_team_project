import mongoose from 'mongoose';

const appSettingsSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark',
    },
    canvasApiToken: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const AppSettings = mongoose.model('AppSettings', appSettingsSchema, 'app_settings');

export default AppSettings;

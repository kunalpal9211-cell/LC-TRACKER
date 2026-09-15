import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  email: { type: String, index: true, default: '' },
  solved: { type: Map, of: Object, default: {} },
  revision: { type: Map, of: Object, default: {} },
  notes: { type: Map, of: String, default: {} },
  streak: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  totalSolved: { type: Number, default: 0 },
  avatar: { type: String, default: '/avatars/spiderman.svg' },
  lastActive: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Progress = mongoose.models.Progress || mongoose.model('Progress', progressSchema);


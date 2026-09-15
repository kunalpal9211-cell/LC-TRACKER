import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, index: true },
  name: { type: String, required: true },
  avatar: { type: String, default: '/avatars/spiderman.svg' },
  streak: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  totalSolved: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);


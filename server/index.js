import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { User } from './models/User.js';
import { Progress } from './models/Progress.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = (process.env.MONGODB_URI || '').trim();

app.use(cors());
app.use(express.json());

let isMongoConnected = false;
let mongoError = null;

if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4
    })
    .then(() => {
      isMongoConnected = true;
      mongoError = null;
      console.log('✅ Connected to MongoDB Atlas successfully.');
    })
    .catch(err => {
      isMongoConnected = false;
      mongoError = err.message;
      console.warn('⚠️  Could not connect to MongoDB Atlas:', err.message);
      console.warn('⚡ Running in local fallback mode.');
    });

  mongoose.connection.on('connected', () => {
    isMongoConnected = true;
    mongoError = null;
    console.log('🟢 MongoDB Atlas connection active.');
  });
  mongoose.connection.on('error', (err) => {
    isMongoConnected = false;
    mongoError = err.message;
    console.warn('🔴 MongoDB connection error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    isMongoConnected = false;
    console.warn('🟡 MongoDB Atlas disconnected.');
  });
} else {
  mongoError = 'No MONGODB_URI supplied in environment variables';
  console.log('ℹ️  No MONGODB_URI supplied in environment.');
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongoConnected: isMongoConnected,
    mode: isMongoConnected ? 'atlas' : 'local',
    db: isMongoConnected && mongoose.connection.name ? mongoose.connection.name : 'none',
    hasMongoUri: Boolean(MONGODB_URI),
    mongoError: isMongoConnected ? null : mongoError
  });
});

// Ratings endpoint (serves ZeroTrac cached ratings)
app.get('/api/ratings', (req, res) => {
  try {
    const ratingsPath = path.join(__dirname, '../src/data/ratings.json');
    if (fs.existsSync(ratingsPath)) {
      const data = JSON.parse(fs.readFileSync(ratingsPath, 'utf8'));
      return res.json(data);
    }
    res.json({});
  } catch (err) {
    res.status(500).json({ error: 'Failed loading ratings' });
  }
});

// Popular Companies list
const POPULAR_COMPANIES = [
  { id: 'google', name: 'Google', tier: 'FAANG' },
  { id: 'meta', name: 'Meta', tier: 'FAANG' },
  { id: 'amazon', name: 'Amazon', tier: 'FAANG' },
  { id: 'microsoft', name: 'Microsoft', tier: 'Big Tech' },
  { id: 'apple', name: 'Apple', tier: 'FAANG' },
  { id: 'uber', name: 'Uber', tier: 'Top Tech' },
  { id: 'netflix', name: 'Netflix', tier: 'FAANG' },
  { id: 'bloomberg', name: 'Bloomberg', tier: 'Fintech' },
  { id: 'adobe', name: 'Adobe', tier: 'Big Tech' },
  { id: 'bytedance', name: 'ByteDance', tier: 'Top Tech' },
  { id: 'salesforce', name: 'Salesforce', tier: 'Big Tech' },
  { id: 'linkedin', name: 'LinkedIn', tier: 'Big Tech' },
  { id: 'goldman-sachs', name: 'Goldman Sachs', tier: 'Fintech' },
  { id: 'oracle', name: 'Oracle', tier: 'Big Tech' },
  { id: 'stripe', name: 'Stripe', tier: 'Fintech' },
  { id: 'snowflake', name: 'Snowflake', tier: 'Top Tech' },
  { id: 'databricks', name: 'Databricks', tier: 'Top Tech' },
  { id: 'airbnb', name: 'Airbnb', tier: 'Top Tech' },
  { id: 'doordash', name: 'DoorDash', tier: 'Top Tech' },
  { id: 'atlassian', name: 'Atlassian', tier: 'Top Tech' },
  { id: 'cisco', name: 'Cisco', tier: 'Enterprise' },
  { id: 'walmart-labs', name: 'Walmart', tier: 'Enterprise' },
  { id: 'paypal', name: 'PayPal', tier: 'Fintech' },
  { id: 'morgan-stanley', name: 'Morgan Stanley', tier: 'Fintech' },
  { id: 'flipkart', name: 'Flipkart', tier: 'Indian Tech' },
  { id: 'swiggy', name: 'Swiggy', tier: 'Indian Tech' },
  { id: 'zomato', name: 'Zomato', tier: 'Indian Tech' },
  { id: 'cred', name: 'CRED', tier: 'Indian Tech' },
  { id: 'jpmorgan', name: 'JPMorgan Chase', tier: 'Fintech' }
];

app.get('/api/companies-list', (req, res) => {
  res.json(POPULAR_COMPANIES);
});

// In-memory cache for company questions
const companyQuestionsCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Realtime Company-wise questions fetcher from snehasishroy/leetcode-companywise-interview-questions
app.get('/api/company-questions', async (req, res) => {
  try {
    const company = (req.query.company || 'google').toLowerCase().trim();
    const timeframe = (req.query.timeframe || 'thirty-days').toLowerCase().trim(); // thirty-days, three-months, six-months, more-than-six-months, all

    const cacheKey = `${company}_${timeframe}`;
    const cached = companyQuestionsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return res.json(cached.data);
    }

    const url = `https://raw.githubusercontent.com/snehasishroy/leetcode-companywise-interview-questions/master/${company}/${timeframe}.csv`;
    const response = await fetch(url);
    if (!response.ok) {
      // If timeframe not found, fallback to thirty-days or all
      const fallbackUrl = `https://raw.githubusercontent.com/snehasishroy/leetcode-companywise-interview-questions/master/${company}/all.csv`;
      const fallbackRes = await fetch(fallbackUrl);
      if (!fallbackRes.ok) {
        return res.status(404).json({ error: `Questions not found for company ${company}` });
      }
      const csvText = await fallbackRes.text();
      const questions = parseCompanyCsv(csvText, company);
      companyQuestionsCache.set(cacheKey, { data: questions, timestamp: Date.now() });
      return res.json(questions);
    }

    const csvText = await response.text();
    const questions = parseCompanyCsv(csvText, company);

    companyQuestionsCache.set(cacheKey, { data: questions, timestamp: Date.now() });
    res.json(questions);
  } catch (err) {
    console.error('Company questions fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch company questions' });
  }
});

function parseCompanyCsv(csvText, company) {
  const lines = csvText.split('\n').filter(l => l.trim());
  if (lines.length <= 1) return [];

  const questions = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(',');
    if (parts.length >= 6) {
      const id = parseInt(parts[0], 10);
      const url = parts[1];
      const title = parts.slice(2, parts.length - 3).join(',').replace(/"/g, '') || parts[2];
      const difficulty = parts[parts.length - 3].trim();
      const acceptance = parts[parts.length - 2].trim();
      const frequencyStr = parts[parts.length - 1].trim();
      const frequency = parseFloat(frequencyStr.replace('%', '')) || 50;
      const slug = url.replace(/\/$/, '').split('/').pop();

      questions.push({
        id,
        num: id,
        url,
        title,
        name: title,
        slug,
        difficulty,
        acceptance,
        frequency,
        company: company.charAt(0).toUpperCase() + company.slice(1)
      });
    }
  }
  return questions;
}

// Helper to safely serialize Mongoose Maps or plain Objects to JSON
function mapToObject(val) {
  if (!val) return {};
  if (val instanceof Map) return Object.fromEntries(val);
  if (typeof val.toJSON === 'function') {
    const json = val.toJSON();
    if (json instanceof Map) return Object.fromEntries(json);
    return json && typeof json === 'object' ? json : {};
  }
  if (typeof val === 'object') return val;
  return {};
}

// Get User Profile from MongoDB Atlas
app.get('/api/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const email = (req.query.email || '').trim().toLowerCase();

    if (!isMongoConnected) {
      return res.json({ exists: false, mode: 'local' });
    }

    const query = email 
      ? { $or: [{ userId }, { email: email.toLowerCase() }] } 
      : { userId };
    const userDoc = await User.findOne(query);

    if (!userDoc) {
      return res.json({ exists: false, mode: 'atlas' });
    }

    res.json({
      exists: true,
      user: {
        id: userDoc.userId,
        userId: userDoc.userId,
        email: userDoc.email,
        name: userDoc.name,
        avatar: userDoc.avatar || '/avatars/spiderman.svg',
        streak: userDoc.streak || 0,
        bestStreak: userDoc.bestStreak || 0,
        totalSolved: userDoc.totalSolved || 0
      },
      mode: 'atlas'
    });
  } catch (err) {
    console.error('Get user profile error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Realtime active users count (strictly aggregated count, zero PII / user data exposed)
app.get('/api/realtime-users', async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    if (!isMongoConnected) {
      return res.json({ activeCount: 1 });
    }

    // Realtime activity window (last 30 minutes)
    const activeWindow = new Date(Date.now() - 30 * 60 * 1000);
    const count = await User.countDocuments({
      lastActive: { $gte: activeWindow }
    });

    res.json({
      activeCount: Math.max(count, 1)
    });
  } catch (err) {
    res.json({ activeCount: 1 });
  }
});

// Dedicated Avatar Update Endpoint
app.post('/api/user/avatar', async (req, res) => {
  try {
    const { userId, email, avatar } = req.body;
    if (!userId || !avatar) {
      return res.status(400).json({ error: 'userId and avatar are required' });
    }

    if (isMongoConnected) {
      const query = email 
        ? { $or: [{ userId }, { email: email.toLowerCase() }] }
        : { userId };

      const updatedUser = await User.findOneAndUpdate(
        query,
        {
          $set: {
            userId,
            ...(email ? { email: email.toLowerCase() } : {}),
            avatar,
            lastActive: new Date()
          }
        },
        { upsert: true, returnDocument: 'after' }
      );

      await Progress.findOneAndUpdate(
        query,
        {
          $set: {
            userId,
            ...(email ? { email: email.toLowerCase() } : {}),
            avatar,
            lastActive: new Date()
          }
        }
      ).catch(() => {});

      console.log(`✅ Avatar updated in Atlas for ${userId}: ${avatar}`);
      return res.json({ success: true, avatar: updatedUser.avatar, user: updatedUser, mode: 'atlas' });
    }

    res.json({ success: true, avatar, mode: 'local' });
  } catch (err) {
    console.error('Update avatar error:', err);
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

// User Sync endpoint (Firebase & local verified sessions)
app.post('/api/user/sync', async (req, res) => {
  try {
    const { userId, email, name, avatar, explicitAvatar } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    if (isMongoConnected) {
      const query = email 
        ? { $or: [{ userId }, { email: email.toLowerCase() }] }
        : { userId };

      const existing = await User.findOne(query);

      // Determine avatar to save:
      let resolvedAvatar = avatar || existing?.avatar || '/avatars/spiderman.svg';

      const updatedUser = await User.findOneAndUpdate(
        query,
        {
          $set: {
            userId,
            email: email || existing?.email || '',
            name: name || existing?.name || 'Engineer',
            avatar: resolvedAvatar,
            lastActive: new Date()
          }
        },
        { upsert: true, returnDocument: 'after' }
      );

      // Sync avatar to Progress document too
      await Progress.findOneAndUpdate(
        query,
        {
          $set: {
            userId,
            ...(email ? { email: email.toLowerCase() } : {}),
            avatar: resolvedAvatar
          }
        }
      ).catch(() => {});

      return res.json({ success: true, user: updatedUser, mode: 'atlas' });
    }
    res.json({ success: true, mode: 'local' });
  } catch (err) {
    console.error('User sync error:', err);
    res.status(500).json({ error: 'Failed to sync user profile' });
  }
});

// Legacy Google OAuth endpoint (kept for backward compatibility)
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);

    const userData = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      avatar: payload.picture,
      isGuest: false
    };

    if (isMongoConnected) {
      await User.findOneAndUpdate(
        { userId: payload.sub },
        { 
          $set: {
            email: payload.email,
            name: payload.name,
            avatar: payload.picture,
            lastActive: new Date()
          }
        },
        { upsert: true, returnDocument: 'after' }
      );
    }

    res.json({ success: true, user: userData });
  } catch (err) {
    console.error('Auth verification error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get User Progress from MongoDB Atlas
app.get('/api/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const email = (req.query.email || '').trim().toLowerCase();

    if (!isMongoConnected) {
      return res.json({
        exists: false,
        solved: {},
        revision: {},
        notes: {},
        streak: 0,
        bestStreak: 0,
        totalSolved: 0,
        mode: 'local'
      });
    }

    // Try finding by userId or matching email (for cross-login continuity)
    const query = email ? { $or: [{ userId }, { email }] } : { userId };
    const doc = await Progress.findOne(query);

    if (!doc) {
      return res.json({
        exists: false,
        solved: {},
        revision: {},
        notes: {},
        streak: 0,
        bestStreak: 0,
        totalSolved: 0,
        mode: 'atlas'
      });
    }

    const solvedObj = mapToObject(doc.solved);
    const revisionObj = mapToObject(doc.revision);
    const notesObj = mapToObject(doc.notes);
    const totalSolved = doc.totalSolved !== undefined && doc.totalSolved > 0 
      ? doc.totalSolved 
      : Object.keys(solvedObj).length;

    // Also fetch User record if exists to resolve authoritative avatar and name
    const userDoc = await User.findOne(query);
    const resolvedAvatar = userDoc?.avatar || doc.avatar || '/avatars/spiderman.svg';
    const resolvedName = userDoc?.name || '';

    res.json({
      exists: true,
      solved: solvedObj,
      revision: revisionObj,
      notes: notesObj,
      streak: doc.streak || 0,
      bestStreak: doc.bestStreak || 0,
      totalSolved,
      avatar: resolvedAvatar,
      name: resolvedName,
      updatedAt: doc.updatedAt,
      mode: 'atlas'
    });
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ error: 'Failed to fetch progress from Atlas' });
  }
});

// Upsert User Progress into MongoDB Atlas
app.post('/api/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { solved, revision, notes, streak, bestStreak, totalSolved, email, avatar, name } = req.body;

    if (!isMongoConnected) {
      return res.json({ success: true, mode: 'local' });
    }

    const cleanSolved = solved && typeof solved === 'object' ? solved : {};
    const calculatedTotal = totalSolved !== undefined ? totalSolved : Object.keys(cleanSolved).length;

    const doc = await Progress.findOneAndUpdate(
      { userId },
      {
        $set: {
          solved: cleanSolved,
          revision: revision || {},
          notes: notes || {},
          streak: streak || 0,
          bestStreak: bestStreak || 0,
          totalSolved: calculatedTotal,
          ...(avatar ? { avatar } : {}),
          ...(email ? { email: email.toLowerCase() } : {}),
          lastActive: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Sync streak / totalSolved / avatar into User record as well
    const userQuery = email 
      ? { $or: [{ userId }, { email: email.toLowerCase() }] } 
      : { userId };

    await User.findOneAndUpdate(
      userQuery,
      {
        $set: {
          streak: streak || 0,
          bestStreak: bestStreak || 0,
          totalSolved: calculatedTotal,
          ...(avatar ? { avatar } : {}),
          ...(name ? { name } : {}),
          lastActive: new Date()
        }
      },
      { returnDocument: 'after' }
    ).catch(() => {});

    res.json({
      success: true,
      mode: 'atlas',
      totalSolved: calculatedTotal,
      streak: doc.streak,
      bestStreak: doc.bestStreak,
      avatar: doc.avatar,
      updatedAt: doc.updatedAt
    });
  } catch (err) {
    console.error('Save progress error:', err);
    res.status(500).json({ error: 'Failed to save progress to Atlas' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SPYDEX API server running on http://localhost:${PORT}`);
});

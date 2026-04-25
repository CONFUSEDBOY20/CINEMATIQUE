import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Movie } from './models/Movie.js';
import { User } from './models/User.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'cinematique_dev_secret_change_in_production';
const JWT_EXPIRES = '7d';

app.use(cors());
app.use(express.json());

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── DB Connection ────────────────────────────────────────────────────────────
const connectDB = async () => {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB Atlas');
    } catch (err) {
      console.error('❌ MongoDB connection error:', err);
    }
  } else {
    console.warn('⚠️ MONGODB_URI not found. Starting In-Memory MongoDB for testing...');
    try {
      const mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log('✅ In-Memory MongoDB started at:', uri);
      console.log('🌱 Auto-seeding test data...');
      await seedData();
    } catch (err) {
      console.error('❌ In-Memory MongoDB failed:', err);
    }
  }
};

async function seedData() {
  try {
    const moviesPath = './public/movies.json';
    if (fs.existsSync(moviesPath)) {
      const moviesData = JSON.parse(fs.readFileSync(moviesPath, 'utf8'));
      const sanitized = moviesData.map(({ id, ...rest }) => rest);
      await Movie.insertMany(sanitized.slice(0, 50));
      console.log('✅ Seeded 50 movies to in-memory DB');
    }

    // Create a test user with hashed password
    const existing = await User.findOne({ email: 'test@test.com' });
    if (!existing) {
      await User.create({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        role: 'user',
        status: 'active'
      });
      console.log('✅ Created test user: test@test.com / password123');
    }

    // Create a real admin user
    const existingAdmin = await User.findOne({ email: 'admin@cinematique.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'Cinematique Admin',
        email: 'admin@cinematique.com',
        password: 'Admin@123',
        role: 'admin',
        status: 'active'
      });
      console.log('✅ Created admin user: admin@cinematique.com / Admin@123');
    }
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  }
}

connectDB();

// ─── Movies ───────────────────────────────────────────────────────────────────
app.get('/api/movies', async (req, res) => {
  try {
    const movies = await Movie.find({});
    const formattedMovies = movies.map(m => {
      const obj = m.toObject();
      obj.id = obj._id.toString();
      return obj;
    });
    res.json(formattedMovies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// ─── Register ─────────────────────────────────────────────────────────────────
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const user = await User.create({ name: name.trim(), email, password });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.status(201).json({
      token,
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ─── Login ────────────────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.json({
      token,
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ─── Get current user (protected) ────────────────────────────────────────────
app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: user.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ─── Update Profile (protected) ───────────────────────────────────────────────
app.patch('/api/user/update', authMiddleware, async (req, res) => {
  try {
    const { name, bio, avatar, coverPhoto, genres } = req.body;
    const updates = {};
    if (name !== undefined)       updates.name       = name.trim();
    if (bio !== undefined)        updates.bio        = bio;
    if (avatar !== undefined)     updates.avatar     = avatar;
    if (coverPhoto !== undefined) updates.coverPhoto = coverPhoto;
    if (genres !== undefined)     updates.genres     = genres;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: user.toPublicJSON() });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ─── Change Password (protected) ──────────────────────────────────────────────
app.patch('/api/user/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save(); // triggers bcrypt pre-save hook
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

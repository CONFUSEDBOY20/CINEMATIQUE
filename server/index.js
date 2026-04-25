import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';
import { Movie } from './models/Movie.js';
import { User } from './models/User.js';

import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
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
      
      // Auto-seed for testing if in-memory
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
      await Movie.insertMany(sanitized.slice(0, 50)); // Seed 50 for fast testing
      console.log('✅ Seeded 50 movies to in-memory DB');
    }
    
    await User.create({
      name: "Test User",
      email: "test@test.com",
      password: "password",
      role: "user",
      status: "active"
    });
    console.log('✅ Created test user: test@test.com / password');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  }
}

connectDB();

// API Routes

// Get all movies
app.get('/api/movies', async (req, res) => {
  try {
    const movies = await Movie.find({});
    // Map _id to id for the frontend
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

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // In a real app, use bcrypt to compare hashed passwords
    const user = await User.findOne({ email, password });
    if (user) {
      const userObj = user.toObject();
      userObj.id = userObj._id.toString();
      res.json(userObj);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

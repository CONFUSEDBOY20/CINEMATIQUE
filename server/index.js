import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Movie } from './models/Movie.js';
import { User } from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.warn('WARNING: MONGODB_URI is not set. Database operations will fail.');
}

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

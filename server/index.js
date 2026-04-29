import express from 'express';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'cinematique_dev_secret_change_in_production';
const JWT_EXPIRES = '7d';

// ─── Supabase Client ──────────────────────────────────────────────────────────
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
console.log('✅ Supabase client initialised');

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

function adminMiddleware(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied: Admin only' });
  }
}

// ─── Movies ───────────────────────────────────────────────────────────────────
app.get('/api/movies', async (req, res) => {
  try {
    const { data: movies, error } = await supabase
      .from('movies')
      .select('*');

    if (error) throw error;

    // Remap snake_case DB columns → camelCase for frontend compatibility
    const formatted = (movies || []).map(({ cast_members, mood_tags, poster_url, backdrop_url, ...m }) => ({
      ...m,
      cast:        cast_members ?? [],
      moodTags:    mood_tags    ?? [],
      posterUrl:   poster_url   ?? '',
      backdropUrl: backdrop_url ?? ''
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Movies fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// ─── Register ─────────────────────────────────────────────────────────────────
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

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

    // Check for duplicate email
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data: newUsers, error } = await supabase
      .from('users')
      .insert([{
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'user',
        avatar: '',
        cover_photo: '',
        bio: '',
        status: 'active',
        watchlist: [],
        genres: []
      }])
      .select('*');

    if (error) throw error;

    const user = newUsers[0];
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    const { password: _pw, ...publicUser } = user;
    res.status(201).json({ token, user: publicUser });
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

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .limit(1);

    if (error) throw error;

    const user = users?.[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    const { password: _pw, ...publicUser } = user;
    res.json({ token, user: publicUser });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ─── Get current user (protected) ────────────────────────────────────────────
app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .limit(1);

    if (error) throw error;

    const user = users?.[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { password: _pw, ...publicUser } = user;
    res.json({ user: publicUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ─── Update Profile (protected) ───────────────────────────────────────────────
app.patch('/api/user/update', authMiddleware, async (req, res) => {
  try {
    const { name, bio, avatar, coverPhoto, genres } = req.body;
    const updates = {};
    if (name       !== undefined) updates.name        = name.trim();
    if (bio        !== undefined) updates.bio         = bio;
    if (avatar     !== undefined) updates.avatar      = avatar;
    if (coverPhoto !== undefined) updates.cover_photo = coverPhoto;
    if (genres     !== undefined) updates.genres      = genres;

    const { data: updated, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('*');

    if (error) throw error;

    const user = updated?.[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { password: _pw, ...publicUser } = user;
    res.json({ user: publicUser });
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

    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('password')
      .eq('id', req.user.id)
      .limit(1);

    if (fetchError) throw fetchError;

    const user = users?.[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', req.user.id);

    if (updateError) throw updateError;

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// ─── Admin Endpoints ──────────────────────────────────────────────────────────

app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, status, created_at, avatar')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(users);
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.patch('/api/admin/users/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'banned'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data: updated, error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', id)
      .select('*');

    if (error) throw error;
    res.json(updated[0]);
  } catch (error) {
    console.error('Admin status update error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

app.get('/api/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: moviesCount } = await supabase.from('movies').select('*', { count: 'exact', head: true });
    
    // Get new users in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: newUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gt('created_at', sevenDaysAgo);

    res.json({
      totalUsers: usersCount || 0,
      totalMovies: moviesCount || 0,
      newUsersLastWeek: newUsers || 0,
      activeUsers: usersCount || 0 // Mock for now if sessions aren't tracked
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`✅ Backend server running on http://localhost:${port}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      throw err;
    }
  });
};

startServer(Number(PORT));

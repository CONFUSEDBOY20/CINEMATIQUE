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
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const token = authHeader.split(' ')[1];
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch full profile from our public.users table
    const { data: profile } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', user.id)
      .single();

    req.user = { ...user, role: profile?.role || 'user' };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Authentication failed' });
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

// Auth endpoints (Registration/Login/Forgot) are now handled by Supabase SDK in the frontend.
// The backend only provides protected profile and data endpoints.

// ─── Get current user (protected) ────────────────────────────────────────────
app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) return res.status(404).json({ error: 'User profile not found' });
    res.json({ user: profile });
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
      .select('*')
      .single();

    if (error) throw error;
    res.json({ user: updated });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Forgot and Reset Password endpoints removed. Handled by Supabase SDK.

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

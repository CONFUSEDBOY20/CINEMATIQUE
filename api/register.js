import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from './_supabase.js';

const JWT_SECRET  = process.env.JWT_SECRET || 'cinematique_dev_secret_change_in_production';
const JWT_EXPIRES = '7d';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    // Check if email already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
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
    return res.status(201).json({ token, user: publicUser });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}

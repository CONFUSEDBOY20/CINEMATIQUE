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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Fetch user by email
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

    // Strip password before returning
    const { password: _pw, ...publicUser } = user;
    return res.status(200).json({ token, user: publicUser });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}

import jwt from 'jsonwebtoken';
import { supabase } from './_supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'cinematique_dev_secret_change_in_production';

function getToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.split(' ')[1];
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.id)
      .limit(1);

    if (error) throw error;

    const user = users?.[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { password: _pw, ...publicUser } = user;
    return res.status(200).json({ user: publicUser });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

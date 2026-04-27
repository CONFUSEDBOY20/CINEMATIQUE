import jwt from 'jsonwebtoken';
import { connectDB } from './_db.js';
import { User } from './_models/User.js';

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
    await connectDB();
    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json({ user: user.toPublicJSON() });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

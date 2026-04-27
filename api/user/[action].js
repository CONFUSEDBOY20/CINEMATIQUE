import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../_supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'cinematique_dev_secret_change_in_production';

function getToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.split(' ')[1];
}

export default async function handler(req, res) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'No token provided' });

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // PATCH /api/user/update
  if (req.method === 'PATCH' && req.url.endsWith('/update')) {
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
        .eq('id', payload.id)
        .select('*');

      if (error) throw error;

      const user = updated?.[0];
      if (!user) return res.status(404).json({ error: 'User not found' });

      const { password: _pw, ...publicUser } = user;
      return res.status(200).json({ user: publicUser });
    } catch (err) {
      console.error('Profile update error:', err);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  // PATCH /api/user/change-password
  if (req.method === 'PATCH' && req.url.endsWith('/change-password')) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Both current and new password are required' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }

      // Fetch current hashed password
      const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('password')
        .eq('id', payload.id)
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
        .eq('id', payload.id);

      if (updateError) throw updateError;

      return res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
      console.error('Password change error:', err);
      return res.status(500).json({ error: 'Failed to change password' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

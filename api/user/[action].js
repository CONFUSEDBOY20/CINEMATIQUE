import jwt from 'jsonwebtoken';
import { connectDB } from '../_db.js';
import { User } from '../_models/User.js';

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

  await connectDB();

  // PATCH /api/user/update
  if (req.method === 'PATCH' && req.url.endsWith('/update')) {
    try {
      const { name, bio, avatar, coverPhoto, genres } = req.body;
      const updates = {};
      if (name       !== undefined) updates.name       = name.trim();
      if (bio        !== undefined) updates.bio        = bio;
      if (avatar     !== undefined) updates.avatar     = avatar;
      if (coverPhoto !== undefined) updates.coverPhoto = coverPhoto;
      if (genres     !== undefined) updates.genres     = genres;

      const user = await User.findByIdAndUpdate(
        payload.id,
        { $set: updates },
        { new: true, runValidators: true }
      );
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json({ user: user.toPublicJSON() });
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
      const user = await User.findById(payload.id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });

      user.password = newPassword;
      await user.save();
      return res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
      console.error('Password change error:', err);
      return res.status(500).json({ error: 'Failed to change password' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

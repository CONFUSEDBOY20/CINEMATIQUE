import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Simplified for demo. Use bcrypt in production!
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String },
  status: { type: String, default: 'active' },
  watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  genres: [{ type: String }]
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);

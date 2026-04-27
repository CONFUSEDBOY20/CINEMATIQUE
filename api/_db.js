import mongoose from 'mongoose';

let cached = global._mongooseConn;

export async function connectDB() {
  if (cached && mongoose.connection.readyState === 1) return cached;

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set.');
  }

  cached = await mongoose.connect(process.env.MONGODB_URI);
  global._mongooseConn = cached;
  return cached;
}

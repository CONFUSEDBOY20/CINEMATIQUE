import { connectDB } from '../_db.js';
import { Movie } from '../_models/Movie.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    const movies = await Movie.find({});
    const formatted = movies.map(m => {
      const obj = m.toObject();
      obj.id = obj._id.toString();
      return obj;
    });
    return res.status(200).json(formatted);
  } catch (err) {
    console.error('Movies fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch movies' });
  }
}

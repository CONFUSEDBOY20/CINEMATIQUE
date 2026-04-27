import { supabase } from '../_supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data: movies, error } = await supabase
      .from('movies')
      .select('*');

    if (error) throw error;

    // Normalise id field for frontend compatibility
    const formatted = (movies || []).map(m => ({ ...m, id: m.id ?? m.id }));
    return res.status(200).json(formatted);
  } catch (err) {
    console.error('Movies fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch movies' });
  }
}

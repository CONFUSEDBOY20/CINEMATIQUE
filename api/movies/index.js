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

    // Remap snake_case DB columns → camelCase for frontend compatibility
    const formatted = (movies || []).map(({ cast_members, mood_tags, poster_url, backdrop_url, ...m }) => ({
      ...m,
      cast:        cast_members ?? [],
      moodTags:    mood_tags    ?? [],
      posterUrl:   poster_url   ?? '',
      backdropUrl: backdrop_url ?? ''
    }));

    return res.status(200).json(formatted);
  } catch (err) {
    console.error('Movies fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch movies' });
  }
}

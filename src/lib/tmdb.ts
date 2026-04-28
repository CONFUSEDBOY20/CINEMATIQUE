const TMDB_KEY = '56f9ab6f362ed8d049e4075ba9897765';
const BASE_URL = 'https://api.tmdb.org/3';

// Map TMDB genre IDs to strings
export const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western"
};

export const fetchTMDB = async (endpoint: string, params: Record<string, any> = {}) => {
  const query = new URLSearchParams({ api_key: TMDB_KEY, ...params }).toString();
  const res = await fetch(`${BASE_URL}${endpoint}?${query}`);
  if (!res.ok) throw new Error('TMDB API Error');
  return res.json();
};

export const mapMovie = (m: any) => ({
  id: m.id.toString(),
  title: m.title || m.name || m.original_title,
  synopsis: m.overview || 'No synopsis available.',
  posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '/placeholder-poster.svg',
  backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : '',
  rating: Math.round((m.vote_average || 0) * 10) / 10,
  year: m.release_date ? parseInt(m.release_date.split('-')[0]) : (m.first_air_date ? parseInt(m.first_air_date.split('-')[0]) : new Date().getFullYear()),
  genres: (m.genre_ids || []).map((id: number) => GENRE_MAP[id] || 'Other').slice(0, 3),
  runtime: m.runtime ? `${Math.floor(m.runtime / 60)}h ${m.runtime % 60}m` : '1h 50m',
  cast: [], // Will be populated in details
  language: m.original_language ? m.original_language.toUpperCase() : 'EN'
});

export const getTrending = async () => {
  const data = await fetchTMDB('/trending/movie/day');
  return data.results.map(mapMovie);
};

export const getPopular = async () => {
  const data = await fetchTMDB('/movie/popular');
  return data.results.map(mapMovie);
};

export const getTopRated = async () => {
  const data = await fetchTMDB('/movie/top_rated');
  return data.results.map(mapMovie);
};

export const getUpcoming = async () => {
  const data = await fetchTMDB('/movie/upcoming');
  return data.results.map(mapMovie);
};

export const searchMovies = async (query: string) => {
  if (!query) return [];
  const data = await fetchTMDB('/search/movie', { query });
  return data.results.map(mapMovie);
};

export const getMovieDetails = async (id: string) => {
  const data = await fetchTMDB(`/movie/${id}`, { append_to_response: 'credits,videos' });
  const movie = mapMovie(data);
  movie.genres = (data.genres || []).map((g: any) => g.name);
  movie.cast = (data.credits?.cast || []).slice(0, 6).map((c: any) => c.name);
  
  // Find official trailer
  const videos = data.videos?.results || [];
  const trailer = videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || videos[0];
  const trailerKey = trailer ? trailer.key : null;
  
  return { ...movie, trailerKey, castDetails: data.credits?.cast?.slice(0, 10) || [] };
};

export const getSimilarMovies = async (id: string) => {
  const data = await fetchTMDB(`/movie/${id}/similar`);
  return data.results.map(mapMovie);
};

// ── Genre picker data ─────────────────────────────────────────────────
export const GENRE_LIST: { id: number; name: string; emoji: string }[] = [
  { id: 28,    name: 'Action',      emoji: '💥' },
  { id: 12,    name: 'Adventure',   emoji: '🗺️' },
  { id: 16,    name: 'Animation',   emoji: '🎨' },
  { id: 35,    name: 'Comedy',      emoji: '😂' },
  { id: 80,    name: 'Crime',       emoji: '🔪' },
  { id: 99,    name: 'Documentary', emoji: '🎥' },
  { id: 18,    name: 'Drama',       emoji: '🎭' },
  { id: 10751, name: 'Family',      emoji: '👨‍👩‍👧‍👦' },
  { id: 14,    name: 'Fantasy',     emoji: '🧙' },
  { id: 36,    name: 'History',     emoji: '📜' },
  { id: 27,    name: 'Horror',      emoji: '👻' },
  { id: 10402, name: 'Music',       emoji: '🎵' },
  { id: 9648,  name: 'Mystery',     emoji: '🔍' },
  { id: 10749, name: 'Romance',     emoji: '💕' },
  { id: 878,   name: 'Sci-Fi',      emoji: '🚀' },
  { id: 53,    name: 'Thriller',    emoji: '😰' },
  { id: 10752, name: 'War',         emoji: '⚔️' },
  { id: 37,    name: 'Western',     emoji: '🤠' },
];

/**
 * Discover movies by genre — fetches 2 pages (≈40 results) sorted by
 * popularity so the user always sees recognisable titles first.
 */
export const discoverByGenre = async (genreId: number) => {
  const [p1, p2] = await Promise.all([
    fetchTMDB('/discover/movie', {
      with_genres: genreId.toString(),
      sort_by: 'popularity.desc',
      page: '1',
    }),
    fetchTMDB('/discover/movie', {
      with_genres: genreId.toString(),
      sort_by: 'popularity.desc',
      page: '2',
    }),
  ]);

  const seen = new Set<string>();
  const merged: any[] = [];
  for (const m of [...(p1.results || []), ...(p2.results || [])]) {
    const mid = m.id.toString();
    if (!seen.has(mid)) {
      seen.add(mid);
      merged.push(m);
    }
  }
  return merged.map(mapMovie);
};

// Reverse map: genre name → TMDB genre ID
const REVERSE_GENRE_MAP: Record<string, number> = Object.fromEntries(
  Object.entries(GENRE_MAP).map(([id, name]) => [name, Number(id)])
);

/**
 * Smart "More Like This" engine.
 * Combines TMDB similar, genre-discover, and cast-discover results,
 * deduplicates, scores by relevance, and returns the top 15.
 */
export const getMoreLikeThis = async (
  id: string,
  genres: string[],
  year: number,
  castIds: number[]
) => {
  const movieId = id;
  const genreIdStr = genres
    .map(g => REVERSE_GENRE_MAP[g])
    .filter(Boolean)
    .join(',');

  const yearMin = Math.max(1900, year - 3);
  const yearMax = year + 3;

  // Fire multiple discovery queries in parallel for breadth
  const queries: Promise<any>[] = [
    // 1. TMDB's own similar endpoint (always a good baseline)
    fetchTMDB(`/movie/${movieId}/similar`).catch(() => ({ results: [] })),
    // 2. TMDB recommendations endpoint
    fetchTMDB(`/movie/${movieId}/recommendations`).catch(() => ({ results: [] })),
  ];

  // 3. Discover by same genres + year range
  if (genreIdStr) {
    queries.push(
      fetchTMDB('/discover/movie', {
        with_genres: genreIdStr,
        'primary_release_date.gte': `${yearMin}-01-01`,
        'primary_release_date.lte': `${yearMax}-12-31`,
        sort_by: 'vote_count.desc',
      }).catch(() => ({ results: [] }))
    );
  }

  // 4. Discover by top cast members (if available)
  if (castIds.length > 0) {
    const castStr = castIds.slice(0, 3).join(',');
    queries.push(
      fetchTMDB('/discover/movie', {
        with_cast: castStr,
        sort_by: 'popularity.desc',
      }).catch(() => ({ results: [] }))
    );
  }

  const responses = await Promise.all(queries);

  // Merge and deduplicate all results
  const seen = new Set<string>();
  const allMovies: any[] = [];

  for (const res of responses) {
    for (const m of res.results || []) {
      const mid = m.id.toString();
      if (mid === movieId || seen.has(mid)) continue;
      seen.add(mid);
      allMovies.push(m);
    }
  }

  // Score each movie by relevance
  const genreIdSet = new Set(
    genres.map(g => REVERSE_GENRE_MAP[g]).filter(Boolean)
  );
  const castIdSet = new Set(castIds);

  const scored = allMovies.map(m => {
    let score = 0;

    // Genre overlap (up to +3 per matching genre)
    const mGenres = m.genre_ids || [];
    for (const gid of mGenres) {
      if (genreIdSet.has(gid)) score += 3;
    }

    // Year proximity (closer = higher)
    const mYear = m.release_date
      ? parseInt(m.release_date.split('-')[0])
      : 9999;
    const yearDiff = Math.abs(mYear - year);
    if (yearDiff <= 1) score += 4;
    else if (yearDiff <= 3) score += 2;
    else if (yearDiff <= 5) score += 1;

    // Popularity bonus (avoid obscure filler)
    if (m.vote_count > 500) score += 2;
    else if (m.vote_count > 100) score += 1;

    // Poster availability (no poster = less useful)
    if (m.poster_path) score += 1;

    return { raw: m, score };
  });

  // Sort by score descending, take top 15
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 15).map(s => mapMovie(s.raw));
};

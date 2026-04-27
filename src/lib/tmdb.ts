const TMDB_KEY = '56f9ab6f362ed8d049e4075ba9897765';
const BASE_URL = 'https://api.tmdb.org/3';

// Map TMDB genre IDs to strings
const GENRE_MAP: Record<number, string> = {
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

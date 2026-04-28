import { useState, useMemo, useCallback, useEffect } from 'react';
import { ArrowLeft, Star, Play, Heart, Share2, Clock, Calendar, MessageSquare, Check, X, Plus, Film } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { LazyImage } from '../components/LazyImage';
import { getMovieDetails, getMoreLikeThis } from '../lib/tmdb';

export function MovieDetailPage({ movieId }: { movieId: string }) {
  const { navigate, watchlist, addToWatchlist, removeFromWatchlist, user } = useAppContext();
  const [showTrailer, setShowTrailer] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  
  const [movie, setMovie] = useState<any>(null);
  const [moreLikeThis, setMoreLikeThis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moreLikeLoading, setMoreLikeLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setMoreLikeLoading(true);
    setMoreLikeThis([]);

    getMovieDetails(movieId)
      .then((m) => {
        setMovie(m);
        setLoading(false);

        // Extract cast IDs for the "More Like This" engine
        const castIds = (m.castDetails || [])
          .slice(0, 5)
          .map((c: any) => c.id)
          .filter(Boolean);

        return getMoreLikeThis(movieId, m.genres || [], m.year, castIds);
      })
      .then((related) => {
        setMoreLikeThis(related);
        setMoreLikeLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        setMoreLikeLoading(false);
      });
  }, [movieId]);

  const isWatchlisted = movie ? watchlist.includes(movie.id) : false;

  const toggleWatchlist = useCallback(() => {
    if (!user) {
      navigate('auth');
      return;
    }
    if (movie) {
      isWatchlisted ? removeFromWatchlist(movie.id) : addToWatchlist(movie.id);
    }
  }, [user, navigate, isWatchlisted, movie, addToWatchlist, removeFromWatchlist]);

  if (loading) return (
     <div className="min-h-screen flex items-center justify-center pb-32">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
     </div>
  );
  if (!movie) return <div className="p-8 text-center text-gray-400">Movie not found.</div>;

  return (
    <div className="relative min-h-full bg-brand-black pb-20">
      {/* Banner */}
      <div className="relative h-[40vh] md:h-[60vh] w-full">
        <button 
          onClick={() => navigate('user')}
          className="absolute top-6 left-6 z-20 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <img
          src={movie.backdropUrl}
          className="w-full h-full object-cover"
          alt={movie.title}
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/60 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/40 to-transparent z-10"></div>
      </div>

      {/* Content */}
      <div className="relative z-20 px-4 md:px-12 -mt-32 md:-mt-48 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Poster (Desktop) */}
          <div className="hidden md:block w-72 flex-shrink-0">
            <motion.img 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              src={movie.posterUrl} 
              className="w-full rounded-2xl shadow-2xl border border-white/5" 
            />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 mt-[10vh] md:mt-16"
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {movie.genres.map((g: string) => (
                <span key={g} className="px-3 py-1 bg-brand-crimson text-white rounded text-[10px] font-bold uppercase tracking-widest">
                  {g}
                </span>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 uppercase tracking-tighter">{movie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-6 text-xs text-white/60 mb-8 uppercase tracking-[0.2em] font-medium">
              <div className="flex items-center gap-1 text-brand-gold">
                <Star className="w-4 h-4 fill-brand-gold" />
                <span className="font-bold text-sm tracking-normal">{movie.rating}</span>
                <span>/ 5</span>
              </div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {movie.runtime}</div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {movie.year}</div>
              <div className="tracking-[0.3em] text-white/40">{movie.language}</div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-12">
              <button 
                onClick={() => movie.trailerKey && setShowTrailer(true)}
                disabled={!movie.trailerKey}
                className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-colors shadow-[0_0_20px_rgba(229,9,20,0.3)] ${movie.trailerKey ? 'bg-brand-crimson text-white hover:bg-red-700' : 'bg-gray-800 text-white/40 cursor-not-allowed'}`}
              >
                <Play className="w-4 h-4 fill-current" />
                PLAY TRAILER
              </button>
              <button 
                onClick={toggleWatchlist}
                className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs backdrop-blur transition-all border ${isWatchlisted ? 'bg-white/20 border-white/30 text-white' : 'bg-transparent border-white/20 hover:bg-white/10 text-white'}`}
              >
                {isWatchlisted ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isWatchlisted ? 'ADDED' : 'WATCHLIST'}
              </button>
            </div>

            <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-white/60 mb-4 flex items-center gap-4">
              Synopsis <span className="h-px w-12 bg-white/10"></span>
            </h3>
            <p className="text-white/80 leading-relaxed max-w-3xl mb-10 text-lg">
              {movie.synopsis}
            </p>

            <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-white/60 mb-4 flex items-center gap-4">
              Top Cast <span className="h-px w-12 bg-white/10"></span>
            </h3>
            <div className="flex flex-wrap gap-4">
              {(movie.castDetails || []).slice(0, 6).map((actor: any, i: number) => (
                <div key={i} className="flex items-center gap-3 bg-brand-gray/50 px-4 py-2 rounded-full border border-white/5 pr-6">
                  <div className="w-10 h-10 rounded-full bg-brand-gray overflow-hidden border border-white/10 shrink-0">
                    {actor.profile_path ? (
                       <img src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} className="w-full h-full object-cover" alt={actor.name} />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-xs font-bold text-brand-gold">{actor.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{actor.name}</span>
                    <span className="text-[9px] text-white/40 uppercase tracking-widest truncate max-w-[120px]">{actor.character}</span>
                  </div>
                </div>
              ))}
            </div>

          </motion.div>
        </div>

        {/* ── More Like This ───────────────────────────────────────── */}
        <div className="mt-16 pt-10 border-t border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <Film className="w-6 h-6 text-brand-gold" />
            <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase tracking-tight">More Like This</h2>
            <span className="h-px flex-1 bg-white/10" />
            {!moreLikeLoading && moreLikeThis.length > 0 && (
              <span className="text-xs text-white/40 tracking-widest uppercase">{moreLikeThis.length} titles</span>
            )}
          </div>

          {moreLikeLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[2/3] rounded-xl bg-white/5 mb-3" />
                  <div className="h-4 w-3/4 rounded bg-white/5 mb-2" />
                  <div className="h-3 w-1/2 rounded bg-white/5" />
                </div>
              ))}
            </div>
          ) : moreLikeThis.length === 0 ? (
            <div className="text-center py-16 text-white/30">
              <Film className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm uppercase tracking-widest">No related movies found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {moreLikeThis.map((m, idx) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.35 }}
                  onClick={() => navigate('user', { movieId: m.id })}
                  className="cursor-pointer group relative"
                >
                  {/* Card */}
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-brand-gray border border-white/5 shadow-lg">
                    <LazyImage
                      src={m.posterUrl}
                      alt={m.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />

                    {/* Rating badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/60 border border-white/10 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 fill-brand-gold text-brand-gold" />
                      {m.rating}
                    </div>

                    {/* Year badge */}
                    <div className="absolute top-2.5 right-2.5 bg-black/60 border border-white/10 backdrop-blur-sm text-white/70 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {m.year}
                    </div>

                    {/* Bottom info — always visible */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                      <h4 className="font-bold text-sm leading-tight truncate text-white uppercase tracking-wide">{m.title}</h4>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(m.genres || []).slice(0, 2).map((g: string) => (
                          <span key={g} className="text-[8px] text-brand-gold/80 bg-brand-gold/10 border border-brand-gold/20 px-1.5 py-0.5 rounded uppercase tracking-widest font-semibold">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-crimson/90 via-brand-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
                      <h4 className="font-bold text-base leading-tight text-white uppercase mb-1">{m.title}</h4>
                      <p className="text-[10px] text-white/60 uppercase tracking-wider mb-2">{m.genres?.slice(0, 2).join(' • ')} • {m.year}</p>
                      <p className="text-xs text-white/70 line-clamp-3 mb-3">{m.synopsis}</p>
                      <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur border border-white/20 py-2 rounded-full text-xs font-bold tracking-widest uppercase text-white">
                        <Play className="w-3 h-3 fill-current" />
                        View Details
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Review Section */}
        <div className="mt-12 mb-12">
          <div className="bg-brand-gray/30 border border-white/5 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-brand-gold" />
              Write a Review
            </h2>
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star} 
                  onClick={() => setUserRating(star)}
                  className="focus:outline-none"
                >
                  <Star className={`w-8 h-8 ${userRating >= star ? 'text-brand-gold fill-brand-gold' : 'text-gray-600'}`} />
                </button>
              ))}
            </div>
            <textarea 
               value={reviewText}
               onChange={e => setReviewText(e.target.value)}
               placeholder="What did you think of the movie?"
               className="w-full bg-brand-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors resize-none h-32 mb-4"
            ></textarea>
            <button 
              onClick={() => {
                if (!user) {
                  navigate('auth');
                }
              }}
              className="bg-brand-crimson text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
            >
              Submit Review
            </button>
          </div>
        </div>

      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          >
            <div className="w-full max-w-4xl relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl">
              <button 
                onClick={() => setShowTrailer(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:text-brand-crimson transition-all border border-white/10"
              >
                <X className="w-6 h-6" />
              </button>
              {movie.trailerKey ? (
                 <iframe 
                   src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&rel=0`}
                   className="w-full h-full border-0"
                   allow="autoplay; encrypted-media"
                   allowFullScreen
                 />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                  <Play className="w-16 h-16 text-brand-gold/50 fill-brand-gold/50 mb-4" />
                  <p>No Official Trailer Available</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

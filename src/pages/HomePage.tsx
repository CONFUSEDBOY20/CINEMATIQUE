import { useMemo, useCallback, memo, useState, useEffect } from 'react';
import { Play, Plus, Check, Sparkles, ArrowLeft, X, Star } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MovieCard } from '../components/MovieCard';
import { LazyImage } from '../components/LazyImage';
import { motion, AnimatePresence } from 'motion/react';
import { getTrending, getUpcoming, getPopular, getTopRated, GENRE_LIST, discoverByGenre } from '../lib/tmdb';

// Stagger children with a lightweight CSS animation instead of per-item motion.div
const MOODS = ['😂 Laugh', '😱 Thrill', '😢 Cry', '🤯 Mind-Blown'];

export const HomePage = memo(function HomePage() {
  const { user, navigate, watchlist, addToWatchlist, removeFromWatchlist } = useAppContext();
  const [trending, setTrending] = useState<any[]>([]);
  const [newReleases, setNewReleases] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ── My Vibe state ──────────────────────────────────────
  const [vibeOpen, setVibeOpen] = useState(false);
  const [vibeGenre, setVibeGenre] = useState<{ id: number; name: string; emoji: string } | null>(null);
  const [vibeMovies, setVibeMovies] = useState<any[]>([]);
  const [vibeLoading, setVibeLoading] = useState(false);

  const handleGenrePick = useCallback((genre: { id: number; name: string; emoji: string }) => {
    setVibeGenre(genre);
    setVibeLoading(true);
    setVibeMovies([]);
    discoverByGenre(genre.id)
      .then(setVibeMovies)
      .catch(console.error)
      .finally(() => setVibeLoading(false));
  }, []);

  const handleVibeBack = useCallback(() => {
    setVibeGenre(null);
    setVibeMovies([]);
  }, []);

  const handleVibeClose = useCallback(() => {
    setVibeOpen(false);
    // reset after exit animation
    setTimeout(() => { setVibeGenre(null); setVibeMovies([]); }, 300);
  }, []);

  useEffect(() => {
    Promise.all([getTrending(), getUpcoming(), getPopular(), getTopRated()]).then(([t, u, p, tr]) => {
      setTrending(t);
      setNewReleases(u);
      setPopular(p);
      setTopRated(tr);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const featured = trending[0];
  const isWatchlisted = useMemo(() => watchlist.includes(featured?.id), [watchlist, featured?.id]);

  const handleToggleWatchlist = useCallback(() => {
    if (!user) {
      navigate('auth');
      return;
    }
    if (featured) {
      isWatchlisted ? removeFromWatchlist(featured.id) : addToWatchlist(featured.id);
    }
  }, [user, navigate, isWatchlisted, featured, addToWatchlist, removeFromWatchlist]);

  const handleFeaturedClick = useCallback(
    () => {
      if (featured) {
        navigate('user', { movieId: featured.id });
      }
    },
    [navigate, featured]
  );

  if (loading) {
    return (
      <div className="pb-12 pt-4 md:pt-8 px-4 md:px-8">
        <div className="h-[60vh] md:h-[75vh] w-full rounded-3xl bg-white/5 animate-pulse mb-12 border border-white/5" />
        <div className="mb-6 h-4 w-48 bg-white/5 rounded animate-pulse" />
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[2/3] w-44 md:w-56 shrink-0 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (!featured) return null;

  return (
    <div className="pb-12 pt-4 md:pt-8">
      <div className="absolute top-0 right-0 w-[600px] h-full opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle at center, #FFD70033 0%, transparent 70%)' }} />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div className="relative h-[60vh] md:h-[75vh] w-full px-4 md:px-8 z-10">
        <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl group">
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-transparent z-10" />

          {/* Hero image — not lazy (above fold, eager) */}
          <img
            src={featured.backdropUrl}
            className="absolute inset-0 w-full h-full object-cover"
            alt={featured.title}
            fetchPriority="high"
            decoding="async"
          />

          <div className="absolute bottom-0 left-0 p-6 md:p-10 z-20 w-full">
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-brand-crimson text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Featured</span>
                <span className="text-white/60 text-sm">{featured.year} &bull; {featured.genres.join('/')} &bull; {featured.runtime}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 leading-none uppercase">{featured.title}</h1>
              <p className="text-white/70 text-lg max-w-xl mb-6 line-clamp-2 md:line-clamp-none">{featured.synopsis}</p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleFeaturedClick}
                  className="flex items-center gap-2 bg-brand-crimson hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold text-sm tracking-wide transition-colors shadow-[0_0_20px_rgba(229,9,20,0.3)]"
                >
                  <Play className="w-5 h-5 fill-current" />
                  WATCH TRAILER
                </button>
                <button
                  onClick={handleToggleWatchlist}
                  className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm tracking-wide backdrop-blur-md transition-colors border ${isWatchlisted ? 'bg-white/20 border-white/30 text-white' : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'}`}
                >
                  {isWatchlisted ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {isWatchlisted ? 'ADDED' : 'WATCHLIST'}
                </button>
              </div>
            </motion.div>
          </div>

          <div className="absolute top-6 right-6 z-20 bg-brand-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 hidden md:block">
            <div className="flex items-center gap-2">
              <span className="text-brand-gold text-xl font-bold">{featured.rating}</span>
              <span className="text-[10px] uppercase text-white/40 tracking-widest">Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── My Vibe Floating Button ─────────────────────────────────── */}
      <div className="relative z-20 px-4 md:px-8 -mt-6 mb-6 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setVibeOpen(true)}
          className="flex items-center gap-3 bg-gradient-to-r from-brand-gold/90 to-amber-500 text-brand-black px-8 py-3.5 rounded-full font-bold text-sm tracking-wide shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] transition-shadow border border-brand-gold/30"
        >
          <Sparkles className="w-5 h-5" />
          MY VIBE
        </motion.button>
      </div>

      {/* ── Trending Row ─────────────────────────────────────────────── */}
      <section className="mt-12 relative z-10 px-4 md:px-8">
        <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-white/60 flex items-center gap-4 mb-6">
          Trending Cinema <span className="h-px flex-1 max-w-[100px] bg-white/10" />
        </h2>
        {/* Removed per-card motion.div — scroll smoothness > stagger animation here */}
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x px-2 -mx-2 custom-scrollbar">
          {trending.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* ── Popular Row ─────────────────────────────────────────────── */}
      <section className="mt-8 relative z-10 px-4 md:px-8">
        <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-white/60 flex items-center gap-4 mb-6">
          Popular Cinema <span className="h-px flex-1 max-w-[100px] bg-white/10" />
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x px-2 -mx-2 custom-scrollbar">
          {popular.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* ── Top Rated Row ─────────────────────────────────────────────── */}
      <section className="mt-8 relative z-10 px-4 md:px-8">
        <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-white/60 flex items-center gap-4 mb-6">
          Top Rated Cinema <span className="h-px flex-1 max-w-[100px] bg-white/10" />
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x px-2 -mx-2 custom-scrollbar">
          {topRated.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* ── By Mood ──────────────────────────────────────────────────── */}
      <section className="mt-8 px-4 md:px-8 z-10 relative">
        <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-white/60 flex items-center gap-4 mb-6">
          Explore by Mood <span className="h-px flex-1 max-w-[100px] bg-white/10" />
        </h2>
        <div className="flex flex-wrap gap-3">
          {MOODS.map(mood => (
            <button key={mood} className="bg-white/5 border border-white/10 hover:border-brand-gold hover:bg-brand-gold/10 text-xs font-bold tracking-[0.1em] py-3 px-6 rounded-full transition-colors uppercase">
              {mood}
            </button>
          ))}
        </div>
      </section>

      {/* ── New Releases Grid ─────────────────────────────────────────── */}
      <section className="mt-12 px-4 md:px-8 z-10 relative">
        <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-white/60 flex items-center gap-4 mb-6">
          New Releases <span className="h-px w-24 bg-white/10" />
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {newReleases.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  MY VIBE — Full-screen genre picker + results overlay        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {vibeOpen && (
          <motion.div
            key="vibe-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-brand-black/95 backdrop-blur-xl overflow-y-auto"
          >
            {/* Top bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-brand-black/80 backdrop-blur-md border-b border-white/5">
              <div className="flex items-center gap-3">
                {vibeGenre && (
                  <button
                    onClick={handleVibeBack}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <Sparkles className="w-5 h-5 text-brand-gold" />
                <h2 className="text-lg font-bold uppercase tracking-widest">
                  {vibeGenre ? `${vibeGenre.emoji} ${vibeGenre.name}` : 'Pick Your Vibe'}
                </h2>
              </div>
              <button
                onClick={handleVibeClose}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-brand-crimson/20 hover:border-brand-crimson/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
              <AnimatePresence mode="wait">
                {/* ── Genre grid (no genre selected yet) ──────────── */}
                {!vibeGenre && (
                  <motion.div
                    key="genre-grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="text-white/50 text-center text-sm mb-10 tracking-wide">
                      What are you in the mood for? Pick a genre below.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {GENRE_LIST.map((genre, idx) => (
                        <motion.button
                          key={genre.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.03 }}
                          whileHover={{ scale: 1.06, y: -4 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleGenrePick(genre)}
                          className="flex flex-col items-center gap-3 py-6 px-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-brand-gold/50 hover:bg-brand-gold/5 transition-colors group"
                        >
                          <span className="text-3xl group-hover:scale-110 transition-transform">{genre.emoji}</span>
                          <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/70 group-hover:text-brand-gold transition-colors">{genre.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ── Results grid (genre selected) ───────────────── */}
                {vibeGenre && (
                  <motion.div
                    key={`results-${vibeGenre.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    {vibeLoading ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="aspect-[2/3] rounded-xl bg-white/5 mb-3" />
                            <div className="h-4 w-3/4 rounded bg-white/5 mb-2" />
                            <div className="h-3 w-1/2 rounded bg-white/5" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <p className="text-white/40 text-sm mb-6 tracking-wide">
                          {vibeMovies.length} movies found
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                          {vibeMovies.map((m, idx) => (
                            <motion.div
                              key={m.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.025, duration: 0.3 }}
                              onClick={() => { handleVibeClose(); setTimeout(() => navigate('user', { movieId: m.id }), 320); }}
                              className="cursor-pointer group relative"
                            >
                              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-brand-gray border border-white/5 shadow-lg">
                                <LazyImage
                                  src={m.posterUrl}
                                  alt={m.title}
                                  className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                                />
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

                                {/* Bottom info */}
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
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

import { useMemo, useCallback, memo, useState, useEffect } from 'react';
import { Play, Plus, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MovieCard } from '../components/MovieCard';
import { LazyImage } from '../components/LazyImage';
import { motion } from 'motion/react';
import { getTrending, getUpcoming, getPopular, getTopRated } from '../lib/tmdb';

// Stagger children with a lightweight CSS animation instead of per-item motion.div
const MOODS = ['😂 Laugh', '😱 Thrill', '😢 Cry', '🤯 Mind-Blown'];

export const HomePage = memo(function HomePage() {
  const { user, navigate, watchlist, addToWatchlist, removeFromWatchlist } = useAppContext();
  const [trending, setTrending] = useState<any[]>([]);
  const [newReleases, setNewReleases] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    </div>
  );
});

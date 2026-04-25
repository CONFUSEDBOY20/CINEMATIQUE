import { useState } from 'react';
import { BookmarkMinus, Play } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MovieCard } from '../components/MovieCard';
import { motion, AnimatePresence } from 'motion/react';

export function WatchlistPage() {
  const { movies, watchlist, navigate, removeFromWatchlist } = useAppContext();
  const [filter, setFilter] = useState<'All'|'Watched'|'Unwatched'>('All');

  const watchlistedMovies = movies.filter(m => watchlist.includes(m.id));

  // In a real app we'd have a watched status, here we mock it
  const filtered = watchlistedMovies.filter(m => {
    if (filter === 'All') return true;
    const isMockWatched = parseInt(m.id) > 10; 
    if (filter === 'Watched') return isMockWatched;
    if (filter === 'Unwatched') return !isMockWatched;
    return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2 uppercase tracking-tighter">My Watchlist</h1>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">{watchlistedMovies.length} Saved Titles</p>
        </div>

        <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
          {['All', 'Watched', 'Unwatched'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f as 'All'|'Watched'|'Unwatched')}
              className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${filter === f ? 'bg-white text-brand-black shadow' : 'text-white/60 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {watchlistedMovies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-24 h-24 border border-white/10 rounded-full flex items-center justify-center mb-6 bg-white/5">
            <BookmarkMinus className="w-8 h-8 text-white/40" />
          </div>
          <h2 className="text-2xl font-serif font-bold mb-2 uppercase tracking-widest">Nothing Here Yet</h2>
          <p className="text-white/40 max-w-md mx-auto mb-8 text-sm">
            Curate your personal cinema collection by adding titles to your watchlist.
          </p>
          <button 
            onClick={() => navigate('user')}
            className="bg-brand-gold text-brand-black px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-yellow-400 transition-colors shadow-[0_0_20px_rgba(255,215,0,0.3)]"
          >
            Discover Cinema
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          <AnimatePresence>
            {filtered.map((movie: any) => (
              <motion.div 
                key={movie.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group"
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFromWatchlist(movie.id); }}
                  className="absolute -top-2 -right-2 z-20 w-8 h-8 bg-brand-crimson rounded-full flex items-center justify-center text-white border-2 border-brand-black opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg"
                >
                  <BookmarkMinus className="w-4 h-4" />
                </button>
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

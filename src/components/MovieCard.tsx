import React, { memo } from 'react';
import { Star, Play, Heart, Share2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const MovieCard = memo(({ movie }: { movie: any }) => {
  const { navigate, watchlist, addToWatchlist, removeFromWatchlist } = useAppContext();
  const isWatchlisted = watchlist.includes(movie.id);

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWatchlisted) removeFromWatchlist(movie.id);
    else addToWatchlist(movie.id);
  };

  return (
    <div 
      className="group relative cursor-pointer w-44 md:w-56 shrink-0 snap-center transition-transform hover:z-10 h-full"
      onClick={() => navigate('user', { movieId: movie.id })}
    >
      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden border border-white/5 bg-white/5 shadow-lg">
        <img 
          src={movie.posterUrl} 
          alt={movie.title} 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700" 
          loading="lazy" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-[rgba(0,0,0,0.4)] to-transparent pointer-events-none"></div>

        {/* Regular State text */}
        <div className="absolute bottom-4 left-4 right-4 group-hover:opacity-0 transition-opacity duration-300">
          <span className="text-[10px] text-brand-gold font-bold tracking-wider mb-1 block uppercase">{movie.genres[0]}</span>
          <h4 className="font-bold text-base leading-tight truncate uppercase font-sans text-white">{movie.title}</h4>
        </div>
        
        {/* Match Badge */}
        <div className="absolute top-3 left-3 bg-black/60 border border-white/10 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
          ★ {movie.rating}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-10">
          <p className="text-[10px] text-brand-gold font-bold tracking-wider mb-1 uppercase">{movie.genres[0]} • {movie.year}</p>
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center text-sm font-bold bg-white/10 border border-white/20 px-2 py-0.5 rounded-full backdrop-blur text-[10px] uppercase tracking-wider">
               <Star className="w-3 h-3 text-brand-gold fill-brand-gold mr-1" />
               {movie.rating} Rating
             </div>
             <button 
                onClick={toggleWatchlist} 
                className={`p-1.5 rounded-full backdrop-blur border transition-colors ${isWatchlisted ? 'bg-brand-crimson/80 border-red-500/50 text-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white'}`}
              >
               <Heart className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} />
             </button>
          </div>
          <h4 className="font-bold text-base leading-tight truncate uppercase font-sans text-white mb-2">{movie.title}</h4>
          <p className="line-clamp-3 text-xs text-white/60 mb-4">{movie.synopsis}</p>
          <button className="flex items-center justify-center gap-2 bg-brand-crimson hover:bg-red-700 text-white py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all shadow-lg border border-red-500/50">
            <Play className="w-3 h-3 fill-current" />
            Trailer
          </button>
        </div>
      </div>
    </div>
  );
});

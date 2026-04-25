import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, Grid, List as ListIcon, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MovieCard } from '../components/MovieCard';

export function SearchPage() {
  const { movies } = useAppContext();
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(30);

  useEffect(() => {
    setVisibleCount(30);
  }, [query, selectedGenre]);

  const genres = ['All', 'Action', 'Sci-Fi', 'Drama', 'Comedy', 'Thriller', 'Horror', 'Romance'];

  const filteredMovies = useMemo(() => {
    return movies.filter((m: any) => {
      const matchQuery = m.title.toLowerCase().includes(query.toLowerCase()) || 
                         m.cast.some((c: string) => c.toLowerCase().includes(query.toLowerCase()));
      const matchGenre = selectedGenre === 'All' || m.genres.includes(selectedGenre);
      return matchQuery && matchGenre;
    });
  }, [movies, query, selectedGenre]);

  const displayedMovies = useMemo(() => filteredMovies.slice(0, visibleCount), [filteredMovies, visibleCount]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-8 uppercase tracking-tighter">Search & Filter</h1>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search movies, actors..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-brand-gold transition-colors placeholder-white/30"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-[10px] text-white/40 uppercase tracking-widest font-bold">
              Press <span className="border border-white/20 px-1.5 py-0.5 rounded">/</span>
            </div>
          </div>
          
          <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar mb-8">
        {genres.map(g => (
          <button 
            key={g} 
            onClick={() => setSelectedGenre(g)}
            className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-colors border ${selectedGenre === g ? 'bg-white text-brand-black border-white' : 'bg-transparent border-white/10 text-white/60 hover:text-white hover:border-white/30'}`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{filteredMovies.length} Results</p>
        <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-full ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
            <Grid className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-full ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {displayedMovies.map((movie: any) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedMovies.map((movie: any) => (
            <div key={movie.id} className="flex gap-6 bg-white/5 rounded-2xl overflow-hidden border border-white/10 p-3 items-center group cursor-pointer hover:bg-white/10 transition-colors">
              <div className="w-24 h-36 shrink-0 relative overflow-hidden rounded-xl">
                <img src={movie.posterUrl} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="flex flex-col justify-center py-2 flex-1 relative">
                <h3 className="text-xl font-serif font-bold mb-2 uppercase">{movie.title}</h3>
                 <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest mb-3">
                   <div className="flex items-center text-brand-gold"><span className="text-brand-gold mr-1">★</span>{movie.rating}</div>
                   <span className="text-white/40">{movie.year}</span>
                 </div>
                 <p className="text-white/60 text-sm line-clamp-2 mb-4 leading-relaxed">{movie.synopsis}</p>
                 <div className="flex gap-2 mt-auto">
                    {movie.genres.slice(0, 3).map((g: string) => (
                      <span key={g} className="text-[9px] uppercase tracking-widest border border-white/20 px-2 py-1 rounded-full text-white/60">{g}</span>
                    ))}
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredMovies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Search className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-lg">No movies found matching your criteria.</p>
        </div>
      )}

      {filteredMovies.length > visibleCount && (
        <div className="flex justify-center mt-12 mb-8">
          <button 
            onClick={() => setVisibleCount(v => v + 30)}
            className="flex items-center gap-2 bg-brand-gold text-brand-black px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-yellow-400 transition-colors shadow-lg"
          >
            Load More Movies
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

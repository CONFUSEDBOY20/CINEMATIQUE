import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, MoreVertical, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export function AdminMovies() {
  const { movies } = useAppContext();
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filtered = useMemo(() => {
    return movies.filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
  }, [movies, query]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  
  const displayed = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white mb-1">Movie Management</h2>
          <p className="text-[#888] text-sm">Manage your catalog of {movies.length} movies</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-gold text-brand-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors text-sm">
          <Plus className="w-4 h-4" />
          Add New Movie
        </button>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden text-sm">
        <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#1A1A1A]">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search movies..." 
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#111] border border-[#333] rounded-lg py-2 pl-9 pr-4 text-white focus:outline-none focus:border-brand-gold transition-colors text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#222] text-[#888] uppercase text-[10px] tracking-wider">
                <th className="px-6 py-4 font-medium">Movie</th>
                <th className="px-6 py-4 font-medium">Year</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium">Genres</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {displayed.map(m => (
                <tr key={m.id} className="hover:bg-[#1A1A1A] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={m.posterUrl} className="w-10 h-14 object-cover rounded shadow" alt="" />
                      <div>
                        <p className="font-bold text-white text-sm">{m.title}</p>
                        <p className="text-xs text-[#888]">{m.language}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{m.year}</td>
                  <td className="px-6 py-4 text-brand-gold font-medium">★ {m.rating}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {m.genres.slice(0, 2).map((g: string) => (
                        <span key={g} className="px-2 py-0.5 rounded text-[10px] bg-[#222] text-gray-300 border border-[#333]">{g}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 text-gray-500">
                      <button className="p-1.5 hover:text-white transition-colors hover:bg-[#333] rounded"><Edit2 className="w-4 h-4" /></button>
                      <button className="p-1.5 hover:text-red-400 transition-colors hover:bg-red-400/10 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-[#222] flex items-center justify-between bg-[#1A1A1A]">
          <p className="text-xs text-[#888]">Showing {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries</p>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded bg-[#222] border border-[#333] text-white hover:bg-[#333] disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              disabled={currentPage === totalPages || totalPages === 0} 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded bg-[#222] border border-[#333] text-white hover:bg-[#333] disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

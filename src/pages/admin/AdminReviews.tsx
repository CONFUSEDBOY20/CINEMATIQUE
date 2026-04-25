import { useState } from 'react';
import { Check, X, Flag, MessageSquare } from 'lucide-react';
import { mockReviews, mockUsers } from '../../constants';
import { useAppContext } from '../../context/AppContext';

export function AdminReviews() {
  const { movies } = useAppContext();
  const [filter, setFilter] = useState('all');

  const filtered = mockReviews.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white mb-1">Reviews Moderation</h2>
          <p className="text-[#888] text-sm">Approve, flag, or remove user reviews</p>
        </div>
        <div className="flex bg-[#111] rounded-lg p-1 border border-[#222]">
          {['all', 'pending', 'approved', 'flagged'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${filter === f ? 'bg-brand-crimson text-white' : 'text-[#888] hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(r => {
          const user = mockUsers.find(u => u.id === r.userId);
          const movie = movies.find(m => m.id === r.movieId);
          return (
            <div key={r.id} className="bg-[#111] border border-[#222] rounded-xl p-6 flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#222] border border-[#333] flex items-center justify-center font-bold text-white shrink-0">
                    {user?.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <p className="font-bold text-white text-sm">{user?.name}</p>
                       <span className="text-[#888] text-xs">on</span>
                       <span className="text-brand-gold font-bold text-sm">{movie?.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[#888]">{r.date}</span>
                      <span className="text-brand-gold text-xs">★ {r.rating}/5</span>
                      {r.status === 'flagged' && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded ml-2">FLAGGED</span>}
                      {r.status === 'pending' && <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded ml-2">PENDING</span>}
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{r.text}</p>
              </div>

              <div className="flex md:flex-col gap-2 shrink-0 md:w-32">
                {r.status !== 'approved' && (
                  <button className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 py-2 rounded-lg transition-colors text-xs font-bold">
                    <Check className="w-4 h-4" /> Approve
                  </button>
                )}
                {r.status !== 'flagged' && (
                  <button className="flex-1 flex items-center justify-center gap-2 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 py-2 rounded-lg transition-colors text-xs font-bold">
                    <Flag className="w-4 h-4" /> Flag
                  </button>
                )}
                <button className="flex-1 flex items-center justify-center gap-2 bg-[#222] text-[#888] hover:text-red-400 hover:bg-red-500/10 border border-[#333] py-2 rounded-lg transition-colors text-xs font-bold">
                  <X className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-[#888]">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No reviews found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

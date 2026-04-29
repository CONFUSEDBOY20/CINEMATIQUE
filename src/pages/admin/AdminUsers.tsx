import { useState, useEffect, useCallback } from 'react';
import { Search, ShieldAlert, ShieldCheck, Trash2, Eye } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export function AdminUsers() {
  const { user: currentUser } = useAppContext();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedWatchlist, setSelectedWatchlist] = useState<any[] | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'admin') {
      setLoading(false);
      return;
    }
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    try {
      await updateDoc(doc(db, "users", userId), { status: newStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const deleteUserAccount = async (userId: string) => {
    if (!window.confirm("Are you sure you want to completely delete this user account? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const filtered = users.filter(u => 
    (u.name?.toLowerCase() || '').includes(query.toLowerCase()) || 
    (u.email?.toLowerCase() || '').includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {selectedWatchlist !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#111] border border-[#222] rounded-2xl p-6 relative">
            <button onClick={() => setSelectedWatchlist(null)} className="absolute top-4 right-4 text-white/50 hover:text-white">✕</button>
            <h3 className="text-xl font-serif font-bold text-white mb-4">User Watchlist</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {selectedWatchlist.length === 0 ? (
                <p className="text-white/40 text-sm">Watchlist is empty</p>
              ) : (
                selectedWatchlist.map((movieId, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm text-white/80">
                    Movie ID: {movieId}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white mb-1">User Management</h2>
          <p className="text-[#888] text-sm">Manage {users.length} registered users and their access</p>
        </div>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden text-sm">
        <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#1A1A1A]">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-lg py-2 pl-9 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#222] text-[#888] uppercase text-[10px] tracking-wider">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Watchlist</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {filtered.map((u: any) => (
                <tr key={u.id} className="hover:bg-[#1A1A1A] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#222] border border-[#333] flex items-center justify-center font-bold text-gray-300 overflow-hidden">
                        {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : (u.name?.[0] || 'U')}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{u.name}</p>
                        <p className="text-xs text-[#888]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border ${
                      u.role === 'admin' ? 'bg-brand-crimson/10 text-brand-crimson border-brand-crimson/30' : 'bg-[#222] text-gray-400 border-[#333]'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-bold text-white">{u.watchlist?.length || 0} items</span>
                      <button 
                        onClick={() => setSelectedWatchlist(u.watchlist || [])}
                        className="text-[10px] text-brand-gold hover:text-white flex items-center gap-1 uppercase tracking-widest transition-colors"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {u.status === 'active' ? (
                      <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-green-400 bg-green-400/10 px-2 py-1 rounded w-fit border border-green-400/20">
                        <ShieldCheck className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-brand-crimson bg-brand-crimson/10 px-2 py-1 rounded w-fit border border-brand-crimson/20">
                        <ShieldAlert className="w-3 h-3" /> Restricted
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.role !== 'admin' && (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleStatus(u.id, u.status)}
                          className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all border ${
                            u.status === 'active' 
                              ? 'text-orange-400 border-orange-400/30 hover:bg-orange-500 hover:text-white' 
                              : 'text-green-400 border-green-400/30 hover:bg-green-500 hover:text-white'
                          }`}
                        >
                          {u.status === 'active' ? 'Restrict' : 'Unrestrict'}
                        </button>
                        <button 
                          onClick={() => deleteUserAccount(u.id)}
                          className="p-1.5 rounded text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Search, ShieldAlert, ShieldCheck, Edit2, Trash2 } from 'lucide-react';
import { mockUsers } from '../../constants';

export function AdminUsers() {
  const [query, setQuery] = useState('');

  const filtered = mockUsers.filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white mb-1">User Management</h2>
          <p className="text-[#888] text-sm">Manage users and roles</p>
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
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {filtered.map((u: any) => (
                <tr key={u.id} className="hover:bg-[#1A1A1A] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#222] border border-[#333] flex items-center justify-center font-bold text-gray-300">
                        {u.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{u.name}</p>
                        <p className="text-xs text-[#888]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider bg-[#222] text-gray-400 border border-[#333]">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{u.joinDate}</td>
                  <td className="px-6 py-4">
                    {u.status === 'active' ? (
                      <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-green-400 bg-green-400/10 px-2 py-1 rounded w-fit">
                        <ShieldCheck className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-brand-crimson bg-brand-crimson/10 px-2 py-1 rounded w-fit">
                        <ShieldAlert className="w-3 h-3" /> Banned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 text-gray-500">
                      <button className="p-1.5 hover:text-white transition-colors hover:bg-[#333] rounded text-xs border border-[#333]">Ban</button>
                    </div>
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

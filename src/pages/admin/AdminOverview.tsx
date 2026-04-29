import { useState, useEffect } from 'react';
import { Users, Film, MessageSquare, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../context/AppContext';

export function AdminOverview() {
  const { movies, accessToken } = useAppContext();
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!accessToken) return;
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStatsData(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [accessToken]);

  const stats = [
    { label: 'Total Movies', value: statsData?.totalMovies || movies.length, icon: Film, color: 'text-brand-gold', bg: 'bg-brand-gold/10' },
    { label: 'Total Users', value: statsData?.totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'New Users (7d)', value: statsData?.newUsersLastWeek || 0, icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Active Status', value: statsData?.activeUsers || 0, icon: Activity, color: 'text-brand-crimson', bg: 'bg-brand-crimson/10' },
  ];

  const chartData = [
    { name: '1', users: 12 }, { name: '2', users: 19 }, { name: '3', users: 15 },
    { name: '4', users: 22 }, { name: '5', users: 28 }, { name: '6', users: 25 },
    { name: '7', users: 38 }, { name: '8', users: 45 }, { name: '9', users: 40 },
    { name: '10', users: 55 }, { name: '11', users: 62 }, { name: '12', users: 58 },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-[#111] border border-[#222] rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-[#888] text-sm font-medium mb-1">{s.label}</p>
              <h3 className="text-3xl font-bold font-serif text-white">{s.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111] border border-[#222] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Growth Overview</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC143C" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#DC143C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#555" tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="#555" tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="users" stroke="#DC143C" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">System Status</h3>
          <div className="space-y-6">
             <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-xs text-[#888] uppercase tracking-widest mb-1">Database</p>
                <p className="text-sm text-green-400 font-bold">Connected</p>
             </div>
             <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-xs text-[#888] uppercase tracking-widest mb-1">API Server</p>
                <p className="text-sm text-green-400 font-bold">Online</p>
             </div>
             <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-xs text-[#888] uppercase tracking-widest mb-1">TMDB Integration</p>
                <p className="text-sm text-green-400 font-bold">Active</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

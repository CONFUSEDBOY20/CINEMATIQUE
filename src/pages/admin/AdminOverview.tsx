import { useState, useEffect } from 'react';
import { Users, MessageSquare, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export function AdminOverview() {
  const { user: currentUser } = useAppContext();
  const [statsData, setStatsData] = useState<any>({ totalUsers: 0, newUsersLastWeek: 0, activeUsers: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser || currentUser.role !== 'admin') {
        setLoading(false);
        return;
      }
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const users = querySnapshot.docs.map(doc => doc.data());
        
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        let newUsersCount = 0;
        let activeUsersCount = 0;
        
        // Setup days for the chart
        const daysData: Record<string, number> = {};
        for(let i=13; i>=0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            daysData[d.toLocaleDateString(undefined, {month:'short', day:'numeric'})] = 0;
        }

        users.forEach(u => {
          if (u.createdAt) {
            const createdDate = new Date(u.createdAt);
            if (createdDate > sevenDaysAgo) {
              newUsersCount++;
            }
            const dateString = createdDate.toLocaleDateString(undefined, {month:'short', day:'numeric'});
            if (daysData[dateString] !== undefined) {
                daysData[dateString]++;
            }
          }
          if (u.status === 'active') {
            activeUsersCount++;
          }
        });
        
        // Calculate cumulative users for chart
        let cumulative = users.length - Object.values(daysData).reduce((a,b)=>a+b, 0); 
        const dynamicChartData = Object.keys(daysData).map(date => {
            cumulative += daysData[date];
            return { name: date, users: cumulative };
        });
        
        setChartData(dynamicChartData);
        setStatsData({
          totalUsers: users.length,
          newUsersLastWeek: newUsersCount,
          activeUsers: activeUsersCount
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [currentUser]);

  const stats = [
    { label: 'Total Users', value: statsData.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'New Users (7d)', value: statsData.newUsersLastWeek, icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Active Status', value: statsData.activeUsers, icon: Activity, color: 'text-brand-crimson', bg: 'bg-brand-crimson/10' },
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            <h3 className="text-lg font-bold text-white">Growth Overview (14 Days)</h3>
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
                <p className="text-sm text-green-400 font-bold">Connected (Firebase)</p>
             </div>
             <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-xs text-[#888] uppercase tracking-widest mb-1">Hosting</p>
                <p className="text-sm text-green-400 font-bold">Static Server</p>
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

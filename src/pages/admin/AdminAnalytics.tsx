import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Clock, Globe } from 'lucide-react';

const GENRE_DATA = [
  { name: 'Action', value: 400 },
  { name: 'Comedy', value: 300 },
  { name: 'Drama', value: 300 },
  { name: 'Sci-Fi', value: 200 },
  { name: 'Horror', value: 150 },
];

const COLORS = ['#DC143C', '#D4AF37', '#22C55E', '#3B82F6', '#A855F7'];

const ACTIVITY_DATA = [
  { time: '00:00', hits: 400 },
  { time: '04:00', hits: 300 },
  { time: '08:00', hits: 600 },
  { time: '12:00', hits: 800 },
  { time: '16:00', hits: 1200 },
  { time: '20:00', hits: 900 },
];

export function AdminAnalytics() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white">System Analysis</h2>
          <p className="text-[#888] text-sm">Deep dive into user behavior and content performance</p>
        </div>
        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-gold" />
          <span className="text-xs font-bold text-white uppercase tracking-widest">Real-Time Sync Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Activity Line Chart */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Platform Traffic (24h)
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ACTIVITY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="time" stroke="#555" tick={{fill: '#888', fontSize: 10}} axisLine={false} />
                <YAxis stroke="#555" tick={{fill: '#888', fontSize: 10}} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
                <Line type="monotone" dataKey="hits" stroke="#D4AF37" strokeWidth={3} dot={{ r: 4, fill: '#D4AF37' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Genre Distribution Pie Chart */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            Genre Popularity
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={GENRE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {GENRE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {GENRE_DATA.map((g, i) => (
                <div key={g.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-[10px] uppercase text-white/60 font-bold">{g.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-brand-crimson/20 to-transparent border border-brand-crimson/20 rounded-2xl p-6">
          <p className="text-brand-crimson text-[10px] font-bold uppercase tracking-widest mb-1">Conversion Rate</p>
          <h4 className="text-2xl font-bold text-white font-serif">12.5%</h4>
          <p className="text-[#888] text-xs mt-2">+2.1% from last month</p>
        </div>
        <div className="bg-gradient-to-br from-brand-gold/20 to-transparent border border-brand-gold/20 rounded-2xl p-6">
          <p className="text-brand-gold text-[10px] font-bold uppercase tracking-widest mb-1">Avg. Watch Time</p>
          <h4 className="text-2xl font-bold text-white font-serif">45m 12s</h4>
          <p className="text-[#888] text-xs mt-2">-5m from yesterday</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-transparent border border-blue-500/20 rounded-2xl p-6">
          <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-1">Server Latency</p>
          <h4 className="text-2xl font-bold text-white font-serif">124ms</h4>
          <p className="text-[#888] text-xs mt-2">Optimal Performance</p>
        </div>
      </div>
    </div>
  );
}

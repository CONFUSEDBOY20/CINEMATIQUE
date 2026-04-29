import { useState } from 'react';
import { LogOut, LayoutDashboard, Film, Users, MessageSquare, BarChart, Settings, Bell } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { AdminUsers } from './admin/AdminUsers';
import { AdminReviews } from './admin/AdminReviews';
import { AdminAnalytics } from './admin/AdminAnalytics';
import { AdminSettings } from './admin/AdminSettings';

export function AdminDashboard() {
  const { user, logout } = useAppContext();
  const [activeTab, setActiveTab] = useState('overview');

  const navItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'users', icon: Users, label: 'Manage Users' },
    { id: 'reviews', icon: MessageSquare, label: 'Moderation' },
    { id: 'analytics', icon: BarChart, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <AdminOverview />;
      case 'users': return <AdminUsers />;
      case 'reviews': return <AdminReviews />;
      case 'analytics': return <AdminAnalytics />;
      case 'settings': return <AdminSettings />;
      default: return <AdminOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-[#070707] overflow-hidden text-gray-200">
      
      {/* Admin Sidebar */}
      <aside className="w-64 bg-brand-black border-r border-white/5 py-8 flex flex-col hidden md:flex">
        <div className="px-8 mb-12">
          <div className="flex items-center mb-1">
            <span className="text-xl font-bold tracking-tighter text-brand-gold font-serif">CINE<span className="text-white">MATIQUE</span></span>
          </div>
          <p className="text-[10px] text-brand-crimson uppercase tracking-[0.2em] font-bold">Admin Portal</p>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-full transition-all text-xs font-bold uppercase tracking-widest ${
                activeTab === item.id 
                  ? 'bg-brand-crimson text-white shadow-[0_0_15px_rgba(229,9,20,0.2)]' 
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-6 mt-auto">
          <div className="flex items-center gap-3 mb-6 p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="w-10 h-10 rounded-full border border-brand-crimson p-0.5">
               <div className="w-full h-full bg-brand-gray rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                 {user?.avatar || 'A'}
               </div>
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-xs uppercase tracking-widest font-bold text-white truncate">{user?.name}</p>
              <p className="text-[9px] text-brand-crimson uppercase tracking-[0.2em] font-bold">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-20 border-b border-white/5 bg-brand-black/80 backdrop-blur-xl flex items-center justify-between px-8 z-10">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">{activeTab.replace('-', ' ')}</h2>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-white/40 hover:text-brand-gold transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-crimson rounded-full"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </main>

    </div>
  );
}

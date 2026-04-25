import { useState } from 'react';
import { Home, Search, Bookmark, User as UserIcon, LogOut, Bell } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { HomePage } from './HomePage';
import { SearchPage } from './SearchPage';
import { WatchlistPage } from './WatchlistPage';
import { ProfilePage } from './ProfilePage';
import { MovieDetailPage } from './MovieDetailPage';
import { motion, AnimatePresence } from 'motion/react';

export function UserLayout() {
  const { user, logout, pageParams, navigate } = useAppContext();
  const [internalPage, setInternalPage] = useState('home');

  // Handle routing based on whether a movie is selected
  const isDetailView = pageParams?.movieId != null;

  const renderContent = () => {
    if (isDetailView) return <MovieDetailPage movieId={pageParams.movieId} />;
    
    switch (internalPage) {
      case 'home': return <HomePage />;
      case 'search': return <SearchPage />;
      case 'watchlist': return <WatchlistPage />;
      case 'profile': return <ProfilePage />;
      default: return <HomePage />;
    }
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Discover' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'watchlist', icon: Bookmark, label: 'Watchlist' },
    { id: 'profile', icon: UserIcon, label: 'Profile' },
  ];

  return (
    <div className="flex h-screen bg-brand-black overflow-hidden relative">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-brand-gray border-r border-white/5 py-8 px-4 h-full relative z-20">
        <div className="flex items-center gap-3 px-8 mb-16">
          <span className="text-2xl font-bold tracking-tighter text-brand-gold font-serif">CINE<span className="text-white">MATIQUE</span></span>
        </div>

        <nav className="flex-1 space-y-4 px-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setInternalPage(item.id); navigate('user'); }}
              className={`w-full flex items-center gap-4 py-2 transition-all text-xs uppercase tracking-[0.2em] font-medium ${
                !isDetailView && internalPage === item.id 
                  ? 'text-brand-gold border-b border-brand-gold/30 pb-2' 
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-brand-gold p-0.5 flex-shrink-0">
                <div className="w-full h-full bg-brand-gray rounded-full overflow-hidden flex items-center justify-center text-[10px] font-bold text-white">
                  {user?.avatar
                    ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                    : user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs uppercase tracking-widest font-bold truncate">{user?.name}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 text-xs uppercase tracking-widest font-medium text-white/40 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-brand-black/80 backdrop-blur-xl absolute top-0 w-full z-30 border-b border-white/5">
           <span className="text-xl font-bold tracking-tighter text-brand-gold font-serif">CINE<span className="text-white">MATIQUE</span></span>
           <div className="flex items-center gap-4">
             <button className="relative">
               <Bell className="w-5 h-5 text-gray-400" />
               <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-crimson rounded-full" />
             </button>
           </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar md:pt-0 pt-16 pb-20 md:pb-0 h-full relative" id="scroll-container">
          <AnimatePresence mode="wait">
            <motion.div
               key={isDetailView ? `detail-${pageParams.movieId}` : internalPage}
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               transition={{ duration: 0.3 }}
               className="min-h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-brand-gray/90 backdrop-blur-xl border-t border-white/10 flex items-center justify-around p-2 pb-[env(safe-area-inset-bottom,0.5rem)] z-30">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setInternalPage(item.id); navigate('user'); }}
            className={`flex flex-col items-center p-2 transition-colors ${
              !isDetailView && internalPage === item.id ? 'text-brand-gold' : 'text-gray-500'
            }`}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

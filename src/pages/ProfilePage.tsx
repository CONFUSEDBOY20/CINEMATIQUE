import { useState } from 'react';
import { Camera, Edit3, Settings, Star, Heart, Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export function ProfilePage() {
  const { user, watchlist } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen">
      <div className="relative mb-16 mt-8">
        <div className="h-48 rounded-3xl bg-black border border-white/10 overflow-hidden relative shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-crimson/20 to-brand-gold/10"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        </div>
        
        <div className="absolute -bottom-12 left-8 flex items-end gap-6">
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-brand-crimson flex items-center justify-center text-4xl md:text-5xl font-bold border border-white/20 shadow-[0_0_30px_rgba(229,9,20,0.4)] text-white" style={{borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%'}}>
              {user?.avatar || 'U'}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 md:w-10 md:h-10 bg-brand-gold rounded-full flex items-center justify-center text-brand-black border border-white/40 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
          <div className="mb-2">
            <h1 className="text-2xl md:text-4xl font-serif font-bold uppercase tracking-tighter">{user?.name}</h1>
            <p className="text-brand-gold text-[10px] uppercase font-bold tracking-[0.2em] md:text-xs">Member since {user?.joinDate}</p>
          </div>
        </div>
        
        <div className="absolute -bottom-6 right-4 md:right-8 flex gap-3">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-full hover:bg-white/10 transition-colors text-[10px] uppercase tracking-widest font-bold backdrop-blur-md"
          >
            <Edit3 className="w-4 h-4" />
            {isEditing ? 'Save Profile' : 'Edit Profile'}
          </button>
          <button className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors backdrop-blur-md">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 md:mt-24">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white/5 rounded-3xl p-8 border border-white/10 shadow-xl backdrop-blur-xl">
            <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-white/60 mb-6 flex items-center gap-4">
              Your Stats <span className="h-px flex-1 bg-white/10"></span>
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white/60">
                  <Heart className="w-4 h-4 text-brand-crimson" />
                  <span className="text-xs uppercase tracking-widest font-bold">Watchlist</span>
                </div>
                <span className="font-bold text-lg text-brand-gold font-serif">{watchlist.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white/60">
                  <Star className="w-4 h-4 text-brand-gold" />
                  <span className="text-xs uppercase tracking-widest font-bold">Reviews</span>
                </div>
                <span className="font-bold text-lg text-brand-gold font-serif">{user?.id === 'u1' ? '2' : '0'}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white/60">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-xs uppercase tracking-widest font-bold">Hours Watched</span>
                </div>
                <span className="font-bold text-lg text-brand-gold font-serif">142</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-3xl p-8 border border-white/10 shadow-xl backdrop-blur-xl">
            <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-white/60 mb-6 flex items-center gap-4">
              Genres <span className="h-px flex-1 bg-white/10"></span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {user?.genres?.map((g: string) => (
                <span key={g} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium">
                  {g}
                </span>
              ))}
              {isEditing && (
                <button className="px-3 py-1 border border-dashed border-white/20 rounded-full text-xs font-medium text-gray-400 hover:text-white">
                  + Add Genre
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          {isEditing ? (
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 shadow-xl backdrop-blur-xl">
              <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-white/60 mb-8 flex items-center gap-4">
                Edit Information <span className="h-px flex-1 bg-white/10"></span>
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-full py-4 px-6 text-white text-sm focus:outline-none focus:border-brand-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={user?.email}
                    disabled
                    className="w-full bg-black/50 border border-white/5 rounded-full py-4 px-6 text-white/40 cursor-not-allowed text-sm"
                  />
                  <p className="text-[10px] text-white/20 uppercase tracking-widest mt-2 ml-4">Email cannot be changed.</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-white/60 mb-8 flex items-center gap-4">
                Recent Activity <span className="h-px flex-1 bg-white/10"></span>
              </h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[1px] before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
                
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-brand-gold bg-black text-brand-gold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-brand-gold text-[10px] uppercase tracking-widest">Rating Added</div>
                      <time className="font-mono text-[9px] uppercase tracking-widest text-white/40">2 Days Ago</time>
                    </div>
                    <div className="text-sm text-white/80 leading-relaxed">You rated <span className="font-bold text-white uppercase tracking-wider font-serif">Dune: Part Two</span> 5 stars.</div>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-brand-crimson bg-black text-brand-crimson shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-[0_0_15px_rgba(229,9,20,0.3)]">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-brand-crimson text-[10px] uppercase tracking-widest">Added to Watchlist</div>
                      <time className="font-mono text-[9px] uppercase tracking-widest text-white/40">1 Week Ago</time>
                    </div>
                    <div className="text-sm text-white/80 leading-relaxed">You added <span className="font-bold text-white uppercase tracking-wider font-serif">Oppenheimer</span> to your watchlist.</div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

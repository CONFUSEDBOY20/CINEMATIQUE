import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Mail, Lock, User, Key, ArrowRight, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function AuthPage() {
  const { login, register } = useAppContext();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  
  const [email, setEmail] = useState('user@demo.com');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('');
  const [adminKey, setAdminKey] = useState('secret');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      register(name, email, password);
    } else if (isAdminMode) {
      login(email, password, true, adminKey);
    } else {
      login(email, password, false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel w-full max-w-md rounded-2xl p-8 relative z-10 shadow-2xl overflow-hidden"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full border border-brand-gold flex items-center justify-center mx-auto mb-4 p-1">
            <div className="w-full h-full bg-brand-black rounded-full flex items-center justify-center text-brand-gold">
               <Film className="w-6 h-6" />
            </div>
          </div>
          <div className="text-4xl font-bold tracking-tighter text-brand-gold font-serif mb-2">CINE<span className="text-white">MATIQUE</span></div>
          <p className="text-white/40 text-xs uppercase tracking-[0.3em] font-medium">Premium Experience</p>
        </div>

        {/* Tab Switcher */}
        {!isRegister && (
          <div className="flex bg-white/5 border border-white/10 p-1 rounded-full mb-8">
            <button
              type="button"
              onClick={() => setIsAdminMode(false)}
              className={`flex-1 py-2 text-xs uppercase tracking-widest font-bold rounded-full transition-all ${!isAdminMode ? 'bg-white text-brand-black shadow' : 'text-white/40 hover:text-white'}`}
            >
              Member
            </button>
            <button
              type="button"
              onClick={() => { setIsAdminMode(true); setIsRegister(false); setEmail('admin@demo.com'); }}
              className={`flex-1 py-2 text-xs uppercase tracking-widest font-bold rounded-full transition-all ${isAdminMode ? 'bg-brand-crimson text-white shadow' : 'text-white/40 hover:text-white'}`}
            >
              Admin
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode="popLayout">
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-2">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe" 
                      className="w-full bg-black/50 border border-white/10 rounded-full pl-12 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-gold transition-colors" 
                      required={isRegister}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-2">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com" 
                className="w-full bg-black/50 border border-white/10 rounded-full pl-12 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-gold transition-colors" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-2">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-black/50 border border-white/10 rounded-full pl-12 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-gold transition-colors" 
              />
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {isAdminMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-2 mt-5">Secret Admin Key</label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input 
                    type="password" 
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="Enter secret key (demo: secret)" 
                    className="w-full bg-black/50 border border-white/10 rounded-full pl-12 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-crimson transition-colors" 
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            className={`w-full py-4 rounded-full text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 mt-6 ${isAdminMode ? 'bg-brand-crimson hover:bg-red-700 text-white shadow-[0_0_20px_rgba(229,9,20,0.3)]' : 'bg-brand-gold text-brand-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.3)]'}`}
          >
            {isRegister ? 'Create Account' : 'Sign In'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {!isAdminMode && (
          <div className="mt-8 text-center text-[10px] uppercase tracking-widest text-white/40 font-bold">
            {isRegister ? (
              <>Already have an account? <button onClick={() => setIsRegister(false)} className="text-brand-gold hover:text-white transition-colors ml-1">Sign in</button></>
            ) : (
              <>Don't have an account? <button onClick={() => setIsRegister(true)} className="text-brand-gold hover:text-white transition-colors ml-1">Register now</button></>
            )}
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t border-white/5 text-center text-[10px] text-white/20 uppercase tracking-widest">
          <p>Demo credentials pre-filled.</p>
        </div>
      </motion.div>
    </div>
  );
}

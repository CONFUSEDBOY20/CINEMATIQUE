import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    // Phase timeline: logo animates in → hold → exit
    const holdTimer  = setTimeout(() => setPhase('hold'), 800);
    const exitTimer  = setTimeout(() => setPhase('out'),  2200);
    const doneTimer  = setTimeout(() => onComplete(),     2900);
    return () => { clearTimeout(holdTimer); clearTimeout(exitTimer); clearTimeout(doneTimer); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'out' && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-brand-black flex items-center justify-center overflow-hidden"
        >
          {/* ── Radial glow ────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: phase === 'hold' ? 0.15 : 0, scale: 1.4 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)' }}
          />

          {/* ── Horizontal scan line ───────────────────────────────────── */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0.8 }}
            animate={{ scaleX: [0, 1, 1, 0], opacity: [0.8, 0.6, 0.6, 0] }}
            transition={{ duration: 1.4, times: [0, 0.3, 0.7, 1], ease: 'easeInOut', delay: 0.1 }}
            className="absolute h-px w-64 bg-brand-gold origin-left"
            style={{ boxShadow: '0 0 20px 2px #FFD700' }}
          />

          {/* ── Logo ───────────────────────────────────────────────────── */}
          <div className="relative flex flex-col items-center select-none">

            {/* Film frame lines (top) */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
              className="w-48 h-px bg-gradient-to-r from-transparent via-brand-gold to-transparent mb-6 origin-center"
            />

            {/* CINE */}
            <div className="flex items-baseline gap-0 overflow-hidden">
              {'CINE'.split('').map((char, i) => (
                <motion.span
                  key={`cine-${i}`}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  className="text-5xl md:text-7xl font-serif font-bold text-brand-gold leading-none tracking-tight"
                >
                  {char}
                </motion.span>
              ))}

              {/* MATIQUE */}
              {'MATIQUE'.split('').map((char, i) => (
                <motion.span
                  key={`matique-${i}`}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.48 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  className="text-5xl md:text-7xl font-serif font-bold text-white leading-none tracking-tight"
                >
                  {char}
                </motion.span>
              ))}
            </div>

            {/* Shimmer overlay on the logo text */}
            <motion.div
              initial={{ x: '-120%' }}
              animate={{ x: '220%' }}
              transition={{ duration: 1.0, delay: 0.8, ease: 'easeInOut' }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 30%, rgba(255,215,0,0.35) 50%, transparent 70%)',
              }}
            />

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.6em' }}
              animate={{ opacity: 0.4, letterSpacing: '0.35em' }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="text-white text-[9px] uppercase font-bold mt-4 tracking-[0.35em]"
            >
              Premium Cinema Experience
            </motion.p>

            {/* Film frame lines (bottom) */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
              className="w-48 h-px bg-gradient-to-r from-transparent via-brand-gold to-transparent mt-6 origin-center"
            />

            {/* Loading dots */}
            <div className="flex items-center gap-1.5 mt-8">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2], scaleY: [0.6, 1, 0.6] }}
                  transition={{ duration: 0.9, delay: 1.0 + i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-1 h-3 bg-brand-gold rounded-full"
                />
              ))}
            </div>
          </div>

          {/* ── Corner film-strip dots ──────────────────────────────────── */}
          {[
            'top-4 left-4', 'top-4 right-4',
            'bottom-4 left-4', 'bottom-4 right-4'
          ].map((pos, i) => (
            <motion.div
              key={pos}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.2, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
              className={`absolute ${pos} w-2 h-2 rounded-full border border-brand-gold`}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, useState, useCallback } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { SplashScreen } from './components/SplashScreen';

// ── Lazy-loaded pages (code-split into separate chunks) ──────────────────────
const AuthPage       = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const UserLayout     = lazy(() => import('./pages/UserLayout').then(m => ({ default: m.UserLayout })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

// ── Skeleton while a lazy chunk downloads ───────────────────────────────────
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-brand-gold border-t-transparent animate-spin" />
    </div>
  );
}

function Router() {
  const { page, user } = useAppContext();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={page === 'auth' ? 'auth' : user?.role === 'admin' ? 'admin' : 'user'}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className="min-h-screen flex flex-col"
      >
        <Suspense fallback={<PageSkeleton />}>
          {page === 'auth'                            && <AuthPage />}
          {user?.role === 'admin' && page !== 'auth'  && <AdminDashboard />}
          {user?.role !== 'admin' && page !== 'auth'  && <UserLayout />}
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  // Show splash only once per browser session
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem('cinematique_splash') === 'done'
  );

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem('cinematique_splash', 'done');
    setSplashDone(true);
  }, []);

  return (
    <AppProvider>
      {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
      {splashDone  && <Router />}
    </AppProvider>
  );
}

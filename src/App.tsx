/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppProvider, useAppContext } from './context/AppContext';
import { AuthPage } from './pages/AuthPage';
import { UserLayout } from './pages/UserLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { motion, AnimatePresence } from 'motion/react';

function Router() {
  const { page, user } = useAppContext();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={page === 'auth' ? 'auth' : user?.role === 'admin' ? 'admin' : 'user'}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen flex flex-col"
      >
        {page === 'auth' && <AuthPage />}
        {user?.role === 'admin' && page !== 'auth' && <AdminDashboard />}
        {user?.role === 'user' && page !== 'auth' && <UserLayout />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}

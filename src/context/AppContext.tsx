import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { mockAdmins } from "../constants";

type User = any;
type Movie = any;

interface AppState {
  user: User | null;
  page: string;
  movies: Movie[];
  watchlist: string[];
  searchQuery: string;
  authLoading: boolean;
}

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AppContextType extends AppState {
  login: (email: string, pass: string, isAdmin?: boolean, adminKey?: string) => Promise<AuthResult>;
  register: (name: string, email: string, pass: string) => Promise<AuthResult>;
  logout: () => void;
  navigate: (page: string, params?: any) => void;
  pageParams: any;
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  setSearchQuery: (query: string) => void;
  registerMode: boolean;
  setRegisterMode: (val: boolean) => void;
  updateProfile: (fields: Partial<{ name: string; bio: string; avatar: string; coverPhoto: string; genres: string[] }>) => Promise<AuthResult>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>;
}

const AppContext = createContext<AppContextType | null>(null);

const TOKEN_KEY = 'cinematique_token';
const USER_KEY  = 'cinematique_user';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<string>("auth");
  const [pageParams, setPageParams] = useState<any>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true); // starts true while we check stored session
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [registerMode, setRegisterMode] = useState(false);

  // ── Restore session from localStorage on mount ──────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (token && storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUser(u);
        setWatchlist(u.watchlist || []);
        setPage(u.role === 'admin' ? 'admin_dashboard' : 'home');

        // Re-validate token in background
        fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } })
          .then(r => {
            if (!r.ok) {
              // Token expired or invalid — clear session
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(USER_KEY);
              setUser(null);
              setPage('auth');
            } else {
              return r.json();
            }
          })
          .then(data => {
            if (data?.user) {
              setUser(data.user);
              localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            }
          })
          .catch(() => {/* offline — keep cached session */});
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setAuthLoading(false);
  }, []);

  // ── Load movies ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const cached = localStorage.getItem('cinematique_movies_cache_v2');
    if (cached) {
      setMovies(JSON.parse(cached));
      setMoviesLoading(false);
    } else {
      fetch('/api/movies')
        .then(res => {
          if (!res.ok) throw new Error("API failed");
          return res.json();
        })
        .catch(() => fetch('/movies.json').then(r => r.json()))
        .then(data => {
          localStorage.setItem('cinematique_movies_cache_v2', JSON.stringify(data));
          setMovies(data);
          setMoviesLoading(false);
        })
        .catch(err => {
          console.error("Failed to load movies:", err);
          setMoviesLoading(false);
        });
    }
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(async (
    email: string,
    pass: string,
    isAdmin = false,
    adminKey = ""
  ): Promise<AuthResult> => {
    // Legacy mock-admin key path (kept as fallback)
    if (isAdmin && adminKey && adminKey !== "") {
      if (adminKey === "secret") {
        const admin = mockAdmins[0];
        setUser(admin);
        setPage("admin_dashboard");
        return { ok: true };
      }
      return { ok: false, error: "Invalid admin key" };
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        setUser(data.user);
        setWatchlist(data.user.watchlist || []);
        // Route based on role from DB
        setPage(data.user.role === 'admin' ? 'admin_dashboard' : 'home');
        return { ok: true };
      } else {
        return { ok: false, error: data.error || "Login failed" };
      }
    } catch {
      return { ok: false, error: "Cannot connect to server. Please try again." };
    }
  }, []);

  // ── Register ────────────────────────────────────────────────────────────────
  const register = useCallback(async (
    name: string,
    email: string,
    pass: string
  ): Promise<AuthResult> => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        setUser(data.user);
        setWatchlist([]);
        setPage("home");
        return { ok: true };
      } else {
        return { ok: false, error: data.error || "Registration failed" };
      }
    } catch {
      return { ok: false, error: "Cannot connect to server. Please try again." };
    }
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setWatchlist([]);
    setPage("auth");
  }, []);

  const navigate = useCallback((newPage: string, params?: any) => {
    setPage(newPage);
    setPageParams(params || null);
  }, []);

  const addToWatchlist = useCallback((id: string) => {
    setWatchlist(prev => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const removeFromWatchlist = useCallback((id: string) => {
    setWatchlist(prev => prev.filter(w => w !== id));
  }, []);

  // ── Update Profile ──────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (
    fields: Partial<{ name: string; bio: string; avatar: string; coverPhoto: string; genres: string[] }>
  ): Promise<AuthResult> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return { ok: false, error: 'Not authenticated' };
    try {
      const response = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(fields)
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return { ok: true };
      }
      return { ok: false, error: data.error || 'Update failed' };
    } catch {
      return { ok: false, error: 'Cannot connect to server.' };
    }
  }, []);

  // ── Change Password ─────────────────────────────────────────────────────────
  const changePassword = useCallback(async (
    currentPassword: string,
    newPassword: string
  ): Promise<AuthResult> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return { ok: false, error: 'Not authenticated' };
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await response.json();
      if (response.ok) return { ok: true };
      return { ok: false, error: data.error || 'Password change failed' };
    } catch {
      return { ok: false, error: 'Cannot connect to server.' };
    }
  }, []);

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (authLoading || moviesLoading) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
        <p className="text-white/30 text-xs uppercase tracking-[0.3em]">Loading Cinematique…</p>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      user, page, movies, watchlist, searchQuery, authLoading,
      login, register, logout, navigate, pageParams,
      addToWatchlist, removeFromWatchlist, setSearchQuery,
      registerMode, setRegisterMode,
      updateProfile, changePassword
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};

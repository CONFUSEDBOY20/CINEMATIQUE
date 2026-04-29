import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "../lib/supabase";

type User = any;
type Movie = any;

interface AppState {
  user: User | null;
  page: string;
  movies: Movie[];
  watchlist: string[];
  searchQuery: string;
  authLoading: boolean;
  moviesLoading: boolean;
  library: 'hollywood' | 'bollywood';
  accessToken: string | null;
}

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AppContextType extends AppState {
  login: (email: string, pass: string) => Promise<AuthResult>;
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
  setLibrary: (lib: 'hollywood' | 'bollywood') => void;
  forgotPassword: (email: string) => Promise<AuthResult>;
  resetPassword: (token: string, newPass: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<string>("home");
  const [pageParams, setPageParams] = useState<any>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [registerMode, setRegisterMode] = useState(false);
  const [library, setLibrary] = useState<'hollywood' | 'bollywood'>('hollywood');
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async (userId: string, token: string) => {
    try {
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const { user: profile } = await res.json();
        setUser(profile);
        setAccessToken(token);
        setWatchlist(profile.watchlist || []);
        if (profile.role === 'admin' && (page === 'home' || page === 'auth')) {
          setPage('admin_dashboard');
        }
      }
    } catch (err) {
      console.error("Profile sync error:", err);
    } finally {
      setAuthLoading(false);
    }
  }, [page]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchUserProfile(session.user.id, session.access_token);
      else setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserProfile(session.user.id, session.access_token);
      } else {
        setUser(null);
        setAccessToken(null);
        setPage('home');
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const signInWithGoogle = async (): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  };

  const forgotPassword = async (email: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    return { ok: !error, error: error?.message };
  };

  const resetPassword = async (_token: string, newPass: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.updateUser({ password: newPass });
    return { ok: !error, error: error?.message };
  };

  const updateProfile = async (fields: any): Promise<AuthResult> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { ok: false, error: 'Not authenticated' };

    try {
      const res = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}` 
        },
        body: JSON.stringify(fields)
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        return { ok: true };
      }
      return { ok: false, error: data.error };
    } catch {
      return { ok: false, error: 'Network error' };
    }
  };

  const changePassword = async (curr: string, next: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.updateUser({ password: next });
    return { ok: !error, error: error?.message };
  };

  const navigate = useCallback((p: string, params?: any) => {
    setPage(p);
    setPageParams(params || null);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setMoviesLoading(true);
    fetch('/api/movies')
      .then(r => r.json())
      .then(data => {
        setMovies(data);
        setMoviesLoading(false);
      })
      .catch(() => setMoviesLoading(false));
  }, []);

  const addToWatchlist = useCallback((id: string) => {
    setWatchlist(prev => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const removeFromWatchlist = useCallback((id: string) => {
    setWatchlist(prev => prev.filter(mid => mid !== id));
  }, []);

  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-brand-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      user, page, movies, watchlist, searchQuery, authLoading, moviesLoading,
      login, register, logout, navigate, pageParams,
      addToWatchlist, removeFromWatchlist, setSearchQuery,
      registerMode, setRegisterMode,
      updateProfile, changePassword,
      library, setLibrary,
      forgotPassword, resetPassword, signInWithGoogle,
      accessToken
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

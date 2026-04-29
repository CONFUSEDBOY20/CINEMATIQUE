import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { auth, db, googleProvider } from "../lib/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, sendPasswordResetEmail, updatePassword } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

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
  updateProfile: (fields: Partial<{ name: string; bio: string; age: string; country: string; genres: string[] }>) => Promise<AuthResult>;
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

  const fetchUserProfile = useCallback(async (userId: string, token?: string) => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const profile = docSnap.data();
        if (profile.status === 'banned') {
          await signOut(auth);
          setUser(null);
          setAccessToken(null);
          setPage('auth');
          alert("Your account has been restricted by an administrator.");
          return;
        }
        setUser({ id: userId, ...profile });
        setAccessToken(token || null);
        setWatchlist(profile.watchlist || []);
        if (profile.role === 'admin' && (page === 'home' || page === 'auth')) {
          setPage('admin_dashboard');
        }
      } else {
        // Fallback user state if profile not found
        setUser({ id: userId });
      }
    } catch (err) {
      console.error("Profile sync error:", err);
    } finally {
      setAuthLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        fetchUserProfile(firebaseUser.uid, token);
      } else {
        setUser(null);
        setAccessToken(null);
        setPage(prev => prev === 'auth' ? 'auth' : 'home');
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { ok: true };
    } catch (error: any) {
      return { ok: false, error: error.message };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role: 'user',
        status: 'active',
        watchlist: [],
        createdAt: new Date().toISOString()
      });
      return { ok: true };
    } catch (error: any) {
      return { ok: false, error: error.message };
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const signInWithGoogle = async (): Promise<AuthResult> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          name: user.displayName,
          email: user.email,
          role: 'user',
          status: 'active',
          watchlist: [],
          createdAt: new Date().toISOString()
        });
      }
      return { ok: true };
    } catch (error: any) {
      return { ok: false, error: error.message };
    }
  };

  const forgotPassword = async (email: string): Promise<AuthResult> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { ok: true };
    } catch (error: any) {
      return { ok: false, error: error.message };
    }
  };

  const resetPassword = async (_token: string, newPass: string): Promise<AuthResult> => {
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPass);
        return { ok: true };
      }
      return { ok: false, error: "Not logged in" };
    } catch (error: any) {
      return { ok: false, error: error.message };
    }
  };

  const updateProfile = async (fields: any): Promise<AuthResult> => {
    if (!auth.currentUser) return { ok: false, error: 'Not authenticated' };
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), fields);
      setUser(prev => prev ? { ...prev, ...fields } : null);
      return { ok: true };
    } catch (error: any) {
      return { ok: false, error: error.message };
    }
  };

  const changePassword = async (curr: string, next: string): Promise<AuthResult> => {
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, next);
        return { ok: true };
      }
      return { ok: false, error: "Not logged in" };
    } catch (error: any) {
      return { ok: false, error: error.message };
    }
  };

  const navigate = useCallback((p: string, params?: any) => {
    setPage(p);
    setPageParams(params || null);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setMoviesLoading(true);
    fetch('/movies.json')
      .then(r => r.json())
      .then(data => {
        setMovies(data);
        setMoviesLoading(false);
      })
      .catch(() => setMoviesLoading(false));
  }, []);

  const updateWatchlistInDB = async (newWatchlist: string[]) => {
    if (auth.currentUser) {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        watchlist: newWatchlist
      });
    }
  };

  const addToWatchlist = useCallback((id: string) => {
    setWatchlist(prev => {
      if (prev.includes(id)) return prev;
      const newList = [...prev, id];
      updateWatchlistInDB(newList);
      return newList;
    });
  }, []);

  const removeFromWatchlist = useCallback((id: string) => {
    setWatchlist(prev => {
      const newList = prev.filter(mid => mid !== id);
      updateWatchlistInDB(newList);
      return newList;
    });
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

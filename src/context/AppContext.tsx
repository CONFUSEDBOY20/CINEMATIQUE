import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import { mockMovies, mockUsers, mockAdmins, mockReviews } from "../constants";

type User = any;
type Movie = any;
type Review = any;

interface AppState {
  user: User | null;
  page: string;
  movies: Movie[];
  watchlist: string[];
  searchQuery: string;
}

interface AppContextType extends AppState {
  login: (email: string, pass: string, isAdmin?: boolean, adminKey?: string) => void;
  logout: () => void;
  navigate: (page: string, params?: any) => void;
  pageParams: any;
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  setSearchQuery: (query: string) => void;
  registerMode: boolean;
  setRegisterMode: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<string>("auth");
  const [pageParams, setPageParams] = useState<any>(null);
  const [movies] = useState<Movie[]>(mockMovies);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [registerMode, setRegisterMode] = useState(false);

  const login = (email: string, pass: string, isAdmin = false, adminKey = "") => {
    // Mock login
    if (isAdmin) {
      if (adminKey === "secret") {
        setUser(mockAdmins[0]);
        setPage("admin_dashboard");
      } else {
        alert("Invalid admin key");
      }
    } else {
      const u = mockUsers.find((u) => u.email === email);
      if (u) {
        setUser(u);
        setWatchlist(u.watchlist || []);
        setPage("home");
      } else {
        // Fallback for demo
        setUser(mockUsers[0]);
        setWatchlist(mockUsers[0].watchlist || []);
        setPage("home");
      }
    }
  };

  const logout = () => {
    setUser(null);
    setPage("auth");
  };

  const navigate = (newPage: string, params?: any) => {
    setPage(newPage);
    setPageParams(params || null);
  };

  const addToWatchlist = (id: string) => {
    if (!watchlist.includes(id)) {
      setWatchlist([...watchlist, id]);
    }
  };

  const removeFromWatchlist = (id: string) => {
    setWatchlist(watchlist.filter((w) => w !== id));
  };


  return (
    <AppContext.Provider value={{
      user, page, movies, watchlist, searchQuery,
      login, logout, navigate, pageParams,
      addToWatchlist, removeFromWatchlist, setSearchQuery,
      registerMode, setRegisterMode
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

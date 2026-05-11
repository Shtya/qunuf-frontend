'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/libs/axios';
import type { Role } from '@/types/global';
import { User } from '@/types/dashboard/user';
import { UserRole } from '@/constants/user';


interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loadingUser: boolean;
  LoggingOut: boolean;
  setCurrentUser: (input: string | User) => void;
  refetchUser: () => Promise<User | null>;
  login: (credentials: LoginCredentials) => Promise<{ accessToken: string; refreshToken: string; user: User }>;
  logout: (direct?: string) => Promise<void>;
  updateTokens: (tokens: { accessToken?: string; refreshToken?: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchUser = async (): Promise<User | null> => {
    const access = localStorage.getItem('accessToken');
    if (!access) { setLoadingUser(false); return; }

    try {
      setLoadingUser(true);
      const res = await api.get('/auth/me');
      setUser(res.data);
      return res.data;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const setCurrentUser = (input: string | User) => {
    try {
      const parsed: User = typeof input === 'string' ? JSON.parse(input) : input;
      setUser(parsed);
    } catch (err) {
      console.error('Invalid user input:', err);
      setUser(null);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      const { accessToken, refreshToken, user } = res.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);

      return { accessToken, refreshToken, user };
    } catch (err) {
      throw err;
    }
  };


  const [LoggingOut, setLoggingOut] = useState(false); // loading state

  const logout = async (direct = '/') => {
    try {
      setLoggingOut(true);

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      setUser(null);
      window.location.href = direct || '/';
    } catch {
      // silently ignore — user is logged out locally regardless
    } finally {
      setLoggingOut(false);
    }
  };
  const updateTokens = ({ accessToken, refreshToken }: { accessToken?: string; refreshToken?: string }) => {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  };

  const role: UserRole | null = user?.role || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loadingUser,
        LoggingOut,
        setCurrentUser,
        refetchUser: fetchUser,
        logout,
        login,
        updateTokens,
      }
      }
    >
      {children}
    </AuthContext.Provider>
  );
}



export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}


'use client';

import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';

import {login as apiLogin, register as apiRegister, getCurrentUser} from './api-client';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

type AuthUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  apiKeyLastRotatedAt: string | null;
  hasApiKey: boolean;
};

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string | null) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'escalads/token';

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('idle');

  const normalizeUser = useCallback((user: Partial<AuthUser> | null | undefined) => {
    if (!user) return null;
    return {
      id: user.id!,
      email: user.email!,
      fullName: user.fullName ?? null,
      role: user.role ?? 'MEMBER',
      apiKeyLastRotatedAt: user.apiKeyLastRotatedAt ?? null,
      hasApiKey: Boolean(user.hasApiKey)
    } satisfies AuthUser;
  }, []);

  useEffect(() => {
    const existingToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
    if (!existingToken) {
      setStatus('unauthenticated');
      return;
    }

    setStatus('loading');
    getCurrentUser(existingToken)
      .then((current) => {
        setUser(normalizeUser(current));
        setToken(existingToken);
        setStatus('authenticated');
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser(null);
        setToken(null);
        setStatus('unauthenticated');
      });
  }, []);

  const handleLogin = useCallback(async (email: string, password: string) => {
    setStatus('loading');
    try {
      const result = await apiLogin(email, password);
      setToken(result.token);
      setUser(normalizeUser(result.user as AuthUser));
      localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
      setStatus('authenticated');
    } catch (error) {
      setStatus('unauthenticated');
      throw error;
    }
  }, []);

  const handleRegister = useCallback(
    async (email: string, password: string, fullName?: string | null) => {
      setStatus('loading');
      try {
        await apiRegister(email, password, fullName);
        await handleLogin(email, password);
      } catch (error) {
        setStatus('unauthenticated');
        throw error;
      }
    },
    [handleLogin]
  );

  const handleLogout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      status,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout
    }),
    [handleLogin, handleLogout, handleRegister, normalizeUser, status, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

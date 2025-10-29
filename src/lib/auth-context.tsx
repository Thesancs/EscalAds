'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { SupabaseAuthUser, OfferRole } from '@/lib/supabase/types';
import type { AuthSignInInput, AuthSignUpInput } from '@/lib/validators/offers';

interface AuthContextValue {
  user: SupabaseAuthUser | null;
  role: OfferRole | null;
  loading: boolean;
  signIn: (input: AuthSignInInput) => Promise<void>;
  signUp: (input: AuthSignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchSession(): Promise<SupabaseAuthUser | null> {
  const response = await fetch('/api/auth/session', { credentials: 'include' });
  if (!response.ok) {
    return null;
  }
  const data = (await response.json()) as { user: SupabaseAuthUser | null };
  return data.user ?? null;
}

async function postAuth(path: string, body: Record<string, unknown>) {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Não foi possível completar a ação.');
  }

  return (await response.json()) as { user: SupabaseAuthUser | null };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const nextUser = await fetchSession();
      setUser(nextUser);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback(async (input: AuthSignInInput) => {
    const { user: nextUser } = await postAuth('/api/auth/login', input);
    setUser(nextUser);
  }, []);

  const signUp = useCallback(async (input: AuthSignUpInput) => {
    const { user: nextUser } = await postAuth('/api/auth/signup', input);
    setUser(nextUser);
  }, []);

  const signOut = useCallback(async () => {
    await postAuth('/api/auth/logout', {});
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    role: user?.role ?? null,
    loading,
    signIn,
    signUp,
    signOut,
    refresh,
  }), [user, loading, signIn, signUp, signOut, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}

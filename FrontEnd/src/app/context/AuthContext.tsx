"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin, register as apiRegister, getMe } from "../services/authService";

type User = {
  id: number;
  name?: string;
  email: string;
  role: string;
  avatarUrl?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, opts?: { redirectTo?: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string }, opts?: { redirectTo?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (u: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser]   = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const submitLockRef = React.useRef(false);

  const withLock = async (fn: () => Promise<void>) => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    try { await fn(); } finally { submitLockRef.current = false; }
  };

  // Restaura sessão só se existir token salvo
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!stored) { setLoading(false); return; }
    setToken(stored);
    getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Sync logout across tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const bc = new BroadcastChannel('mindcare-auth');
    bc.onmessage = (ev) => {
      if (ev.data === 'logout') {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    };
    return () => bc.close();
  }, []);

  const updateUser = (u: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return (u as User) ?? null;
      return { ...prev, ...u } as User;
    });
  };

  const login = async (email: string, password: string, opts?: { redirectTo?: string }) =>
    withLock(async () => {
      setLoading(true);
      setError(null);
    try {
      const { access_token } = await apiLogin(email, password);
      localStorage.setItem("token", access_token);
      setToken(access_token);

      const me = await getMe();
      setUser(me);

      if (opts?.redirectTo) router.push(opts.redirectTo);
    } catch {
      setError("Credenciais inválidas");
    } finally {
      setLoading(false);
    }
    });

  const register = async (data: { name: string; email: string; password: string }, opts?: { redirectTo?: string }) =>
    withLock(async () => {
    setLoading(true);
    setError(null);
    try {
      await apiRegister(data); // 201 se ok, 409 se e-mail já existe
      const { access_token } = await apiLogin(data.email, data.password);
      localStorage.setItem("token", access_token);
      setToken(access_token);

      const me = await getMe();
      setUser(me);

      if (opts?.redirectTo) router.push(opts.redirectTo);
    } catch (e: any) {
      if (e?.response?.status === 409) setError("E-mail já cadastrado");
      else setError("Falha no cadastro");
    } finally {
      setLoading(false);
    }
  });

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    setError(null);
    if (typeof window !== 'undefined') {
      try { const bc = new BroadcastChannel('mindcare-auth'); bc.postMessage('logout'); bc.close(); } catch {}
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return ctx;
}

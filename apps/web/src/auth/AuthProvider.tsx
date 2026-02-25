import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth";
import type { RegisterPayload, User } from "../types/auth";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshMe() {
    const u = await authApi.me();
    setUser(u);
  }

  async function login(email: string, password: string) {
    const res = await authApi.login(email, password);
    localStorage.setItem("access_token", res.token);
    if (res.user) {
      setUser(res.user);
    } else {
      await refreshMe();
    }
  }

  async function register(payload: RegisterPayload) {
    const res: any = await authApi.register(payload);

    // Jika API register return token -> auto login
    if (res?.token) {
      localStorage.setItem("access_token", res.token);
      if (res.user) setUser(res.user);
      else await refreshMe();
      return;
    }

    // Kalau register hanya create user (tanpa token), login manual
    await login(payload.email, payload.password);
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors
    } finally {
      localStorage.removeItem("access_token");
      setUser(null);
    }
  }

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        await refreshMe();
      } catch {
        localStorage.removeItem("access_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout, refreshMe }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

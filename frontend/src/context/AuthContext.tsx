import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, clearToken, getToken, setToken, type Me } from "@/src/lib/api";

type Ctx = {
  me: Me | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<Me | null>;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (): Promise<Me | null> => {
    const token = await getToken();
    if (!token) {
      setMe(null);
      return null;
    }
    try {
      const u = await api<Me>("/users/me");
      setMe(u);
      return u;
    } catch {
      await clearToken();
      setMe(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    const r = await api<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    await setToken(r.access_token);
    await refresh();
  }, [refresh]);

  const signUp = useCallback(async (email: string, password: string) => {
    const r = await api<{ access_token: string }>("/auth/register", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    await setToken(r.access_token);
    await refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    await clearToken();
    setMe(null);
  }, []);

  return (
    <AuthContext.Provider value={{ me, loading, signIn, signUp, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

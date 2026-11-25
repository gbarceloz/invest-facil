"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { googleLoginRequest, loginRequest, logoutRequest, mfaVerifyRequest, restoreSession } from "./api";
import type { LoginResponse, User } from "./types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ mfaRequired: boolean; challengeToken?: string }>;
  googleLogin: (credential: string) => Promise<void>;
  verifyMfa: (challengeToken: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    restoreSession()
      .then((restored) => {
        if (active) setUser(restored);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const onExpired = () => setUser(null);
    window.addEventListener("auth:expired", onExpired);
    return () => {
      active = false;
      window.removeEventListener("auth:expired", onExpired);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data: LoginResponse = await loginRequest(email, password);
    if (data.mfaRequired) {
      return { mfaRequired: true, challengeToken: data.challengeToken ?? undefined };
    }
    setUser(data.user);
    return { mfaRequired: false };
  }, []);

  const googleLogin = useCallback(async (credential: string) => {
    const data = await googleLoginRequest(credential);
    setUser(data.user);
  }, []);

  const verifyMfa = useCallback(async (challengeToken: string, code: string) => {
    const data = await mfaVerifyRequest(challengeToken, code);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const { api } = await import("./api");
    const current = await api.get<User>("/api/v1/users/me");
    setUser(current);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, googleLogin, verifyMfa, logout, refreshUser, setUser }),
    [user, loading, login, googleLogin, verifyMfa, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}

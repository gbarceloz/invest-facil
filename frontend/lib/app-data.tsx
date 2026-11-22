"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { useAuth } from "./auth";
import type { GamificationSummary, ProgressSummary } from "./types";

interface AppDataContextValue {
  gamification: GamificationSummary | null;
  progress: ProgressSummary | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [gamification, setGamification] = useState<GamificationSummary | null>(null);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const [g, p] = await Promise.all([
        api.get<GamificationSummary>("/api/v1/gamification/summary"),
        api.get<ProgressSummary>("/api/v1/progress/summary"),
      ]);
      setGamification(g);
      setProgress(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar seus dados.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      void reload();
    }
  }, [user, reload]);

  const value = useMemo(
    () => ({ gamification, progress, loading, error, reload }),
    [gamification, progress, loading, error, reload],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData deve ser usado dentro de AppDataProvider");
  return context;
}

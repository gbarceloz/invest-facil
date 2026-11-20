"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  ChevronRight,
  Flame,
  LineChart,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useAppData } from "@/lib/app-data";
import { api } from "@/lib/api";
import { cn, dateLong, dayCount, money, plural, signedPercent } from "@/lib/format";
import type { Category, MarketResponse } from "@/lib/types";
import { LevelRing, ProgressBar } from "@/components/progress";
import { Disclaimer, Skeleton } from "@/components/ui";
import { Stat } from "@/components/page";

export default function DashboardPage() {
  const { user } = useAuth();
  const { gamification, progress, loading } = useAppData();
  const [categories, setCategories] = useState<Category[]>([]);
  const [market, setMarket] = useState<MarketResponse | null>(null);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(dateLong());
  }, []);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      api.get<Category[]>("/api/v1/content/categories"),
      api.get<MarketResponse>("/api/v1/market/assets"),
    ]).then(([categoriesResult, marketResult]) => {
      if (!active) return;
      if (categoriesResult.status === "fulfilled") setCategories(categoriesResult.value);
      if (marketResult.status === "fulfilled") {
        setMarket(marketResult.value);
        setMarketError(null);
      } else {
        setMarketError("Cotações indisponíveis no momento.");
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const firstName = user?.name?.split(" ")[0] ?? "investidor";
  const next = progress?.nextLesson;
  const categoryProgress = progress?.categories ?? [];
  const trackCount = categories.length || categoryProgress.length;
  const totalModules =
    categories.length > 0
      ? categories.reduce((sum, category) => sum + category.modules.length, 0)
      : trackCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{today || "—"}</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Olá, {firstName}. Continue sua jornada.
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="pill border-accent/25 bg-accent/10 text-accent">
            <Flame className="h-3.5 w-3.5" /> {dayCount(gamification?.currentStreak ?? 0)}
          </span>
          <span className="pill">Melhor sequência: {gamification?.bestStreak ?? 0}</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/15 via-ink-800 to-ink-800 p-6 sm:p-7">
          <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-ink-950/40 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent">
              <Sparkles className="h-3 w-3" /> Próxima missão
            </span>
            {loading ? (
              <div className="mt-5 space-y-3">
                <Skeleton className="h-7 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-40" />
              </div>
            ) : next ? (
              <>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  {next.categoryName} • {next.moduleTitle}
                </p>
                <h2 className="mt-2 max-w-lg text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {next.title}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                  <span>Iniciante</span>
                  <span className="h-1 w-1 rounded-full bg-neutral-600" />
                  <span>{next.estimatedMin} min</span>
                  <span className="h-1 w-1 rounded-full bg-neutral-600" />
                  <span className="font-bold text-accent">+50 XP</span>
                </div>
                <Link href={`/app/aprender/aula/${next.slug}`} className="btn-primary mt-6">
                  Continuar missão <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <>
                <h2 className="mt-5 text-2xl font-extrabold">Você concluiu todas as aulas disponíveis.</h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-neutral-400">
                  Revise um quiz, salve uma simulação ou explore os artigos da biblioteca para
                  continuar praticando.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link href="/app/simulador" className="btn-primary">
                    Abrir simulador <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/app/biblioteca" className="btn-secondary">
                    Ver artigos
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Seu progresso</h2>
            <Link href="/app/progresso" className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
              Ver detalhes <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-5 flex items-center gap-5">
            <LevelRing
              percent={gamification?.progressPercent ?? 0}
              level={gamification?.level.number ?? 1}
              xp={gamification?.xp ?? 0}
              size={118}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted">Nível atual</p>
              <p className="truncate text-lg font-extrabold">{gamification?.level.name ?? "Curioso"}</p>
              <p className="mt-1 text-[11px] text-muted">
                {gamification
                  ? `${gamification.xpToNextLevel.toLocaleString("pt-BR")} XP para o próximo`
                  : "Complete uma aula para começar"}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted">Aulas</p>
                  <p className="text-base font-bold">{progress?.completedLessons ?? 0}</p>
                </div>
                <div>
                  <p className="text-muted">Conquistas</p>
                  <p className="text-base font-bold">
                    {gamification?.achievementsUnlocked ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Aulas concluídas" value={progress?.completedLessons ?? 0} hint={`de ${progress?.totalLessons ?? 0} disponíveis`} icon={<BookOpen className="h-4 w-4" />} />
        <Stat label="Média nos quizzes" value={`${progress?.quizAverage ?? 0}%`} hint={plural(progress?.quizAttempts, "tentativa", "tentativas")} icon={<Target className="h-4 w-4" />} />
        <Stat label="Sequência atual" value={dayCount(progress?.currentStreak ?? 0)} hint={`Melhor: ${progress?.bestStreak ?? 0}`} icon={<Flame className="h-4 w-4" />} />
        <Stat label="Módulos" value={totalModules} hint={`${trackCount} trilhas`} icon={<Award className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold">Sua jornada</h2>
              <p className="mt-1 text-xs text-muted">Trilhas em ordem didática. Cada conceito prepara o próximo.</p>
            </div>
            <Link href="/app/aprender" className="btn-ghost px-0 text-xs">
              Ver mapa <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {categoryProgress.slice(0, 5).map((category, index) => (
              <div key={category.id}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-lg bg-ink-700 text-[10px] font-black text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-semibold text-neutral-200">{category.name}</span>
                  </div>
                  <span className="text-muted">
                    {category.completedLessons}/{category.totalLessons}
                  </span>
                </div>
                <ProgressBar value={category.percent} />
              </div>
            ))}
            {categoryProgress.length === 0 && (
              <p className="py-6 text-center text-sm text-muted">Carregando seu mapa de aprendizado…</p>
            )}
          </div>
          <Link href="/app/aprender" className="btn-secondary mt-6 w-full text-xs">
            Explorar todas as trilhas <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold">Mercado agora</h2>
                {market?.status === "UNAVAILABLE" && (
                  <span className="rounded-md border border-ink-500 bg-ink-700 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                    referência estática
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted">Apenas informativo. Não é recomendação.</p>
            </div>
            <Link href="/app/mercado" className="btn-ghost px-0 text-xs">
              Ver mercado <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 divide-y divide-ink-500/60">
            {(market?.assets ?? []).slice(0, 3).map((asset) => {
              const positive = asset.change24hPercent >= 0;
              return (
                <div key={asset.symbol} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-ink-700 text-xs font-black text-accent">
                      {asset.symbol.slice(0, 1)}
                    </span>
                    <div>
                      <p className="text-sm font-bold">{asset.name}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted">{asset.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{money(asset.priceBrl)}</p>
                    <p
                      className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-bold",
                        positive ? "text-emerald-400" : "text-red-400",
                      )}
                    >
                      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {signedPercent(asset.change24hPercent)}
                    </p>
                  </div>
                </div>
              );
            })}
            {!market && (
              <p className="py-6 text-center text-sm text-muted">
                {marketError ?? "Carregando cotações…"}
              </p>
            )}
          </div>
          {market?.status === "UNAVAILABLE" && (
            <p className="mt-3 rounded-lg bg-ink-700/60 px-3 py-2 text-[10px] leading-4 text-neutral-400">
              Cotações indisponíveis no momento. Exibindo referência estática para fins educativos.
            </p>
          )}
          <Disclaimer className="mt-4" />
        </section>
      </div>

      <section className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
            <LineChart className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold">Pratique com dinheiro fictício</h2>
            <p className="mt-1 max-w-xl text-xs leading-5 text-muted">
              Simule capital inicial, aportes, prazo e taxa hipotética. Compare cenários e entenda
              o efeito dos juros compostos — sem arriscar nenhum real.
            </p>
          </div>
        </div>
        <Link href="/app/simulador" className="btn-primary shrink-0 text-xs">
          Abrir simulador <ArrowUpRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}

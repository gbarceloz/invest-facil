"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bitcoin,
  BookOpen,
  Flame,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useAppData } from "@/lib/app-data";
import { api } from "@/lib/api";
import { compactUsd, dateLong, dayCount, money, relativeTime, signedPercent, usd } from "@/lib/format";
import type { BitcoinMarketResponse } from "@/lib/types";
import { ProgressBar } from "@/components/progress";
import { Disclaimer, Skeleton } from "@/components/ui";

export default function DashboardPage() {
  const { user } = useAuth();
  const { gamification, progress, loading } = useAppData();
  const [market, setMarket] = useState<BitcoinMarketResponse | null>(null);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(dateLong());
    let active = true;
    api
      .get<BitcoinMarketResponse>("/api/v1/bitcoin/market")
      .then((data) => {
        if (active) setMarket(data);
      })
      .catch(() => {
        if (active) setMarket(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const firstName = user?.name?.split(" ")[0] ?? "investidor";
  const next = progress?.nextLesson;
  const positive = (market?.change24hPercent ?? 0) >= 0;

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">{today || "—"}</p>
          <h1 className="mt-2 text-[26px] font-medium tracking-[-0.035em] text-neutral-100 sm:text-[30px]">
            Olá, {firstName}. Continue sua jornada.
          </h1>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-neutral-500">
          <span className="inline-flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-accent" /> {dayCount(gamification?.currentStreak ?? 0)}
          </span>
          <span className="text-neutral-700">·</span>
          <span>melhor sequência {gamification?.bestStreak ?? 0}</span>
        </div>
      </header>

      <section className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#111111] p-6 sm:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(28rem_18rem_at_100%_0%,rgba(250,204,21,0.08),transparent_70%)]" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-accent/25 bg-accent/[0.06] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-accent">
              <Sparkles className="h-3 w-3" /> Próxima missão
            </span>
            {loading ? (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-7 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : next ? (
              <>
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  {next.categoryName ?? "Trilha"} · {next.moduleTitle ?? "Aula"}
                </p>
                <h2 className="mt-2 text-[28px] font-medium tracking-[-0.04em] text-neutral-100">{next.title}</h2>
                <p className="mt-2 text-[12px] leading-6 text-neutral-400">
                  {next.estimatedMin} min · entenda o conceito antes de avançar.
                </p>
                <Link href={`/app/aprender/aula/${next.slug}`} className="btn-primary mt-5">
                  Continuar missão <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <>
                <h2 className="mt-4 text-[26px] font-medium tracking-[-0.035em] text-neutral-100">
                  Você concluiu as aulas disponíveis.
                </h2>
                <p className="mt-2 text-[12px] leading-6 text-neutral-400">
                  Revise um quiz, salve uma simulação ou explore os artigos da biblioteca.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href="/app/simulador" className="btn-primary">Simulador</Link>
                  <Link href="/app/biblioteca" className="btn-secondary">Biblioteca</Link>
                </div>
              </>
            )}
          </div>

          <div className="relative hidden h-36 w-36 shrink-0 place-items-center sm:grid">
            <div className="absolute inset-0 rounded-full border border-accent/10" />
            <div className="absolute inset-4 rounded-full border border-accent/15" />
            <div className="absolute inset-8 rounded-full border border-accent/20" />
            <div className="grid h-14 w-14 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-xl border border-white/[0.08] bg-[#111111] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-neutral-100">Seu progresso</h2>
            <Link href="/app/progresso" className="text-[10px] font-medium text-neutral-500 transition hover:text-accent">
              Ver detalhes
            </Link>
          </div>
          <div className="mt-5 flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-xl border border-accent/20 bg-accent/[0.08]">
              <span className="text-[11px] font-semibold text-accent">{String(gamification?.level.number ?? 1).padStart(2, "0")}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-neutral-200">{gamification?.level.name ?? "Curioso"}</p>
              <p className="mt-0.5 text-[10px] text-neutral-500">
                {gamification ? `${gamification.xp.toLocaleString("pt-BR")} / ${gamification.xpToNextLevel.toLocaleString("pt-BR")} XP` : "0 XP"}
              </p>
              <ProgressBar value={gamification?.progressPercent ?? 0} className="mt-2" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 divide-x divide-white/[0.07] border-t border-white/[0.07] pt-4 text-center">
            <div>
              <p className="text-[16px] font-medium text-neutral-100">{progress?.completedLessons ?? 0}</p>
              <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-neutral-500">missões</p>
            </div>
            <div>
              <p className="text-[16px] font-medium text-neutral-100">{progress?.quizAverage ?? 0}%</p>
              <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-neutral-500">quiz médio</p>
            </div>
            <div>
              <p className="text-[16px] font-medium text-neutral-100">{gamification?.achievementsUnlocked ?? 0}</p>
              <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-neutral-500">conquistas</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-white/[0.08] bg-[#111111] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[13px] font-semibold text-neutral-100">Mercado agora</h2>
              <p className="mt-1 text-[10px] text-neutral-500">Bitcoin · dados informativos</p>
            </div>
            <Link href="/app/bitcoin" className="text-[10px] font-medium text-neutral-500 transition hover:text-accent">
              Ver módulo
            </Link>
          </div>

          {!market ? (
            <div className="mt-5 space-y-2">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : market.status === "UNAVAILABLE" ? (
            <p className="mt-5 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-4 text-[11px] leading-5 text-neutral-400">
              Dados de mercado indisponíveis agora. O conteúdo educativo continua disponível no
              módulo Bitcoin.
            </p>
          ) : (
            <>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-500">
                    <Bitcoin className="h-3.5 w-3.5 text-accent" /> BTC
                  </div>
                  <p className="mt-2 text-[26px] font-medium tracking-[-0.03em] text-neutral-100">
                    {market.priceUsd != null ? usd(market.priceUsd) : "—"}
                  </p>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    {market.priceBrl != null ? money(market.priceBrl) : "BRL indisponível"}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1 text-[12px] font-medium ${positive ? "text-emerald-400" : "text-red-400"}`}>
                  {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {market.change24hPercent != null ? signedPercent(market.change24hPercent) : "—"}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-4 text-[11px]">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.12em] text-neutral-500">capitalização</p>
                  <p className="mt-1 text-neutral-300">{market.marketCapUsd != null ? compactUsd(market.marketCapUsd) : "—"}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.12em] text-neutral-500">volume 24h</p>
                  <p className="mt-1 text-neutral-300">{market.volume24hUsd != null ? compactUsd(market.volume24hUsd) : "—"}</p>
                </div>
              </div>
              <p className="mt-4 text-[9px] text-neutral-600">
                Atualizado {relativeTime(market.updatedAt)} · {market.source}
              </p>
            </>
          )}
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-neutral-500">
        <Link href="/app/mercado-financeiro" className="inline-flex items-center gap-1.5 transition hover:text-accent">
          <BookOpen className="h-3.5 w-3.5 text-accent" /> Mercado financeiro
        </Link>
        <Link href="/app/bitcoin" className="inline-flex items-center gap-1.5 transition hover:text-accent">
          <Bitcoin className="h-3.5 w-3.5 text-accent" /> Bitcoin
        </Link>
        <Link href="/app/progresso" className="inline-flex items-center gap-1.5 transition hover:text-accent">
          <Target className="h-3.5 w-3.5 text-accent" /> Progresso
        </Link>
        <Link href="/app/perfil" className="inline-flex items-center gap-1.5 transition hover:text-accent">
          <Trophy className="h-3.5 w-3.5 text-accent" /> Perfil
        </Link>
      </div>

      <Disclaimer className="text-[10px]" />
    </div>
  );
}

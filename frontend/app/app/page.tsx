"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bitcoin,
  BookOpen,
  CalendarCheck,
  Flame,
  Sparkles,
  Target,
  Ticket,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useAppData } from "@/lib/app-data";
import { api } from "@/lib/api";
import { cn, compactUsd, dateLong, dayCount, money, relativeTime, signedPercent, usd } from "@/lib/format";
import { moneyCents } from "@/lib/onboarding";
import { resolveFichas, resolveFichasMax, resolveStreak } from "@/lib/learning";
import type { BitcoinMarketResponse } from "@/lib/types";
import { Fina } from "@/components/onboarding/fina";
import { FinancialHealthPanel } from "@/components/onboarding/health-result";
import { ProgressBar } from "@/components/progress";
import { Disclaimer, Skeleton } from "@/components/ui";

export default function DashboardPage() {
  const { user } = useAuth();
  const { gamification, progress, onboarding, loading } = useAppData();
  const [market, setMarket] = useState<BitcoinMarketResponse | null>(null);
  const [today, setToday] = useState("");
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    setToday(dateLong());
    setReveal(new URLSearchParams(window.location.search).get("revelar") === "1");
    const timer = window.setTimeout(() => {
      if (window.location.search.includes("revelar=1")) {
        window.history.replaceState({}, "", "/app");
      }
    }, 2200);
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
      window.clearTimeout(timer);
    };
  }, []);

  const firstName = user?.name?.split(" ")[0] ?? "investidor";
  const next = progress?.nextLesson;
  const positive = (market?.change24hPercent ?? 0) >= 0;
  const streak = resolveStreak(gamification, progress);
  const fichas = resolveFichas(gamification);
  const fichasMax = resolveFichasMax(gamification);
  const health = onboarding?.health;
  const timeline = progress?.categories ?? [];
  const startHref = next ? `/app/aprender/aula/${next.slug}` : "/app/mercado-financeiro";

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-8">
      <header data-reveal-auto="up" className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            {today || "—"}
          </p>
          <h1 className="mt-2 text-[26px] font-medium tracking-[-0.035em] text-neutral-100 sm:text-[30px]">
            Olá, {firstName}. {health ? "Seu plano está pronto." : "Vamos montar seu plano."}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
          <span className="pill" title="Sequência de estudos · dados do servidor">
            <Flame className="h-3.5 w-3.5 text-accent" aria-hidden="true" /> {dayCount(streak.current)}
          </span>
          <span className="pill" title="Fichas de quiz · saldo do servidor">
            <Ticket className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            {fichas !== null ? `${fichas}${fichasMax !== null ? ` de ${fichasMax}` : ""} fichas` : "fichas —"}
          </span>
          <span className="text-[10px] text-neutral-500">melhor sequência {streak.best}</span>
        </div>
      </header>

      <section
        data-reveal-auto="up"
        className={cn(
          "relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#111111] p-6 sm:p-7",
          reveal && "onb-enter",
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(28rem_18rem_at_100%_0%,rgba(250,204,21,0.1),transparent_70%)]" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 max-w-xl flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-accent/25 bg-accent/[0.06] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-accent">
              <Sparkles className="h-3 w-3" /> Seu ponto de partida
            </span>
            {health ? (
              <>
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  Plano personalizado · {health.bandLabel}
                </p>
                <h2 className="mt-2 text-[26px] font-medium tracking-[-0.04em] text-neutral-100 sm:text-[30px]">
                  Seu próximo passo: {health.opportunityLabel.toLowerCase()}.
                </h2>
                <p className="mt-2 max-w-lg text-[12px] leading-6 text-neutral-400">
                  {health.recommendation}
                </p>
                <div className="mt-5 grid max-w-md grid-cols-2 gap-3 border-t border-white/[0.07] pt-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.12em] text-neutral-500">economia mensal</p>
                    <p className="mt-1 text-[14px] font-medium text-neutral-100">
                      {moneyCents(health.monthlySavingsCents)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.12em] text-neutral-500">meta de reserva</p>
                    <p className="mt-1 text-[14px] font-medium text-neutral-100">
                      {moneyCents(health.emergencyFundGoalCents)}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-neutral-500">próxima aula</p>
                    <p className="mt-1 truncate text-[14px] font-medium text-neutral-100">
                      {next?.title ?? "Explorar trilha"}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={startHref} className="btn-primary uppercase tracking-[0.06em]">
                    COMEÇAR A ESTUDAR <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/comecar" className="btn-secondary">
                    Ajustar meu perfil
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="mt-4 text-[26px] font-medium tracking-[-0.04em] text-neutral-100 sm:text-[30px]">
                  Um plano feito a partir das suas respostas.
                </h2>
                <p className="mt-2 max-w-lg text-[12px] leading-6 text-neutral-400">
                  Responda 7 perguntas rápidas com a Fina. O servidor calcula seu ponto de partida,
                  e você chega aqui com um painel personalizado — sem números inventados.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href="/comecar" className="btn-primary">
                    Montar meu perfil <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/app/mercado-financeiro" className="btn-secondary">
                    Explorar aulas
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="relative hidden h-44 w-44 shrink-0 place-items-center sm:grid">
            <div className="absolute inset-0 rounded-full border border-accent/10" />
            <div className="absolute inset-5 rounded-full border border-accent/15" />
            <div className="absolute inset-10 rounded-full border border-accent/20" />
            <div className="absolute inset-0 rounded-full bg-accent/[0.05] blur-2xl" />
            <Fina pose={reveal ? "jump" : "wave"} size={176} priority className="relative" />
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <section
          data-reveal-auto="up"
          className={cn(
            "rounded-xl border border-white/[0.08] bg-[#111111] p-5 sm:p-6",
            reveal && "onb-enter",
          )}
          style={reveal ? { animationDelay: "90ms" } : undefined}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[13px] font-semibold text-neutral-100">Saúde financeira</h2>
              <p className="mt-1 text-[10px] text-neutral-500">
                Índice educativo · calculado no servidor
              </p>
            </div>
            <Link href="/comecar" className="text-[10px] font-medium text-neutral-500 transition hover:text-accent">
              Atualizar
            </Link>
          </div>
          {health ? (
            <FinancialHealthPanel health={health} className="mt-5" />
          ) : (
            <div className="mt-5 rounded-lg border border-white/[0.07] bg-white/[0.02] px-4 py-5 text-[11px] leading-5 text-neutral-400">
              Seu índice aparece aqui depois do onboarding. Ele usa reserva, dívidas, capacidade de
              poupança e despesas essenciais — e só considera o que você respondeu.
            </div>
          )}
        </section>

        <section
          data-reveal-auto="up"
          className={cn(
            "rounded-xl border border-white/[0.08] bg-[#111111] p-5 sm:p-6",
            reveal && "onb-enter",
          )}
          style={reveal ? { animationDelay: "160ms" } : undefined}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-neutral-100">Seu progresso</h2>
            <Link href="/app/progresso" className="text-[10px] font-medium text-neutral-500 transition hover:text-accent">
              Ver detalhes
            </Link>
          </div>
          <div className="mt-5 flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-xl border border-accent/20 bg-accent/[0.08]">
              <span className="text-[11px] font-semibold text-accent">
                {String(gamification?.level.number ?? 1).padStart(2, "0")}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-neutral-200">
                {gamification?.level.name ?? "Curioso"}
              </p>
              <p className="mt-0.5 text-[10px] text-neutral-500">
                {gamification
                  ? `${gamification.xp.toLocaleString("pt-BR")} / ${gamification.xpToNextLevel.toLocaleString("pt-BR")} XP`
                  : "0 XP"}
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
          <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3 text-[10px]">
            <span className="inline-flex items-center gap-1.5 text-neutral-500">
              <Ticket className="h-3 w-3 text-accent" aria-hidden="true" /> fichas de quiz
            </span>
            <span className="font-semibold text-neutral-200">
              {fichas !== null ? fichas : "—"}
              {fichasMax !== null ? ` de ${fichasMax}` : ""}
            </span>
          </div>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <section data-reveal-auto="up" className="rounded-xl border border-white/[0.08] bg-[#111111] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[13px] font-semibold text-neutral-100">Próxima missão</h2>
              <p className="mt-1 text-[10px] text-neutral-500">Continue de onde parou</p>
            </div>
            <CalendarCheck className="h-4 w-4 text-accent/70" aria-hidden="true" />
          </div>
          {loading ? (
            <div className="mt-5 space-y-3">
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : next ? (
            <>
              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                {next.categoryName ?? "Trilha"} · {next.moduleTitle ?? "Aula"}
              </p>
              <h3 className="mt-2 text-[22px] font-medium tracking-[-0.035em] text-neutral-100">
                {next.title}
              </h3>
              <p className="mt-2 text-[11px] leading-5 text-neutral-400">
                {next.estimatedMin} min · entenda o conceito antes de avançar.
              </p>
              <Link href={`/app/aprender/aula/${next.slug}`} className="btn-primary mt-4">
                Continuar missão <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <h3 className="mt-5 text-[20px] font-medium tracking-[-0.03em] text-neutral-100">
                Você concluiu as aulas disponíveis.
              </h3>
              <p className="mt-2 text-[11px] leading-5 text-neutral-400">
                Revise um quiz, salve uma simulação ou explore os artigos da biblioteca.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/app/simulador" className="btn-primary">Simulador</Link>
                <Link href="/app/biblioteca" className="btn-secondary">Biblioteca</Link>
              </div>
            </>
          )}
        </section>

        <section data-reveal-auto="up" className="rounded-xl border border-white/[0.08] bg-[#111111] p-5 sm:p-6">
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

      <section data-reveal-auto="up" className="rounded-xl border border-white/[0.08] bg-[#111111] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[13px] font-semibold text-neutral-100">Sua trilha</h2>
            <p className="mt-1 text-[10px] text-neutral-500">Timeline do catálogo · progresso real</p>
          </div>
          <Link href="/app/progresso" className="inline-flex items-center gap-1 text-[10px] font-medium text-neutral-500 transition hover:text-accent">
            <Target className="h-3.5 w-3.5" /> Ver progresso
          </Link>
        </div>
        {timeline.length === 0 ? (
          <p className="mt-4 text-[11px] text-neutral-500">
            O catálogo aparece aqui assim que a primeira trilha for carregada.
          </p>
        ) : (
          <ol data-stagger-auto className="mt-5 space-y-4">
            {timeline.map((item, index) => (
              <li key={item.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                <span
                  className={cn(
                    "grid h-6 w-6 place-items-center rounded-full border text-[9px] font-semibold",
                    item.percent >= 100
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      : item.percent > 0
                        ? "border-accent/30 bg-accent/10 text-accent"
                        : "border-white/10 bg-white/[0.02] text-neutral-500",
                  )}
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-[11px] font-medium text-neutral-200">{item.name}</p>
                    <span className="shrink-0 text-[9px] tabular-nums text-neutral-500">
                      {item.completedLessons}/{item.totalLessons}
                    </span>
                  </div>
                  <ProgressBar value={item.percent} className="mt-1.5" />
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-700" aria-hidden="true" />
              </li>
            ))}
          </ol>
        )}
      </section>

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

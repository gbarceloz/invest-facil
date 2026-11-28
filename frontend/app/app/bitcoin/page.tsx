"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bitcoin,
  BookOpen,
  CircleAlert,
  Clock3,
  RefreshCw,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAppData } from "@/lib/app-data";
import type { BitcoinMarketResponse, Category } from "@/lib/types";
import { type ChartRange } from "@/lib/chart";
import { cn, compactMoney, compactUsd, dateTime, money, relativeTime, signedPercent, usd } from "@/lib/format";
import { LevelCards } from "@/components/learning-track-list";
import { ProgressBar } from "@/components/progress";
import { Badge } from "@/components/page";
import { Alert, Disclaimer, Skeleton, Spinner } from "@/components/ui";

const BitcoinPriceChart = dynamic(
  () => import("@/components/charts/bitcoin-price-chart").then((mod) => mod.BitcoinPriceChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full" />,
  },
);

export default function BitcoinPage() {
  const { progress } = useAppData();
  const [categories, setCategories] = useState<Category[]>([]);
  const [market, setMarket] = useState<BitcoinMarketResponse | null>(null);
  const [range, setRange] = useState<ChartRange>("24h");
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [loadingContent, setLoadingContent] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadMarket(initial = false) {
    if (initial) setLoadingMarket(true);
    setError(null);
    try {
      const data = await api.get<BitcoinMarketResponse>("/api/v1/bitcoin/market");
      setMarket(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os dados de mercado.");
    } finally {
      setLoadingMarket(false);
    }
  }

  useEffect(() => {
    let active = true;
    api
      .get<Category[]>("/api/v1/content/categories")
      .then((data) => {
        if (active) setCategories(data);
      })
      .catch(() => {
        if (active) setCategories([]);
      })
      .finally(() => {
        if (active) setLoadingContent(false);
      });
    void loadMarket(true);
    return () => {
      active = false;
    };
  }, []);

  const bitcoinCategories = useMemo(
    () => categories.filter((category) => category.slug === "cripto" || category.slug.startsWith("bitcoin")),
    [categories],
  );
  const bitcoinLessons = bitcoinCategories.reduce(
    (sum, category) => sum + category.modules.reduce((moduleSum, module) => moduleSum + module.lessonCount, 0),
    0,
  );
  const chart = range === "24h" ? market?.chart24h ?? [] : market?.chart7d ?? [];
  const chartData = chart.map((point) => ({ time: point.timestamp, price: point.price }));
  const positive = (market?.change24hPercent ?? 0) >= 0;
  const unavailable = market?.status === "UNAVAILABLE";

  return (
    <div className="mx-auto max-w-4xl pb-8">
      <header data-reveal-auto="up" className="relative overflow-hidden border-b border-white/[0.07] pb-7 pt-0">
        <div className="pointer-events-none absolute -right-20 -top-32 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
              Módulo 02 · Bitcoin
            </p>
            <h1 className="mt-3 text-[30px] font-medium leading-[1.1] tracking-[-0.04em] text-neutral-100 sm:text-[38px]">
              A tecnologia. O mercado.
              <br />
              <span className="text-accent">Sem promessas.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-neutral-400 sm:text-base">
              Entenda por que o Bitcoin existe, como funciona, onde ficam os riscos e o que os
              números do mercado realmente dizem — sem transformar educação em recomendação.
            </p>
            <div className="mt-7 flex flex-wrap gap-2 text-[11px] text-neutral-500">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1.5">
                <BookOpen className="h-3.5 w-3.5 text-accent" /> {bitcoinLessons} aulas
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" /> educação e mercado separados
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1.5">
                <Clock3 className="h-3.5 w-3.5 text-accent" /> dados com cache
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#111111] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                  Mercado · {market?.source ?? "CoinGecko"}
                </p>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-[28px] font-medium tracking-[-0.03em] sm:text-[32px]">
                    {loadingMarket && !market ? "—" : market?.priceUsd != null ? usd(market.priceUsd) : "—"}
                  </span>
                  {market?.change24hPercent != null && (
                    <span className={cn("inline-flex items-center gap-1 text-sm font-bold", positive ? "text-emerald-400" : "text-red-400")}>
                      {positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {signedPercent(market.change24hPercent)}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-neutral-400">
                  {market?.priceBrl != null ? money(market.priceBrl) : "Preço em BRL indisponível"}
                </p>
              </div>
              <Bitcoin className="h-7 w-7 text-accent" />
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <Badge tone={market?.status === "FRESH" ? "success" : market?.status === "STALE" ? "accent" : "danger"}>
                {market?.status === "FRESH" ? "Dados atualizados" : market?.status === "STALE" ? "Dados desatualizados" : "Mercado indisponível"}
              </Badge>
              <button
                type="button"
                onClick={() => void loadMarket()}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 transition hover:text-accent"
                aria-label="Atualizar dados de mercado"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", loadingMarket && "animate-spin")} /> atualizar
              </button>
            </div>

            {error && !market && (
              <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[11px] leading-5 text-red-200">
                {error}
              </p>
            )}
            {market?.status === "UNAVAILABLE" && (
              <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] leading-5 text-neutral-400">
                A fonte de mercado não respondeu. Nenhum número foi inventado; o conteúdo educativo
                continua disponível abaixo.
              </p>
            )}
            {market?.updatedAt && (
              <p className="mt-4 text-[10px] text-neutral-500">
                Última atualização: {dateTime(market.updatedAt)} · {relativeTime(market.updatedAt)}
              </p>
            )}
          </div>
        </div>
      </header>

      <section data-reveal-auto="up" className="grid gap-5 py-7 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-white/[0.08] bg-[#111111] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                Preço em USD
              </p>
              <h2 className="mt-1 text-[15px] font-semibold text-neutral-100">Movimento recente</h2>
            </div>
            <div className="flex rounded-full border border-white/10 bg-black/20 p-1">
              {(["24h", "7d"] as ChartRange[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRange(option)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition",
                    range === option ? "bg-accent text-ink-950" : "text-neutral-400 hover:text-neutral-100",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 h-[230px] w-full">
            {loadingMarket && !market ? (
              <Skeleton className="h-full w-full" />
            ) : unavailable || chartData.length === 0 ? (
              <div className="grid h-full place-items-center rounded-xl border border-dashed border-white/10 text-center">
                <div>
                  <CircleAlert className="mx-auto h-5 w-5 text-neutral-500" />
                  <p className="mt-2 text-xs text-neutral-500">Sem série de preço disponível.</p>
                </div>
              </div>
            ) : (
              <BitcoinPriceChart data={chartData} range={range} />
            )}
          </div>

          <div className="mt-5 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Capitalização</p>
              <p className="mt-1 text-sm font-bold">{market?.marketCapUsd != null ? compactUsd(market.marketCapUsd) : "—"}</p>
              <p className="text-[10px] text-neutral-500">{market?.marketCapBrl != null ? compactMoney(market.marketCapBrl) : "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Volume 24h</p>
              <p className="mt-1 text-sm font-bold">{market?.volume24hUsd != null ? compactUsd(market.volume24hUsd) : "—"}</p>
              <p className="text-[10px] text-neutral-500">{market?.volume24hBrl != null ? compactMoney(market.volume24hBrl) : "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Variação 24h</p>
              <p className={cn("mt-1 text-sm font-bold", positive ? "text-emerald-400" : "text-red-400")}>
                {market?.change24hPercent != null ? signedPercent(market.change24hPercent) : "—"}
              </p>
              <p className="text-[10px] text-neutral-500">em USD</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#111111] p-5 sm:p-6">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
            Seu avanço
          </p>
          <h2 className="mt-1 text-[15px] font-semibold text-neutral-100">Trilha Bitcoin</h2>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            {bitcoinLessons} aulas em {bitcoinCategories.length} {bitcoinCategories.length === 1 ? "trilha" : "trilhas"}. Educação primeiro; mercado
            como contexto, não como sinal de compra.
          </p>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              <span>progresso</span>
              <span className="text-accent">
                {progress?.categories.find((category) => category.slug === "cripto")?.percent ?? 0}%
              </span>
            </div>
            <ProgressBar
              value={progress?.categories.find((category) => category.slug === "cripto")?.percent ?? 0}
            />
          </div>
          <div className="mt-6 space-y-3">
            {bitcoinCategories.map((category) => (
              <div key={category.id} className="rounded-xl bg-black/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-accent">{category.name}</p>
                <p className="mt-1 text-xs leading-5 text-neutral-400">{category.description}</p>
                <div className="mt-3 space-y-2">
                  {category.modules.map((module) => (
                    <Link
                      key={module.id}
                      href={`/app/aprender/modulo/${module.slug}`}
                      className="flex items-center justify-between gap-3 text-xs font-semibold text-neutral-300 transition hover:text-accent"
                    >
                      <span className="truncate">{module.title}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            {bitcoinCategories.length === 0 && !loadingContent && (
              <p className="text-xs text-neutral-500">Trilha em preparação.</p>
            )}
            {loadingContent && <Spinner label="Carregando trilha" />}
          </div>
        </div>
      </section>

      {bitcoinCategories.length > 0 && (
        <section data-reveal-auto="up" className="pt-2">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                Conteúdo educativo
              </p>
              <h2 className="mt-2 text-[22px] font-medium tracking-[-0.03em] text-neutral-100">Do conceito à custódia</h2>
            </div>
            {progress?.nextLesson && (
              <Link href={`/app/aprender/aula/${progress.nextLesson.slug}`} className="btn-secondary hidden text-xs sm:inline-flex">
                Continuar <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
          <LevelCards categories={bitcoinCategories} progress={progress} />
        </section>
      )}

      <Alert tone="warning" className="mt-7">
        <div className="flex items-start gap-3">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-xs leading-5">
            Preço, capitalização e volume são dados descritivos. Não são recomendação, previsão ou
            garantia. Bitcoin é volátil e pode perder valor. Nunca use dinheiro de emergência.
          </p>
        </div>
      </Alert>

      <Disclaimer className="mt-5" text={market?.disclaimer} />
    </div>
  );
}

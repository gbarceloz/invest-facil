"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, RefreshCw, TrendingDown, TrendingUp, WifiOff } from "lucide-react";
import { api } from "@/lib/api";
import type { MarketResponse } from "@/lib/types";
import { cn, money, relativeTime, signedPercent } from "@/lib/format";
import { Badge, PageHeader } from "@/components/page";
import { Alert, Disclaimer, Spinner } from "@/components/ui";

export default function MarketPage() {
  const [market, setMarket] = useState<MarketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const data = await api.get<MarketResponse>("/api/v1/market/assets");
      setMarket(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar as cotações.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load(true);
  }, [load]);

  return (
    <div>
      <PageHeader
        eyebrow="Dados para entender, não para impulsionar"
        title="Mercado"
        description="Acompanhe os principais ativos com contexto para iniciantes. A plataforma não executa ordens e não recomenda ativos."
        actions={
          <button type="button" onClick={() => load()} className="btn-secondary text-xs" disabled={refreshing}>
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} /> Atualizar
          </button>
        }
      />

      {market && (
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted">
          <Badge tone={market.status === "FRESH" ? "success" : "neutral"}>
            {market.status === "FRESH" ? "Dados atualizados" : "Referência estática"}
          </Badge>
          <span>Atualizado {relativeTime(market.updatedAt)}</span>
          {market.status === "UNAVAILABLE" && (
            <span className="inline-flex items-center gap-1 text-accent">
              <WifiOff className="h-3.5 w-3.5" /> Provedor indisponível
            </span>
          )}
        </div>
      )}

      {error && !market && (
        <Alert className="mb-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{error}</span>
            <button type="button" onClick={() => load(true)} className="font-bold text-accent hover:underline">
              Tentar novamente
            </button>
          </div>
        </Alert>
      )}

      {loading && !market ? (
        <Spinner label="Carregando cotações" />
      ) : !market ? (
        <p className="card p-6 text-sm text-muted">
          Cotações indisponíveis. Tente novamente em instantes.
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {(market?.assets ?? []).map((asset) => {
              const positive = asset.change24hPercent >= 0;
              return (
                <div key={asset.symbol} className="card p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-ink-700 text-sm font-black text-accent">
                        {asset.symbol.slice(0, 1)}
                      </span>
                      <div>
                        <p className="font-bold">{asset.name}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted">{asset.symbol}</p>
                      </div>
                    </div>
                    <span className={cn("inline-flex items-center gap-1 text-xs font-bold", positive ? "text-emerald-400" : "text-red-400")}>
                      {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {signedPercent(asset.change24hPercent)}
                    </span>
                  </div>
                  <p className="mt-5 text-2xl font-extrabold tracking-tight">{money(asset.priceBrl)}</p>
                  <p className="mt-1 text-[11px] text-muted">Volume 24h: {money(asset.volume24hBrl)}</p>
                </div>
              );
            })}
          </div>

          <div className="card mt-5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="border-b border-ink-500/60 bg-ink-900/60 text-left text-[10px] uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-5 py-3">Ativo</th>
                    <th className="px-5 py-3 text-right">Preço (BRL)</th>
                    <th className="px-5 py-3 text-right">24h</th>
                    <th className="px-5 py-3 text-right">Volume 24h</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-500/50">
                  {(market?.assets ?? []).map((asset) => (
                    <tr key={asset.symbol} className="transition hover:bg-ink-700/30">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{asset.name}</span>
                          <span className="text-[10px] text-muted">{asset.symbol}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold">{money(asset.priceBrl)}</td>
                      <td className={cn("px-5 py-3 text-right font-bold", asset.change24hPercent >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {signedPercent(asset.change24hPercent)}
                      </td>
                      <td className="px-5 py-3 text-right text-muted">{money(asset.volume24hBrl)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <section className="card mt-5 p-5">
            <h2 className="text-sm font-bold">Antes de olhar o preço, entenda o ativo</h2>
            <p className="mt-2 max-w-2xl text-xs leading-6 text-muted">
              Cotação não é recomendação. Volatilidade alta não é oportunidade automática. Se quiser
              entender cripto, comece pela trilha educativa — inclusive pelos riscos e golpes comuns.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/app/aprender/modulo/cripto-com-cautela" className="btn-secondary text-xs">
                Trilha de cripto <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/app/simulador" className="btn-ghost text-xs">
                Simular cenários
              </Link>
            </div>
          </section>

          <Disclaimer className="mt-6" text={market?.disclaimer} />
        </>
      )}
    </div>
  );
}

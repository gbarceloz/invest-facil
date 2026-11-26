"use client";

import { useEffect, useState } from "react";
import { Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/format";
import { moneyCents } from "@/lib/onboarding";
import type { FinancialHealth } from "@/lib/types";

function useCountUp(target: number | null, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target == null) return;
    if (typeof window !== "undefined" && window.matchMedia) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setValue(target);
        return;
      }
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return target == null ? null : value;
}

const BAND_TONE: Record<FinancialHealth["band"], string> = {
  SEM_DADOS: "border-white/15 bg-white/[0.04] text-neutral-300",
  ATENCAO: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  CONSTRUINDO: "border-accent/30 bg-accent/10 text-accent",
  ORGANIZANDO: "border-accent/40 bg-accent/[0.12] text-accent",
  CONSOLIDADO: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
};

export function ScoreRing({
  score,
  band,
  size = 168,
}: {
  score: number | null;
  band: FinancialHealth["band"];
  size?: number;
}) {
  const value = useCountUp(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = value ?? 0;
  const offset = circumference * (1 - progress / 100);

  const stroke =
    band === "CONSOLIDADO"
      ? "#34d399"
      : band === "ATENCAO"
        ? "#fbbf24"
        : band === "SEM_DADOS"
          ? "#525252"
          : "#facc15";

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={
        score == null
          ? "Índice de saúde financeira sem dados suficientes"
          : `Índice de saúde financeira: ${score} de 100`
      }
    >
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#1d1d1d" strokeWidth="9" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-[1100ms] ease-out"
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <span className="text-[34px] font-semibold leading-none tracking-[-0.05em] text-neutral-50">
          {score == null ? "—" : value}
        </span>
        <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
          de 100
        </span>
      </div>
    </div>
  );
}

export function FinancialHealthPanel({
  health,
  compact = false,
  className,
}: {
  health: FinancialHealth;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <ScoreRing score={health.score} band={health.band} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                BAND_TONE[health.band],
              )}
            >
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              {health.bandLabel}
            </span>
            <span className="text-[10px] text-neutral-500">índice educativo</span>
          </div>
          <h3 className="mt-3 text-[19px] font-medium tracking-[-0.03em] text-neutral-100">
            Seu próximo passo: {health.opportunityLabel.toLowerCase()}.
          </h3>
          <p className="mt-2 text-[12px] leading-6 text-neutral-400">{health.recommendation}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.12em] text-neutral-500">Economia mensal</p>
          <p className="mt-1 text-[15px] font-medium text-neutral-100">
            {moneyCents(health.monthlySavingsCents)}
          </p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-[0.12em] text-neutral-500">Meta de reserva</p>
          <p className="mt-1 text-[15px] font-medium text-neutral-100">
            {moneyCents(health.emergencyFundGoalCents)}
          </p>
          {health.emergencyFundGoalCents != null && (
            <p className="mt-0.5 text-[9px] text-neutral-600">6× despesas essenciais</p>
          )}
        </div>
      </div>

      {!compact && (
        <div className="border-t border-white/[0.07] pt-4">
          <p className="text-[11px] font-semibold text-neutral-200">Como o índice foi formado</p>
          <ul className="mt-3 space-y-3" role="list">
            {health.factors.map((factor) => {
              const percent = factor.answered
                ? Math.round((factor.points / factor.maxPoints) * 100)
                : 0;
              return (
                <li key={factor.key}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[11px] font-medium text-neutral-300">{factor.label}</span>
                    <span
                      className={cn(
                        "shrink-0 text-[10px] tabular-nums",
                        factor.answered && factor.points === factor.maxPoints
                          ? "text-emerald-300"
                          : factor.answered && factor.points === 0
                            ? "text-red-300"
                            : "text-neutral-500",
                      )}
                    >
                      {factor.answered ? `${factor.points}/${factor.maxPoints}` : "não informado"}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={cn(
                        "h-full rounded-full transition-[width] duration-700 ease-out",
                        factor.answered
                          ? factor.points === factor.maxPoints
                            ? "bg-emerald-400"
                            : factor.points === 0
                              ? "bg-red-400/70"
                              : "bg-accent"
                          : "bg-neutral-700",
                      )}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] leading-4 text-neutral-600">{factor.detail}</p>
                </li>
              );
            })}
          </ul>

          <details className="group mt-4 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3.5 py-3">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-[10px] font-semibold text-neutral-400 marker:hidden">
              <Info className="h-3.5 w-3.5 text-accent/80" aria-hidden="true" />
              Como calculamos esse índice
            </summary>
            <p className="mt-2 text-[10px] leading-5 text-neutral-500">
              O índice vai de 0 a 100 e combina quatro pilares: reserva de emergência (30),
              dívidas caras (25), capacidade de poupar (25) e despesas essenciais (20). Só entra na
              conta o que você respondeu. Não é uma nota de crédito, recomendação de investimento
              nem promessa de rentabilidade.
            </p>
          </details>
        </div>
      )}
    </div>
  );
}

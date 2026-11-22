import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-[26px] font-medium tracking-[-0.035em] text-neutral-100 sm:text-[30px]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[12px] leading-6 text-neutral-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "accent";
}) {
  return (
    <div className={cn("rounded-xl border border-white/[0.07] bg-[#111111] p-4", tone === "accent" && "border-accent/20 bg-accent/[0.04]")}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-500">{label}</p>
        {icon && <span className="text-accent">{icon}</span>}
      </div>
      <p className="mt-2 text-[21px] font-medium tracking-[-0.02em] text-neutral-100">{value}</p>
      {hint && <p className="mt-1 text-[10px] text-neutral-500">{hint}</p>}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "success" | "danger";
}) {
  const tones = {
    neutral: "border-ink-500 bg-ink-700 text-neutral-300",
    accent: "border-accent/30 bg-accent/10 text-accent",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    danger: "border-red-500/30 bg-red-500/10 text-red-300",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold", tones[tone])}>
      {children}
    </span>
  );
}

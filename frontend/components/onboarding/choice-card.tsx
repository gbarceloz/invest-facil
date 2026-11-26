"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/format";

export function ChoiceCard({
  selected,
  onClick,
  label,
  description,
  index = 0,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  description?: string;
  index?: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-selected={selected}
      aria-pressed={selected}
      className={cn(
        "onb-card onb-enter group relative flex w-full items-start gap-3 rounded-xl border border-white/[0.08] bg-[#111111] px-4 py-3.5 text-left",
        "hover:border-white/[0.16] hover:bg-[#151515]",
        className,
      )}
      style={{ animationDelay: `${Math.min(index * 45, 260)}ms` }}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold leading-5 text-neutral-100">{label}</span>
        {description && (
          <span className="mt-0.5 block text-[11px] leading-4 text-neutral-500">{description}</span>
        )}
      </span>
      <span
        className={cn(
          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition",
          selected
            ? "border-accent bg-accent text-ink-950"
            : "border-white/20 text-transparent group-hover:border-white/35",
        )}
        aria-hidden="true"
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    </button>
  );
}

export function PillChoice({
  selected,
  onClick,
  label,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-selected={selected}
      aria-pressed={selected}
      className={cn(
        "onb-card rounded-full border border-white/[0.1] bg-[#111111] px-3.5 py-2 text-[12px] font-medium text-neutral-300",
        "hover:border-white/20 hover:text-neutral-100",
        className,
      )}
    >
      {label}
    </button>
  );
}

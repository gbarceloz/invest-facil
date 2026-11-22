import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const compact = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const usdFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function money(value: number | string | null | undefined): string {
  const number = typeof value === "string" ? Number(value) : value ?? 0;
  return brl.format(Number.isFinite(number) ? number : 0);
}

export function usd(value: number | string | null | undefined): string {
  const number = typeof value === "string" ? Number(value) : value ?? 0;
  return usdFormat.format(Number.isFinite(number) ? number : 0);
}

export function compactUsd(value: number | string | null | undefined): string {
  const number = typeof value === "string" ? Number(value) : value ?? 0;
  return usdCompact.format(Number.isFinite(number) ? number : 0);
}

export function compactMoney(value: number | string | null | undefined): string {
  const number = typeof value === "string" ? Number(value) : value ?? 0;
  return `R$ ${compact.format(Number.isFinite(number) ? number : 0)}`;
}

export function percent(value: number | null | undefined, digits = 1): string {
  return `${(value ?? 0).toLocaleString("pt-BR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })}%`;
}

export function plural(value: number | null | undefined, singular: string, pluralForm: string): string {
  const count = value ?? 0;
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function dayCount(value: number | null | undefined): string {
  return plural(value, "dia", "dias");
}

export function signedPercent(value: number | null | undefined): string {
  const number = value ?? 0;
  const sign = number > 0 ? "+" : "";
  return `${sign}${number.toLocaleString("pt-BR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}%`;
}

export function dateShort(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function dateLong(value: Date = new Date()): string {
  return value
    .toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    })
    .replace(/^./, (char) => char.toUpperCase());
}

export function dateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value).getTime();
  const diff = Date.now() - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} d atrás`;
  return dateShort(value);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function levelLabel(level: string): string {
  return level
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const XP_REASON_LABEL: Record<string, string> = {
  LESSON_COMPLETED: "Aula concluída",
  QUIZ_PASSED: "Quiz aprovado",
  ACHIEVEMENT: "Conquista desbloqueada",
  SIMULATION_SAVED: "Simulação salva",
};

import { cn } from "@/lib/format";

export function Alert({
  tone = "error",
  children,
  className,
}: {
  tone?: "error" | "success" | "info" | "warning";
  children: React.ReactNode;
  className?: string;
}) {
  const tones = {
    error: "border-red-500/30 bg-red-500/10 text-red-200",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    info: "border-sky-500/30 bg-sky-500/10 text-sky-200",
    warning: "border-accent/30 bg-accent/10 text-accent",
  };
  return (
    <div
      className={cn("rounded-xl border px-4 py-3 text-sm", tones[tone], className)}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon && <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-ink-700 text-accent">{icon}</div>}
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Spinner({ label = "Carregando" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-sm text-muted" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink-500 border-t-accent" />
      {label}…
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-ink-700", className)} />;
}

export function Disclaimer({ text, className }: { text?: string; className?: string }) {
  return (
    <p className={cn("text-xs leading-5 text-neutral-400", className)}>
      {text ??
        "Conteúdo educativo. Não constitui recomendação de investimento. Simulações usam taxas hipotéticas e não representam garantia de retorno."}
    </p>
  );
}

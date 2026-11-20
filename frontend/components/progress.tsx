import { cn } from "@/lib/format";

export function ProgressBar({
  value,
  className,
  barClassName,
  label,
}: {
  value: number;
  className?: string;
  barClassName?: string;
  label?: string;
}) {
  const safe = Math.min(100, Math.max(0, value));
  return (
    <div className={className}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
          <span>{label}</span>
          <span className="font-semibold text-neutral-200">{Math.round(safe)}%</span>
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-ink-600"
        role="progressbar"
        aria-valuenow={Math.round(safe)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progresso"}
      >
        <div
          className={cn("h-full rounded-full bg-accent transition-all duration-500", barClassName)}
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}

export function LevelRing({
  percent,
  level,
  xp,
  size = 132,
}: {
  percent: number;
  level: number;
  xp: number;
  size?: number;
}) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const safe = Math.min(100, Math.max(0, percent));
  const offset = circumference - (safe / 100) * circumference;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.09)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#facc15"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Nível {level}</p>
          <p className="text-2xl font-extrabold leading-tight">{xp.toLocaleString("pt-BR")}</p>
          <p className="text-[10px] text-muted">XP</p>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { cn } from "@/lib/format";

function Mark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid h-9 w-9 place-items-center overflow-hidden rounded-[10px] bg-ink-950 ring-1 ring-white/10 transition group-hover:scale-105",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 40 40" className="h-9 w-9" role="img">
        <path
          d="M9 14.8 L29 5.2 L29 12.6 C29 14.5 27.7 15.9 26.0 16.5 L9 22.5 Z"
          fill="#FACC15"
        />
        <path
          d="M9 23.7 L23 17.8 L23 25.0 C23 26.9 21.7 28.3 20.0 28.9 L9 33.0 Z"
          fill="#FACC15"
        />
        <path d="M9 14.8 L12.8 13.2 L12.8 33.8 L9 35.2 Z" fill="#EAB308" />
      </svg>
    </span>
  );
}

export function Logo({
  href = "/",
  compact = false,
  className,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="Invest Fácil — início"
    >
      <Mark />
      {!compact && (
        <span className="text-[17px] font-extrabold tracking-[-0.03em]">
          Invest <span className="text-accent">Fácil</span>
        </span>
      )}
    </Link>
  );
}

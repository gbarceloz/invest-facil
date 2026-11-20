import Link from "next/link";
import { cn } from "@/lib/format";

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
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-sm font-black text-ink-950 transition group-hover:scale-105">
        IF
      </span>
      {!compact && (
        <span className="text-[17px] font-extrabold tracking-tight">
          Invest <span className="text-accent">Fácil</span>
        </span>
      )}
    </Link>
  );
}

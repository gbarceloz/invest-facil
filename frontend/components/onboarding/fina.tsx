"use client";

import Image from "next/image";
import { cn } from "@/lib/format";

/**
 * Apenas poses com o desenho completo. Os assets "think" e "worried-head" têm
 * recorte no topo e não devem ser usados como avatar.
 */
export type FinaPose = "wave" | "coin" | "jump" | "book" | "run";

const SRC: Record<FinaPose, string> = {
  wave: "/brand/fina/fina-wave.png",
  coin: "/brand/fina/fina-coin.png",
  jump: "/brand/fina/fina-jump.png",
  book: "/brand/fina/fina-book.png",
  run: "/brand/fina/fina-run.png",
};

const SIZE: Record<FinaPose, { width: number; height: number }> = {
  wave: { width: 389, height: 548 },
  coin: { width: 426, height: 618 },
  jump: { width: 395, height: 570 },
  book: { width: 422, height: 534 },
  run: { width: 388, height: 556 },
};

export function Fina({
  pose = "wave",
  className,
  size = 72,
  priority = false,
  animated = true,
}: {
  pose?: FinaPose;
  className?: string;
  size?: number;
  priority?: boolean;
  animated?: boolean;
}) {
  const dimensions = SIZE[pose];
  return (
    <Image
      src={SRC[pose]}
      alt=""
      aria-hidden="true"
      width={dimensions.width}
      height={dimensions.height}
      priority={priority}
      sizes={`${size}px`}
      className={cn(
        "h-auto w-auto max-h-full max-w-full select-none object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)]",
        animated && "fina-bob",
        className,
      )}
      style={{ maxWidth: size, maxHeight: size }}
    />
  );
}

export function AssistantBubble({
  children,
  pose = "wave",
  className,
  animate = true,
}: {
  children: React.ReactNode;
  pose?: FinaPose;
  className?: string;
  animate?: boolean;
}) {
  return (
    <div className={cn("flex items-start gap-3", animate && "onb-enter", className)}>
      <div className="relative mt-1 shrink-0">
        <span className="absolute inset-x-1 bottom-1 h-8 rounded-full bg-accent/15 blur-xl" aria-hidden="true" />
        <div className="relative grid h-16 w-16 place-items-center rounded-2xl border border-accent/15 bg-[#121212] p-1.5">
          <Fina pose={pose} size={50} />
        </div>
      </div>
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-white/[0.08] bg-[#141414] px-4 py-3.5 text-[14px] leading-6 text-neutral-200 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.9)]">
        {children}
      </div>
    </div>
  );
}

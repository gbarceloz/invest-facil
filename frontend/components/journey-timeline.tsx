"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/format";

export type JourneyStep = {
  title: string;
  description: string;
};

function reducedMotion() {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Linha do tempo vertical cuja trilha é preenchida conforme o scroll avança.
 * Cada marco acende quando a linha o alcança e o texto entra junto, criando a
 * sensação de conteúdo "carregando" no ritmo da leitura.
 */
export function JourneyTimeline({ steps }: { steps: JourneyStep[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reducedMotion()) {
      setProgress(1);
      return;
    }
    const node = containerRef.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const anchor = window.innerHeight * 0.62;
      const value = (anchor - rect.top) / Math.max(rect.height, 1);
      setProgress(Math.min(1, Math.max(0, value)));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div
        aria-hidden="true"
        className="absolute left-[19px] top-4 bottom-4 w-px overflow-hidden bg-white/[0.08] sm:left-[23px]"
      >
        <div
          className="h-full w-full origin-top bg-gradient-to-b from-accent via-accent to-accent/20"
          style={{ transform: `scaleY(${progress})`, transition: "transform 140ms linear" }}
        />
      </div>

      <ol className="relative space-y-14 sm:space-y-20 lg:space-y-24">
        {steps.map((step, index) => {
          const visible = progress >= (index + 0.15) / steps.length;
          const reached = progress >= (index + 0.55) / steps.length;
          return (
            <li key={step.title} className="relative pl-14 sm:pl-20">
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-full border text-[10px] font-semibold transition-all duration-500 sm:h-12 sm:w-12 sm:text-[11px]",
                  reached
                    ? "border-accent bg-accent text-ink-950 shadow-[0_0_30px_rgba(250,204,21,0.28)]"
                    : visible
                      ? "border-accent/40 bg-[#0d0d0d] text-accent"
                      : "border-white/10 bg-[#0d0d0d] text-neutral-500",
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div
                data-reveal="up"
                data-visible={visible ? "true" : "false"}
              >
                <h3 className="text-[20px] font-medium tracking-[-0.03em] text-neutral-100 sm:text-[24px]">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xl text-[12px] leading-6 text-neutral-400 sm:text-[13px]">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

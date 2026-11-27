"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/format";

type RevealVariant = "up" | "down" | "left" | "right" | "zoom" | "fade";

function reducedMotion() {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Revela o conteúdo quando ele entra na viewport. O estado inicial fica no
 * HTML (data-visible=false), então não há salto de layout; o observer só
 * troca o atributo. Com movimento reduzido, o conteúdo aparece direto.
 */
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  className,
  once = true,
  threshold = 0.12,
}: {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
  once?: boolean;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reducedMotion() || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [once, threshold]);

  return (
    <div
      ref={ref}
      data-reveal={variant}
      data-visible={visible ? "true" : "false"}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(className)}
    >
      {children}
    </div>
  );
}

/**
 * Barra fina de progresso de leitura no topo. Usa transform para não
 * recalcular layout a cada frame.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
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
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]" aria-hidden="true">
      <div
        className="h-full origin-left bg-accent transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}

/**
 * Fundo do hero com parallax discreto. A imagem é maior que a seção para
 * permitir o deslocamento sem revelar bordas.
 */
export function HeroBackdrop() {
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion()) return;
    const node = imageRef.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const offset = Math.min(window.scrollY * 0.08, 48);
      node.style.transform = `translate3d(0, ${offset}px, 0)`;
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        ref={imageRef}
        className="absolute -inset-[6%] bg-contain bg-center bg-no-repeat opacity-60 blur-[4px] brightness-[1.12] contrast-[1.05]"
        style={{ backgroundImage: "url('/brand/hero-smartphone.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#090909] via-[#090909]/10 to-[#090909]" />
      <div className="absolute inset-0 bg-[radial-gradient(46rem_30rem_at_50%_50%,transparent,rgba(9,9,9,0.1))]" />
    </div>
  );
}

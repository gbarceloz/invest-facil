"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/format";

type RevealVariant = "up" | "down" | "left" | "right" | "zoom" | "fade";

function reducedMotion() {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Observa o elemento e informa quando ele entra na viewport. Com movimento
 * reduzido — ou sem IntersectionObserver — considera visível de imediato.
 */
function useInView<T extends HTMLElement>(
  threshold = 0.12,
  rootMargin = "0px 0px -8% 0px",
  once = true,
) {
  const ref = useRef<T>(null);
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
      { threshold, rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin]);

  return { ref, visible };
}

/**
 * Revela o conteúdo quando ele entra na viewport. O estado inicial fica no
 * HTML (data-visible=false), então não há salto de layout; o observer só
 * troca o atributo.
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
  const { ref, visible } = useInView<HTMLDivElement>(threshold, "0px 0px -8% 0px", once);

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
 * Título que "carrega" palavra por palavra, cada uma subindo de dentro de uma
 * máscara. O atraso entre palavras é controlado por `step`.
 */
export function SplitText({
  text,
  className,
  delay = 0,
  step = 50,
}: {
  text: string;
  className?: string;
  delay?: number;
  step?: number;
}) {
  const { ref, visible } = useInView<HTMLSpanElement>(0.2, "0px 0px -6% 0px");
  const words = text.split(" ");

  return (
    <span
      ref={ref}
      data-split
      data-visible={visible ? "true" : "false"}
      className={cn("inline", className)}
    >
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className="split-word">
            <span
              style={{ "--i": index, "--base": `${delay}ms`, "--step": `${step}ms` } as React.CSSProperties}
            >
              {word}
            </span>
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}

/**
 * Versão do título para o hero: a animação roda no primeiro paint, via CSS,
 * sem esperar hidratação. Isso preserva o LCP e dá ritmo imediato à página.
 */
export function SplitIntro({
  text,
  className,
  delay = 0,
  step = 45,
}: {
  text: string;
  className?: string;
  delay?: number;
  step?: number;
}) {
  const words = text.split(" ");

  return (
    <span data-split-intro className={cn("inline", className)}>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className="split-word">
            <span
              style={{ "--i": index, "--base": `${delay}ms`, "--step": `${step}ms` } as React.CSSProperties}
            >
              {word}
            </span>
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}

/**
 * Aplica uma entrada escalonada aos filhos diretos quando o grupo entra na
 * viewport. Os atrasos são definidos via CSS (`--step` + nth-child).
 */
export function Stagger({
  children,
  className,
  step = 80,
  threshold = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  step?: number;
  threshold?: number;
}) {
  const { ref, visible } = useInView<HTMLDivElement>(threshold);

  return (
    <div
      ref={ref}
      data-stagger
      data-visible={visible ? "true" : "false"}
      style={{ "--step": `${step}ms` } as React.CSSProperties}
      className={cn(className)}
    >
      {children}
    </div>
  );
}

/**
 * Número que conta de zero até o valor quando aparece na tela.
 */
export function Counter({
  value,
  pad = 0,
  prefix = "",
  suffix = "",
  duration = 1600,
  className,
}: {
  value: number;
  pad?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const { ref, visible } = useInView<HTMLSpanElement>(0.5);
  // O SSR entrega o valor final (correto sem JavaScript); a contagem só
  // começa quando o número entra na viewport.
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    if (!visible || started.current) return;
    started.current = true;
    if (reducedMotion()) {
      setDisplay(value);
      return;
    }
    setDisplay(0);
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [visible, value, duration]);

  return (
    <span ref={ref} className={cn(className)}>
      {prefix}
      {String(display).padStart(pad, "0")}
      {suffix}
    </span>
  );
}

/**
 * Barra fina de progresso de leitura no topo. Escreve direto no DOM para não
 * provocar re-render a cada frame de scroll.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
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
        ref={barRef}
        className="h-full origin-left bg-accent transition-transform duration-150 ease-out"
        style={{ transform: "scaleX(0)" }}
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
      <div ref={imageRef} className="absolute -inset-[6%]">
        <Image
          src="/brand/hero-smartphone.jpg"
          alt=""
          fill
          preload
          sizes="100vw"
          className="hero-photo object-contain object-center blur-[4px] brightness-[1.12] contrast-[1.05]"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#090909] via-[#090909]/10 to-[#090909]" />
      <div className="absolute inset-0 bg-[radial-gradient(46rem_30rem_at_50%_50%,transparent,rgba(9,9,9,0.1))]" />
    </div>
  );
}

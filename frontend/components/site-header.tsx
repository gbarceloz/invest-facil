"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/format";
import { Logo } from "./logo";

/**
 * Header da landing. Fica transparente no topo e ganha fundo/blur depois que a
 * página começa a rolar, sem sair do fluxo (sticky), evitando layout shift.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 20);
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
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-500",
        scrolled
          ? "border-white/[0.07] bg-[#090909]/80 backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="flex h-16 w-full items-center px-5 sm:px-8">
        <Logo />
      </div>
    </header>
  );
}

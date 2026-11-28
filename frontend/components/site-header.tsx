"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "lucide-react";
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
      <div className="flex h-16 w-full items-center justify-between gap-4 px-5 sm:px-8">
        <Logo />
        <Link
          href="/entrar"
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] font-medium text-neutral-300 transition duration-300 hover:border-accent/30 hover:bg-accent/[0.06] hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 sm:gap-2 sm:px-3.5 sm:text-[11px]"
        >
          <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
          Acessar minha conta
        </Link>
      </div>
    </header>
  );
}

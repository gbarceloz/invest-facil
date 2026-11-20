"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Calculator,
  ChevronRight,
  Flame,
  GraduationCap,
  Home,
  Library,
  LineChart,
  LogOut,
  Search,
  Trophy,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AppDataProvider, useAppData } from "@/lib/app-data";
import { cn, dayCount, initials } from "@/lib/format";
import { Logo } from "./logo";
import { ProgressBar } from "./progress";
import { Alert, Spinner } from "./ui";

const NAV = [
  { href: "/app", label: "Início", icon: Home, exact: true },
  { href: "/app/aprender", label: "Aprender", icon: GraduationCap },
  { href: "/app/biblioteca", label: "Biblioteca", icon: Library },
  { href: "/app/mercado", label: "Mercado", icon: LineChart },
  { href: "/app/simulador", label: "Simular", icon: Calculator },
  { href: "/app/progresso", label: "Progresso", icon: Trophy },
  { href: "/app/perfil", label: "Perfil", icon: UserIcon },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Sidebar() {
  const pathname = usePathname();
  const { gamification } = useAppData();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-y-auto border-r border-ink-500/60 bg-ink-900/80 px-4 py-6 backdrop-blur-xl lg:flex">
      <div className="px-2">
        <Logo href="/app" />
      </div>

      <nav className="mt-9 flex-1 space-y-1" aria-label="Navegação principal">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-ink-700/70 hover:text-neutral-100",
              )}
            >
              <Icon className={cn("h-[18px] w-[18px]", active ? "text-accent" : "text-neutral-500 group-hover:text-neutral-300")} />
              {item.label}
              {item.label === "Aprender" && (
                <span className="ml-auto rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                  XP
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="card mt-6 space-y-3 bg-gradient-to-b from-ink-700 to-ink-800 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
            Nível {String(gamification?.level.number ?? 1).padStart(2, "0")}
          </span>
          <span className="text-[10px] text-muted">
            {gamification ? `${gamification.xp.toLocaleString("pt-BR")} XP` : "— XP"}
          </span>
        </div>
        <p className="text-sm font-extrabold">{gamification?.level.name ?? "Curioso"}</p>
        <ProgressBar value={gamification?.progressPercent ?? 0} />
        <p className="text-[10px] text-muted">
          {gamification
            ? `${gamification.xpToNextLevel.toLocaleString("pt-BR")} XP para o próximo nível`
            : "Comece sua primeira aula"}
        </p>
      </div>
    </aside>
  );
}

function Topbar() {
  const { user, logout } = useAuth();
  const { gamification, error, reload } = useAppData();
  const router = useRouter();
  const [query, setQuery] = useState("");

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-ink-500/60 bg-ink-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="lg:hidden">
          <Logo href="/app" compact />
        </div>

        <form
          className="hidden flex-1 items-center gap-2 rounded-xl border border-ink-500/80 bg-ink-800/80 px-3 py-2 text-sm text-muted focus-within:border-accent/50 sm:flex"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            const term = query.trim();
            if (term.length >= 2) {
              router.push(`/app/aprender?q=${encodeURIComponent(term)}`);
            }
          }}
        >
          <Search className="h-4 w-4 shrink-0" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar aulas, termos e artigos…"
            className="w-full bg-transparent text-neutral-200 outline-none placeholder:text-neutral-600"
            aria-label="Buscar conteúdo"
          />
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <span className="pill hidden sm:inline-flex" title="Sequência de estudos">
            <Flame className="h-3.5 w-3.5 text-accent" />
            {dayCount(gamification?.currentStreak ?? 0)}
          </span>
          <span className="pill" title="XP acumulado">
            {gamification ? `${gamification.xp.toLocaleString("pt-BR")} XP` : "— XP"}
          </span>
          <Link
            href="/app/perfil"
            className="grid h-9 w-9 place-items-center rounded-full border border-accent/30 bg-accent/10 text-xs font-extrabold text-accent"
            aria-label="Abrir perfil"
          >
            {initials(user?.name ?? "IF")}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 transition hover:bg-ink-700 hover:text-neutral-100"
            aria-label="Sair"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
      {error && (
        <div className="border-t border-red-500/20 bg-red-500/5 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-red-200">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void reload()}
              className="font-bold text-accent hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function MobileNav() {
  const pathname = usePathname();
  const items = [NAV[0], NAV[1], NAV[3], NAV[4], NAV[5]];
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-500/70 bg-ink-900/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      aria-label="Navegação mobile"
    >
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 py-3 text-[10px] font-semibold transition",
                active ? "text-accent" : "text-neutral-400",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/entrar?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="text-center">
          <Logo href="/" />
          <Spinner label="Abrindo sua jornada" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <p className="text-sm text-muted">Sessão encerrada.</p>
          <Link href="/entrar" className="btn-primary mt-4 inline-flex">
            Entrar <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AppDataProvider>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-ink-950"
      >
        Pular para o conteúdo
      </a>
      <div className="min-h-screen">
        <Sidebar />
        <div className="lg:pl-64">
          <Topbar />
          <main
            id="conteudo"
            className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12"
          >
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
    </AppDataProvider>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}

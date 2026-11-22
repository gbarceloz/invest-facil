"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bitcoin,
  Calculator,
  ChevronRight,
  Flame,
  Home,
  Library,
  LineChart,
  LogOut,
  Search,
  Trophy,
  User as UserIcon,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AppDataProvider, useAppData } from "@/lib/app-data";
import { cn, dayCount, initials } from "@/lib/format";
import { Logo } from "./logo";
import { ProgressBar } from "./progress";
import { Alert, Spinner } from "./ui";

const NAV = [
  { href: "/app", label: "Início", icon: Home, exact: true },
  { href: "/app/mercado-financeiro", label: "Mercado financeiro", icon: LineChart },
  { href: "/app/bitcoin", label: "Cripto", icon: Bitcoin },
  { href: "/app/progresso", label: "Meu progresso", icon: Trophy },
];

const SECONDARY = [
  { href: "/app/biblioteca", label: "Biblioteca", icon: Library },
  { href: "/app/simulador", label: "Simulador", icon: Calculator },
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
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col overflow-y-auto border-r border-white/[0.07] bg-[#090909] px-3 py-5 lg:flex">
      <div className="px-2">
        <Logo href="/app" />
      </div>

      <nav className="mt-7 flex-1 space-y-1" aria-label="Navegação principal">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-[12px] font-medium transition",
                active
                  ? "bg-white/[0.06] text-neutral-100"
                  : "text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-200",
              )}
            >
              <Icon className={cn("h-[18px] w-[18px]", active ? "text-accent" : "text-neutral-500 group-hover:text-neutral-300")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-white/10 pt-4">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-600">
          Mais
        </p>
        <div className="space-y-1">
          {SECONDARY.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition",
                  active
                    ? "bg-white/[0.05] text-accent"
                    : "text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-200",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-6 space-y-2.5 rounded-xl border border-white/[0.07] bg-[#111111] p-3.5">
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
    <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#090909]/90 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="lg:hidden">
          <Logo href="/app" compact />
        </div>

        <form
          className="hidden max-w-md flex-1 items-center gap-2 rounded-lg border border-white/[0.08] bg-[#111111] px-3 py-2 text-[12px] text-neutral-500 focus-within:border-accent/30 sm:flex"
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
            placeholder="Buscar aulas, termos e cripto…"
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
  const items = NAV;
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-500/70 bg-ink-900/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      aria-label="Navegação mobile"
    >
      <div className="grid grid-cols-4">
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

function FocusedLessonShell({ children }: { children: React.ReactNode }) {
  const { progress } = useAppData();
  const router = useRouter();
  const pathname = usePathname();
  const isQuiz = pathname.startsWith("/app/aprender/quiz/");
  const [quizProgress, setQuizProgress] = useState(0);

  useEffect(() => {
    if (!isQuiz) return;
    const handler = (event: Event) => {
      const value = (event as CustomEvent<number>).detail;
      if (typeof value === "number") setQuizProgress(value);
    };
    window.addEventListener("quiz:progress", handler);
    return () => window.removeEventListener("quiz:progress", handler);
  }, [isQuiz]);

  const flowProgress = isQuiz ? quizProgress : progress?.percent ?? 0;

  return (
    <div className="min-h-screen bg-[#090909]">
      <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#090909]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-4 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => router.push("/app/mercado-financeiro")}
            className="grid h-8 w-8 place-items-center rounded-md text-neutral-500 transition hover:bg-white/[0.05] hover:text-neutral-100"
            aria-label="Fechar aula"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="mx-auto w-full max-w-md">
            <div className="mb-1 flex items-center justify-between text-[9px] text-neutral-500">
              <span className="uppercase tracking-[0.16em]">{isQuiz ? "verificação de conhecimento" : "missão em andamento"}</span>
              <span>{Math.round(flowProgress)}%</span>
            </div>
            <ProgressBar value={flowProgress} />
          </div>
          <span className="shrink-0 text-[10px] font-semibold text-accent">
            {isQuiz ? "+50 XP" : "+100 XP"}
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 py-9 sm:px-6 sm:py-12">{children}</main>
    </div>
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

  const focusedLesson = pathname.startsWith("/app/aprender/aula/")
    || pathname.startsWith("/app/aprender/quiz/");

  return (
    <AppDataProvider>
      {focusedLesson ? (
        <FocusedLessonShell>{children}</FocusedLessonShell>
      ) : (
        <>
          <a
            href="#conteudo"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-ink-950"
          >
            Pular para o conteúdo
          </a>
          <div className="min-h-screen">
            <Sidebar />
            <div className="lg:pl-56">
              <Topbar />
              <main
                id="conteudo"
                className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12"
              >
                {children}
              </main>
            </div>
            <MobileNav />
          </div>
        </>
      )}
    </AppDataProvider>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}

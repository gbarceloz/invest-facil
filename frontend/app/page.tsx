import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Flame,
  LineChart,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Wallet,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Disclaimer } from "@/components/ui";

const STEPS = [
  {
    number: "01",
    title: "Aprenda",
    description: "Aulas curtas, visuais e sem jargões. Cada conceito prepara o próximo.",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "Pratique",
    description: "Teste decisões com dinheiro fictício e compare cenários no simulador.",
    icon: Target,
  },
  {
    number: "03",
    title: "Entenda",
    description: "Descubra o resultado e, principalmente, o motivo por trás de cada escolha.",
    icon: Sparkles,
  },
];

const TRACKS = [
  { icon: Wallet, title: "Fundamentos", detail: "Orçamento, reserva e juros compostos" },
  { icon: LineChart, title: "Investimentos", detail: "Renda fixa, ações, fundos e ETFs" },
  { icon: ShieldCheck, title: "Risco", detail: "Diversificação e perfil de investidor" },
  { icon: Trophy, title: "Progresso", detail: "XP, níveis e conquistas por aprender" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <header className="relative z-20">
        <div className="container-page flex h-20 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-semibold text-muted md:flex" aria-label="Navegação">
            <a href="#aprender" className="transition hover:text-neutral-50">
              Aprender
            </a>
            <a href="#como-funciona" className="transition hover:text-neutral-50">
              Como funciona
            </a>
            <a href="#filosofia" className="transition hover:text-neutral-50">
              Filosofia
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/entrar" className="btn-ghost hidden sm:inline-flex">
              Entrar
            </Link>
            <Link href="/cadastro" className="btn-primary">
              Começar agora <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative">
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <div className="container-page relative grid items-center gap-12 pb-20 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-16">
            <div className="animate-fade-up">
              <p className="eyebrow mb-5">Educação financeira para iniciantes</p>
              <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Aprenda a investir <span className="text-accent">antes</span> de colocar seu dinheiro em risco.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg">
                Aulas rápidas, desafios interativos e simulações com dinheiro fictício para você
                entender o mercado de verdade — no seu ritmo e em português.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/cadastro" className="btn-primary px-6 py-3.5 text-base">
                  Começar minha jornada <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/entrar" className="btn-secondary px-6 py-3.5 text-base">
                  Já tenho conta
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" /> Sem dinheiro real
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" /> Sem promessas de retorno
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" /> Conteúdo em português
                </span>
              </div>
            </div>

            <div className="relative animate-fade-up lg:justify-self-end">
              <div className="absolute -inset-6 rounded-[2rem] bg-accent/10 blur-3xl" aria-hidden="true" />
              <div className="relative w-full max-w-md rounded-[1.75rem] border border-ink-500/80 bg-ink-800/95 p-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="pill border-accent/30 bg-accent/10 text-accent">
                    <Sparkles className="h-3.5 w-3.5" /> Próxima missão
                  </span>
                  <span className="text-xs font-bold text-accent">+100 XP</span>
                </div>
                <div className="mt-4 rounded-2xl border border-ink-500/70 bg-ink-900/80 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                    Fundamentos • Missão 01
                  </p>
                  <h2 className="mt-2 text-xl font-extrabold">O que é blockchain?</h2>
                  <p className="mt-2 text-xs leading-5 text-muted">
                    Entenda a tecnologia por trás do Bitcoin — sem termos complicados.
                  </p>
                  <div className="mt-4 flex items-center justify-between text-[11px] text-muted">
                    <span>Iniciante · 4 min</span>
                    <span className="inline-flex items-center gap-1 text-accent">
                      <Flame className="h-3.5 w-3.5" /> 7 dias
                    </span>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-ink-500/70 bg-ink-900/80 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-200">Sua jornada</span>
                    <span className="text-muted">2 de 6</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-600">
                    <div className="h-full w-1/3 rounded-full bg-accent" />
                  </div>
                  <div className="mt-3 flex justify-between text-[10px] text-muted">
                    <span>Fundamentos</span>
                    <span>Mercado</span>
                    <span>Bitcoin</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-ink-500/70 bg-ink-900/80 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted">Nível</p>
                    <p className="mt-1 text-lg font-extrabold">01 · Curioso</p>
                  </div>
                  <div className="rounded-xl border border-ink-500/70 bg-ink-900/80 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted">XP</p>
                    <p className="mt-1 text-lg font-extrabold text-accent">420</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="aprender" className="border-y border-ink-500/50 bg-ink-900/40">
          <div className="container-page py-14">
            <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-muted">
              Um caminho claro, do zero à primeira decisão consciente
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TRACKS.map((track) => {
                const Icon = track.icon;
                return (
                  <div key={track.title} className="card card-hover p-5">
                    <Icon className="h-6 w-6 text-accent" />
                    <h3 className="mt-4 font-bold">{track.title}</h3>
                    <p className="mt-1.5 text-xs leading-5 text-muted">{track.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="container-page py-20">
          <p className="eyebrow">Como funciona</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Um próximo passo claro. Sempre.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            Do primeiro conceito à primeira decisão simulada, você aprende no seu ritmo — com
            quizzes que verificam entendimento, não cliques.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.number} className="card relative overflow-hidden p-6">
                  <span className="absolute right-5 top-4 text-4xl font-extrabold text-ink-500">
                    {step.number}
                  </span>
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-extrabold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{step.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="filosofia" className="border-y border-ink-500/50 bg-ink-900/40">
          <div className="container-page grid gap-10 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="eyebrow">A nossa filosofia</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                Informação vira conhecimento.
                <br />
                Conhecimento vira <span className="text-accent">decisão consciente</span>.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-muted">
                Não prometemos enriquecimento rápido. Não empurramos transações. Recompensamos
                estudo concluído com XP honesto — nunca com dinheiro real. O objetivo é que você
                entenda o risco antes de assumir qualquer posição.
              </p>
              <Link href="/cadastro" className="btn-primary mt-7">
                Quero começar do zero <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {[
                "Trilhas em ordem didática, com quizzes por aula.",
                "Simulador com capital, aportes, prazo e taxa hipotética.",
                "Avisos explícitos de que simulação não é garantia.",
                "Gamificação que mede aprendizado, não especulação.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-xl border border-ink-500/70 bg-ink-800/70 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <p className="text-sm leading-6 text-neutral-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container-page py-20 text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Seu primeiro passo não precisa ser um investimento.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted">
            Pode ser uma aula de quatro minutos, um quiz ou uma simulação. Comece pelo que você
            entende — e avance com contexto.
          </p>
          <Link href="/cadastro" className="btn-primary mt-8 px-7 py-3.5 text-base">
            Criar minha conta gratuita <ArrowRight className="h-4 w-4" />
          </Link>
          <Disclaimer className="mx-auto mt-10 max-w-2xl" />
        </section>
      </main>

      <footer className="border-t border-ink-500/60">
        <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo />
            <p className="mt-3 max-w-sm text-xs leading-5 text-neutral-400">
              Plataforma de educação financeira para o Hack Brasil 2026. Conteúdo educativo,
              sem recomendação de investimento e sem execução de ordens.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-muted">
            <Link href="/entrar" className="hover:text-neutral-100">
              Entrar
            </Link>
            <Link href="/cadastro" className="hover:text-neutral-100">
              Criar conta
            </Link>
            <a href="#como-funciona" className="hover:text-neutral-100">
              Como funciona
            </a>
            <a href="#filosofia" className="hover:text-neutral-100">
              Filosofia
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

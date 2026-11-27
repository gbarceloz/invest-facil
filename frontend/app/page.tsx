import Link from "next/link";
import {
  ArrowRight,
  Bitcoin,
  Check,
  ChevronRight,
  CircleDollarSign,
  LineChart,
  Lock,
  Play,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Disclaimer } from "@/components/ui";

const JOURNEY = [
  { label: "Fundamentos", state: "done" },
  { label: "Mercado", state: "current" },
  { label: "Bitcoin", state: "locked" },
];

const STEPS = [
  {
    number: "01",
    title: "Escolha seu ponto de partida",
    description: "Mercado financeiro ou Bitcoin. Duas trilhas claras, sem menus infinitos.",
  },
  {
    number: "02",
    title: "Aprenda em sequência",
    description: "Aulas curtas, exemplos visuais e quizzes que verificam entendimento.",
  },
  {
    number: "03",
    title: "Acompanhe o que importa",
    description: "Progresso, próximos passos e conceitos conectados — sem gamificação vazia.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/[0.07]">
        <div className="flex h-16 w-full items-center px-5 sm:px-8">
          <Logo />
        </div>
      </header>

      <main>
        <section id="aprender" className="relative overflow-hidden bg-[#090909]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div
              className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-60 blur-[12px] brightness-[1.12] contrast-[1.05]"
              style={{ backgroundImage: "url('/brand/hero-smartphone.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#090909] via-[#090909]/10 to-[#090909]" />
            <div className="absolute inset-0 bg-[radial-gradient(46rem_30rem_at_50%_50%,transparent,rgba(9,9,9,0.1))]" />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_42rem_at_75%_15%,rgba(250,204,21,0.07),transparent_65%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_70%_20%,black,transparent_70%)]" />
          <div className="relative mx-auto grid w-full max-w-[1240px] items-center gap-12 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pb-20 lg:pt-20">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-md border border-accent/25 bg-accent/[0.06] px-3 py-1.5 text-[10px] font-semibold text-accent">
                <Sparkles className="h-3 w-3" /> Educação financeira para iniciantes
              </span>
              <h1 className="mt-6 max-w-[720px] text-[44px] font-medium leading-[1.04] tracking-[-0.045em] text-neutral-100 sm:text-[58px] lg:text-[66px]">
                Aprenda a investir
                <br />
                <span className="text-accent">antes de colocar seu dinheiro em risco.</span>
              </h1>
              <p className="mt-6 max-w-[600px] text-[15px] leading-7 text-neutral-400">
                Aulas rápidas, desafios interativos e simulações com dinheiro fictício para você
                entender o mercado de verdade.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/comecar" className="btn-primary px-5 py-3 text-sm">
                  Começar minha jornada <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#modulos" className="btn-secondary px-5 py-3 text-sm">
                  Explorar o mercado
                </a>
              </div>
              <p className="mt-6 inline-flex items-center gap-2 text-[11px] text-neutral-500">
                <ShieldCheck className="h-4 w-4 text-accent" />
                Conteúdo educacional. Sem promessas. Sem dinheiro real.
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-[540px] animate-fade-up lg:mx-0 lg:justify-self-end">
              <div className="absolute -inset-10 rounded-full bg-accent/[0.06] blur-3xl" aria-hidden="true" />

              <div className="relative z-10 ml-auto w-[56%] rounded-xl border border-white/10 bg-[#121212]/90 p-4 shadow-2xl backdrop-blur">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">
                    <BookIcon />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Próxima missão</p>
                    <p className="mt-1 truncate text-[13px] font-semibold text-neutral-100">O que é Bitcoin?</p>
                  </div>
                  <span className="ml-auto shrink-0 text-[10px] font-semibold text-accent">+100 XP</span>
                </div>
              </div>

              <div className="relative -mt-4 rounded-2xl border border-white/10 bg-[#111111]/95 p-6 shadow-2xl sm:p-7">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent/70" />
                </div>
                <p className="mt-7 text-[9px] font-semibold uppercase tracking-[0.2em] text-accent">Sua jornada</p>
                <h2 className="mt-2 text-[26px] font-medium tracking-[-0.03em] text-neutral-100">Fundamentos do mercado</h2>

                <div className="mt-9 flex items-center justify-between gap-2">
                  {JOURNEY.map((item, index) => {
                    const done = item.state === "done";
                    const current = item.state === "current";
                    return (
                      <div key={item.label} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={`grid h-11 w-11 place-items-center rounded-full border ${
                              done
                                ? "border-accent bg-accent text-ink-950"
                                : current
                                  ? "border-accent/70 bg-accent/[0.08] text-accent"
                                  : "border-white/10 bg-white/[0.03] text-neutral-600"
                            }`}
                          >
                            {done ? <Check className="h-4 w-4" /> : current ? <Play className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
                          </div>
                          <span className={`text-[10px] ${current ? "font-semibold text-accent" : "text-neutral-500"}`}>{item.label}</span>
                        </div>
                        {index < JOURNEY.length - 1 && (
                          <div className="mx-2 mb-5 h-px flex-1 bg-white/10">
                            <div className={`h-px ${done ? "w-full bg-accent" : "w-0"}`} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8">
                  <div className="flex items-center justify-between text-[10px] text-neutral-500">
                    <span>2 de 6</span>
                    <span>missões concluídas</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-1/3 rounded-full bg-accent" />
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-8 rounded-xl border border-white/10 bg-[#141414]/95 px-4 py-3 shadow-xl backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/10 text-accent">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-neutral-100">7 dias</p>
                    <p className="text-[10px] text-neutral-500">sequência de estudos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="border-y border-white/[0.06] bg-[#0c0c0c]">
          <div className="container-page py-16 text-center sm:py-20">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Como funciona</p>
            <h2 className="mx-auto mt-4 max-w-2xl text-[32px] font-medium tracking-[-0.04em] text-neutral-100 sm:text-[42px]">
              Um próximo passo claro. Sempre.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-neutral-400">
              Do primeiro conceito à primeira decisão simulada, você aprende no seu ritmo — com
              quizzes que verificam entendimento, não cliques.
            </p>

            <div className="mt-12 grid gap-4 text-left md:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.number} className="rounded-xl border border-white/[0.07] bg-[#111111] p-6">
                  <span className="text-[10px] font-semibold tracking-[0.16em] text-accent">{step.number}</span>
                  <h3 className="mt-5 text-[15px] font-semibold text-neutral-100">{step.title}</h3>
                  <p className="mt-2 text-[12px] leading-6 text-neutral-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="modulos" className="container-page py-16 sm:py-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Dois módulos</p>
              <h2 className="mt-3 text-[30px] font-medium tracking-[-0.04em] text-neutral-100 sm:text-[38px]">
                O que você precisa entender, na ordem certa.
              </h2>
            </div>
            <p className="max-w-sm text-[12px] leading-6 text-neutral-500">
              Nada de dez categorias ou gráficos decorativos. Cada módulo tem uma promessa simples:
              explicar bem.
            </p>
          </div>

          <div className="mt-9 grid gap-4 lg:grid-cols-2">
            <Link href="/app/mercado-financeiro" className="group rounded-xl border border-white/[0.08] bg-[#111111] p-6 transition hover:border-accent/25">
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent">
                  <LineChart className="h-5 w-5" />
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-600 transition group-hover:text-accent" />
              </div>
              <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">Módulo 01</p>
              <h3 className="mt-2 text-[24px] font-medium tracking-[-0.03em] text-neutral-100">Mercado financeiro</h3>
              <p className="mt-2 text-[12px] leading-6 text-neutral-400">
                Inflação, Selic, renda fixa, ações, ETFs e risco. A base para entender o sistema — não
                para seguir dicas.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Inflação", "Selic", "Renda fixa", "Ações", "ETFs"].map((topic) => (
                  <span key={topic} className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-neutral-400">{topic}</span>
                ))}
              </div>
            </Link>

            <Link href="/app/bitcoin" className="group rounded-xl border border-white/[0.08] bg-[#111111] p-6 transition hover:border-accent/25">
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent">
                  <Bitcoin className="h-5 w-5" />
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-600 transition group-hover:text-accent" />
              </div>
              <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">Módulo 02</p>
              <h3 className="mt-2 text-[24px] font-medium tracking-[-0.03em] text-neutral-100">Bitcoin</h3>
              <p className="mt-2 text-[12px] leading-6 text-neutral-400">
                A tecnologia, a escassez e a custódia explicadas do zero. O mercado como contexto
                educacional, com dados reais e sem promessas.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Blockchain", "21 milhões", "Mineração", "Carteiras", "Volatilidade"].map((topic) => (
                  <span key={topic} className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-neutral-400">{topic}</span>
                ))}
              </div>
            </Link>
          </div>
        </section>

        <section className="container-page pb-20 text-center">
          <div className="mx-auto max-w-2xl rounded-xl border border-white/[0.07] bg-[#111111] px-6 py-10">
            <CircleDollarSign className="mx-auto h-6 w-6 text-accent" />
            <h2 className="mt-4 text-[28px] font-medium tracking-[-0.04em] text-neutral-100">
              Seu primeiro passo não precisa ser um investimento.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[13px] leading-6 text-neutral-400">
              Pode ser uma aula de quatro minutos sobre inflação, uma introdução ao Bitcoin ou um quiz.
            </p>
            <Link href="/comecar" className="btn-primary mt-6 px-5 py-3 text-sm">
              Criar minha conta gratuita <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <Disclaimer className="mx-auto mt-8 max-w-2xl text-[11px]" />
        </section>
      </main>

      <footer className="border-t border-white/[0.07]">
        <div className="container-page flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo />
            <p className="mt-3 max-w-sm text-[11px] leading-5 text-neutral-500">
              Plataforma de educação financeira. Conteúdo educativo, sem recomendação de investimento
              e sem execução de ordens.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-neutral-500">
            <Link href="/entrar" className="hover:text-neutral-100">Entrar</Link>
            <Link href="/comecar" className="hover:text-neutral-100">Criar conta</Link>
            <a href="#modulos" className="hover:text-neutral-100">Módulos</a>
            <a href="#como-funciona" className="hover:text-neutral-100">Como funciona</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
      <path d="M4 5.5v16" />
    </svg>
  );
}

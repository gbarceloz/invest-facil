import Link from "next/link";
import {
  Award,
  ArrowRight,
  Bitcoin,
  BookOpen,
  Calculator,
  Check,
  ChevronRight,
  CircleDollarSign,
  Flame,
  LineChart,
  Lock,
  Play,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { JourneyTimeline, type JourneyStep } from "@/components/journey-timeline";
import {
  Counter,
  HeroBackdrop,
  Reveal,
  ScrollProgress,
  SplitIntro,
  SplitText,
  Stagger,
} from "@/components/scroll-effects";
import { SiteHeader } from "@/components/site-header";
import { Disclaimer } from "@/components/ui";

const JOURNEY = [
  { label: "Fundamentos", state: "done" },
  { label: "Mercado", state: "current" },
  { label: "Bitcoin", state: "locked" },
];

const STEPS: JourneyStep[] = [
  {
    title: "Responda 7 perguntas",
    description:
      "Objetivos, situações e quanto sobra por mês. Sem renda, sem extrato e sem julgamento.",
  },
  {
    title: "Receba seu perfil",
    description:
      "Um retrato honesto do seu momento financeiro, com o que já está saudável e o que merece atenção.",
  },
  {
    title: "Aprenda em sequência",
    description:
      "Aulas curtas, exemplos visuais e quizzes que verificam entendimento — não cliques.",
  },
  {
    title: "Simule sem risco",
    description:
      "Decisões com dinheiro fictício para entender o efeito de cada escolha antes de arriscar o seu.",
  },
];

const STATS = [
  { value: 2, pad: 2, suffix: "", label: "módulos completos" },
];

const FEATURES = [
  {
    icon: BookOpen,
    title: "Aulas guiadas",
    description: "Trilhas curtas, na ordem certa, com quizzes que verificam entendimento — não cliques.",
  },
  {
    icon: Calculator,
    title: "Simulador sem risco",
    description: "Teste juros, inflação e aportes com dinheiro fictício antes de decidir qualquer coisa.",
  },
  {
    icon: Trophy,
    title: "Progresso visível",
    description: "Acompanhe XP, sequência de estudo e domínio por tema em um painel que reflete o que você fez.",
  },
];

const GAMIFICATION = [
  { icon: Zap, label: "XP por aula", description: "Cada missão concluída soma experiência de verdade." },
  { icon: Flame, label: "Sequência", description: "Dias seguidos de estudo, sem punição por pausas." },
  { icon: Award, label: "Conquistas", description: "Marcos de aprendizado, não de cliques ou transações." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090909]">
      <ScrollProgress />
      <SiteHeader />

      <main>
        <section id="aprender" className="relative overflow-hidden bg-[#090909]">
          <HeroBackdrop />
          <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_70%_20%,black,transparent_70%)]" />
          <div className="relative mx-auto grid w-full max-w-[1240px] items-center gap-12 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pb-20 lg:pt-20">
            <div>
              <h1 className="max-w-[760px] text-[44px] font-medium leading-[1.04] tracking-[-0.045em] text-neutral-100 sm:text-[58px] lg:text-[66px]">
                <SplitIntro text="Aprenda a investir" delay={80} step={55} />
                <br />
                <span className="text-accent">
                  <SplitIntro text="antes de colocar seu dinheiro em risco." delay={190} step={38} />
                </span>
              </h1>
              <Reveal variant="up" delay={260}>
                <p className="mt-6 max-w-[600px] text-[15px] leading-7 text-neutral-400">
                  Aulas rápidas, desafios e simulações fictícias para você entender o mercado.
                </p>
              </Reveal>
              <Reveal variant="up" delay={340}>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/comecar" className="btn-primary px-5 py-3 text-sm">
                    Começar minha jornada <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href="#modulos" className="btn-secondary px-5 py-3 text-sm">
                    Explorar o mercado
                  </a>
                </div>
              </Reveal>
            </div>

            <Reveal
              variant="right"
              delay={120}
              className="relative mx-auto w-full max-w-[540px] lg:mx-0 lg:justify-self-end"
            >
              <div className="float-y relative z-10 ml-auto w-[56%] rounded-xl border border-white/10 bg-[#121212]/90 p-4 shadow-2xl backdrop-blur">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">
                    <BookIcon />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Próxima missão</p>
                    <p className="mt-1 truncate text-[13px] font-semibold text-neutral-100">O que é Bitcoin?</p>
                  </div>
                  <span className="ml-auto shrink-0 text-[10px] font-semibold text-accent">
                    <Counter value={100} prefix="+" suffix=" XP" />
                  </span>
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
                    <span><Counter value={2} /> de 6</span>
                    <span>missões concluídas</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="hero-progress h-full rounded-full bg-accent" />
                  </div>
                </div>
              </div>

              <div className="float-y-delayed absolute -bottom-6 -left-8 rounded-xl border border-white/10 bg-[#141414]/95 px-4 py-3 shadow-xl backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/10 text-accent">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-neutral-100"><Counter value={7} /> dias</p>
                    <p className="text-[10px] text-neutral-500">sequência de estudos</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative overflow-hidden">
          <div className="container-page py-20 text-center sm:py-28">
            <Reveal variant="fade">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-accent">Nosso ponto de partida</p>
            </Reveal>
            <h2 className="mx-auto mt-6 max-w-4xl text-[38px] font-medium leading-[1.06] tracking-[-0.045em] text-neutral-100 sm:text-[62px]">
              <SplitText text="Investir não é apostar." step={50} />
              <br />
              <span className="text-accent">
                <SplitText text="É entender o jogo." delay={140} step={50} />
              </span>
            </h2>
            <p className="mx-auto mt-7 max-w-2xl text-[14px] leading-7 text-neutral-400 sm:text-[15px]">
              <SplitText
                text="Sem promessas de retorno, sem pressa e sem dinheiro real. Só clareza, um conceito por vez."
                delay={260}
                step={18}
              />
            </p>
          </div>

          <div className="container-page pb-20 sm:pb-28">
            <Reveal variant="up" delay={80}>
              <div className="mx-auto max-w-sm overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.06]">
                {STATS.map((stat) => (
                  <div key={stat.label} className="bg-[#0d0d0d] px-6 py-9 text-center">
                    <p className="text-[42px] font-medium leading-none tracking-[-0.05em] text-neutral-100">
                      <Counter value={stat.value} pad={stat.pad} suffix={stat.suffix} />
                    </p>
                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section id="como-funciona" className="scroll-mt-24 border-y border-white/[0.06] bg-[#0c0c0c]">
          <div className="container-page grid gap-12 py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:py-28">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal variant="fade">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-accent">Como funciona</p>
              </Reveal>
              <h2 className="mt-4 text-[32px] font-medium leading-[1.08] tracking-[-0.04em] text-neutral-100 sm:text-[44px]">
                <SplitText text="Do primeiro clique à primeira decisão." step={42} />
              </h2>
              <Reveal variant="up" delay={180}>
                <p className="mt-6 max-w-md text-sm leading-6 text-neutral-400">
                  Quatro passos, sem atalhos e sem gamificação vazia. Você entende o conceito antes de
                  avançar — e vê sua evolução a cada etapa.
                </p>
              </Reveal>
            </div>
            <JourneyTimeline steps={STEPS} />
          </div>
        </section>

        <section id="plataforma" className="container-page scroll-mt-24 py-20 sm:py-24">
          <Reveal
            variant="up"
            className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-accent">A plataforma</p>
              <h2 className="mt-3 max-w-2xl text-[30px] font-medium tracking-[-0.04em] text-neutral-100 sm:text-[42px]">
                <SplitText text="Aprender, simular e acompanhar — no mesmo lugar." step={30} />
              </h2>
            </div>
            <p className="max-w-sm text-[12px] leading-6 text-neutral-500">
              Três ferramentas simples, conectadas pelo mesmo objetivo: fazer você entender antes de
              decidir.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Reveal key={feature.title} variant="up" delay={index * 110} className="h-full">
                  <div className="group flex h-full flex-col rounded-xl border border-white/[0.08] bg-[#111111] p-6 transition duration-500 hover:-translate-y-1 hover:border-accent/25 hover:bg-[#141414] hover:shadow-[0_24px_60px_-32px_rgba(0,0,0,0.95)]">
                    <span className="grid h-11 w-11 place-items-center rounded-lg bg-accent/10 text-accent transition duration-500 group-hover:bg-accent group-hover:text-ink-950">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-6 text-[18px] font-medium tracking-[-0.02em] text-neutral-100">{feature.title}</h3>
                    <p className="mt-2 text-[12px] leading-6 text-neutral-400">{feature.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal variant="up" delay={120}>
            <div className="mt-4 grid overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d0d0d] lg:grid-cols-[1.05fr_0.95fr]">
              <div className="p-6 sm:p-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Gamificação com propósito</p>
                <h3 className="mt-4 max-w-md text-[24px] font-medium leading-[1.15] tracking-[-0.035em] text-neutral-100 sm:text-[28px]">
                  Seu avanço fica visível — sem transformar estudo em cassino.
                </h3>
                <p className="mt-3 max-w-md text-[12px] leading-6 text-neutral-400">
                  XP, sequência e conquistas existem para sustentar consistência, não para viciar. Nada
                  aqui depende de dinheiro real.
                </p>
              </div>
              <div className="grid gap-px bg-white/[0.06] sm:grid-cols-3 lg:grid-cols-1">
                {GAMIFICATION.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-3 bg-[#0b0b0b] px-5 py-5">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-accent/20 bg-accent/[0.06] text-accent">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[12px] font-semibold text-neutral-100">{item.label}</p>
                        <p className="mt-1 text-[10px] leading-5 text-neutral-500">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </section>

        <section id="modulos" className="container-page scroll-mt-24 py-16 sm:py-24">
          <Reveal variant="up" className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Dois módulos</p>
              <h2 className="mt-3 max-w-xl text-balance text-[30px] font-medium tracking-[-0.04em] text-neutral-100 sm:text-[38px]">
                <SplitText text="O que você precisa entender, na ordem certa." step={30} />
              </h2>
            </div>
            <p className="max-w-sm text-[12px] leading-6 text-neutral-500">
              Nada de dez categorias ou gráficos decorativos. Cada módulo tem uma promessa simples:
              explicar bem.
            </p>
          </Reveal>

          <div className="mt-9 grid gap-4 lg:grid-cols-2">
            <Reveal variant="up" delay={80} className="h-full">
              <Link href="/app/mercado-financeiro" className="group flex h-full flex-col rounded-xl border border-white/[0.08] bg-[#111111] p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/25 hover:bg-[#141414] hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)]">
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
                <Stagger step={50} className="mt-5 flex flex-wrap gap-2">
                  {["Inflação", "Selic", "Renda fixa", "Ações", "ETFs"].map((topic) => (
                    <span key={topic} className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-neutral-400">{topic}</span>
                  ))}
                </Stagger>
              </Link>
            </Reveal>

            <Reveal variant="up" delay={160} className="h-full">
              <Link href="/app/bitcoin" className="group flex h-full flex-col rounded-xl border border-white/[0.08] bg-[#111111] p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/25 hover:bg-[#141414] hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)]">
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
                <Stagger step={50} className="mt-5 flex flex-wrap gap-2">
                  {["Blockchain", "21 milhões", "Mineração", "Carteiras", "Volatilidade"].map((topic) => (
                    <span key={topic} className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-neutral-400">{topic}</span>
                  ))}
                </Stagger>
              </Link>
            </Reveal>
          </div>
        </section>

        <section className="container-page pb-20 text-center">
          <Reveal variant="zoom">
            <div className="relative mx-auto max-w-2xl overflow-hidden rounded-xl border border-white/[0.07] bg-[#111111] px-6 py-10">
              <div
                aria-hidden="true"
                className="onb-glow pointer-events-none absolute -inset-24 bg-[radial-gradient(24rem_12rem_at_50%_0%,rgba(250,204,21,0.14),transparent_70%)]"
              />
              <div className="relative">
                <CircleDollarSign className="mx-auto h-6 w-6 text-accent" />
                <h2 className="mt-4 text-balance text-[28px] font-medium tracking-[-0.04em] text-neutral-100">
                  <SplitText text="Seu primeiro passo não precisa ser um investimento." step={30} />
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-[13px] leading-6 text-neutral-400">
                  Pode ser uma aula de quatro minutos sobre inflação, uma introdução ao Bitcoin ou um quiz.
                </p>
                <Link href="/comecar" className="btn-primary mt-6 px-5 py-3 text-sm">
                  Criar minha conta gratuita <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Reveal>
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
            <a href="#plataforma" className="hover:text-neutral-100">Plataforma</a>
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

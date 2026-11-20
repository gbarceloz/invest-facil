import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative hidden overflow-hidden border-r border-ink-500/60 bg-ink-900/60 p-10 lg:flex lg:flex-col">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />
        <div className="relative">
          <Logo />
          <div className="mt-24 max-w-md">
            <p className="eyebrow">Sua jornada começa aqui</p>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight">
              Entenda o risco <span className="text-accent">antes</span> de arriscar.
            </h2>
            <p className="mt-5 text-sm leading-7 text-muted">
              Trilhas curtas, quizzes e simulações com dinheiro fictício. Sem promessas de
              rentabilidade e sem pressão para investir.
            </p>
          </div>
          <ul className="mt-10 space-y-4">
            {[
              "Conteúdo em português, do zero ao primeiro passo.",
              "XP por aula concluída e quiz aprovado — não por cliques.",
              "Simulador educativo com taxa hipotética e aviso claro.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-neutral-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mt-auto flex items-center gap-2 text-xs text-neutral-400">
          <ShieldCheck className="h-4 w-4 text-accent" />
          Seus dados são protegidos. Nenhuma operação real é executada.
        </div>
      </aside>

      <main className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between p-5 lg:hidden">
          <Logo />
          <Link href="/" className="btn-ghost text-xs">
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-14 pt-4 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 hidden lg:block">
              <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-muted transition hover:text-neutral-100">
                <ArrowLeft className="h-4 w-4" /> Voltar ao início
              </Link>
            </div>
            <div className="card p-6 sm:p-8">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
                <Sparkles className="h-3 w-3" /> Invest Fácil
              </span>
              <h1 className="mt-5 text-2xl font-extrabold tracking-tight">{title}</h1>
              <p className="mt-2 text-sm leading-6 text-muted">{subtitle}</p>
              <div className="mt-7">{children}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

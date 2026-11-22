import Link from "next/link";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-[#090909] lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden border-r border-white/[0.07] bg-[#0d0d0d] p-10 lg:flex lg:flex-col">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(38rem_28rem_at_20%_70%,rgba(250,204,21,0.07),transparent_65%)]" />
        <div className="relative">
          <Logo />
          <div className="mt-28 max-w-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">Comece pelo próximo passo</p>
            <h2 className="mt-5 text-[40px] font-medium leading-[1.08] tracking-[-0.045em] text-neutral-100">
              Você não precisa saber tudo para começar.
            </h2>
            <p className="mt-5 max-w-sm text-[13px] leading-6 text-neutral-400">
              O Invest Fácil descobre seu nível e constrói uma jornada para você.
            </p>
          </div>
        </div>
        <div className="relative mt-auto flex items-center gap-2 text-[11px] text-neutral-500">
          <ShieldCheck className="h-4 w-4 text-accent" />
          Ambiente educacional seguro. Nenhuma operação real é executada.
        </div>
      </aside>

      <main className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between p-5 lg:hidden">
          <Logo />
          <Link href="/" className="btn-ghost text-[11px]">
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-14 pt-4 sm:px-8">
          <div className="w-full max-w-sm">
            <div className="mb-8 hidden lg:block">
              <Link href="/" className="inline-flex items-center gap-2 text-[11px] font-medium text-neutral-500 transition hover:text-neutral-200">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Link>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-accent/25 bg-accent/[0.06] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-accent">
              <Sparkles className="h-3 w-3" /> Invest Fácil
            </span>
            <h1 className="mt-5 text-[28px] font-medium tracking-[-0.035em] text-neutral-100">{title}</h1>
            <p className="mt-2 text-[12px] leading-6 text-neutral-400">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

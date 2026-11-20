import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-md text-center">
        <Logo />
        <div className="card mt-8 p-7">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent">
            <SearchX className="h-6 w-6" />
          </div>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-accent">404</p>
          <h1 className="mt-1 text-xl font-extrabold">Página não encontrada</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            O endereço pode ter mudado ou o conteúdo ainda não foi publicado.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/app/aprender" className="btn-primary w-full">
              Explorar trilhas
            </Link>
            <Link href="/" className="btn-ghost w-full text-xs">
              <ArrowLeft className="h-4 w-4" /> Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

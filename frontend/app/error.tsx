"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, RotateCcw } from "lucide-react";
import { Logo } from "@/components/logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-md text-center">
        <Logo />
        <div className="card mt-8 p-7">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-500/10 text-red-300">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-extrabold">Algo saiu do caminho</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Não foi possível carregar esta página. Seus dados de progresso não foram perdidos.
          </p>
          {error.digest && (
            <p className="mt-3 text-[10px] text-neutral-400">Referência: {error.digest}</p>
          )}
          <div className="mt-6 flex flex-col gap-2">
            <button type="button" onClick={reset} className="btn-primary w-full">
              <RotateCcw className="h-4 w-4" /> Tentar novamente
            </button>
            <Link href="/app" className="btn-secondary w-full">
              Ir para o início <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

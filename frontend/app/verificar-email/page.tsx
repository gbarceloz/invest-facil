"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { Alert, Spinner } from "@/components/ui";
import { ApiError, api } from "@/lib/api";

function VerifyEmailContent() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Confirmando seu e-mail…");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!token) {
      setState("error");
      setMessage("Link inválido: token ausente.");
      return;
    }
    api
      .post<{ message: string }>("/api/v1/auth/verify-email", { token })
      .then((response) => {
        setState("success");
        setMessage(response.message);
      })
      .catch((error: unknown) => {
        setState("error");
        setMessage(
          error instanceof ApiError ? error.message : "Não foi possível confirmar o e-mail.",
        );
      });
  }, [token]);

  if (state === "loading") return <Spinner label="Confirmando e-mail" />;

  return (
    <div className="space-y-5">
      {state === "success" ? (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{message}</p>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-200">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{message}</p>
        </div>
      )}
      {state === "error" && (
        <Alert tone="info">
          Entre na sua conta e use “Reenviar e-mail” no Perfil para receber um novo link.
        </Alert>
      )}
      <Link href="/entrar" className="btn-primary w-full">
        Ir para o login <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout title="Verificação de e-mail" subtitle="Estamos validando seu link de confirmação.">
      <Suspense fallback={<Loader2 className="mx-auto h-6 w-6 animate-spin text-accent" />}>
        <VerifyEmailContent />
      </Suspense>
    </AuthLayout>
  );
}

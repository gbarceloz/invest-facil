"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { Alert, Spinner } from "@/components/ui";
import { ApiError, api } from "@/lib/api";

type VerifyState = "loading" | "success" | "error";

function friendlyVerifyError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "TOKEN_EXPIRED":
        return "Este link de confirmação expirou. Peça um novo abaixo.";
      case "TOKEN_USED":
        return "Este link já foi usado. Se a conta já está confirmada, entre normalmente.";
      case "TOKEN_INVALID":
        return "Link inválido. Peça um novo abaixo.";
      default:
        return error.message;
    }
  }
  return error instanceof Error ? error.message : "Não foi possível confirmar o e-mail.";
}

function VerifyEmailContent() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("Confirmando seu e-mail…");
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!token) {
      setState("error");
      setErrorCode("TOKEN_MISSING");
      setMessage("Link inválido: token ausente. Peça um novo e-mail de confirmação abaixo.");
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
        setErrorCode(error instanceof ApiError ? error.code : null);
        setMessage(friendlyVerifyError(error));
      });
  }, [token]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function handleResend(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim() || resending || cooldown > 0) return;
    setResending(true);
    setResendNotice(null);
    setResendError(null);
    try {
      await api.post("/api/v1/auth/resend-verification", { email: email.trim() });
      setResendNotice(
        "Se este e-mail estiver cadastrado e pendente, um novo link de confirmação foi enviado.",
      );
      setCooldown(60);
    } catch (error) {
      setResendError(
        error instanceof ApiError
          ? error.message
          : "Não foi possível reenviar agora. Tente novamente em instantes.",
      );
    } finally {
      setResending(false);
    }
  }

  if (state === "loading") return <Spinner label="Confirmando e-mail" />;

  if (state === "success") {
    return (
      <div className="space-y-5">
        <div
          className="flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-200"
          role="status"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{message}</p>
        </div>
        <p className="text-[11px] leading-5 text-neutral-500">
          A confirmação não cria sessão automaticamente. Entre com seu e-mail e senha para continuar
          a jornada.
        </p>
        <Link href="/entrar" className="btn-primary w-full">
          Ir para o login <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-200"
        role="alert"
      >
        <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p>{message}</p>
          {errorCode === "TOKEN_EXPIRED" && (
            <p className="mt-1 text-[11px] text-red-200/80">Links de confirmação valem por 24 horas.</p>
          )}
        </div>
      </div>

      <form onSubmit={handleResend} className="space-y-3">
        <div>
          <label htmlFor="resend-email" className="label">
            E-mail da conta
          </label>
          <input
            id="resend-email"
            type="email"
            className="input"
            placeholder="voce@email.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn-secondary w-full"
          disabled={resending || cooldown > 0}
        >
          {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {cooldown > 0 ? `Aguarde ${cooldown}s para reenviar` : "Reenviar link de confirmação"}
        </button>
        {resendNotice && (
          <Alert tone="success" className="text-[12px]">
            {resendNotice}
          </Alert>
        )}
        {resendError && (
          <Alert tone="error" className="text-[12px]">
            {resendError}
          </Alert>
        )}
        <p className="text-[10px] leading-5 text-neutral-500">
          Por segurança, a resposta é sempre a mesma, com ou sem conta cadastrada. Aguarde 60
          segundos entre reenvios; o link anterior é invalidado.
        </p>
      </form>

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

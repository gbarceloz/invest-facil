"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { Alert, Spinner } from "@/components/ui";
import { ApiError, api } from "@/lib/api";

const PASSWORD_RULE = "Use ao menos 8 caracteres, com letras e números.";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!token) {
      setError("Link inválido: token ausente.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não conferem.");
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,72}$/.test(password)) {
      setError(PASSWORD_RULE);
      return;
    }
    setSubmitting(true);
    try {
      const response = await api.post<{ message: string }>("/api/v1/auth/reset-password", {
        token,
        password,
      });
      setMessage(response.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível redefinir a senha.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-5">
        <Alert>Link inválido: token ausente. Solicite uma nova recuperação de senha.</Alert>
        <Link href="/recuperar-senha" className="btn-primary w-full">
          Solicitar novo link <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (message) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          {message}
        </div>
        <Link href="/entrar" className="btn-primary w-full">
          Entrar com a nova senha <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert>{error}</Alert>}
      <div>
        <label htmlFor="password" className="label">
          Nova senha
        </label>
        <input
          id="password"
          type="password"
          className="input"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
        />
        <p className="mt-1.5 text-[11px] text-neutral-500">{PASSWORD_RULE}</p>
      </div>
      <div>
        <label htmlFor="confirm" className="label">
          Confirmar nova senha
        </label>
        <input
          id="confirm"
          type="password"
          className="input"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
        />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Redefinir senha <ArrowRight className="h-4 w-4" />
      </button>
      <p className="text-center text-[11px] text-neutral-500">
        Ao redefinir, todas as sessões ativas serão encerradas por segurança.
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout title="Criar nova senha" subtitle="Escolha uma senha forte e exclusiva para sua conta.">
      <Suspense fallback={<Spinner label="Carregando" />}>
        <ResetForm />
      </Suspense>
    </AuthLayout>
  );
}

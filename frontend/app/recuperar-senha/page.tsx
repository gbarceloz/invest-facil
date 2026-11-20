"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { Alert } from "@/components/ui";
import { ApiError, api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await api.post<{ message: string }>("/api/v1/auth/forgot-password", {
        email: email.trim(),
      });
      setMessage(response.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível enviar as instruções.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Informe seu e-mail e enviaremos um link de uso único para criar uma nova senha."
    >
      {message ? (
        <div className="space-y-5">
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            {message}
          </div>
          <p className="text-xs leading-5 text-muted">
            O link expira em 1 hora. Se o e-mail não chegar, verifique a caixa de spam e tente
            novamente em alguns minutos.
          </p>
          <Link href="/entrar" className="btn-primary w-full">
            Voltar ao login <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <div>
            <label htmlFor="email" className="label">
              E-mail cadastrado
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600" />
              <input
                id="email"
                type="email"
                className="input pl-10"
                placeholder="voce@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Enviar instruções
          </button>
          <Link href="/entrar" className="btn-ghost w-full text-xs">
            <ArrowLeft className="h-4 w-4" /> Voltar ao login
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}

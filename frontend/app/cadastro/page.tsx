"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { Alert } from "@/components/ui";
import { ApiError, api } from "@/lib/api";
import type { RegisterResponse } from "@/lib/types";

const PASSWORD_RULE = "Use ao menos 8 caracteres, com letras e números.";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<RegisterResponse | null>(null);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (form.password !== form.confirm) {
      setError("As senhas não conferem.");
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,72}$/.test(form.password)) {
      setError(PASSWORD_RULE);
      return;
    }
    setSubmitting(true);
    try {
      const response = await api.post<RegisterResponse>("/api/v1/auth/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setCreated(response);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível criar sua conta.");
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    return (
      <AuthLayout
        title="Conta criada"
        subtitle="Falta pouco para começar sua jornada."
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{created.message}</p>
          </div>
          {created.devVerificationToken && process.env.NODE_ENV !== "production" && (
            <div className="rounded-xl border border-accent/25 bg-accent/5 p-4 text-xs leading-5 text-neutral-300">
              <p className="font-bold text-accent">Modo desenvolvimento</p>
              <p className="mt-1">
                O provedor de e-mail não está configurado. Use o link abaixo para confirmar a conta
                agora:
              </p>
              <Link
                href={`/verificar-email?token=${encodeURIComponent(created.devVerificationToken)}`}
                className="mt-2 inline-flex font-bold text-accent underline underline-offset-4"
              >
                Confirmar meu e-mail
              </Link>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Link href="/entrar" className="btn-primary w-full">
              Ir para o login <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/" className="btn-ghost w-full text-xs">
              Voltar ao início
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Criar conta gratuita"
      subtitle="Leva menos de um minuto. Sem cartão de crédito e sem dinheiro real."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <div>
          <label htmlFor="name" className="label">
            Nome
          </label>
          <input
            id="name"
            className="input"
            placeholder="Como podemos te chamar?"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            autoComplete="name"
            minLength={2}
            maxLength={120}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="label">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="voce@email.com"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="label">
            Senha
          </label>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="Mínimo de 8 caracteres"
            value={form.password}
            onChange={(event) => update("password", event.target.value)}
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
          />
          <p className="mt-1.5 text-[11px] text-neutral-500">{PASSWORD_RULE}</p>
        </div>
        <div>
          <label htmlFor="confirm" className="label">
            Confirmar senha
          </label>
          <input
            id="confirm"
            type="password"
            className="input"
            placeholder="Repita a senha"
            value={form.confirm}
            onChange={(event) => update("confirm", event.target.value)}
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Criar minha conta <ArrowRight className="h-4 w-4" />
        </button>
        <p className="text-center text-[11px] leading-5 text-neutral-400">
          Ao criar a conta, você concorda em usar a plataforma apenas para fins educativos. Nenhuma
          operação real é executada.
        </p>
        <p className="text-center text-xs text-muted">
          Já tem conta?{" "}
          <Link href="/entrar" className="font-bold text-accent hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

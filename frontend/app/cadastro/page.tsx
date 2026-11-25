"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { GoogleSignIn } from "@/components/google-signin";
import { Alert } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { ApiError, api } from "@/lib/api";
import type { RegisterResponse } from "@/lib/types";

const PASSWORD_RULE = "Use ao menos 8 caracteres, com letras e números.";

export default function RegisterPage() {
  const router = useRouter();
  const { googleLogin } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<RegisterResponse | null>(null);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!accepted) {
      setError("Aceite os Termos de Uso e a Política de Privacidade para continuar.");
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

  async function handleGoogle(credential: string) {
    if (!accepted) {
      setError("Aceite os Termos de Uso e a Política de Privacidade para continuar.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await googleLogin(credential);
      router.replace("/app");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível criar sua conta com o Google.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    return (
      <AuthLayout title="Conta criada" subtitle="Seu acesso já está liberado.">
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-4 text-[12px] leading-5 text-emerald-200">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{created.message}</p>
          </div>

          <div className="rounded-lg border border-accent/25 bg-accent/[0.04] p-4 text-[12px] leading-5 text-neutral-300">
            <p className="font-semibold text-accent">Sem confirmação de e-mail</p>
            <p className="mt-1">
              A conta <strong className="break-all text-neutral-100">{form.email.trim()}</strong> já
              está ativa. Entre com a senha que você acabou de criar.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href={`/entrar?email=${encodeURIComponent(form.email.trim())}`}
              className="btn-primary w-full"
            >
              Entrar na minha conta <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/" className="btn-ghost w-full text-[11px]">
              Voltar ao início
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Comece sua jornada"
      subtitle="Leva menos de 1 minuto. Sem cartão de crédito e sem dinheiro real."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <GoogleSignIn onCredential={handleGoogle} text="signup_with" />
        <div>
          <label htmlFor="name" className="label">
            Nome
          </label>
          <input
            id="name"
            className="input"
            placeholder="Como podemos chamar você?"
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
          <p className="mt-1.5 text-[10px] text-neutral-500">{PASSWORD_RULE}</p>
        </div>
        <label className="flex items-start gap-2.5 text-[11px] leading-5 text-neutral-400">
          <input
            type="checkbox"
            className="mt-0.5 h-3.5 w-3.5 accent-[#facc15]"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
          />
          <span>Aceito os Termos de Uso e a Política de Privacidade.</span>
        </label>
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Criar conta grátis <ArrowRight className="h-4 w-4" />
        </button>
        <p className="text-center text-[11px] text-neutral-500">
          Já possui uma conta?{" "}
          <Link href="/entrar" className="font-semibold text-accent hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

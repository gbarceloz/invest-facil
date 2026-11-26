"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowRight, KeyRound, Loader2, Mail } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { GoogleSignIn } from "@/components/google-signin";
import { Alert, Spinner } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading, login, googleLogin, verifyMfa } = useAuth();
  const [email, setEmail] = useState(() => params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [challenge, setChallenge] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nextParam = params.get("next") ?? "";
  const target =
    nextParam.startsWith("/") && !nextParam.startsWith("//") && !nextParam.includes("\\")
      ? nextParam
      : "/app";

  useEffect(() => {
    if (!loading && user) router.replace(target);
  }, [loading, user, router, target]);

  async function handlePassword(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await login(email.trim(), password);
      if (result.mfaRequired && result.challengeToken) {
        setChallenge(result.challengeToken);
      } else {
        router.replace(target);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível entrar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle(credential: string) {
    setError(null);
    setSubmitting(true);
    try {
      await googleLogin(credential);
      router.replace(target);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível entrar com o Google.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMfa(event: React.FormEvent) {
    event.preventDefault();
    if (!challenge) return;
    setError(null);
    setSubmitting(true);
    try {
      await verifyMfa(challenge, code.trim());
      router.replace(target);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Código inválido. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (challenge) {
    return (
      <form onSubmit={handleMfa} className="space-y-4">
        <div className="rounded-xl border border-accent/25 bg-accent/5 p-4 text-sm text-neutral-300">
          <div className="flex items-center gap-2 font-bold text-accent">
            <KeyRound className="h-4 w-4" /> Verificação em duas etapas
          </div>
          <p className="mt-2 text-xs leading-5 text-muted">
            Abra seu app autenticador e informe o código de 6 dígitos.
          </p>
        </div>
        {error && <Alert>{error}</Alert>}
        <div>
          <label htmlFor="code" className="label">
            Código de 6 dígitos
          </label>
          <input
            id="code"
            className="input text-center text-2xl font-bold tracking-[0.4em]"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            autoFocus
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={submitting || code.length !== 6}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Confirmar código <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="btn-ghost w-full text-xs"
          onClick={() => {
            setChallenge(null);
            setCode("");
            setError(null);
          }}
        >
          Voltar para o login
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handlePassword} className="space-y-4">
      {error && <Alert>{error}</Alert>}
      <GoogleSignIn onCredential={handleGoogle} text="signin_with" />
      <div>
        <label htmlFor="email" className="label">
          E-mail
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
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="label">
            Senha
          </label>
          <Link href="/recuperar-senha" className="mb-1.5 text-[11px] font-semibold text-accent hover:underline">
            Esqueci minha senha
          </Link>
        </div>
        <input
          id="password"
          type="password"
          className="input"
          placeholder="Sua senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Entrar <ArrowRight className="h-4 w-4" />
      </button>
      <p className="text-center text-xs text-muted">
        Ainda não tem conta?{" "}
        <Link href="/comecar" className="font-bold text-accent hover:underline">
          Criar agora
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout
      title="Entrar na sua jornada"
      subtitle="Continue de onde parou. Seu progresso, XP e conquistas estão esperando."
    >
      <Suspense fallback={<Spinner label="Carregando" />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}

"use client";

import { useState } from "react";
import { ArrowRight, KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";
import { GoogleSignIn } from "@/components/google-signin";
import { Alert } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { ApiError, api } from "@/lib/api";
import type { RegisterResponse } from "@/lib/types";
import { cn } from "@/lib/format";

type Mode = "register" | "login";

export function AuthGate({
  name,
  onAuthenticated,
}: {
  name: string;
  onAuthenticated: () => Promise<void>;
}) {
  const { login, googleLogin, verifyMfa } = useAuth();
  const [mode, setMode] = useState<Mode>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [code, setCode] = useState("");

  async function finishLogin(result: { mfaRequired: boolean; challengeToken?: string }) {
    if (result.mfaRequired && result.challengeToken) {
      setChallenge(result.challengeToken);
      return;
    }
    await onAuthenticated();
  }

  async function handleGoogle(credential: string) {
    setError(null);
    if (mode === "register" && !accepted) {
      setError("Aceite os Termos de Uso e a Política de Privacidade para continuar.");
      return;
    }
    setSubmitting(true);
    try {
      await googleLogin(credential);
      await onAuthenticated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível entrar com o Google.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (mode === "register" && !accepted) {
      setError("Aceite os Termos de Uso e a Política de Privacidade para continuar.");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "register") {
        const created = await api.post<RegisterResponse>("/api/v1/auth/register", {
          name: name.trim(),
          email: email.trim(),
          password,
        });
        if (created.devVerificationToken) {
          await api.post("/api/v1/auth/verify-email", {
            token: created.devVerificationToken,
          });
        }
      }
      const result = await login(email.trim(), password);
      if (mode === "register" && result.mfaRequired) {
        // Contas novas não têm MFA; mantém o tratamento para não perder o fluxo.
        setChallenge(result.challengeToken ?? null);
        return;
      }
      await finishLogin(result);
    } catch (err) {
      if (mode === "register" && err instanceof ApiError && err.status === 409) {
        setMode("login");
        setError("Já existe uma conta com este e-mail. Entre com sua senha para continuar.");
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : mode === "register"
              ? "Não foi possível criar sua conta."
              : "Não foi possível entrar. Confira seus dados.",
        );
      }
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
      await onAuthenticated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Código inválido. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (challenge) {
    return (
      <form onSubmit={handleMfa} className="space-y-4">
        <div className="rounded-xl border border-accent/25 bg-accent/5 p-4 text-[12px] leading-5 text-neutral-300">
          <div className="flex items-center gap-2 font-semibold text-accent">
            <KeyRound className="h-4 w-4" /> Verificação em duas etapas
          </div>
          <p className="mt-1.5 text-neutral-400">
            Abra seu app autenticador e informe o código de 6 dígitos.
          </p>
        </div>
        {error && <Alert>{error}</Alert>}
        <div>
          <label htmlFor="onb-code" className="label">
            Código de 6 dígitos
          </label>
          <input
            id="onb-code"
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
          Confirmar e ver meu resultado <ArrowRight className="h-4 w-4" />
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
          Voltar
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/[0.08] bg-[#0d0d0d] p-1">
        {(
          [
            { value: "register", label: "Criar conta" },
            { value: "login", label: "Já tenho conta" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setMode(tab.value);
              setError(null);
            }}
            className={cn(
              "rounded-lg px-3 py-2 text-[12px] font-semibold transition",
              mode === tab.value
                ? "bg-accent text-ink-950"
                : "text-neutral-400 hover:text-neutral-100",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <Alert>{error}</Alert>}

      <GoogleSignIn
        onCredential={handleGoogle}
        text={mode === "register" ? "signup_with" : "signin_with"}
      />

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label htmlFor="onb-email" className="label">
            E-mail
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600" />
            <input
              id="onb-email"
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
          <label htmlFor="onb-password" className="label">
            Senha
          </label>
          <input
            id="onb-password"
            type="password"
            className="input"
            placeholder={mode === "register" ? "Mínimo de 8 caracteres" : "Sua senha"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            minLength={mode === "register" ? 8 : undefined}
            maxLength={72}
            required
          />
          {mode === "register" && (
            <p className="mt-1.5 text-[10px] text-neutral-600">
              Use ao menos 8 caracteres, com letras e números.
            </p>
          )}
        </div>

        {mode === "register" && (
          <label className="flex items-start gap-2.5 text-[11px] leading-5 text-neutral-400">
            <input
              type="checkbox"
              className="mt-0.5 h-3.5 w-3.5 accent-[#facc15]"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
            />
            <span>Aceito os Termos de Uso e a Política de Privacidade.</span>
          </label>
        )}

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === "register" ? "Criar conta e ver meu resultado" : "Entrar e ver meu resultado"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <p className="flex items-start gap-2 text-[10px] leading-4 text-neutral-600">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent/70" aria-hidden="true" />
        Seu rascunho fica neste navegador até você concluir. Usamos a autenticação oficial do
        Invest Fácil; o Google confirma sua identidade sem criar outra senha.
      </p>
    </div>
  );
}

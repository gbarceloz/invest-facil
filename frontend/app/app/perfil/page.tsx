"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Award,
  CheckCircle2,
  KeyRound,
  Loader2,
  LogOut,
  Monitor,
  Save,
  ShieldCheck,
  ShieldOff,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useAppData } from "@/lib/app-data";
import { api, ApiError } from "@/lib/api";
import type { SessionInfo, User } from "@/lib/types";
import { dateShort, initials, relativeTime } from "@/lib/format";
import { PageHeader } from "@/components/page";
import { Alert } from "@/components/ui";

export default function ProfilePage() {
  const { user, setUser, refreshUser, logout } = useAuth();
  const { gamification, reload } = useAppData();
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? "");
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [mfaSetup, setMfaSetup] = useState<{ secret: string; otpauthUri: string } | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaPassword, setMfaPassword] = useState("");
  const [mfaSetupPassword, setMfaSetupPassword] = useState("");
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  useEffect(() => {
    api
      .get<SessionInfo[]>("/api/v1/auth/sessions")
      .then(setSessions)
      .catch((err) =>
        setSessionError(err instanceof Error ? err.message : "Não foi possível carregar as sessões."),
      );
  }, []);

  if (!user) return null;

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setBusy("profile");
    try {
      const updated = await api.patch<User>("/api/v1/users/me", { name: name.trim() });
      setUser(updated);
      setProfileMessage("Perfil atualizado.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível atualizar o perfil.");
    } finally {
      setBusy(null);
    }
  }

  async function resendVerification() {
    if (!user) return;
    setError(null);
    setBusy("verify");
    try {
      await api.post("/api/v1/auth/resend-verification", { email: user.email });
      setNotice("Se o e-mail estiver pendente, um novo link foi enviado.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível reenviar o e-mail.");
    } finally {
      setBusy(null);
    }
  }

  async function startMfa(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy("mfa-setup");
    try {
      const result = await api.post<{ secret: string; otpauthUri: string }>(
        "/api/v1/auth/mfa/setup",
        { password: mfaSetupPassword },
      );
      setMfaSetup(result);
      setMfaSetupPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível iniciar o MFA.");
    } finally {
      setBusy(null);
    }
  }

  async function enableMfa(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy("mfa-enable");
    try {
      await api.post("/api/v1/auth/mfa/enable", { code: mfaCode.trim() });
      await refreshUser();
      setMfaSetup(null);
      setMfaCode("");
      setNotice("MFA ativado. No próximo login, será solicitado o código.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Código inválido.");
    } finally {
      setBusy(null);
    }
  }

  async function disableMfa(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy("mfa-disable");
    try {
      await api.post("/api/v1/auth/mfa/disable", { password: mfaPassword, code: mfaCode.trim() });
      await refreshUser();
      setMfaCode("");
      setMfaPassword("");
      setNotice("MFA desativado.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível desativar o MFA.");
    } finally {
      setBusy(null);
    }
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (passwords.next !== passwords.confirm) {
      setError("As novas senhas não conferem.");
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,72}$/.test(passwords.next)) {
      setError("A nova senha deve ter ao menos 8 caracteres, com letras e números.");
      return;
    }
    setBusy("password");
    try {
      await api.post("/api/v1/auth/change-password", {
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });
      setNotice("Senha alterada. Entre novamente.");
      await logout();
      router.replace("/entrar");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível alterar a senha.");
    } finally {
      setBusy(null);
    }
  }

  async function revokeSession(id: string) {
    setBusy(`session-${id}`);
    try {
      await api.delete<void>(`/api/v1/auth/sessions/${id}`);
      setSessions((current) => current.filter((session) => session.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível encerrar a sessão.");
    } finally {
      setBusy(null);
    }
  }

  async function revokeAll() {
    if (!window.confirm("Encerrar todas as sessões, incluindo a atual?")) return;
    setBusy("sessions-all");
    try {
      await api.delete<void>("/api/v1/auth/sessions");
      await logout();
      router.replace("/entrar");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível encerrar as sessões.");
    } finally {
      setBusy(null);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Sua conta"
        title="Perfil"
        description="Gerencie seus dados, segurança e sessões. Nenhuma informação financeira real é armazenada."
        actions={
          <button type="button" onClick={handleLogout} className="btn-secondary text-xs">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        }
      />

      {error && <Alert className="mb-4">{error}</Alert>}
      {notice && (
        <Alert tone="success" className="mb-4">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {notice}
          </span>
        </Alert>
      )}

      {!user.emailVerified && (
        <Alert tone="warning" className="mb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>Seu e-mail ainda não foi confirmado. Confirme para garantir a recuperação da conta.</span>
            <button type="button" onClick={resendVerification} className="btn-secondary px-3 py-1.5 text-[11px]" disabled={busy === "verify"}>
              {busy === "verify" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Reenviar e-mail
            </button>
          </div>
        </Alert>
      )}

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="card p-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl border border-accent/30 bg-accent/10 text-xl font-black text-accent">
              {initials(user.name)}
            </div>
            <div>
              <h2 className="text-xl font-extrabold">{user.name}</h2>
              <p className="text-xs text-muted">{user.email}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-accent">
                Nível {gamification?.level.number ?? 1} · {gamification?.level.name ?? "Curioso"}
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-2 border-t border-ink-500/60 pt-4 text-xs text-muted">
            <div className="flex justify-between">
              <span>Membro desde</span>
              <span className="text-neutral-300">{dateShort(user.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>XP acumulado</span>
              <span className="text-neutral-300">{(gamification?.xp ?? 0).toLocaleString("pt-BR")}</span>
            </div>
            <div className="flex justify-between">
              <span>Conquistas</span>
              <span className="text-neutral-300">
                {gamification?.achievementsUnlocked ?? 0}/{gamification?.achievementsTotal ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>E-mail verificado</span>
              <span className={user.emailVerified ? "text-emerald-400" : "text-accent"}>
                {user.emailVerified ? "Sim" : "Pendente"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>MFA</span>
              <span className={user.mfaEnabled ? "text-emerald-400" : "text-muted"}>
                {user.mfaEnabled ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
          <Link href="/app/progresso" className="btn-secondary mt-5 w-full text-xs">
            <Award className="h-4 w-4" /> Ver conquistas
          </Link>
        </section>

        <section className="space-y-5">
          <form onSubmit={saveProfile} className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <UserIcon className="h-4 w-4 text-accent" /> Dados do perfil
            </h2>
            <div className="mt-4">
              <label htmlFor="profile-name" className="label">
                Nome
              </label>
              <input
                id="profile-name"
                className="input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                maxLength={120}
                required
              />
            </div>
            <div className="mt-3">
              <label htmlFor="profile-email" className="label">
                E-mail
              </label>
              <input id="profile-email" className="input opacity-60" value={user.email} disabled />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button type="submit" className="btn-primary text-xs" disabled={busy === "profile"}>
                {busy === "profile" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar
              </button>
              {profileMessage && <span className="text-[11px] text-emerald-400">{profileMessage}</span>}
            </div>
          </form>

          <section className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <ShieldCheck className="h-4 w-4 text-accent" /> Autenticação em duas etapas
            </h2>
            <p className="mt-2 text-xs leading-5 text-muted">
              Use um app autenticador (Google Authenticator, Authy, 1Password) para gerar códigos de 6 dígitos.
            </p>

            {user.mfaEnabled ? (
              <form onSubmit={disableMfa} className="mt-4 space-y-3">
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-200">
                  MFA está ativo nesta conta.
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="mfa-password" className="label">
                      Senha atual
                    </label>
                    <input
                      id="mfa-password"
                      type="password"
                      className="input"
                      value={mfaPassword}
                      onChange={(event) => setMfaPassword(event.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="mfa-code-disable" className="label">
                      Código de 6 dígitos
                    </label>
                    <input
                      id="mfa-code-disable"
                      className="input"
                      inputMode="numeric"
                      maxLength={6}
                      value={mfaCode}
                      onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn-secondary text-xs" disabled={busy === "mfa-disable"}>
                  <ShieldOff className="h-4 w-4" /> Desativar MFA
                </button>
              </form>
            ) : mfaSetup ? (
              <form onSubmit={enableMfa} className="mt-4 space-y-3">
                <div className="rounded-xl border border-accent/25 bg-accent/5 p-4 text-xs leading-5 text-neutral-300">
                  <p className="font-bold text-accent">Adicione esta chave ao seu autenticador</p>
                  <code className="mt-2 block break-all rounded-lg bg-ink-950 p-3 font-mono text-sm tracking-widest text-neutral-100">
                    {mfaSetup.secret}
                  </code>
                  <p className="mt-2 text-[10px] text-muted">
                    Ou use o URI: <span className="break-all">{mfaSetup.otpauthUri}</span>
                  </p>
                </div>
                <div>
                  <label htmlFor="mfa-code" className="label">
                    Código gerado pelo app
                  </label>
                  <input
                    id="mfa-code"
                    className="input text-center text-lg tracking-[0.3em]"
                    inputMode="numeric"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary text-xs" disabled={busy === "mfa-enable"}>
                    <KeyRound className="h-4 w-4" /> Ativar MFA
                  </button>
                  <button type="button" className="btn-ghost text-xs" onClick={() => setMfaSetup(null)}>
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={startMfa} className="mt-4 space-y-3">
                <div>
                  <label htmlFor="mfa-setup-password" className="label">
                    Confirme sua senha para começar
                  </label>
                  <input
                    id="mfa-setup-password"
                    type="password"
                    className="input"
                    value={mfaSetupPassword}
                    onChange={(event) => setMfaSetupPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                <button type="submit" className="btn-secondary text-xs" disabled={busy === "mfa-setup"}>
                  {busy === "mfa-setup" ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                  Configurar MFA
                </button>
              </form>
            )}
          </section>
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <form onSubmit={changePassword} className="card p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <KeyRound className="h-4 w-4 text-accent" /> Alterar senha
          </h2>
          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="current-password" className="label">
                Senha atual
              </label>
              <input
                id="current-password"
                type="password"
                className="input"
                value={passwords.current}
                onChange={(event) => setPasswords((current) => ({ ...current, current: event.target.value }))}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="new-password" className="label">
                  Nova senha
                </label>
                <input
                  id="new-password"
                  type="password"
                  className="input"
                  value={passwords.next}
                  onChange={(event) => setPasswords((current) => ({ ...current, next: event.target.value }))}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="label">
                  Confirmar
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  className="input"
                  value={passwords.confirm}
                  onChange={(event) => setPasswords((current) => ({ ...current, confirm: event.target.value }))}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary mt-4 text-xs" disabled={busy === "password"}>
            {busy === "password" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Alterar senha
          </button>
          <p className="mt-2 text-[10px] text-neutral-500">
            Ao alterar a senha, todas as sessões são encerradas por segurança.
          </p>
        </form>

        <section className="card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <Monitor className="h-4 w-4 text-accent" /> Sessões ativas
            </h2>
            <button type="button" onClick={revokeAll} className="text-[11px] font-bold text-red-300 hover:underline" disabled={busy === "sessions-all"}>
              Encerrar todas
            </button>
          </div>
          {sessionError && <p className="mt-3 text-xs text-red-300">{sessionError}</p>}
          <div className="mt-4 divide-y divide-ink-500/50">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-neutral-200">
                    {session.userAgent ?? "Dispositivo desconhecido"}
                  </p>
                  <p className="text-[10px] text-muted">
                    {session.current ? "Sessão atual · " : ""}
                    {session.ip ?? "IP não informado"} · criada {relativeTime(session.createdAt)}
                  </p>
                </div>
                {!session.current && (
                  <button
                    type="button"
                    onClick={() => revokeSession(session.id)}
                    className="shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold text-red-300 hover:bg-red-500/10"
                    disabled={busy === `session-${session.id}`}
                  >
                    Encerrar
                  </button>
                )}
              </div>
            ))}
            {sessions.length === 0 && <p className="py-5 text-center text-xs text-muted">Nenhuma sessão ativa.</p>}
          </div>
        </section>
      </div>

      <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
        <h2 className="text-sm font-bold text-red-200">Sair deste dispositivo</h2>
        <p className="mt-1 text-xs text-neutral-400">
          Isso remove o acesso neste navegador. Você pode entrar novamente quando quiser. Seus dados de
          progresso permanecem na conta.
        </p>
        <button type="button" onClick={handleLogout} className="btn-secondary mt-3 text-xs">
          <LogOut className="h-4 w-4" /> Sair agora
        </button>
      </div>
    </div>
  );
}

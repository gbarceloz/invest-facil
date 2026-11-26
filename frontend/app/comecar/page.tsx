"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Lock,
  Pencil,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { AssistantBubble, Fina, type FinaPose } from "@/components/onboarding/fina";
import { Typewriter } from "@/components/onboarding/typewriter";
import { ChoiceCard, PillChoice } from "@/components/onboarding/choice-card";
import { CurrencyField } from "@/components/onboarding/currency-field";
import { AuthGate } from "@/components/onboarding/auth-gate";
import { FinancialHealthPanel } from "@/components/onboarding/health-result";
import { Spinner } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { ApiError, api } from "@/lib/api";
import {
  DAY_OPTIONS,
  DEBT_OPTIONS,
  EMPTY_DRAFT,
  GOAL_OPTIONS,
  KNOWLEDGE_OPTIONS,
  LAST_QUESTION_STEP,
  LEARNING_OPTIONS,
  QUESTION_COUNT,
  RESERVE_OPTIONS,
  SITUATION_OPTIONS,
  TIME_OPTIONS,
  clearDraft,
  loadDraft,
  moneyCents,
  saveDraft,
  toAnswers,
  type OnboardingDraft,
  type Option,
} from "@/lib/onboarding";
import type { FinancialHealth, OnboardingProfile, StudyDay } from "@/lib/types";

type Phase = "questions" | "calculating" | "profile" | "auth";

function labelOf<T extends string>(options: Option<T>[], value: T | null | undefined): string {
  if (!value) return "Não informado";
  return options.find((option) => option.value === value)?.label ?? String(value);
}

function labelsOf<T extends string>(
  options: Option<T>[],
  values: T[],
  empty = "Nenhum",
): string {
  if (values.length === 0) return empty;
  return values.map((value) => labelOf(options, value)).join(", ");
}

function firstNameOf(name: string): string {
  const first = name.trim().split(/\s+/)[0];
  return first || "investidor(a)";
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [draft, setDraft] = useState<OnboardingDraft>(EMPTY_DRAFT);
  const [step, setStep] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [phase, setPhase] = useState<Phase>("questions");
  const [health, setHealth] = useState<FinancialHealth | null>(null);
  const [existingCompleted, setExistingCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const prefillStarted = useRef(false);

  useEffect(() => {
    const reset = new URLSearchParams(window.location.search).get("reset") === "1";
    if (reset) {
      clearDraft();
      setHydrated(true);
      return;
    }
    const stored = loadDraft();
    if (stored) {
      setDraft(stored.draft);
      setStep(stored.step);
      setRestoredDraft(true);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveDraft(step, draft);
  }, [draft, step, hydrated]);

  useEffect(() => {
    if (!hydrated || authLoading || !user || prefillStarted.current) return;
    prefillStarted.current = true;
    let active = true;
    api
      .get<OnboardingProfile>("/api/v1/onboarding/me")
      .then((profile) => {
        if (!active) return;
        if (profile.completed) setExistingCompleted(true);
        if (profile.completed && profile.answers && !restoredDraft) {
          setDraft({ ...profile.answers, name: profile.name ?? user.name });
          setHealth(profile.health ?? null);
        } else {
          setDraft((current) =>
            current.name.trim() ? current : { ...current, name: user.name },
          );
        }
      })
      .catch(() => {
        if (!active) return;
        setDraft((current) =>
          current.name.trim() ? current : { ...current, name: user.name },
        );
      });
    return () => {
      active = false;
    };
  }, [hydrated, authLoading, user, restoredDraft]);

  useEffect(() => {
    if (!hydrated || phase === "calculating") return;
    const frame = window.requestAnimationFrame(() => {
      endRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "end",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [step, phase, hydrated]);

  const firstName = firstNameOf(draft.name);

  const question = useMemo<{ text: string; pose: FinaPose }>(() => {
    const questions: { text: string; pose: FinaPose }[] = [
      { text: "Oi! Eu sou a Fina. Como você quer ser chamado(a)?", pose: "wave" },
      { text: "Qual é o seu objetivo?", pose: "wave" },
      { text: "Como está sua situação hoje?", pose: "think" },
      { text: "Quanto entra e quanto sai por mês?", pose: "think" },
      { text: "Como estão sua reserva e suas dívidas?", pose: "think" },
      { text: "Como você aprende melhor?", pose: "book" },
      { text: "Quando você consegue estudar?", pose: "run" },
    ];
    return questions[step] ?? questions[0];
  }, [step]);

  const progress = phase === "auth"
    ? 100
    : Math.round(((Math.min(step, LAST_QUESTION_STEP) + 1) / QUESTION_COUNT) * 100);

  const canContinue = useMemo(() => {
    switch (step) {
      case 0:
        return draft.name.trim().length >= 2;
      case 1:
        return draft.goal !== null;
      case 2:
        return draft.financialSituation !== null;
      case 3:
        return true;
      case 4:
        return draft.emergencyReserve !== null && draft.highInterestDebt !== null;
      case 5:
        return draft.learningPreference !== null && draft.knowledgeLevel !== null;
      case 6:
        return draft.studyDays.length > 0 && draft.studyTime.length > 0;
      default:
        return true;
    }
  }, [draft, step]);

  function validationMessage(): string {
    switch (step) {
      case 0:
        return "Digite seu nome para continuar.";
      case 1:
        return "Escolha seu objetivo.";
      case 2:
        return "Escolha a opção que mais se parece com sua situação.";
      case 4:
        return "Escolha uma opção de reserva e uma de dívida.";
      case 5:
        return "Escolha como você aprende e seu nível de conhecimento.";
      case 6:
        return "Escolha ao menos um dia e um horário.";
      default:
        return "Responda para continuar.";
    }
  }

  function update<K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function toggleDay(value: StudyDay) {
    setDraft((current) => {
      const has = current.studyDays.includes(value);
      return {
        ...current,
        studyDays: has
          ? current.studyDays.filter((item) => item !== value)
          : [...current.studyDays, value],
      };
    });
    setError(null);
  }

  const calculate = useCallback(async () => {
    const answers = toAnswers(draft);
    if (!answers) {
      setError(validationMessage());
      return;
    }
    setCalcError(null);
    setPhase("calculating");
    try {
      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const [result] = await Promise.all([
        api.post<FinancialHealth>("/api/v1/onboarding/estimate", answers),
        reduced
          ? Promise.resolve()
          : new Promise((resolve) => window.setTimeout(resolve, 750)),
      ]);
      setHealth(result);
      setPhase("profile");
    } catch (err) {
      setPhase("questions");
      setCalcError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível calcular agora. Tente novamente.",
      );
    }
  }, [draft]);

  function goNext() {
    setError(null);
    if (!canContinue) {
      setError(validationMessage());
      return;
    }
    if (step === LAST_QUESTION_STEP) {
      void calculate();
      return;
    }
    setStep((current) => Math.min(current + 1, LAST_QUESTION_STEP));
  }

  function goBack() {
    setError(null);
    setCalcError(null);
    setSaveError(null);
    if (phase === "auth") {
      setPhase("profile");
      return;
    }
    if (phase === "profile") {
      setPhase("questions");
      setStep(LAST_QUESTION_STEP);
      return;
    }
    if (step === 0) {
      router.push("/");
      return;
    }
    setStep((current) => Math.max(0, current - 1));
  }

  async function saveAndOpen() {
    const answers = toAnswers(draft);
    if (!answers) {
      throw new Error("Respostas incompletas.");
    }
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await api.put<OnboardingProfile>("/api/v1/onboarding/me", {
        name: draft.name.trim(),
        answers,
      });
      const verified = await api.get<OnboardingProfile>("/api/v1/onboarding/me");
      if (!verified.completed || !verified.health || verified.health.score !== saved.health?.score) {
        throw new ApiError(
          500,
          "PROFILE_NOT_VERIFIED",
          "Não foi possível confirmar seu perfil no servidor. Tente novamente.",
        );
      }
      clearDraft();
      router.replace("/app?revelar=1");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveClick() {
    setSaveError(null);
    try {
      await saveAndOpen();
    } catch (err) {
      setSaveError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível salvar seu perfil. Tente novamente.",
      );
    }
  }

  async function handleLogout() {
    setSaveError(null);
    await logout();
  }

  function restart() {
    clearDraft();
    setDraft({ ...EMPTY_DRAFT, name: user?.name ?? "" });
    setHealth(null);
    setExistingCompleted(false);
    setPhase("questions");
    setStep(0);
    setError(null);
    setCalcError(null);
    setSaveError(null);
  }

  function editStep(target: number) {
    setPhase("questions");
    setStep(target);
    setError(null);
    setCalcError(null);
    setSaveError(null);
  }

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner label="Preparando seu onboarding" />
      </div>
    );
  }

  const pastSteps = phase === "questions"
    ? Array.from({ length: step }, (_, index) => index).slice(-2)
    : [];

  const phaseLabel =
    phase === "calculating"
      ? "Calculando"
      : phase === "profile"
        ? "Perfil pronto"
        : phase === "auth"
          ? `Etapa ${QUESTION_COUNT} de ${QUESTION_COUNT}`
          : `Etapa ${step + 1} de ${QUESTION_COUNT}`;

  return (
    <div className="onb-stage flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#090909]/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo href="/" compact />
          <div className="flex items-center gap-2 text-[11px] text-neutral-500">
            {user ? (
              <span className="font-medium text-neutral-400">Sessão ativa</span>
            ) : (
              <Link
                href="/entrar?next=/comecar"
                className="font-medium text-neutral-300 transition hover:text-accent"
              >
                Já tenho conta
              </Link>
            )}
            <span className="text-neutral-700">·</span>
            <span className="tabular-nums">{phaseLabel}</span>
          </div>
        </div>
        <div className="mx-auto w-full max-w-2xl px-4 pb-3 sm:px-6">
          <div className="h-1 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="onb-progress h-full rounded-full bg-gradient-to-r from-accent-500 to-accent"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              aria-label="Progresso do onboarding"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-40 pt-6 sm:px-6">
        {existingCompleted && (
          <div className="onb-fade mb-5 flex flex-col gap-3 rounded-xl border border-accent/20 bg-accent/[0.05] px-4 py-3 text-[11px] leading-5 text-neutral-300 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span>
                Você já tem um perfil calculado. Ajuste o que quiser: ao salvar, o painel é
                atualizado com as novas respostas.
              </span>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link href="/app" className="btn-secondary px-3 py-1.5 text-[10px]">
                Ver painel
              </Link>
              <button type="button" onClick={restart} className="btn-ghost px-2 py-1.5 text-[10px]">
                Recomeçar
              </button>
            </div>
          </div>
        )}

        {phase === "calculating" ? (
          <div className="onb-fade flex flex-col items-center py-16 text-center">
            <Fina pose="think" size={150} priority />
            <p className="mt-7 text-[17px] font-medium tracking-[-0.02em] text-neutral-100">
              Calculando seu ponto de partida…
            </p>
            <p className="mt-2 max-w-xs text-[11px] leading-5 text-neutral-500">
              Cruzando reserva, dívidas, poupança e despesas essenciais.
            </p>
            <div className="mt-6 h-1.5 w-56 overflow-hidden rounded-full bg-white/[0.07]">
              <div className="onb-glow h-full w-full bg-gradient-to-r from-transparent via-accent to-transparent" />
            </div>
          </div>
        ) : phase === "profile" && health ? (
          <div className="space-y-5">
            <AssistantBubble pose="jump" animate>
              <Typewriter
                text={`Seu perfil está pronto, ${firstName}. Veja seu ponto de partida.`}
              />
            </AssistantBubble>

            <section className="onb-enter rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <p className="eyebrow">Perfil calculado</p>
                  <h2 className="mt-1 text-[22px] font-medium tracking-[-0.03em] text-neutral-100">
                    Seu perfil está pronto
                  </h2>
                  <p className="mt-1 text-[11px] leading-5 text-neutral-400">
                    O servidor calculou seu índice com as respostas das 7 etapas. Agora falta
                    apenas vincular sua conta para salvar.
                  </p>
                </div>
              </div>
            </section>

            <section className="onb-enter rounded-2xl border border-white/[0.08] bg-[#111111] p-5 sm:p-6">
              <FinancialHealthPanel health={health} />
            </section>

            <p className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-[10px] leading-5 text-neutral-500">
              Este índice é educativo e determinístico. Ele não prevê rentabilidade, não é uma
              nota de crédito e não substitui uma recomendação profissional.{" "}
              <Link href="/termos" className="text-accent hover:underline">
                Termos de Uso
              </Link>
              .
            </p>

            <details className="rounded-xl border border-white/[0.08] bg-[#111111] px-4 py-3">
              <summary className="cursor-pointer list-none text-[11px] font-semibold text-neutral-300">
                Revisar respostas
              </summary>
              <div className="mt-3">
                <ReviewPanel draft={draft} onEdit={editStep} />
              </div>
            </details>

            <section className="onb-enter rounded-2xl border border-white/[0.08] bg-[#111111] p-5 sm:p-6">
              <p className="eyebrow">Etapa 8 · vínculo obrigatório</p>
              <h2 className="mt-2 text-[19px] font-medium tracking-[-0.03em] text-neutral-100">
                Vincule sua conta
              </h2>
              <p className="mt-1.5 text-[11px] leading-5 text-neutral-500">
                Entre com o Google ou e-mail para salvar este perfil. O painel só abre depois
                que o servidor confirmar que o perfil foi persistido.
              </p>
              <button
                type="button"
                onClick={() => setPhase("auth")}
                className="btn-primary mt-4 w-full"
              >
                Vincular minha conta <ArrowRight className="h-4 w-4" />
              </button>
            </section>

            <div className="flex flex-wrap items-center justify-center gap-3 pb-4">
              <button
                type="button"
                onClick={() => {
                  setPhase("questions");
                  setStep(0);
                }}
                className="btn-ghost text-[11px]"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Ajustar respostas
              </button>
              <button type="button" onClick={restart} className="btn-ghost text-[11px]">
                <RotateCcw className="h-3.5 w-3.5" /> Recomeçar
              </button>
            </div>
          </div>
        ) : phase === "auth" ? (
          <div className="space-y-5">
            <AssistantBubble pose="wave" animate>
              <Typewriter
                text={
                  user
                    ? `Sessão ativa como ${user.email}. Confirme para salvar ou entre com outra conta.`
                    : "Para guardar seu plano, entre com o Google ou e-mail."
                }
              />
            </AssistantBubble>

            {user && (
              <section className="onb-enter rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
                    <Check className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[14px] font-semibold text-neutral-100">Sessão ativa</h2>
                    <p className="mt-0.5 break-all text-[11px] leading-5 text-neutral-400">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSaveClick}
                  disabled={saving}
                  className="btn-primary mt-4 w-full"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Continuar com esta conta <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="btn-ghost mt-2 w-full text-[10px]"
                >
                  Usar outra conta
                </button>
              </section>
            )}

            <section className="onb-enter rounded-2xl border border-white/[0.08] bg-[#111111] p-5 sm:p-6">
              {user && (
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    ou entre com outra conta
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>
              )}
              {saveError && (
                <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
                  {saveError}
                </p>
              )}
              <AuthGate
                key={user ? "logged" : "anon"}
                name={draft.name}
                initialMode={user ? "login" : "register"}
                onAuthenticated={saveAndOpen}
              />
            </section>
          </div>
        ) : (
          <div className="space-y-4">
            {pastSteps.map((index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex justify-start">
                  <p className="max-w-[86%] rounded-xl rounded-tl-sm border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-[11px] leading-5 text-neutral-500">
                    {questionText(index)}
                  </p>
                </div>
                <div className="flex justify-end">
                  <p className="max-w-[86%] rounded-xl rounded-br-sm border border-accent/15 bg-accent/[0.07] px-3 py-2 text-[11px] font-medium leading-5 text-accent/90">
                    {answerText(index, draft)}
                  </p>
                </div>
              </div>
            ))}

            <AssistantBubble key={step} pose={question.pose} animate>
              <Typewriter text={question.text} />
            </AssistantBubble>

            <div className="onb-enter space-y-3 sm:pl-[76px]">
              {step === 0 && (
                <div>
                  <label htmlFor="onb-name" className="label">
                    Seu nome
                  </label>
                  <input
                    id="onb-name"
                    className="input text-[16px]"
                    placeholder="Como podemos chamar você?"
                    value={draft.name}
                    onChange={(event) => update("name", event.target.value)}
                    autoComplete="name"
                    maxLength={120}
                    autoFocus
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && canContinue) goNext();
                    }}
                  />
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {GOAL_OPTIONS.map((option, index) => (
                    <ChoiceCard
                      key={option.value}
                      selected={draft.goal === option.value}
                      onClick={() => update("goal", option.value)}
                      label={option.label}
                      description={option.description}
                      index={index}
                    />
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {SITUATION_OPTIONS.map((option, index) => (
                    <ChoiceCard
                      key={option.value}
                      selected={draft.financialSituation === option.value}
                      onClick={() => update("financialSituation", option.value)}
                      label={option.label}
                      description={option.description}
                      index={index}
                    />
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <CurrencyField
                    id="onb-income"
                    label="Renda mensal"
                    value={draft.incomeCents}
                    onChange={(value) => update("incomeCents", value)}
                    autoFocus
                    hint={null}
                  />
                  <CurrencyField
                    id="onb-savings"
                    label="Quanto sobra para guardar"
                    value={draft.savingsCapacityCents}
                    onChange={(value) => update("savingsCapacityCents", value)}
                    hint={null}
                  />
                  <CurrencyField
                    id="onb-expenses"
                    label="Despesas essenciais"
                    value={draft.essentialExpensesCents}
                    onChange={(value) => update("essentialExpensesCents", value)}
                    hint={null}
                  />
                  <p className="text-[10px] leading-4 text-neutral-600">
                    Pode preencher só o que souber. Use vírgula para centavos.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      update("incomeCents", null);
                      update("savingsCapacityCents", null);
                      update("essentialExpensesCents", null);
                      setStep((current) => current + 1);
                    }}
                    className="text-[11px] font-medium text-neutral-500 underline decoration-white/20 underline-offset-4 transition hover:text-neutral-200"
                  >
                    Prefiro não informar agora
                  </button>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <p className="mb-2 text-[11px] font-semibold text-neutral-300">
                      Reserva de emergência
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {RESERVE_OPTIONS.map((option) => (
                        <PillChoice
                          key={option.value}
                          selected={draft.emergencyReserve === option.value}
                          onClick={() => update("emergencyReserve", option.value)}
                          label={option.label}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-semibold text-neutral-300">
                      Dívidas com juros altos
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {DEBT_OPTIONS.map((option) => (
                        <PillChoice
                          key={option.value}
                          selected={draft.highInterestDebt === option.value}
                          onClick={() => update("highInterestDebt", option.value)}
                          label={option.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-5">
                  <div>
                    <p className="mb-2 text-[11px] font-semibold text-neutral-300">Formato</p>
                    <div className="flex flex-wrap gap-2">
                      {LEARNING_OPTIONS.map((option) => (
                        <PillChoice
                          key={option.value}
                          selected={draft.learningPreference === option.value}
                          onClick={() => update("learningPreference", option.value)}
                          label={option.label}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-semibold text-neutral-300">Conhecimento</p>
                    <div className="flex flex-wrap gap-2">
                      {KNOWLEDGE_OPTIONS.map((option) => (
                        <PillChoice
                          key={option.value}
                          selected={draft.knowledgeLevel === option.value}
                          onClick={() => update("knowledgeLevel", option.value)}
                          label={option.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-[11px] font-semibold text-neutral-300">Dias</p>
                    <div className="flex flex-wrap gap-2">
                      {DAY_OPTIONS.map((option) => (
                        <PillChoice
                          key={option.value}
                          selected={draft.studyDays.includes(option.value)}
                          onClick={() => toggleDay(option.value)}
                          label={option.label}
                          className="min-w-[54px]"
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-semibold text-neutral-300">Horário</p>
                    <div className="flex flex-wrap gap-2">
                      {TIME_OPTIONS.map((time) => (
                        <PillChoice
                          key={time}
                          selected={draft.studyTime === time}
                          onClick={() => update("studyTime", time)}
                          label={time}
                        />
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <label htmlFor="onb-time" className="text-[10px] text-neutral-500">
                        Outro horário
                      </label>
                      <input
                        id="onb-time"
                        type="time"
                        value={draft.studyTime}
                        onChange={(event) => update("studyTime", event.target.value)}
                        className="rounded-lg border border-white/10 bg-[#0d0d0d] px-2.5 py-1.5 text-[12px] text-neutral-200 outline-none focus:border-accent/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
                  {error}
                </p>
              )}
              {calcError && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
                  {calcError}
                </p>
              )}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </main>

      {phase !== "calculating" && (
        <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.07] bg-[#090909]/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={goBack}
              className="btn-ghost px-3 text-[12px]"
              aria-label={
                phase === "auth"
                  ? "Voltar para o perfil"
                  : phase === "profile"
                    ? "Voltar para a última pergunta"
                    : "Voltar uma etapa"
              }
            >
              <ArrowLeft className="h-4 w-4" /> {phase === "auth" ? "Perfil" : "Voltar"}
            </button>
            {phase === "profile" ? (
              <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                <ShieldCheck className="h-3.5 w-3.5 text-accent/70" aria-hidden="true" />
                Perfil calculado no servidor
              </div>
            ) : phase === "auth" ? (
              <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                <Lock className="h-3.5 w-3.5 text-accent/70" aria-hidden="true" />
                Rascunho preservado
              </div>
            ) : (
              <button
                type="button"
                onClick={goNext}
                disabled={!canContinue}
                className="btn-primary min-w-[132px] px-5 text-[12px]"
              >
                {step === LAST_QUESTION_STEP ? (
                  <>
                    <Sparkles className="h-4 w-4" /> Calcular meu perfil
                  </>
                ) : (
                  <>
                    Continuar <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}

function ReviewPanel({
  draft,
  onEdit,
}: {
  draft: OnboardingDraft;
  onEdit: (step: number) => void;
}) {
  const rows: { label: string; value: string; step: number }[] = [
    { label: "Nome", value: draft.name.trim() || "Não informado", step: 0 },
    { label: "Objetivo", value: labelOf(GOAL_OPTIONS, draft.goal), step: 1 },
    { label: "Situação", value: labelOf(SITUATION_OPTIONS, draft.financialSituation), step: 2 },
    {
      label: "Renda e despesas",
      value: [
        draft.incomeCents != null ? `Renda ${moneyCents(draft.incomeCents)}` : null,
        draft.savingsCapacityCents != null ? `Sobra ${moneyCents(draft.savingsCapacityCents)}` : null,
        draft.essentialExpensesCents != null ? `Despesas ${moneyCents(draft.essentialExpensesCents)}` : null,
      ]
        .filter(Boolean)
        .join(" · ") || "Prefiro não informar",
      step: 3,
    },
    {
      label: "Reserva e dívidas",
      value: `${labelOf(RESERVE_OPTIONS, draft.emergencyReserve)} · ${labelOf(
        DEBT_OPTIONS,
        draft.highInterestDebt,
      )}`,
      step: 4,
    },
    {
      label: "Aprendizado",
      value: `${labelOf(LEARNING_OPTIONS, draft.learningPreference)} · ${labelOf(
        KNOWLEDGE_OPTIONS,
        draft.knowledgeLevel,
      )}`,
      step: 5,
    },
    {
      label: "Rotina",
      value: `${labelsOf(DAY_OPTIONS, draft.studyDays)} · ${draft.studyTime}`,
      step: 6,
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#111111]">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
        <p className="text-[11px] font-semibold text-neutral-200">Seu resumo</p>
        <span className="text-[9px] uppercase tracking-[0.12em] text-neutral-600">
          revise antes de calcular
        </span>
      </div>
      <ul className="divide-y divide-white/[0.05]">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-3 px-4 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-[9px] uppercase tracking-[0.12em] text-neutral-600">{row.label}</p>
              <p className="mt-0.5 truncate text-[12px] text-neutral-200">{row.value}</p>
            </div>
            <button
              type="button"
              onClick={() => onEdit(row.step)}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-neutral-500 transition hover:bg-white/[0.05] hover:text-accent"
              aria-label={`Editar ${row.label}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <p className="border-t border-white/[0.07] px-4 py-3 text-[10px] leading-4 text-neutral-600">
        <Lock className="mr-1 inline h-3 w-3 align-[-2px] text-accent/60" aria-hidden="true" />
        Seus dados financeiros ficam no seu perfil e são visíveis só para você.
      </p>
    </div>
  );
}

function questionText(step: number): string {
  const texts = [
    "Como você quer ser chamado(a)?",
    "Qual é o seu objetivo?",
    "Como está sua situação?",
    "Quanto entra e quanto sai?",
    "Reserva e dívidas?",
    "Como você aprende?",
    "Quando você estuda?",
  ];
  return texts[step] ?? texts[0];
}

function answerText(step: number, draft: OnboardingDraft): string {
  switch (step) {
    case 0:
      return draft.name.trim() || "—";
    case 1:
      return labelOf(GOAL_OPTIONS, draft.goal);
    case 2:
      return labelOf(SITUATION_OPTIONS, draft.financialSituation);
    case 3: {
      const parts = [
        draft.incomeCents != null ? `Renda ${moneyCents(draft.incomeCents)}` : null,
        draft.savingsCapacityCents != null ? `Sobra ${moneyCents(draft.savingsCapacityCents)}` : null,
        draft.essentialExpensesCents != null ? `Despesas ${moneyCents(draft.essentialExpensesCents)}` : null,
      ].filter(Boolean);
      return parts.length ? parts.join(" · ") : "Prefiro não informar";
    }
    case 4:
      return `${labelOf(RESERVE_OPTIONS, draft.emergencyReserve)} · ${labelOf(
        DEBT_OPTIONS,
        draft.highInterestDebt,
      )}`;
    case 5:
      return `${labelOf(LEARNING_OPTIONS, draft.learningPreference)} · ${labelOf(
        KNOWLEDGE_OPTIONS,
        draft.knowledgeLevel,
      )}`;
    case 6:
      return `${labelsOf(DAY_OPTIONS, draft.studyDays)} · ${draft.studyTime}`;
    default:
      return "—";
  }
}

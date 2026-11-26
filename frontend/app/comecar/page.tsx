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
  LEARNING_OPTIONS,
  QUESTION_COUNT,
  RESERVE_OPTIONS,
  SITUATION_OPTIONS,
  TIME_OPTIONS,
  TRIGGER_OPTIONS,
  clearDraft,
  loadDraft,
  moneyCents,
  saveDraft,
  toAnswers,
  type OnboardingDraft,
  type Option,
} from "@/lib/onboarding";
import type {
  FinancialHealth,
  OnboardingProfile,
  SpendingTrigger,
  StudyDay,
} from "@/lib/types";

const REVIEW_STEP = QUESTION_COUNT - 1;

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
  const { user, loading: authLoading } = useAuth();
  const [draft, setDraft] = useState<OnboardingDraft>(EMPTY_DRAFT);
  const [step, setStep] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [phase, setPhase] = useState<"questions" | "calculating" | "result">("questions");
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

  const question = useMemo(() => {
    const questions: { text: string; pose: FinaPose }[] = [
      {
        text: "Oi! Eu sou a Fina, sua guia por aqui. Antes de montar seu plano, como você quer ser chamado(a)?",
        pose: "wave",
      },
      {
        text: `Prazer, ${firstName}. O que você mais quer resolver agora?`,
        pose: "wave",
      },
      {
        text: "E como está sua situação financeira hoje? Isso muda o ponto de partida, não o seu potencial.",
        pose: "think",
      },
      {
        text: "Quanto entra, em média, por mês na sua casa? Pode pular se preferir não informar.",
        pose: "coin",
      },
      {
        text: "Quanto sobra, em média, para guardar por mês? Se preferir, eu calculo pela renda menos as despesas.",
        pose: "coin",
      },
      {
        text: "E quanto vai para as despesas essenciais — moradia, comida, transporte e contas básicas?",
        pose: "think",
      },
      {
        text: "Se você parasse de receber hoje, por quantos meses sua reserva cobriria o essencial?",
        pose: "think",
      },
      {
        text: "Você tem dívidas com juros altos, como cartão de crédito, cheque especial ou empréstimo?",
        pose: "worried",
      },
      {
        text: "Como você aprende melhor? Vou usar isso para sugerir o formato das aulas.",
        pose: "book",
      },
      {
        text: "Quanto você já sabe sobre investimentos? Sem julgamento: isso ajusta a linguagem, não a sua capacidade.",
        pose: "book",
      },
      {
        text: "O que mais costuma furar seu orçamento? Pode escolher mais de um.",
        pose: "think",
      },
      {
        text: "Quando você consegue estudar? Escolha os dias e um horário que caibam na sua rotina.",
        pose: "run",
      },
      {
        text: "Revisei tudo. Se estiver certo, eu calculo seu ponto de partida e monto o próximo passo.",
        pose: "jump",
      },
    ];
    return questions[step] ?? questions[0];
  }, [step, firstName]);

  const progress = phase === "result" ? 100 : Math.round(((step + 1) / QUESTION_COUNT) * 100);

  const canContinue = useMemo(() => {
    switch (step) {
      case 0:
        return draft.name.trim().length >= 2;
      case 1:
        return draft.goal !== null;
      case 2:
        return draft.financialSituation !== null;
      case 3:
      case 4:
      case 5:
        return true;
      case 6:
        return draft.emergencyReserve !== null;
      case 7:
        return draft.highInterestDebt !== null;
      case 8:
        return draft.learningPreference !== null;
      case 9:
        return draft.knowledgeLevel !== null;
      case 10:
        return draft.spendingTriggers.length > 0;
      case 11:
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
        return "Escolha o que você mais quer resolver agora.";
      case 2:
        return "Escolha a opção que mais se parece com sua situação.";
      case 6:
        return "Escolha uma opção de reserva (pode ser “prefiro não informar”).";
      case 7:
        return "Escolha uma opção de dívida (pode ser “prefiro não informar”).";
      case 8:
        return "Escolha como você aprende melhor.";
      case 9:
        return "Escolha seu nível de conhecimento.";
      case 10:
        return "Escolha ao menos um gatilho.";
      case 11:
        return "Escolha ao menos um dia e um horário.";
      default:
        return "Responda para continuar.";
    }
  }

  function update<K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function toggleTrigger(value: SpendingTrigger) {
    setDraft((current) => {
      const has = current.spendingTriggers.includes(value);
      let next: SpendingTrigger[];
      if (value === "NONE") {
        next = has ? [] : ["NONE"];
      } else {
        const withoutNone = current.spendingTriggers.filter((item) => item !== "NONE");
        next = has ? withoutNone.filter((item) => item !== value) : [...withoutNone, value];
      }
      return { ...current, spendingTriggers: next };
    });
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
          : new Promise((resolve) => window.setTimeout(resolve, 850)),
      ]);
      setHealth(result);
      setPhase("result");
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
    if (step === REVIEW_STEP) {
      void calculate();
      return;
    }
    setStep((current) => Math.min(current + 1, REVIEW_STEP));
  }

  function goBack() {
    setError(null);
    setCalcError(null);
    if (phase !== "questions") {
      setPhase("questions");
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
      await api.put<OnboardingProfile>("/api/v1/onboarding/me", {
        name: draft.name.trim(),
        answers,
      });
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
  }

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner label="Preparando seu onboarding" />
      </div>
    );
  }

  const pastSteps = phase === "questions" ? Array.from({ length: step }, (_, index) => index) : [];

  return (
    <div className="onb-stage flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#090909]/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo href="/" compact />
          <div className="flex items-center gap-2 text-[11px] text-neutral-500">
            {user ? (
              <Link href="/app" className="font-medium text-neutral-300 transition hover:text-accent">
                Meu painel
              </Link>
            ) : (
              <Link
                href="/entrar?next=/comecar"
                className="font-medium text-neutral-300 transition hover:text-accent"
              >
                Já tenho conta
              </Link>
            )}
            <span className="text-neutral-700">·</span>
            <span className="tabular-nums">
              {phase === "result" ? "100%" : `Etapa ${step + 1} de ${QUESTION_COUNT}`}
            </span>
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
              Cruzando reserva, dívidas, capacidade de poupança e despesas essenciais.
            </p>
            <div className="mt-6 h-1.5 w-56 overflow-hidden rounded-full bg-white/[0.07]">
              <div className="onb-glow h-full w-full bg-gradient-to-r from-transparent via-accent to-transparent" />
            </div>
          </div>
        ) : phase === "result" && health ? (
          <div className="space-y-5">
            <AssistantBubble pose="jump" animate>
              <Typewriter
                text={`Pronto, ${firstName}. Este é o seu ponto de partida — não uma sentença. O plano abaixo usa só o que você respondeu.`}
              />
            </AssistantBubble>

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

            <section className="onb-enter rounded-2xl border border-white/[0.08] bg-[#111111] p-5 sm:p-6">
              {user ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
                      <Check className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-semibold text-neutral-100">
                        Sessão ativa como {user.email}
                      </h2>
                      <p className="mt-1 text-[11px] leading-5 text-neutral-500">
                        Salve para vincular este perfil à sua conta e abrir o painel personalizado.
                      </p>
                    </div>
                  </div>
                  {saveError && (
                    <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
                      {saveError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveClick}
                    disabled={saving}
                    className="btn-primary mt-4 w-full"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Salvar e abrir meu painel <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="eyebrow">Último passo</p>
                    <h2 className="mt-2 text-[19px] font-medium tracking-[-0.03em] text-neutral-100">
                      Entre para guardar seu resultado
                    </h2>
                    <p className="mt-1.5 text-[11px] leading-5 text-neutral-500">
                      Seu rascunho continua aqui. Depois de entrar ou criar a conta, salvamos o
                      perfil e abrimos o painel.
                    </p>
                  </div>
                  {saveError && (
                    <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
                      {saveError}
                    </p>
                  )}
                  <AuthGate name={draft.name} onAuthenticated={saveAndOpen} />
                </>
              )}
            </section>

            <div className="flex flex-wrap items-center justify-center gap-3 pb-4">
              <button
                type="button"
                onClick={() => {
                  setPhase("questions");
                  setStep(REVIEW_STEP);
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

            <div className="onb-enter space-y-3 sm:pl-[68px]">
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
                <MoneyStep
                  id="onb-income"
                  label="Renda mensal"
                  value={draft.incomeCents}
                  onChange={(value) => update("incomeCents", value)}
                  onSkip={() => {
                    update("incomeCents", null);
                    setStep((current) => current + 1);
                  }}
                />
              )}

              {step === 4 && (
                <MoneyStep
                  id="onb-savings"
                  label="Quanto sobra por mês"
                  value={draft.savingsCapacityCents}
                  onChange={(value) => update("savingsCapacityCents", value)}
                  onSkip={() => {
                    update("savingsCapacityCents", null);
                    setStep((current) => current + 1);
                  }}
                  hint="Se você deixar em branco, uso renda menos despesas essenciais quando os dois estiverem preenchidos."
                />
              )}

              {step === 5 && (
                <MoneyStep
                  id="onb-expenses"
                  label="Despesas essenciais por mês"
                  value={draft.essentialExpensesCents}
                  onChange={(value) => update("essentialExpensesCents", value)}
                  onSkip={() => {
                    update("essentialExpensesCents", null);
                    setStep((current) => current + 1);
                  }}
                />
              )}

              {step === 6 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {RESERVE_OPTIONS.map((option, index) => (
                    <ChoiceCard
                      key={option.value}
                      selected={draft.emergencyReserve === option.value}
                      onClick={() => update("emergencyReserve", option.value)}
                      label={option.label}
                      index={index}
                    />
                  ))}
                </div>
              )}

              {step === 7 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {DEBT_OPTIONS.map((option, index) => (
                    <ChoiceCard
                      key={option.value}
                      selected={draft.highInterestDebt === option.value}
                      onClick={() => update("highInterestDebt", option.value)}
                      label={option.label}
                      index={index}
                    />
                  ))}
                </div>
              )}

              {step === 8 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {LEARNING_OPTIONS.map((option, index) => (
                    <ChoiceCard
                      key={option.value}
                      selected={draft.learningPreference === option.value}
                      onClick={() => update("learningPreference", option.value)}
                      label={option.label}
                      index={index}
                    />
                  ))}
                </div>
              )}

              {step === 9 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {KNOWLEDGE_OPTIONS.map((option, index) => (
                    <ChoiceCard
                      key={option.value}
                      selected={draft.knowledgeLevel === option.value}
                      onClick={() => update("knowledgeLevel", option.value)}
                      label={option.label}
                      index={index}
                    />
                  ))}
                </div>
              )}

              {step === 10 && (
                <div>
                  <div className="flex flex-wrap gap-2">
                    {TRIGGER_OPTIONS.map((option) => (
                      <PillChoice
                        key={option.value}
                        selected={draft.spendingTriggers.includes(option.value)}
                        onClick={() => toggleTrigger(option.value)}
                        label={option.label}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] text-neutral-600">
                    “Nenhum em especial” é exclusivo. Você pode escolher mais de um dos demais.
                  </p>
                </div>
              )}

              {step === 11 && (
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

              {step === 12 && <ReviewPanel draft={draft} onEdit={editStep} />}

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
              aria-label={phase === "result" ? "Voltar para a revisão" : "Voltar uma etapa"}
            >
              <ArrowLeft className="h-4 w-4" /> {phase === "result" ? "Revisão" : "Voltar"}
            </button>
            {phase === "result" ? (
              <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                <ShieldCheck className="h-3.5 w-3.5 text-accent/70" aria-hidden="true" />
                Resultado calculado no servidor
              </div>
            ) : (
              <button
                type="button"
                onClick={goNext}
                disabled={!canContinue}
                className="btn-primary min-w-[132px] px-5 text-[12px]"
              >
                {step === REVIEW_STEP ? (
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

function MoneyStep({
  id,
  label,
  value,
  onChange,
  onSkip,
  hint,
}: {
  id: string;
  label: string;
  value: number | null;
  onChange: (cents: number | null) => void;
  onSkip: () => void;
  hint?: string;
}) {
  return (
    <div className="space-y-3">
      <CurrencyField id={id} label={label} value={value} onChange={onChange} autoFocus />
      {hint && <p className="text-[10px] leading-4 text-neutral-600">{hint}</p>}
      <button
        type="button"
        onClick={onSkip}
        className="text-[11px] font-medium text-neutral-500 underline decoration-white/20 underline-offset-4 transition hover:text-neutral-200"
      >
        Prefiro não informar agora
      </button>
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
    { label: "Renda mensal", value: moneyCents(draft.incomeCents), step: 3 },
    { label: "Sobra por mês", value: moneyCents(draft.savingsCapacityCents), step: 4 },
    { label: "Despesas essenciais", value: moneyCents(draft.essentialExpensesCents), step: 5 },
    { label: "Reserva", value: labelOf(RESERVE_OPTIONS, draft.emergencyReserve), step: 6 },
    { label: "Dívidas caras", value: labelOf(DEBT_OPTIONS, draft.highInterestDebt), step: 7 },
    { label: "Aprendizado", value: labelOf(LEARNING_OPTIONS, draft.learningPreference), step: 8 },
    { label: "Conhecimento", value: labelOf(KNOWLEDGE_OPTIONS, draft.knowledgeLevel), step: 9 },
    { label: "Gatilhos", value: labelsOf(TRIGGER_OPTIONS, draft.spendingTriggers), step: 10 },
    {
      label: "Rotina",
      value: `${labelsOf(DAY_OPTIONS, draft.studyDays)} · ${draft.studyTime}`,
      step: 11,
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
    "Qual é o seu objetivo agora?",
    "Como está sua situação financeira hoje?",
    "Quanto entra por mês na sua casa?",
    "Quanto sobra para guardar por mês?",
    "Quanto vai para as despesas essenciais?",
    "Por quantos meses sua reserva cobriria o essencial?",
    "Você tem dívidas com juros altos?",
    "Como você aprende melhor?",
    "Quanto você já sabe sobre investimentos?",
    "O que mais costuma furar seu orçamento?",
    "Quando você consegue estudar?",
    "Vamos revisar suas respostas?",
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
    case 3:
      return moneyCents(draft.incomeCents);
    case 4:
      return moneyCents(draft.savingsCapacityCents);
    case 5:
      return moneyCents(draft.essentialExpensesCents);
    case 6:
      return labelOf(RESERVE_OPTIONS, draft.emergencyReserve);
    case 7:
      return labelOf(DEBT_OPTIONS, draft.highInterestDebt);
    case 8:
      return labelOf(LEARNING_OPTIONS, draft.learningPreference);
    case 9:
      return labelOf(KNOWLEDGE_OPTIONS, draft.knowledgeLevel);
    case 10:
      return labelsOf(TRIGGER_OPTIONS, draft.spendingTriggers);
    case 11:
      return `${labelsOf(DAY_OPTIONS, draft.studyDays)} · ${draft.studyTime}`;
    default:
      return "—";
  }
}

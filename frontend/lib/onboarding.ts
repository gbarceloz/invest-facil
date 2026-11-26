import type {
  EmergencyReserve,
  FinancialSituation,
  HighInterestDebt,
  KnowledgeLevel,
  LearningPreference,
  OnboardingAnswers,
  OnboardingGoal,
  SpendingTrigger,
  StudyDay,
} from "./types";

export const DRAFT_KEY = "investfacil:onboarding:draft:v1";

export interface OnboardingDraft {
  name: string;
  goal: OnboardingGoal | null;
  financialSituation: FinancialSituation | null;
  incomeCents: number | null;
  savingsCapacityCents: number | null;
  essentialExpensesCents: number | null;
  emergencyReserve: EmergencyReserve | null;
  highInterestDebt: HighInterestDebt | null;
  learningPreference: LearningPreference | null;
  knowledgeLevel: KnowledgeLevel | null;
  spendingTriggers: SpendingTrigger[];
  studyDays: StudyDay[];
  studyTime: string;
}

export const EMPTY_DRAFT: OnboardingDraft = {
  name: "",
  goal: null,
  financialSituation: null,
  incomeCents: null,
  savingsCapacityCents: null,
  essentialExpensesCents: null,
  emergencyReserve: null,
  highInterestDebt: null,
  learningPreference: null,
  knowledgeLevel: null,
  spendingTriggers: ["NONE"],
  studyDays: [],
  studyTime: "19:00",
};

export type Option<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

export const GOAL_OPTIONS: Option<OnboardingGoal>[] = [
  { value: "DEBT", label: "Sair das dívidas", description: "Reduzir o peso das contas atrasadas" },
  { value: "INVEST", label: "Começar a investir", description: "Dar o primeiro passo com segurança" },
  { value: "MULTIPLY", label: "Multiplicar o que já tenho", description: "Fazer o dinheiro trabalhar melhor" },
  { value: "ORGANIZE", label: "Organizar minha vida financeira", description: "Entender para onde o dinheiro vai" },
  { value: "WEALTH", label: "Construir patrimônio", description: "Pensar no longo prazo" },
];

export const SITUATION_OPTIONS: Option<FinancialSituation>[] = [
  { value: "IN_DEBT", label: "Estou endividado(a)", description: "As contas estão apertando" },
  { value: "FROM_ZERO", label: "Começando do zero", description: "Quero organizar a base" },
  { value: "CAN_SAVE", label: "Consigo guardar um pouco", description: "Sobra algo todo mês" },
  { value: "INVESTOR", label: "Já invisto", description: "Quero investir com mais critério" },
];

export const RESERVE_OPTIONS: Option<EmergencyReserve>[] = [
  { value: "NONE", label: "Não tenho reserva" },
  { value: "LESS_THAN_1", label: "Menos de 1 mês" },
  { value: "ONE_TO_3", label: "De 1 a 3 meses" },
  { value: "THREE_TO_6", label: "De 3 a 6 meses" },
  { value: "MORE_THAN_6", label: "Mais de 6 meses" },
  { value: "PREFER_NOT", label: "Prefiro não informar" },
];

export const DEBT_OPTIONS: Option<HighInterestDebt>[] = [
  { value: "NONE", label: "Não tenho dívidas caras" },
  { value: "CREDIT_CARD", label: "Cartão de crédito" },
  { value: "OVERDRAFT", label: "Cheque especial" },
  { value: "LOANS", label: "Empréstimos" },
  { value: "MULTIPLE", label: "Várias delas" },
  { value: "PREFER_NOT", label: "Prefiro não informar" },
];

export const LEARNING_OPTIONS: Option<LearningPreference>[] = [
  { value: "VIDEOS", label: "Vídeos curtos" },
  { value: "TEXTS", label: "Lendo textos" },
  { value: "PRACTICE", label: "Praticando" },
  { value: "MIX", label: "Um pouco de cada" },
];

export const KNOWLEDGE_OPTIONS: Option<KnowledgeLevel>[] = [
  { value: "ZERO", label: "Começando do zero" },
  { value: "BASIC", label: "Sei o básico" },
  { value: "INTERMEDIATE", label: "Já entendo conceitos" },
  { value: "ADVANCED", label: "Quero aprofundar" },
];

export const TRIGGER_OPTIONS: Option<SpendingTrigger>[] = [
  { value: "DELIVERY", label: "Delivery" },
  { value: "SHOPPING", label: "Compras" },
  { value: "SOCIAL", label: "Sair com amigos" },
  { value: "SUBSCRIPTIONS", label: "Assinaturas" },
  { value: "IMPULSE", label: "Compras por impulso" },
  { value: "NONE", label: "Nenhum em especial" },
];

export const DAY_OPTIONS: Option<StudyDay>[] = [
  { value: "MON", label: "Seg" },
  { value: "TUE", label: "Ter" },
  { value: "WED", label: "Qua" },
  { value: "THU", label: "Qui" },
  { value: "FRI", label: "Sex" },
  { value: "SAT", label: "Sáb" },
  { value: "SUN", label: "Dom" },
];

export const TIME_OPTIONS = ["07:00", "12:00", "18:00", "19:00", "20:00", "21:00"];

export const QUESTION_COUNT = 8;

export function toAnswers(draft: OnboardingDraft): OnboardingAnswers | null {
  if (
    !draft.goal ||
    !draft.financialSituation ||
    !draft.emergencyReserve ||
    !draft.highInterestDebt ||
    !draft.learningPreference ||
    !draft.knowledgeLevel ||
    draft.studyDays.length === 0 ||
    !draft.studyTime
  ) {
    return null;
  }
  return {
    goal: draft.goal,
    financialSituation: draft.financialSituation,
    incomeCents: draft.incomeCents,
    savingsCapacityCents: draft.savingsCapacityCents,
    essentialExpensesCents: draft.essentialExpensesCents,
    emergencyReserve: draft.emergencyReserve,
    highInterestDebt: draft.highInterestDebt,
    learningPreference: draft.learningPreference,
    knowledgeLevel: draft.knowledgeLevel,
    spendingTriggers: draft.spendingTriggers.length > 0 ? draft.spendingTriggers : ["NONE"],
    studyDays: draft.studyDays,
    studyTime: draft.studyTime,
  };
}

export function loadDraft(): { step: number; draft: OnboardingDraft } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      version?: number;
      step?: number;
      draft?: Partial<OnboardingDraft>;
    };
    if (parsed.version !== 1 || !parsed.draft) return null;
    const draft: OnboardingDraft = {
      ...EMPTY_DRAFT,
      ...parsed.draft,
      spendingTriggers: Array.isArray(parsed.draft.spendingTriggers)
        ? parsed.draft.spendingTriggers
        : [],
      studyDays: Array.isArray(parsed.draft.studyDays) ? parsed.draft.studyDays : [],
    };
    const step = typeof parsed.step === "number"
      ? Math.min(Math.max(parsed.step, 0), QUESTION_COUNT - 1)
      : 0;
    return { step, draft };
  } catch {
    return null;
  }
}

export function saveDraft(step: number, draft: OnboardingDraft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ version: 1, step, draft, updatedAt: new Date().toISOString() }),
    );
  } catch {
    // Armazenamento indisponível (modo privado): o fluxo continua em memória.
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Ignora falhas de armazenamento.
  }
}

/** Converte um texto em reais para centavos, aceitando vírgula ou ponto. */
export function parseBrlToCents(value: string): number | null {
  const cleaned = value.replace(/[^\d.,-]/g, "").trim();
  if (!cleaned) return null;
  if (cleaned.includes(",")) {
    const normalized = cleaned.replace(/\./g, "").replace(",", ".");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? Math.round(parsed * 100) : null;
  }
  const parts = cleaned.split(".");
  if (parts.length === 2 && parts[1].length <= 2) {
    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? Math.round(parsed * 100) : null;
  }
  const parsed = Number.parseFloat(cleaned.replace(/\./g, ""));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : null;
}

export function centsToBrlInput(cents: number | null): string {
  if (cents == null) return "";
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function moneyCents(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  });
}

const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function longDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
}

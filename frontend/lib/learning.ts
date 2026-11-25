import { ApiError } from "./api";
import type { GamificationSummary, LessonStatus } from "./types";

export const MODULE01_SLUG = "entenda-o-dinheiro";
export const MODULE01_TITLE = "Entenda o dinheiro";
export const MODULE01_LESSON_COUNT = 8;
export const DEFAULT_PASS_PERCENT = 67;

/** Slugs canônicos na ordem do módulo (fonte também dos vídeos locais). */
export const MODULE01_LESSON_SLUGS = [
  "o-que-e-dinheiro",
  "por-que-o-dinheiro-tem-valor",
  "como-o-dinheiro-surgiu",
  "o-que-e-inflacao",
  "por-que-100-hoje-nao-vale-o-mesmo-no-futuro",
  "o-que-e-poder-de-compra",
  "o-que-sao-juros",
  "juros-simples-vs-compostos",
] as const;

export interface Module01VideoAssets {
  mp4: string;
  poster: string;
  captions: string;
}

/**
 * Base pública opcional dos vídeos do Módulo 01 (ex.: Supabase Storage).
 * O acesso precisa ser literal para o Next inlinar a variável no bundle do
 * cliente; a leitura é feita a cada chamada para não congelar o valor.
 */
function module01VideoBaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_VIDEO_BASE_URL;
  if (typeof raw !== "string") return null;
  const base = raw.trim().replace(/\/+$/, "");
  return base.length > 0 ? base : null;
}

/**
 * Assets de vídeo dos 8 slugs canônicos; não é endpoint da API.
 * Com `NEXT_PUBLIC_VIDEO_BASE_URL` definida (Storage/CDN), usa a base externa;
 * sem a env, mantém os arquivos locais de `frontend/public/videos/module-01`.
 */
export function module01VideoAssets(slug: string): Module01VideoAssets | null {
  if (!(MODULE01_LESSON_SLUGS as readonly string[]).includes(slug)) return null;
  const base = module01VideoBaseUrl() ?? "/videos/module-01";
  return {
    mp4: `${base}/${slug}.mp4`,
    poster: `${base}/${slug}.jpg`,
    captions: `${base}/${slug}.vtt`,
  };
}

export type LessonState = "completed" | "current" | "locked";

interface StreakSource {
  currentStreak?: number | null;
  bestStreak?: number | null;
}

function numeric(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * Streak vem do servidor (`gamification.streak`). O fallback legado existe
 * apenas para o backend anterior; nenhum dia é calculado no cliente.
 */
export function resolveStreak(
  gamification: GamificationSummary | null | undefined,
  fallback?: StreakSource | null,
): { current: number; best: number; lastActivityDate: string | null; timezone: string | null } {
  const streak = gamification?.streak ?? null;
  return {
    current:
      numeric(streak?.current) ??
      numeric(gamification?.currentStreak) ??
      numeric(fallback?.currentStreak) ??
      0,
    best:
      numeric(streak?.best) ??
      numeric(gamification?.bestStreak) ??
      numeric(fallback?.bestStreak) ??
      0,
    lastActivityDate: streak?.lastActivityDate ?? null,
    timezone: streak?.timezone ?? null,
  };
}

/** Saldo de fichas autoritativo do servidor. `0` é um valor válido. */
export function resolveFichas(
  gamification: GamificationSummary | null | undefined,
  fallback?: number | null,
): number | null {
  return numeric(gamification?.fichas) ?? numeric(fallback) ?? null;
}

export function resolveFichasMax(
  gamification: GamificationSummary | null | undefined,
  fallback?: number | null,
): number | null {
  return numeric(gamification?.fichasMax) ?? numeric(fallback) ?? null;
}

/**
 * Estado de cada aula na ordem canônica: concluída, atual (primeira pendente)
 * ou bloqueada (depois da atual). Aulas concluídas podem ser revistas.
 */
export function deriveLessonStates(
  lessons: ReadonlyArray<{ id: string }>,
  completedIds: ReadonlyArray<string>,
  currentId?: string | null,
): LessonState[] {
  const completed = new Set(completedIds);
  let currentIndex = currentId ? lessons.findIndex((lesson) => lesson.id === currentId) : -1;
  if (currentIndex < 0) {
    currentIndex = lessons.findIndex((lesson) => !completed.has(lesson.id));
  }

  return lessons.map((lesson, index) => {
    if (completed.has(lesson.id)) return "completed";
    if (currentIndex < 0) return "current";
    if (index <= currentIndex) return "current";
    return "locked";
  });
}

/** CONTINUAR só libera após o evento `ended` ou se o servidor já registrou o vídeo. */
export function canContinueLesson(input: {
  videoWatched?: boolean | null;
  completed?: boolean | null;
}): boolean {
  if (input.completed === true) return true;
  return input.videoWatched === true;
}

/**
 * Vídeo assistido (ou aula já concluída) é pré-requisito do quiz.
 * `canStartQuiz` do servidor significa `fichas > 0`; o fluxo do produto
 * exige também o vídeo assistido antes de abrir as perguntas.
 */
export function canStartQuiz(status: LessonStatus | null | undefined): boolean {
  if (!status) return false;
  // Regra de produto: 0 fichas bloqueia nova tentativa, inclusive após concluir a aula.
  if (typeof status.fichas === "number" && status.fichas <= 0) return false;
  if (status.canStartQuiz === undefined && status.videoWatched === undefined) {
    // Backend anterior não expunha os campos novos: caminho legado,
    // sempre com a autorização final do servidor no submit.
    return true;
  }
  if (status.completed) return true;
  if (status.videoWatched === false) return false;
  return status.canStartQuiz !== false;
}

/** Reprovado só tenta de novo com saldo > 0. `null` = saldo desconhecido. */
export function canRetryQuiz(input: {
  passed: boolean;
  fichas?: number | null;
}): boolean {
  if (input.passed) return false;
  const remaining = numeric(input.fichas);
  return remaining === null || remaining > 0;
}

export function resolvePassPercent(
  status?: LessonStatus | null,
  gamification?: GamificationSummary | null,
): number {
  return (
    numeric(status?.passPercent) ??
    numeric(gamification?.quizPassThresholdPercent) ??
    DEFAULT_PASS_PERCENT
  );
}

export function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Mensagens de erro do contrato Módulo 01; o servidor continua sendo a fonte. */
export function quizSubmitMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "NO_FICHAS":
        return "Você está sem fichas. Cada tentativa reprovada consome 1 ficha e o saldo não regenera sozinho.";
      case "QUIZ_IN_PROGRESS":
        return "Este envio ainda está sendo processado. Aguarde alguns segundos e tente novamente — a mesma chave não consome outra ficha.";
      case "LESSON_NOT_READY":
        return "Assista ao vídeo da aula até o fim antes de responder ao quiz.";
      case "INVALID_TIMEZONE":
        return "Não foi possível registrar sua sequência: o fuso horário da conta é inválido. Atualize o perfil e tente novamente.";
      default:
        return error.message;
    }
  }
  return error instanceof Error ? error.message : "Não foi possível enviar o quiz.";
}

/** Erros do POST de vídeo (posição/duração validadas no servidor). */
export function videoRegisterMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "VIDEO_NOT_FINISHED": {
        const required = error.details?.requiredPositionSeconds;
        return required
          ? `O servidor exige que o vídeo chegue a pelo menos ${required} segundos. Reproduza o final e tente registrar de novo.`
          : "O servidor considerou o vídeo incompleto. Reproduza até o final e tente registrar de novo.";
      }
      case "VIDEO_INVALID_DURATION":
        return "Não foi possível confirmar a duração do vídeo. Recarregue a página e assista novamente até o fim.";
      default:
        return error.message;
    }
  }
  return error instanceof Error
    ? error.message
    : "Não foi possível registrar o vídeo assistido.";
}

/** Primeira descrição curta legível do markdown da aula. */
export function oneLineSummary(markdown: string, maxLength = 220): string {
  const paragraph = markdown
    .split(/\n\s*\n/)
    .map((part) => part.replace(/^#+\s.*$/gm, "").replace(/[*_>`]/g, "").trim())
    .find((part) => part.length > 40);
  const text = (paragraph ?? markdown).replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, Math.max(0, maxLength - 3))}…` : text;
}

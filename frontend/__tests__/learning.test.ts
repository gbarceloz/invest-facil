import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, api, setAccessToken } from "@/lib/api";
import type { GamificationSummary, LessonStatus } from "@/lib/types";
import {
  canContinueLesson,
  canRetryQuiz,
  canStartQuiz,
  deriveLessonStates,
  module01VideoAssets,
  quizSubmitMessage,
  resolveFichas,
  resolveStreak,
} from "@/lib/learning";

function status(overrides: Partial<LessonStatus> = {}): LessonStatus {
  return {
    completed: false,
    bestQuizPercent: 0,
    attempts: 0,
    videoWatched: true,
    quizPassed: false,
    canStartQuiz: true,
    fichas: 3,
    fichasMax: 3,
    passPercent: 67,
    ...overrides,
  };
}

function gamification(overrides: Partial<GamificationSummary> = {}): GamificationSummary {
  return {
    xp: 120,
    level: { number: 1, name: "Curioso", minXp: 0, nextLevelXp: 300 },
    xpToNextLevel: 180,
    progressPercent: 40,
    currentStreak: 3,
    bestStreak: 5,
    achievementsUnlocked: 1,
    achievementsTotal: 7,
    achievements: [],
    fichas: 3,
    fichasMax: 3,
    quizPassThresholdPercent: 67,
    streak: {
      current: 3,
      best: 5,
      lastActivityDate: "2026-11-24",
      timezone: "America/Sao_Paulo",
    },
    ...overrides,
  };
}

describe("fichas e streak vindos do servidor", () => {
  it("resolveFichas preserva saldo 0 e não inventa valor ausente", () => {
    expect(resolveFichas(gamification({ fichas: 0 }))).toBe(0);
    expect(resolveFichas(null, 2)).toBe(2);
    expect(resolveFichas(null)).toBeNull();
  });

  it("resolveStreak prefere o objeto novo do contrato", () => {
    const value = gamification({
      currentStreak: 99,
      bestStreak: 99,
      streak: { current: 4, best: 6, lastActivityDate: "2026-11-23", timezone: "UTC" },
    });
    expect(resolveStreak(value)).toEqual({
      current: 4,
      best: 6,
      lastActivityDate: "2026-11-23",
      timezone: "UTC",
    });
  });

  it("resolveStreak mantém fallback legado e do resumo de progresso", () => {
    const legacy = { currentStreak: 4, bestStreak: 8 } as GamificationSummary;
    expect(resolveStreak(legacy)).toMatchObject({ current: 4, best: 8 });
    expect(resolveStreak(null, { currentStreak: 2, bestStreak: 7 })).toMatchObject({
      current: 2,
      best: 7,
    });
  });
});

describe("progressão da trilha", () => {
  const lessons = [{ id: "a" }, { id: "b" }, { id: "c" }];

  it("marca concluída, atual e bloqueadas na ordem canônica", () => {
    expect(deriveLessonStates(lessons, ["a"], "b")).toEqual(["completed", "current", "locked"]);
  });

  it("sem aula atual, a primeira pendente vira atual", () => {
    expect(deriveLessonStates(lessons, ["a"], null)).toEqual(["completed", "current", "locked"]);
  });

  it("aulas concluídas continuam revisáveis", () => {
    expect(deriveLessonStates(lessons, ["a", "b", "c"])).toEqual([
      "completed",
      "completed",
      "completed",
    ]);
  });
});

describe("gate do CONTINUAR e do quiz", () => {
  it("CONTINUAR exige vídeo assistido ou aula concluída", () => {
    expect(canContinueLesson({ videoWatched: false, completed: false })).toBe(false);
    expect(canContinueLesson({ videoWatched: true, completed: false })).toBe(true);
    expect(canContinueLesson({ videoWatched: false, completed: true })).toBe(true);
  });

  it("quiz libera com vídeo assistido e fichas", () => {
    expect(canStartQuiz(status({ videoWatched: true, fichas: 2, canStartQuiz: true }))).toBe(true);
    expect(canStartQuiz(status({ completed: true, videoWatched: true, fichas: 2 }))).toBe(true);
  });

  it("quiz bloqueia sem vídeo ou sem fichas", () => {
    expect(canStartQuiz(status({ videoWatched: false, fichas: 3 }))).toBe(false);
    expect(canStartQuiz(status({ videoWatched: true, fichas: 0, canStartQuiz: false }))).toBe(false);
  });

  it("aula concluída com 0 fichas não abre nova tentativa de quiz", () => {
    expect(
      canStartQuiz(status({ completed: true, videoWatched: true, fichas: 0, canStartQuiz: false })),
    ).toBe(false);
  });

  it("quiz mantém o caminho legado quando o status não tem os campos novos", () => {
    const legacy = { completed: false, bestQuizPercent: 0, attempts: 0 } as LessonStatus;
    expect(canStartQuiz(legacy)).toBe(true);
  });

  it("retry de quiz reprovado depende do saldo", () => {
    expect(canRetryQuiz({ passed: true, fichas: 3 })).toBe(false);
    expect(canRetryQuiz({ passed: false, fichas: 0 })).toBe(false);
    expect(canRetryQuiz({ passed: false, fichas: 1 })).toBe(true);
    expect(canRetryQuiz({ passed: false, fichas: null })).toBe(true);
  });
});

describe("mensagens de erro do contrato", () => {
  it("traduz NO_FICHAS, LESSON_NOT_READY e INVALID_TIMEZONE", () => {
    expect(quizSubmitMessage(new ApiError(409, "NO_FICHAS", "sem fichas"))).toMatch(/sem fichas/i);
    expect(
      quizSubmitMessage(new ApiError(409, "LESSON_NOT_READY", "não pronta")),
    ).toMatch(/vídeo/i);
    expect(
      quizSubmitMessage(new ApiError(400, "INVALID_TIMEZONE", "fuso")),
    ).toMatch(/fuso horário/i);
  });

  it("preserva a mensagem do servidor para erros desconhecidos", () => {
    expect(quizSubmitMessage(new ApiError(400, "INCOMPLETE_QUIZ", "Responda todas"))).toBe(
      "Responda todas",
    );
  });
});

describe("vídeos do Módulo 01 (local e externo)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sem NEXT_PUBLIC_VIDEO_BASE_URL, resolve MP4, poster e legendas locais", () => {
    vi.stubEnv("NEXT_PUBLIC_VIDEO_BASE_URL", "");
    expect(module01VideoAssets("o-que-e-dinheiro")).toEqual({
      mp4: "/videos/module-01/o-que-e-dinheiro.mp4",
      poster: "/videos/module-01/o-que-e-dinheiro.jpg",
      captions: "/videos/module-01/o-que-e-dinheiro.vtt",
    });
  });

  it("com base externa, troca o prefixo local e remove a barra final", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_VIDEO_BASE_URL",
      "https://projeto.supabase.co/storage/v1/object/public/lessons/module-01/",
    );
    expect(module01VideoAssets("o-que-e-inflacao")).toEqual({
      mp4: "https://projeto.supabase.co/storage/v1/object/public/lessons/module-01/o-que-e-inflacao.mp4",
      poster:
        "https://projeto.supabase.co/storage/v1/object/public/lessons/module-01/o-que-e-inflacao.jpg",
      captions:
        "https://projeto.supabase.co/storage/v1/object/public/lessons/module-01/o-que-e-inflacao.vtt",
    });
  });

  it("usa a revisão v9 da aula 01 somente no storage externo", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_VIDEO_BASE_URL",
      "https://projeto.supabase.co/storage/v1/object/public/module01-videos/module-01",
    );
    expect(module01VideoAssets("o-que-e-dinheiro")).toEqual({
      mp4: "https://projeto.supabase.co/storage/v1/object/public/module01-videos/module-01/o-que-e-dinheiro-v9.mp4",
      poster:
        "https://projeto.supabase.co/storage/v1/object/public/module01-videos/module-01/o-que-e-dinheiro-v9.jpg",
      captions:
        "https://projeto.supabase.co/storage/v1/object/public/module01-videos/module-01/o-que-e-dinheiro-v9.vtt",
    });
  });

  it("aceita base externa sem barra final e com espaços", () => {
    vi.stubEnv("NEXT_PUBLIC_VIDEO_BASE_URL", "  https://cdn.exemplo.com/module-01  ");
    expect(module01VideoAssets("o-que-sao-juros")).toEqual({
      mp4: "https://cdn.exemplo.com/module-01/o-que-sao-juros.mp4",
      poster: "https://cdn.exemplo.com/module-01/o-que-sao-juros.jpg",
      captions: "https://cdn.exemplo.com/module-01/o-que-sao-juros.vtt",
    });
  });

  it("não resolve aula fora do Módulo 01, nem com base externa", () => {
    vi.stubEnv("NEXT_PUBLIC_VIDEO_BASE_URL", "https://cdn.exemplo.com/module-01");
    expect(module01VideoAssets("por-que-educacao-financeira")).toBeNull();
  });
});

describe("api.post", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setAccessToken(null);
  });

  it("envia Idempotency-Key e corpo JSON", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init: RequestInit = {}) =>
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    setAccessToken(null);

    await api.post(
      "/api/v1/progress/lessons/l1/quiz",
      { answers: [] },
      { headers: { "Idempotency-Key": "key-123" } },
    );

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(init.method).toBe("POST");
    expect(headers.get("Idempotency-Key")).toBe("key-123");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ answers: [] }));
  });
});

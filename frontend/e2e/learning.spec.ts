import { expect, test, type Page } from "@playwright/test";
import { createVerifiedUser, loginThroughUi } from "./helpers";

const LESSON_SLUG = "o-que-e-dinheiro";
const MODULE_SLUG = "entenda-o-dinheiro";

const lessonResponse = {
  id: "lesson-1",
  slug: LESSON_SLUG,
  title: "O que é dinheiro?",
  contentMd:
    "# O que é dinheiro?\n\nDinheiro é o meio aceito por uma comunidade para trocar valor, medir preços e guardar poder de compra ao longo do tempo. Ele não se confunde com riqueza.",
  estimatedMin: 4,
  order: 1,
  moduleId: "module-1",
  moduleSlug: MODULE_SLUG,
  moduleTitle: "Entenda o dinheiro",
  categorySlug: "fundamentos",
  categoryName: "Fundamentos",
  relatedArticles: [],
};

const moduleResponse = {
  id: "module-1",
  slug: MODULE_SLUG,
  title: "Entenda o dinheiro",
  description: "Oito aulas para entender o básico do dinheiro.",
  categorySlug: "fundamentos",
  categoryName: "Fundamentos",
  lessons: [
    {
      id: "lesson-1",
      slug: LESSON_SLUG,
      title: "O que é dinheiro?",
      description: "Meio de troca, unidade de conta e reserva de valor.",
      estimatedMin: 4,
      order: 1,
      moduleId: "module-1",
    },
    {
      id: "lesson-2",
      slug: "por-que-o-dinheiro-tem-valor",
      title: "Por que o dinheiro tem valor?",
      description: "Confiança, escassez e aceitação.",
      estimatedMin: 4,
      order: 2,
      moduleId: "module-1",
    },
  ],
};

const quizResponse = {
  lessonId: "lesson-1",
  lessonTitle: "O que é dinheiro?",
  questionCount: 3,
  questions: [
    { id: "q1", position: 1, question: "Pergunta 1?", options: ["Alternativa A", "Alternativa B"] },
    { id: "q2", position: 2, question: "Pergunta 2?", options: ["Alternativa A", "Alternativa B"] },
    { id: "q3", position: 3, question: "Pergunta 3?", options: ["Alternativa A", "Alternativa B"] },
  ],
};

const quizResult = {
  score: 3,
  maxScore: 3,
  percent: 100,
  passed: true,
  xpAwarded: 80,
  totalXp: 200,
  level: "Curioso",
  results: [
    { questionId: "q1", correct: true, selectedIndex: 0, correctIndex: 0 },
    { questionId: "q2", correct: true, selectedIndex: 0, correctIndex: 0 },
    { questionId: "q3", correct: true, selectedIndex: 0, correctIndex: 0 },
  ],
  fichas: 3,
  fichasMax: 3,
  lessonCompleted: true,
  idempotentReplay: false,
  videoWatched: true,
};

function statusResponse(overrides: Record<string, unknown>) {
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

async function mockLessonApi(page: Page, status: Record<string, unknown>) {
  await page.route(`**/api/v1/content/lessons/${LESSON_SLUG}`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(lessonResponse) }),
  );
  await page.route(`**/api/v1/content/lessons/${LESSON_SLUG}/video`, (route) =>
    route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ code: "NOT_FOUND", message: "Vídeo em preparação" }),
    }),
  );
  await page.route(`**/api/v1/content/modules/${MODULE_SLUG}`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(moduleResponse) }),
  );
  await page.route("**/api/v1/progress/lessons/lesson-1", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(status) }),
  );
  await page.route("**/api/v1/progress/lessons/lesson-1/quiz", (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(quizResult),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(quizResponse),
    });
  });
}

test.describe("Jornada B — vídeo, quiz e fichas do Módulo 01", () => {
  test("abre aula, avança com vídeo já assistido, responde 3 perguntas e vê a próxima aula", async ({
    page,
    request,
  }) => {
    const credentials = await createVerifiedUser(request, "aprender-modulo01");
    await loginThroughUi(page, credentials);

    await mockLessonApi(page, statusResponse({}));

    let idempotencyKey: string | undefined;
    page.on("request", (requestEvent) => {
      if (
        requestEvent.method() === "POST" &&
        requestEvent.url().includes("/api/v1/progress/lessons/lesson-1/quiz")
      ) {
        idempotencyKey = requestEvent.headers()["idempotency-key"];
      }
    });

    await page.goto(`/app/aprender/aula/${LESSON_SLUG}`);
    await expect(page.getByRole("heading", { name: "O que é dinheiro?" })).toBeVisible();
    await expect(page.getByText("Vídeo em preparação")).toBeVisible();

    // Vídeo já registrado como assistido no servidor (mock): CONTINUAR liberado.
    const continueButton = page.getByRole("button", { name: /^Continuar/ });
    await expect(continueButton).toBeEnabled();
    await continueButton.click();
    await expect(page).toHaveURL(new RegExp(`/app/aprender/quiz/${LESSON_SLUG}`));

    for (let index = 0; index < 3; index += 1) {
      await page.getByRole("group").getByRole("button").first().click();
      const label = index < 2 ? /Confirmar resposta/ : /Enviar respostas/;
      await page.getByRole("button", { name: label }).click();
    }

    await expect(page.getByRole("heading", { name: "Você entendeu." })).toBeVisible();
    await expect(page.getByText("Aula concluída")).toBeVisible();
    await expect(page.getByRole("link", { name: /Próxima aula: Por que o dinheiro tem valor/ })).toBeVisible();
    expect(idempotencyKey).toBeTruthy();
  });

  test("com 0 fichas a aula concluída fica em revisão e o quiz não abre nova tentativa", async ({
    page,
    request,
  }) => {
    const credentials = await createVerifiedUser(request, "aprender-sem-fichas");
    await loginThroughUi(page, credentials);

    await mockLessonApi(
      page,
      statusResponse({
        completed: true,
        bestQuizPercent: 100,
        attempts: 2,
        quizPassed: true,
        canStartQuiz: false,
        fichas: 0,
      }),
    );

    await page.goto(`/app/aprender/quiz/${LESSON_SLUG}`);

    await expect(
      page.getByRole("heading", { name: "Revisão liberada; nova tentativa bloqueada." }),
    ).toBeVisible();
    await expect(page.getByText(/O saldo atual é/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Rever a aula" })).toBeVisible();
    await expect(page.getByRole("group")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Enviar respostas/ })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Confirmar resposta/ })).toHaveCount(0);
  });
});

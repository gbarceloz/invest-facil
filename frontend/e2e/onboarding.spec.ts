import { expect, test } from "@playwright/test";

test.describe("Jornada B — onboarding conversacional", () => {
  test("calcula o perfil, cria a conta e revela o dashboard personalizado", async ({ page }) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const email = `onboarding-ui-${unique}@example.com`;
    const password = "Teste@123";

    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto("/");

    await page.getByRole("link", { name: /Começar agora/i }).click();
    await expect(page).toHaveURL(/\/comecar$/);

    await page.getByLabel("Seu nome").fill("Marina Teste");
    await page.getByRole("button", { name: /^Continuar/ }).click();

    await page.getByRole("button", { name: /Começar a investir/ }).click();
    await page.getByRole("button", { name: /^Continuar/ }).click();

    await page.getByRole("button", { name: /Consigo guardar um pouco/ }).click();
    await page.getByRole("button", { name: /^Continuar/ }).click();

    await page.getByLabel("Renda mensal").fill("5000");
    await page.getByLabel("Quanto sobra para guardar").fill("800");
    await page.getByLabel("Despesas essenciais").fill("3000");
    await page.getByRole("button", { name: /^Continuar/ }).click();

    await page.getByRole("button", { name: "De 1 a 3 meses", exact: true }).click();
    await page.getByRole("button", { name: "Não tenho dívidas caras", exact: true }).click();
    await page.getByRole("button", { name: /^Continuar/ }).click();

    await page.getByRole("button", { name: "Um pouco de cada", exact: true }).click();
    await page.getByRole("button", { name: "Sei o básico", exact: true }).click();
    await page.getByRole("button", { name: /^Continuar/ }).click();

    await page.getByRole("button", { name: "Seg", exact: true }).click();
    await page.getByRole("button", { name: "Qua", exact: true }).click();
    await page.getByRole("button", { name: /Calcular meu perfil/ }).click();

    await expect(page.getByRole("heading", { name: "Seu perfil está pronto" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/Seu próximo passo:/)).toBeVisible();
    const resultScore = await page
      .getByRole("img", { name: /Índice de saúde financeira/ })
      .getAttribute("aria-label");
    expect(resultScore).toBeTruthy();

    // O vínculo de conta é a etapa 8, obrigatória depois do perfil pronto.
    await expect(page.getByText("Etapa 8 · vínculo obrigatório")).toBeVisible();
    await page.getByRole("button", { name: /Vincular minha conta/ }).click();
    await expect(page.getByText("Etapa 8 de 8")).toBeVisible();
    await expect(page.getByText(/Para guardar seu plano, entre com o Google ou e-mail/)).toBeVisible();

    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(password);
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /Criar conta e ver meu resultado/ }).click();

    await expect(page).toHaveURL(/\/app(\?|$)/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: /Olá, Marina/ })).toBeVisible();
    await expect(page.getByText(/Seu plano está pronto/)).toBeVisible();
    await expect(page.getByRole("link", { name: /Começar a estudar/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Saúde financeira" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sua trilha" })).toBeVisible();

    // O score do dashboard vem do perfil persistido e precisa ser o mesmo do cálculo.
    const dashboardScore = await page
      .getByRole("img", { name: /Índice de saúde financeira/ })
      .getAttribute("aria-label");
    expect(dashboardScore).toBe(resultScore);

    // O perfil fica no servidor: ao voltar ao onboarding, o banner aparece.
    await page.goto("/comecar");
    await expect(page.getByText(/Você já tem um perfil calculado/)).toBeVisible();

    // Logout e login novamente: o dashboard continua personalizado.
    await page.goto("/app");
    await page.getByRole("button", { name: /^Sair$/ }).first().click();
    await page.goto("/entrar");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(password);
    await page.getByRole("button", { name: /^Entrar/ }).click();
    await expect(page).toHaveURL(/\/app(\?|$)/);
    await expect(page.getByRole("heading", { name: "Saúde financeira" })).toBeVisible();
  });
});

import { expect, test } from "@playwright/test";
import { createVerifiedUser, loginThroughUi } from "./helpers";

test.describe("Jornada B — aprendizagem, conclusão e quiz", () => {
  test("abre catálogo, conclui aula, responde quiz e vê XP", async ({ page, request }) => {
    const credentials = await createVerifiedUser(request, "aprender-ui");
    await loginThroughUi(page, credentials);

    await page.getByRole("link", { name: "Mercado financeiro", exact: true }).first().click();
    await expect(page.getByRole("heading", { name: "Mercado financeiro" })).toBeVisible();

    await page.getByRole("link", { name: /Começar/ }).first().click();
    await expect(page).toHaveURL(/\/app\/aprender\/modulo\//);

    await page.getByRole("link", { name: /Por que educação financeira importa/ }).click();
    await expect(page).toHaveURL(/\/app\/aprender\/aula\/por-que-educacao-financeira/);
    await expect(page.getByRole("heading", { name: /Por que educação financeira importa/ })).toBeVisible();

    await page.getByRole("button", { name: /Marcar como concluída/ }).click();
    await expect(page).toHaveURL(/\/app\/aprender\/quiz\/por-que-educacao-financeira/);

    await page.getByRole("button", { name: /Tomar decisões conscientes sobre dinheiro e risco/ }).click();
    await page.getByRole("button", { name: /Confirmar resposta/ }).click();

    await page.getByRole("button", { name: /Gastar menos do que ganha/ }).click();
    await page.getByRole("button", { name: /Enviar respostas/ }).click();

    await expect(page.getByRole("heading", { name: "Você entendeu." })).toBeVisible();
    await expect(page.getByText("+30 XP")).toBeVisible();

    await page.goto("/app/progresso");
    await expect(page.getByRole("heading", { name: "Seu progresso", exact: true })).toBeVisible();
    await expect(page.getByText(/120 XP/).first()).toBeVisible();
    await expect(page.getByText("1/").first()).toBeVisible();
  });
});

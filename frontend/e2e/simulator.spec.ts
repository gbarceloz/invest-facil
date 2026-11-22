import { expect, test } from "@playwright/test";
import { createVerifiedUser, loginThroughUi } from "./helpers";

test.describe("Jornada C — simulador", () => {
  test("calcula, salva e recupera um cenário após recarregar", async ({ page, request }) => {
    const credentials = await createVerifiedUser(request, "simulador-ui");
    await loginThroughUi(page, credentials);

    await page.getByRole("link", { name: "Simulador", exact: true }).first().click();
    await expect(page.getByRole("heading", { name: "Simulador financeiro" })).toBeVisible();

    await page.getByRole("button", { name: /Calcular cenários/ }).click();
    await expect(page.getByText("Patrimônio final")).toBeVisible();
    await expect(page.getByText("Comparação de cenários")).toBeVisible();

    await page.getByRole("button", { name: /Salvar cenário/ }).click();
    await expect(page.getByText(/Simulação salva/)).toBeVisible();

    await page.reload();
    await expect(page.getByText("Cenários salvos")).toBeVisible();
    await expect(page.getByText("Meu plano de longo prazo")).toBeVisible();
  });
});

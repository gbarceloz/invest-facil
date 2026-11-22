import { expect, test } from "@playwright/test";
import { createVerifiedUser, loginThroughUi } from "./helpers";

test.describe("Jornada D — mercado e Bitcoin", () => {
  test("mostra fallback explícito quando os provedores estão desabilitados", async ({
    page,
    request,
  }) => {
    const credentials = await createVerifiedUser(request, "mercado-ui");
    await loginThroughUi(page, credentials);

    await page.getByRole("link", { name: "Cripto", exact: true }).first().click();
    await expect(page).toHaveURL(/\/app\/bitcoin$/);
    await expect(page.getByText("Mercado indisponível")).toBeVisible();
    await expect(page.getByText("Preço em BRL indisponível")).toBeVisible();

    // A rota legada /app/mercado deve continuar redirecionando para a página
    // de Bitcoin; não existe consumidor de UI para /market/assets na P1.1.
    await page.goto("/app/mercado");
    await expect(page).toHaveURL(/\/app\/bitcoin$/);
  });
});

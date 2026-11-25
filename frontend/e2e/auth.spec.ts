import { expect, test } from "@playwright/test";
import { registerThroughUi, uniqueCredentials } from "./helpers";

test.describe("Jornada A — cadastro aberto, login e logout", () => {
  test("cria conta sem confirmação, entra no dashboard e sai", async ({ page }) => {
    const credentials = uniqueCredentials("cadastro-ui");

    await registerThroughUi(page, credentials);
    await page.getByRole("link", { name: /Entrar na minha conta/ }).click();
    await expect(page).toHaveURL(/\/entrar\?email=/);

    await page.getByLabel("Senha", { exact: true }).fill(credentials.password);
    await page.getByRole("button", { name: /^Entrar/ }).click();

    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByRole("heading", { name: /Olá,/ })).toContainText(credentials.name.split(" ")[0]);

    await page.goto("/app/perfil");
    await expect(page.getByRole("heading", { name: "Perfil", exact: true })).toBeVisible();
    await page.getByRole("button", { name: /^Sair$/ }).first().click();

    await expect(page).toHaveURL(/\/entrar(\?|$)/);
    await expect(page.getByRole("button", { name: /^Entrar/ })).toBeVisible();
  });
});

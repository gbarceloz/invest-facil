import { expect, test } from "@playwright/test";
import { registerThroughUi, uniqueCredentials } from "./helpers";

test.describe("Jornada A — cadastro, verificação, login e logout", () => {
  test("cria conta, confirma e-mail, entra no dashboard e sai", async ({ page }) => {
    const credentials = uniqueCredentials("cadastro-ui");

    const registerResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/v1/auth/register") &&
        response.request().method() === "POST",
    );
    await registerThroughUi(page, credentials);
    const registered = (await (await registerResponse).json()) as {
      devVerificationToken?: string;
    };
    expect(registered.devVerificationToken).toBeTruthy();

    // O build de produção esconde o atalho visual de desenvolvimento, mas o
    // backend de E2E expõe o token (EXPOSE_DEV_TOKENS=true) e a página real de
    // verificação é exercitada pelo navegador.
    await page.goto(
      `/verificar-email?token=${encodeURIComponent(registered.devVerificationToken!)}`,
    );
    await expect(page).toHaveURL(/\/verificar-email\?token=/);
    await expect(page.getByText(/confirmad/i).first()).toBeVisible();
    await page.getByRole("link", { name: /Ir para o login/ }).click();
    await expect(page).toHaveURL(/\/entrar$/);

    await page.getByLabel("E-mail").fill(credentials.email);
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

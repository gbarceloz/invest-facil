import { expect, test } from "@playwright/test";
import { createVerifiedUser, loginThroughUi } from "./helpers";

test.describe("Jornada A — login, dashboard e logout", () => {
  test("entra com conta criada pela API, acessa o painel e sai", async ({ page, request }) => {
    const credentials = await createVerifiedUser(request, "login-ui");

    await loginThroughUi(page, credentials);

    await page.goto("/app/perfil");
    await expect(page.getByRole("heading", { name: "Perfil", exact: true })).toBeVisible();
    await page.getByRole("button", { name: /^Sair$/ }).first().click();

    await expect(page).toHaveURL(/\/(entrar)?(\?|$)/);
    await expect(page.getByRole("button", { name: /^Entrar/ })).toBeVisible();
  });
});

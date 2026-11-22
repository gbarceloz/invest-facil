import { expect, test } from "@playwright/test";
import { createVerifiedUser, loginThroughUi } from "./helpers";

test.describe("Jornada E — perfil", () => {
  test("atualiza o nome, persiste após reload e mantém a sessão", async ({ page, request }) => {
    const credentials = await createVerifiedUser(request, "perfil-ui");
    await loginThroughUi(page, credentials);

    await page.getByRole("link", { name: "Perfil", exact: true }).first().click();
    await expect(page.getByRole("heading", { name: "Perfil", exact: true })).toBeVisible();

    const updated = "Nome E2E Atualizado";
    await page.getByLabel("Nome", { exact: true }).fill(updated);
    await page.getByRole("button", { name: /^Salvar$/ }).click();
    await expect(page.getByText("Perfil atualizado.")).toBeVisible();

    await page.reload();
    await expect(page.getByLabel("Nome", { exact: true })).toHaveValue(updated);
    await expect(page.getByRole("heading", { name: "Perfil", exact: true })).toBeVisible();
  });
});

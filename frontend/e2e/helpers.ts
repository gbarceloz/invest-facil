import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const API_URL = process.env.E2E_API_URL ?? "http://127.0.0.1:18081";

export interface TestCredentials {
  name: string;
  email: string;
  password: string;
}

export async function createVerifiedUser(
  request: APIRequestContext,
  prefix: string,
): Promise<TestCredentials> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const credentials: TestCredentials = {
    name: `Usuário ${prefix}`,
    email: `${prefix}-${unique}@example.com`,
    password: "Teste@123",
  };
  const registered = await request.post(`${API_URL}/api/v1/auth/register`, {
    data: { name: credentials.name, email: credentials.email, password: credentials.password },
  });
  expect(registered.status(), await registered.text()).toBe(201);
  // Em dev o backend expõe o token oficial; confirma antes de usar a conta.
  const body = (await registered.json()) as { devVerificationToken?: string | null };
  if (body.devVerificationToken) {
    const verified = await request.post(`${API_URL}/api/v1/auth/verify-email`, {
      data: { token: body.devVerificationToken },
    });
    expect(verified.status(), await verified.text()).toBe(200);
  }
  return credentials;
}

export async function loginThroughUi(page: Page, credentials: TestCredentials) {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill(credentials.email);
  await page.getByLabel("Senha", { exact: true }).fill(credentials.password);
  await page.getByRole("button", { name: /^Entrar/ }).click();
  await expect(page).toHaveURL(/\/app(\?|$)/);
  await expect(page.getByRole("heading", { name: /Olá,/ })).toBeVisible();
}

export function uniqueCredentials(prefix: string): TestCredentials {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    name: `Usuário ${prefix}`,
    email: `${prefix}-${unique}@example.com`,
    password: "Teste@123",
  };
}

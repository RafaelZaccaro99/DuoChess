import type { Page } from "@playwright/test";

/** Senha fixa: só precisa satisfazer o mínimo de 8 caracteres do formulário. */
export const SENHA_E2E = "senhaSuperSegura123";

/** E-mail descartável, único por execução — cada spec cria a própria conta. */
export function emailDescartavel(prefixo: string): string {
  return `e2e-${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@exemplo.test`;
}

/** Cria uma conta nova e devolve o e-mail usado, já autenticado. */
export async function registrarConta(page: Page, prefixo: string, nome = "Conta de teste"): Promise<string> {
  const email = emailDescartavel(prefixo);
  await page.goto("/entrar");
  await page.getByText("Não tenho conta ainda").click();
  await page.fill('input[name="displayName"]', nome);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', SENHA_E2E);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/mapa", { timeout: 15_000 });
  return email;
}

/** Passa pelas 6 perguntas do onboarding com a primeira opção sempre, e escolhe a porta de entrada. */
export async function completarOnboarding(page: Page, porta: "Começar do zero" | "Teste rápido" = "Começar do zero"): Promise<void> {
  await page.goto("/onboarding");
  for (let i = 0; i < 6; i++) {
    await page.locator("ul li button").first().click();
  }
  await page.getByText(porta, { exact: true }).click();
}

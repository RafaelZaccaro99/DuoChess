import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { registrarConta, completarOnboarding } from "./helpers";

/**
 * "Auditoria WCAG 2.2 AA sem violação" (docs/09) — automatizada e repetível,
 * não um relatório único. Varre as rotas públicas e as autenticadas mais
 * usadas do ciclo pedagógico.
 */
const TAGS = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];

async function semViolacoes(page: import("@playwright/test").Page, rota: string): Promise<void> {
  await page.goto(rota);
  const resultado = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  expect(resultado.violations, `${rota}:\n${JSON.stringify(resultado.violations, null, 2)}`).toEqual([]);
}

test.describe("rotas públicas", () => {
  for (const rota of ["/", "/entrar"]) {
    test(rota, async ({ page }) => {
      await semViolacoes(page, rota);
    });
  }
});

test.describe("rotas autenticadas", () => {
  test.beforeEach(async ({ page }) => {
    await registrarConta(page, "a11y");
  });

  for (const rota of ["/onboarding", "/onboarding/importar", "/mapa", "/perfil", "/jogar", "/sessao", "/revisao"]) {
    test(rota, async ({ page }) => {
      if (rota !== "/onboarding") await completarOnboarding(page);
      await semViolacoes(page, rota);
    });
  }

  test("/licao/[lessonId]", async ({ page }) => {
    await completarOnboarding(page);
    await semViolacoes(page, "/licao/r1.l1");
  });
});

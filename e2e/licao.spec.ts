import { test, expect } from "@playwright/test";
import { registrarConta, completarOnboarding } from "./helpers";

/**
 * Jornada 2 do critério de aceite do A8: lição.
 *
 * r1.l1 (Recruta, "O tabuleiro, as coordenadas e as cores") tem 4 exercícios,
 * todos de alternativa — escolhido de propósito para não depender de
 * interação com o tabuleiro (mover peça, marcar casas), que é jornada própria
 * já coberta pelos testes de integração da engine.
 */
test("uma lição real, do início ao resumo da sessão", async ({ page }) => {
  await registrarConta(page, "licao");
  await completarOnboarding(page);

  await page.goto("/licao/r1.l1");
  await expect(page.getByText("O tabuleiro, as coordenadas e as cores")).toBeVisible();

  await page.getByText("Praticar", { exact: true }).click();

  for (let i = 0; i < 4; i++) {
    await page.locator("main ul li button").first().click();
    await page.locator("main .btn-primary").click();
  }

  await expect(page.getByText("Sessão concluída")).toBeVisible({ timeout: 15_000 });
});

import { test, expect } from "@playwright/test";
import { registrarConta } from "./helpers";

/**
 * Jornada 4 do critério de aceite do A8: análise de partida.
 *
 * PGN curto com um erro cabal e inequívoco (a dama captura um peão duas
 * vezes defendido e é recapturada) — garante um momento crítico real sem
 * depender de heurística de detecção sensível a variação pequena de avaliação.
 */
const PGN_COM_ERRO_GRAVE = `[Event "Teste E2E"]
[Result "*"]

1. e4 Nc6 2. Qh5 g6 3. Qxg6 hxg6 *`;

test("importar PGN, cumprir a etapa humana antes da engine, e concluir a análise", async ({ page }) => {
  await registrarConta(page, "analise");

  await page.goto("/jogar");
  await page.locator(".card", { hasText: "Importar PGN" }).locator("textarea").fill(PGN_COM_ERRO_GRAVE);
  await page.getByText("Eu joguei de brancas").click();
  await page.getByText("Importar", { exact: true }).click();

  await page.waitForURL("**/analise/**", { timeout: 15_000 });

  // Etapa humana — ADR-007: a engine não pode aparecer antes disto. A análise
  // roda a engine de verdade sobre cada lance da partida antes de chegar
  // aqui — pode demorar bem mais que uma navegação comum.
  await expect(page.getByText("Antes de ver a engine")).toBeVisible({ timeout: 60_000 });
  await page.getByText("Igual", { exact: true }).click();
  await page.getByText("Registrar e ver a engine").click();

  await expect(page.getByText("A engine encontrou")).toBeVisible({ timeout: 15_000 });

  const proximo = page.getByText("Próximo momento");
  while (await proximo.isVisible().catch(() => false)) {
    await proximo.click();
    await page.getByText("Igual", { exact: true }).click();
    await page.getByText("Registrar e ver a engine").click();
    await expect(page.getByText("A engine encontrou")).toBeVisible({ timeout: 15_000 });
  }

  await page.getByText("Concluir análise").click();
  await expect(page.getByText("Análise concluída")).toBeVisible({ timeout: 15_000 });
});

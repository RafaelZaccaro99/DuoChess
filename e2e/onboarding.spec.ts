import { test, expect } from "@playwright/test";
import { registrarConta, completarOnboarding } from "./helpers";

/**
 * Jornada 1 do critério de aceite do A8 (docs/09): onboarding.
 * Cadastro → seis perguntas → porta de entrada → chega ao mapa com a trilha.
 */
test("cadastro e onboarding levam ao mapa", async ({ page }) => {
  await registrarConta(page, "onboarding");
  await completarOnboarding(page, "Começar do zero");

  await page.waitForURL("**/mapa", { timeout: 15_000 });
  await expect(page.locator("main")).toBeVisible();
});

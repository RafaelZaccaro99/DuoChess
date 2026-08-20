import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { registrarConta, completarOnboarding } from "./helpers";

/**
 * Jornada 3 do critério de aceite do A8: revisão.
 *
 * A fila só existe quando algo venceu. A rota mais real de chegar lá é fazer
 * uma lição de verdade (que agenda cartões de revisão via FSRS) e depois
 * empurrar o vencimento para o passado direto no banco — não há como
 * "esperar" um cartão vencer de outro jeito num teste.
 */
test("uma lição gera cartão de revisão, e a fila resolve quando ele vence", async ({ page }) => {
  const email = await registrarConta(page, "revisao");
  await completarOnboarding(page);

  await page.goto("/licao/r1.l1");
  await page.getByText("Praticar", { exact: true }).click();
  for (let i = 0; i < 4; i++) {
    await page.locator("main ul li button").first().click();
    await page.locator("main .btn-primary").click();
  }
  await expect(page.getByText("Sessão concluída")).toBeVisible({ timeout: 15_000 });

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const atualizados = await prisma.reviewSchedule.updateMany({
      where: { userId: user.id, scope: "SKILL" },
      data: { dueAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    expect(atualizados.count, "a lição precisa ter agendado ao menos um cartão de revisão").toBeGreaterThan(0);
  } finally {
    await prisma.$disconnect();
  }

  await page.goto("/revisao");
  await expect(page.getByText("Revisão de hoje")).toBeVisible();

  for (let i = 0; i < 10; i++) {
    if (await page.getByText("Revisão em dia").isVisible().catch(() => false)) break;
    // .click() com timeout espera o elemento ficar clicável de verdade — uma
    // checagem de isVisible() isolada pega a transição entre itens no meio
    // do caminho e derruba o laço cedo demais.
    try {
      await page.locator("main ul li button").first().click({ timeout: 5_000 });
    } catch {
      break;
    }
    await page.locator("main .btn-primary").click({ timeout: 5_000 });
  }

  await expect(page.getByText("Revisão em dia")).toBeVisible({ timeout: 15_000 });
});

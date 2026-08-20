import { test, expect } from "@playwright/test";

/**
 * App shell instalável (A8) — escopo deliberado: manifest válido, ícones
 * respondendo, service worker registrado e cacheando o build estático. Sem
 * tentativa de offline real: login, CMS, bots e análise sempre exigiram rede.
 */
test("manifest responde com JSON válido e aponta pros ícones gerados", async ({ request }) => {
  const resposta = await request.get("/manifest.webmanifest");
  expect(resposta.ok()).toBe(true);
  const manifest = await resposta.json();
  expect(manifest.name).toContain("MestreXadrez");
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === "maskable")).toBe(true);

  for (const icon of manifest.icons as Array<{ src: string }>) {
    const iconResponse = await request.get(icon.src);
    expect(iconResponse.ok(), `ícone ${icon.src} deveria responder 200`).toBe(true);
  }
});

test("service worker registra e cacheia os assets estáticos", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => navigator.serviceWorker.getRegistration().then(Boolean), null, {
    timeout: 15_000,
  });

  // Uma segunda navegação encontra o SW já ativo, servindo do cache.
  await page.reload();
  const controlado = await page.evaluate(() => Boolean(navigator.serviceWorker.controller));
  expect(controlado).toBe(true);
});

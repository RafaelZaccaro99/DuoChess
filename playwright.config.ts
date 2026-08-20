import { defineConfig, devices } from "@playwright/test";

/**
 * E2E das quatro jornadas do critério de aceite do A8 (docs/09):
 * onboarding → lição → revisão → análise. Mais uma varredura de
 * acessibilidade (axe, WCAG 2.2 AA) embutida em `e2e/acessibilidade.spec.ts`.
 *
 * `workers: 1` pela mesma razão do `fileParallelism: false` de
 * vitest.config.ts: os specs compartilham o mesmo Postgres de desenvolvimento,
 * cada um cria sua própria conta descartável mas todos leem o mesmo conteúdo
 * semeado — rodar em paralelo cria corrida em cima do mesmo banco.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  // A engine roda de verdade em e2e/analise.spec.ts — depth 12 por lance,
  // várias vezes. Timeout curto faria esse spec falhar por lentidão, não por
  // defeito real.
  timeout: 90_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // O ambiente traz um Chromium pré-instalado fora do cache padrão do
        // Playwright (ver PLAYWRIGHT_BROWSERS_PATH) — sem isto o runner tenta
        // baixar um binário que a rede sandboxed não deixa buscar.
        launchOptions: { executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" },
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});

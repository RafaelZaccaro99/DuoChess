import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // `server-only` existe para o bundler do Next recusar o módulo no cliente.
      // Em teste de Node não há cliente, então ele vira um no-op.
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Testes de integração compartilham um banco: rodar em paralelo cria corrida.
    fileParallelism: false,
    testTimeout: 20_000,
  },
});

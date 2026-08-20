/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  // O Stockfish resolve seu próprio binário via `import.meta.url` em tempo de
  // execução (`src/lib/engine/uci.ts`). Empacotado pelo bundler do servidor,
  // esse caminho deixa de apontar para node_modules e o spawn falha em
  // silêncio — a chamada trava até o timeout de handshake, sem erro claro.
  // Externo, o pacote continua sendo `require()`ado normalmente.
  serverExternalPackages: ["stockfish"],
};

export default nextConfig;

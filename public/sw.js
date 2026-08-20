/**
 * Service worker do app shell instalável (A8).
 *
 * Escopo deliberado: só os assets estáticos do build (`/_next/static/*`,
 * imutáveis por hash de conteúdo) — cache-first, então revisitas carregam o
 * esqueleto do app na hora. Navegação, dados de sessão, CMS, bots e análise
 * NUNCA passam por cache — dependem de Postgres/Stockfish, e servir uma
 * versão velha seria pior que exigir rede.
 *
 * CACHE_NAME é versionado à mão porque este SW não é gerado pelo build (não
 * há Workbox/next-pwa maduro para App Router hoje) — sem acesso ao build id
 * do Next em tempo de escrita. Mudou o app shell? Muda o sufixo aqui.
 */
const CACHE_NAME = "mestrexadrez-shell-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isAssetEstatico = url.origin === self.location.origin && url.pathname.startsWith("/_next/static/");
  if (!isAssetEstatico) return; // deixa passar reto — nunca intercepta navegação nem dados

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      if (response.ok) cache.put(event.request, response.clone());
      return response;
    }),
  );
});

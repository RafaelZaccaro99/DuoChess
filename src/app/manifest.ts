import type { MetadataRoute } from "next";

/**
 * Rota nativa do Next 15 — serve em `/manifest.webmanifest` e injeta o
 * `<link rel="manifest">` sozinho, sem precisar declarar nada em
 * `metadata` no layout.
 *
 * Escopo deliberado: app shell instalável. Login, CMS, bots, análise e
 * importar PGN continuam exigindo rede — não há tentativa de simular
 * funcionalidade que só existe com Postgres/Stockfish no ar.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MestreXadrez — do primeiro lance ao xadrez competitivo",
    short_name: "MestreXadrez",
    description:
      "Plataforma de formação enxadrística: aprenda a pensar como um enxadrista, treine como um atleta e evolua por um caminho verificável.",
    start_url: "/",
    display: "standalone",
    background_color: "#0F1216",
    theme_color: "#0F1216",
    lang: "pt-BR",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

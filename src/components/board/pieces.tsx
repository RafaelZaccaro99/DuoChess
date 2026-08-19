/**
 * Peças em SVG, desenhadas para o produto.
 *
 * Silhuetas de torneio (padrão Staunton), sem imitar nenhum conjunto de terceiros.
 * Cada peça tem contorno de contraste para continuar legível sobre as duas cores
 * de casa e no modo de alto contraste.
 */

import type { Color, PieceSymbol } from "chess.js";

const PATHS: Record<PieceSymbol, string> = {
  p: "M22 8c-3.3 0-6 2.7-6 6 0 1.9.9 3.6 2.3 4.7C15.7 20 14 22.6 14 25.5c0 2.1.9 4 2.3 5.3-3.3 1.8-5.3 4-5.3 6.7h22c0-2.7-2-4.9-5.3-6.7 1.4-1.3 2.3-3.2 2.3-5.3 0-2.9-1.7-5.5-4.3-6.8C27.1 17.6 28 15.9 28 14c0-3.3-2.7-6-6-6z",
  n: "M13 38h18c0-4-1-8-3-11 3-3 4-7 3-11-1-4-4-7-8-8l-1 3-4-2-3 4 2 2-5 5c-2 2-3 5-3 8l4-2 2 3-2 3c0 3 1 5 0 6z",
  b: "M22 6c-1.7 0-3 1.3-3 3 0 1 .5 1.9 1.2 2.4C17.2 13.6 15 17.4 15 21c0 2.8 1.3 5.2 3.3 6.7-1.4.8-2.3 1.9-2.3 3.3h12c0-1.4-.9-2.5-2.3-3.3 2-1.5 3.3-3.9 3.3-6.7 0-3.6-2.2-7.4-5.2-9.6.7-.5 1.2-1.4 1.2-2.4 0-1.7-1.3-3-3-3zM12 33h20c1.7 0 3 1.1 3 2.5S33.7 38 32 38H12c-1.7 0-3-1.1-3-2.5S10.3 33 12 33z",
  r: "M11 38h22v-4H11v4zM13 32h18l-1.5-14H31V9h-4v4h-3V9h-4v4h-3V9h-4v9h1.5L13 32z",
  q: "M22 7a2.6 2.6 0 100 5.2A2.6 2.6 0 0022 7zM8 13a2.4 2.4 0 100 4.8A2.4 2.4 0 008 13zm28 0a2.4 2.4 0 100 4.8A2.4 2.4 0 0036 13zM14.5 30l-4-12 5 4 3-8 3.5 9 3.5-9 3 8 5-4-4 12h-15zM12 32h20c1.4 0 2.5.9 2.5 2s-1.1 2-2.5 2H12c-1.4 0-2.5-.9-2.5-2s1.1-2 2.5-2zm0 5h20c1.4 0 2.5.4 2.5 1s-1.1 1-2.5 1H12c-1.4 0-2.5-.4-2.5-1s1.1-1 2.5-1z",
  k: "M22 5v5m-2.5-2.5h5M22 12c-4 0-7 3-7 6.5 0 2.5 1.5 4.5 3.5 6L14 32h16l-4.5-7.5c2-1.5 3.5-3.5 3.5-6C29 15 26 12 22 12zM12 33h20c1.4 0 2.5.9 2.5 2s-1.1 2-2.5 2H12c-1.4 0-2.5-.9-2.5-2s1.1-2 2.5-2z",
};

export function Piece({ type, color }: { type: PieceSymbol; color: Color }) {
  const white = color === "w";
  return (
    <svg
      viewBox="0 0 44 44"
      className="pointer-events-none h-full w-full drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={PATHS[type]}
        fill={white ? "#F5EFE3" : "#22282F"}
        stroke={white ? "#22282F" : "#F5EFE3"}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </svg>
  );
}

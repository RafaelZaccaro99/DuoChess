/**
 * Utilidades de tabuleiro, determinísticas (ADR-001).
 * Nenhuma decisão de legalidade acontece fora de chess.js.
 */

import { Chess, type Square, type Color, type PieceSymbol } from "chess.js";

export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
export const RANKS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

export type File = (typeof FILES)[number];
export type Rank = (typeof RANKS)[number];

export const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export interface BoardSquare {
  square: Square;
  piece: { type: PieceSymbol; color: Color } | null;
  /** true = casa clara. */
  light: boolean;
}

export function allSquares(): Square[] {
  const out: Square[] = [];
  for (const r of [...RANKS].reverse()) {
    for (const f of FILES) out.push(`${f}${r}` as Square);
  }
  return out;
}

/** a1 é escura. (file + rank) par → escura. */
export function isLightSquare(square: string): boolean {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]) - 1;
  return (file + rank) % 2 === 1;
}

export function readBoard(fen: string): BoardSquare[] {
  const chess = new Chess(fen);
  const board = chess.board();
  const out: BoardSquare[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = board[row]?.[col] ?? null;
      const square = `${FILES[col]}${8 - row}` as Square;
      out.push({
        square,
        piece: cell ? { type: cell.type, color: cell.color } : null,
        light: isLightSquare(square),
      });
    }
  }
  return out;
}

export function isValidFen(fen: string): { ok: true } | { ok: false; reason: string } {
  try {
    const chess = new Chess();
    chess.load(fen);
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : "FEN inválido" };
  }
}

/** Lances legais a partir de uma casa. Fonte única de verdade sobre legalidade. */
export function legalMovesFrom(fen: string, from: Square): Square[] {
  const chess = new Chess(fen);
  return chess.moves({ square: from, verbose: true }).map((m) => m.to as Square);
}

/**
 * Casas ATACADAS por uma peça — diferente de lances legais.
 * Um peão em e4 ataca d5 e f5 mesmo com as casas vazias, e não "ataca" e5
 * embora possa mover para lá. Cravadas não removem o ataque.
 */
export function attackedSquaresFrom(fen: string, from: Square): Square[] {
  const chess = new Chess(fen);
  const piece = chess.get(from);
  if (!piece) return [];

  return allSquares().filter((target) => {
    if (target === from) return false;
    return chess.isAttacked(target, piece.color) && attacksSquare(fen, from, target);
  });
}

/** Geometria pura do ataque de uma peça sobre uma casa, ignorando xeque próprio. */
function attacksSquare(fen: string, from: Square, target: Square): boolean {
  const chess = new Chess(fen);
  const piece = chess.get(from);
  if (!piece) return false;

  const df = target.charCodeAt(0) - from.charCodeAt(0);
  const dr = Number(target[1]) - Number(from[1]);
  const adf = Math.abs(df);
  const adr = Math.abs(dr);

  switch (piece.type) {
    case "p": {
      const dir = piece.color === "w" ? 1 : -1;
      return adf === 1 && dr === dir;
    }
    case "n":
      return (adf === 1 && adr === 2) || (adf === 2 && adr === 1);
    case "k":
      return adf <= 1 && adr <= 1;
    case "b":
      return adf === adr && adf > 0 && pathIsClear(chess, from, target);
    case "r":
      return (adf === 0 || adr === 0) && adf + adr > 0 && pathIsClear(chess, from, target);
    case "q":
      return (
        (adf === adr || adf === 0 || adr === 0) && adf + adr > 0 && pathIsClear(chess, from, target)
      );
    default:
      return false;
  }
}

function pathIsClear(chess: Chess, from: Square, to: Square): boolean {
  const stepF = Math.sign(to.charCodeAt(0) - from.charCodeAt(0));
  const stepR = Math.sign(Number(to[1]) - Number(from[1]));

  let file = from.charCodeAt(0) + stepF;
  let rank = Number(from[1]) + stepR;

  while (`${String.fromCharCode(file)}${rank}` !== to) {
    if (file < 97 || file > 104 || rank < 1 || rank > 8) return false;
    if (chess.get(`${String.fromCharCode(file)}${rank}` as Square)) return false;
    file += stepF;
    rank += stepR;
  }
  return true;
}

export interface PositionFacts {
  sideToMove: Color;
  inCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isInsufficientMaterial: boolean;
  legalMoveCount: number;
}

export function positionFacts(fen: string): PositionFacts {
  const chess = new Chess(fen);
  return {
    sideToMove: chess.turn(),
    inCheck: chess.isCheck(),
    isCheckmate: chess.isCheckmate(),
    isStalemate: chess.isStalemate(),
    isDraw: chess.isDraw(),
    isInsufficientMaterial: chess.isInsufficientMaterial(),
    legalMoveCount: chess.moves().length,
  };
}

export const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export const PIECE_NAMES_PT: Record<PieceSymbol, string> = {
  p: "peão",
  n: "cavalo",
  b: "bispo",
  r: "torre",
  q: "dama",
  k: "rei",
};

/** Notação algébrica em português: R D T B C (rei, dama, torre, bispo, cavalo). */
export const PIECE_LETTER_PT: Record<PieceSymbol, string> = {
  p: "",
  n: "C",
  b: "B",
  r: "T",
  q: "D",
  k: "R",
};

const SAN_EN_TO_PT: Record<string, string> = { K: "R", Q: "D", R: "T", B: "B", N: "C" };
const SAN_PT_TO_EN: Record<string, string> = { R: "K", D: "Q", T: "R", B: "B", C: "N" };

/**
 * chess.js fala SAN em inglês. A interface fala português. Traduzir só na borda.
 *
 * Duas posições carregam inicial de peça: o primeiro caractere (Cf3) e o sufixo
 * de promoção (e8=D). Traduzir só a primeira quebra a promoção silenciosamente.
 */
function translateSan(san: string, table: Record<string, string>): string {
  let out = san;
  const first = out[0];
  if (first && table[first]) out = table[first] + out.slice(1);
  return out.replace(/=([A-Z])/, (match, letter: string) => `=${table[letter] ?? letter}`);
}

export function sanToPt(san: string): string {
  return translateSan(san, SAN_EN_TO_PT);
}

export function sanFromPt(san: string): string {
  return translateSan(san, SAN_PT_TO_EN);
}

/** Rótulo acessível de uma casa, lido por leitor de tela (ADR-008). */
export function squareLabel(square: BoardSquare): string {
  if (!square.piece) {
    return `${square.square}, vazia, casa ${square.light ? "clara" : "escura"}`;
  }
  const color = square.piece.color === "w" ? "branco" : "preto";
  const name = PIECE_NAMES_PT[square.piece.type];
  const article = name === "dama" || name === "torre" ? "a" : "o";
  return `${square.square}, ${name} ${color === "branco" && article === "a" ? "branca" : color === "preto" && article === "a" ? "preta" : color}`;
}

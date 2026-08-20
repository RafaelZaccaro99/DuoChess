/**
 * Import de PGN.
 *
 * Toda legalidade passa por chess.js (ADR-001): um PGN com lance ilegal embutido
 * é rejeitado pelo próprio carregador, não aceito de boa-fé. Isto cobre partidas
 * importadas do mesmo jeito que a verificação de conteúdo cobre exercícios.
 *
 * Uma colagem por vez neste corte — import em lote fica para depois.
 */

import { Chess } from "chess.js";

export interface ParsedGameMove {
  ply: number;
  san: string;
  fenAfter: string;
}

export interface ParsedGame {
  moves: ParsedGameMove[];
  result: string | null;
  finalFen: string;
  headers: Record<string, string>;
}

export type ParsePgnResult =
  | { ok: true; game: ParsedGame }
  | { ok: false; error: string };

export function parsePgn(raw: string): ParsePgnResult {
  const chess = new Chess();
  try {
    chess.loadPgn(raw.trim());
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "PGN inválido." };
  }

  const historico = chess.history({ verbose: true });
  if (historico.length === 0) {
    return { ok: false, error: "Nenhum lance encontrado no PGN." };
  }

  const moves: ParsedGameMove[] = historico.map((m, i) => ({
    ply: i + 1,
    san: m.san,
    fenAfter: m.after,
  }));

  const headers = chess.getHeaders();
  const result = headers.Result && headers.Result !== "*" ? headers.Result : null;

  return {
    ok: true,
    game: { moves, result, finalFen: chess.fen(), headers },
  };
}

/** Conta quantas partidas o texto colado contém — só para o registro de `ImportedPGN`. */
export function countGamesInPgn(raw: string): number {
  const matches = raw.match(/^\s*\[Event\s/gm);
  return matches ? matches.length : raw.trim().length > 0 ? 1 : 0;
}

/**
 * Detecção de momentos críticos.
 *
 * Um momento é crítico pela POSIÇÃO, não pelo lance jogado: quando a distância
 * entre a melhor linha e a segunda melhor é grande, a escolha importa — é um
 * ponto em que acertar ou errar faz diferença. Definir criticidade pelo swing
 * do lance realmente jogado tornaria impossível detectar transferência: um
 * momento só entraria quando o jogador já tivesse errado, e
 * `detectTransfers` (que exige `playedSan === bestSan`) nunca teria o que
 * contar. Aqui a posição decide o que é crítico; o lance jogado só decide se
 * o jogador acertou.
 */

import { Chess } from "chess.js";
import type { EngineLine } from "../chess/verification";
import { scoreOf } from "../chess/verification";

/** Converte um lance UCI (e2e4, e7e8q) em SAN, na posição dada. */
function uciToSan(fen: string, uci: string): string {
  const chess = new Chess(fen);
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci.length > 4 ? uci.slice(4, 5) : undefined;
  try {
    const move = chess.move({ from, to, promotion });
    return move.san;
  } catch {
    return uci;
  }
}

export interface MoveWithEval {
  ply: number;
  /** SAN do lance realmente jogado. */
  san: string;
  fenBefore: string;
  fenAfter: string;
  /** Melhor linha da engine na posição ANTES do lance. */
  bestLine: EngineLine;
  /** Segunda melhor linha — mede o quanto a posição discrimina entre opções. */
  secondLine: EngineLine;
  /**
   * Avaliação (mesma escala de `scoreOf`) do lance realmente jogado, já
   * resolvida mesmo quando ele não aparece entre as linhas de topo.
   */
  playedScore: number;
}

export interface CriticalMomentCandidate {
  ply: number;
  fen: string;
  playedSan: string;
  bestSan: string;
  cpBefore: number;
  cpAfter: number;
}

export interface DetectCriticalMomentsConfig {
  /** Centipawns mínimos — de criticidade da posição OU de perda do lance jogado. */
  minCpSwing?: number;
  maxMoments?: number;
}

const DEFAULTS: Required<DetectCriticalMomentsConfig> = {
  minCpSwing: 100,
  maxMoments: 5,
};

export function detectCriticalMoments(
  moves: readonly MoveWithEval[],
  config?: DetectCriticalMomentsConfig,
): CriticalMomentCandidate[] {
  const { minCpSwing, maxMoments } = { ...DEFAULTS, ...config };

  const candidatas: Array<CriticalMomentCandidate & { relevancia: number }> = [];

  for (const m of moves) {
    const criticidade = scoreOf(m.bestLine) - scoreOf(m.secondLine);
    const perdaDoLance = scoreOf(m.bestLine) - m.playedScore;
    const relevancia = Math.max(criticidade, perdaDoLance);
    if (relevancia <= minCpSwing) continue;

    candidatas.push({
      ply: m.ply,
      fen: m.fenBefore,
      playedSan: m.san,
      bestSan: uciToSan(m.fenBefore, m.bestLine.moveUci),
      cpBefore: scoreOf(m.bestLine),
      cpAfter: m.playedScore,
      relevancia,
    });
  }

  return candidatas
    .sort((a, b) => b.relevancia - a.relevancia)
    .slice(0, maxMoments)
    .sort((a, b) => a.ply - b.ply)
    .map(({ relevancia: _relevancia, ...rest }) => rest);
}

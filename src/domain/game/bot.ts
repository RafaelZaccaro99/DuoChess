/**
 * Bot calibrado por rating.
 *
 * Critério de aceite do A5: "o bot de 800 comete erro plausível de 800, não
 * lance aleatório." Por isso a escolha nunca sai de fora das linhas que a
 * engine realmente devolveu — a legalidade vem estruturalmente do fato de que
 * `lines` já veio de `engine.analyse()` (ADR-001, ADR-006). O que varia por
 * rating é SÓ quanto pior que a melhor linha o bot aceita jogar, e com que
 * frequência.
 */

import type { EngineLine } from "../chess/verification";
import { scoreOf } from "../chess/verification";

export const BOT_RATING_PRESETS = [400, 800, 1200, 1600, 2000] as const;
export type BotRating = (typeof BOT_RATING_PRESETS)[number];

export interface BotErrorProfile {
  /** Probabilidade de NÃO jogar a melhor linha. */
  errorProbability: number;
  /** Teto de centipawns perdidos em relação à melhor linha. */
  maxLossCp: number;
}

/**
 * Perfis nos presets, interpolados linearmente para ratings intermediários.
 * Ratings baixos erram mais vezes e erram mais grosseiramente; ratings altos
 * quase só cometem imprecisão fina.
 */
const PROFILE_TABLE: Record<BotRating, BotErrorProfile> = {
  400: { errorProbability: 0.55, maxLossCp: 600 },
  800: { errorProbability: 0.4, maxLossCp: 350 },
  1200: { errorProbability: 0.25, maxLossCp: 180 },
  1600: { errorProbability: 0.12, maxLossCp: 90 },
  2000: { errorProbability: 0.04, maxLossCp: 40 },
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function ratingToProfile(rating: number): BotErrorProfile {
  const presets = BOT_RATING_PRESETS;
  if (rating <= presets[0]) return PROFILE_TABLE[presets[0]];
  if (rating >= presets[presets.length - 1]!) return PROFILE_TABLE[presets[presets.length - 1]!];

  for (let i = 0; i < presets.length - 1; i++) {
    const lo = presets[i]!;
    const hi = presets[i + 1]!;
    if (rating >= lo && rating <= hi) {
      const t = (rating - lo) / (hi - lo);
      const pLo = PROFILE_TABLE[lo];
      const pHi = PROFILE_TABLE[hi];
      return {
        errorProbability: lerp(pLo.errorProbability, pHi.errorProbability, t),
        maxLossCp: lerp(pLo.maxLossCp, pHi.maxLossCp, t),
      };
    }
  }
  return PROFILE_TABLE[800];
}

/** Extrai o rating de "Bot 800"; null para qualquer outro texto. */
export function parseBotRating(opponent: string): number | null {
  const match = /^Bot (\d+)$/.exec(opponent.trim());
  return match ? Number(match[1]) : null;
}

export interface BotMoveChoice {
  moveUci: string;
  /** Centipawns perdidos em relação à melhor linha — prova de que não foi aleatório. */
  cpLoss: number;
  wasBestMove: boolean;
}

/**
 * Escolhe o lance do bot.
 *
 * Com probabilidade `errorProbability`, escolhe — dentre as linhas candidatas
 * cuja perda para a melhor fica dentro de `maxLossCp` — uma linha ponderada
 * para perdas maiores dentro desse teto (erro real, não imprecisão cosmética).
 * Caso contrário, ou se nenhuma candidata dentro do teto existir além da
 * melhor, devolve a melhor linha.
 */
export function chooseBotMove(
  lines: readonly EngineLine[],
  profile: BotErrorProfile,
  rng: () => number = Math.random,
): BotMoveChoice {
  if (lines.length === 0) {
    throw new Error("chooseBotMove: nenhuma linha da engine para escolher.");
  }

  const ordenadas = [...lines].sort((a, b) => scoreOf(b) - scoreOf(a));
  const melhor = ordenadas[0]!;

  const candidatasDeErro = ordenadas
    .slice(1)
    .map((linha) => ({ linha, perda: scoreOf(melhor) - scoreOf(linha) }))
    .filter(({ perda }) => perda > 0 && perda <= profile.maxLossCp);

  const deveErrar = rng() < profile.errorProbability && candidatasDeErro.length > 0;

  if (!deveErrar) {
    return { moveUci: melhor.moveUci, cpLoss: 0, wasBestMove: true };
  }

  // Ponderação linear pela magnitude da perda: dentro do teto, erros maiores
  // são mais prováveis que imprecisões mínimas — um "erro plausível" pesa mais
  // que arredondamento.
  const pesoTotal = candidatasDeErro.reduce((soma, c) => soma + c.perda, 0);
  let alvo = rng() * pesoTotal;
  let escolhida = candidatasDeErro[0]!;
  for (const candidata of candidatasDeErro) {
    alvo -= candidata.perda;
    if (alvo <= 0) {
      escolhida = candidata;
      break;
    }
  }

  return { moveUci: escolhida.linha.moveUci, cpLoss: escolhida.perda, wasBestMove: false };
}

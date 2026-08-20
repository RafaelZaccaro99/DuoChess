/**
 * Confiabilidade do nível estimado.
 *
 * "Não estimamos nível avançado só com múltipla escolha" — mas o diagnóstico
 * do bloco A6 não é múltipla escolha, é exercício real. Mesmo assim, um
 * exercício de posição isolada continua sem medir cálculo sob relógio nem
 * decisão sob pressão de partida real. Por isso o corte não é "usou o
 * diagnóstico" — é "o nível estimado está alto e não há partidas reais
 * (analisadas) para sustentar essa estimativa". Recalculado ao vivo sempre
 * que chamado, nunca lido de um valor congelado — mesmo padrão do D5 para
 * `ErrorClassification` (docs/02): confiança é uma pergunta que se refaz, não
 * uma resposta que se grava uma vez.
 */

/** scoreBand(420) = "Competidor · 1400–1600" — a mesma linha que o aviso do onboarding já cita. */
export const ADVANCED_SCORE_THRESHOLD = 420;

/** "Dez partidas de 15+10" — o número que o produto já promete em W6. */
export const MIN_GAMES_FOR_ADVANCED_RELIABILITY = 10;

export interface ReliabilityAssessment {
  reliable: boolean;
  reason: string | null;
}

export function assessReliability(
  chessScoreTotal: number,
  gamesAnalyzed: number,
): ReliabilityAssessment {
  const declaraAvancado = chessScoreTotal >= ADVANCED_SCORE_THRESHOLD;
  const semPartidasSuficientes = gamesAnalyzed < MIN_GAMES_FOR_ADVANCED_RELIABILITY;

  if (declaraAvancado && semPartidasSuficientes) {
    return {
      reliable: false,
      reason: `Seu Chess Score estimado indica nível avançado, mas isso ainda não foi confirmado em partida real. Importe pelo menos ${MIN_GAMES_FOR_ADVANCED_RELIABILITY} partidas analisadas para uma estimativa confiável.`,
    };
  }

  return { reliable: true, reason: null };
}

/**
 * Classifica a causa de um erro de partida a partir do momento crítico e do
 * registro humano (ADR-007) — nunca um sistema de causas paralelo: o tipo
 * devolvido é o mesmo `ClassifiedError` que o motor adaptativo já consome.
 *
 * Regra determinística, não geração livre: uma explicação de IA que contrarie
 * o motor de regras é descartada (ADR-001), então aqui não existe IA nenhuma —
 * é uma escada de regras sobre dados verificáveis (cp, tempo, texto do usuário).
 */

import type { ClassifiedError, ErrorCause, ErrorSeverity } from "../errors/taxonomy";
import type { CriticalMomentCandidate } from "./criticalMoments";

export interface HumanMomentReport {
  /** Texto livre — candidatos que o usuário diz ter considerado. */
  candidates: string | null;
  evalChoice: "GANHANDO" | "IGUAL" | "PIOR" | null;
  timeSec: number | null;
  skipped: boolean;
}

/** Confiança fixa quando o usuário pulou — sempre abaixo do limiar do gargalo (0.6). */
export const SKIPPED_CONFIDENCE = 0.3;

function severityFor(swingCp: number): ErrorSeverity {
  if (swingCp > 400) return "DECISIVE";
  if (swingCp >= 150) return "SERIOUS";
  return "MINOR";
}

/** O melhor lance tem cara de tática: captura, xeque ou promoção. */
function looksTactical(bestSan: string): boolean {
  return /[x+#=]/.test(bestSan);
}

function mentionsBestMove(candidates: string, bestSan: string): boolean {
  const alvo = bestSan.replace(/[+#!?]/g, "").toLowerCase();
  const destino = alvo.match(/[a-h][1-8]/g)?.pop();
  const texto = candidates.toLowerCase();
  return texto.includes(alvo) || (destino !== undefined && texto.includes(destino));
}

export function classifyGameError(
  moment: CriticalMomentCandidate,
  human: HumanMomentReport,
  nowIso: string,
): ClassifiedError {
  const swing = moment.cpBefore - moment.cpAfter;
  const severity = severityFor(swing);
  const base = { severity, ply: moment.ply };

  if (human.skipped) {
    const cause: ErrorCause = looksTactical(moment.bestSan) ? "TACTIC" : "EVALUATION";
    return {
      ...base,
      cause,
      confidence: SKIPPED_CONFIDENCE,
      explanation: `Momento pulado na análise humana: sem registro para classificar com confiança. Estimativa a partir do lance (${moment.bestSan}).`,
      at: nowIso,
    };
  }

  if (human.candidates && !mentionsBestMove(human.candidates, moment.bestSan)) {
    return {
      ...base,
      cause: "CANDIDATE_IGNORED",
      confidence: 0.7,
      explanation: `Os candidatos considerados não incluíam ${moment.bestSan}, o lance mais forte da posição.`,
      at: nowIso,
    };
  }

  const avaliacaoPiorou = moment.cpAfter < 0;
  const declarouGanhando = human.evalChoice === "GANHANDO";
  const declarouPior = human.evalChoice === "PIOR";
  if ((declarouGanhando && avaliacaoPiorou) || (declarouPior && !avaliacaoPiorou)) {
    return {
      ...base,
      cause: "EVALUATION",
      confidence: 0.75,
      explanation: "A avaliação declarada da posição não bate com o que a engine encontra depois do lance jogado.",
      at: nowIso,
    };
  }

  if (swing > 300 && looksTactical(moment.bestSan)) {
    return {
      ...base,
      cause: "TACTIC",
      confidence: 0.7,
      explanation: `${moment.bestSan} ganhava material ou dava xeque decisivo, e não foi jogado — perda de ${swing} centipawns.`,
      at: nowIso,
    };
  }

  if (human.timeSec !== null && human.timeSec < 15 && swing > 150) {
    return {
      ...base,
      cause: "CALCULATION_STOPPED",
      confidence: 0.55,
      explanation: "Pouco tempo gasto numa posição que exigia cálculo mais longo para achar o lance certo.",
      at: nowIso,
    };
  }

  return {
    ...base,
    cause: "CALCULATION_STOPPED",
    confidence: 0.5,
    explanation: `O lance jogado (${moment.playedSan}) perdeu ${swing} centipawns em relação a ${moment.bestSan}.`,
    at: nowIso,
  };
}

/**
 * Modelo de domínio por habilidade (0–100).
 *
 * Requisito do spec: "Não aumente domínio indefinidamente com exercícios fáceis.
 * Use decaimento de confiança para priorizar reavaliação."
 *
 * Duas grandezas separadas:
 *  - `value`      quão bem o usuário demonstrou a habilidade;
 *  - `confidence` quão recente/robusta é essa demonstração.
 *
 * O valor EXIBIDO é `effectiveMastery()`, que combina os dois. Um usuário que
 * demonstrou 90 há três meses não tem 90 hoje — tem 90 com confiança baixa,
 * e o motor adaptativo trata isso como candidato a reavaliação.
 */

import {
  type AttemptOutcome,
  type MasteryState,
  type SkillMastery,
  clamp,
  daysBetween,
} from "../types";

export const MASTERY_THRESHOLDS: Array<{ min: number; state: MasteryState }> = [
  { min: 95, state: "MASTERED" },
  { min: 80, state: "CONSOLIDATED" },
  { min: 60, state: "COMPETENT" },
  { min: 35, state: "DEVELOPING" },
  { min: 1, state: "INTRODUCED" },
  { min: 0, state: "UNKNOWN" },
];

/** Peso da fase no ganho de domínio. Guiado vale menos: houve andaime. */
export const PHASE_WEIGHT: Record<AttemptOutcome["phase"], number> = {
  GUIDED: 0.35,
  INDEPENDENT: 1,
  MASTERY_TEST: 1.3,
  REVIEW: 1.1,
};

export function emptyMastery(skillId: string): SkillMastery {
  return {
    skillId,
    value: 0,
    state: "UNKNOWN",
    confidence: 0,
    decayRatePerDay: 0.6,
    attempts: 0,
    correctStreak: 0,
    lastAssessedAt: null,
    appliedInGame: 0,
  };
}

export function stateFor(value: number): MasteryState {
  for (const t of MASTERY_THRESHOLDS) {
    if (value >= t.min) return t.state;
  }
  return "UNKNOWN";
}

/**
 * Teto de ganho por dificuldade do item.
 *
 * Um exercício de dificuldade 1 nunca leva alguém acima de 46, por mais que ele
 * acerte mil vezes. É assim que "exercícios fáceis não inflam domínio" vira código
 * em vez de intenção.
 *
 * `difficulty` é RELATIVA À HABILIDADE, não ao xadrez inteiro: 1–3 é apresentação,
 * 4–6 é aplicação independente e 7–10 é prova de domínio. Um "8" na Liga Recruta e
 * um "8" na Liga Mestre são igualmente difíceis para quem está naquela liga — a
 * âncora absoluta é o campo `ratingHint`, não este.
 *
 * A escala precisa permitir que a prova de domínio da própria habilidade chegue
 * perto de 100. Um teto baixo demais trava o grafo de dependências: a habilidade
 * nunca alcança o mínimo exigido pela seguinte, e a unidade seguinte fica
 * permanentemente inacessível.
 */
export function masteryCeiling(difficulty: number): number {
  const d = clamp(difficulty, 1, 10);
  return Math.round(40 + d * 6); // d=1 → 46 ; d=5 → 70 ; d=8 → 88 ; d=10 → 100
}

/** Fator de dica: usar as três dicas quase zera o crédito da tentativa. */
export function hintFactor(hintsUsed: number): number {
  return [1, 0.6, 0.35, 0.15][clamp(hintsUsed, 0, 3)] ?? 0.15;
}

/**
 * Fator de tempo. Responder muito acima do tempo esperado indica reconstrução
 * lenta, não domínio. Responder rápido demais em item difícil indica chute e
 * também não recebe crédito cheio.
 */
export function timeFactor(elapsedMs: number, expectedSeconds: number): number {
  if (expectedSeconds <= 0) return 1;
  const ratio = elapsedMs / 1000 / expectedSeconds;
  if (ratio < 0.15) return 0.7;
  if (ratio <= 1.5) return 1;
  if (ratio <= 3) return 0.8;
  return 0.6;
}

export function confidenceNow(mastery: SkillMastery, nowIso: string): number {
  if (!mastery.lastAssessedAt) return mastery.confidence;
  const days = Math.max(0, daysBetween(mastery.lastAssessedAt, nowIso));
  const decayed = mastery.confidence - (mastery.decayRatePerDay / 100) * days;
  return clamp(decayed, 0, 1);
}

/**
 * Domínio efetivo: o número que a interface mostra e que o mixer usa.
 * Confiança baixa puxa o valor para baixo, mas nunca abaixo de 60% do bruto —
 * esquecer não é o mesmo que nunca ter aprendido.
 */
export function effectiveMastery(mastery: SkillMastery, nowIso: string): number {
  const c = confidenceNow(mastery, nowIso);
  return Math.round(mastery.value * (0.6 + 0.4 * c));
}

/** Aplica uma tentativa e devolve um NOVO estado de domínio. Função pura. */
export function applyAttempt(
  mastery: SkillMastery,
  outcome: AttemptOutcome,
): SkillMastery {
  const phase = PHASE_WEIGHT[outcome.phase];
  const attempts = mastery.attempts + 1;

  if (!outcome.correct) {
    // Erro custa mais quando o item era fácil para o nível já demonstrado.
    const penalty = clamp(6 + (10 - outcome.difficulty) * 0.8, 4, 14);
    const value = clamp(mastery.value - penalty * phase, 0, 100);
    return {
      ...mastery,
      value,
      state: stateFor(value),
      // Errar não zera a confiança: nós temos uma informação recente e clara.
      confidence: clamp(confidenceNow(mastery, outcome.at) * 0.85 + 0.15, 0, 1),
      attempts,
      correctStreak: 0,
      lastAssessedAt: outcome.at,
    };
  }

  const ceiling = masteryCeiling(outcome.difficulty);
  const gap = Math.max(0, ceiling - mastery.value);

  // Ganho proporcional ao que falta para o teto do item: rendimento decrescente
  // embutido, sem precisar de regra separada anti-farming.
  const raw =
    gap * 0.34 * phase * hintFactor(outcome.hintsUsed) *
    timeFactor(outcome.elapsedMs, outcome.expectedSeconds);

  const streak = mastery.correctStreak + 1;
  const streakBonus = streak >= 3 ? 1.15 : 1;

  const value = clamp(mastery.value + raw * streakBonus, 0, 100);
  const gained = clamp(
    confidenceNow(mastery, outcome.at) + 0.25 * phase * hintFactor(outcome.hintsUsed),
    0,
    1,
  );

  return {
    ...mastery,
    value,
    state: stateFor(value),
    confidence: gained,
    attempts,
    correctStreak: streak,
    lastAssessedAt: outcome.at,
  };
}

/** Registra transferência: habilidade aplicada corretamente em partida real. */
export function registerGameApplication(mastery: SkillMastery, nowIso: string): SkillMastery {
  return {
    ...mastery,
    appliedInGame: mastery.appliedInGame + 1,
    // Aplicar em partida é a evidência mais forte que existe. Restaura confiança.
    confidence: clamp(confidenceNow(mastery, nowIso) + 0.3, 0, 1),
    lastAssessedAt: nowIso,
  };
}

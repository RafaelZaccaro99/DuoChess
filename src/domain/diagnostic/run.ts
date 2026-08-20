/**
 * Aplica uma resposta do diagnóstico ao domínio acumulado localmente.
 *
 * Reaproveita `evaluateExercise` e `applyAttempt` — o mesmo motor de
 * avaliação e de domínio que `recordAttempt` usa — em vez de inventar um
 * algoritmo de colocação novo. Duas diferenças deliberadas:
 *
 *  1. A fase é forçada para MASTERY_TEST (o peso mais alto), porque resposta
 *     de diagnóstico é prova, não prática guiada — mesmo que o item, fora do
 *     diagnóstico, seja autoralmente INDEPENDENT.
 *  2. Não toca XP, cartão de revisão, taxonomia de erro, sequência nem Foco:
 *     nenhum desses subsistemas tem sentido para quem está sendo colocado,
 *     partindo de domínio zero em tudo. Só o domínio acumula, e só localmente
 *     — nada é gravado em `ProgressState` item a item.
 */

import type { AttemptOutcome } from "../types";
import type { SkillMastery } from "../types";
import { evaluateExercise, type EvaluationResult, type UserAnswer } from "../chess/evaluate";
import { applyAttempt, emptyMastery } from "../mastery";
import type { DiagnosticItem } from "./select";

export interface DiagnosticAnswerResult {
  masteries: Record<string, SkillMastery>;
  evaluation: EvaluationResult;
  delta: Array<{ skillId: string; before: number; after: number }>;
}

export function applyDiagnosticAnswer(
  masteries: Record<string, SkillMastery>,
  item: DiagnosticItem,
  answer: UserAnswer,
  hintsUsed: number,
  elapsedMs: number,
  at: string,
): DiagnosticAnswerResult {
  const evaluation = evaluateExercise(item.exercise, answer);

  if (evaluation.contentError) {
    return { masteries, evaluation, delta: [] };
  }

  const outcome: AttemptOutcome = {
    skillIds: item.exercise.skillIds,
    correct: evaluation.correct,
    hintsUsed,
    elapsedMs,
    difficulty: item.exercise.difficulty,
    expectedSeconds: item.exercise.expectedSeconds,
    phase: "MASTERY_TEST",
    at,
  };

  const next = { ...masteries };
  const delta: DiagnosticAnswerResult["delta"] = [];
  for (const skillId of item.exercise.skillIds) {
    const before = next[skillId] ?? emptyMastery(skillId);
    const after = applyAttempt(before, outcome);
    next[skillId] = after;
    delta.push({ skillId, before: Math.round(before.value), after: Math.round(after.value) });
  }

  return { masteries: next, evaluation, delta };
}

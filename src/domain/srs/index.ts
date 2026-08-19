/**
 * Repetição espaçada — FSRS simplificado (ADR-003).
 *
 * Estado por cartão: estabilidade (dias até a retrievability cair ao alvo),
 * dificuldade (1..10) e histórico. Dois escopos: SKILL (conceito) e EXERCISE (item).
 *
 * Requisito do spec: "Resposta correta sem dicas amplia intervalo; erro conceitual
 * aciona microlição." Erro CONCEITUAL reinicia o cartão de habilidade, não só o item.
 */

import { clamp, daysBetween } from "../types";

export type ReviewScope = "SKILL" | "EXERCISE";

/** Nota da revisão, no padrão FSRS. */
export type Grade = 1 | 2 | 3 | 4; // again | hard | good | easy

export interface ReviewCard {
  id: string;
  scope: ReviewScope;
  skillId: string | null;
  exerciseId: string | null;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  lastGrade: Grade | null;
  usedHints: boolean;
  triggeredMicrolesson: boolean;
  lastReviewedAt: string | null;
  dueAt: string;
}

/** Pesos configuráveis. Calibráveis por experimento — nunca hardcoded na chamada. */
export interface FsrsConfig {
  /** Retenção alvo no momento da revisão. */
  requestRetention: number;
  /** Intervalo máximo em dias. */
  maximumInterval: number;
  initialStability: Record<Grade, number>;
  initialDifficulty: number;
  /** Teto de revisões por dia — evita a fila impossível (risco T2). */
  dailyReviewCap: number;
}

export const DEFAULT_FSRS: FsrsConfig = {
  requestRetention: 0.9,
  maximumInterval: 365,
  initialStability: { 1: 0.4, 2: 1.2, 3: 3.2, 4: 8 },
  initialDifficulty: 5,
  dailyReviewCap: 40,
};

const DECAY = -0.5;
const FACTOR = 19 / 81;

/** Probabilidade de recordar após `elapsedDays` com dada estabilidade. */
export function retrievability(stability: number, elapsedDays: number): number {
  if (stability <= 0) return 0;
  return Math.pow(1 + FACTOR * (elapsedDays / stability), DECAY);
}

/** Intervalo em dias para atingir a retenção alvo. */
export function intervalFor(stability: number, config: FsrsConfig): number {
  const i = (stability / FACTOR) * (Math.pow(config.requestRetention, 1 / DECAY) - 1);
  return clamp(Math.round(i), 1, config.maximumInterval);
}

export function newCard(
  id: string,
  scope: ReviewScope,
  ids: { skillId?: string; exerciseId?: string },
  nowIso: string,
  config: FsrsConfig = DEFAULT_FSRS,
): ReviewCard {
  return {
    id,
    scope,
    skillId: ids.skillId ?? null,
    exerciseId: ids.exerciseId ?? null,
    stability: config.initialStability[3],
    difficulty: config.initialDifficulty,
    reps: 0,
    lapses: 0,
    lastGrade: null,
    usedHints: false,
    triggeredMicrolesson: false,
    lastReviewedAt: null,
    dueAt: nowIso,
  };
}

function nextDifficulty(current: number, grade: Grade): number {
  // Média móvel puxando para 5 (mean reversion), como no FSRS.
  const delta = -1.0 * (grade - 3);
  const next = current + delta;
  return clamp(next * 0.9 + 5 * 0.1, 1, 10);
}

function nextStability(card: ReviewCard, grade: Grade, elapsedDays: number): number {
  const r = card.lastReviewedAt ? retrievability(card.stability, elapsedDays) : 1;

  if (grade === 1) {
    // Lapso: estabilidade cai forte, mas não volta ao zero — resta traço de memória.
    return clamp(card.stability * 0.35 * (1 - card.difficulty / 20), 0.2, card.stability);
  }

  const difficultyFactor = 11 - card.difficulty;
  const stabilityFactor = Math.pow(card.stability, -0.15);
  const retrievabilityBonus = Math.exp(1.2 * (1 - r)); // revisar "na hora certa" rende mais
  const gradeFactor = grade === 2 ? 0.6 : grade === 3 ? 1 : 1.4;

  const growth = 1 + difficultyFactor * stabilityFactor * retrievabilityBonus * 0.12 * gradeFactor;
  return clamp(card.stability * growth, 0.2, 36_500);
}

export interface ReviewResult {
  card: ReviewCard;
  intervalDays: number;
  /** True quando o erro foi conceitual: a habilidade inteira volta ao início. */
  microlesson: boolean;
}

/**
 * Aplica uma revisão.
 *
 * `conceptualError` vem da classificação de erro, não da nota: errar por
 * distração e errar por não entender o conceito exigem respostas diferentes.
 */
export function review(
  card: ReviewCard,
  input: {
    grade: Grade;
    usedHints: boolean;
    conceptualError?: boolean;
    at: string;
  },
  config: FsrsConfig = DEFAULT_FSRS,
): ReviewResult {
  const elapsed = card.lastReviewedAt ? Math.max(0, daysBetween(card.lastReviewedAt, input.at)) : 0;

  const difficulty = nextDifficulty(card.difficulty, input.grade);
  let stability = nextStability(card, input.grade, elapsed);

  // Acerto COM dica não é acerto pleno: o intervalo cresce menos.
  if (input.grade >= 3 && input.usedHints) stability *= 0.75;

  const conceptual = Boolean(input.conceptualError) && input.grade === 1;
  if (conceptual) {
    // Erro conceitual: reiniciar. O usuário não esqueceu — ele não entendeu.
    stability = config.initialStability[1];
  }

  const intervalDays = intervalFor(stability, config);
  const dueAt = new Date(new Date(input.at).getTime() + intervalDays * 86_400_000).toISOString();

  return {
    card: {
      ...card,
      stability,
      difficulty,
      reps: card.reps + 1,
      lapses: input.grade === 1 ? card.lapses + 1 : card.lapses,
      lastGrade: input.grade,
      usedHints: input.usedHints,
      triggeredMicrolesson: conceptual,
      lastReviewedAt: input.at,
      dueAt,
    },
    intervalDays,
    microlesson: conceptual,
  };
}

/**
 * Fila do dia: vencidos primeiro, mais esquecidos antes, respeitando o teto.
 * Sem teto, um usuário que sumiu por um mês volta e encontra 300 revisões — e some de novo.
 */
export function dueQueue(
  cards: readonly ReviewCard[],
  nowIso: string,
  config: FsrsConfig = DEFAULT_FSRS,
): ReviewCard[] {
  const now = new Date(nowIso).getTime();
  return cards
    .filter((c) => new Date(c.dueAt).getTime() <= now)
    .map((c) => {
      const elapsed = c.lastReviewedAt ? daysBetween(c.lastReviewedAt, nowIso) : 999;
      return { card: c, r: retrievability(c.stability, elapsed) };
    })
    .sort((a, b) => a.r - b.r)
    .slice(0, config.dailyReviewCap)
    .map((x) => x.card);
}

/** Converte uma tentativa de exercício em nota FSRS. */
export function gradeFromAttempt(input: {
  correct: boolean;
  hintsUsed: number;
  elapsedMs: number;
  expectedSeconds: number;
}): Grade {
  if (!input.correct) return 1;
  const ratio = input.elapsedMs / 1000 / Math.max(1, input.expectedSeconds);
  if (input.hintsUsed > 0 || ratio > 1.6) return 2;
  if (ratio < 0.5) return 4;
  return 3;
}

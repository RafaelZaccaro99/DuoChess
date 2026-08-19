/**
 * Motor de sessão: compõe os módulos de domínio numa única transição de estado.
 *
 * É o único lugar onde domínio, revisão espaçada, taxonomia de erro e gamificação
 * se encontram — e mesmo aqui eles não se misturam: cada um recebe a mesma
 * tentativa e atualiza a sua própria parte do estado. XP não entra no cálculo de
 * domínio nem em qualquer ponto deste arquivo (ADR-004).
 *
 * Continua puro: recebe estado, devolve estado novo.
 */

import type { ExerciseDef } from "@/content/schema";
import { evaluateExercise, type EvaluationResult, type UserAnswer } from "../chess/evaluate";
import { applyAttempt, emptyMastery } from "../mastery";
import {
  DEFAULT_FSRS,
  gradeFromAttempt,
  newCard,
  review,
  type ReviewCard,
} from "../srs";
import { isConceptual, type ClassifiedError } from "../errors/taxonomy";
import {
  EMPTY_STREAK,
  awardXP,
  depleteFocus,
  recoverFocus,
  registerActivity,
  type FocusRecoveryAction,
  type FocusState,
  type Streak,
  type XPEvent,
} from "../gamification";
import type { AttemptOutcome, SkillMastery } from "../types";

export const PROGRESS_VERSION = 1 as const;

export interface AttemptLog {
  exerciseSlug: string;
  correct: boolean;
  hintsUsed: number;
  elapsedMs: number;
  at: string;
}

export interface ProgressState {
  version: typeof PROGRESS_VERSION;
  createdAt: string;
  updatedAt: string;
  onboarding: OnboardingAnswers | null;
  entryPoint: EntryPoint | null;
  masteries: Record<string, SkillMastery>;
  reviewCards: Record<string, ReviewCard>;
  errors: ClassifiedError[];
  xpEvents: XPEvent[];
  attempts: AttemptLog[];
  streak: Streak;
  focus: FocusState;
  /** Erros seguidos na sessão atual — alimenta o custo de Foco. */
  consecutiveErrors: number;
}

export type EntryPoint = "FROM_ZERO" | "QUICK" | "FULL" | "PGN_IMPORT";

export interface OnboardingAnswers {
  experience: string;
  tournaments: string;
  onlineRating: string;
  goal: string;
  weeklyMinutes: number;
  rankings: boolean;
}

export function emptyProgress(nowIso: string): ProgressState {
  return {
    version: PROGRESS_VERSION,
    createdAt: nowIso,
    updatedAt: nowIso,
    onboarding: null,
    entryPoint: null,
    masteries: {},
    reviewCards: {},
    errors: [],
    xpEvents: [],
    attempts: [],
    streak: EMPTY_STREAK,
    focus: { value: 100, lastUpdatedAt: nowIso },
    consecutiveErrors: 0,
  };
}

export interface AttemptInput {
  exercise: ExerciseDef;
  answer: UserAnswer;
  hintsUsed: number;
  elapsedMs: number;
  at: string;
}

export interface AttemptEffects {
  evaluation: EvaluationResult;
  /** Domínio antes → depois, por habilidade. A interface mostra os dois. */
  masteryDelta: Array<{ skillId: string; before: number; after: number }>;
  xpAwarded: number;
  /** Quando o erro foi conceitual e uma microlição foi disparada. */
  microlesson: boolean;
  nextReviewDays: number | null;
}

export interface AttemptResult {
  state: ProgressState;
  effects: AttemptEffects;
}

/**
 * Registra uma tentativa e propaga os efeitos por todos os subsistemas.
 *
 * Quando o avaliador detecta que o CONTEÚDO está errado (gabarito divergente do
 * motor), nada é gravado: seria injusto penalizar o usuário por um erro nosso.
 */
export function recordAttempt(state: ProgressState, input: AttemptInput): AttemptResult {
  const { exercise, at } = input;
  const evaluation = evaluateExercise(exercise, input.answer);

  if (evaluation.contentError) {
    return {
      state,
      effects: {
        evaluation,
        masteryDelta: [],
        xpAwarded: 0,
        microlesson: false,
        nextReviewDays: null,
      },
    };
  }

  const outcome: AttemptOutcome = {
    skillIds: exercise.skillIds,
    correct: evaluation.correct,
    hintsUsed: input.hintsUsed,
    elapsedMs: input.elapsedMs,
    difficulty: exercise.difficulty,
    expectedSeconds: exercise.expectedSeconds,
    phase: exercise.phase,
    at,
  };

  // ── Competência
  const masteries = { ...state.masteries };
  const masteryDelta: AttemptEffects["masteryDelta"] = [];
  for (const skillId of exercise.skillIds) {
    const before = masteries[skillId] ?? emptyMastery(skillId);
    const after = applyAttempt(before, outcome);
    masteries[skillId] = after;
    // Os dois arredondados: `value` é float, e mostrar "25,750647999999998"
    // na tela de feedback expõe o interno do modelo sem informar nada.
    masteryDelta.push({
      skillId,
      before: Math.round(before.value),
      after: Math.round(after.value),
    });
  }

  // ── Revisão espaçada: cartão do item e cartão do conceito
  const conceptual = !evaluation.correct && evaluation.cause !== null && isConceptual(evaluation.cause);
  const grade = gradeFromAttempt({
    correct: evaluation.correct,
    hintsUsed: input.hintsUsed,
    elapsedMs: input.elapsedMs,
    expectedSeconds: exercise.expectedSeconds,
  });

  const reviewCards = { ...state.reviewCards };
  let microlesson = false;
  let nextReviewDays: number | null = null;

  const cardIds = [
    { id: `ex:${exercise.slug}`, scope: "EXERCISE" as const, ids: { exerciseId: exercise.slug } },
    ...exercise.skillIds.map((skillId) => ({
      id: `sk:${skillId}`,
      scope: "SKILL" as const,
      ids: { skillId },
    })),
  ];

  for (const spec of cardIds) {
    const existing = reviewCards[spec.id] ?? newCard(spec.id, spec.scope, spec.ids, at, DEFAULT_FSRS);
    const result = review(existing, {
      grade,
      usedHints: input.hintsUsed > 0,
      conceptualError: conceptual,
      at,
    });
    reviewCards[spec.id] = result.card;
    if (result.microlesson) microlesson = true;
    if (spec.scope === "EXERCISE") nextReviewDays = result.intervalDays;
  }

  // ── Classificação do erro
  const errors = [...state.errors];
  if (!evaluation.correct && evaluation.cause) {
    errors.push({
      cause: evaluation.cause,
      severity: exercise.phase === "MASTERY_TEST" ? "SERIOUS" : "MINOR",
      confidence: evaluation.causeConfidence,
      explanation: evaluation.specificFeedback ?? exercise.explanation.reason,
      skillId: exercise.skillIds[0],
      at,
    });
  }

  // ── Atividade (nunca competência)
  const xpEvent = awardXP(
    { difficulty: exercise.difficulty, correct: evaluation.correct, source: "LESSON", at },
    state.xpEvents,
  );

  const consecutiveErrors = evaluation.correct ? 0 : state.consecutiveErrors + 1;
  const focus = evaluation.correct
    ? state.focus
    : depleteFocus(state.focus, { consecutiveErrors, at });

  return {
    state: {
      ...state,
      updatedAt: at,
      masteries,
      reviewCards,
      errors,
      xpEvents: [...state.xpEvents, xpEvent],
      attempts: [
        ...state.attempts,
        {
          exerciseSlug: exercise.slug,
          correct: evaluation.correct,
          hintsUsed: input.hintsUsed,
          elapsedMs: input.elapsedMs,
          at,
        },
      ],
      streak: registerActivity(state.streak, at),
      focus,
      consecutiveErrors,
    },
    effects: {
      evaluation,
      masteryDelta,
      xpAwarded: xpEvent.amount,
      microlesson,
      nextReviewDays,
    },
  };
}

export function applyFocusRecovery(
  state: ProgressState,
  action: FocusRecoveryAction,
  at: string,
): ProgressState {
  return { ...state, focus: recoverFocus(state.focus, action, at), updatedAt: at };
}

export function totalXP(state: ProgressState): number {
  return state.xpEvents.reduce((acc, e) => acc + e.amount, 0);
}

export function masteryList(state: ProgressState): SkillMastery[] {
  return Object.values(state.masteries);
}

export function masteryMap(state: ProgressState): Map<string, SkillMastery> {
  return new Map(Object.entries(state.masteries));
}

export function reviewCardList(state: ProgressState): ReviewCard[] {
  return Object.values(state.reviewCards);
}

/**
 * Estado inicial derivado do onboarding.
 *
 * Um usuário que declara experiência não recebe domínio de presente: ele recebe
 * um SEED de baixa confiança, que decai rápido e é substituído pela primeira
 * avaliação real. Declarar não é demonstrar.
 */
export function seedFromOnboarding(
  state: ProgressState,
  answers: OnboardingAnswers,
  entryPoint: EntryPoint,
  seedSkillIds: readonly string[],
  at: string,
): ProgressState {
  const seedValue =
    entryPoint === "FROM_ZERO"
      ? 0
      : answers.experience === "TORNEIO"
        ? 45
        : answers.experience === "CLUBE"
          ? 35
          : answers.experience === "CASUAL"
            ? 20
            : 0;

  const masteries = { ...state.masteries };
  if (seedValue > 0) {
    for (const skillId of seedSkillIds) {
      masteries[skillId] = {
        ...emptyMastery(skillId),
        value: seedValue,
        state: "INTRODUCED",
        confidence: 0.2,
        decayRatePerDay: 3, // seed declarado decai rápido: some em ~1 semana
        lastAssessedAt: at,
      };
    }
  }

  return { ...state, onboarding: answers, entryPoint, masteries, updatedAt: at };
}

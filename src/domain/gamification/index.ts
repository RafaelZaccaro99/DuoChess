/**
 * Gamificação: XP, sequência e Foco.
 *
 * ADR-004 — ESTE MÓDULO NÃO PODE IMPORTAR `../mastery` NEM `../score`.
 * O teste `tests/architecture.test.ts` falha o build se essa importação aparecer.
 * XP mede atividade. Domínio mede competência. Nunca se tocam.
 */

import { clamp, daysBetween } from "../types";

// ───────────────────────────────────────────────────────────────── XP

export type XPSource = "LESSON" | "REVIEW" | "GAME" | "QUEST" | "STREAK";

export interface XPEvent {
  amount: number;
  source: XPSource;
  decayApplied: number;
  at: string;
}

export interface XPConfig {
  /** XP base por dificuldade 1..10. */
  basePerDifficulty: number;
  /** Acima deste total de XP na janela, o rendimento decai. */
  softCapPerWindow: number;
  windowHours: number;
  /** Piso do fator de decaimento — farmar nunca chega a zero, mas fica irrelevante. */
  minDecay: number;
}

export const DEFAULT_XP: XPConfig = {
  basePerDifficulty: 4,
  softCapPerWindow: 300,
  windowHours: 24,
  minDecay: 0.1,
};

/**
 * XP de um exercício. Exercícios fáceis geram menos XP — requisito do spec.
 * O fator de decaimento pune repetição de conteúdo fácil dentro da janela.
 */
export function awardXP(
  input: { difficulty: number; correct: boolean; source: XPSource; at: string },
  history: readonly XPEvent[],
  config: XPConfig = DEFAULT_XP,
): XPEvent {
  const base = input.correct
    ? clamp(input.difficulty, 1, 10) * config.basePerDifficulty
    : Math.ceil(clamp(input.difficulty, 1, 10) * config.basePerDifficulty * 0.25);

  const decayApplied = antiFarmingFactor(history, input.at, config);
  return {
    amount: Math.max(1, Math.round(base * decayApplied)),
    source: input.source,
    decayApplied,
    at: input.at,
  };
}

/** Rendimento decrescente depois do soft cap na janela móvel. */
export function antiFarmingFactor(
  history: readonly XPEvent[],
  nowIso: string,
  config: XPConfig = DEFAULT_XP,
): number {
  const cutoff = new Date(nowIso).getTime() - config.windowHours * 3_600_000;
  const earned = history
    .filter((e) => new Date(e.at).getTime() >= cutoff)
    .reduce((acc, e) => acc + e.amount, 0);

  if (earned <= config.softCapPerWindow) return 1;
  const over = earned - config.softCapPerWindow;
  return clamp(1 / (1 + over / config.softCapPerWindow), config.minDecay, 1);
}

// ─────────────────────────────────────────────────────────── SEQUÊNCIA

export interface Streak {
  current: number;
  longest: number;
  lastActiveDate: string | null;
  freezesLeft: number;
}

export const EMPTY_STREAK: Streak = {
  current: 0,
  longest: 0,
  lastActiveDate: null,
  freezesLeft: 2,
};

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

export function registerActivity(streak: Streak, atIso: string): Streak {
  const today = dayKey(atIso);
  if (streak.lastActiveDate === today) return streak;

  if (!streak.lastActiveDate) {
    return { ...streak, current: 1, longest: Math.max(1, streak.longest), lastActiveDate: today };
  }

  const gapDays = Math.round(daysBetween(`${streak.lastActiveDate}T00:00:00.000Z`, `${today}T00:00:00.000Z`));

  if (gapDays === 1) {
    const current = streak.current + 1;
    return { ...streak, current, longest: Math.max(current, streak.longest), lastActiveDate: today };
  }

  // Proteção limitada: cobre exatamente um dia perdido, e é consumida.
  if (gapDays === 2 && streak.freezesLeft > 0) {
    const current = streak.current + 1;
    return {
      current,
      longest: Math.max(current, streak.longest),
      lastActiveDate: today,
      freezesLeft: streak.freezesLeft - 1,
    };
  }

  return { ...streak, current: 1, lastActiveDate: today };
}

// ─────────────────────────────────────────────────────────────── FOCO

/**
 * Foco é energia PEDAGÓGICA, não uma barra de vidas para vender.
 *
 * Cai com erros e se recupera por revisão, microlição, fundamento, pausa ou
 * reflexão. `recoverFocus` não aceita nenhuma ação de compra — a proibição está
 * no tipo, não num comentário (risco P4 em docs/07).
 */
export type FocusRecoveryAction =
  | "REVIEW_COMPLETED"
  | "MICROLESSON_COMPLETED"
  | "FUNDAMENTAL_REVISITED"
  | "BREAK_TAKEN"
  | "REFLECTION_WRITTEN";

export interface FocusState {
  value: number; // 0..100
  lastUpdatedAt: string;
}

export const FOCUS_RECOVERY: Record<FocusRecoveryAction, number> = {
  REVIEW_COMPLETED: 12,
  MICROLESSON_COMPLETED: 20,
  FUNDAMENTAL_REVISITED: 15,
  BREAK_TAKEN: 25,
  REFLECTION_WRITTEN: 10,
};

export function depleteFocus(
  state: FocusState,
  input: { consecutiveErrors: number; at: string },
): FocusState {
  // Erros seguidos custam progressivamente mais: é o sinal de que a sessão
  // deixou de ensinar e virou tentativa e erro.
  const cost = clamp(6 + input.consecutiveErrors * 4, 6, 30);
  return { value: clamp(state.value - cost, 0, 100), lastUpdatedAt: input.at };
}

export function recoverFocus(
  state: FocusState,
  action: FocusRecoveryAction,
  atIso: string,
): FocusState {
  return { value: clamp(state.value + FOCUS_RECOVERY[action], 0, 100), lastUpdatedAt: atIso };
}

/** Abaixo deste nível, o motor adaptativo para de introduzir conteúdo novo. */
export const FOCUS_LOW_THRESHOLD = 30;

export function shouldPauseNewContent(state: FocusState): boolean {
  return state.value < FOCUS_LOW_THRESHOLD;
}

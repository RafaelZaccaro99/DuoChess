/**
 * Tipos compartilhados do domínio.
 *
 * Regra da camada: nada em `src/domain` faz I/O. Sem fetch, sem window, sem banco.
 * Funções recebem estado e devolvem estado novo. É isso que torna o motor auditável.
 */

/** Eixos de competência do Chess Score. Toda habilidade pertence a exatamente um. */
export const COMPETENCIES = [
  "rules",
  "tactics",
  "calculation",
  "strategy",
  "endgame",
  "opening",
  "analysis",
  "practical",
] as const;

export type Competency = (typeof COMPETENCIES)[number];

export const COMPETENCY_LABELS: Record<Competency, string> = {
  rules: "Regras",
  tactics: "Tática",
  calculation: "Cálculo",
  strategy: "Estratégia",
  endgame: "Finais",
  opening: "Aberturas",
  analysis: "Análise",
  practical: "Desempenho prático",
};

/** Os seis estados de domínio de uma habilidade. */
export const MASTERY_STATES = [
  "UNKNOWN",
  "INTRODUCED",
  "DEVELOPING",
  "COMPETENT",
  "CONSOLIDATED",
  "MASTERED",
] as const;

export type MasteryState = (typeof MASTERY_STATES)[number];

export const MASTERY_STATE_LABELS: Record<MasteryState, string> = {
  UNKNOWN: "Desconhecida",
  INTRODUCED: "Introduzida",
  DEVELOPING: "Em desenvolvimento",
  COMPETENT: "Competente",
  CONSOLIDATED: "Consolidada",
  MASTERED: "Dominada",
};

/** Fase da lição em que uma tentativa aconteceu. Afeta o peso no domínio. */
export type LessonPhase = "GUIDED" | "INDEPENDENT" | "MASTERY_TEST" | "REVIEW";

/** Estado de domínio de uma habilidade para um usuário. */
export interface SkillMastery {
  skillId: string;
  /** 0..100, valor bruto na última avaliação. */
  value: number;
  state: MasteryState;
  /** 0..1. Cai com o tempo desde a última avaliação. */
  confidence: number;
  /** Pontos de confiança perdidos por dia sem reavaliação. */
  decayRatePerDay: number;
  attempts: number;
  correctStreak: number;
  lastAssessedAt: string | null;
  /** Quantas vezes a habilidade foi aplicada corretamente em partida. */
  appliedInGame: number;
}

/** Resultado de uma tentativa, como o domínio precisa ver. */
export interface AttemptOutcome {
  skillIds: string[];
  correct: boolean;
  /** 0..3 */
  hintsUsed: number;
  elapsedMs: number;
  /** 1..10 */
  difficulty: number;
  expectedSeconds: number;
  phase: LessonPhase;
  at: string;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function daysBetween(fromIso: string, toIso: string): number {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return ms / 86_400_000;
}

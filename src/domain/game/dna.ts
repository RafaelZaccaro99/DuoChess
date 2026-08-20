/**
 * DNA do Jogador — agregação mínima.
 *
 * Reaproveita `recurrenceByCause` sem modificação: o que o DNA mostra como
 * causa recorrente e o que o motor adaptativo usa como gargalo nunca podem
 * divergir, porque são a mesma conta.
 */

import type { ClassifiedError, ErrorCause } from "../errors/taxonomy";
import { recurrenceByCause } from "../errors/taxonomy";

export interface PlayerDNA {
  topCauses: Array<{ cause: ErrorCause; count: number }>;
  gamesAnalyzed: number;
  skillsTransferred: number;
}

export interface ComputePlayerDNAInput {
  errors: readonly ClassifiedError[];
  transferredSkillIdsPerGame: readonly (readonly string[])[];
  nowIso: string;
  windowDays?: number;
}

export function computePlayerDNA(input: ComputePlayerDNAInput): PlayerDNA {
  const counts = recurrenceByCause(input.errors, input.nowIso, input.windowDays);
  const topCauses = [...counts.entries()]
    .map(([cause, count]) => ({ cause, count }))
    .sort((a, b) => b.count - a.count);

  const skillsTransferred = new Set(input.transferredSkillIdsPerGame.flat()).size;

  return {
    topCauses,
    gamesAnalyzed: input.transferredSkillIdsPerGame.length,
    skillsTransferred,
  };
}

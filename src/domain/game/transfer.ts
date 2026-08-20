/**
 * Detecta transferência de habilidade: aplicação correta de uma habilidade já
 * dominada, num momento crítico de partida. Materializa as condições (1) e (2)
 * da North Star Metric (ver `src/domain/score/north-star.ts`).
 */

import type { SkillMastery } from "../types";
import { TRANSFER_MASTERY_THRESHOLD } from "../score/north-star";
import type { CriticalMomentCandidate } from "./criticalMoments";

export interface TransferMoment extends CriticalMomentCandidate {
  skillId?: string;
}

export interface DetectTransfersInput {
  moments: readonly TransferMoment[];
  masteries: ReadonlyMap<string, SkillMastery>;
}

export interface DetectTransfersResult {
  skillIds: string[];
}

export function detectTransfers(input: DetectTransfersInput): DetectTransfersResult {
  const skillIds = new Set<string>();

  for (const moment of input.moments) {
    if (!moment.skillId) continue;
    if (moment.playedSan !== moment.bestSan) continue;

    const mastery = input.masteries.get(moment.skillId);
    if (!mastery || mastery.value < TRANSFER_MASTERY_THRESHOLD) continue;

    skillIds.add(moment.skillId);
  }

  return { skillIds: [...skillIds] };
}

/**
 * North Star Metric: decisões dominadas E transferidas para partidas.
 *
 * Três condições, todas obrigatórias:
 *  1. domínio ≥ 80 numa avaliação sem dicas;
 *  2. aplicada corretamente em momento crítico de partida;
 *  3. não regrediu na revisão espaçada seguinte.
 *
 * Se apenas (1) valesse, seria mais uma métrica de exercício resolvido.
 * A condição (2) é o que separa este produto de um banco de puzzles.
 */

import type { SkillMastery } from "../types";
import type { ReviewCard } from "../srs";

export const TRANSFER_MASTERY_THRESHOLD = 80;

export interface TransferInput {
  masteries: readonly SkillMastery[];
  reviewCards: readonly ReviewCard[];
  /** skillIds aplicados corretamente em partida dentro da janela. */
  appliedInGameSkillIds: readonly string[];
}

export interface TransferResult {
  count: number;
  skillIds: string[];
  /** Habilidades dominadas que ainda NÃO foram testadas em partida. */
  pendingTransfer: string[];
}

export interface MultiUserTransferInput {
  masteriesByUser: ReadonlyMap<string, readonly SkillMastery[]>;
  reviewsByUser: ReadonlyMap<string, readonly ReviewCard[]>;
}

export interface MultiUserTransferResult {
  count: number;
  usersCounted: number;
  pairs: Array<{ userId: string; skillId: string }>;
}

/**
 * A North Star do produto inteiro: soma de `countTransferredSkills` por
 * usuário. Pura de propósito — quem chama decide de onde vêm os dados
 * (Postgres real, fixture de teste), esta função só agrega.
 */
export function countTransferredSkillsAcrossUsers(input: MultiUserTransferInput): MultiUserTransferResult {
  const pairs: MultiUserTransferResult["pairs"] = [];
  for (const [userId, masteries] of input.masteriesByUser) {
    const result = countTransferredSkills({
      masteries,
      reviewCards: input.reviewsByUser.get(userId) ?? [],
      appliedInGameSkillIds: [],
    });
    for (const skillId of result.skillIds) pairs.push({ userId, skillId });
  }
  return { count: pairs.length, usersCounted: input.masteriesByUser.size, pairs };
}

export function countTransferredSkills(input: TransferInput): TransferResult {
  const applied = new Set(input.appliedInGameSkillIds);
  const cardBySkill = new Map(
    input.reviewCards.filter((c) => c.scope === "SKILL" && c.skillId).map((c) => [c.skillId!, c]),
  );

  const skillIds: string[] = [];
  const pendingTransfer: string[] = [];

  for (const m of input.masteries) {
    if (m.value < TRANSFER_MASTERY_THRESHOLD) continue;

    // (3) regressão: um lapso na revisão seguinte desqualifica a transferência.
    const card = cardBySkill.get(m.skillId);
    const regressed = card?.lastGrade === 1;
    if (regressed) continue;

    if (applied.has(m.skillId) || m.appliedInGame > 0) skillIds.push(m.skillId);
    else pendingTransfer.push(m.skillId);
  }

  return { count: skillIds.length, skillIds, pendingTransfer };
}

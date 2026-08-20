/**
 * Atribuição de habilidade a um momento crítico de partida.
 *
 * Não existe hoje um casador de padrão posição→habilidade — esta é uma
 * aproximação deliberada (ver plano do bloco A5), não um mapeamento preciso.
 * Para um erro, atribui a habilidade mais fraca do usuário na competência da
 * causa classificada: é a mesma que o motor adaptativo treinaria a seguir,
 * então a classificação e o gargalo nunca divergem. Para um lance certo,
 * credita a habilidade de maior domínio do usuário em táticas (a competência
 * mais comum em momento crítico de partida amadora) que já cruzou o limiar de
 * transferência — nunca inventa transferência sem uma habilidade real e já
 * dominada para apontar.
 */

import type { CurriculumIndex } from "../curriculum";
import { skillStatus } from "../curriculum";
import type { Competency, SkillMastery } from "../types";
import { effectiveMastery } from "../mastery";
import { TRANSFER_MASTERY_THRESHOLD } from "../score/north-star";

export function weakestAvailableSkillIn(
  index: CurriculumIndex,
  masteries: ReadonlyMap<string, SkillMastery>,
  competency: Competency,
  nowIso: string,
): string | null {
  const statuses = skillStatus(index, masteries, nowIso);
  let melhor: { skillId: string; mastery: number } | null = null;

  for (const skill of index.skills.values()) {
    if (skill.competency !== competency) continue;
    if (statuses.get(skill.id)?.availability === "LOCKED") continue;
    const m = masteries.get(skill.id);
    const valor = m ? effectiveMastery(m, nowIso) : 0;
    if (!melhor || valor < melhor.mastery) melhor = { skillId: skill.id, mastery: valor };
  }

  return melhor?.skillId ?? null;
}

export function masteredSkillIn(
  index: CurriculumIndex,
  masteries: ReadonlyMap<string, SkillMastery>,
  competency: Competency,
): string | null {
  let melhor: { skillId: string; value: number } | null = null;

  for (const skill of index.skills.values()) {
    if (skill.competency !== competency) continue;
    const m = masteries.get(skill.id);
    if (!m || m.value < TRANSFER_MASTERY_THRESHOLD) continue;
    if (!melhor || m.value > melhor.value) melhor = { skillId: skill.id, value: m.value };
  }

  return melhor?.skillId ?? null;
}

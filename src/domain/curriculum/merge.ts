/**
 * Mescla exercícios de CMS ao índice de currículo, em tempo de execução (A7).
 *
 * Um item de CMS nunca vira lição — só entra em `exercisesBySkill`, que é
 * exatamente o que a prática dirigida, a sessão e a revisão espaçada leem
 * para sacar itens. É por isso que "publicar sem deploy" funciona: o índice
 * muda a cada requisição, não a cada build.
 */

import type { ExerciseDef } from "@/content/schema";
import type { CurriculumIndex } from "./index";

export function mergeExercises(index: CurriculumIndex, extra: readonly ExerciseDef[]): CurriculumIndex {
  if (extra.length === 0) return index;

  const exercisesBySkill = new Map(index.exercisesBySkill);
  for (const exercise of extra) {
    for (const skillId of exercise.skillIds) {
      exercisesBySkill.set(skillId, [...(exercisesBySkill.get(skillId) ?? []), exercise]);
    }
  }

  return { ...index, exercisesBySkill };
}

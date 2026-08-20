/**
 * Mescla exercícios de CMS ao índice de currículo, em tempo de execução (A7),
 * e tira da rotação quem foi contestado (A8) — estático ou de CMS.
 *
 * Um item de CMS nunca vira lição — só entra em `exercisesBySkill`, que é
 * exatamente o que a prática dirigida, a sessão e a revisão espaçada leem
 * para sacar itens. É por isso que "publicar sem deploy" funciona: o índice
 * muda a cada requisição, não a cada build. A mesma lógica vale ao contrário:
 * um slug contestado precisa sumir de `exercisesBySkill` mesmo vindo do
 * conteúdo estático — não há como remover um item de `src/content/*.ts` sem
 * deploy, então a exclusão acontece aqui, na montagem do índice.
 */

import type { ExerciseDef } from "@/content/schema";
import type { CurriculumIndex } from "./index";

export function mergeExercises(
  index: CurriculumIndex,
  extra: readonly ExerciseDef[],
  excludedSlugs?: ReadonlySet<string>,
): CurriculumIndex {
  if (extra.length === 0 && !excludedSlugs?.size) return index;

  const exercisesBySkill = new Map(index.exercisesBySkill);

  if (excludedSlugs?.size) {
    for (const [skillId, exercises] of exercisesBySkill) {
      const filtrados = exercises.filter((e) => !excludedSlugs.has(e.slug));
      if (filtrados.length !== exercises.length) exercisesBySkill.set(skillId, filtrados);
    }
  }

  for (const exercise of extra) {
    if (excludedSlugs?.has(exercise.slug)) continue;
    for (const skillId of exercise.skillIds) {
      exercisesBySkill.set(skillId, [...(exercisesBySkill.get(skillId) ?? []), exercise]);
    }
  }

  return { ...index, exercisesBySkill };
}

/**
 * Microlição: o que servir depois de um erro conceitual.
 *
 * O spec é específico: diante de reincidência, *interrompa o avanço, explique
 * por outra abordagem, reduza a complexidade, ofereça exemplo guiado, solicite
 * nova aplicação e agende revisão*.
 *
 * Até aqui o produto anunciava isso no feedback e não fazia — o cartão do FSRS
 * era reiniciado (metade da promessa), mas nenhum reensino acontecia. Este
 * módulo é a outra metade.
 *
 * Só erro CONCEITUAL dispara. Errar por distração ou por parar o cálculo cedo
 * demais não é falta de compreensão, e reensinar o conceito nesses casos seria
 * tratar o aluno como se ele não soubesse o que ele sabe.
 */

import type { ExerciseDef } from "@/content/schema";
import type { CurriculumIndex } from "../curriculum";
import { ERROR_TAXONOMY, isConceptual, type ErrorCause } from "../errors/taxonomy";
import type { AttemptLog } from "../session";

export interface Microlicao {
  skillId: string;
  skillTitle: string;
  /** Conceito da lição que ensina a habilidade — a explicação por outra abordagem. */
  conceito: string;
  lessonId: string;
  /** Posição da demonstração da lição, quando existe. */
  demo: { fen: string; caption: string } | null;
  /** O que a taxonomia manda fazer com esta causa. */
  intervencao: string;
  causaLabel: string;
  /** Item mais fácil disponível: complexidade reduzida, como o spec pede. */
  exercicio: ExerciseDef | null;
}

export interface EntradaDaMicrolicao {
  index: CurriculumIndex;
  cause: ErrorCause;
  skillId: string;
  attempts: readonly AttemptLog[];
  /** Item que o aluno acabou de errar — não faz sentido reservi-lo agora. */
  excluirSlug?: string;
}

/**
 * Monta a microlição, ou devolve null quando ela não se aplica.
 *
 * Devolve null em três casos, todos legítimos: a causa não é conceitual, a
 * habilidade não existe no currículo, ou não há lição que a ensine.
 */
export function montarMicrolicao(entrada: EntradaDaMicrolicao): Microlicao | null {
  if (!isConceptual(entrada.cause)) return null;

  const skill = entrada.index.skills.get(entrada.skillId);
  if (!skill) return null;

  const lessonId = entrada.index.lessonsBySkill.get(entrada.skillId)?.[0];
  const lesson = lessonId ? entrada.index.lessons.get(lessonId) : undefined;
  if (!lesson || !lessonId) return null;

  return {
    skillId: skill.id,
    skillTitle: skill.title,
    conceito: lesson.concept,
    lessonId,
    demo: lesson.demo ? { fen: lesson.demo.fen, caption: lesson.demo.caption } : null,
    intervencao: ERROR_TAXONOMY[entrada.cause].intervention,
    causaLabel: ERROR_TAXONOMY[entrada.cause].label,
    exercicio: itemMaisFacil(entrada),
  };
}

/**
 * O item mais fácil da habilidade, para reduzir complexidade.
 *
 * Entre dificuldades iguais, prefere o menos tentado: repetir a posição que o
 * aluno acabou de ver mediria reconhecimento visual, não compreensão.
 */
function itemMaisFacil(entrada: EntradaDaMicrolicao): ExerciseDef | null {
  const tentativas = new Map<string, number>();
  for (const a of entrada.attempts) {
    tentativas.set(a.exerciseSlug, (tentativas.get(a.exerciseSlug) ?? 0) + 1);
  }

  const candidatos = (entrada.index.exercisesBySkill.get(entrada.skillId) ?? []).filter(
    (e) => e.slug !== entrada.excluirSlug,
  );

  const ordenados = [...candidatos].sort((a, b) => {
    if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
    return (tentativas.get(a.slug) ?? 0) - (tentativas.get(b.slug) ?? 0);
  });

  return ordenados[0] ?? null;
}

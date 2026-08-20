/**
 * Gate ENGINE_REVIEW (parte determinística) e SOURCE_REVIEW — a parte que roda
 * sem subir engine.
 *
 * Extraído de `scripts/validate-content.ts`: mesma lógica, agora pura e
 * chamável por item — o CLI ainda percorre o acervo inteiro, mas o CMS (A7)
 * precisa checar UM item novo sem replicar a passada inteira. O estado de
 * duplicidade, que era global ao módulo do script, vira parâmetro explícito
 * (`DuplicateState`) por isso.
 *
 * Puro de propósito: testável sem banco e sem engine.
 */

import { Chess } from "chess.js";
import type { ExerciseDef } from "@/content/schema";
import type { SkillNode } from "../curriculum";
import { evaluateExercise } from "../chess/evaluate";
import { ERROR_CAUSES } from "../errors/taxonomy";
import { SOURCE_IDS, getSource } from "@/content/bibliografia";

export interface ContentProblem {
  where: string;
  message: string;
}

export interface DuplicateState {
  seenFenType: Map<string, string>;
  seenSlugs: Set<string>;
}

export function emptyDuplicateState(): DuplicateState {
  return { seenFenType: new Map(), seenSlugs: new Set() };
}

/**
 * Registra exercícios já existentes no estado de duplicidade, sem gerar
 * problema — usado para "aquecer" o estado com o acervo atual antes de
 * checar UM item novo (o CMS não replica `checkExercise` no acervo inteiro
 * só para descobrir se o item novo colide com algo).
 */
export function primeDuplicateState(dupState: DuplicateState, exercises: readonly ExerciseDef[]): void {
  for (const e of exercises) {
    dupState.seenSlugs.add(e.slug);
    const key = [e.type, e.fen, e.prompt, JSON.stringify(e.acceptedAnswer)].join("::");
    dupState.seenFenType.set(key, e.slug);
  }
}

/**
 * Confere um exercício contra o motor de regras: FEN válido, lado a jogar,
 * habilidades conhecidas, causas da taxonomia, gabarito aprovado pelo próprio
 * avaliador, erro previsível que não é secretamente aceito, e duplicidade.
 */
export function checkExercise(
  exercise: ExerciseDef,
  where: string,
  knownSkills: ReadonlySet<string>,
  dupState: DuplicateState,
): ContentProblem[] {
  const problems: ContentProblem[] = [];

  let chess: Chess;
  try {
    chess = new Chess(exercise.fen);
  } catch (error) {
    problems.push({ where, message: `FEN inválido: ${(error as Error).message}` });
    return problems;
  }

  if (chess.turn() !== exercise.sideToMove) {
    problems.push({
      where,
      message: `sideToMove declarado "${exercise.sideToMove}" mas o FEN diz "${chess.turn()}"`,
    });
  }

  for (const skillId of exercise.skillIds) {
    if (!knownSkills.has(skillId)) {
      problems.push({ where, message: `habilidade inexistente: ${skillId}` });
    }
  }

  for (const pe of exercise.predictableErrors) {
    if (!(ERROR_CAUSES as readonly string[]).includes(pe.cause)) {
      problems.push({ where, message: `causa fora da taxonomia: ${pe.cause}` });
    }
  }

  const answer = exercise.acceptedAnswer;
  const probe =
    "squares" in answer
      ? ({ kind: "squares", squares: answer.squares } as const)
      : "moves" in answer
        ? ({ kind: "move", san: answer.moves[0] } as const)
        : "color" in answer
          ? ({ kind: "choice", choice: answer.color } as const)
          : ({ kind: "choice", choice: answer.choice } as const);

  const result = evaluateExercise(exercise, probe);
  if (result.contentError) {
    problems.push({ where, message: `conteúdo divergente do motor: ${result.contentError}` });
  } else if (!result.correct) {
    problems.push({
      where,
      message: `o próprio gabarito é reprovado pelo avaliador (esperado: ${result.expected})`,
    });
  }

  for (const pe of exercise.predictableErrors) {
    const asAnswer =
      "moves" in answer
        ? ({ kind: "move", san: pe.answer } as const)
        : ({ kind: "choice", choice: pe.answer } as const);
    const peResult = evaluateExercise(exercise, asAnswer);
    if (peResult.correct) {
      problems.push({ where, message: `erro previsível "${pe.answer}" é, na verdade, aceito` });
    }
  }

  if (dupState.seenSlugs.has(exercise.slug)) {
    problems.push({ where, message: `slug duplicado: ${exercise.slug}` });
  }
  dupState.seenSlugs.add(exercise.slug);

  // Duplicata é mesmo tipo, mesma posição, mesma pergunta E mesma resposta —
  // comparar só FEN e tipo erra em itens de cor da casa/orientação/valor de
  // peça, que usam todos a posição inicial porque a posição não é o assunto.
  const key = [exercise.type, exercise.fen, exercise.prompt, JSON.stringify(exercise.acceptedAnswer)].join("::");
  const previous = dupState.seenFenType.get(key);
  if (previous && previous !== exercise.slug) {
    problems.push({
      where,
      message: `mesma posição, mesma pergunta e mesma resposta que ${previous} — duplicata`,
    });
  }
  dupState.seenFenType.set(key, exercise.slug);

  return problems;
}

/** SOURCE_REVIEW para as fontes próprias de UM exercício (item cita algo além do que a habilidade cobre). */
export function checkExerciseSources(exercise: ExerciseDef): ContentProblem[] {
  const desconhecidas = exercise.sources.filter((id) => !SOURCE_IDS.has(id));
  if (desconhecidas.length === 0) return [];
  return [
    {
      where: `exercício ${exercise.slug}`,
      message: `fonte fora do registro: ${desconhecidas.join(", ")}`,
    },
  ];
}

/**
 * SOURCE_REVIEW para a habilidade: a fonte citada existe, cobre a
 * competência, e é adequada ao nível dos itens que a treinam.
 */
export function checkSkillSources(
  skill: SkillNode,
  exercisesOfSkill: readonly ExerciseDef[],
): ContentProblem[] {
  const problems: ContentProblem[] = [];
  const where = `skill ${skill.id}`;

  const desconhecidas = skill.sources.filter((id) => !SOURCE_IDS.has(id));
  if (desconhecidas.length > 0) {
    problems.push({ where, message: `fonte fora do registro: ${desconhecidas.join(", ")}` });
    return problems;
  }

  const fontes = skill.sources.map((id) => getSource(id)!);

  if (!fontes.some((f) => f.competencies.includes(skill.competency))) {
    problems.push({
      where,
      message: `nenhuma fonte cobre a competência "${skill.competency}" (citadas: ${skill.sources.join(", ")})`,
    });
  }

  const ratings = exercisesOfSkill.map((e) => e.ratingHint);
  if (ratings.length === 0) return problems;
  const nivel = Math.min(...ratings);

  if (!fontes.some((f) => nivel >= f.levelMin - 200 && nivel <= f.levelMax)) {
    problems.push({
      where,
      message: `nenhuma fonte é adequada ao nível ~${nivel} (citadas: ${fontes.map((f) => `${f.id} [${f.levelMin}-${f.levelMax}]`).join(", ")})`,
    });
  }

  return problems;
}

export function detectCycles(skills: ReadonlyMap<string, SkillNode>): ContentProblem[] {
  const problems: ContentProblem[] = [];
  const state = new Map<string, "visiting" | "done">();

  const visit = (id: string, path: string[]): void => {
    if (state.get(id) === "done") return;
    if (state.get(id) === "visiting") {
      problems.push({ where: `skill ${id}`, message: `ciclo de dependências: ${[...path, id].join(" → ")}` });
      return;
    }
    state.set(id, "visiting");
    for (const dep of skills.get(id)?.dependsOn ?? []) visit(dep, [...path, id]);
    state.set(id, "done");
  };

  for (const id of skills.keys()) visit(id, []);
  return problems;
}

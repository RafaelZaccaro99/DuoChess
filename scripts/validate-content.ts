/**
 * Validação de conteúdo — roda em CI (`npm run content:validate`).
 *
 * Verifica o que o spec exige antes de publicar: FEN válido, posição legal,
 * gabarito coerente com o motor de regras, lado a jogar correto, ausência de
 * duplicidade e dependências resolvíveis.
 *
 * Wrapper fino: a lógica real mora em src/domain/content/gates.ts, pura e
 * reaproveitada pelo CMS (A7) para checar um item novo sem replicar o acervo
 * inteiro. Este script só percorre o acervo e imprime o resultado.
 */

import { Chess } from "chess.js";
import { COURSE } from "../src/content";
import { buildIndex } from "../src/domain/curriculum";
import {
  checkExercise,
  checkExerciseSources,
  checkSkillSources,
  detectCycles,
  emptyDuplicateState,
  type ContentProblem,
} from "../src/domain/content/gates";

function main(): void {
  const index = buildIndex(COURSE);
  const knownSkills = new Set(index.skills.keys());
  const dupState = emptyDuplicateState();
  const problems: ContentProblem[] = [];

  // ── SOURCE_REVIEW
  for (const skill of index.skills.values()) {
    problems.push(...checkSkillSources(skill, index.exercisesBySkill.get(skill.id) ?? []));
  }
  const todosOsExercicios = [
    ...[...index.lessons.values()].flatMap((l) => l.exercises),
    ...[...index.units.values()].flatMap((u) => u.practice),
  ];
  for (const exercise of todosOsExercicios) {
    problems.push(...checkExerciseSources(exercise));
  }

  // Dependências precisam existir e não podem ser circulares.
  for (const skill of index.skills.values()) {
    for (const dep of skill.dependsOn) {
      if (!knownSkills.has(dep)) {
        problems.push({ where: `skill ${skill.id}`, message: `pré-requisito inexistente: ${dep}` });
      }
    }
  }
  problems.push(...detectCycles(index.skills));

  for (const league of COURSE.leagues) {
    for (const unit of league.units) {
      for (const lesson of unit.lessons) {
        if (lesson.demo) {
          try {
            new Chess(lesson.demo.fen);
          } catch (error) {
            problems.push({
              where: `${league.id}/${unit.id}/${lesson.id}/demo`,
              message: `FEN da demonstração inválido: ${(error as Error).message}`,
            });
          }
        }
        for (const exercise of lesson.exercises) {
          problems.push(
            ...checkExercise(exercise, `${league.id}/${unit.id}/${lesson.id}/${exercise.slug}`, knownSkills, dupState),
          );
        }
      }

      // O banco de prática passa exatamente pelas mesmas checagens. Conteúdo
      // gerado não recebe tratamento mais frouxo que conteúdo escrito à mão.
      for (const exercise of unit.practice) {
        problems.push(
          ...checkExercise(exercise, `${league.id}/${unit.id}/prática/${exercise.slug}`, knownSkills, dupState),
        );
      }
    }
  }

  // Meta desta fase: a repetição espaçada precisa de itens diferentes para
  // reagendar. Com um item por habilidade, o aluno decora a posição.
  const MINIMO_POR_HABILIDADE = 6;
  for (const skill of index.skills.values()) {
    const liga = COURSE.leagues.find((l) => l.id === skill.leagueId);
    if (!liga || liga.units.length === 0) continue; // liga sem conteúdo publicado
    const quantos = index.exercisesBySkill.get(skill.id)?.length ?? 0;
    if (quantos < MINIMO_POR_HABILIDADE) {
      problems.push({
        where: `skill ${skill.id}`,
        message: `só ${quantos} item(ns); a revisão espaçada precisa de ao menos ${MINIMO_POR_HABILIDADE} para não reagendar sempre a mesma posição.`,
      });
    }
  }

  const exerciseCount = dupState.seenSlugs.size;
  if (problems.length === 0) {
    const fontesUsadas = new Set([...index.skills.values()].flatMap((s) => s.sources));
    console.log(
      `Conteúdo validado: ${index.skills.size} habilidades, ${index.lessons.size} lições, ` +
        `${exerciseCount} exercícios, ${fontesUsadas.size} fontes citadas.`,
    );
    console.log("  ENGINE_REVIEW: FEN, legalidade, gabarito e erros previsíveis conferidos.");
    console.log("  SOURCE_REVIEW: toda habilidade ancorada em fonte existente, coerente e de nível adequado.");
    console.log(`  COBERTURA: toda habilidade publicada com ao menos ${MINIMO_POR_HABILIDADE} itens.`);
    return;
  }

  console.error(`${problems.length} problema(s) de conteúdo:\n`);
  for (const p of problems) console.error(`  ✗ ${p.where}\n    ${p.message}`);
  process.exit(1);
}

main();

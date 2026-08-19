/**
 * Validação de conteúdo — roda em CI (`npm run content:validate`).
 *
 * Verifica o que o spec exige antes de publicar: FEN válido, posição legal,
 * gabarito coerente com o motor de regras, lado a jogar correto, ausência de
 * duplicidade e dependências resolvíveis.
 *
 * O ponto central: o motor de regras é a autoridade, não o autor do exercício.
 */

import { Chess } from "chess.js";
import { COURSE } from "../src/content";
import type { ExerciseDef } from "../src/content/schema";
import { evaluateExercise } from "../src/domain/chess/evaluate";
import { buildIndex } from "../src/domain/curriculum";
import { ERROR_CAUSES } from "../src/domain/errors/taxonomy";
import { SOURCE_IDS, getSource } from "../src/content/bibliografia";

interface Problem {
  where: string;
  message: string;
}

const problems: Problem[] = [];
const seenFenType = new Map<string, string>();
const seenSlugs = new Set<string>();

function checkExercise(exercise: ExerciseDef, where: string, knownSkills: Set<string>): void {
  // 1. FEN válido e legal
  let chess: Chess;
  try {
    chess = new Chess(exercise.fen);
  } catch (error) {
    problems.push({ where, message: `FEN inválido: ${(error as Error).message}` });
    return;
  }

  // 2. Lado a jogar declarado bate com o FEN
  if (chess.turn() !== exercise.sideToMove) {
    problems.push({
      where,
      message: `sideToMove declarado "${exercise.sideToMove}" mas o FEN diz "${chess.turn()}"`,
    });
  }

  // 3. Habilidades existem
  for (const skillId of exercise.skillIds) {
    if (!knownSkills.has(skillId)) {
      problems.push({ where, message: `habilidade inexistente: ${skillId}` });
    }
  }

  // 4. Causas dos erros previsíveis pertencem à taxonomia
  for (const pe of exercise.predictableErrors) {
    if (!(ERROR_CAUSES as readonly string[]).includes(pe.cause)) {
      problems.push({ where, message: `causa fora da taxonomia: ${pe.cause}` });
    }
  }

  // 5. Gabarito conferido contra o motor: submete a resposta correta ao avaliador.
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

  // 6. Erros previsíveis não podem coincidir com a resposta correta
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

  // 7. Duplicidade
  if (seenSlugs.has(exercise.slug)) {
    problems.push({ where, message: `slug duplicado: ${exercise.slug}` });
  }
  seenSlugs.add(exercise.slug);

  // Duplicata é mesmo tipo, mesma posição, mesma pergunta E mesma resposta.
  //
  // Comparar só FEN e tipo estava errado: itens de cor da casa, de orientação e
  // de valor das peças usam todos a posição inicial, porque a posição não é o
  // assunto deles — a pergunta é. A regra antiga precisava de uma exceção para
  // SQUARE_COLOR justamente por isso, e a exceção não cobria os outros casos.
  const key = [
    exercise.type,
    exercise.fen,
    exercise.prompt,
    JSON.stringify(exercise.acceptedAnswer),
  ].join("::");
  const previous = seenFenType.get(key);
  if (previous && previous !== exercise.slug) {
    problems.push({
      where,
      message: `mesma posição, mesma pergunta e mesma resposta que ${previous} — duplicata`,
    });
  }
  seenFenType.set(key, exercise.slug);
}

/**
 * Gate SOURCE_REVIEW.
 *
 * Sem revisor humano titulado no fluxo, a bibliografia é o que separa afirmação
 * ancorada de texto plausível. Três checagens:
 *   1. a fonte citada existe no registro;
 *   2. alguma delas cobre a competência da habilidade;
 *   3. alguma delas é adequada ao nível — citar Dvoretsky numa lição de Recruta
 *      é tão errado quanto não citar nada.
 */
function checkSources(index: ReturnType<typeof buildIndex>): void {
  for (const skill of index.skills.values()) {
    const where = `skill ${skill.id}`;

    const desconhecidas = skill.sources.filter((id) => !SOURCE_IDS.has(id));
    if (desconhecidas.length > 0) {
      problems.push({ where, message: `fonte fora do registro: ${desconhecidas.join(", ")}` });
      continue;
    }

    const fontes = skill.sources.map((id) => getSource(id)!);

    if (!fontes.some((f) => f.competencies.includes(skill.competency))) {
      problems.push({
        where,
        message: `nenhuma fonte cobre a competência "${skill.competency}" (citadas: ${skill.sources.join(", ")})`,
      });
    }

    // Nível da habilidade: o menor ratingHint entre os exercícios que a treinam.
    const ratings = (index.exercisesBySkill.get(skill.id) ?? []).map((e) => e.ratingHint);
    if (ratings.length === 0) continue;
    const nivel = Math.min(...ratings);

    if (!fontes.some((f) => nivel >= f.levelMin - 200 && nivel <= f.levelMax)) {
      problems.push({
        where,
        message: `nenhuma fonte é adequada ao nível ~${nivel} (citadas: ${fontes.map((f) => `${f.id} [${f.levelMin}-${f.levelMax}]`).join(", ")})`,
      });
    }
  }

  // Exercícios podem citar fontes próprias; elas também precisam existir.
  const todosOsExercicios = [
    ...[...index.lessons.values()].flatMap((l) => l.exercises),
    ...[...index.units.values()].flatMap((u) => u.practice),
  ];
  for (const exercise of todosOsExercicios) {
    const desconhecidas = exercise.sources.filter((id) => !SOURCE_IDS.has(id));
    if (desconhecidas.length > 0) {
      problems.push({
        where: `exercício ${exercise.slug}`,
        message: `fonte fora do registro: ${desconhecidas.join(", ")}`,
      });
    }
  }
}

function main(): void {
  const index = buildIndex(COURSE);
  const knownSkills = new Set(index.skills.keys());

  checkSources(index);

  // Dependências precisam existir e não podem ser circulares.
  for (const skill of index.skills.values()) {
    for (const dep of skill.dependsOn) {
      if (!knownSkills.has(dep)) {
        problems.push({ where: `skill ${skill.id}`, message: `pré-requisito inexistente: ${dep}` });
      }
    }
  }
  detectCycles(index.skills, problems);

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
          checkExercise(exercise, `${league.id}/${unit.id}/${lesson.id}/${exercise.slug}`, knownSkills);
        }
      }

      // O banco de prática passa exatamente pelas mesmas checagens. Conteúdo
      // gerado não recebe tratamento mais frouxo que conteúdo escrito à mão.
      for (const exercise of unit.practice) {
        checkExercise(exercise, `${league.id}/${unit.id}/prática/${exercise.slug}`, knownSkills);
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

  const exerciseCount = seenSlugs.size;
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

function detectCycles(
  skills: ReturnType<typeof buildIndex>["skills"],
  out: Problem[],
): void {
  const state = new Map<string, "visiting" | "done">();

  const visit = (id: string, path: string[]): void => {
    if (state.get(id) === "done") return;
    if (state.get(id) === "visiting") {
      out.push({ where: `skill ${id}`, message: `ciclo de dependências: ${[...path, id].join(" → ")}` });
      return;
    }
    state.set(id, "visiting");
    for (const dep of skills.get(id)?.dependsOn ?? []) visit(dep, [...path, id]);
    state.set(id, "done");
  };

  for (const id of skills.keys()) visit(id, []);
}

main();

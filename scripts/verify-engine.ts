/**
 * Gate ENGINE_REVIEW sobre o conteúdo publicado.
 *
 * `content:validate` confere o que o motor de regras sabe (legalidade, gabarito
 * coerente). Este script confere o que só a engine sabe: a solução é mesmo a
 * melhor, é única quando o item diz que é, e o erro previsível realmente perde.
 *
 * Roda separado porque é lento. Em CI, entra como passo próprio.
 */

import { Chess, type Square } from "chess.js";
import { COURSE } from "../src/content";
import type { ExerciseDef } from "../src/content/schema";
import { startEngine, type Engine } from "../src/lib/engine/uci";
import {
  blocks,
  checkDifficulty,
  verifyMoveExercise,
  type Finding,
} from "../src/domain/chess/verification";
import { sanFromPt } from "../src/domain/chess/board";

const TIPOS_DE_LANCE = new Set(["BEST_MOVE", "CHECK_ESCAPE", "CAPTURE"]);
const PROFUNDIDADE = Number(process.env.ENGINE_DEPTH ?? 14);
const MULTIPV = 5;

/** SAN do conteúdo (em português) para a notação longa que a engine fala. */
function paraUci(fen: string, san: string): string | null {
  for (const candidato of [san, sanFromPt(san)]) {
    try {
      const chess = new Chess(fen);
      const move = chess.move(candidato.trim());
      if (move) return `${move.from}${move.to}${move.promotion ?? ""}`;
    } catch {
      // ilegal nesta leitura; tenta a outra língua
    }
  }
  return null;
}

/** O enunciado promete mate em N? Detecta pelo SAN da solução e pela posição. */
function mateEmQuanto(exercise: ExerciseDef, uciAceitos: string[]): number | undefined {
  const prometeMate =
    /mate em 1/i.test(exercise.prompt) ||
    ("moves" in exercise.acceptedAnswer && exercise.acceptedAnswer.moves.some((m) => m.includes("#")));
  if (!prometeMate) return undefined;

  const primeiro = uciAceitos[0];
  if (!primeiro) return undefined;

  const chess = new Chess(exercise.fen);
  chess.move({
    from: primeiro.slice(0, 2) as Square,
    to: primeiro.slice(2, 4) as Square,
    promotion: (primeiro[4] as "q" | "r" | "b" | "n" | undefined) ?? undefined,
  });
  return chess.isCheckmate() ? 1 : undefined;
}

/**
 * Lances que respondem à pergunta feita pelo item.
 *
 * Um exercício de CAPTURA pergunta qual captura ganha material. Reprová-lo
 * porque existe um lance quieto mais forte seria julgar uma pergunta que ele não
 * fez. Os demais tipos aceitam qualquer lance legal como candidato.
 */
function candidatosDaPergunta(exercise: ExerciseDef): string[] | undefined {
  if (exercise.type !== "CAPTURE") return undefined;

  const chess = new Chess(exercise.fen);
  return chess
    .moves({ verbose: true })
    .filter((m) => m.captured !== undefined)
    .map((m) => `${m.from}${m.to}${m.promotion ?? ""}`);
}

/** Menor profundidade em que a engine já apontava a solução. */
async function profundidadeDaSolucao(
  engine: Engine,
  fen: string,
  solucao: string,
): Promise<number | null> {
  for (const depth of [1, 2, 4, 6, 8, 12]) {
    const linhas = await engine.analyse(fen, { depth, multiPv: 1 });
    if (linhas[0]?.moveUci === solucao) return depth;
  }
  return null;
}

async function main(): Promise<void> {
  const engine = await startEngine();
  console.log(`Engine: ${engine.name} · profundidade ${PROFUNDIDADE} · multiPV ${MULTIPV}\n`);

  let analisados = 0;
  let bloqueados = 0;
  let avisos = 0;

  for (const league of COURSE.leagues) {
    for (const unit of league.units) {
      // Lição E banco de prática. O gerador já verifica na saída, mas o CI
      // confere de novo: gerador com defeito é possível, e conteúdo gerado não
      // pode ter gate mais frouxo que conteúdo escrito à mão.
      const todos = [...unit.lessons.flatMap((l) => l.exercises), ...unit.practice];

      {
        for (const exercise of todos) {
          if (!TIPOS_DE_LANCE.has(exercise.type)) continue;
          if (!("moves" in exercise.acceptedAnswer)) continue;

          const onde = `${unit.id}/${exercise.slug}`;
          const aceitos = exercise.acceptedAnswer.moves
            .map((san) => paraUci(exercise.fen, san))
            .filter((u): u is string => u !== null);

          if (aceitos.length === 0) {
            console.error(`  ✗ ${onde}\n    nenhum lance aceito é legal nesta posição.`);
            bloqueados += 1;
            continue;
          }

          // Item de execução de regra não se julga por avaliação: a afirmação
          // dele é sobre legalidade, e disso o motor de regras já dá conta.
          if (exercise.verification === "RULE_EXECUTION") {
            console.log(`  – ${onde} (execução de regra: legalidade já conferida, engine não julga)`);
            continue;
          }

          const previsiveis = exercise.predictableErrors
            .map((e) => paraUci(exercise.fen, e.answer))
            .filter((u): u is string => u !== null);

          const linhas = await engine.analyse(exercise.fen, {
            depth: PROFUNDIDADE,
            multiPv: MULTIPV,
          });

          const achados: Finding[] = [
            ...verifyMoveExercise({
              acceptedUci: aceitos,
              predictableUci: previsiveis,
              lines: linhas,
              claimsMateIn: mateEmQuanto(exercise, aceitos),
              candidateUci: candidatosDaPergunta(exercise),
            }),
            ...checkDifficulty({
              declared: exercise.difficulty,
              depthFound: await profundidadeDaSolucao(engine, exercise.fen, aceitos[0]!),
            }),
          ];

          analisados += 1;

          if (achados.length === 0) {
            console.log(`  ✓ ${onde}`);
            continue;
          }

          const bloqueia = blocks(achados);
          if (bloqueia) bloqueados += 1;
          avisos += achados.filter((f) => f.severity === "AVISA").length;

          console.log(`  ${bloqueia ? "✗" : "!"} ${onde}`);
          for (const a of achados) {
            console.log(`      [${a.severity}] ${a.code}: ${a.message}`);
          }
        }
      }
    }
  }

  await engine.quit();

  console.log(
    `\n${analisados} exercícios de lance analisados · ${bloqueados} bloqueados · ${avisos} avisos.`,
  );
  if (bloqueados > 0) {
    console.error("\nENGINE_REVIEW reprovou. Conteúdo bloqueado não publica.");
    process.exit(1);
  }
  console.log("ENGINE_REVIEW aprovou.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

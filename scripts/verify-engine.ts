/**
 * Gate ENGINE_REVIEW sobre o conteúdo publicado.
 *
 * `content:validate` confere o que o motor de regras sabe (legalidade, gabarito
 * coerente). Este script confere o que só a engine sabe: a solução é mesmo a
 * melhor, é única quando o item diz que é, e o erro previsível realmente perde.
 *
 * Roda separado porque é lento. Em CI, entra como passo próprio.
 *
 * Wrapper fino: a lógica real mora em src/lib/content/engine-gate.ts, chamável
 * por item — o CMS (A7) a reaproveita para checar um rascunho novo contra a
 * mesma engine, sem replicar o laço inteiro.
 */

import { COURSE } from "../src/content";
import { startEngine } from "../src/lib/engine/uci";
import { runEngineGate, TIPOS_DE_LANCE } from "../src/lib/content/engine-gate";
import { blocks } from "../src/domain/chess/verification";

const PROFUNDIDADE = Number(process.env.ENGINE_DEPTH ?? 14);
const MULTIPV = 5;

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

      for (const exercise of todos) {
        if (!TIPOS_DE_LANCE.has(exercise.type)) continue;
        if (!("moves" in exercise.acceptedAnswer)) continue;

        const onde = `${unit.id}/${exercise.slug}`;

        if (exercise.verification === "RULE_EXECUTION") {
          console.log(`  – ${onde} (execução de regra: legalidade já conferida, engine não julga)`);
          continue;
        }

        const achados = await runEngineGate(exercise, engine, { depth: PROFUNDIDADE, multiPv: MULTIPV });

        // Gabarito ilegal não conta como "analisado" — não há o que a engine
        // analisar quando nem o lance aceito é legal na posição.
        if (achados.length === 1 && achados[0]!.code === "GABARITO_ILEGAL") {
          console.error(`  ✗ ${onde}\n    ${achados[0]!.message}`);
          bloqueados += 1;
          continue;
        }

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

  await engine.quit();

  console.log(`\n${analisados} exercícios de lance analisados · ${bloqueados} bloqueados · ${avisos} avisos.`);
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

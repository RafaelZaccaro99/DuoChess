/**
 * Auditoria por amostragem (A8, docs/09 §0, item 3).
 *
 * "Um jogador forte revisa ~5% do acervo, procurando erro sistemático em vez
 * de item a item. [...] Não é revisão item a item; é conferir se o método
 * está torto."
 *
 * Sorteia uma amostra do acervo publicado e imprime cada item por completo —
 * FEN, gabarito, as 6 partes da explicação, fontes citadas (próprias e
 * herdadas da habilidade) — pronto para leitura sem abrir banco nem arquivo.
 * `npm run auditoria:amostragem -- [porcentagem]` (default 5).
 *
 * Mesma lógica de sorteio de `/admin/auditoria` (server action
 * `sortearAmostraAction`) — extraída em `src/domain/content/audit-sample.ts`
 * pra não divergir entre o CLI e a ferramenta de rastreamento.
 */

import { COURSE } from "../src/content";
import { buildIndex } from "../src/domain/curriculum";
import { amostrarConteudo } from "../src/domain/content/audit-sample";

const PORCENTAGEM = Number(process.argv[2] ?? process.env.AMOSTRA_PCT ?? 5);

function main(): void {
  const index = buildIndex(COURSE);
  const sorteados = amostrarConteudo(COURSE, index, PORCENTAGEM);

  console.log(
    `Auditoria por amostragem: ${sorteados.length} itens (${PORCENTAGEM}%).\n` +
      `Procure erro SISTEMÁTICO — nome de padrão errado, fonte que não sustenta a afirmação, regra que não generaliza — não erro item a item.\n`,
  );

  for (const [i, item] of sorteados.entries()) {
    console.log(`${"─".repeat(70)}`);
    console.log(`[${i + 1}/${sorteados.length}] ${item.slug}  (${item.where})`);
    console.log(`Habilidade(s): ${item.skills}`);
    console.log(`Tipo: ${item.type} · dificuldade ${item.difficulty}/10 · rating ${item.ratingHint}`);
    console.log(`FEN: ${item.fen}`);
    console.log(`Enunciado: ${item.prompt}`);
    console.log(`Gabarito: ${item.acceptedAnswer}`);
    if (item.predictableErrors.length > 0) {
      console.log(`Erros previsíveis:`);
      for (const pe of item.predictableErrors) {
        console.log(`  - "${pe.answer}" [${pe.cause}]: ${pe.explanation}`);
      }
    }
    console.log(`Explicação:`);
    console.log(`  Percebido:   ${item.explanation.perceived}`);
    console.log(`  Ameaça:      ${item.explanation.threat}`);
    console.log(`  Defesa:      ${item.explanation.bestDefense}`);
    console.log(`  Motivo:      ${item.explanation.reason}`);
    console.log(`  Padrão:      ${item.explanation.pattern}`);
    console.log(`  Regra geral: ${item.explanation.transferableRule}`);
    console.log(`Fontes: ${item.sources}`);
    console.log("");
  }
}

main();

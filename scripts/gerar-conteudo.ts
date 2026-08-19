/**
 * CLI do gerador do banco de prática.
 *
 * Determinístico: `npm run content:gerar` duas vezes seguidas não muda um byte.
 * Sem isso, o diff em git viraria ruído e ninguém revisaria o que mudou.
 *
 * A saída é COMMITADA, não gerada em build. Conteúdo gerado em build é conteúdo
 * que ninguém nunca leu — e o ADR-002 existe justamente para que os dois gates
 * rodem em CI sobre exatamente o que vai ao ar.
 */

import { writeFileSync } from "node:fs";
import type { ExerciseInput } from "../src/content/schema";
import { startEngine, type Engine } from "../src/lib/engine/uci";
import {
  fabricarAlcance,
  fabricarCaptura,
  fabricarClassificacao,
  fabricarCorDaCasa,
  fabricarEnPassant,
  fabricarMateEmUm,
  fabricarNotacao,
  fabricarOrientacao,
  fabricarPromocao,
  fabricarRespostaAoXeque,
  fabricarRoque,
  gerar,
  type Pedido,
} from "../src/lib/geracao/gerador";

const SEMENTE = 20260819;
const SAIDA = "src/content/gerado/recruta-pratica.ts";

/**
 * Um pedido por unidade.
 *
 * As dificuldades sobem dentro de cada bloco porque o teto de domínio é função
 * da dificuldade do item: um banco só de itens fáceis não deixaria a habilidade
 * passar de "em desenvolvimento", por mais que o aluno acertasse tudo.
 */
const PEDIDOS: Array<Pedido & { fabricante: Parameters<typeof gerar>[1] }> = [
  {
    unidade: "r1",
    skillIds: ["r1.cor-casa", "r1.localizar"],
    sources: ["dagostini-basico", "maizelis-primer"],
    quantidade: 10,
    dificuldades: [3, 4, 5, 6, 7],
    ratingHint: 250,
    fabricante: fabricarCorDaCasa,
  },
  {
    unidade: "r1b",
    skillIds: ["r1.orientacao", "r1.localizar"],
    sources: ["fide-laws", "dagostini-basico"],
    quantidade: 6,
    dificuldades: [4, 5, 6, 7],
    ratingHint: 300,
    fabricante: fabricarOrientacao,
  },
  {
    unidade: "r2a",
    skillIds: ["r2.cavalo", "r2.casas-atacadas"],
    sources: ["fide-laws", "dagostini-basico", "maizelis-primer"],
    quantidade: 6,
    dificuldades: [4, 5, 6, 7],
    ratingHint: 300,
    fabricante: fabricarAlcance("n", "ATTACKED_SQUARES", false),
  },
  {
    unidade: "r2b",
    skillIds: ["r2.linhas", "r2.casas-atacadas"],
    sources: ["fide-laws", "dagostini-basico", "maizelis-primer"],
    quantidade: 6,
    dificuldades: [5, 6, 7, 8],
    ratingHint: 400,
    fabricante: fabricarAlcance("r", "ATTACKED_SQUARES", true),
  },
  {
    unidade: "r2c",
    skillIds: ["r2.linhas", "r2.cavalo"],
    sources: ["fide-laws", "dagostini-basico", "maizelis-primer"],
    quantidade: 5,
    dificuldades: [4, 5, 6],
    ratingHint: 350,
    fabricante: fabricarAlcance("b", "LEGAL_MOVES", true),
  },
  {
    unidade: "r4a",
    skillIds: ["r4.reconhecer"],
    sources: ["fide-laws", "dagostini-basico", "maizelis-primer"],
    quantidade: 5,
    dificuldades: [4, 5, 6, 7],
    ratingHint: 350,
    fabricante: fabricarClassificacao("xeque"),
  },
  {
    unidade: "r4b",
    skillIds: ["r4.tres-respostas", "r4.xeque-cavalo", "r4.reconhecer"],
    sources: ["fide-laws", "dagostini-basico", "maizelis-primer"],
    quantidade: 6,
    dificuldades: [5, 6, 7, 8],
    ratingHint: 450,
    fabricante: fabricarRespostaAoXeque,
  },
  {
    unidade: "r5a",
    skillIds: ["r5.mate-em-1"],
    sources: ["dagostini-basico", "maizelis-primer"],
    quantidade: 6,
    dificuldades: [5, 6, 7, 8],
    ratingHint: 500,
    fabricante: fabricarMateEmUm,
  },
  {
    unidade: "r5b",
    skillIds: ["r5.afogamento", "r4.reconhecer"],
    sources: ["fide-laws", "silman-endgame"],
    quantidade: 5,
    dificuldades: [5, 6, 7],
    ratingHint: 450,
    fabricante: fabricarClassificacao("afogamento"),
  },
  {
    unidade: "r5c",
    skillIds: ["r5.afogamento"],
    sources: ["fide-laws", "silman-endgame"],
    quantidade: 4,
    dificuldades: [4, 5, 6],
    ratingHint: 400,
    fabricante: fabricarClassificacao("mate"),
  },
  {
    unidade: "r3",
    skillIds: ["r3.captura", "r3.indefesa", "r3.valor"],
    sources: ["capablanca-fundamentals", "dagostini-basico", "maizelis-primer"],
    quantidade: 7,
    dificuldades: [5, 6, 7, 8],
    ratingHint: 500,
    fabricante: fabricarCaptura,
  },
  {
    unidade: "r6a",
    skillIds: ["r6.roque"],
    sources: ["fide-laws", "dagostini-basico"],
    quantidade: 6,
    dificuldades: [4, 5, 6],
    ratingHint: 350,
    fabricante: fabricarRoque,
  },
  {
    unidade: "r6b",
    skillIds: ["r6.en-passant"],
    sources: ["fide-laws", "dagostini-basico"],
    quantidade: 6,
    dificuldades: [5, 6, 7],
    ratingHint: 450,
    fabricante: fabricarEnPassant,
  },
  {
    unidade: "r6c",
    skillIds: ["r6.promocao"],
    sources: ["fide-laws", "dagostini-basico"],
    quantidade: 6,
    dificuldades: [4, 5, 6],
    ratingHint: 350,
    fabricante: fabricarPromocao,
  },
  {
    unidade: "r6",
    skillIds: ["r6.notacao", "r1.localizar"],
    sources: ["fide-laws", "dagostini-basico"],
    quantidade: 8,
    dificuldades: [4, 5, 6, 7, 8],
    ratingHint: 400,
    fabricante: fabricarNotacao,
  },
];

/** Serializa como TypeScript legível — o arquivo será lido em revisão de diff. */
function serializar(porUnidade: Map<string, ExerciseInput[]>): string {
  const total = [...porUnidade.values()].reduce((n, itens) => n + itens.length, 0);

  const blocos = [...porUnidade.entries()]
    .map(([unidade, itens]) => {
      const corpo = itens.map((i) => `    ${JSON.stringify(i, null, 2).split("\n").join("\n    ")},`).join("\n");
      return `  "${unidade}": [\n${corpo}\n  ],`;
    })
    .join("\n");

  return `/**
 * ARQUIVO GERADO — não editar à mão.
 *
 * Produzido por \`npm run content:gerar\` com semente ${SEMENTE}.
 * Rode o comando de novo para reproduzir byte a byte.
 *
 * Cada item saiu daqui já aprovado: o gabarito vem do motor de regras, o
 * avaliador confere o próprio gabarito, e os itens de lance passam pelo gate de
 * engine durante a geração. O CI confere de novo, porque gerador com defeito é
 * possível.
 *
 * ${total} itens de prática.
 */

import type { ExerciseInput } from "../schema";

export const PRATICA_RECRUTA: Record<string, ExerciseInput[]> = {
${blocos}
};
`;
}

async function main(): Promise<void> {
  let engine: Engine | null = null;
  try {
    engine = await startEngine();
    console.log(`Engine para o gate durante a geração: ${engine.name}`);
  } catch {
    console.warn("AVISO: engine indisponível — itens de lance não serão verificados aqui.");
  }

  const porUnidade = new Map<string, ExerciseInput[]>();
  let totalDescartados = 0;

  for (const [i, pedido] of PEDIDOS.entries()) {
    const { fabricante, ...resto } = pedido;
    // Semente derivada do índice: mexer num pedido não embaralha os outros.
    const resultado = await gerar(resto, fabricante, SEMENTE + i * 1_000, engine);

    porUnidade.set(pedido.unidade, resultado.itens);
    totalDescartados += resultado.descartados;

    const faltou = resultado.itens.length < pedido.quantidade;
    console.log(
      `  ${faltou ? "!" : "✓"} ${pedido.unidade}: ${resultado.itens.length}/${pedido.quantidade} itens` +
        (resultado.descartados > 0 ? ` (${resultado.descartados} descartados)` : ""),
    );
    if (faltou) {
      for (const [motivo, n] of [...resultado.motivos].sort((a, b) => b[1] - a[1]).slice(0, 3)) {
        console.log(`      ${n}× ${motivo}`);
      }
    }
  }

  await engine?.quit();

  writeFileSync(SAIDA, serializar(porUnidade), "utf8");

  const total = [...porUnidade.values()].reduce((n, itens) => n + itens.length, 0);
  console.log(`\n${total} itens escritos em ${SAIDA} · ${totalDescartados} descartados no caminho.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

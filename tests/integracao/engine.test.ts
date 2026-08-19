/**
 * Critério de aceite do bloco A2.
 *
 * "Um exercício com solução ambígua é reprovado pelo ENGINE_REVIEW sem ninguém
 * apontar."
 *
 * Roda o Stockfish de verdade. Os testes de `verification.test.ts` cobrem as
 * regras com linhas fabricadas, em milissegundos; estes provam que a engine
 * chega às linhas certas. Sem os dois, o gate ficaria provado pela metade.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startEngine, type Engine } from "@/lib/engine/uci";
import { blocks, verifyMoveExercise } from "@/domain/chess/verification";

const PROFUNDIDADE = 10;

describe("ENGINE_REVIEW com a engine real", () => {
  let engine: Engine;

  beforeAll(async () => {
    engine = await startEngine();
  }, 60_000);

  afterAll(async () => {
    await engine?.quit();
  });

  it("a engine sobe e se identifica", () => {
    expect(engine.name).toContain("Stockfish");
  });

  it(
    "reprova um item que declara solução única onde existem várias equivalentes",
    async () => {
      // Posição inicial: 1.e4 e 1.d4 são equivalentes. Um item que aceitasse só
      // e4 estaria afirmando mais do que a posição sustenta.
      const inicial = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      const linhas = await engine.analyse(inicial, { depth: PROFUNDIDADE, multiPv: 5 });

      const achados = verifyMoveExercise({
        acceptedUci: ["e2e4"],
        predictableUci: [],
        lines: linhas,
      });

      expect(blocks(achados), "gate deixou passar solução ambígua").toBe(true);
      expect(achados.map((f) => f.code)).toContain("SOLUCAO_NAO_E_UNICA");
    },
    90_000,
  );

  it(
    "reprova um item cujo gabarito não é a melhor jogada",
    async () => {
      // Mate em 1 disponível: qualquer outro lance é objetivamente pior.
      const mateEm1 = "6k1/5ppp/8/8/8/8/8/R3K2R w KQ - 0 1";
      const linhas = await engine.analyse(mateEm1, { depth: PROFUNDIDADE, multiPv: 5 });

      const achados = verifyMoveExercise({
        acceptedUci: ["e1e2"], // lance de rei qualquer, em vez de Ta8#
        predictableUci: [],
        lines: linhas,
      });

      expect(blocks(achados)).toBe(true);
      expect(achados.map((f) => f.code)).toContain("SOLUCAO_NAO_E_A_MELHOR");
    },
    90_000,
  );

  it(
    "aprova o mate em 1 que o conteúdo publicado declara",
    async () => {
      const mateEm1 = "6k1/5ppp/8/8/8/8/8/R3K2R w KQ - 0 1";
      const linhas = await engine.analyse(mateEm1, { depth: PROFUNDIDADE, multiPv: 5 });

      const achados = verifyMoveExercise({
        acceptedUci: ["a1a8"],
        predictableUci: ["h1h8"], // Th8+ perde a torre para Rxh8
        lines: linhas,
        claimsMateIn: 1,
      });

      expect(achados.filter((f) => f.severity === "BLOQUEIA")).toEqual([]);
    },
    90_000,
  );

  it(
    "confirma o erro real que a engine encontrou no conteúdo: Dxh5 perdia a dama",
    async () => {
      // Posição original de r3.e3, antes da correção. A torre de d5 defendia h5
      // pela quinta fileira, então Dxh5 era respondida por Txh5.
      const posicaoAntiga = "4k3/8/2p5/3r3n/8/8/8/4K2Q w - - 0 1";
      const linhas = await engine.analyse(posicaoAntiga, { depth: PROFUNDIDADE, multiPv: 5 });

      const achados = verifyMoveExercise({
        acceptedUci: ["h1h5"],
        predictableUci: [],
        lines: linhas,
        candidateUci: ["h1h5", "h1d5"],
      });

      expect(blocks(achados), "o gate precisa reprovar a versão errada do item").toBe(true);
    },
    90_000,
  );
});

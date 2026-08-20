/**
 * Critério de aceite do bloco A5 — a outra metade.
 *
 * "O bot de 800 comete erro plausível de 800, não lance aleatório." Os testes
 * de `game-bot.test.ts` provam a lógica com linhas fabricadas; este prova que
 * a calibração se sustenta contra avaliações reais do Stockfish, não só
 * contra números escolhidos a dedo.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startEngine, type Engine } from "@/lib/engine/uci";
import { chooseBotMove, ratingToProfile } from "@/domain/game/bot";

describe("bot calibrado por rating — engine real", () => {
  let engine: Engine;

  beforeAll(async () => {
    engine = await startEngine();
  }, 60_000);

  afterAll(async () => {
    await engine?.quit();
  });

  it(
    "rating baixo perde mais material em média que rating alto, sobre as MESMAS linhas reais",
    async () => {
      // Meio de jogo comum (Giuoco Piano) — posição real, não fabricada.
      const fen = "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 6 5";
      const linhas = await engine.analyse(fen, { depth: 12, multiPv: 6 });
      expect(linhas.length).toBeGreaterThan(1);

      // PRNG determinístico — mesma sequência de sorteios para as duas faixas,
      // então a diferença observada vem só do perfil, não da sorte.
      let seed = 7;
      const rng = (): number => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
      };

      function mediaDePerda(rating: number, n: number): number {
        seed = 7;
        const perfil = ratingToProfile(rating);
        let total = 0;
        for (let i = 0; i < n; i++) total += chooseBotMove(linhas, perfil, rng).cpLoss;
        return total / n;
      }

      const perfil800 = ratingToProfile(800);
      const perfil2000 = ratingToProfile(2000);

      const media800 = mediaDePerda(800, 500);
      const media2000 = mediaDePerda(2000, 500);

      expect(media800).toBeGreaterThan(media2000);

      // E nunca fora dos tetos configurados, mesmo contra avaliações reais.
      for (let i = 0; i < 100; i++) {
        expect(chooseBotMove(linhas, perfil800, rng).cpLoss).toBeLessThanOrEqual(perfil800.maxLossCp);
      }
      for (let i = 0; i < 100; i++) {
        expect(chooseBotMove(linhas, perfil2000, rng).cpLoss).toBeLessThanOrEqual(perfil2000.maxLossCp);
      }

      // E sempre um lance que a engine realmente devolveu — nunca inventado.
      const uciDisponiveis = new Set(linhas.map((l) => l.moveUci));
      for (let i = 0; i < 30; i++) {
        expect(uciDisponiveis.has(chooseBotMove(linhas, perfil800, rng).moveUci)).toBe(true);
      }
    },
    30_000,
  );
});

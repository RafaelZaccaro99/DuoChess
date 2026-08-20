import { describe, expect, it } from "vitest";
import {
  BOT_RATING_PRESETS,
  chooseBotMove,
  parseBotRating,
  ratingToProfile,
} from "@/domain/game/bot";
import type { EngineLine } from "@/domain/chess/verification";

const LINES: EngineLine[] = [
  { moveUci: "e2e4", cp: 80 },
  { moveUci: "d2d4", cp: 40 },
  { moveUci: "g1f3", cp: 10 },
  { moveUci: "a2a3", cp: -400 },
];

function rngSequence(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length]!;
}

describe("parseBotRating", () => {
  it("lê o rating de 'Bot 800'", () => {
    expect(parseBotRating("Bot 800")).toBe(800);
  });

  it("devolve null para texto livre", () => {
    expect(parseBotRating("Fulano da Silva")).toBeNull();
  });
});

describe("ratingToProfile", () => {
  it("é monótono: rating maior nunca erra mais nem perde mais que um menor", () => {
    for (let i = 0; i < BOT_RATING_PRESETS.length - 1; i++) {
      const baixo = ratingToProfile(BOT_RATING_PRESETS[i]!);
      const alto = ratingToProfile(BOT_RATING_PRESETS[i + 1]!);
      expect(alto.errorProbability).toBeLessThanOrEqual(baixo.errorProbability);
      expect(alto.maxLossCp).toBeLessThanOrEqual(baixo.maxLossCp);
    }
  });

  it("satura fora da faixa de presets", () => {
    expect(ratingToProfile(100)).toEqual(ratingToProfile(400));
    expect(ratingToProfile(3000)).toEqual(ratingToProfile(2000));
  });
});

describe("chooseBotMove — nunca escolhe fora das linhas da engine", () => {
  it("rating altíssimo sempre joga a melhor linha", () => {
    const perfil = { errorProbability: 0, maxLossCp: 1000 };
    for (let i = 0; i < 20; i++) {
      const escolha = chooseBotMove(LINES, perfil, () => i / 20);
      expect(escolha.moveUci).toBe("e2e4");
      expect(escolha.wasBestMove).toBe(true);
      expect(escolha.cpLoss).toBe(0);
    }
  });

  it("rating 800 forçado a errar fica dentro do teto de perda configurado", () => {
    const perfil = ratingToProfile(800);
    const rng = rngSequence([0.01, 0.5]); // < errorProbability, depois metade do peso
    const escolha = chooseBotMove(LINES, perfil, rng);
    expect(escolha.wasBestMove).toBe(false);
    expect(escolha.cpLoss).toBeGreaterThan(0);
    expect(escolha.cpLoss).toBeLessThanOrEqual(perfil.maxLossCp);
    // Nunca escolhe fora do que a engine devolveu — "não é lance aleatório".
    expect(LINES.some((l) => l.moveUci === escolha.moveUci)).toBe(true);
  });

  it("rating 2000 forçado a errar tem teto estritamente menor que o de 800", () => {
    const perfil800 = ratingToProfile(800);
    const perfil2000 = ratingToProfile(2000);
    expect(perfil2000.maxLossCp).toBeLessThan(perfil800.maxLossCp);

    const rng = rngSequence([0.01, 0.9]);
    const escolha = chooseBotMove(LINES, perfil2000, rng);
    if (!escolha.wasBestMove) {
      expect(escolha.cpLoss).toBeLessThanOrEqual(perfil2000.maxLossCp);
    }
  });

  it("nunca escolhe o pior lance fora do teto mesmo forçado a errar", () => {
    const perfil = { errorProbability: 1, maxLossCp: 100 };
    for (let i = 0; i < 30; i++) {
      const escolha = chooseBotMove(LINES, perfil, () => i / 30);
      expect(escolha.cpLoss).toBeLessThanOrEqual(100);
      expect(escolha.moveUci).not.toBe("a2a3"); // perda de 480cp, muito além do teto
    }
  });

  it("corrida estatística: frequência empírica de erro se aproxima de errorProbability", () => {
    const perfil = { errorProbability: 0.4, maxLossCp: 500 };
    let seeded = 42;
    const rng = () => {
      seeded = (seeded * 1103515245 + 12345) & 0x7fffffff;
      return seeded / 0x7fffffff;
    };
    let erros = 0;
    const N = 2000;
    for (let i = 0; i < N; i++) {
      if (!chooseBotMove(LINES, perfil, rng).wasBestMove) erros++;
    }
    expect(erros / N).toBeGreaterThan(0.3);
    expect(erros / N).toBeLessThan(0.5);
  });
});

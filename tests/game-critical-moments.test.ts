import { describe, expect, it } from "vitest";
import { detectCriticalMoments, type MoveWithEval } from "@/domain/game/criticalMoments";
import { START_FEN } from "@/domain/chess/board";

function move(partial: Partial<MoveWithEval> & Pick<MoveWithEval, "ply" | "san">): MoveWithEval {
  return {
    fenBefore: START_FEN,
    fenAfter: START_FEN,
    bestLine: { moveUci: "e2e4", cp: 30 },
    secondLine: { moveUci: "d2d4", cp: 25 },
    playedScore: 28,
    ...partial,
  };
}

describe("detectCriticalMoments", () => {
  it("posição tranquila (sem blunder, sem posição afiada) não vira momento crítico", () => {
    const moves = [move({ ply: 1, san: "e4" })];
    expect(detectCriticalMoments(moves)).toHaveLength(0);
  });

  it("detecta um blunder óbvio mesmo numa posição pouco afiada", () => {
    const moves = [
      move({ ply: 1, san: "e4" }), // tranquilo
      move({
        ply: 2,
        san: "a6", // lance ruim
        bestLine: { moveUci: "e2e4", cp: 50 },
        secondLine: { moveUci: "d2d4", cp: 40 }, // criticidade baixa (10)
        playedScore: -400, // mas o jogador perdeu 450cp
      }),
      move({ ply: 3, san: "e4" }), // tranquilo
    ];
    const criticos = detectCriticalMoments(moves);
    expect(criticos).toHaveLength(1);
    expect(criticos[0]!.ply).toBe(2);
    expect(criticos[0]!.cpAfter).toBe(-400);
  });

  it("detecta posição afiada mesmo quando o jogador acerta — precisa para medir transferência", () => {
    const moves = [
      move({
        ply: 1,
        san: "Nf3", // SAN de g1f3 a partir da posição inicial — bate com a melhor linha
        bestLine: { moveUci: "g1f3", cp: 80 },
        secondLine: { moveUci: "d2d4", cp: -40 }, // criticidade alta (120)
        playedScore: 80, // jogou a melhor linha: perda zero
      }),
    ];
    const criticos = detectCriticalMoments(moves);
    expect(criticos).toHaveLength(1);
    expect(criticos[0]!.playedSan).toBe(criticos[0]!.bestSan);
  });

  it("respeita maxMoments, priorizando os de maior relevância", () => {
    const moves = [
      move({ ply: 1, san: "a6", bestLine: { moveUci: "e2e4", cp: 50 }, secondLine: { moveUci: "d2d4", cp: 45 }, playedScore: -100 }),
      move({ ply: 2, san: "a6", bestLine: { moveUci: "e2e4", cp: 50 }, secondLine: { moveUci: "d2d4", cp: 45 }, playedScore: -900 }),
      move({ ply: 3, san: "a6", bestLine: { moveUci: "e2e4", cp: 50 }, secondLine: { moveUci: "d2d4", cp: 45 }, playedScore: -500 }),
    ];
    const criticos = detectCriticalMoments(moves, { maxMoments: 2 });
    expect(criticos).toHaveLength(2);
    // Mantém ordem cronológica na saída, mesmo tendo escolhido pela relevância.
    expect(criticos.map((c) => c.ply)).toEqual([2, 3]);
  });

  it("devolve vazio quando nenhum lance excede o limiar", () => {
    const moves = [move({ ply: 1, san: "e4" }), move({ ply: 2, san: "d4" })];
    expect(detectCriticalMoments(moves, { minCpSwing: 1000 })).toHaveLength(0);
  });
});

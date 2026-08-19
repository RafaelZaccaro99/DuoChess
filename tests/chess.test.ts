import { describe, expect, it } from "vitest";
import {
  attackedSquaresFrom,
  isLightSquare,
  legalMovesFrom,
  positionFacts,
  sanFromPt,
  sanToPt,
} from "@/domain/chess/board";
import { evaluateExercise, sanMatches } from "@/domain/chess/evaluate";
import { COURSE } from "@/content";
import type { ExerciseDef } from "@/content/schema";

function findExercise(slug: string): ExerciseDef {
  for (const league of COURSE.leagues) {
    for (const unit of league.units) {
      for (const lesson of unit.lessons) {
        const found = lesson.exercises.find((e) => e.slug === slug);
        if (found) return found;
      }
    }
  }
  throw new Error(`exercício não encontrado: ${slug}`);
}

describe("geometria do tabuleiro", () => {
  it("a1 e h8 são escuras; h1 e a8 são claras", () => {
    expect(isLightSquare("a1")).toBe(false);
    expect(isLightSquare("h8")).toBe(false);
    expect(isLightSquare("h1")).toBe(true);
    expect(isLightSquare("a8")).toBe(true);
  });
});

describe("ataque não é movimento", () => {
  it("um peão ataca as diagonais, não a casa à frente", () => {
    const fen = "4k3/8/8/8/4P3/8/8/4K3 w - - 0 1";
    expect(attackedSquaresFrom(fen, "e4").sort()).toEqual(["d5", "f5"]);
    expect(legalMovesFrom(fen, "e4")).toContain("e5");
  });

  it("uma torre ataca a casa da própria peça — está defendendo-a", () => {
    const fen = "4k3/8/3P4/8/3R4/8/8/4K3 w - - 0 1";
    const atacadas = attackedSquaresFrom(fen, "d4");
    expect(atacadas).toContain("d6"); // peão branco defendido
    expect(atacadas).not.toContain("d7"); // atrás do bloqueio
    expect(legalMovesFrom(fen, "d4")).not.toContain("d6"); // não pode ir para lá
  });

  it("o cavalo do centro alcança oito casas e o do canto, duas", () => {
    expect(attackedSquaresFrom("4k3/8/8/4N3/8/8/8/4K3 w - - 0 1", "e5")).toHaveLength(8);
    expect(legalMovesFrom("4k3/8/8/8/8/8/8/N3K3 w - - 0 1", "a1").sort()).toEqual(["b3", "c2"]);
  });
});

describe("fatos da posição", () => {
  it("distingue mate, afogamento e xeque simples", () => {
    expect(positionFacts("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1")).toMatchObject({
      isStalemate: true,
      isCheckmate: false,
      inCheck: false,
    });
    expect(positionFacts("4k3/4r3/5N2/8/8/8/8/K7 b - - 0 1")).toMatchObject({
      inCheck: true,
      isCheckmate: false,
    });
  });
});

describe("SAN entre português e inglês", () => {
  it("traduz inicial de peça e sufixo de promoção", () => {
    expect(sanFromPt("Cf3")).toBe("Nf3");
    expect(sanToPt("Nf3")).toBe("Cf3");
    expect(sanFromPt("e8=D")).toBe("e8=Q");
    expect(sanToPt("e8=Q")).toBe("e8=D");
  });

  it("casa lances independentemente do idioma e dos símbolos", () => {
    expect(sanMatches("Ta8#", "Ra8")).toBe(true);
    expect(sanMatches("e8=D", "e8=Q")).toBe(true);
    expect(sanMatches("Cf3", "Nf3")).toBe(true);
    expect(sanMatches("Cf3", "Nc3")).toBe(false);
  });
});

describe("avaliação de exercícios", () => {
  it("aceita a solução e recusa a alternativa errada, com a causa certa", () => {
    const exercise = findExercise("r4.e3"); // única defesa: Bf8

    expect(evaluateExercise(exercise, { kind: "move", san: "Bf8" }).correct).toBe(true);

    const errado = evaluateExercise(exercise, { kind: "move", san: "Be7" });
    expect(errado.correct).toBe(false);
    expect(errado.cause).toBe("VISUALIZATION");
    expect(errado.specificFeedback).toContain("oitava fileira");
  });

  it("aceita a resposta em inglês também", () => {
    const exercise = findExercise("r5.e2");
    expect(evaluateExercise(exercise, { kind: "move", san: "Ra8" }).correct).toBe(true);
    expect(evaluateExercise(exercise, { kind: "move", san: "Ta8" }).correct).toBe(true);
  });

  it("marca lance ilegal como erro de regra, não como resposta errada qualquer", () => {
    const exercise = findExercise("r4.e2");
    const resultado = evaluateExercise(exercise, { kind: "move", san: "Kd7" });
    expect(resultado.correct).toBe(false);
    expect(resultado.cause).toBe("RULE");
    expect(resultado.causeConfidence).toBeGreaterThan(0.8);
  });

  it("conjunto de casas ignora ordem e duplicata", () => {
    const exercise = findExercise("r2.e1");
    const embaralhado = ["g6", "c4", "d7", "f7", "c6", "f3", "d3", "g4", "g4"];
    expect(evaluateExercise(exercise, { kind: "squares", squares: embaralhado }).correct).toBe(true);
  });

  it("distingue casa faltando de casa sobrando", () => {
    const exercise = findExercise("r2.e1");

    const faltando = evaluateExercise(exercise, {
      kind: "squares",
      squares: ["c4", "c6", "d3", "d7", "f3", "f7", "g4"],
    });
    expect(faltando.cause).toBe("VISUALIZATION");
    expect(faltando.specificFeedback).toContain("Faltaram");

    const sobrando = evaluateExercise(exercise, {
      kind: "squares",
      squares: ["c4", "c6", "d3", "d7", "f3", "f7", "g4", "g6", "e6"],
    });
    expect(sobrando.cause).toBe("RULE");
    expect(sobrando.specificFeedback).toContain("e6");
  });

  it("detecta gabarito divergente do motor em vez de reprovar o usuário", () => {
    const exercise = findExercise("r2.e1");
    const adulterado: ExerciseDef = {
      ...exercise,
      acceptedAnswer: { squares: ["c4", "c6", "d3", "d7", "f3", "f7", "g4", "e6"] },
    };
    const resultado = evaluateExercise(adulterado, { kind: "squares", squares: ["c4"] });
    expect(resultado.contentError).toContain("Gabarito diverge");
    expect(resultado.correct).toBe(false);
  });
});

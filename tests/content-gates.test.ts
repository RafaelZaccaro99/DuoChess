/**
 * Gates de conteúdo, testados sem banco e sem engine.
 *
 * `checkExercise`/`checkExerciseSources`/`detectCycles` são o que o CMS (A7)
 * roda por item, sem replicar o acervo inteiro — aqui provamos as regras de
 * reprovação isoladas, com fixtures fabricadas, no mesmo estilo de
 * verification.test.ts.
 */

import { describe, expect, it } from "vitest";
import {
  checkExercise,
  checkExerciseSources,
  detectCycles,
  emptyDuplicateState,
  primeDuplicateState,
} from "@/domain/content/gates";
import { runEngineGate, TIPOS_DE_LANCE } from "@/lib/content/engine-gate";
import type { ExerciseDef } from "@/content/schema";
import type { SkillNode } from "@/domain/curriculum";
import type { Engine, LineEval } from "@/lib/engine/uci";

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const exercicioBase = (over: Partial<ExerciseDef> = {}): ExerciseDef => ({
  slug: "fixture.01",
  phase: "INDEPENDENT",
  type: "BEST_MOVE",
  prompt: "Encontre o melhor lance para as brancas.",
  fen: START,
  sideToMove: "w",
  skillIds: ["fund.pecas"],
  difficulty: 3,
  ratingHint: 200,
  acceptedAnswer: { moves: ["Cf3"] },
  predictableErrors: [{ answer: "a4", cause: "PATTERN", explanation: "Lance de flanco sem ameaça alguma." }],
  explanation: {
    perceived: "Parece um lance qualquer de desenvolvimento.",
    threat: "Nenhuma ameaça direta na posição inicial.",
    bestDefense: "Não há defesa a fazer aqui.",
    reason: "Desenvolve uma peça e controla o centro.",
    pattern: "Desenvolvimento de cavalo.",
    transferableRule: "Desenvolva cavalos antes de bispos.",
  },
  hints: ["Pense em desenvolvimento.", "Uma peça menor pode saltar.", "O cavalo do rei tem uma boa casa."],
  marks: [],
  tags: [],
  expectedSeconds: 20,
  points: 10,
  sources: [],
  verification: "BEST",
  ...over,
});

const KNOWN_SKILLS = new Set(["fund.pecas"]);

describe("checkExercise", () => {
  it("aprova um exercício bem formado", () => {
    const problems = checkExercise(exercicioBase(), "onde", KNOWN_SKILLS, emptyDuplicateState());
    expect(problems).toEqual([]);
  });

  it("reprova FEN inválido", () => {
    const problems = checkExercise(
      exercicioBase({ fen: "isto não é um FEN" }),
      "onde",
      KNOWN_SKILLS,
      emptyDuplicateState(),
    );
    expect(problems.some((p) => p.message.includes("FEN inválido"))).toBe(true);
  });

  it("reprova sideToMove divergente do FEN", () => {
    const problems = checkExercise(exercicioBase({ sideToMove: "b" }), "onde", KNOWN_SKILLS, emptyDuplicateState());
    expect(problems.some((p) => p.message.includes("sideToMove"))).toBe(true);
  });

  it("reprova habilidade inexistente", () => {
    const problems = checkExercise(
      exercicioBase({ skillIds: ["fantasma"] }),
      "onde",
      KNOWN_SKILLS,
      emptyDuplicateState(),
    );
    expect(problems.some((p) => p.message.includes("habilidade inexistente"))).toBe(true);
  });

  it("reprova causa fora da taxonomia", () => {
    const problems = checkExercise(
      exercicioBase({ predictableErrors: [{ answer: "a4", cause: "INVENTADA", explanation: "explicação qualquer aqui." }] }),
      "onde",
      KNOWN_SKILLS,
      emptyDuplicateState(),
    );
    expect(problems.some((p) => p.message.includes("causa fora da taxonomia"))).toBe(true);
  });

  it("reprova gabarito reprovado pelo próprio avaliador", () => {
    const problems = checkExercise(
      exercicioBase({ acceptedAnswer: { moves: ["Txh8"] } }),
      "onde",
      KNOWN_SKILLS,
      emptyDuplicateState(),
    );
    expect(problems.some((p) => p.message.includes("motor") || p.message.includes("gabarito"))).toBe(true);
  });

  it("reprova slug duplicado", () => {
    const dup = emptyDuplicateState();
    checkExercise(exercicioBase(), "onde", KNOWN_SKILLS, dup);
    const problems = checkExercise(exercicioBase(), "onde", KNOWN_SKILLS, dup);
    expect(problems.some((p) => p.message.includes("slug duplicado"))).toBe(true);
  });

  it("reprova mesma posição/pergunta/resposta com slug diferente — duplicata semântica", () => {
    const dup = emptyDuplicateState();
    checkExercise(exercicioBase({ slug: "fixture.01" }), "onde", KNOWN_SKILLS, dup);
    const problems = checkExercise(exercicioBase({ slug: "fixture.02" }), "onde", KNOWN_SKILLS, dup);
    expect(problems.some((p) => p.message.includes("duplicata"))).toBe(true);
  });

  it("primeDuplicateState aquece sem gerar problema", () => {
    const dup = emptyDuplicateState();
    primeDuplicateState(dup, [exercicioBase({ slug: "existente" })]);
    const problems = checkExercise(exercicioBase({ slug: "existente" }), "onde", KNOWN_SKILLS, dup);
    expect(problems.some((p) => p.message.includes("slug duplicado"))).toBe(true);
  });
});

describe("checkExerciseSources", () => {
  it("aprova quando não cita nenhuma fonte própria", () => {
    expect(checkExerciseSources(exercicioBase())).toEqual([]);
  });

  it("reprova fonte fora do registro", () => {
    const problems = checkExerciseSources(exercicioBase({ sources: ["fonte-inexistente"] }));
    expect(problems.some((p) => p.message.includes("fora do registro"))).toBe(true);
  });
});

describe("detectCycles", () => {
  const skill = (id: string, dependsOn: string[]): SkillNode => ({
    id,
    title: id,
    competency: "tactics",
    description: "descrição qualquer com mais de dez caracteres.",
    sources: ["fide-laws"],
    dependsOn,
    minPrerequisiteMastery: 60,
    unitId: "u1",
    leagueId: "r1",
  });

  it("não acusa ciclo num grafo acíclico", () => {
    const skills = new Map([
      ["a", skill("a", [])],
      ["b", skill("b", ["a"])],
      ["c", skill("c", ["b"])],
    ]);
    expect(detectCycles(skills)).toEqual([]);
  });

  it("detecta ciclo de 2 nós", () => {
    const skills = new Map([
      ["a", skill("a", ["b"])],
      ["b", skill("b", ["a"])],
    ]);
    const problems = detectCycles(skills);
    expect(problems.some((p) => p.message.includes("ciclo"))).toBe(true);
  });

  it("detecta ciclo de 3 nós", () => {
    const skills = new Map([
      ["a", skill("a", ["c"])],
      ["b", skill("b", ["a"])],
      ["c", skill("c", ["b"])],
    ]);
    const problems = detectCycles(skills);
    expect(problems.some((p) => p.message.includes("ciclo"))).toBe(true);
  });
});

describe("runEngineGate", () => {
  const stubEngine = (linhas: LineEval[]): Engine => ({
    name: "stub",
    analyse: async () => linhas,
    quit: async () => {},
  });

  it("pula tipos que não são de lance sem chamar a engine", async () => {
    let chamou = false;
    const engine: Engine = {
      name: "stub",
      analyse: async () => {
        chamou = true;
        return [];
      },
      quit: async () => {},
    };
    const achados = await runEngineGate(
      exercicioBase({ type: "SQUARE_COLOR", acceptedAnswer: { color: "light" } }),
      engine,
    );
    expect(achados).toEqual([]);
    expect(chamou).toBe(false);
  });

  it("pula itens RULE_EXECUTION sem chamar a engine", async () => {
    let chamou = false;
    const engine: Engine = {
      name: "stub",
      analyse: async () => {
        chamou = true;
        return [];
      },
      quit: async () => {},
    };
    const achados = await runEngineGate(exercicioBase({ verification: "RULE_EXECUTION" }), engine);
    expect(achados).toEqual([]);
    expect(chamou).toBe(false);
  });

  it("aprova quando a engine confirma o gabarito como melhor lance", async () => {
    const engine = stubEngine([
      { moveUci: "g1f3", cp: 300, pv: ["g1f3"], depth: 1 },
      { moveUci: "b1c3", cp: -50, pv: ["b1c3"], depth: 1 },
    ]);
    const achados = await runEngineGate(exercicioBase(), engine, { depth: 1, multiPv: 2 });
    expect(achados).toEqual([]);
  });

  it("TIPOS_DE_LANCE cobre exatamente os tipos de lance do schema", () => {
    expect([...TIPOS_DE_LANCE].sort()).toEqual(["BEST_MOVE", "CAPTURE", "CHECK_ESCAPE"].sort());
  });
});

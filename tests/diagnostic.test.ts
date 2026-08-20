/**
 * Critério de aceite do bloco A6.
 *
 * "Duas pessoas com respostas diferentes recebem trilhas diferentes, e o
 * nível avançado continua marcado como não confiável sem partidas."
 */

import { describe, expect, it } from "vitest";
import { COURSE } from "@/content";
import { buildIndex, skillIndexForScore } from "@/domain/curriculum";
import { QUICK_ITEM_COUNT, selectDiagnosticItems } from "@/domain/diagnostic/select";
import { applyDiagnosticAnswer } from "@/domain/diagnostic/run";
import { computeChessScore } from "@/domain/score/chess-score";
import { assessReliability } from "@/domain/score/reliability";
import { applyAttempt, emptyMastery } from "@/domain/mastery";
import type { UserAnswer } from "@/domain/chess/evaluate";
import type { ExerciseDef } from "@/content/schema";
import type { AttemptOutcome, SkillMastery } from "@/domain/types";

const T0 = "2026-08-20T10:00:00.000Z";
const index = buildIndex(COURSE);
const skillIndex = skillIndexForScore(index);

function respostaCerta(e: ExerciseDef): UserAnswer {
  const a = e.acceptedAnswer;
  if ("squares" in a) return { kind: "squares", squares: a.squares };
  if ("moves" in a) return { kind: "move", san: a.moves[0] };
  if ("color" in a) return { kind: "choice", choice: a.color };
  return { kind: "choice", choice: a.choice };
}

function respostaErrada(e: ExerciseDef): UserAnswer {
  const a = e.acceptedAnswer;
  if ("squares" in a) return { kind: "squares", squares: [] };
  if ("moves" in a) return { kind: "move", san: e.predictableErrors[0]?.answer ?? "Zz9" };
  if ("color" in a) return { kind: "choice", choice: a.color === "light" ? "dark" : "light" };
  return { kind: "choice", choice: "___resposta_claramente_errada___" };
}

describe("selectDiagnosticItems", () => {
  it("QUICK devolve exatamente 8 itens (o número que o onboarding promete)", () => {
    const quick = selectDiagnosticItems(index, "QUICK");
    expect(quick).toHaveLength(QUICK_ITEM_COUNT);
  });

  it("FULL cobre uma habilidade por item, sem repetir, e QUICK é subconjunto do que FULL cobre", () => {
    const full = selectDiagnosticItems(index, "FULL");
    const quick = selectDiagnosticItems(index, "QUICK");

    expect(full.length).toBeGreaterThan(0);
    expect(new Set(full.map((i) => i.skillId)).size).toBe(full.length);

    const skillsDoFull = new Set(full.map((i) => i.skillId));
    for (const item of quick) {
      expect(skillsDoFull.has(item.skillId)).toBe(true);
    }
  });

  it("é determinístico — a mesma bateria sempre, para a diferença vir das respostas", () => {
    const a = selectDiagnosticItems(index, "QUICK").map((i) => i.exercise.slug);
    const b = selectDiagnosticItems(index, "QUICK").map((i) => i.exercise.slug);
    expect(a).toEqual(b);

    const fullA = selectDiagnosticItems(index, "FULL").map((i) => i.exercise.slug);
    const fullB = selectDiagnosticItems(index, "FULL").map((i) => i.exercise.slug);
    expect(fullA).toEqual(fullB);
  });
});

describe("applyDiagnosticAnswer", () => {
  it("força fase MASTERY_TEST — ganho maior que sob a fase autoral do item", () => {
    const full = selectDiagnosticItems(index, "FULL");
    const item = full.find((i) => i.exercise.phase === "INDEPENDENT");
    expect(item, "nenhum item INDEPENDENT no pool — teste não pode provar o override").toBeDefined();
    if (!item) return;

    const resultado = applyDiagnosticAnswer({}, item, respostaCerta(item.exercise), 0, item.exercise.expectedSeconds * 1000, T0);
    const ganhoForcado = resultado.masteries[item.skillId]!.value;

    const outcomeAutoral: AttemptOutcome = {
      skillIds: item.exercise.skillIds,
      correct: true,
      hintsUsed: 0,
      elapsedMs: item.exercise.expectedSeconds * 1000,
      difficulty: item.exercise.difficulty,
      expectedSeconds: item.exercise.expectedSeconds,
      phase: item.exercise.phase,
      at: T0,
    };
    const ganhoAutoral = applyAttempt(emptyMastery(item.skillId), outcomeAutoral).value;

    expect(ganhoForcado).toBeGreaterThan(ganhoAutoral);
  });

  it("não toca XP, revisão, erro nem foco — só acumula domínio localmente", () => {
    const item = selectDiagnosticItems(index, "QUICK")[0]!;
    const resultado = applyDiagnosticAnswer({}, item, respostaErrada(item.exercise), 0, 10_000, T0);
    // A prova é estrutural: o tipo de retorno não tem xpEvents/reviewCards/errors/focus.
    expect(Object.keys(resultado)).toEqual(["masteries", "evaluation", "delta"]);
  });
});

describe("critério de aceite: duas pessoas com respostas diferentes recebem trilhas diferentes", () => {
  it("padrões de acerto opostos produzem domínio e Chess Score diferentes", () => {
    const itens = selectDiagnosticItems(index, "QUICK");
    expect(itens.length).toBeGreaterThanOrEqual(2);

    function rodar(acertaNosPares: boolean): Record<string, SkillMastery> {
      let masteries: Record<string, SkillMastery> = {};
      itens.forEach((item, i) => {
        const acerta = i % 2 === 0 ? acertaNosPares : !acertaNosPares;
        const resposta = acerta ? respostaCerta(item.exercise) : respostaErrada(item.exercise);
        masteries = applyDiagnosticAnswer(masteries, item, resposta, 0, item.exercise.expectedSeconds * 1000, T0).masteries;
      });
      return masteries;
    }

    const pessoaA = rodar(true);
    const pessoaB = rodar(false);

    expect(pessoaA).not.toEqual(pessoaB);

    const scoreA = computeChessScore(Object.values(pessoaA), skillIndex, T0);
    const scoreB = computeChessScore(Object.values(pessoaB), skillIndex, T0);
    expect(scoreA.total).not.toBe(scoreB.total);

    // Prova mais direta: pelo menos uma habilidade tem domínio numérico diferente.
    const skillIds = Object.keys(pessoaA);
    const algumaDivergiu = skillIds.some((id) => pessoaA[id]!.value !== pessoaB[id]!.value);
    expect(algumaDivergiu).toBe(true);
  });

  it("nível avançado sem partidas suficientes continua não confiável", () => {
    expect(assessReliability(500, 0).reliable).toBe(false);
    expect(assessReliability(500, 10).reliable).toBe(true);
    expect(assessReliability(300, 0).reliable).toBe(true);
  });
});

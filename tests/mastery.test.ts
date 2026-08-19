import { describe, expect, it } from "vitest";
import {
  applyAttempt,
  effectiveMastery,
  emptyMastery,
  masteryCeiling,
  stateFor,
} from "@/domain/mastery";
import type { AttemptOutcome } from "@/domain/types";

const T0 = "2026-01-01T10:00:00.000Z";

function attempt(over: Partial<AttemptOutcome> = {}): AttemptOutcome {
  return {
    skillIds: ["s1"],
    correct: true,
    hintsUsed: 0,
    elapsedMs: 20_000,
    difficulty: 5,
    expectedSeconds: 30,
    phase: "INDEPENDENT",
    at: T0,
    ...over,
  };
}

describe("teto por dificuldade", () => {
  it("exercícios fáceis não levam ao domínio total, por mais que se repita", () => {
    let m = emptyMastery("s1");
    for (let i = 0; i < 200; i++) {
      m = applyAttempt(m, attempt({ difficulty: 1, at: `2026-01-${String((i % 28) + 1).padStart(2, "0")}T10:00:00.000Z` }));
    }
    expect(m.value).toBeLessThanOrEqual(masteryCeiling(1));
    expect(m.value).toBeLessThan(50);
    expect(m.state).not.toBe("MASTERED");
  });

  it("exercícios difíceis permitem chegar ao topo", () => {
    let m = emptyMastery("s1");
    for (let i = 0; i < 40; i++) m = applyAttempt(m, attempt({ difficulty: 10 }));
    expect(m.value).toBeGreaterThan(90);
  });
});

describe("dicas e tempo", () => {
  it("acerto com três dicas rende muito menos que acerto sem dica", () => {
    const semDica = applyAttempt(emptyMastery("s1"), attempt({ hintsUsed: 0 }));
    const comDicas = applyAttempt(emptyMastery("s1"), attempt({ hintsUsed: 3 }));
    expect(comDicas.value).toBeLessThan(semDica.value / 3);
  });

  it("resposta instantânea em item difícil não recebe crédito cheio", () => {
    const normal = applyAttempt(emptyMastery("s1"), attempt({ elapsedMs: 20_000 }));
    const chute = applyAttempt(emptyMastery("s1"), attempt({ elapsedMs: 500 }));
    expect(chute.value).toBeLessThan(normal.value);
  });

  it("fase guiada vale menos que prova de domínio", () => {
    const guiado = applyAttempt(emptyMastery("s1"), attempt({ phase: "GUIDED" }));
    const prova = applyAttempt(emptyMastery("s1"), attempt({ phase: "MASTERY_TEST" }));
    expect(guiado.value).toBeLessThan(prova.value);
  });
});

describe("decaimento de confiança", () => {
  it("domínio efetivo cai com o tempo sem reavaliação, mas não zera", () => {
    let m = emptyMastery("s1");
    for (let i = 0; i < 20; i++) m = applyAttempt(m, attempt({ difficulty: 8 }));

    const noDia = effectiveMastery(m, T0);
    const seisMeses = effectiveMastery(m, "2026-07-01T10:00:00.000Z");

    expect(seisMeses).toBeLessThan(noDia);
    expect(seisMeses).toBeGreaterThanOrEqual(Math.round(m.value * 0.6));
  });
});

describe("erro", () => {
  it("errar reduz o valor e zera a sequência de acertos", () => {
    let m = emptyMastery("s1");
    for (let i = 0; i < 5; i++) m = applyAttempt(m, attempt({ difficulty: 6 }));
    const antes = m.value;

    m = applyAttempt(m, attempt({ correct: false }));
    expect(m.value).toBeLessThan(antes);
    expect(m.correctStreak).toBe(0);
  });
});

describe("estados", () => {
  it("mapeia os seis estados nas faixas corretas", () => {
    expect(stateFor(0)).toBe("UNKNOWN");
    expect(stateFor(10)).toBe("INTRODUCED");
    expect(stateFor(40)).toBe("DEVELOPING");
    expect(stateFor(65)).toBe("COMPETENT");
    expect(stateFor(85)).toBe("CONSOLIDATED");
    expect(stateFor(97)).toBe("MASTERED");
  });
});

import { describe, expect, it } from "vitest";
import { DEFAULT_WEIGHTS, computeChessScore, scoreBand } from "@/domain/score/chess-score";
import { countTransferredSkills } from "@/domain/score/north-star";
import { applyAttempt, emptyMastery } from "@/domain/mastery";
import { newCard, review } from "@/domain/srs";
import { COMPETENCIES, type SkillMastery } from "@/domain/types";

const T0 = "2026-01-01T10:00:00.000Z";

const index = [
  { skillId: "regra1", competency: "rules" as const },
  { skillId: "regra2", competency: "rules" as const },
  { skillId: "tat1", competency: "tactics" as const },
  { skillId: "fin1", competency: "endgame" as const },
];

function masteryAt(skillId: string, value: number): SkillMastery {
  return { ...emptyMastery(skillId), value, confidence: 1, lastAssessedAt: T0 };
}

describe("Chess Score", () => {
  it("vai de 0 a 1000 e começa em 0 sem nenhuma avaliação", () => {
    const score = computeChessScore([], index, T0);
    expect(score.total).toBe(0);
    for (const c of COMPETENCIES) expect(score.components[c]).toBe(0);
  });

  it("os pesos padrão do spec somam 1", () => {
    const soma = COMPETENCIES.reduce((acc, c) => acc + DEFAULT_WEIGHTS[c], 0);
    expect(soma).toBeCloseTo(1, 10);
  });

  it("competência não avaliada vale 0, não a média — não inventamos dado", () => {
    const score = computeChessScore([masteryAt("tat1", 100)], index, T0);
    expect(score.components.tactics).toBe(100);
    expect(score.components.strategy).toBe(0);
    expect(score.coverage.strategy).toBe(0);
  });

  it("dominar uma habilidade de uma competência com duas não dá 100 nessa competência", () => {
    const score = computeChessScore([masteryAt("regra1", 100)], index, T0);
    expect(score.components.rules).toBe(50);
  });

  it("domínio máximo em tudo dá 1000", () => {
    const score = computeChessScore(
      index.map((s) => masteryAt(s.skillId, 100)),
      index,
      T0,
    );
    // Só existem habilidades em rules, tactics e endgame no índice de teste.
    const esperado = Math.round(
      (DEFAULT_WEIGHTS.rules + DEFAULT_WEIGHTS.tactics + DEFAULT_WEIGHTS.endgame) * 100 * 10,
    );
    expect(score.total).toBe(esperado);
  });

  it("aponta o gargalo pelo ganho ponderado disponível, não pelo menor valor bruto", () => {
    // Aberturas (peso 5%) está em 0, mas cálculo (peso 20%) também: cálculo pesa mais.
    const score = computeChessScore([masteryAt("regra1", 100), masteryAt("regra2", 100)], index, T0);
    expect(score.bottleneck).toBe("tactics"); // 20% e zerada
    expect(score.strength).toBe("rules");
  });

  it("XP não entra no cálculo: o tipo não tem por onde recebê-lo", () => {
    const comEsforco = computeChessScore([masteryAt("tat1", 40)], index, T0);
    const semEsforco = computeChessScore([masteryAt("tat1", 40)], index, T0);
    expect(comEsforco.total).toBe(semEsforco.total);
  });

  it("confiança decaída derruba o score sem que nada seja reavaliado", () => {
    let m = emptyMastery("tat1");
    for (let i = 0; i < 20; i++) {
      m = applyAttempt(m, {
        skillIds: ["tat1"],
        correct: true,
        hintsUsed: 0,
        elapsedMs: 20_000,
        difficulty: 9,
        expectedSeconds: 30,
        phase: "INDEPENDENT",
        at: T0,
      });
    }
    const agora = computeChessScore([m], index, T0).total;
    const depois = computeChessScore([m], index, "2026-08-01T10:00:00.000Z").total;
    expect(depois).toBeLessThan(agora);
  });
});

describe("faixa indicativa", () => {
  it("mapeia o score para a liga correspondente", () => {
    expect(scoreBand(0).league).toBe("Recruta");
    expect(scoreBand(300).league).toBe("Tático");
    expect(scoreBand(950).league).toBe("Candidato a título");
  });
});

describe("North Star", () => {
  const dominada = masteryAt("tat1", 92);
  const emProgresso = masteryAt("fin1", 55);

  it("domínio alto sem aplicação em partida NÃO conta como transferência", () => {
    const r = countTransferredSkills({
      masteries: [dominada, emProgresso],
      reviewCards: [],
      appliedInGameSkillIds: [],
    });
    expect(r.count).toBe(0);
    expect(r.pendingTransfer).toEqual(["tat1"]);
  });

  it("conta quando a habilidade dominada foi aplicada em partida", () => {
    const r = countTransferredSkills({
      masteries: [dominada, emProgresso],
      reviewCards: [],
      appliedInGameSkillIds: ["tat1"],
    });
    expect(r.count).toBe(1);
    expect(r.skillIds).toEqual(["tat1"]);
  });

  it("regressão na revisão seguinte desqualifica a transferência", () => {
    const card = review(newCard("c", "SKILL", { skillId: "tat1" }, T0), {
      grade: 1,
      usedHints: false,
      at: T0,
    }).card;

    const r = countTransferredSkills({
      masteries: [dominada],
      reviewCards: [card],
      appliedInGameSkillIds: ["tat1"],
    });
    expect(r.count).toBe(0);
  });
});

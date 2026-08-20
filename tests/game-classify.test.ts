import { describe, expect, it } from "vitest";
import { classifyGameError, SKIPPED_CONFIDENCE, type HumanMomentReport } from "@/domain/game/classify";
import type { CriticalMomentCandidate } from "@/domain/game/criticalMoments";
import { MIN_CONFIDENCE_FOR_BOTTLENECK } from "@/domain/errors/taxonomy";

const NOW = "2026-08-20T12:00:00.000Z";

function moment(partial: Partial<CriticalMomentCandidate> = {}): CriticalMomentCandidate {
  return {
    ply: 18,
    fen: "8/8/8/8/8/8/8/8 w - - 0 1",
    playedSan: "Nc3",
    bestSan: "Qxh5+",
    cpBefore: 250,
    cpAfter: -100,
    ...partial,
  };
}

function human(partial: Partial<HumanMomentReport> = {}): HumanMomentReport {
  return { candidates: null, evalChoice: null, timeSec: null, skipped: false, ...partial };
}

describe("classifyGameError", () => {
  it("pulado: confiança sempre abaixo do limiar do gargalo", () => {
    const c = classifyGameError(moment(), human({ skipped: true }), NOW);
    expect(c.confidence).toBe(SKIPPED_CONFIDENCE);
    expect(c.confidence).toBeLessThan(MIN_CONFIDENCE_FOR_BOTTLENECK);
    expect(c.cause).toBe("TACTIC"); // bestSan "Qxh5+" tem cara de tática
    expect(c.ply).toBe(18);
    expect(c.at).toBe(NOW);
  });

  it("pulado numa posição não-tática cai em EVALUATION", () => {
    const c = classifyGameError(moment({ bestSan: "Nf3" }), human({ skipped: true }), NOW);
    expect(c.cause).toBe("EVALUATION");
  });

  it("candidatos não mencionam o melhor lance → CANDIDATE_IGNORED", () => {
    const c = classifyGameError(
      moment(),
      human({ candidates: "Pensei em Nc3 e Bd3" }),
      NOW,
    );
    expect(c.cause).toBe("CANDIDATE_IGNORED");
    expect(c.confidence).toBe(0.7);
  });

  it("avaliação declarada contradiz o sinal real → EVALUATION", () => {
    const c = classifyGameError(
      moment(),
      human({ candidates: "Considerei Qxh5 e Nc3", evalChoice: "GANHANDO" }),
      NOW,
    );
    expect(c.cause).toBe("EVALUATION");
    expect(c.confidence).toBe(0.75);
  });

  it("perda grande num lance de cara tática → TACTIC", () => {
    const c = classifyGameError(
      moment({ cpBefore: 250, cpAfter: -100, bestSan: "Qxh5+" }), // swing 350
      human({ candidates: "Considerei Qxh5 e Nc3", evalChoice: "PIOR" }),
      NOW,
    );
    expect(c.cause).toBe("TACTIC");
    expect(c.confidence).toBe(0.7);
  });

  it("pouco tempo numa posição não-tática mas difícil → CALCULATION_STOPPED", () => {
    const c = classifyGameError(
      moment({ bestSan: "Nf3", cpBefore: 200, cpAfter: 0 }), // swing 200
      human({ candidates: "Pensei em Nf3 e Bc4", timeSec: 10 }),
      NOW,
    );
    expect(c.cause).toBe("CALCULATION_STOPPED");
    expect(c.confidence).toBe(0.55);
  });

  it("default: CALCULATION_STOPPED com confiança 0.5 quando nada mais se aplica", () => {
    const c = classifyGameError(
      moment({ bestSan: "Nf3", cpBefore: 200, cpAfter: 0 }),
      human({ candidates: "Pensei em Nf3 e Bc4", timeSec: 30 }),
      NOW,
    );
    expect(c.cause).toBe("CALCULATION_STOPPED");
    expect(c.confidence).toBe(0.5);
  });
});

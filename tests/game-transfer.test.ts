import { describe, expect, it } from "vitest";
import { detectTransfers, type TransferMoment } from "@/domain/game/transfer";
import { emptyMastery } from "@/domain/mastery";
import type { SkillMastery } from "@/domain/types";

function mastered(skillId: string, value = 85): SkillMastery {
  return { ...emptyMastery(skillId), value, confidence: 1, lastAssessedAt: "2026-08-01T00:00:00.000Z" };
}

function moment(partial: Partial<TransferMoment>): TransferMoment {
  return {
    ply: 10,
    fen: "8/8/8/8/8/8/8/8 w - - 0 1",
    playedSan: "Nf3",
    bestSan: "Nf3",
    cpBefore: 50,
    cpAfter: 50,
    skillId: "r3.tatica",
    ...partial,
  };
}

describe("detectTransfers", () => {
  it("lance certo + domínio alto + habilidade conhecida → conta como transferência", () => {
    const masteries = new Map([["r3.tatica", mastered("r3.tatica", 85)]]);
    const r = detectTransfers({ moments: [moment({})], masteries });
    expect(r.skillIds).toEqual(["r3.tatica"]);
  });

  it("lance errado, mesmo com domínio alto, não conta", () => {
    const masteries = new Map([["r3.tatica", mastered("r3.tatica", 90)]]);
    const r = detectTransfers({
      moments: [moment({ playedSan: "Bc4", bestSan: "Nf3" })],
      masteries,
    });
    expect(r.skillIds).toEqual([]);
  });

  it("domínio abaixo do limiar não conta mesmo acertando o lance", () => {
    const masteries = new Map([["r3.tatica", mastered("r3.tatica", 50)]]);
    const r = detectTransfers({ moments: [moment({})], masteries });
    expect(r.skillIds).toEqual([]);
  });

  it("sem skillId conhecido não conta", () => {
    const masteries = new Map([["r3.tatica", mastered("r3.tatica", 90)]]);
    const r = detectTransfers({ moments: [moment({ skillId: undefined })], masteries });
    expect(r.skillIds).toEqual([]);
  });

  it("deduplica habilidades repetidas em vários momentos", () => {
    const masteries = new Map([["r3.tatica", mastered("r3.tatica", 90)]]);
    const r = detectTransfers({
      moments: [moment({ ply: 10 }), moment({ ply: 20 })],
      masteries,
    });
    expect(r.skillIds).toEqual(["r3.tatica"]);
  });
});

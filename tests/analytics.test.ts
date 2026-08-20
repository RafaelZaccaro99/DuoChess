/**
 * A North Star agregada por usuário — a parte pura de analytics-server.ts,
 * testável sem banco (A8).
 */

import { describe, expect, it } from "vitest";
import { countTransferredSkillsAcrossUsers } from "@/domain/score/north-star";
import { emptyMastery } from "@/domain/mastery";
import type { SkillMastery } from "@/domain/types";

function masteryAt(skillId: string, value: number, appliedInGame = 1): SkillMastery {
  return { ...emptyMastery(skillId), value, confidence: 1, appliedInGame };
}

describe("countTransferredSkillsAcrossUsers", () => {
  it("soma transferências de vários usuários sem misturar habilidades entre eles", () => {
    const r = countTransferredSkillsAcrossUsers({
      masteriesByUser: new Map([
        ["u1", [masteryAt("sk1", 90)]],
        ["u2", [masteryAt("sk1", 90), masteryAt("sk2", 85)]],
      ]),
      reviewsByUser: new Map(),
    });

    expect(r.count).toBe(3);
    expect(r.usersCounted).toBe(2);
    expect(r.pairs).toEqual(
      expect.arrayContaining([
        { userId: "u1", skillId: "sk1" },
        { userId: "u2", skillId: "sk1" },
        { userId: "u2", skillId: "sk2" },
      ]),
    );
  });

  it("não conta domínio abaixo do limiar nem quem ainda não aplicou em partida", () => {
    const r = countTransferredSkillsAcrossUsers({
      masteriesByUser: new Map([["u1", [masteryAt("sk1", 79), masteryAt("sk2", 90, 0)]]]),
      reviewsByUser: new Map(),
    });
    expect(r.count).toBe(0);
  });

  it("cartão de revisão de outro usuário não regride a transferência de quem não é dele", () => {
    const r = countTransferredSkillsAcrossUsers({
      masteriesByUser: new Map([["u1", [masteryAt("sk1", 90)]]]),
      reviewsByUser: new Map([
        [
          "u2",
          [
            {
              id: "u2:sk:sk1",
              scope: "SKILL",
              skillId: "sk1",
              exerciseId: null,
              stability: 1,
              difficulty: 5,
              reps: 1,
              lapses: 0,
              lastGrade: 1,
              usedHints: false,
              triggeredMicrolesson: false,
              lastReviewedAt: null,
              dueAt: new Date().toISOString(),
            },
          ],
        ],
      ]),
    });
    expect(r.count).toBe(1);
  });

  it("usuário sem nenhuma habilidade dominada não aparece na contagem", () => {
    const r = countTransferredSkillsAcrossUsers({
      masteriesByUser: new Map([["u1", []]]),
      reviewsByUser: new Map(),
    });
    expect(r.usersCounted).toBe(1);
    expect(r.count).toBe(0);
  });
});

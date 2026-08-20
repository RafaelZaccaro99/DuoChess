import { describe, expect, it } from "vitest";
import { computePlayerDNA } from "@/domain/game/dna";
import { detectBottleneck } from "@/domain/adaptive";
import { recurrenceByCause } from "@/domain/errors/taxonomy";
import type { ClassifiedError } from "@/domain/errors/taxonomy";

const NOW = "2026-08-20T12:00:00.000Z";

function erros(cause: ClassifiedError["cause"], n: number): ClassifiedError[] {
  return Array.from({ length: n }, (_, i) => ({
    cause,
    severity: "SERIOUS" as const,
    confidence: 0.8,
    explanation: "erro de partida",
    at: new Date(new Date(NOW).getTime() - i * 86_400_000).toISOString(),
  }));
}

describe("computePlayerDNA", () => {
  it("usa a mesma conta de recorrência do motor adaptativo — nunca diverge do gargalo", () => {
    const errors = [...erros("TACTIC", 4), ...erros("CLOCK", 2)];
    const dna = computePlayerDNA({ errors, transferredSkillIdsPerGame: [], nowIso: NOW });
    const gargalo = detectBottleneck(errors, NOW);
    const viaRecurrence = recurrenceByCause(errors, NOW);

    expect(dna.topCauses[0]).toEqual({ cause: "TACTIC", count: 4 });
    expect(dna.topCauses[0]!.count).toBe(gargalo?.count);
    expect(dna.topCauses).toEqual(
      [...viaRecurrence.entries()].map(([cause, count]) => ({ cause, count })).sort((a, b) => b.count - a.count),
    );
  });

  it("classificações de baixa confiança não aparecem — mesmo filtro do gargalo", () => {
    const errors = erros("TACTIC", 5).map((e) => ({ ...e, confidence: 0.3 }));
    const dna = computePlayerDNA({ errors, transferredSkillIdsPerGame: [], nowIso: NOW });
    expect(dna.topCauses).toHaveLength(0);
  });

  it("conta habilidades transferidas sem duplicar entre partidas", () => {
    const dna = computePlayerDNA({
      errors: [],
      transferredSkillIdsPerGame: [["r3.tatica"], ["r3.tatica", "r4.finais"]],
      nowIso: NOW,
    });
    expect(dna.skillsTransferred).toBe(2);
    expect(dna.gamesAnalyzed).toBe(2);
  });
});

import { describe, expect, it } from "vitest";
import { COURSE } from "@/content";
import { buildIndex } from "@/domain/curriculum";
import { DEFAULT_ADAPTIVE, detectBottleneck, planSession } from "@/domain/adaptive";
import { emptyMastery } from "@/domain/mastery";
import { newCard } from "@/domain/srs";
import type { ClassifiedError } from "@/domain/errors/taxonomy";
import type { SkillMastery } from "@/domain/types";

const T0 = "2026-02-01T10:00:00.000Z";
const index = buildIndex(COURSE);
const focoCheio = { value: 100, lastUpdatedAt: T0 };

function erros(cause: ClassifiedError["cause"], n: number, confidence = 0.9): ClassifiedError[] {
  return Array.from({ length: n }, (_, i) => ({
    cause,
    severity: "SERIOUS" as const,
    confidence,
    explanation: "erro de teste",
    at: new Date(new Date(T0).getTime() - i * 86_400_000).toISOString(),
  }));
}

const base = {
  index,
  masteries: new Map<string, SkillMastery>([["r1.localizar", { ...emptyMastery("r1.localizar"), value: 70, confidence: 1, lastAssessedAt: T0 }]]),
  reviewCards: [],
  errors: [] as ClassifiedError[],
  focus: focoCheio,
  nowIso: T0,
};

describe("detecção de gargalo", () => {
  it("ignora classificações de baixa confiança — diagnóstico ruim não sequestra a trilha", () => {
    expect(detectBottleneck(erros("TACTIC", 5, 0.3), T0)).toBeNull();
  });

  it("escolhe a causa mais reincidente na janela", () => {
    const mistura = [...erros("TACTIC", 4), ...erros("CLOCK", 2)];
    expect(detectBottleneck(mistura, T0)).toMatchObject({ cause: "TACTIC", count: 4 });
  });

  it("ignora erros fora da janela de 14 dias", () => {
    const antigos: ClassifiedError[] = erros("TACTIC", 5).map((e) => ({
      ...e,
      at: "2025-01-01T10:00:00.000Z",
    }));
    expect(detectBottleneck(antigos, T0)).toBeNull();
  });
});

describe("montagem da sessão", () => {
  it("respeita a mistura configurada quando não há bloqueio", () => {
    const plan = planSession({ ...base, reviewCards: [newCard("c1", "SKILL", { skillId: "r1.localizar" }, T0)] });
    expect(plan.advancementBlocked).toBe(false);
    expect(plan.slots.length).toBeLessThanOrEqual(DEFAULT_ADAPTIVE.sessionSize);
    expect(plan.slots.some((s) => s.kind === "NEW")).toBe(true);
    expect(plan.slots.some((s) => s.kind === "REVIEW")).toBe(true);
  });

  it("todo item traz a razão de estar na sessão", () => {
    const plan = planSession(base);
    for (const slot of plan.slots) expect(slot.rationale.length).toBeGreaterThan(10);
  });
});

describe("o interruptor de avanço", () => {
  it("reincidência acima do limiar interrompe conteúdo novo", () => {
    const plan = planSession({ ...base, errors: erros("TACTIC", 3) });
    expect(plan.advancementBlocked).toBe(true);
    expect(plan.slots.some((s) => s.kind === "NEW")).toBe(false);
    expect(plan.blockReason).toContain("Tática");
    expect(plan.bottleneckCause).toBe("TACTIC");
  });

  it("duas reincidências ainda não bloqueiam — o limiar é três", () => {
    expect(planSession({ ...base, errors: erros("TACTIC", 2) }).advancementBlocked).toBe(false);
  });

  it("Foco baixo também interrompe, com outra explicação", () => {
    const plan = planSession({ ...base, focus: { value: 15, lastUpdatedAt: T0 } });
    expect(plan.advancementBlocked).toBe(true);
    expect(plan.blockReason).toContain("Foco");
    expect(plan.slots.some((s) => s.kind === "NEW")).toBe(false);
  });

  it("o espaço do conteúdo novo vai para o gargalo, não some", () => {
    const semBloqueio = planSession(base);
    const comBloqueio = planSession({ ...base, errors: erros("RULE", 4) });
    const gargalos = (p: typeof semBloqueio) => p.slots.filter((s) => s.kind === "BOTTLENECK").length;
    expect(gargalos(comBloqueio)).toBeGreaterThanOrEqual(gargalos(semBloqueio));
  });
});

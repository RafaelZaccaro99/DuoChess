import { describe, expect, it } from "vitest";
import { COURSE } from "@/content";
import { buildIndex, nextLesson, skillStatus, unitProgress } from "@/domain/curriculum";
import { emptyMastery } from "@/domain/mastery";
import type { SkillMastery } from "@/domain/types";

const T0 = "2026-01-01T10:00:00.000Z";
const index = buildIndex(COURSE);

function masteries(entries: Record<string, number>): Map<string, SkillMastery> {
  return new Map(
    Object.entries(entries).map(([id, value]) => [
      id,
      { ...emptyMastery(id), value, confidence: 1, lastAssessedAt: T0 },
    ]),
  );
}

describe("índice do currículo", () => {
  it("carrega as oito ligas do spec", () => {
    expect(COURSE.leagues).toHaveLength(8);
    expect(COURSE.leagues.map((l) => l.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("a Liga Recruta tem as seis unidades planejadas", () => {
    const recruta = COURSE.leagues.find((l) => l.id === "recruta")!;
    expect(recruta.units.map((u) => u.id)).toEqual(["r1", "r2", "r3", "r4", "r5", "r6"]);
  });

  it("indexa habilidades, lições e a relação entre elas", () => {
    expect(index.skills.size).toBe(18);
    expect(index.lessonsBySkill.get("r4.tres-respostas")).toContain("r4.l1");
  });
});

describe("grafo de dependências", () => {
  it("habilidade sem pré-requisito satisfeito fica bloqueada", () => {
    const status = skillStatus(index, masteries({}), T0);
    expect(status.get("r1.localizar")!.availability).toBe("AVAILABLE");
    expect(status.get("r5.mate-em-1")!.availability).toBe("LOCKED");
    expect(status.get("r5.mate-em-1")!.missingPrerequisites).toContain("r4.tres-respostas");
  });

  it("desbloqueia assim que o pré-requisito atinge o mínimo — quem já sabe, pula", () => {
    const status = skillStatus(
      index,
      masteries({
        "r1.localizar": 90,
        "r2.cavalo": 90,
        "r2.linhas": 90,
        "r2.casas-atacadas": 90,
        "r4.reconhecer": 90,
        "r4.tres-respostas": 90,
      }),
      T0,
    );
    expect(status.get("r5.mate-em-1")!.availability).toBe("AVAILABLE");
  });

  it("não desbloqueia com pré-requisito abaixo do mínimo", () => {
    const status = skillStatus(index, masteries({ "r1.localizar": 20 }), T0);
    expect(status.get("r2.cavalo")!.availability).toBe("LOCKED");
  });
});

describe("progresso por unidade", () => {
  it("R1 começa disponível e R5 começa bloqueada", () => {
    const progress = unitProgress(index, masteries({}), T0);
    const byId = new Map(progress.map((p) => [p.unitId, p]));
    expect(byId.get("r1")!.availability).toBe("AVAILABLE");
    expect(byId.get("r5")!.availability).toBe("LOCKED");
  });

  it("conta habilidades dominadas dentro da unidade", () => {
    const progress = unitProgress(
      index,
      masteries({ "r1.localizar": 95, "r1.cor-casa": 85, "r1.orientacao": 30 }),
      T0,
    );
    const r1 = progress.find((p) => p.unitId === "r1")!;
    expect(r1.skillCount).toBe(3);
    expect(r1.masteredCount).toBe(2);
    expect(r1.availability).toBe("IN_PROGRESS");
  });
});

describe("próxima lição", () => {
  it("aponta a fronteira mais fraca, não a primeira da lista", () => {
    const lesson = nextLesson(index, masteries({}), T0);
    expect(lesson).toBe("r1.l1");
  });

  it("avança quando a primeira unidade está dominada", () => {
    const lesson = nextLesson(
      index,
      masteries({ "r1.localizar": 95, "r1.cor-casa": 95, "r1.orientacao": 95 }),
      T0,
    );
    expect(lesson).not.toBe("r1.l1");
    expect(lesson).toMatch(/^r2\./);
  });
});

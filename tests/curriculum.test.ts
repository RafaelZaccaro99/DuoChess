import { describe, expect, it } from "vitest";
import { COURSE } from "@/content";
import { buildIndex, nextLesson, nextStep, skillStatus, unitProgress } from "@/domain/curriculum";
import { emptyMastery, masteryCeiling } from "@/domain/mastery";
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
    expect(index.skills.size).toBe(22);
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

describe("o currículo publicado é atravessável", () => {
  /**
   * Regressão de um bug real: o teto de domínio por dificuldade ficava ABAIXO do
   * mínimo exigido pela habilidade seguinte, então a unidade seguinte nunca
   * desbloqueava. O usuário acertava tudo e continuava preso, sem explicação.
   *
   * Este teste calcula, para cada habilidade, o maior domínio alcançável com os
   * exercícios publicados, e confere contra o que o grafo exige.
   */
  const maxAchievable = new Map<string, number>();
  for (const league of COURSE.leagues) {
    for (const unit of league.units) {
      for (const lesson of unit.lessons) {
        for (const exercise of lesson.exercises) {
          for (const skillId of exercise.skillIds) {
            const ceiling = masteryCeiling(exercise.difficulty);
            maxAchievable.set(skillId, Math.max(maxAchievable.get(skillId) ?? 0, ceiling));
          }
        }
      }
    }
  }

  it("toda habilidade publicada tem ao menos um exercício", () => {
    for (const skill of index.skills.values()) {
      if (COURSE.leagues.find((l) => l.id === skill.leagueId)!.units.length === 0) continue;
      expect(maxAchievable.get(skill.id), `${skill.id} não tem exercício`).toBeDefined();
    }
  });

  it("todo pré-requisito é alcançável com o conteúdo publicado", () => {
    for (const skill of index.skills.values()) {
      for (const prerequisiteId of skill.dependsOn) {
        const achievable = maxAchievable.get(prerequisiteId);
        if (achievable === undefined) continue;
        expect(
          achievable,
          `${skill.id} exige ${skill.minPrerequisiteMastery} em ${prerequisiteId}, mas o conteúdo publicado só permite chegar a ${achievable}`,
        ).toBeGreaterThanOrEqual(skill.minPrerequisiteMastery);
      }
    }
  });

  it("cada unidade publicada tem uma prova de domínio", () => {
    for (const league of COURSE.leagues) {
      for (const unit of league.units) {
        const phases = unit.lessons.flatMap((l) => l.exercises.map((e) => e.phase));
        expect(phases, `unidade ${unit.id} sem prova de domínio`).toContain("MASTERY_TEST");
      }
    }
  });
});

describe("bloqueio de unidade é por dependência EXTERNA", () => {
  /**
   * Regressão: a unidade abria quando qualquer habilidade dela estava livre.
   * R6 (regras especiais) abria só porque notação depende de R1 — e o aluno caía
   * nos exercícios de roque sem ter passado por xeque.
   */
  it("R6 continua bloqueada mesmo com R1 dominada, porque roque depende de R4", () => {
    const progress = unitProgress(
      index,
      masteries({ "r1.localizar": 95, "r1.cor-casa": 95, "r1.orientacao": 95 }),
      T0,
    );
    const r6 = progress.find((p) => p.unitId === "r6")!;
    expect(r6.availability).toBe("LOCKED");
    expect(r6.missingPrerequisiteUnits).toContain("r4");
  });

  it("dependência interna à unidade não bloqueia a unidade", () => {
    // r1.cor-casa depende de r1.localizar, ambas em R1.
    const progress = unitProgress(index, masteries({}), T0);
    expect(progress.find((p) => p.unitId === "r1")!.availability).toBe("AVAILABLE");
  });
});

describe("próximo passo é sempre uma ação possível", () => {
  /**
   * Regressão: o resumo dizia "faça a primeira lição de Tática" enquanto Tática
   * estava trancada atrás de R2 e R3. Diagnóstico correto, recomendação sem saída.
   */
  it("nunca aponta para uma lição de unidade bloqueada", () => {
    const cenarios: Array<Record<string, number>> = [
      {},
      { "r1.localizar": 95, "r1.cor-casa": 95, "r1.orientacao": 95 },
      { "r1.localizar": 95, "r1.cor-casa": 95, "r1.orientacao": 95, "r2.cavalo": 90, "r2.linhas": 90, "r2.casas-atacadas": 90 },
    ];

    for (const cenario of cenarios) {
      const m = masteries(cenario);
      const passo = nextStep(index, m, T0);
      expect(passo, `sem próximo passo em ${JSON.stringify(cenario)}`).not.toBeNull();

      const unidades = new Map(unitProgress(index, m, T0).map((u) => [u.unitId, u]));
      expect(
        unidades.get(passo!.unitId)!.availability,
        `próximo passo aponta para ${passo!.unitId}, que está bloqueada`,
      ).not.toBe("LOCKED");
    }
  });

  it("avança conforme o aluno domina as unidades anteriores", () => {
    expect(nextStep(index, masteries({}), T0)!.unitId).toBe("r1");
    expect(
      nextStep(index, masteries({ "r1.localizar": 95, "r1.cor-casa": 95, "r1.orientacao": 95 }), T0)!
        .unitId,
    ).toBe("r2");
  });
});

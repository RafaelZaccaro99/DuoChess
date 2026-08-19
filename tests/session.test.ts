/**
 * Jornada completa no motor de sessão.
 *
 * Exercita a mesma sequência que um usuário real faz, e verifica as promessas do
 * produto de ponta a ponta: XP e domínio se movem separadamente, o grafo
 * realmente destrava, e a fila de revisão se enche sozinha.
 */

import { describe, expect, it } from "vitest";
import { COURSE } from "@/content";
import { buildIndex, skillIndexForScore, skillStatus, unitProgress } from "@/domain/curriculum";
import {
  emptyProgress,
  masteryMap,
  masteryList,
  recordAttempt,
  totalXP,
  type ProgressState,
} from "@/domain/session";
import { computeChessScore } from "@/domain/score/chess-score";
import { dueQueue } from "@/domain/srs";
import type { ExerciseDef } from "@/content/schema";

const index = buildIndex(COURSE);
const SKILL_INDEX = skillIndexForScore(index);

function exercisesOf(unitId: string): ExerciseDef[] {
  return index.units.get(unitId)!.lessons.flatMap((l) => l.exercises);
}

function correctAnswer(exercise: ExerciseDef) {
  const answer = exercise.acceptedAnswer;
  if ("squares" in answer) return { kind: "squares", squares: answer.squares } as const;
  if ("moves" in answer) return { kind: "move", san: answer.moves[0] } as const;
  if ("color" in answer) return { kind: "choice", choice: answer.color } as const;
  return { kind: "choice", choice: answer.choice } as const;
}

/** Roda a unidade inteira acertando tudo, `passes` vezes. */
function runUnit(state: ProgressState, unitId: string, passes: number, startDay: number): ProgressState {
  let current = state;
  let day = startDay;

  for (let pass = 0; pass < passes; pass++) {
    for (const exercise of exercisesOf(unitId)) {
      const at = new Date(Date.UTC(2026, 0, 1 + day, 10, 0, 0)).toISOString();
      current = recordAttempt(current, {
        exercise,
        answer: correctAnswer(exercise),
        hintsUsed: 0,
        elapsedMs: exercise.expectedSeconds * 700,
        at,
      }).state;
    }
    day += 1;
  }
  return current;
}

describe("jornada do usuário", () => {
  it("acertar toda a unidade R1 destrava a unidade R2", () => {
    const inicial = emptyProgress("2026-01-01T09:00:00.000Z");

    const antes = skillStatus(index, masteryMap(inicial), "2026-01-01T09:00:00.000Z");
    expect(antes.get("r2.cavalo")!.availability).toBe("LOCKED");

    const depois = runUnit(inicial, "r1", 3, 0);
    const status = skillStatus(index, masteryMap(depois), depois.updatedAt);

    expect(
      status.get("r2.cavalo")!.availability,
      `r1.localizar chegou a ${status.get("r1.localizar")!.mastery}`,
    ).not.toBe("LOCKED");
  });

  it("a cadeia inteira da Liga Recruta é atravessável", () => {
    let state = emptyProgress("2026-01-01T09:00:00.000Z");
    let day = 0;

    // O bloqueio vale por UNIDADE: dentro dela, a ordem das fases é que manda.
    for (const unitId of ["r1", "r2", "r3", "r4", "r5", "r6"]) {
      const progress = unitProgress(index, masteryMap(state), state.updatedAt);
      const unit = progress.find((u) => u.unitId === unitId)!;

      expect(
        unit.availability,
        `${unitId} ainda bloqueada ao chegar a vez dela (requer ${unit.missingPrerequisiteUnits.join(", ")})`,
      ).not.toBe("LOCKED");

      state = runUnit(state, unitId, 3, day);
      day += 3;
    }
  });
});

describe("as duas medidas nunca se confundem", () => {
  it("acertar exercícios fáceis acumula XP sem mover o Chess Score na mesma proporção", () => {
    const facil = exercisesOf("r1")[0]!; // dificuldade 2
    let state = emptyProgress("2026-01-01T09:00:00.000Z");

    for (let i = 0; i < 30; i++) {
      state = recordAttempt(state, {
        exercise: facil,
        answer: correctAnswer(facil),
        hintsUsed: 0,
        elapsedMs: 10_000,
        at: new Date(Date.UTC(2026, 0, 2 + i, 10, 0, 0)).toISOString(),
      }).state;
    }

    expect(totalXP(state)).toBeGreaterThan(100);

    const score = computeChessScore(masteryList(state), SKILL_INDEX, state.updatedAt);
    // 30 acertos num item fácil não podem produzir competência alta.
    expect(score.components.rules).toBeLessThan(20);
    expect(score.total).toBeLessThan(60);
  });

  it("usar as três dicas gera o mesmo XP e muito menos domínio", () => {
    const exercise = exercisesOf("r1")[1]!;
    const base = emptyProgress("2026-01-01T09:00:00.000Z");
    const input = {
      exercise,
      answer: correctAnswer(exercise),
      elapsedMs: exercise.expectedSeconds * 800,
      at: "2026-01-02T10:00:00.000Z",
    };

    const semDica = recordAttempt(base, { ...input, hintsUsed: 0 });
    const comDicas = recordAttempt(base, { ...input, hintsUsed: 3 });

    expect(comDicas.effects.xpAwarded).toBe(semDica.effects.xpAwarded);
    expect(comDicas.effects.masteryDelta[0]!.after).toBeLessThan(
      semDica.effects.masteryDelta[0]!.after,
    );
  });
});

describe("efeitos colaterais de uma tentativa", () => {
  const exercise = exercisesOf("r4").find((e) => e.slug === "r4.e3")!;
  const base = emptyProgress("2026-01-01T09:00:00.000Z");

  it("errar classifica a causa e agenda revisão curta", () => {
    const { state, effects } = recordAttempt(base, {
      exercise,
      answer: { kind: "move", san: "Be7" }, // erro previsível declarado no conteúdo
      hintsUsed: 0,
      elapsedMs: 40_000,
      at: "2026-01-02T10:00:00.000Z",
    });

    expect(effects.evaluation.correct).toBe(false);
    expect(state.errors).toHaveLength(1);
    expect(state.errors[0]!.cause).toBe("VISUALIZATION");
    expect(effects.microlesson).toBe(true); // VISUALIZATION é conceitual
    expect(effects.nextReviewDays).toBeLessThanOrEqual(2);
    expect(state.focus.value).toBeLessThan(100);
  });

  it("acertar preenche a fila de revisão para o futuro, não para hoje", () => {
    const { state } = recordAttempt(base, {
      exercise,
      answer: correctAnswer(exercise),
      hintsUsed: 0,
      elapsedMs: 40_000,
      at: "2026-01-02T10:00:00.000Z",
    });

    expect(dueQueue(Object.values(state.reviewCards), "2026-01-02T11:00:00.000Z")).toHaveLength(0);
    expect(
      dueQueue(Object.values(state.reviewCards), "2026-03-01T10:00:00.000Z").length,
    ).toBeGreaterThan(0);
  });

  it("gabarito divergente do motor não penaliza o usuário: nada é gravado", () => {
    const adulterado: ExerciseDef = {
      ...exercise,
      acceptedAnswer: { moves: ["Bh6"] }, // ilegal nesta posição
    };

    const { state, effects } = recordAttempt(base, {
      exercise: adulterado,
      answer: { kind: "move", san: "Bf8" },
      hintsUsed: 0,
      elapsedMs: 20_000,
      at: "2026-01-02T10:00:00.000Z",
    });

    expect(effects.evaluation.contentError).toBeTruthy();
    expect(state).toBe(base); // estado intocado
    expect(effects.xpAwarded).toBe(0);
  });
});

describe("o que o feedback expõe", () => {
  it("o delta de domínio vem arredondado nos dois lados", () => {
    // Regressão: `before` saía como float cru e a tela mostrava
    // "25,750647999999998", expondo o interno do modelo sem informar nada.
    const exercise = exercisesOf("r1")[0]!;
    let state = emptyProgress("2026-01-01T09:00:00.000Z");

    for (let i = 0; i < 4; i++) {
      const r = recordAttempt(state, {
        exercise,
        answer: correctAnswer(exercise),
        hintsUsed: 0,
        elapsedMs: 10_000,
        at: new Date(Date.UTC(2026, 0, 2 + i, 10)).toISOString(),
      });
      state = r.state;
      for (const delta of r.effects.masteryDelta) {
        expect(Number.isInteger(delta.before), `before=${delta.before}`).toBe(true);
        expect(Number.isInteger(delta.after), `after=${delta.after}`).toBe(true);
      }
    }
  });
});

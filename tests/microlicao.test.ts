/**
 * A microlição.
 *
 * O feedback anunciava "você vai reencontrar o conceito por outra abordagem" e
 * nada acontecia. Estes testes garantem que a promessa passou a ser cumprida — e
 * que ela NÃO dispara onde não deve: reensinar o conceito para quem errou por
 * distração é tratar o aluno como se ele não soubesse o que sabe.
 */

import { describe, expect, it } from "vitest";
import { COURSE } from "@/content";
import { buildIndex } from "@/domain/curriculum";
import { montarMicrolicao } from "@/domain/adaptive/microlicao";
import { ERROR_CAUSES, ERROR_TAXONOMY, isConceptual } from "@/domain/errors/taxonomy";
import { emptyProgress, recordAttempt } from "@/domain/session";
import { applyFocusRecovery } from "@/domain/session";
import type { AttemptLog } from "@/domain/session";
import type { ExerciseDef } from "@/content/schema";

const index = buildIndex(COURSE);
const T0 = "2026-03-01T10:00:00.000Z";

function exercicio(slug: string): ExerciseDef {
  for (const itens of index.exercisesBySkill.values()) {
    const achado = itens.find((e) => e.slug === slug);
    if (achado) return achado;
  }
  throw new Error(`exercício não encontrado: ${slug}`);
}

describe("quando a microlição dispara", () => {
  it("dispara em erro conceitual", () => {
    const m = montarMicrolicao({
      index,
      cause: "VISUALIZATION",
      skillId: "r1.cor-casa",
      attempts: [],
    });
    expect(m).not.toBeNull();
  });

  it("NÃO dispara em erro de execução", () => {
    for (const cause of ERROR_CAUSES) {
      if (isConceptual(cause)) continue;
      const m = montarMicrolicao({ index, cause, skillId: "r1.cor-casa", attempts: [] });
      expect(m, `${cause} (${ERROR_TAXONOMY[cause].label}) não deveria reensinar`).toBeNull();
    }
  });

  it("devolve null para habilidade fora do currículo, em vez de inventar", () => {
    expect(
      montarMicrolicao({ index, cause: "RULE", skillId: "nao-existe", attempts: [] }),
    ).toBeNull();
  });
});

describe("o que a microlição entrega", () => {
  const m = montarMicrolicao({
    index,
    cause: "TACTIC",
    skillId: "r3.indefesa",
    attempts: [],
  })!;

  it("traz o conceito da lição — a explicação por outra abordagem", () => {
    expect(m.conceito.length).toBeGreaterThan(50);
    expect(m.lessonId).toBeTruthy();
  });

  it("traz a intervenção que a taxonomia manda para aquela causa", () => {
    expect(m.intervencao).toBe(ERROR_TAXONOMY.TACTIC.intervention);
    expect(m.causaLabel).toBe("Tática");
  });

  it("serve um item da MESMA habilidade", () => {
    expect(m.exercicio).not.toBeNull();
    expect(m.exercicio!.skillIds).toContain("r3.indefesa");
  });

  it("reduz a complexidade: o item servido é o mais fácil disponível", () => {
    const daHabilidade = index.exercisesBySkill.get("r3.indefesa") ?? [];
    const menorDificuldade = Math.min(...daHabilidade.map((e) => e.difficulty));
    expect(m.exercicio!.difficulty).toBe(menorDificuldade);
  });
});

describe("a microlição não repete a posição que o aluno acabou de errar", () => {
  it("exclui o item errado da escolha", () => {
    const daHabilidade = index.exercisesBySkill.get("r1.cor-casa") ?? [];
    const maisFacil = [...daHabilidade].sort((a, b) => a.difficulty - b.difficulty)[0]!;

    const m = montarMicrolicao({
      index,
      cause: "VISUALIZATION",
      skillId: "r1.cor-casa",
      attempts: [],
      excluirSlug: maisFacil.slug,
    })!;

    expect(m.exercicio!.slug).not.toBe(maisFacil.slug);
  });

  it("entre itens de mesma dificuldade, prefere o menos tentado", () => {
    const daHabilidade = index.exercisesBySkill.get("r1.cor-casa") ?? [];
    const menorDificuldade = Math.min(...daHabilidade.map((e) => e.difficulty));
    const empatados = daHabilidade.filter((e) => e.difficulty === menorDificuldade);
    if (empatados.length < 2) return; // sem empate, nada a distinguir

    const attempts: AttemptLog[] = Array.from({ length: 4 }, () => ({
      exerciseSlug: empatados[0]!.slug,
      correct: true,
      hintsUsed: 0,
      elapsedMs: 8_000,
      at: T0,
    }));

    const m = montarMicrolicao({
      index,
      cause: "VISUALIZATION",
      skillId: "r1.cor-casa",
      attempts,
    })!;

    expect(m.exercicio!.slug).not.toBe(empatados[0]!.slug);
  });
});

describe("integração com o motor de sessão", () => {
  it("errar conceitualmente marca microlição, e a habilidade tem o que reensinar", () => {
    const e = exercicio("r4.e3");
    const { effects } = recordAttempt(emptyProgress(T0), {
      exercise: e,
      answer: { kind: "move", san: "Be7" }, // erro previsível: causa VISUALIZATION
      hintsUsed: 0,
      elapsedMs: 40_000,
      at: T0,
    });

    expect(effects.microlesson).toBe(true);
    expect(effects.evaluation.cause).toBe("VISUALIZATION");

    const m = montarMicrolicao({
      index,
      cause: effects.evaluation.cause!,
      skillId: e.skillIds[0]!,
      attempts: [],
      excluirSlug: e.slug,
    });
    expect(m, "erro conceitual sem microlição montável").not.toBeNull();
    expect(m!.exercicio).not.toBeNull();
  });

  it("concluir a microlição recupera Foco", () => {
    const gasto = { ...emptyProgress(T0), focus: { value: 40, lastUpdatedAt: T0 } };
    const depois = applyFocusRecovery(gasto, "MICROLESSON_COMPLETED", T0);
    expect(depois.focus.value).toBeGreaterThan(gasto.focus.value);
  });

  it("concluir revisão também recupera Foco", () => {
    const gasto = { ...emptyProgress(T0), focus: { value: 40, lastUpdatedAt: T0 } };
    const depois = applyFocusRecovery(gasto, "REVIEW_COMPLETED", T0);
    expect(depois.focus.value).toBeGreaterThan(gasto.focus.value);
  });
});

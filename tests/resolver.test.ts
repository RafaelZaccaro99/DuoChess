/**
 * O resolvedor de sessão.
 *
 * O mixer decide a composição; este módulo decide QUAL item serve cada espaço.
 * Sessão com espaço que não resolve é sessão quebrada, e é isso que estes testes
 * impedem de acontecer em silêncio.
 */

import { describe, expect, it } from "vitest";
import { COURSE } from "@/content";
import { buildIndex } from "@/domain/curriculum";
import { DEFAULT_ADAPTIVE, MIX_SEM_PARTIDAS, planSession } from "@/domain/adaptive";
import { alvoDoCartao, resolverRevisao, resolverSessao } from "@/domain/adaptive/resolver";
import { emptyMastery } from "@/domain/mastery";
import { newCard } from "@/domain/srs";
import { emptyProgress, recordAttempt, type AttemptLog } from "@/domain/session";
import type { SkillMastery } from "@/domain/types";
import type { ExerciseDef } from "@/content/schema";

const T0 = "2026-03-01T10:00:00.000Z";
const index = buildIndex(COURSE);

function masteries(entradas: Record<string, number>): Map<string, SkillMastery> {
  return new Map(
    Object.entries(entradas).map(([id, value]) => [
      id,
      { ...emptyMastery(id), value, confidence: 1, lastAssessedAt: T0 },
    ]),
  );
}

function exercicio(slug: string): ExerciseDef {
  for (const itens of index.exercisesBySkill.values()) {
    const achado = itens.find((e) => e.slug === slug);
    if (achado) return achado;
  }
  throw new Error(`exercício não encontrado: ${slug}`);
}

describe("alvo do cartão de revisão", () => {
  it("reconhece o formato que recordAttempt cria", () => {
    expect(alvoDoCartao("ex:r1.e1")).toEqual({ tipo: "exercicio", slug: "r1.e1" });
    expect(alvoDoCartao("sk:r1.cor-casa")).toEqual({ tipo: "habilidade", skillId: "r1.cor-casa" });
  });

  it("devolve null em formato desconhecido, em vez de adivinhar", () => {
    expect(alvoDoCartao("qualquercoisa")).toBeNull();
  });
});

describe("a mistura sem partidas", () => {
  it("não reserva fatia para o que ainda não existe", () => {
    expect(MIX_SEM_PARTIDAS.practicalChallenge).toBe(0);
  });

  it("soma 1 — a fatia prática foi redistribuída, não perdida", () => {
    const soma =
      MIX_SEM_PARTIDAS.bottleneck +
      MIX_SEM_PARTIDAS.spacedReview +
      MIX_SEM_PARTIDAS.newContent +
      MIX_SEM_PARTIDAS.practicalChallenge;
    expect(soma).toBeCloseTo(1, 10);
  });

  it("é a mistura padrão enquanto não há bots", () => {
    expect(DEFAULT_ADAPTIVE.mix).toBe(MIX_SEM_PARTIDAS);
  });
});

describe("resolver a sessão", () => {
  const cenarios: Array<{ nome: string; dominio: Record<string, number> }> = [
    { nome: "aluno novo", dominio: {} },
    { nome: "R1 dominada", dominio: { "r1.localizar": 90, "r1.cor-casa": 90, "r1.orientacao": 90 } },
    {
      nome: "meio da liga",
      dominio: {
        "r1.localizar": 90, "r1.cor-casa": 90, "r1.orientacao": 90,
        "r2.cavalo": 85, "r2.linhas": 85, "r2.casas-atacadas": 85,
        "r3.captura": 70, "r3.valor": 70, "r3.indefesa": 70,
      },
    },
  ];

  for (const cenario of cenarios) {
    it(`todo espaço vira exercício concreto — ${cenario.nome}`, () => {
      const m = masteries(cenario.dominio);
      const plan = planSession({
        index,
        masteries: m,
        reviewCards: [],
        errors: [],
        focus: { value: 100, lastUpdatedAt: T0 },
        nowIso: T0,
      });

      const resolvida = resolverSessao({
        index,
        slots: plan.slots,
        masteries: m,
        attempts: [],
        nowIso: T0,
      });

      expect(plan.slots.length, "o mixer não montou sessão nenhuma").toBeGreaterThan(0);
      expect(
        resolvida.naoResolvidos.map((n) => `${n.kind}: ${n.motivo}`),
        "espaço da sessão sem exercício",
      ).toEqual([]);
      expect(resolvida.itens.length).toBe(plan.slots.length);
    });
  }

  it("nunca serve o mesmo exercício duas vezes na mesma sessão", () => {
    const m = masteries({ "r1.localizar": 40 });
    const plan = planSession({
      index,
      masteries: m,
      reviewCards: [],
      errors: [],
      focus: { value: 100, lastUpdatedAt: T0 },
      nowIso: T0,
    });

    const { itens } = resolverSessao({ index, slots: plan.slots, masteries: m, attempts: [], nowIso: T0 });
    const slugs = itens.map((i) => i.exercise.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("prefere o item menos tentado — não devolve a posição já decorada", () => {
    const m = masteries({ "r1.cor-casa": 30 });
    const daHabilidade = index.exercisesBySkill.get("r1.cor-casa") ?? [];
    const jaVisto = daHabilidade[0]!;

    const attempts: AttemptLog[] = Array.from({ length: 5 }, () => ({
      exerciseSlug: jaVisto.slug,
      correct: true,
      hintsUsed: 0,
      elapsedMs: 10_000,
      at: T0,
    }));

    const { itens } = resolverSessao({
      index,
      slots: [{ kind: "BOTTLENECK", skillId: "r1.cor-casa", rationale: "teste" }],
      masteries: m,
      attempts,
      nowIso: T0,
    });

    expect(itens[0]!.exercise.slug).not.toBe(jaVisto.slug);
  });

  it("cartão de exercício resolve para aquele exercício exato", () => {
    const { itens } = resolverSessao({
      index,
      slots: [{ kind: "REVIEW", reviewCardId: "ex:r4.e3", rationale: "revisão" }],
      masteries: masteries({}),
      attempts: [],
      nowIso: T0,
    });
    expect(itens[0]!.exercise.slug).toBe("r4.e3");
  });

  it("cartão de conceito resolve para algum item da habilidade", () => {
    const { itens } = resolverSessao({
      index,
      slots: [{ kind: "REVIEW", reviewCardId: "sk:r5.mate-em-1", rationale: "revisão" }],
      masteries: masteries({}),
      attempts: [],
      nowIso: T0,
    });
    expect(itens[0]!.exercise.skillIds).toContain("r5.mate-em-1");
  });

  it("espaço que não resolve é reportado com motivo, nunca sumido em silêncio", () => {
    const { itens, naoResolvidos } = resolverSessao({
      index,
      slots: [
        { kind: "REVIEW", reviewCardId: "ex:nao-existe", rationale: "x" },
        { kind: "PRACTICAL", rationale: "y" },
      ],
      masteries: masteries({}),
      attempts: [],
      nowIso: T0,
    });

    expect(itens).toHaveLength(0);
    expect(naoResolvidos).toHaveLength(2);
    for (const n of naoResolvidos) expect(n.motivo.length).toBeGreaterThan(10);
  });

  it("carrega a razão do mixer até o item, para ser exibida ao aluno", () => {
    const { itens } = resolverSessao({
      index,
      slots: [{ kind: "BOTTLENECK", skillId: "r1.cor-casa", rationale: "Gargalo: Tática (domínio 12/100)" }],
      masteries: masteries({}),
      attempts: [],
      nowIso: T0,
    });
    expect(itens[0]!.rationale).toContain("Gargalo");
  });
});

describe("resolver a fila de revisão", () => {
  it("traduz cartões em exercícios sem repetir", () => {
    const { itens, semItem } = resolverRevisao({
      index,
      cardIds: ["ex:r1.e1", "sk:r1.cor-casa", "ex:r1.e1"],
      attempts: [],
    });
    expect(semItem).toEqual([]);
    expect(new Set(itens.map((e) => e.slug)).size).toBe(itens.length);
  });

  it("cartão sem exercício correspondente é reportado, não descartado", () => {
    const { itens, semItem } = resolverRevisao({
      index,
      cardIds: ["ex:sumiu-do-curriculo"],
      attempts: [],
    });
    expect(itens).toHaveLength(0);
    expect(semItem).toEqual(["ex:sumiu-do-curriculo"]);
  });
});

describe("critério de aceite do bloco", () => {
  /**
   * "Um item errado hoje reaparece na fila no dia previsto pelo FSRS."
   *
   * Não basta reaparecer: tem que ser no dia certo. Antes é revisão inútil,
   * depois é esquecimento.
   */
  it("item errado hoje volta no dia que o FSRS marcou — nem antes, nem depois", () => {
    const e = exercicio("r4.e3"); // única defesa: Bf8
    const hoje = "2026-03-01T10:00:00.000Z";

    const { state, effects } = recordAttempt(emptyProgress(hoje), {
      exercise: e,
      answer: { kind: "move", san: "Be7" }, // erro previsível declarado no conteúdo
      hintsUsed: 0,
      elapsedMs: 40_000,
      at: hoje,
    });

    expect(effects.evaluation.correct).toBe(false);
    expect(effects.nextReviewDays).not.toBeNull();

    const cartao = state.reviewCards[`ex:${e.slug}`];
    expect(cartao).toBeDefined();

    const previsto = new Date(cartao!.dueAt).getTime();
    const cardIds = (quando: string) =>
      Object.values(state.reviewCards)
        .filter((c) => new Date(c.dueAt).getTime() <= new Date(quando).getTime())
        .map((c) => c.id);

    // Véspera: ainda não venceu.
    const vespera = new Date(previsto - 36 * 3_600_000).toISOString();
    expect(cardIds(vespera)).not.toContain(cartao!.id);

    // No dia: venceu e resolve para o mesmo exercício.
    const noDia = new Date(previsto + 60_000).toISOString();
    expect(cardIds(noDia)).toContain(cartao!.id);

    const { itens } = resolverRevisao({
      index,
      cardIds: cardIds(noDia),
      attempts: state.attempts,
    });
    expect(itens.map((x) => x.slug)).toContain(e.slug);
  });

  it("a sessão respeita a mistura configurada e o teto diário", () => {
    const m = masteries({ "r1.localizar": 50, "r1.cor-casa": 40 });

    // Muito mais cartões vencidos do que a fatia de revisão comporta.
    const cartoes = Array.from({ length: 30 }, (_, i) =>
      newCard(`ex:g.r1.${String(i + 1).padStart(2, "0")}`, "EXERCISE", {}, T0),
    );

    const plan = planSession({
      index,
      masteries: m,
      reviewCards: cartoes,
      errors: [],
      focus: { value: 100, lastUpdatedAt: T0 },
      nowIso: T0,
    });

    const tamanho = DEFAULT_ADAPTIVE.sessionSize;
    expect(plan.slots.length).toBeLessThanOrEqual(tamanho);

    const revisoes = plan.slots.filter((s) => s.kind === "REVIEW").length;
    const esperado = Math.round(tamanho * DEFAULT_ADAPTIVE.mix.spacedReview);
    expect(revisoes).toBe(esperado);
    expect(plan.slots.some((s) => s.kind === "PRACTICAL")).toBe(false);
  });
});

describe("a sessão entrega o tamanho que promete", () => {
  /**
   * Regressão: a competência do gargalo era filtro rígido. Quando ela tinha
   * poucas habilidades fracas disponíveis, o aluno pedia dez itens e recebia
   * cinco — sem nada na tela dizendo por quê.
   */
  it("preenche a sessão mesmo quando a competência do gargalo tem poucas habilidades fracas", () => {
    const m = masteries({
      // Quase toda a liga dominada: sobram poucas habilidades fracas de regras.
      "r1.localizar": 95, "r1.cor-casa": 95, "r1.orientacao": 95,
      "r2.cavalo": 95, "r2.linhas": 95, "r2.casas-atacadas": 95,
      "r3.captura": 95, "r3.valor": 95, "r3.indefesa": 20,
      "r4.reconhecer": 95, "r4.tres-respostas": 95, "r4.xeque-cavalo": 95,
    });

    const erros = Array.from({ length: 4 }, () => ({
      cause: "RULE" as const,
      severity: "SERIOUS" as const,
      confidence: 0.9,
      explanation: "erro de teste",
      at: T0,
    }));

    const plan = planSession({
      index,
      masteries: m,
      reviewCards: [],
      errors: erros,
      focus: { value: 100, lastUpdatedAt: T0 },
      nowIso: T0,
    });

    expect(plan.advancementBlocked).toBe(true);
    expect(plan.slots.length, "sessão veio curta").toBe(DEFAULT_ADAPTIVE.sessionSize);

    const { itens, naoResolvidos } = resolverSessao({
      index,
      slots: plan.slots,
      masteries: m,
      attempts: [],
      nowIso: T0,
    });
    expect(naoResolvidos).toEqual([]);
    expect(itens).toHaveLength(DEFAULT_ADAPTIVE.sessionSize);
  });

  it("o gargalo continua vindo primeiro, mesmo com o resto completando", () => {
    const m = masteries({ "r1.localizar": 70, "r1.cor-casa": 10 });
    const { itens } = resolverSessao({
      index,
      slots: [
        { kind: "BOTTLENECK", skillId: "r1.cor-casa", rationale: "gargalo" },
        { kind: "BOTTLENECK", skillId: "r1.localizar", rationale: "seguinte" },
      ],
      masteries: m,
      attempts: [],
      nowIso: T0,
    });
    expect(itens[0]!.skillId).toBe("r1.cor-casa");
  });
});

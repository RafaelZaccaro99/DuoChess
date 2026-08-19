import { describe, expect, it } from "vitest";
import {
  DEFAULT_FSRS,
  dueQueue,
  gradeFromAttempt,
  intervalFor,
  newCard,
  retrievability,
  review,
} from "@/domain/srs";

const T0 = "2026-01-01T10:00:00.000Z";
const plus = (days: number) => new Date(new Date(T0).getTime() + days * 86_400_000).toISOString();

describe("retrievability", () => {
  it("vale 1 no momento da revisão e cai com o tempo", () => {
    expect(retrievability(5, 0)).toBeCloseTo(1, 5);
    expect(retrievability(5, 5)).toBeLessThan(1);
    expect(retrievability(5, 50)).toBeLessThan(retrievability(5, 5));
  });
});

describe("intervalos", () => {
  it("acerto sem dica amplia o intervalo a cada revisão", () => {
    let card = newCard("c1", "SKILL", { skillId: "s1" }, T0);
    let previous = 0;

    for (let i = 1; i <= 4; i++) {
      const result = review(card, { grade: 3, usedHints: false, at: plus(previous) }, DEFAULT_FSRS);
      expect(result.intervalDays).toBeGreaterThan(previous);
      previous = result.intervalDays;
      card = result.card;
    }
  });

  it("acerto COM dica cresce menos que acerto sem dica", () => {
    const card = newCard("c1", "SKILL", { skillId: "s1" }, T0);
    const semDica = review(card, { grade: 3, usedHints: false, at: T0 });
    const comDica = review(card, { grade: 3, usedHints: true, at: T0 });
    expect(comDica.intervalDays).toBeLessThan(semDica.intervalDays);
  });

  it("erro derruba a estabilidade e conta lapso", () => {
    let card = newCard("c1", "SKILL", { skillId: "s1" }, T0);
    card = review(card, { grade: 4, usedHints: false, at: T0 }).card;
    const estavel = card.stability;

    const erro = review(card, { grade: 1, usedHints: false, at: plus(5) });
    expect(erro.card.stability).toBeLessThan(estavel);
    expect(erro.card.lapses).toBe(1);
  });

  it("respeita o intervalo máximo configurado", () => {
    expect(intervalFor(100_000, DEFAULT_FSRS)).toBe(DEFAULT_FSRS.maximumInterval);
  });
});

describe("erro conceitual", () => {
  it("dispara microlição e reinicia o cartão", () => {
    let card = newCard("c1", "SKILL", { skillId: "s1" }, T0);
    for (let i = 0; i < 5; i++) card = review(card, { grade: 4, usedHints: false, at: plus(i * 10) }).card;

    const result = review(card, { grade: 1, usedHints: false, conceptualError: true, at: plus(60) });

    expect(result.microlesson).toBe(true);
    expect(result.card.stability).toBe(DEFAULT_FSRS.initialStability[1]);
    expect(result.intervalDays).toBeLessThanOrEqual(2);
  });

  it("erro NÃO conceitual apenas encurta o intervalo, sem reiniciar", () => {
    let card = newCard("c1", "SKILL", { skillId: "s1" }, T0);
    for (let i = 0; i < 5; i++) card = review(card, { grade: 4, usedHints: false, at: plus(i * 10) }).card;

    const result = review(card, { grade: 1, usedHints: false, conceptualError: false, at: plus(60) });

    expect(result.microlesson).toBe(false);
    expect(result.card.stability).toBeGreaterThan(DEFAULT_FSRS.initialStability[1]);
  });
});

describe("fila do dia", () => {
  it("respeita o teto diário — quem sumiu por um mês não volta para 300 revisões", () => {
    const cards = Array.from({ length: 120 }, (_, i) =>
      newCard(`c${i}`, "EXERCISE", { exerciseId: `e${i}` }, T0),
    );
    expect(dueQueue(cards, plus(30)).length).toBe(DEFAULT_FSRS.dailyReviewCap);
  });

  it("não devolve cartões que ainda não venceram", () => {
    const card = review(newCard("c1", "SKILL", { skillId: "s1" }, T0), {
      grade: 4,
      usedHints: false,
      at: T0,
    }).card;
    expect(dueQueue([card], T0)).toHaveLength(0);
  });
});

describe("nota derivada da tentativa", () => {
  it("erro é sempre 1", () => {
    expect(gradeFromAttempt({ correct: false, hintsUsed: 0, elapsedMs: 1000, expectedSeconds: 30 })).toBe(1);
  });

  it("acerto com dica é 2, acerto rápido é 4", () => {
    expect(gradeFromAttempt({ correct: true, hintsUsed: 1, elapsedMs: 10_000, expectedSeconds: 30 })).toBe(2);
    expect(gradeFromAttempt({ correct: true, hintsUsed: 0, elapsedMs: 5_000, expectedSeconds: 30 })).toBe(4);
    expect(gradeFromAttempt({ correct: true, hintsUsed: 0, elapsedMs: 25_000, expectedSeconds: 30 })).toBe(3);
  });
});

import { describe, expect, it } from "vitest";
import {
  DEFAULT_XP,
  EMPTY_STREAK,
  FOCUS_LOW_THRESHOLD,
  awardXP,
  depleteFocus,
  recoverFocus,
  registerActivity,
  shouldPauseNewContent,
  type XPEvent,
} from "@/domain/gamification";

const T0 = "2026-01-01T10:00:00.000Z";

describe("XP", () => {
  it("exercícios fáceis geram menos XP que difíceis", () => {
    const facil = awardXP({ difficulty: 1, correct: true, source: "LESSON", at: T0 }, []);
    const dificil = awardXP({ difficulty: 10, correct: true, source: "LESSON", at: T0 }, []);
    expect(dificil.amount).toBeGreaterThan(facil.amount * 5);
  });

  it("erro ainda rende algum XP — esforço conta como atividade", () => {
    const erro = awardXP({ difficulty: 5, correct: false, source: "LESSON", at: T0 }, []);
    expect(erro.amount).toBeGreaterThan(0);
    expect(erro.amount).toBeLessThan(
      awardXP({ difficulty: 5, correct: true, source: "LESSON", at: T0 }, []).amount,
    );
  });

  it("farming é punido: passado o teto da janela, o rendimento despenca", () => {
    const history: XPEvent[] = Array.from({ length: 30 }, () => ({
      amount: 40,
      source: "LESSON" as const,
      decayApplied: 1,
      at: T0,
    }));

    const evento = awardXP({ difficulty: 10, correct: true, source: "LESSON", at: T0 }, history);
    expect(evento.decayApplied).toBeLessThan(0.5);
    expect(evento.decayApplied).toBeGreaterThanOrEqual(DEFAULT_XP.minDecay);
  });
});

describe("sequência", () => {
  it("dias consecutivos somam", () => {
    let s = registerActivity(EMPTY_STREAK, "2026-01-01T10:00:00.000Z");
    s = registerActivity(s, "2026-01-02T09:00:00.000Z");
    s = registerActivity(s, "2026-01-03T23:00:00.000Z");
    expect(s.current).toBe(3);
    expect(s.longest).toBe(3);
  });

  it("duas atividades no mesmo dia contam uma vez", () => {
    let s = registerActivity(EMPTY_STREAK, "2026-01-01T08:00:00.000Z");
    s = registerActivity(s, "2026-01-01T20:00:00.000Z");
    expect(s.current).toBe(1);
  });

  it("um dia perdido consome uma proteção; sem proteção, a sequência reinicia", () => {
    let s = registerActivity(EMPTY_STREAK, "2026-01-01T10:00:00.000Z");
    s = registerActivity(s, "2026-01-03T10:00:00.000Z"); // pulou o dia 2
    expect(s.current).toBe(2);
    expect(s.freezesLeft).toBe(1);

    s = registerActivity(s, "2026-01-06T10:00:00.000Z"); // pulou dois dias
    expect(s.current).toBe(1);
  });
});

describe("Foco", () => {
  it("erros consecutivos custam progressivamente mais", () => {
    const inicial = { value: 100, lastUpdatedAt: T0 };
    const um = depleteFocus(inicial, { consecutiveErrors: 1, at: T0 });
    const quatro = depleteFocus(inicial, { consecutiveErrors: 4, at: T0 });
    expect(100 - quatro.value).toBeGreaterThan(100 - um.value);
  });

  it("só recupera por ação pedagógica — não existe caminho de compra no tipo", () => {
    const baixo = { value: 20, lastUpdatedAt: T0 };
    expect(shouldPauseNewContent(baixo)).toBe(true);

    const recuperado = recoverFocus(baixo, "MICROLESSON_COMPLETED", T0);
    expect(recuperado.value).toBeGreaterThan(FOCUS_LOW_THRESHOLD);
    expect(shouldPauseNewContent(recuperado)).toBe(false);
  });

  it("nunca passa de 100 nem cai abaixo de 0", () => {
    expect(recoverFocus({ value: 95, lastUpdatedAt: T0 }, "BREAK_TAKEN", T0).value).toBe(100);
    expect(depleteFocus({ value: 5, lastUpdatedAt: T0 }, { consecutiveErrors: 9, at: T0 }).value).toBe(0);
  });
});

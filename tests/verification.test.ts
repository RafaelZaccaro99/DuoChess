/**
 * O gate ENGINE_REVIEW, testado sem engine.
 *
 * As regras de aprovação e reprovação são o revisor do conteúdo desde que não há
 * revisor humano titulado no fluxo. Elas precisam ser auditáveis por quem não
 * confia nelas — e isso exige que rodem em milissegundos, sem subir Stockfish.
 */

import { describe, expect, it } from "vitest";
import {
  MARGEM_UNICIDADE,
  blocks,
  checkDifficulty,
  scoreOf,
  verifyMoveExercise,
  type EngineLine,
} from "@/domain/chess/verification";

const linha = (moveUci: string, over: Partial<EngineLine> = {}): EngineLine => ({
  moveUci,
  cp: 0,
  ...over,
});

describe("escala de comparação", () => {
  it("mate a favor vale mais que qualquer vantagem material", () => {
    expect(scoreOf(linha("a1a8", { mate: 3 }))).toBeGreaterThan(scoreOf(linha("b1b8", { cp: 9000 })));
  });

  it("mate mais curto vale mais que mate mais longo", () => {
    expect(scoreOf(linha("x", { mate: 1 }))).toBeGreaterThan(scoreOf(linha("y", { mate: 5 })));
  });

  it("levar mate vale menos que qualquer desvantagem material", () => {
    expect(scoreOf(linha("x", { mate: -2 }))).toBeLessThan(scoreOf(linha("y", { cp: -9000 })));
  });
});

describe("solução única", () => {
  it("aprova quando a solução é claramente a melhor", () => {
    const achados = verifyMoveExercise({
      acceptedUci: ["c5f8"],
      predictableUci: [],
      lines: [linha("c5f8", { cp: 300 }), linha("c5e7", { cp: -500 })],
    });
    expect(achados).toEqual([]);
  });

  it("reprova quando o item diz única mas existe outra igual", () => {
    const achados = verifyMoveExercise({
      acceptedUci: ["c5f8"],
      predictableUci: [],
      lines: [linha("c5f8", { cp: 300 }), linha("c5d6", { cp: 280 })],
    });
    expect(blocks(achados)).toBe(true);
    expect(achados[0]!.code).toBe("SOLUCAO_NAO_E_UNICA");
  });

  it("não exige unicidade quando o item aceita vários lances", () => {
    const achados = verifyMoveExercise({
      acceptedUci: ["e8d8", "e8f8", "e8f7"],
      predictableUci: [],
      lines: [linha("e8d8", { cp: 10 }), linha("e8f8", { cp: 5 }), linha("e8f7", { cp: 0 })],
    });
    expect(blocks(achados)).toBe(false);
  });

  it("reprova quando o gabarito não é a melhor jogada da posição", () => {
    const achados = verifyMoveExercise({
      acceptedUci: ["a2a3"],
      predictableUci: [],
      lines: [linha("d1h5", { mate: 1 }), linha("a2a3", { cp: 20 })],
    });
    expect(blocks(achados)).toBe(true);
    expect(achados.map((f) => f.code)).toContain("SOLUCAO_NAO_E_A_MELHOR");
  });
});

describe("mate prometido", () => {
  it("aprova quando a engine confirma o mate", () => {
    const achados = verifyMoveExercise({
      acceptedUci: ["a1a8"],
      predictableUci: [],
      lines: [linha("a1a8", { mate: 1 })],
      claimsMateIn: 1,
    });
    expect(achados).toEqual([]);
  });

  it("reprova quando o item promete mate e não há mate", () => {
    const achados = verifyMoveExercise({
      acceptedUci: ["a1a8"],
      predictableUci: [],
      lines: [linha("a1a8", { cp: 400 })],
      claimsMateIn: 1,
    });
    expect(blocks(achados)).toBe(true);
    expect(achados.map((f) => f.code)).toContain("MATE_PROMETIDO_NAO_CONFERE");
  });
});

describe("erros previsíveis", () => {
  it("aprova quando o erro previsível de fato perde", () => {
    const achados = verifyMoveExercise({
      acceptedUci: ["h1h5"],
      predictableUci: ["h1d5"],
      lines: [linha("h1h5", { cp: 300 }), linha("h1d5", { cp: -400 })],
    });
    expect(achados).toEqual([]);
  });

  it("reprova quando o suposto erro é melhor que a solução — quem erra é o conteúdo", () => {
    const achados = verifyMoveExercise({
      acceptedUci: ["h1h5"],
      predictableUci: ["h1d5"],
      lines: [linha("h1h5", { cp: 100 }), linha("h1d5", { cp: 600 })],
    });
    expect(blocks(achados)).toBe(true);
    expect(achados.map((f) => f.code)).toContain("ERRO_PREVISIVEL_E_MELHOR");
  });

  it("reprova quando o suposto erro é equivalente à solução", () => {
    const achados = verifyMoveExercise({
      acceptedUci: ["h1h5"],
      predictableUci: ["h1d5"],
      lines: [linha("h1h5", { cp: 300 }), linha("h1d5", { cp: 260 })],
    });
    expect(achados.map((f) => f.code)).toContain("ERRO_PREVISIVEL_NAO_E_ERRO");
  });

  it("apenas avisa quando o erro é mais fraco mas continua ganhando", () => {
    const achados = verifyMoveExercise({
      acceptedUci: ["e7e8q"],
      predictableUci: ["e7e8n"],
      lines: [linha("e7e8q", { mate: 4 }), linha("e7e8n", { mate: 12 })],
    });
    expect(blocks(achados)).toBe(false);
    expect(achados.map((f) => f.code)).toContain("ERRO_PREVISIVEL_AINDA_GANHA");
    // O mesmo item também é preferência, não solução única: os dois lances ganham.
    expect(achados.map((f) => f.code)).toContain("SOLUCAO_UNICA_E_PREFERENCIA");
  });

  it("bloqueia quando a alternativa dá mate mais rápido que o gabarito", () => {
    const achados = verifyMoveExercise({
      acceptedUci: ["e7e8n"],
      predictableUci: [],
      lines: [linha("e7e8n", { mate: 12 }), linha("e7e8q", { mate: 2 })],
    });
    expect(blocks(achados)).toBe(true);
    expect(achados.map((f) => f.code)).toContain("SOLUCAO_NAO_E_A_MELHOR");
  });
});

describe("margem", () => {
  it("uma diferença menor que a margem não sustenta afirmar unicidade", () => {
    const achados = verifyMoveExercise({
      acceptedUci: ["a"],
      predictableUci: [],
      lines: [linha("a", { cp: MARGEM_UNICIDADE }), linha("b", { cp: 1 })],
    });
    expect(blocks(achados)).toBe(true);
  });
});

describe("calibração de dificuldade", () => {
  it("silencia quando declarado e observado são compatíveis", () => {
    expect(checkDifficulty({ declared: 2, depthFound: 1 })).toEqual([]);
    expect(checkDifficulty({ declared: 8, depthFound: 12 })).toEqual([]);
  });

  it("silencia quando não se sabe a profundidade", () => {
    expect(checkDifficulty({ declared: 5, depthFound: null })).toEqual([]);
  });
});

describe("escopo da pergunta", () => {
  /**
   * Regressão de um erro de categoria do gate: ele reprovava um exercício de
   * CAPTURA porque existia um lance QUIETO mais forte. O lance quieto não é uma
   * resposta possível à pergunta "qual captura ganha material".
   */
  it("ignora lances que não respondem à pergunta do item", () => {
    const achados = verifyMoveExercise({
      acceptedUci: ["h1h4"],
      predictableUci: ["h1d5"],
      lines: [
        linha("h1h4", { cp: 204 }), // captura correta
        linha("h1e4", { cp: 185 }), // lance quieto mais forte, fora da pergunta
        linha("h1d5", { cp: -600 }), // captura errada
      ],
      candidateUci: ["h1h4", "h1d5"],
    });
    expect(blocks(achados)).toBe(false);
  });

  it("sem restringir candidatos, o mesmo item seria reprovado", () => {
    const achados = verifyMoveExercise({
      acceptedUci: ["h1h4"],
      predictableUci: ["h1d5"],
      lines: [linha("h1h4", { cp: 204 }), linha("h1e4", { cp: 185 }), linha("h1d5", { cp: -600 })],
    });
    expect(blocks(achados)).toBe(true);
    expect(achados.map((f) => f.code)).toContain("SOLUCAO_NAO_E_UNICA");
  });
});

describe("calibração só avisa na direção que informa", () => {
  it("não avisa quando a engine acha rápido e o item é difícil — é o caso normal", () => {
    expect(checkDifficulty({ declared: 8, depthFound: 1 })).toEqual([]);
  });

  it("avisa quando a engine precisa cavar fundo e o item se diz fácil", () => {
    const achados = checkDifficulty({ declared: 3, depthFound: 12 });
    expect(achados).toHaveLength(1);
    expect(achados[0]!.code).toBe("DIFICULDADE_SUBESTIMADA");
    expect(blocks(achados)).toBe(false);
  });
});

describe("o gate não grita lobo", () => {
  /**
   * Regressão: itens de "mate em 1" gerados recebiam aviso dizendo que o
   * enunciado deveria pedir "o lance mais forte" — mas ele já pedia mate em 1,
   * e uma alternativa que mata em 2 não é resposta à pergunta feita.
   * Gate que avisa à toa passa a ser ignorado.
   */
  it("enunciado que promete mate em N não recebe aviso por alternativa mais lenta", () => {
    const achados = verifyMoveExercise({
      acceptedUci: ["a7h7"],
      predictableUci: [],
      lines: [linha("a7h7", { mate: 1 }), linha("a7e3", { mate: 2 })],
      claimsMateIn: 1,
    });
    expect(achados).toEqual([]);
  });

  it("mas ainda bloqueia quando a alternativa mata mais rápido que o gabarito", () => {
    const achados = verifyMoveExercise({
      acceptedUci: ["a7e3"],
      predictableUci: [],
      lines: [linha("a7e3", { mate: 3 }), linha("a7h7", { mate: 1 })],
      claimsMateIn: 3,
    });
    expect(blocks(achados)).toBe(true);
  });

  it("sem promessa de mate, a preferência continua sendo avisada", () => {
    const achados = verifyMoveExercise({
      acceptedUci: ["e7e8q"],
      predictableUci: [],
      lines: [linha("e7e8q", { mate: 4 }), linha("e7e8n", { mate: 12 })],
    });
    expect(achados.map((f) => f.code)).toContain("SOLUCAO_UNICA_E_PREFERENCIA");
  });
});

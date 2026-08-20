import { describe, expect, it } from "vitest";
import { countGamesInPgn, parsePgn } from "@/domain/game/pgn";

const PGN_VALIDO = `[Event "Teste"]
[Site "?"]
[Date "2026.01.01"]
[Round "1"]
[White "Alice"]
[Black "Bruno"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 1-0`;

const PGN_ILEGAL = `[Event "Teste"]
[Result "*"]

1. e4 e4 *`;

describe("parsePgn", () => {
  it("parseia um PGN válido lance a lance", () => {
    const resultado = parsePgn(PGN_VALIDO);
    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.game.moves).toHaveLength(8);
    expect(resultado.game.moves[0]).toMatchObject({ ply: 1, san: "e4" });
    expect(resultado.game.result).toBe("1-0");
    expect(resultado.game.headers.White).toBe("Alice");
    expect(resultado.game.finalFen).toContain(" w "); // último lance foi preto (Nf6), branco joga
  });

  it("rejeita PGN malformado", () => {
    const resultado = parsePgn("isto não é um PGN");
    expect(resultado.ok).toBe(false);
  });

  it("rejeita PGN com lance ilegal embutido (ADR-001 também vale para import)", () => {
    const resultado = parsePgn(PGN_ILEGAL);
    expect(resultado.ok).toBe(false);
  });

  it("resultado ausente ou '*' vira null", () => {
    const resultado = parsePgn(`[Event "Teste"]\n[Result "*"]\n\n1. e4 e5 *`);
    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.game.result).toBeNull();
  });
});

describe("countGamesInPgn", () => {
  it("conta um jogo numa colagem simples", () => {
    expect(countGamesInPgn(PGN_VALIDO)).toBe(1);
  });

  it("conta múltiplos jogos por cabeçalho [Event", () => {
    const dois = `${PGN_VALIDO}\n\n${PGN_VALIDO}`;
    expect(countGamesInPgn(dois)).toBe(2);
  });

  it("texto vazio conta zero", () => {
    expect(countGamesInPgn("   ")).toBe(0);
  });
});

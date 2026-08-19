/**
 * O gerador de conteúdo.
 *
 * Duas propriedades sustentam a decisão de commitar conteúdo gerado:
 *  1. **determinismo** — mesma semente, mesmo conteúdo. Sem isso o diff em git
 *     vira ruído e ninguém revisa o que mudou de verdade;
 *  2. **aprovado na saída** — item que sai do gerador já passou pelo avaliador
 *     com o próprio gabarito. O CI confere de novo, mas o gerador não empurra
 *     trabalho para ele.
 */

import { describe, expect, it } from "vitest";
import { COURSE } from "@/content";
import { buildIndex } from "@/domain/curriculum";
import { evaluateExercise } from "@/domain/chess/evaluate";
import { exerciseSchema, type ExerciseDef } from "@/content/schema";
import { Aleatorio } from "@/lib/geracao/aleatorio";
import {
  ehPosicaoTranquila,
  montarFen,
  peca,
  sintetizar,
  sintetizarAte,
  temMateEmUmUnico,
} from "@/lib/geracao/sintese";
import { SOURCE_IDS } from "@/content/bibliografia";
import { Chess, type Square } from "chess.js";

const index = buildIndex(COURSE);

const praticaDaRecruta: ExerciseDef[] = COURSE.leagues
  .filter((l) => l.id === "recruta")
  .flatMap((l) => l.units)
  .flatMap((u) => u.practice);

describe("aleatoriedade com semente", () => {
  it("a mesma semente produz a mesma sequência", () => {
    const a = new Aleatorio(42);
    const b = new Aleatorio(42);
    const seqA = Array.from({ length: 50 }, () => a.proximo());
    const seqB = Array.from({ length: 50 }, () => b.proximo());
    expect(seqA).toEqual(seqB);
  });

  it("sementes diferentes divergem", () => {
    const a = new Aleatorio(1);
    const b = new Aleatorio(2);
    expect(a.proximo()).not.toBe(b.proximo());
  });

  it("embaralhar não muta a entrada", () => {
    const original = [1, 2, 3, 4, 5];
    const copia = [...original];
    new Aleatorio(7).embaralhar(original);
    expect(original).toEqual(copia);
  });

  it("escolher de lista vazia é sempre bug, então lança", () => {
    expect(() => new Aleatorio(1).escolher([])).toThrow();
  });
});

describe("síntese de posições", () => {
  it("nunca produz posição ilegal", () => {
    const aleatorio = new Aleatorio(99);
    let geradas = 0;
    for (let i = 0; i < 300; i++) {
      const p = sintetizar(aleatorio, [peca("q", "w"), peca("r", "b")], "w");
      if (!p) continue;
      geradas += 1;
      expect(() => new Chess(p.fen)).not.toThrow();
    }
    expect(geradas).toBeGreaterThan(50);
  });

  it("nunca deixa o lado que não joga em xeque — seria posição inalcançável", () => {
    const aleatorio = new Aleatorio(123);
    for (let i = 0; i < 200; i++) {
      const p = sintetizar(aleatorio, [peca("q", "w"), peca("r", "w")], "w");
      if (!p) continue;
      const espelho = new Chess(p.fen.replace(" w ", " b "));
      expect(espelho.isCheck(), `posição com preto em xeque na vez das brancas: ${p.fen}`).toBe(false);
    }
  });

  it("mate em um só passa quando é ÚNICO", () => {
    const aleatorio = new Aleatorio(2026);
    const p = sintetizarAte(aleatorio, [peca("q", "w"), peca("r", "w")], "w", temMateEmUmUnico, 8_000);
    expect(p).not.toBeNull();

    const mates = p!.chess.moves().filter((san) => {
      const t = new Chess(p!.fen);
      t.move(san);
      return t.isCheckmate();
    });
    expect(mates).toHaveLength(1);
  });

  it("posição tranquila não exclui material insuficiente", () => {
    // Regressão: `isDraw()` no filtro tornava impossível gerar exercícios de
    // alcance com rei e cavalo contra rei, porque a posição é sempre empate por
    // material insuficiente — o que nada tem a ver com a pergunta feita.
    const aleatorio = new Aleatorio(555);
    const p = sintetizarAte(aleatorio, [peca("n", "w")], "w", ehPosicaoTranquila, 2_000);
    expect(p, "não conseguiu sintetizar posição com só um cavalo").not.toBeNull();
    expect(new Chess(p!.fen).isDraw()).toBe(true); // é empate...
    expect(ehPosicaoTranquila(p!)).toBe(true); // ...e ainda assim serve
  });

  it("monta FEN corretamente a partir do tabuleiro", () => {
    const tabuleiro = new Map([
      ["e1" as Square, peca("k", "w")],
      ["e8" as Square, peca("k", "b")],
      ["d4" as Square, peca("q", "w")],
    ]);
    const fen = montarFen(tabuleiro, "w");
    const chess = new Chess(fen);
    expect(chess.get("d4" as Square)?.type).toBe("q");
    expect(chess.turn()).toBe("w");
  });
});

describe("o banco de prática gerado", () => {
  it("existe e tem volume", () => {
    expect(praticaDaRecruta.length).toBeGreaterThanOrEqual(40);
  });

  it("todo item passa no schema", () => {
    for (const item of praticaDaRecruta) {
      const r = exerciseSchema.safeParse(item);
      expect(r.success, `${item.slug}: ${r.success ? "" : r.error.issues[0]?.message}`).toBe(true);
    }
  });

  it("o avaliador aprova o gabarito de todo item gerado", () => {
    for (const item of praticaDaRecruta) {
      const a = item.acceptedAnswer;
      const resposta =
        "squares" in a
          ? ({ kind: "squares", squares: a.squares } as const)
          : "moves" in a
            ? ({ kind: "move", san: a.moves[0]! } as const)
            : "color" in a
              ? ({ kind: "choice", choice: a.color } as const)
              : ({ kind: "choice", choice: a.choice } as const);

      const r = evaluateExercise(item, resposta);
      expect(r.contentError, `${item.slug}: ${r.contentError}`).toBeNull();
      expect(r.correct, `${item.slug}: o avaliador reprova o próprio gabarito`).toBe(true);
    }
  });

  it("nenhum erro previsível é aceito como correto", () => {
    for (const item of praticaDaRecruta) {
      for (const pe of item.predictableErrors) {
        const comoResposta =
          "moves" in item.acceptedAnswer
            ? ({ kind: "move", san: pe.answer } as const)
            : ({ kind: "choice", choice: pe.answer } as const);
        expect(
          evaluateExercise(item, comoResposta).correct,
          `${item.slug}: erro previsível "${pe.answer}" é aceito`,
        ).toBe(false);
      }
    }
  });

  it("todo item gerado cita fonte existente e é marcado como gerado", () => {
    for (const item of praticaDaRecruta) {
      expect(item.tags, `${item.slug} sem marca de origem`).toContain("gerado");
      expect(item.sources.length, `${item.slug} sem fonte`).toBeGreaterThan(0);
      for (const id of item.sources) expect(SOURCE_IDS.has(id), `${item.slug}: ${id}`).toBe(true);
    }
  });

  it("todo item gerado é prática ou revisão, nunca fase de ensino", () => {
    // As fases GUIADA e PROVA DE DOMÍNIO carregam o momento de ensino e
    // continuam escritas à mão. O gerado entra como repetição.
    for (const item of praticaDaRecruta) {
      expect(["INDEPENDENT", "REVIEW"]).toContain(item.phase);
    }
  });

  it("as dificuldades variam — banco só de item fácil trava o teto de domínio", () => {
    const dificuldades = new Set(praticaDaRecruta.map((i) => i.difficulty));
    expect(dificuldades.size).toBeGreaterThanOrEqual(4);
    expect(Math.max(...dificuldades)).toBeGreaterThanOrEqual(7);
  });
});

describe("cobertura do currículo", () => {
  it("nenhuma habilidade publicada com menos de 6 itens", () => {
    const magras: string[] = [];
    for (const skill of index.skills.values()) {
      const liga = COURSE.leagues.find((l) => l.id === skill.leagueId);
      if (!liga || liga.units.length === 0) continue;
      const n = index.exercisesBySkill.get(skill.id)?.length ?? 0;
      if (n < 6) magras.push(`${skill.id} (${n})`);
    }
    expect(magras, `habilidades sem munição para a revisão espaçada: ${magras.join(", ")}`).toEqual([]);
  });

  it("o índice por habilidade cobre lição e prática", () => {
    const daLicao = index.exercisesBySkill.get("r1.cor-casa") ?? [];
    expect(daLicao.some((e) => e.tags.includes("gerado"))).toBe(true);
    expect(daLicao.some((e) => !e.tags.includes("gerado"))).toBe(true);
  });
});

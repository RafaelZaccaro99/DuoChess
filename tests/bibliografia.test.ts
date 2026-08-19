/**
 * O gate SOURCE_REVIEW.
 *
 * Sem revisor humano titulado no fluxo, estes testes são parte do piso de
 * qualidade: eles provam que o gate reprova o que deve reprovar. Um gate que
 * nunca reprova nada não é um gate, é decoração.
 */

import { describe, expect, it } from "vitest";
import { COURSE } from "@/content";
import { SOURCES, SOURCE_IDS, getSource, sourcesFor } from "@/content/bibliografia";
import { skillSchema, exerciseSchema } from "@/content/schema";
import { buildIndex } from "@/domain/curriculum";
import { COMPETENCIES } from "@/domain/types";

const index = buildIndex(COURSE);

describe("registro bibliográfico", () => {
  it("não tem id duplicado", () => {
    expect(SOURCE_IDS.size).toBe(SOURCES.length);
  });

  it("toda fonte tem faixa de nível coerente", () => {
    for (const s of SOURCES) {
      expect(s.levelMin, s.id).toBeLessThan(s.levelMax);
      expect(s.competencies.length, s.id).toBeGreaterThan(0);
    }
  });

  it("as normativas da FIDE trazem a edição consultada", () => {
    const leis = getSource("fide-laws")!;
    expect(leis.kind).toBe("NORMATIVE");
    expect(leis.edition).toContain("2023");
  });

  it("toda competência do Chess Score tem ao menos uma fonte", () => {
    for (const c of COMPETENCIES) {
      const cobrindo = SOURCES.filter((s) => s.competencies.includes(c));
      expect(cobrindo.length, `competência sem fonte: ${c}`).toBeGreaterThan(0);
    }
  });

  it("não recomenda obra avançada para iniciante", () => {
    const paraRecruta = sourcesFor("endgame", 300).map((s) => s.id);
    expect(paraRecruta).toContain("silman-endgame");
    expect(paraRecruta).not.toContain("dvoretsky-endgame");
  });
});

describe("o gate reprova o que deve reprovar", () => {
  const habilidadeValida = {
    id: "x.teste",
    title: "Habilidade de teste",
    competency: "rules" as const,
    description: "Descrição suficientemente longa para o schema.",
    sources: ["fide-laws"],
    dependsOn: [],
    minPrerequisiteMastery: 60,
  };

  it("aceita habilidade com fonte", () => {
    expect(skillSchema.safeParse(habilidadeValida).success).toBe(true);
  });

  it("recusa habilidade sem nenhuma fonte", () => {
    const { sources, ...semFonte } = habilidadeValida;
    expect(skillSchema.safeParse(semFonte).success).toBe(false);
    expect(skillSchema.safeParse({ ...habilidadeValida, sources: [] }).success).toBe(false);
  });

  it("exercício sem fonte própria é aceito e herda as da habilidade", () => {
    const parsed = exerciseSchema.safeParse({
      slug: "x.e1",
      phase: "INDEPENDENT",
      type: "SQUARE_COLOR",
      prompt: "Enunciado longo o suficiente.",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      sideToMove: "w",
      skillIds: ["x.teste"],
      difficulty: 3,
      ratingHint: 300,
      acceptedAnswer: { color: "light" },
      predictableErrors: [{ answer: "dark", cause: "RULE", explanation: "explicação longa o bastante" }],
      explanation: {
        perceived: "aaaaaa", threat: "aaaaaa", bestDefense: "aaaaaa",
        reason: "aaaaaa", pattern: "aaaaaa", transferableRule: "aaaaaa",
      },
      hints: ["dica um", "dica dois", "dica tres"],
      expectedSeconds: 20,
      points: 5,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.sources).toEqual([]);
  });
});

describe("conteúdo publicado", () => {
  it("toda habilidade cita fonte existente no registro", () => {
    for (const skill of index.skills.values()) {
      expect(skill.sources.length, `${skill.id} sem fonte`).toBeGreaterThan(0);
      for (const id of skill.sources) {
        expect(SOURCE_IDS.has(id), `${skill.id} cita fonte inexistente: ${id}`).toBe(true);
      }
    }
  });

  it("alguma fonte de cada habilidade cobre a competência dela", () => {
    for (const skill of index.skills.values()) {
      const cobre = skill.sources.some((id) => getSource(id)!.competencies.includes(skill.competency));
      expect(cobre, `${skill.id} (${skill.competency}) sem fonte da competência`).toBe(true);
    }
  });

  it("nenhuma habilidade da Liga Recruta cita obra avançada", () => {
    for (const skill of index.skills.values()) {
      if (skill.leagueId !== "recruta") continue;
      for (const id of skill.sources) {
        expect(
          getSource(id)!.levelMin,
          `${skill.id} cita ${id}, que começa em ${getSource(id)!.levelMin}`,
        ).toBeLessThanOrEqual(800);
      }
    }
  });
});

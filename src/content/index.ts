/**
 * Curso completo. No MVP, apenas a Liga Recruta tem conteúdo — as demais ligas
 * existem como estrutura declarada, com `units: []`.
 *
 * Isso é deliberado e visível na interface: o mapa mostra as oito ligas com a
 * marcação "conteúdo em produção" nas que ainda não têm unidades. O spec proíbe
 * dado simulado silencioso; uma liga vazia é dita como vazia.
 */

import { courseSchema, type CourseDef, type LeagueDef } from "./schema";
import { RECRUTA } from "./recruta";

const PLANNED: LeagueDef[] = [
  {
    id: "estrategista",
    title: "Estrategista",
    order: 2,
    ratingMin: 800,
    ratingMax: 1200,
    focus:
      "Desenvolvimento, centro, segurança do rei, garfo, cravada, espeto, ataque descoberto, remoção do defensor, mates, oposição e finais básicos.",
    units: [],
  },
  {
    id: "tatico",
    title: "Tático",
    order: 3,
    ratingMin: 1200,
    ratingMax: 1400,
    focus:
      "Combinações, desvio, atração, sobrecarga, interferência, lance intermediário, sacrifícios, candidatos, visualização, cálculo e repertório inicial.",
    units: [],
  },
  {
    id: "competidor",
    title: "Competidor",
    order: 4,
    ratingMin: 1400,
    ratingMax: 1600,
    focus:
      "Avaliação, atividade, espaço, iniciativa, casas fracas, postos avançados, estruturas, relógio, análise sem engine e primeiros torneios.",
    units: [],
  },
  {
    id: "especialista",
    title: "Especialista",
    order: 5,
    ratingMin: 1600,
    ratingMax: 1800,
    focus:
      "Cálculo aprofundado, profilaxia, defesa, segunda fraqueza, peão isolado, peões pendentes, Carlsbad, Lucena, Philidor e repertório estruturado.",
    units: [],
  },
  {
    id: "elite",
    title: "Elite",
    order: 6,
    ratingMin: 1800,
    ratingMax: 2000,
    focus:
      "Múltiplos candidatos, avaliação dinâmica, sacrifícios posicionais, finais complexos, preparação de adversários, repertório e ciclos de torneio.",
    units: [],
  },
  {
    id: "mestre",
    title: "Mestre",
    order: 7,
    ratingMin: 2000,
    ratingMax: 2200,
    focus:
      "Estratégia avançada, profilaxia profunda, repertório competitivo, banco de dados, cálculo sem mover peças e performance contra titulados.",
    units: [],
  },
  {
    id: "candidato",
    title: "Candidato a título",
    order: 8,
    ratingMin: 2200,
    ratingMax: 2400,
    focus:
      "Performance de norma, seleção de torneios, preparação específica, controle emocional, recuperação e equipe profissional.",
    units: [],
  },
];

const raw: CourseDef = {
  slug: "formacao-completa",
  title: "Formação completa em xadrez",
  locale: "pt-BR",
  leagues: [RECRUTA, ...PLANNED],
};

/** Falha no import se o conteúdo violar o schema. Erro cedo é erro barato. */
export const COURSE: CourseDef = courseSchema.parse(raw);

export function hasContent(leagueId: string): boolean {
  return (COURSE.leagues.find((l) => l.id === leagueId)?.units.length ?? 0) > 0;
}

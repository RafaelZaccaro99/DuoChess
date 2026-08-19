/**
 * Registro bibliográfico.
 *
 * Decisão de projeto: o conteúdo enxadrístico é pesquisado e escrito a partir de
 * bibliografia especializada, sem revisor humano titulado no fluxo. Isso troca o
 * gate `CHESS_REVIEW` do workflow editorial por dois gates verificáveis:
 *
 *   1. ENGINE_REVIEW — o motor de regras (e, a partir do bloco A2, o Stockfish)
 *      confere tudo que é fato enxadrístico: legalidade, unicidade da solução,
 *      se o erro previsível realmente perde o que dizemos que perde.
 *
 *   2. SOURCE_REVIEW — toda afirmação PEDAGÓGICA (nome de padrão, regra
 *      transferível, heurística de avaliação) precisa estar ancorada numa obra
 *      deste registro. Habilidade sem fonte não publica.
 *
 * O que uma citação prova e o que não prova: ela prova que a afirmação está
 * ancorada numa obra reconhecida, não que a explicação foi conferida por uma
 * pessoa forte. Essa lacuna é real e está registrada em docs/09 — a resposta a
 * ela é a auditoria por amostragem antes do lançamento, mais o canal de
 * exercícios contestados.
 *
 * Obras extraídas da Parte X do documento-base do produto.
 */

import type { Competency } from "@/domain/types";

export type SourceKind = "NORMATIVE" | "BOOK" | "DATABASE";

export interface Source {
  id: string;
  kind: SourceKind;
  author: string;
  title: string;
  /** Para que serve, em uma linha — vem da bibliografia comentada do spec. */
  use: string;
  competencies: Competency[];
  /** Faixa em que a obra é adequada. Citar Dvoretsky numa lição de Recruta é erro. */
  levelMin: number;
  levelMax: number;
  url?: string;
  /** Edição/data consultada, quando a fonte muda ao longo do tempo. */
  edition?: string;
}

export const SOURCES: readonly Source[] = [
  // ── Normativas: a autoridade sobre regra é a FIDE, não um livro didático.
  {
    id: "fide-laws",
    kind: "NORMATIVE",
    author: "FIDE",
    title: "Laws of Chess",
    use: "Fonte primária de regras de jogo e competição, incluindo notação e súmula.",
    competencies: ["rules", "analysis"],
    levelMin: 0,
    levelMax: 2800,
    url: "https://handbook.fide.com/chapter/e012023",
    edition: "vigente desde 1º de janeiro de 2023",
  },
  {
    id: "fide-rating",
    kind: "NORMATIVE",
    author: "FIDE",
    title: "Rating Regulations",
    use: "Rating, publicação, ritmos e cálculo.",
    competencies: ["practical"],
    levelMin: 1400,
    levelMax: 2800,
    url: "https://handbook.fide.com/chapter/B022024",
  },
  {
    id: "fide-titles",
    kind: "NORMATIVE",
    author: "FIDE",
    title: "Title Regulations",
    use: "Títulos, normas e requisitos de torneios.",
    competencies: ["practical"],
    levelMin: 2000,
    levelMax: 2800,
    url: "https://handbook.fide.com/chapter/B012024",
  },
  {
    id: "cbx",
    kind: "NORMATIVE",
    author: "CBX",
    title: "Cadastro, Rating, Torneios e Comunicados",
    use: "Fonte operacional do circuito brasileiro.",
    competencies: ["practical"],
    levelMin: 800,
    levelMax: 2800,
    url: "https://cbx.org.br/torneios",
  },

  // ── Fundamentos
  {
    id: "dagostini-basico",
    kind: "BOOK",
    author: "D'AGOSTINI, Orfeu",
    title: "Xadrez Básico",
    use: "Iniciação em português: regras, notação, fundamentos e cultura geral.",
    competencies: ["rules", "tactics", "endgame", "analysis"],
    levelMin: 0,
    levelMax: 1200,
  },
  {
    id: "maizelis-primer",
    kind: "BOOK",
    author: "MAIZELIS, Ilya",
    title: "The Soviet Chess Primer",
    use: "Fundamentos extensos com exercícios; iniciante a intermediário.",
    competencies: ["rules", "tactics", "endgame", "strategy", "calculation"],
    levelMin: 0,
    levelMax: 1600,
  },
  {
    id: "chernev-logical",
    kind: "BOOK",
    author: "CHERNEV, Irving",
    title: "Logical Chess: Move by Move",
    use: "Compreender a justificativa de cada lance em partidas completas.",
    competencies: ["strategy", "opening", "analysis"],
    levelMin: 600,
    levelMax: 1600,
  },
  {
    id: "capablanca-fundamentals",
    kind: "BOOK",
    author: "CAPABLANCA, José Raúl",
    title: "Chess Fundamentals",
    use: "Princípios, finais e clareza; ler criticamente à luz moderna.",
    competencies: ["strategy", "endgame", "tactics"],
    levelMin: 600,
    levelMax: 1800,
  },

  // ── Tática e cálculo
  {
    id: "woodpecker",
    kind: "BOOK",
    author: "SMITH, Axel; TIKKANEN, Hans",
    title: "The Woodpecker Method",
    use: "Automatização de padrões por repetição espaçada.",
    competencies: ["tactics"],
    levelMin: 1200,
    levelMax: 2200,
  },
  {
    id: "ramesh-calculation",
    kind: "BOOK",
    author: "RAMESH, R. B.",
    title: "Improve Your Chess Calculation",
    use: "Métodos práticos de cálculo e exercícios.",
    competencies: ["calculation"],
    levelMin: 1400,
    levelMax: 2300,
  },
  {
    id: "aagaard-calculation",
    kind: "BOOK",
    author: "AAGAARD, Jacob",
    title: "Grandmaster Preparation: Calculation",
    use: "Cálculo profundo e disciplina de candidatos.",
    competencies: ["calculation"],
    levelMin: 1800,
    levelMax: 2600,
  },
  {
    id: "kotov-think",
    kind: "BOOK",
    author: "KOTOV, Alexander",
    title: "Think Like a Grandmaster",
    use: "Clássico sobre cálculo; útil, mas a árvore rígida não é dogma.",
    competencies: ["calculation"],
    levelMin: 1600,
    levelMax: 2400,
  },

  // ── Estratégia
  {
    id: "nimzowitsch-sistema",
    kind: "BOOK",
    author: "NIMZOWITSCH, Aron",
    title: "Meu Sistema",
    use: "Profilaxia, bloqueio e superproteção; contextualizar historicamente.",
    competencies: ["strategy"],
    levelMin: 1400,
    levelMax: 2400,
  },
  {
    id: "silman-reassess",
    kind: "BOOK",
    author: "SILMAN, Jeremy",
    title: "How to Reassess Your Chess",
    use: "Desequilíbrios e construção de planos.",
    competencies: ["strategy"],
    levelMin: 1400,
    levelMax: 2000,
  },
  {
    id: "flores-structures",
    kind: "BOOK",
    author: "FLORES RIOS, Mauricio",
    title: "Chess Structures",
    use: "Planos por estrutura de peões; aplicável ao repertório.",
    competencies: ["strategy", "opening"],
    levelMin: 1600,
    levelMax: 2400,
  },
  {
    id: "hellsten-strategy",
    kind: "BOOK",
    author: "HELLSTEN, Johan",
    title: "Mastering Chess Strategy",
    use: "Curso progressivo de estratégia com exercícios.",
    competencies: ["strategy"],
    levelMin: 1400,
    levelMax: 2200,
  },

  // ── Finais
  {
    id: "silman-endgame",
    kind: "BOOK",
    author: "SILMAN, Jeremy",
    title: "Silman's Complete Endgame Course",
    use: "Finais organizados por nível; excelente primeira trilha.",
    competencies: ["endgame"],
    levelMin: 0,
    levelMax: 2200,
  },
  {
    id: "delavilla-100",
    kind: "BOOK",
    author: "DE LA VILLA, Jesús",
    title: "100 Endgames You Must Know",
    use: "Núcleo técnico de finais para competição.",
    competencies: ["endgame"],
    levelMin: 1400,
    levelMax: 2400,
  },
  {
    id: "dvoretsky-endgame",
    kind: "BOOK",
    author: "DVORETSKY, Mark",
    title: "Dvoretsky's Endgame Manual",
    use: "Referência avançada; não é o primeiro livro de finais.",
    competencies: ["endgame"],
    levelMin: 1800,
    levelMax: 2600,
  },
  {
    id: "muller-fce",
    kind: "BOOK",
    author: "MÜLLER, Karsten; LAMPRECHT, Frank",
    title: "Fundamental Chess Endings",
    use: "Enciclopédia técnica de finais, para consulta.",
    competencies: ["endgame"],
    levelMin: 1600,
    levelMax: 2600,
  },

  // ── Aberturas, partidas e treinamento
  {
    id: "fischer-60",
    kind: "BOOK",
    author: "FISCHER, Bobby",
    title: "My 60 Memorable Games",
    use: "Partidas anotadas, preparação e precisão.",
    competencies: ["analysis", "opening"],
    levelMin: 1800,
    levelMax: 2600,
  },
  {
    id: "yusupov-buildup",
    kind: "BOOK",
    author: "YUSUPOV, Artur",
    title: "Build Up / Boost / Evolution Your Chess",
    use: "Currículo progressivo por exercícios.",
    competencies: ["tactics", "calculation", "strategy", "endgame"],
    levelMin: 1200,
    levelMax: 2400,
  },
  {
    id: "dvoretsky-training",
    kind: "BOOK",
    author: "DVORETSKY, Mark; YUSUPOV, Artur",
    title: "Training for the Tournament Player",
    use: "Estrutura de preparação competitiva.",
    competencies: ["practical", "analysis"],
    levelMin: 1800,
    levelMax: 2600,
  },
] as const;

export const SOURCE_IDS: ReadonlySet<string> = new Set(SOURCES.map((s) => s.id));

export function getSource(id: string): Source | undefined {
  return SOURCES.find((s) => s.id === id);
}

/** Fontes adequadas a uma competência numa faixa de rating. */
export function sourcesFor(competency: Competency, ratingHint: number): Source[] {
  return SOURCES.filter(
    (s) =>
      s.competencies.includes(competency) &&
      ratingHint >= s.levelMin - 200 &&
      ratingHint <= s.levelMax,
  );
}

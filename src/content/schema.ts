/**
 * Schema do conteúdo (ADR-002).
 *
 * O conteúdo do MVP é código TypeScript versionado em git e validado em CI.
 * O CMS da Sprint 6 grava no banco usando EXATAMENTE estes mesmos tipos e o mesmo
 * validador — a migração é troca de loader, não de formato.
 */

import { z } from "zod";
import { COMPETENCIES } from "@/domain/types";

/**
 * Workflow editorial.
 *
 * O spec previa `CHESS_REVIEW` humano. Como o conteúdo é pesquisado a partir de
 * bibliografia especializada, sem revisor titulado no fluxo, esse estado foi
 * dividido em dois gates verificáveis por máquina:
 *
 *   ENGINE_REVIEW  fatos enxadrísticos, conferidos contra o motor de regras e,
 *                  a partir do bloco A2, contra o Stockfish (unicidade da
 *                  solução, o erro previsível realmente perde, dificuldade).
 *   SOURCE_REVIEW  afirmações pedagógicas ancoradas na bibliografia.
 *
 * Nenhum item publica sem passar pelos dois. Ver docs/09 para o que essa troca
 * cobre e o que ela deliberadamente não cobre.
 */
export const REVIEW_STATES = [
  "DRAFT",
  "ENGINE_REVIEW",
  "SOURCE_REVIEW",
  "PEDAGOGY_REVIEW",
  "PUBLISHED",
  "MONITORING",
  "CONTESTED",
] as const;

export type ReviewState = (typeof REVIEW_STATES)[number];

/** Tipos modulares de exercício. Cada um tem um avaliador em src/domain/chess/evaluate.ts */
export const EXERCISE_TYPES = [
  "LEGAL_MOVES",      // quais lances a peça pode fazer
  "ATTACKED_SQUARES", // que casas a peça ataca
  "SQUARE_COLOR",     // cor de uma casa (visualização)
  "BEST_MOVE",        // encontrar o lance (mate em 1, tática, melhor defesa...)
  "CHECK_ESCAPE",     // sair do xeque
  "CAPTURE",          // executar a captura correta
  "PIECE_VALUE",      // avaliar troca / peça indefesa
  "NOTATION_READ",    // ler notação e apontar a casa/posição
  "NOTATION_WRITE",   // escrever a notação de um lance
  "IS_MATE_OR_STALEMATE", // classificar a posição
] as const;

export type ExerciseType = (typeof EXERCISE_TYPES)[number];

export const lessonPhaseSchema = z.enum(["GUIDED", "INDEPENDENT", "MASTERY_TEST", "REVIEW"]);

const squareSchema = z.string().regex(/^[a-h][1-8]$/, "casa inválida (esperado ex.: e4)");

/**
 * Resposta esperada, por tipo:
 *  - LEGAL_MOVES / ATTACKED_SQUARES: { squares: [...] }  (conjunto, ordem irrelevante)
 *  - BEST_MOVE / CHECK_ESCAPE / CAPTURE: { moves: ["Cc6", ...] } (SAN, qualquer um aceito)
 *  - SQUARE_COLOR: { color: "light" | "dark" }
 *  - PIECE_VALUE / IS_MATE_OR_STALEMATE / NOTATION_*: { choice: "..." }
 */
export const answerSchema = z.union([
  z.object({ squares: z.array(squareSchema).min(1) }),
  z.object({ moves: z.array(z.string().min(2)).min(1) }),
  z.object({ color: z.enum(["light", "dark"]) }),
  z.object({ choice: z.string().min(1) }),
]);

export type ExerciseAnswer = z.infer<typeof answerSchema>;

export const predictableErrorSchema = z.object({
  /** A resposta errada que esperamos ver. */
  answer: z.string().min(1),
  /** Causa na taxonomia — usada para classificar o erro sem engine. */
  cause: z.string().min(1),
  /** Por que essa resposta é tentadora e por que falha. */
  explanation: z.string().min(10),
});

/** Feedback explicativo. O spec proíbe "certo/errado" puro: todos os campos são obrigatórios. */
export const explanationSchema = z.object({
  perceived: z.string().min(5),
  threat: z.string().min(5),
  bestDefense: z.string().min(5),
  reason: z.string().min(5),
  pattern: z.string().min(5),
  transferableRule: z.string().min(5),
});

export type Explanation = z.infer<typeof explanationSchema>;

export const boardMarkSchema = z.object({
  kind: z.enum(["arrow", "highlight"]),
  from: squareSchema,
  to: squareSchema.optional(),
  tone: z.enum(["good", "bad", "neutral"]).default("neutral"),
});

export const exerciseSchema = z.object({
  slug: z.string().min(3),
  phase: lessonPhaseSchema,
  type: z.enum(EXERCISE_TYPES),
  prompt: z.string().min(10),
  fen: z.string().min(10),
  pgn: z.string().optional(),
  sideToMove: z.enum(["w", "b"]),
  skillIds: z.array(z.string().min(1)).min(1),
  /**
   * Dificuldade RELATIVA À HABILIDADE, não ao xadrez inteiro:
   * 1–3 apresentação e execução guiada · 4–6 execução independente · 7–10 prova de domínio.
   * A âncora absoluta é `ratingHint`. Ver `masteryCeiling` em src/domain/mastery.
   */
  difficulty: z.number().int().min(1).max(10),
  ratingHint: z.number().int().min(0).max(2800),
  acceptedAnswer: answerSchema,
  predictableErrors: z.array(predictableErrorSchema).min(1),
  explanation: explanationSchema,
  hints: z.tuple([z.string().min(5), z.string().min(5), z.string().min(5)]),
  marks: z.array(boardMarkSchema).default([]),
  tags: z.array(z.string()).default([]),
  expectedSeconds: z.number().int().min(3).max(1800),
  points: z.number().int().min(1).max(100),
  /**
   * Fontes específicas deste item, quando ele afirma algo que a habilidade não
   * cobre (um final teórico nomeado, uma regra normativa citada). Opcional: por
   * padrão o item herda as fontes da habilidade.
   */
  sources: z.array(z.string().min(1)).default([]),
  /**
   * Como o gate ENGINE_REVIEW deve julgar este item.
   *
   * `BEST`            a solução precisa ser objetivamente a melhor entre os
   *                   candidatos da pergunta (o padrão para itens de lance).
   * `RULE_EXECUTION`  o item pede para EXECUTAR uma regra — roque, en passant,
   *                   promoção. A afirmação é sobre legalidade, não sobre
   *                   avaliação, e julgar por centipawns seria erro de categoria.
   */
  verification: z.enum(["BEST", "RULE_EXECUTION"]).default("BEST"),
});

export type ExerciseDef = z.infer<typeof exerciseSchema>;

export const skillSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3),
  competency: z.enum(COMPETENCIES),
  description: z.string().min(10),
  /**
   * Fontes que ancoram o que esta habilidade ensina (ids de src/content/bibliografia.ts).
   *
   * Obrigatório e não vazio: sem revisor humano titulado no fluxo, a bibliografia
   * é o que separa "afirmação enxadrística ancorada" de "texto plausível gerado".
   * O validador recusa habilidade sem fonte e fonte inexistente.
   */
  sources: z.array(z.string().min(1)).min(1),
  /** IDs de habilidades pré-requisito. Grafo, não lista linear. */
  dependsOn: z.array(z.string()).default([]),
  /** Domínio mínimo no pré-requisito para desbloquear. */
  minPrerequisiteMastery: z.number().int().min(0).max(100).default(60),
});

export type SkillDef = z.infer<typeof skillSchema>;

export const lessonSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3),
  /** Fase 1: apresentação do conceito. */
  concept: z.string().min(20),
  /** Fase 2: demonstração no tabuleiro. */
  demo: z
    .object({
      fen: z.string().min(10),
      caption: z.string().min(5),
      marks: z.array(boardMarkSchema).default([]),
    })
    .optional(),
  exercises: z.array(exerciseSchema).min(1),
});

export type LessonDef = z.infer<typeof lessonSchema>;

export const unitSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3),
  summary: z.string().min(10),
  masteryTest: z.string().min(10),
  skills: z.array(skillSchema).min(1),
  lessons: z.array(lessonSchema).min(1),
  /**
   * Banco de prática: itens que NÃO pertencem ao fluxo de cinco fases da lição.
   *
   * Existe porque empilhar trinta exercícios dentro de uma lição quebraria o
   * modelo pedagógico. A lição ensina; o banco dá repetição — que é exatamente
   * do que a revisão espaçada precisa e o que faltava (1,67 item por habilidade
   * significa reagendar sempre a mesma posição).
   *
   * O motor adaptativo e a fila de revisão sacam daqui por habilidade.
   */
  practice: z.array(exerciseSchema).default([]),
});

export type UnitDef = z.infer<typeof unitSchema>;

export const leagueSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3),
  order: z.number().int().min(1).max(8),
  ratingMin: z.number().int(),
  ratingMax: z.number().int(),
  focus: z.string().min(10),
  units: z.array(unitSchema),
});

export type LeagueDef = z.infer<typeof leagueSchema>;

export const courseSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(3),
  locale: z.string().default("pt-BR"),
  leagues: z.array(leagueSchema).min(1),
});

export type CourseDef = z.infer<typeof courseSchema>;

/**
 * Tipos de ENTRADA do schema.
 *
 * Campos com `.default()` são obrigatórios no tipo de saída e opcionais na
 * entrada. Os arquivos de conteúdo são entrada — quem os anota com o tipo de
 * saída acaba tendo que escrever `sources: []` e `marks: []` em todo item só
 * para satisfazer o compilador. `courseSchema.parse()` preenche os defaults.
 */
export type ExerciseInput = z.input<typeof exerciseSchema>;
export type LessonInput = z.input<typeof lessonSchema>;
export type UnitInput = z.input<typeof unitSchema>;
export type LeagueInput = z.input<typeof leagueSchema>;
export type CourseInput = z.input<typeof courseSchema>;

/**
 * Adaptador de servidor do CMS (A7): rascunho, os dois gates, publicação.
 *
 * Segue a ADR-002 ao pé da letra: grava e lê usando o MESMO schema Zod que o
 * conteúdo estático (`src/content/schema.ts`), e roda o MESMO validador do
 * CI (`src/domain/content/gates.ts`, `src/lib/content/engine-gate.ts`) — não
 * existe um segundo padrão de qualidade para conteúdo de CMS.
 *
 * Escopo deliberado: só exercício novo em habilidade já existente. Currículo
 * (habilidade/unidade/liga) continua sendo decisão de código, revisada por PR
 * — a ADR-002 rejeita "CMS-first" por esse motivo exato.
 */

import "server-only";
import { prisma } from "./db";
import { startEngine } from "./engine/uci";
import { runEngineGate } from "./content/engine-gate";
import {
  checkExercise,
  checkExerciseSources,
  emptyDuplicateState,
  primeDuplicateState,
  type ContentProblem,
} from "@/domain/content/gates";
import type { Finding } from "@/domain/chess/verification";
import { buildIndex } from "@/domain/curriculum";
import { COURSE } from "@/content";
import { exerciseSchema, type ExerciseDef, type ExerciseInput } from "@/content/schema";

const INDEX = buildIndex(COURSE);

export interface PublishFinding {
  gate: "SOURCE_REVIEW" | "ENGINE_REVIEW";
  severity: "BLOQUEIA" | "AVISA";
  code: string;
  message: string;
}

export interface PublishResult {
  ok: boolean;
  exerciseId: string;
  reviewState: "DRAFT" | "PUBLISHED";
  findings: PublishFinding[];
}

export interface AuthoredExerciseSummary {
  id: string;
  slug: string;
  prompt: string;
  skillIds: string[];
  reviewState: string;
  updatedAt: string;
}

function toFinding(gate: PublishFinding["gate"], p: ContentProblem): PublishFinding {
  return { gate, severity: "BLOQUEIA", code: p.where, message: p.message };
}

/** Forma de gravação — o inverso de `rowToExerciseDef`, espelhando prisma/seed.ts. */
function exerciseToRow(exercise: ExerciseDef) {
  return {
    slug: exercise.slug,
    phase: exercise.phase,
    type: exercise.type,
    prompt: exercise.prompt,
    fen: exercise.fen,
    pgn: exercise.pgn ?? null,
    sideToMove: exercise.sideToMove,
    difficulty: exercise.difficulty,
    ratingHint: exercise.ratingHint,
    acceptedAnswers: exercise.acceptedAnswer,
    predictableErrors: exercise.predictableErrors,
    explanation: JSON.stringify(exercise.explanation),
    hint1: exercise.hints[0],
    hint2: exercise.hints[1],
    hint3: exercise.hints[2],
    marksJson: exercise.marks,
    sourcesJson: exercise.sources,
    verification: exercise.verification,
    tags: exercise.tags,
    expectedSeconds: exercise.expectedSeconds,
    points: exercise.points,
  };
}

interface ExerciseRow {
  id: string;
  slug: string;
  phase: string;
  type: string;
  prompt: string;
  fen: string;
  pgn: string | null;
  sideToMove: string;
  difficulty: number;
  ratingHint: number;
  acceptedAnswers: unknown;
  predictableErrors: unknown;
  explanation: string;
  hint1: string;
  hint2: string;
  hint3: string;
  marksJson: unknown;
  sourcesJson: unknown;
  verification: string;
  tags: string[];
  expectedSeconds: number;
  points: number;
  skills: { skillId: string }[];
}

/** Inverso do mapeamento de prisma/seed.ts — reconstrói um ExerciseDef fiel a partir do banco. */
export function rowToExerciseDef(row: ExerciseRow): ExerciseDef {
  const input: ExerciseInput = {
    slug: row.slug,
    phase: row.phase as ExerciseInput["phase"],
    type: row.type as ExerciseInput["type"],
    prompt: row.prompt,
    fen: row.fen,
    pgn: row.pgn ?? undefined,
    sideToMove: row.sideToMove as ExerciseInput["sideToMove"],
    skillIds: row.skills.map((s) => s.skillId),
    difficulty: row.difficulty,
    ratingHint: row.ratingHint,
    acceptedAnswer: row.acceptedAnswers as ExerciseInput["acceptedAnswer"],
    predictableErrors: row.predictableErrors as ExerciseInput["predictableErrors"],
    explanation: JSON.parse(row.explanation),
    hints: [row.hint1, row.hint2, row.hint3],
    marks: row.marksJson as ExerciseInput["marks"],
    tags: row.tags,
    expectedSeconds: row.expectedSeconds,
    points: row.points,
    sources: row.sourcesJson as string[],
    verification: row.verification as ExerciseInput["verification"],
  };
  return exerciseSchema.parse(input);
}

/** Exercícios de CMS já publicados numa habilidade — a leitura que alimenta a mesclagem em tempo de execução. */
export async function publishedExercisesForSkill(
  skillId: string,
  excludeExerciseId?: string,
): Promise<ExerciseDef[]> {
  const rows = await prisma.exercise.findMany({
    where: {
      reviewState: "PUBLISHED",
      authorId: { not: null },
      id: excludeExerciseId ? { not: excludeExerciseId } : undefined,
      skills: { some: { skillId } },
    },
    include: { skills: true },
  });
  return rows.map(rowToExerciseDef);
}

/** As duas checagens baratas — sem engine. Contra o acervo atual (estático + CMS já publicado). */
async function runCheapGates(exercise: ExerciseDef, excludeExerciseId?: string): Promise<PublishFinding[]> {
  const knownSkills = new Set(INDEX.skills.keys());
  const dupState = emptyDuplicateState();

  const existingStatic = exercise.skillIds.flatMap((id) => INDEX.exercisesBySkill.get(id) ?? []);
  const existingCms = (
    await Promise.all(exercise.skillIds.map((id) => publishedExercisesForSkill(id, excludeExerciseId)))
  ).flat();
  primeDuplicateState(dupState, [...existingStatic, ...existingCms]);

  const engineProblems = checkExercise(exercise, `cms/${exercise.slug}`, knownSkills, dupState);
  const sourceProblems = checkExerciseSources(exercise);

  return [
    ...engineProblems.map((p) => toFinding("ENGINE_REVIEW", p)),
    ...sourceProblems.map((p) => toFinding("SOURCE_REVIEW", p)),
  ];
}

/** Salva ou atualiza um rascunho. Nenhum gate roda aqui — é o "salvar sem publicar". */
export async function salvarRascunho(
  authorId: string,
  input: ExerciseInput,
  exerciseId?: string,
): Promise<{ exerciseId: string; reviewState: "DRAFT" }> {
  const exercise = exerciseSchema.parse(input);
  const data = exerciseToRow(exercise);

  const row = exerciseId
    ? await prisma.exercise.update({ where: { id: exerciseId }, data: { ...data, reviewState: "DRAFT" } })
    : await prisma.exercise.create({ data: { ...data, reviewState: "DRAFT", authorId } });

  for (const skillId of exercise.skillIds) {
    await prisma.exerciseSkill.upsert({
      where: { exerciseId_skillId: { exerciseId: row.id, skillId } },
      update: {},
      create: { exerciseId: row.id, skillId },
    });
  }

  return { exerciseId: row.id, reviewState: "DRAFT" };
}

/** Checagens reativas, enquanto o admin digita — sem subir engine. */
export async function verificarRascunho(input: ExerciseInput): Promise<PublishFinding[]> {
  const exercise = exerciseSchema.parse(input);
  return runCheapGates(exercise);
}

/**
 * Roda os dois gates e só publica se nada bloquear. Grava uma linha em
 * ContentReview por gate, mesmo quando bloqueia — trilha de auditoria, não só
 * feedback transiente na tela.
 */
export async function publicarExercicio(adminId: string, exerciseId: string): Promise<PublishResult> {
  const row = await prisma.exercise.findUnique({ where: { id: exerciseId }, include: { skills: true } });
  if (!row || row.authorId === null) {
    return {
      ok: false,
      exerciseId,
      reviewState: "DRAFT",
      findings: [
        { gate: "ENGINE_REVIEW", severity: "BLOQUEIA", code: "NAO_ENCONTRADO", message: "exercício não encontrado ou não é de CMS." },
      ],
    };
  }
  if (row.skills.length === 0) {
    return {
      ok: false,
      exerciseId,
      reviewState: "DRAFT",
      findings: [
        { gate: "ENGINE_REVIEW", severity: "BLOQUEIA", code: "SEM_HABILIDADE", message: "exercício sem habilidade associada." },
      ],
    };
  }

  const exercise = rowToExerciseDef(row);
  const cheapFindings = await runCheapGates(exercise, exerciseId);

  const engine = await startEngine();
  let engineFindings: Finding[];
  try {
    engineFindings = await runEngineGate(exercise, engine);
  } finally {
    await engine.quit();
  }
  const engineFindingsAsPublish: PublishFinding[] = engineFindings.map((f) => ({
    gate: "ENGINE_REVIEW",
    severity: f.severity,
    code: f.code,
    message: f.message,
  }));

  const findings = [...cheapFindings, ...engineFindingsAsPublish];
  const sourceFindings = findings.filter((f) => f.gate === "SOURCE_REVIEW");
  const engineOnlyFindings = findings.filter((f) => f.gate === "ENGINE_REVIEW");

  await prisma.$transaction([
    prisma.contentReview.create({
      data: {
        exerciseId,
        reviewerId: adminId,
        stage: "SOURCE_REVIEW",
        approved: !sourceFindings.some((f) => f.severity === "BLOQUEIA"),
        notes: JSON.stringify(sourceFindings),
      },
    }),
    prisma.contentReview.create({
      data: {
        exerciseId,
        reviewerId: adminId,
        stage: "ENGINE_REVIEW",
        approved: !engineOnlyFindings.some((f) => f.severity === "BLOQUEIA"),
        notes: JSON.stringify(engineOnlyFindings),
      },
    }),
  ]);

  const bloqueado = findings.some((f) => f.severity === "BLOQUEIA");
  if (bloqueado) {
    return { ok: false, exerciseId, reviewState: "DRAFT", findings };
  }

  await prisma.exercise.update({ where: { id: exerciseId }, data: { reviewState: "PUBLISHED" } });
  return { ok: true, exerciseId, reviewState: "PUBLISHED", findings };
}

/** Um rascunho ou item publicado, autorado por CMS — o editor usa para carregar o formulário. */
export async function getAuthoredExercise(exerciseId: string): Promise<ExerciseDef | null> {
  const row = await prisma.exercise.findUnique({ where: { id: exerciseId }, include: { skills: true } });
  if (!row || row.authorId === null) return null;
  return rowToExerciseDef(row);
}

/** Todo exercício de CMS já publicado — a leitura que alimenta sessão e revisão, que sacam de várias habilidades. */
export async function publishedExercises(): Promise<ExerciseDef[]> {
  const rows = await prisma.exercise.findMany({
    where: { reviewState: "PUBLISHED", authorId: { not: null } },
    include: { skills: true },
  });
  return rows.map(rowToExerciseDef);
}

/** Todo exercício autorado por CMS — fila compartilhada entre administradores. */
export async function listAuthoredExercises(): Promise<AuthoredExerciseSummary[]> {
  const rows = await prisma.exercise.findMany({
    where: { authorId: { not: null } },
    include: { skills: true },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    prompt: r.prompt,
    skillIds: r.skills.map((s) => s.skillId),
    reviewState: r.reviewState,
    updatedAt: r.updatedAt.toISOString(),
  }));
}

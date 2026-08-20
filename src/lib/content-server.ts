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
import { amostrarConteudo, type AuditSampleItem } from "@/domain/content/audit-sample";
export type { AuditSampleItem } from "@/domain/content/audit-sample";
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

// ────────────────────────────────────────────────── exercícios contestados (A8)

/**
 * Contesta um exercício — qualquer usuário logado, não só admin. O item some
 * da rotação imediatamente (`CONTESTED`), independente de ser estático ou de
 * CMS: `Exercise` já espelha o conteúdo estático inteiro (prisma/seed.ts),
 * então "sumir da rotação" é o mesmo mecanismo para os dois casos —
 * `excludedSlugs()` abaixo é quem faz a exclusão valer em tempo de execução.
 */
export async function contestarExercicio(
  reporterId: string,
  slug: string,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  const exercise = await prisma.exercise.findUnique({ where: { slug } });
  if (!exercise) return { ok: false, error: "Exercício não encontrado." };

  await prisma.$transaction([
    prisma.contestedReport.create({ data: { exerciseId: exercise.id, reporterId, reason } }),
    prisma.exercise.update({ where: { id: exercise.id }, data: { reviewState: "CONTESTED" } }),
  ]);
  return { ok: true };
}

export interface ContestedReportSummary {
  id: string;
  exerciseId: string;
  exerciseSlug: string;
  reason: string;
  reporterName: string;
  createdAt: string;
  authoredByCms: boolean;
}

/** Fila de contestações em aberto — qualquer admin resolve qualquer uma. */
export async function listarContestados(): Promise<ContestedReportSummary[]> {
  const rows = await prisma.contestedReport.findMany({
    where: { status: "OPEN" },
    include: { exercise: true, reporter: true },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    exerciseId: r.exerciseId,
    exerciseSlug: r.exercise.slug,
    reason: r.reason,
    reporterName: r.reporter.displayName,
    createdAt: r.createdAt.toISOString(),
    authoredByCms: r.exercise.authorId !== null,
  }));
}

/**
 * Resolve uma contestação. `reincluir: true` devolve o item à rotação
 * (`PUBLISHED`) — cabível quando a contestação era falso-positivo, ou quando
 * o conteúdo já foi corrigido (código para item estático, editor do CMS para
 * item de CMS). `reincluir: false` mantém o item fora até alguém publicar
 * de novo pelo caminho normal. Todo relatório ABERTO do mesmo exercício
 * resolve junto — reincluir não pode deixar uma segunda denúncia pendente
 * escondendo o item de novo na próxima checagem.
 */
export async function resolverContestacao(
  resolverId: string,
  reportId: string,
  notes: string,
  reincluir: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const report = await prisma.contestedReport.findUnique({ where: { id: reportId } });
  if (!report) return { ok: false, error: "Contestação não encontrada." };

  await prisma.$transaction([
    prisma.contestedReport.updateMany({
      where: { exerciseId: report.exerciseId, status: "OPEN" },
      data: { status: "RESOLVED", resolvedAt: new Date(), resolverId, resolutionNotes: notes },
    }),
    ...(reincluir
      ? [prisma.exercise.update({ where: { id: report.exerciseId }, data: { reviewState: "PUBLISHED" } })]
      : []),
  ]);
  return { ok: true };
}

/**
 * Slugs fora de rotação por contestação — a lista negra que o merge em
 * tempo de execução aplica tanto a exercícios estáticos quanto de CMS.
 */
export async function excludedSlugs(): Promise<Set<string>> {
  const rows = await prisma.exercise.findMany({
    where: { reviewState: "CONTESTED" },
    select: { slug: true },
  });
  return new Set(rows.map((r) => r.slug));
}

// ────────────────────────────────────────────── auditoria por amostragem (A8.5)

/** Sorteia ~porcentagem% do acervo publicado — mesma lógica do CLI `auditoria:amostragem`. */
export function sortearAmostra(porcentagem: number): AuditSampleItem[] {
  return amostrarConteudo(COURSE, INDEX, porcentagem);
}

export interface AuditRecordInput {
  slug: string;
  outcome: "OK" | "FLAGGED";
  notes: string;
}

/**
 * Grava o resultado de uma rodada de auditoria de uma vez — um registro por
 * item sorteado. Item estático some do acervo publicado (§0) mas continua
 * existindo como espelho em `Exercise` (é assim que `contestarExercicio`
 * também resolve por slug), então o lookup funciona igual pros dois casos.
 */
export async function salvarAuditoriaAmostragem(
  auditorId: string,
  itens: AuditRecordInput[],
): Promise<{ ok: boolean; error?: string }> {
  const exercicios = await prisma.exercise.findMany({
    where: { slug: { in: itens.map((i) => i.slug) } },
    select: { id: true, slug: true },
  });
  const idPorSlug = new Map(exercicios.map((e) => [e.slug, e.id]));

  const faltando = itens.filter((i) => !idPorSlug.has(i.slug));
  if (faltando.length > 0) {
    return { ok: false, error: `Exercício não encontrado: ${faltando.map((i) => i.slug).join(", ")}` };
  }

  await prisma.sampleAuditRecord.createMany({
    data: itens.map((i) => ({
      exerciseId: idPorSlug.get(i.slug)!,
      auditorId,
      outcome: i.outcome,
      notes: i.notes,
    })),
  });
  return { ok: true };
}

export interface AuditRecordSummary {
  id: string;
  exerciseSlug: string;
  auditedAt: string;
  auditorName: string;
  outcome: string;
  notes: string | null;
}

/** Últimos registros — só pra tela provar que a auditoria persistiu. */
export async function historicoDeAuditorias(limit = 20): Promise<AuditRecordSummary[]> {
  const rows = await prisma.sampleAuditRecord.findMany({
    include: { exercise: true, auditor: true },
    orderBy: { auditedAt: "desc" },
    take: limit,
  });
  return rows.map((r) => ({
    id: r.id,
    exerciseSlug: r.exercise.slug,
    auditedAt: r.auditedAt.toISOString(),
    auditorName: r.auditor.displayName,
    outcome: r.outcome,
    notes: r.notes,
  }));
}

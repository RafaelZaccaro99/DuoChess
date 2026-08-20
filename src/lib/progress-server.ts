/**
 * Adaptador de servidor da porta de persistência (ADR-005).
 *
 * Traduz `ProgressState` — a forma que o domínio conhece — para as tabelas do
 * Prisma, e de volta. O domínio continua sem saber que banco existe: nada aqui é
 * importado por `src/domain`.
 *
 * Regra de escrita: uma sessão inteira grava numa transação. Se o Chess Score
 * subir mas a revisão não for agendada, o usuário fica com competência sem
 * reencontro marcado — estado incoerente é pior que erro visível.
 */

import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import {
  emptyProgress,
  type ProgressState,
  type OnboardingAnswers,
  type EntryPoint,
  type AttemptLog,
} from "@/domain/session";
import { stateFor } from "@/domain/mastery";
import type { MasteryState, SkillMastery } from "@/domain/types";
import type { ReviewCard, Grade, ReviewScope } from "@/domain/srs";
import type { ClassifiedError, ErrorCause, ErrorSeverity } from "@/domain/errors/taxonomy";
import { EMPTY_STREAK, type XPSource } from "@/domain/gamification";

/**
 * Id da linha no banco: o id do domínio, prefixado pelo usuário.
 *
 * O domínio nomeia os cartões por conteúdo (`sk:r1.cor-casa`), o que é estável e
 * legível mas se repete entre contas. O prefixo resolve isso sem o domínio saber
 * que existe multi-usuário.
 */
function dbCardId(userId: string, domainId: string): string {
  return `${userId}:${domainId}`;
}

function domainCardId(userId: string, dbId: string): string {
  const prefixo = `${userId}:`;
  return dbId.startsWith(prefixo) ? dbId.slice(prefixo.length) : dbId;
}

type SkillMasteryRow = Awaited<ReturnType<typeof prisma.skillMastery.findFirstOrThrow>>;

/** Traduz uma linha de `SkillMastery` para o tipo de domínio. Reaproveitado por games-server.ts. */
export function rowToMastery(m: SkillMasteryRow): SkillMastery {
  return {
    skillId: m.skillId,
    value: m.value,
    state: m.state as MasteryState,
    confidence: m.confidence,
    decayRatePerDay: m.decayRatePerDay,
    attempts: m.attempts,
    correctStreak: m.correctStreak,
    lastAssessedAt: m.lastAssessedAt?.toISOString() ?? null,
    appliedInGame: m.appliedInGame,
  };
}

// ─────────────────────────────────────────────────────────────── leitura

export async function loadProgress(userId: string): Promise<ProgressState> {
  const [user, masteries, reviews, streak, focus, xpEvents, attempts, diagnostic, gameErrors] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, include: { profile: true } }),
      prisma.skillMastery.findMany({ where: { userId } }),
      prisma.reviewSchedule.findMany({ where: { userId } }),
      prisma.streak.findUnique({ where: { userId } }),
      prisma.focusState.findUnique({ where: { userId } }),
      prisma.xPEvent.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
      prisma.exerciseAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        include: { errors: true },
      }),
      prisma.diagnosticResult.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } }),
      // Erros classificados a partir de análise de partida (A5) — sem isto o
      // motor adaptativo nunca vê o que aconteceu em partida, e metade do
      // propósito de D5/D6 (docs/02) fica sem efeito.
      prisma.errorClassification.findMany({
        where: { analysis: { game: { userId } } },
        orderBy: { createdAt: "asc" },
      }),
    ]);

  if (!user) throw new Error(`usuário inexistente: ${userId}`);

  const base = emptyProgress(user.createdAt.toISOString());

  const errors: ClassifiedError[] = [
    ...attempts.flatMap((attempt) =>
      attempt.errors.map((e) => ({
        cause: e.cause as ErrorCause,
        severity: e.severity as ErrorSeverity,
        confidence: e.confidence,
        explanation: e.explanation,
        skillId: e.skillId ?? undefined,
        at: e.createdAt.toISOString(),
      })),
    ),
    ...gameErrors.map((e) => ({
      cause: e.cause as ErrorCause,
      severity: e.severity as ErrorSeverity,
      confidence: e.confidence,
      explanation: e.explanation,
      skillId: e.skillId ?? undefined,
      ply: e.ply ?? undefined,
      at: e.createdAt.toISOString(),
    })),
  ];

  return {
    ...base,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    onboarding: profileToOnboarding(user.profile),
    entryPoint: (diagnostic?.kind as EntryPoint | undefined) ?? null,
    masteries: Object.fromEntries(masteries.map((m): [string, SkillMastery] => [m.skillId, rowToMastery(m)])),
    reviewCards: Object.fromEntries(
      reviews.map((r): [string, ReviewCard] => [
        domainCardId(userId, r.id),
        {
          id: domainCardId(userId, r.id),
          scope: r.scope as ReviewScope,
          skillId: r.skillId,
          exerciseId: r.exerciseId,
          stability: r.stability,
          difficulty: r.difficulty,
          reps: r.reps,
          lapses: r.lapses,
          lastGrade: (r.lastGrade as Grade | null) ?? null,
          usedHints: r.usedHints,
          triggeredMicrolesson: r.triggeredMicrolesson,
          lastReviewedAt: r.lastReviewedAt?.toISOString() ?? null,
          dueAt: r.dueAt.toISOString(),
        },
      ]),
    ),
    errors,
    xpEvents: xpEvents.map((e) => ({
      amount: e.amount,
      source: e.source as XPSource,
      decayApplied: e.decayApplied,
      at: e.createdAt.toISOString(),
    })),
    attempts: attempts.map(
      (a): AttemptLog => ({
        exerciseSlug: a.exerciseId,
        correct: a.correct,
        hintsUsed: a.hintsUsed,
        elapsedMs: a.elapsedMs,
        at: a.createdAt.toISOString(),
      }),
    ),
    streak: streak
      ? {
          current: streak.current,
          longest: streak.longest,
          lastActiveDate: streak.lastActiveDate?.toISOString().slice(0, 10) ?? null,
          freezesLeft: streak.freezesLeft,
        }
      : EMPTY_STREAK,
    focus: focus
      ? { value: focus.value, lastUpdatedAt: focus.lastUpdatedAt.toISOString() }
      : base.focus,
  };
}

// ─────────────────────────────────────────────────────────────── escrita

/**
 * Grava o estado inteiro.
 *
 * Só as tentativas NOVAS são inseridas — o cliente manda o histórico completo,
 * e reinserir tudo a cada sessão duplicaria o histórico e inflaria o XP.
 */
export async function saveProgress(userId: string, state: ProgressState): Promise<void> {
  const conhecidos = await prisma.skill.findMany({ select: { id: true } });
  const skillIds = new Set(conhecidos.map((s) => s.id));
  const exercicios = await prisma.exercise.findMany({ select: { id: true } });
  const exerciseIds = new Set(exercicios.map((e) => e.id));

  const [attemptsGravadas, xpGravados] = await Promise.all([
    prisma.exerciseAttempt.count({ where: { userId } }),
    prisma.xPEvent.count({ where: { userId } }),
  ]);

  const novasTentativas = state.attempts.slice(attemptsGravadas);
  const novosXP = state.xpEvents.slice(xpGravados);
  const errosNovos = state.errors.slice(-novasTentativas.length || 0);

  await prisma.$transaction(async (tx) => {
    for (const [skillId, m] of Object.entries(state.masteries)) {
      if (!skillIds.has(skillId)) continue; // habilidade fora do currículo semeado
      const dados = {
        value: Math.round(m.value),
        state: stateFor(m.value),
        confidence: m.confidence,
        decayRatePerDay: m.decayRatePerDay,
        attempts: m.attempts,
        correctStreak: m.correctStreak,
        lastAssessedAt: m.lastAssessedAt ? new Date(m.lastAssessedAt) : null,
        appliedInGame: m.appliedInGame,
      };
      await tx.skillMastery.upsert({
        where: { userId_skillId: { userId, skillId } },
        update: dados,
        create: { userId, skillId, ...dados },
      });
    }

    for (const card of Object.values(state.reviewCards)) {
      if (card.skillId && !skillIds.has(card.skillId)) continue;
      if (card.exerciseId && !exerciseIds.has(card.exerciseId)) continue;

      const dados = {
        stability: card.stability,
        difficulty: card.difficulty,
        reps: card.reps,
        lapses: card.lapses,
        lastGrade: card.lastGrade,
        usedHints: card.usedHints,
        triggeredMicrolesson: card.triggeredMicrolesson,
        lastReviewedAt: card.lastReviewedAt ? new Date(card.lastReviewedAt) : null,
        dueAt: new Date(card.dueAt),
      };
      // Chave por id determinístico, não pela única composta.
      //
      // A composta inclui skillId e exerciseId, e um cartão de conceito tem
      // exerciseId nulo. No Postgres, NULL não colide com NULL num índice único:
      // o upsert nunca encontraria a linha existente e tentaria recriá-la a cada
      // gravação. O id do domínio (`sk:<habilidade>` / `ex:<exercício>`) é
      // estável, e prefixá-lo com o usuário o torna único entre contas.
      await tx.reviewSchedule.upsert({
        where: { id: dbCardId(userId, card.id) },
        update: dados,
        create: {
          id: dbCardId(userId, card.id),
          userId,
          scope: card.scope,
          skillId: card.skillId,
          exerciseId: card.exerciseId,
          ...dados,
        },
      });
    }

    for (const attempt of novasTentativas) {
      if (!exerciseIds.has(attempt.exerciseSlug)) continue;
      const criada = await tx.exerciseAttempt.create({
        data: {
          userId,
          exerciseId: attempt.exerciseSlug,
          answer: {},
          correct: attempt.correct,
          hintsUsed: attempt.hintsUsed,
          elapsedMs: attempt.elapsedMs,
          phase: "INDEPENDENT",
          createdAt: new Date(attempt.at),
        },
      });

      // A classificação de erro pendura na tentativa que a produziu.
      const erro = errosNovos.find((e) => e.at === attempt.at);
      if (erro) {
        await tx.errorClassification.create({
          data: {
            attemptId: criada.id,
            skillId: erro.skillId && skillIds.has(erro.skillId) ? erro.skillId : null,
            cause: erro.cause,
            severity: erro.severity,
            confidence: erro.confidence,
            explanation: erro.explanation,
            createdAt: new Date(erro.at),
          },
        });
        await tx.exerciseAttempt.update({
          where: { id: criada.id },
          data: { errorCause: erro.cause },
        });
      }
    }

    for (const evento of novosXP) {
      await tx.xPEvent.create({
        data: {
          userId,
          amount: evento.amount,
          source: evento.source,
          decayApplied: evento.decayApplied,
          createdAt: new Date(evento.at),
        },
      });
    }

    const streak = {
      current: state.streak.current,
      longest: state.streak.longest,
      lastActiveDate: state.streak.lastActiveDate ? new Date(state.streak.lastActiveDate) : null,
      freezesLeft: state.streak.freezesLeft,
    };
    await tx.streak.upsert({ where: { userId }, update: streak, create: { userId, ...streak } });

    const focus = { value: state.focus.value, lastUpdatedAt: new Date(state.focus.lastUpdatedAt) };
    await tx.focusState.upsert({ where: { userId }, update: focus, create: { userId, ...focus } });

    if (state.onboarding) {
      const perfil = onboardingToProfile(state.onboarding);
      await tx.profile.upsert({
        where: { userId },
        update: perfil,
        create: { userId, ...perfil },
      });
    }

    await tx.user.update({ where: { id: userId }, data: { updatedAt: new Date() } });
  });
}

export interface DiagnosticResultPayload {
  /** Chess Score por competência (0..100), como `ChessScore.components`. */
  estimated: Record<string, number>;
  ratingBand: string;
  reliable: boolean;
}

export async function saveDiagnostic(
  userId: string,
  entryPoint: EntryPoint,
  answers: OnboardingAnswers,
  result: DiagnosticResultPayload,
): Promise<void> {
  await prisma.diagnosticResult.create({
    data: {
      userId,
      kind: entryPoint,
      answers: answers as unknown as Prisma.InputJsonValue,
      estimated: result.estimated as unknown as Prisma.InputJsonValue,
      ratingBand: result.ratingBand,
      reliable: result.reliable,
    },
  });
}

// ─────────────────────────────────────────────────────── mapeamento perfil

type ProfileRow = NonNullable<
  Awaited<ReturnType<typeof prisma.profile.findUnique>>
>;

function profileToOnboarding(profile: ProfileRow | null): OnboardingAnswers | null {
  if (!profile) return null;
  return {
    experience: profile.experienceLevel,
    tournaments: profile.playsTournaments ? "REGULAR" : "NUNCA",
    onlineRating: profile.onlineRatingRapid ? String(profile.onlineRatingRapid) : "NAO_JOGO",
    goal: "SUBIR_RATING",
    weeklyMinutes: profile.weeklyMinutes,
    rankings: profile.showRankings,
  };
}

function onboardingToProfile(answers: OnboardingAnswers) {
  return {
    experienceLevel: answers.experience,
    playsTournaments: answers.tournaments !== "NUNCA",
    weeklyMinutes: answers.weeklyMinutes,
    showRankings: answers.rankings,
    platforms: [] as string[],
  };
}

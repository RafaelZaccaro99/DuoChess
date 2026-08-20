/**
 * Escrita de eventos de analytics (A8).
 *
 * Contrato de docs/08: `{ name, userId, timestamp, sessionId, props }`, nomes em
 * snake_case, verbo no passado. `AnalyticsEvent` já existia no schema desde a
 * fundação, migrado, mas nunca escrito — este módulo é o único produtor.
 *
 * Nunca lança para o chamador: instrumentação não pode derrubar a experiência,
 * mesmo espírito do ADR-006 sobre a engine nunca travar a interface.
 */

import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { effectiveMastery } from "@/domain/mastery";
import {
  countTransferredSkillsAcrossUsers,
  type MultiUserTransferResult,
} from "@/domain/score/north-star";
import type { SkillMastery } from "@/domain/types";
import type { ReviewCard } from "@/domain/srs";

/** Os 27 eventos do MVP, ao pé da letra de docs/08. */
export const ANALYTICS_EVENT_NAMES = [
  "onboarding_started",
  "onboarding_completed",
  "diagnostic_started",
  "diagnostic_completed",
  "lesson_started",
  "lesson_phase_completed",
  "exercise_attempted",
  "hint_used",
  "mastery_changed",
  "chess_score_updated",
  "review_due_shown",
  "review_completed",
  "microlesson_triggered",
  "bottleneck_identified",
  "session_summary_viewed",
  "pgn_imported",
  "human_analysis_completed",
  "human_analysis_skipped",
  "engine_analysis_completed",
  "error_classified",
  "game_started",
  "game_finished",
  "skill_transferred",
  "xp_awarded",
  "streak_extended",
  "focus_depleted",
  "focus_recovered",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

export async function track(
  name: AnalyticsEventName,
  userId: string | null,
  props: Record<string, unknown> = {},
  sessionId?: string,
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: { name, userId, sessionId, props: props as Prisma.InputJsonObject },
    });
  } catch (error) {
    console.error(`analytics: falha ao gravar "${name}"`, error);
  }
}

export type NorthStarResult = MultiUserTransferResult;

/**
 * North Star computada sobre dados reais do Postgres, não sobre um
 * ProgressState fabricado em teste — é o que docs/09 pede em "calculável a
 * partir de eventos reais".
 *
 * `nowIso` ancora tanto a decadência de domínio (`effectiveMastery`) quanto o
 * corte "não regrediu na revisão seguinte" — não filtra por atividade na
 * semana, é o retrato de quem está transferido NAQUELE instante. O nome do
 * parâmetro é semana porque é assim que o produto deve rodar isto: um corte
 * por semana, não porque a função em si seja uma janela.
 */
export async function computeNorthStarForWeek(nowIso: string): Promise<NorthStarResult> {
  const [masteryRows, reviewRows] = await Promise.all([
    prisma.skillMastery.findMany(),
    prisma.reviewSchedule.findMany({ where: { scope: "SKILL" } }),
  ]);

  const masteriesByUser = new Map<string, SkillMastery[]>();
  for (const m of masteryRows) {
    const mastery: SkillMastery = {
      skillId: m.skillId,
      // Decaída no instante do corte — o mesmo valor que o app mostra ao vivo,
      // não o número cru gravado na última tentativa.
      value: effectiveMastery(
        {
          skillId: m.skillId,
          value: m.value,
          state: m.state as SkillMastery["state"],
          confidence: m.confidence,
          decayRatePerDay: m.decayRatePerDay,
          attempts: m.attempts,
          correctStreak: m.correctStreak,
          lastAssessedAt: m.lastAssessedAt?.toISOString() ?? null,
          appliedInGame: m.appliedInGame,
        },
        nowIso,
      ),
      state: m.state as SkillMastery["state"],
      confidence: m.confidence,
      decayRatePerDay: m.decayRatePerDay,
      attempts: m.attempts,
      correctStreak: m.correctStreak,
      lastAssessedAt: m.lastAssessedAt?.toISOString() ?? null,
      appliedInGame: m.appliedInGame,
    };
    masteriesByUser.set(m.userId, [...(masteriesByUser.get(m.userId) ?? []), mastery]);
  }

  const reviewsByUser = new Map<string, ReviewCard[]>();
  for (const r of reviewRows) {
    if (!r.skillId) continue;
    const card: ReviewCard = {
      id: r.id,
      scope: "SKILL",
      skillId: r.skillId,
      exerciseId: r.exerciseId,
      stability: r.stability,
      difficulty: r.difficulty,
      reps: r.reps,
      lapses: r.lapses,
      lastGrade: (r.lastGrade as ReviewCard["lastGrade"]) ?? null,
      usedHints: r.usedHints,
      triggeredMicrolesson: r.triggeredMicrolesson,
      lastReviewedAt: r.lastReviewedAt?.toISOString() ?? null,
      dueAt: r.dueAt.toISOString(),
    };
    reviewsByUser.set(r.userId, [...(reviewsByUser.get(r.userId) ?? []), card]);
  }

  return countTransferredSkillsAcrossUsers({ masteriesByUser, reviewsByUser });
}

export interface EventCount {
  name: string;
  count: number;
}

/** Prova de vida do pipeline: quantos eventos de cada nome chegaram nas últimas 24h. */
export async function eventCountsLast24h(): Promise<EventCount[]> {
  const desde = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const grupos = await prisma.analyticsEvent.groupBy({
    by: ["name"],
    where: { createdAt: { gte: desde } },
    _count: { name: true },
    orderBy: { _count: { name: "desc" } },
  });
  return grupos.map((g) => ({ name: g.name, count: g._count.name }));
}

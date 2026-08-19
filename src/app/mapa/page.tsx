"use client";

/**
 * Mapa do caminho.
 *
 * Não é uma trilha linear: as unidades são desbloqueadas pelo grafo de
 * dependências. Quem já domina R1 vê R2 aberta; quem não domina R4 vê R5 com o
 * pré-requisito nomeado, em vez de um cadeado sem explicação.
 */

import Link from "next/link";
import { useMemo } from "react";
import { useProgress } from "@/components/ProgressProvider";
import { StatusBar } from "@/components/ui/StatusBar";
import { ProgressBar } from "@/components/ui/Meters";
import { COURSE } from "@/content";
import { buildIndex, nextLesson, skillIndexForScore, unitProgress } from "@/domain/curriculum";
import { masteryMap, masteryList } from "@/domain/session";
import { computeChessScore } from "@/domain/score/chess-score";
import { planSession } from "@/domain/adaptive";
import { dueQueue } from "@/domain/srs";
import { COMPETENCY_LABELS } from "@/domain/types";
import { ERROR_TAXONOMY } from "@/domain/errors/taxonomy";
import { cn } from "@/lib/cn";

const INDEX = buildIndex(COURSE);
const SKILL_INDEX = skillIndexForScore(INDEX);

export default function MapaPage() {
  const { state, ready, storageLabel } = useProgress();

  const view = useMemo(() => {
    if (!state) return null;
    const now = new Date().toISOString();
    const masteries = masteryMap(state);

    return {
      now,
      units: unitProgress(INDEX, masteries, now),
      score: computeChessScore(masteryList(state), SKILL_INDEX, now),
      next: nextLesson(INDEX, masteries, now),
      due: dueQueue(Object.values(state.reviewCards), now),
      plan: planSession({
        index: INDEX,
        masteries,
        reviewCards: Object.values(state.reviewCards),
        errors: state.errors,
        focus: state.focus,
        nowIso: now,
      }),
    };
  }, [state]);

  if (!ready || !state || !view) {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-3xl px-5 py-10 text-ink-muted">Carregando seu progresso…</main>
      </>
    );
  }

  const recruta = COURSE.leagues[0]!;
  const recrutaUnits = view.units.filter((u) => u.leagueId === "recruta");
  const concluidas = recrutaUnits.filter((u) => u.availability === "MASTERED").length;

  return (
    <>
      <StatusBar />
      <main className="mx-auto max-w-3xl px-5 py-8">
        {!state.onboarding && (
          <div className="mb-6 rounded-xl2 border border-brand/40 bg-brand-soft p-4">
            <p className="text-sm font-semibold">Você ainda não fez o onboarding.</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              Seis perguntas rápidas para dimensionar sua trilha e sua sessão diária.
            </p>
            <Link href="/onboarding" className="btn-primary mt-3">
              Fazer agora
            </Link>
          </div>
        )}

        {/* ── Bloqueio de avanço: a interface diz por que, não só que */}
        {view.plan.advancementBlocked && view.plan.blockReason && (
          <div className="mb-6 rounded-xl2 border border-warn/40 bg-warn/10 p-4">
            <p className="text-sm font-semibold text-warn">Avanço pausado de propósito</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{view.plan.blockReason}</p>
          </div>
        )}

        <section>
          <div className="flex items-baseline justify-between gap-3">
            <h1 className="text-xl font-bold tracking-tight">Liga {recruta.title}</h1>
            <span className="text-xs text-ink-faint">
              {recruta.ratingMin}–{recruta.ratingMax}
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar
              value={concluidas}
              max={recrutaUnits.length}
              tone="mastery"
              label="Unidades concluídas na Liga Recruta"
            />
            <p className="mt-2 text-xs text-ink-faint">
              {concluidas} de {recrutaUnits.length} unidades com domínio consolidado
            </p>
          </div>
        </section>

        <ol className="mt-6 space-y-3">
          {recrutaUnits.map((unit) => {
            const definition = INDEX.units.get(unit.unitId)!;
            const lessonId = definition.lessons[0]?.id;
            const bloqueada = unit.availability === "LOCKED";
            const dominada = unit.availability === "MASTERED";

            return (
              <li
                key={unit.unitId}
                className={cn(
                  "card",
                  bloqueada && "opacity-60",
                  !bloqueada && !dominada && "border-brand/50",
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 shrink-0 text-lg leading-none",
                      dominada ? "text-mastery" : bloqueada ? "text-ink-faint" : "text-brand",
                    )}
                  >
                    {dominada ? "✓" : bloqueada ? "○" : "●"}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold">
                      {unit.unitId.toUpperCase()} · {unit.title}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-ink-muted">{definition.summary}</p>

                    {bloqueada ? (
                      <p className="mt-3 text-xs text-ink-faint">
                        Requer{" "}
                        {unit.missingPrerequisiteUnits
                          .map((id) => INDEX.units.get(id)?.title ?? id)
                          .join(", ")}
                        .
                      </p>
                    ) : (
                      <>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="w-32">
                            <ProgressBar
                              value={unit.mastery}
                              tone="mastery"
                              label={`Domínio da unidade ${unit.title}`}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-ink-muted">
                            domínio {unit.mastery}/100 · {unit.masteredCount}/{unit.skillCount}{" "}
                            habilidades
                          </span>
                        </div>

                        {lessonId && (
                          <Link
                            href={`/licao/${lessonId}`}
                            className={dominada ? "btn-ghost mt-3" : "btn-primary mt-3"}
                          >
                            {dominada ? "Revisar" : unit.mastery > 0 ? "Continuar" : "Começar"}
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* ── Gargalo */}
        <section className="mt-8 card">
          <p className="label">Seu gargalo agora</p>
          {view.plan.bottleneckCause ? (
            <>
              <p className="mt-2 text-sm font-semibold">
                {ERROR_TAXONOMY[view.plan.bottleneckCause].label}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                {ERROR_TAXONOMY[view.plan.bottleneckCause].intervention}
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm font-semibold">
                {COMPETENCY_LABELS[view.score.bottleneck ?? "rules"]}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                {view.score.nextRecommendation}
              </p>
            </>
          )}
        </section>

        {view.due.length > 0 && (
          <section className="mt-4 card border-focus/40">
            <p className="label text-focus">Revisão espaçada</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {view.due.length} {view.due.length === 1 ? "item venceu" : "itens venceram"}. A revisão
              chega junto com as lições da sessão, no ponto em que você está prestes a esquecer.
            </p>
          </section>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/perfil" className="card transition-colors hover:border-line-strong">
            <p className="label">Perfil</p>
            <p className="mt-2 text-sm text-ink-muted">
              Chess Score por competência, força, gargalo e DNA dos seus erros.
            </p>
          </Link>
          <div className="card">
            <p className="label">Ligas seguintes</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Estrategista a Candidato a título estão declaradas na arquitetura e ainda sem conteúdo
              publicado. Elas aparecem vazias porque estão vazias.
            </p>
          </div>
        </section>

        <p className="mt-8 text-xs leading-relaxed text-ink-faint">
          Seu progresso está salvo em: {storageLabel}. Ainda não há conta nem sincronização entre
          dispositivos — isso entra na Sprint 3, com o adaptador de servidor.
        </p>
      </main>
    </>
  );
}

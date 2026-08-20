"use client";

/**
 * A sessão de hoje.
 *
 * Aqui o motor adaptativo finalmente roda. `planSession` já existia e era
 * chamado no mapa, mas só o aviso de bloqueio era usado — os slots, que são a
 * sessão montada, nunca chegavam ao aluno.
 *
 * Cada item mostra POR QUE está aqui. Uma sessão que só entrega exercícios é um
 * banco de puzzles; o que a torna uma sessão é a composição ser justificada.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useProgress } from "@/components/ProgressProvider";
import { StatusBar } from "@/components/ui/StatusBar";
import { ProgressBar } from "@/components/ui/Meters";
import { ExecutorDeExercicios } from "@/components/exercicio/ExecutorDeExercicios";
import { useExecutorDeExercicios } from "@/components/exercicio/useExecutorDeExercicios";
import { Microlicao } from "@/components/exercicio/Microlicao";
import { useCongelado } from "@/components/exercicio/useCongelado";
import { COURSE } from "@/content";
import { buildIndex, skillIndexForScore } from "@/domain/curriculum";
import { mergeExercises } from "@/domain/curriculum/merge";
import { planSession } from "@/domain/adaptive";
import { exerciciosPublicadosTodos, slugsContestados } from "@/app/actions";
import type { ExerciseDef } from "@/content/schema";
import { resolverSessao, type ItemDaSessao } from "@/domain/adaptive/resolver";
import { montarMicrolicao, type Microlicao as MicrolicaoDef } from "@/domain/adaptive/microlicao";
import { computeChessScore } from "@/domain/score/chess-score";
import { masteryList, masteryMap, totalXP } from "@/domain/session";
import { dueQueue } from "@/domain/srs";
import { COMPETENCY_LABELS } from "@/domain/types";
import { ERROR_TAXONOMY } from "@/domain/errors/taxonomy";
import { track } from "@/lib/track";

const INDEX = buildIndex(COURSE);
const SKILL_INDEX = skillIndexForScore(INDEX);
const SKILL_TITLES = Object.fromEntries([...INDEX.skills.values()].map((s) => [s.id, s.title]));

const ROTULO_DO_SLOT: Record<ItemDaSessao["kind"], string> = {
  BOTTLENECK: "Gargalo",
  REVIEW: "Revisão",
  NEW: "Conteúdo novo",
  PRACTICAL: "Aplicação",
};

export default function SessaoPage() {
  const router = useRouter();
  const { state, ready, update } = useProgress();
  const [microlicao, setMicrolicao] = useState<MicrolicaoDef | null>(null);

  // Exercícios publicados via CMS (A7) — sacados antes de montar o índice que o
  // motor adaptativo usa, senão "publicar sem deploy" nunca chegaria à sessão.
  const [cms, setCms] = useState<ExerciseDef[] | null>(null);
  useEffect(() => {
    exerciciosPublicadosTodos().then(setCms);
  }, []);

  // Contestados (A8) somem da rotação — estático ou de CMS.
  const [excluidos, setExcluidos] = useState<string[] | null>(null);
  useEffect(() => {
    slugsContestados().then(setExcluidos);
  }, []);

  /**
   * A sessão é montada UMA vez e congelada.
   *
   * Recalcular a cada resposta mudaria os itens debaixo do aluno: acertar move o
   * domínio, o que move o gargalo, o que reordenaria a sessão em andamento.
   */
  const plano = useCongelado(ready && state !== null && cms !== null && excluidos !== null, () => {
    if (!state || !cms || !excluidos) return null;
    const now = new Date().toISOString();
    const masteries = masteryMap(state);
    const index = mergeExercises(INDEX, cms, new Set(excluidos));

    const plan = planSession({
      index,
      masteries,
      reviewCards: Object.values(state.reviewCards),
      errors: state.errors,
      focus: state.focus,
      nowIso: now,
    });

    const resolvida = resolverSessao({
      index,
      slots: plan.slots,
      masteries,
      attempts: state.attempts,
      nowIso: now,
    });

    return { plan, resolvida };
  });

  const itens = useMemo(() => plano?.resolvida.itens ?? [], [plano]);
  // Minipartida é convite, não item respondível — não entra no laço do executor.
  const itensExercicio = useMemo(() => itens.filter((i) => i.tipo === "exercicio"), [itens]);
  const itensMinipartida = useMemo(() => itens.filter((i) => i.tipo === "minipartida"), [itens]);
  const exercicios = useMemo(() => itensExercicio.map((i) => i.exercise), [itensExercicio]);

  const executor = useExecutorDeExercicios({ itens: exercicios });

  // Erro conceitual dispara o reensino que o feedback promete.
  const efeitos = executor.efeitos;
  const causaConceitual =
    efeitos && !efeitos.evaluation.correct && efeitos.microlesson ? efeitos.evaluation.cause : null;

  const avancar = useCallback(() => {
    if (causaConceitual && state && executor.exercicio) {
      const skillId = executor.exercicio.skillIds[0];
      const montada = skillId
        ? montarMicrolicao({
            index: INDEX,
            cause: causaConceitual,
            skillId,
            attempts: state.attempts,
            excluirSlug: executor.exercicio.slug,
          })
        : null;

      if (montada) {
        setMicrolicao(montada);
        return;
      }
    }
    executor.avancar();
  }, [causaConceitual, state, executor]);

  const score = useMemo(() => {
    if (!state) return null;
    return computeChessScore(masteryList(state), SKILL_INDEX, new Date().toISOString());
  }, [state]);

  const sessaoAvisadaRef = useState(() => ({ avisada: false }))[0];
  useEffect(() => {
    if (!plano || !state || sessaoAvisadaRef.avisada) return;
    sessaoAvisadaRef.avisada = true;
    const vencidosAgora = dueQueue(Object.values(state.reviewCards), new Date().toISOString()).length;
    track("review_due_shown", { vencidos: vencidosAgora });
    if (plano.plan.bottleneckCause) {
      track("bottleneck_identified", { cause: plano.plan.bottleneckCause });
    }
  }, [plano, state, sessaoAvisadaRef]);

  useEffect(() => {
    if (!executor.concluido) return;
    track("session_summary_viewed");
    if (score) track("chess_score_updated", { total: score.total });
  }, [executor.concluido, score]);

  if (!ready || !state || !plano || !score) {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-2xl px-5 py-10 text-ink-muted">Montando sua sessão…</main>
      </>
    );
  }

  const { plan, resolvida } = plano;
  const vencidos = dueQueue(Object.values(state.reviewCards), new Date().toISOString()).length;

  if (microlicao) {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-2xl px-5 py-6">
          <Microlicao
            microlicao={microlicao}
            skillTitles={SKILL_TITLES}
            onConcluir={() => {
              setMicrolicao(null);
              executor.avancar();
            }}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <StatusBar />
      <main className="mx-auto max-w-2xl px-5 py-6">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/mapa" className="text-sm text-ink-muted hover:text-ink" aria-label="Voltar ao mapa">
            ←
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Sessão de hoje</p>
            {!executor.concluido && itensExercicio.length > 0 && (
              <p className="text-xs text-ink-faint">
                {executor.indice + 1} de {itensExercicio.length} ·{" "}
                {ROTULO_DO_SLOT[itensExercicio[executor.indice]?.kind ?? "NEW"]}
              </p>
            )}
          </div>
          <div className="w-24">
            <ProgressBar
              value={executor.concluido ? itensExercicio.length : executor.indice}
              max={Math.max(1, itensExercicio.length)}
              tone="brand"
              label="Progresso da sessão"
            />
          </div>
        </div>

        {/* O motor interrompeu o avanço — e diz por quê. */}
        {plan.advancementBlocked && plan.blockReason && !executor.concluido && (
          <div className="mb-5 rounded-xl2 border border-warn/40 bg-warn/10 p-4">
            <p className="text-sm font-semibold text-warn">Avanço pausado de propósito</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{plan.blockReason}</p>
          </div>
        )}

        {itens.length === 0 && (
          <div className="card">
            <p className="text-sm font-semibold">Não há o que montar para hoje.</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Isso acontece quando nenhuma unidade está desbloqueada e nada venceu na revisão.
              Comece por uma lição para o motor ter o que trabalhar.
            </p>
            <Link href="/mapa" className="btn-primary mt-4">
              Ver o mapa
            </Link>
          </div>
        )}

        {/* Convite à minipartida — não bloqueia nem conta como tentativa. */}
        {itensMinipartida.length > 0 && !executor.concluido && (
          <div className="mb-5 card border-brand/30">
            <p className="label text-brand">Aplicação em partida</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              {itensMinipartida[0]!.rationale}
            </p>
            <Link href="/jogar" className="btn-primary mt-3">
              Jogar uma minipartida
            </Link>
          </div>
        )}

        {!executor.concluido && executor.exercicio && (
          <ExecutorDeExercicios
            exercicio={executor.exercicio}
            dicasUsadas={executor.dicasUsadas}
            efeitos={executor.efeitos}
            ehUltimo={executor.ehUltimo}
            skillTitles={SKILL_TITLES}
            onResponder={executor.responder}
            onPedirDica={executor.pedirDica}
            onAvancar={avancar}
            motivo={itensExercicio[executor.indice]?.rationale}
            rotuloDoFim="Ver resumo do dia"
          />
        )}

        {executor.concluido && (
          <div className="space-y-5">
            <h1 className="text-2xl font-bold tracking-tight">Sessão de hoje concluída</h1>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="card border-xp/30">
                <p className="label text-xp">Atividade</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-xp">{totalXP(state)} XP</p>
                <p className="mt-1 text-xs text-ink-muted">
                  sequência de {state.streak.current}{" "}
                  {state.streak.current === 1 ? "dia" : "dias"}
                </p>
              </div>
              <div className="card border-mastery/30">
                <p className="label text-mastery">Competência</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-mastery">
                  {score.total}
                  <span className="text-sm font-normal text-ink-faint"> / 1000</span>
                </p>
                <p className="mt-1 text-xs text-ink-muted">Chess Score</p>
              </div>
            </div>

            <div className="card space-y-3">
              <div>
                <p className="label">Como esta sessão foi montada</p>
                <ul className="mt-2 space-y-1 text-sm text-ink-muted">
                  {(["BOTTLENECK", "REVIEW", "NEW"] as const).map((kind) => {
                    const n = itensExercicio.filter((i) => i.kind === kind).length;
                    if (n === 0) return null;
                    return (
                      <li key={kind}>
                        {n} {n === 1 ? "item" : "itens"} de {ROTULO_DO_SLOT[kind].toLowerCase()}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {plan.bottleneckCause && (
                <div>
                  <p className="label">Seu gargalo</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {ERROR_TAXONOMY[plan.bottleneckCause].label} —{" "}
                    {ERROR_TAXONOMY[plan.bottleneckCause].intervention}
                  </p>
                </div>
              )}

              {!plan.bottleneckCause && score.bottleneck && (
                <div>
                  <p className="label">Seu gargalo</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {COMPETENCY_LABELS[score.bottleneck]} — {score.nextRecommendation}
                  </p>
                </div>
              )}
            </div>

            {vencidos > 0 && (
              <div className="card border-focus/40">
                <p className="label text-focus">Ainda há revisão vencida</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {vencidos} {vencidos === 1 ? "item venceu" : "itens venceram"} e não coube
                  {vencidos === 1 ? "" : "ram"} nesta sessão. A fila de revisão dá conta deles.
                </p>
                <Link href="/revisao" className="btn-primary mt-3">
                  Ir para a revisão
                </Link>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-primary" onClick={() => router.push("/mapa")}>
                Voltar ao mapa
              </button>
              <Link href="/perfil" className="btn-ghost">
                Ver meu perfil
              </Link>
            </div>
          </div>
        )}

        {/* Slot que não virou item aparece com o motivo, em vez de sumir. */}
        {resolvida.naoResolvidos.length > 0 && !executor.concluido && (
          <p className="mt-6 text-xs leading-relaxed text-ink-faint">
            {resolvida.naoResolvidos.length}{" "}
            {resolvida.naoResolvidos.length === 1 ? "espaço da sessão ficou" : "espaços da sessão ficaram"}{" "}
            de fora: {[...new Set(resolvida.naoResolvidos.map((n) => n.motivo))].join("; ")}.
          </p>
        )}
      </main>
    </>
  );
}

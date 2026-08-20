"use client";

/**
 * Execução da lição, nas cinco fases do spec:
 * apresentação → demonstração → guiado → independente → prova de domínio.
 *
 * Os exercícios já vêm marcados com a fase, e a fase pesa no ganho de domínio:
 * acertar com andaime não vale o mesmo que acertar sozinho.
 */

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useProgress } from "@/components/ProgressProvider";
import { StatusBar } from "@/components/ui/StatusBar";
import { ProgressBar } from "@/components/ui/Meters";
import { Board } from "@/components/board/Board";
import { ExecutorDeExercicios, negrito } from "@/components/exercicio/ExecutorDeExercicios";
import { useExecutorDeExercicios } from "@/components/exercicio/useExecutorDeExercicios";
import { Fontes } from "@/components/lesson/Fontes";
import { COURSE } from "@/content";
import { buildIndex, nextStep, skillIndexForScore } from "@/domain/curriculum";
import { computeChessScore } from "@/domain/score/chess-score";
import { applyFocusRecovery, masteryList, masteryMap, totalXP } from "@/domain/session";
import { COMPETENCY_LABELS } from "@/domain/types";

const INDEX = buildIndex(COURSE);
const SKILL_INDEX = skillIndexForScore(INDEX);
const SKILL_TITLES = Object.fromEntries([...INDEX.skills.values()].map((s) => [s.id, s.title]));

const PHASE_LABEL = {
  GUIDED: "Execução guiada",
  INDEPENDENT: "Execução independente",
  MASTERY_TEST: "Prova de domínio",
  REVIEW: "Revisão",
} as const;

export default function LessonPage() {
  const params = useParams<{ lessonId: string }>();
  const router = useRouter();
  const { state, ready, update } = useProgress();

  const lesson = INDEX.lessons.get(params.lessonId);

  const fontesDaLicao = useMemo(() => {
    if (!lesson) return [];
    const skillIds = new Set(lesson.exercises.flatMap((e) => e.skillIds));
    return [
      ...new Set([
        ...[...skillIds].flatMap((id) => INDEX.skills.get(id)?.sources ?? []),
        ...lesson.exercises.flatMap((e) => e.sources),
      ]),
    ];
  }, [lesson]);

  // Fases 1 e 2 (apresentação e demonstração) são da lição; da fase 3 em diante
  // é o mesmo laço de qualquer outra tela de exercício.
  const [emExercicios, setEmExercicios] = useState(false);

  const executor = useExecutorDeExercicios({ itens: lesson?.exercises ?? [] });

  const xpDaSessao = useMemo(() => {
    if (!state) return 0;
    return state.xpEvents
      .slice(-Math.max(0, executor.indice + (executor.efeitos ? 1 : 0)))
      .reduce((soma, e) => soma + e.amount, 0);
  }, [state, executor.indice, executor.efeitos]);

  const score = useMemo(() => {
    if (!state) return null;
    return computeChessScore(masteryList(state), SKILL_INDEX, new Date().toISOString());
  }, [state]);

  const proximo = useMemo(() => {
    if (!state) return null;
    return nextStep(INDEX, masteryMap(state), new Date().toISOString());
  }, [state]);

  if (!ready || !state) {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-2xl px-5 py-10 text-ink-muted">Carregando…</main>
      </>
    );
  }

  if (!lesson) {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-2xl px-5 py-10">
          <h1 className="text-xl font-bold">Lição não encontrada</h1>
          <p className="mt-2 text-sm text-ink-muted">
            O identificador “{params.lessonId}” não existe no currículo publicado.
          </p>
          <Link href="/mapa" className="btn-primary mt-5">
            Voltar ao mapa
          </Link>
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
            <p className="truncate text-sm font-semibold">{lesson.title}</p>
            {emExercicios && !executor.concluido && (
              <p className="text-xs text-ink-faint">
                {executor.indice + 1} de {lesson.exercises.length} ·{" "}
                {executor.exercicio && PHASE_LABEL[executor.exercicio.phase]}
              </p>
            )}
          </div>
          <div className="w-24">
            <ProgressBar
              value={executor.concluido ? lesson.exercises.length : executor.indice}
              max={lesson.exercises.length}
              tone="brand"
              label="Progresso da lição"
            />
          </div>
        </div>

        {/* ── Fases 1 e 2: apresentação e demonstração */}
        {!emExercicios && (
          <div className="space-y-5">
            <div className="card">
              <p className="label">Apresentação</p>
              <div className="mt-3 space-y-3">
                {lesson.concept.split("\n\n").map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-sm leading-relaxed text-ink-muted"
                    dangerouslySetInnerHTML={{ __html: negrito(paragraph) }}
                  />
                ))}
              </div>
            </div>

            {lesson.demo && (
              <div className="card">
                <p className="label">Demonstração</p>
                <div className="mt-3">
                  <Board fen={lesson.demo.fen} marks={lesson.demo.marks} mode="none" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{lesson.demo.caption}</p>
              </div>
            )}

            <Fontes sourceIds={fontesDaLicao} />

            <button
              type="button"
              className="btn-primary w-full"
              onClick={() => setEmExercicios(true)}
            >
              Praticar
            </button>
          </div>
        )}

        {/* ── Fases 3, 4 e 5, no laço compartilhado */}
        {emExercicios && !executor.concluido && executor.exercicio && (
          <ExecutorDeExercicios
            exercicio={executor.exercicio}
            dicasUsadas={executor.dicasUsadas}
            efeitos={executor.efeitos}
            ehUltimo={executor.ehUltimo}
            skillTitles={SKILL_TITLES}
            onResponder={executor.responder}
            onPedirDica={executor.pedirDica}
            onAvancar={executor.avancar}
          />
        )}

        {/* ── Resumo de sessão */}
        {executor.concluido && score && (
          <div className="space-y-5">
            <h1 className="text-2xl font-bold tracking-tight">Sessão concluída</h1>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="card border-xp/30">
                <p className="label text-xp">Atividade</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-xp">+{xpDaSessao} XP</p>
                <p className="mt-1 text-xs text-ink-muted">
                  Total: {totalXP(state)} · sequência de {state.streak.current}{" "}
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

            <div className="card">
              <p className="text-sm leading-relaxed text-ink-muted">
                XP mede seu esforço. O Chess Score mede o que você domina. São coisas diferentes, e
                é assim de propósito: nenhuma quantidade de exercícios fáceis move o segundo número.
              </p>
            </div>

            <div className="card space-y-3">
              <div>
                <p className="label">Sua força</p>
                <p className="mt-1 text-sm text-ink">
                  {score.strength ? COMPETENCY_LABELS[score.strength] : "ainda sem dados"}
                </p>
              </div>
              <div>
                <p className="label">Seu gargalo</p>
                <p className="mt-1 text-sm text-ink">
                  {score.bottleneck ? COMPETENCY_LABELS[score.bottleneck] : "ainda sem dados"}
                </p>
              </div>
              <div>
                <p className="label">Próximo passo</p>
                <p className="mt-1 text-sm text-ink-muted">
                  {proximo
                    ? `${proximo.unitTitle} — é a unidade desbloqueada com menor domínio.`
                    : score.nextRecommendation}
                </p>
              </div>
            </div>

            {state.focus.value < 60 && (
              <div className="card border-focus/50">
                <p className="label text-focus">Foco em {state.focus.value}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Você errou várias vezes seguidas. Uma pausa recupera Foco — e recuperar Foco não
                  se compra, aqui ou em qualquer plano.
                </p>
                <button
                  type="button"
                  className="btn-ghost mt-3"
                  onClick={() =>
                    update((previous) =>
                      applyFocusRecovery(previous, "BREAK_TAKEN", new Date().toISOString()),
                    )
                  }
                >
                  Registrar uma pausa
                </button>
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
      </main>
    </>
  );
}

/** Suporte mínimo a **negrito** no texto do conteúdo. Nada mais é interpretado. */


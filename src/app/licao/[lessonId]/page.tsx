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
import { useCallback, useMemo, useState } from "react";
import { useProgress } from "@/components/ProgressProvider";
import { StatusBar } from "@/components/ui/StatusBar";
import { ProgressBar } from "@/components/ui/Meters";
import { Board } from "@/components/board/Board";
import { AnswerInput } from "@/components/lesson/AnswerInput";
import { Feedback } from "@/components/lesson/Feedback";
import { Fontes } from "@/components/lesson/Fontes";
import { COURSE } from "@/content";
import { buildIndex, nextStep, skillIndexForScore } from "@/domain/curriculum";
import { computeChessScore } from "@/domain/score/chess-score";
import {
  applyFocusRecovery,
  masteryList,
  masteryMap,
  recordAttempt,
  totalXP,
  type AttemptEffects,
} from "@/domain/session";
import type { UserAnswer } from "@/domain/chess/evaluate";
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

type Stage = "concept" | "exercise" | "feedback" | "summary";

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

  const [stage, setStage] = useState<Stage>("concept");
  const [step, setStep] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [effects, setEffects] = useState<AttemptEffects | null>(null);
  const [sessionXP, setSessionXP] = useState(0);

  const exercise = lesson?.exercises[step];
  const isLast = lesson ? step === lesson.exercises.length - 1 : false;

  const submit = useCallback(
    (answer: UserAnswer) => {
      if (!exercise || !state) return;
      const at = new Date().toISOString();
      const elapsedMs = Date.now() - startedAt;

      const result = recordAttempt(state, { exercise, answer, hintsUsed, elapsedMs, at });
      update(() => result.state);
      setEffects(result.effects);
      setSessionXP((xp) => xp + result.effects.xpAwarded);
      setStage("feedback");
    },
    [exercise, state, startedAt, hintsUsed, update],
  );

  const advance = useCallback(() => {
    if (!lesson) return;
    if (step + 1 >= lesson.exercises.length) {
      setStage("summary");
      return;
    }
    setStep((s) => s + 1);
    setHintsUsed(0);
    setStartedAt(Date.now());
    setEffects(null);
    setStage("exercise");
  }, [lesson, step]);

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
            {stage !== "concept" && stage !== "summary" && (
              <p className="text-xs text-ink-faint">
                {step + 1} de {lesson.exercises.length} · {exercise && PHASE_LABEL[exercise.phase]}
              </p>
            )}
          </div>
          <div className="w-24">
            <ProgressBar
              value={stage === "summary" ? lesson.exercises.length : step}
              max={lesson.exercises.length}
              tone="brand"
              label="Progresso da lição"
            />
          </div>
        </div>

        {/* ── Fases 1 e 2: apresentação e demonstração */}
        {stage === "concept" && (
          <div className="space-y-5">
            <div className="card">
              <p className="label">Apresentação</p>
              <div className="mt-3 space-y-3">
                {lesson.concept.split("\n\n").map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-sm leading-relaxed text-ink-muted"
                    dangerouslySetInnerHTML={{ __html: renderInline(paragraph) }}
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
              onClick={() => {
                setStage("exercise");
                setStartedAt(Date.now());
              }}
            >
              Praticar
            </button>
          </div>
        )}

        {/* ── Fases 3, 4 e 5 */}
        {stage === "exercise" && exercise && (
          <div className="space-y-5">
            <p
              className="text-[15px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderInline(exercise.prompt) }}
            />

            <AnswerInput
              exercise={exercise}
              disabled={false}
              onSubmit={submit}
              marks={hintsUsed >= 3 ? exercise.marks : []}
            />

            <div className="rounded-xl2 border border-line p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="label">Dicas</p>
                <button
                  type="button"
                  className="text-sm font-semibold text-brand disabled:text-ink-faint"
                  disabled={hintsUsed >= 3}
                  onClick={() => setHintsUsed((h) => h + 1)}
                >
                  {hintsUsed >= 3 ? "Todas usadas" : `Ver dica ${hintsUsed + 1} de 3`}
                </button>
              </div>
              {hintsUsed > 0 ? (
                <ol className="mt-3 space-y-2">
                  {exercise.hints.slice(0, hintsUsed).map((hint, i) => (
                    <li key={i} className="text-sm leading-relaxed text-ink-muted">
                      <span className="text-ink-faint">{i + 1}.</span> {hint}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-2 text-xs text-ink-faint">
                  Cada dica reduz o crédito desta tentativa no seu domínio. O XP não muda — dica
                  afeta competência, não esforço.
                </p>
              )}
            </div>
          </div>
        )}

        {stage === "feedback" && exercise && effects && (
          <Feedback
            exercise={exercise}
            effects={effects}
            skillTitles={SKILL_TITLES}
            onContinue={advance}
            isLast={isLast}
          />
        )}

        {/* ── Resumo de sessão */}
        {stage === "summary" && score && (
          <div className="space-y-5">
            <h1 className="text-2xl font-bold tracking-tight">Sessão concluída</h1>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="card border-xp/30">
                <p className="label text-xp">Atividade</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-xp">+{sessionXP} XP</p>
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
function renderInline(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(/\*\*([^*]+)\*\*/g, "<strong class='text-ink'>$1</strong>");
}

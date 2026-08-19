"use client";

/**
 * Perfil: Chess Score por competência, cobertura, DNA do Jogador e transferência.
 *
 * A tela existe para responder três perguntas: o que eu domino, o que eu erro
 * por qual causa, e o que já virou decisão em partida.
 */

import Link from "next/link";
import { useMemo } from "react";
import { useProgress } from "@/components/ProgressProvider";
import { StatusBar } from "@/components/ui/StatusBar";
import { ProgressBar } from "@/components/ui/Meters";
import { COURSE } from "@/content";
import { buildIndex, skillIndexForScore } from "@/domain/curriculum";
import { computeChessScore, scoreBand } from "@/domain/score/chess-score";
import { countTransferredSkills } from "@/domain/score/north-star";
import { masteryList, reviewCardList, totalXP } from "@/domain/session";
import { effectiveMastery } from "@/domain/mastery";
import { ERROR_TAXONOMY, recurrenceByCause } from "@/domain/errors/taxonomy";
import { COMPETENCIES, COMPETENCY_LABELS, MASTERY_STATE_LABELS } from "@/domain/types";

const INDEX = buildIndex(COURSE);
const SKILL_INDEX = skillIndexForScore(INDEX);

export default function PerfilPage() {
  const { state, ready, reset, storageLabel, user } = useProgress();

  const view = useMemo(() => {
    if (!state) return null;
    const now = new Date().toISOString();
    const masteries = masteryList(state);

    return {
      now,
      masteries,
      score: computeChessScore(masteries, SKILL_INDEX, now),
      recurrence: [...recurrenceByCause(state.errors, now)].sort((a, b) => b[1] - a[1]),
      transfer: countTransferredSkills({
        masteries,
        reviewCards: reviewCardList(state),
        appliedInGameSkillIds: [],
      }),
    };
  }, [state]);

  if (!ready || !state || !view) {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-3xl px-5 py-10 text-ink-muted">Carregando…</main>
      </>
    );
  }

  const band = scoreBand(view.score.total);
  const avaliadas = view.masteries.filter((m) => m.attempts > 0);

  return (
    <>
      <StatusBar />
      <main className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="text-2xl font-bold tracking-tight">Seu perfil</h1>

        {/* ── Chess Score */}
        <section className="mt-6 card">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="label text-mastery">Chess Score</p>
              <p className="mt-1 text-4xl font-bold tabular-nums text-mastery">
                {view.score.total}
                <span className="text-lg font-normal text-ink-faint"> / 1000</span>
              </p>
            </div>
            <div className="text-right">
              <p className="label">Faixa indicativa</p>
              <p className="mt-1 text-sm font-semibold">{band.league}</p>
              <p className="text-xs text-ink-faint">{band.range}</p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-ink-faint">
            A faixa é indicativa da sua competência medida aqui dentro. Não é rating, não prevê Elo
            e não substitui desempenho em partidas oficiais.
          </p>
        </section>

        {/* ── Competências */}
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink-faint">
            Por competência
          </h2>
          <ul className="mt-3 space-y-3">
            {COMPETENCIES.map((competency) => {
              const value = view.score.components[competency];
              const coverage = view.score.coverage[competency];
              const peso = Math.round(view.score.weights[competency] * 100);

              return (
                <li key={competency} className="card py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold">{COMPETENCY_LABELS[competency]}</p>
                    <p className="text-xs tabular-nums text-ink-faint">
                      peso {peso}% · {value}/100
                    </p>
                  </div>
                  <div className="mt-2">
                    <ProgressBar
                      value={value}
                      tone="mastery"
                      label={`Domínio em ${COMPETENCY_LABELS[competency]}`}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-ink-faint">
                    {coverage === 0
                      ? "Nenhuma habilidade desta competência foi avaliada ainda — por isso vale 0, e não uma média inventada."
                      : `${coverage}% das habilidades desta competência já foram avaliadas.`}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ── DNA do Jogador */}
        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink-faint">
            DNA do Jogador
          </h2>
          {view.recurrence.length === 0 ? (
            <p className="mt-3 card text-sm leading-relaxed text-ink-muted">
              Ainda não há erros suficientes com classificação confiável para desenhar seu padrão.
              Classificações de baixa confiança existem, mas são deliberadamente excluídas daqui —
              um diagnóstico ruim que vira trilha é pior que nenhum diagnóstico.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {view.recurrence.map(([cause, count]) => (
                <li key={cause} className="card py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold">{ERROR_TAXONOMY[cause].label}</p>
                    <p className="text-xs tabular-nums text-ink-faint">
                      {count}× em 14 dias
                    </p>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                    {ERROR_TAXONOMY[cause].description}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-brand">
                    {ERROR_TAXONOMY[cause].intervention}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Transferência: a North Star */}
        <section className="mt-8 card">
          <p className="label">Transferência para partidas</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{view.transfer.count}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            Habilidades dominadas que já apareceram como decisão correta em partida. É a métrica
            central do produto — e o motivo de ela estar em zero é que jogar contra bot e importar
            PGN entram nas sprints 5 e 6.
          </p>
          {view.transfer.pendingTransfer.length > 0 && (
            <p className="mt-3 text-xs text-ink-faint">
              {view.transfer.pendingTransfer.length}{" "}
              {view.transfer.pendingTransfer.length === 1
                ? "habilidade está dominada e aguardando"
                : "habilidades estão dominadas e aguardando"}{" "}
              confirmação em partida.
            </p>
          )}
        </section>

        {/* ── Habilidades avaliadas */}
        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink-faint">
            Habilidades avaliadas ({avaliadas.length})
          </h2>
          {avaliadas.length === 0 ? (
            <p className="mt-3 card text-sm text-ink-muted">
              Nenhuma ainda.{" "}
              <Link href="/mapa" className="text-brand underline underline-offset-2">
                Começar a primeira lição
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {avaliadas
                .slice()
                .sort((a, b) => effectiveMastery(a, view.now) - effectiveMastery(b, view.now))
                .map((mastery) => {
                  const skill = INDEX.skills.get(mastery.skillId);
                  const effective = effectiveMastery(mastery, view.now);
                  // Compara os dois já arredondados: senão 57 vs 57,4 acusa uma
                  // redução que o usuário não vê em lugar nenhum da tela.
                  const raw = Math.round(mastery.value);
                  return (
                    <li key={mastery.skillId} className="card py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm font-semibold">{skill?.title ?? mastery.skillId}</p>
                        <p className="text-xs tabular-nums text-ink-faint">{effective}/100</p>
                      </div>
                      <div className="mt-2">
                        <ProgressBar value={effective} tone="mastery" label={skill?.title} />
                      </div>
                      <p className="mt-1.5 text-xs text-ink-faint">
                        {MASTERY_STATE_LABELS[mastery.state]} · {mastery.attempts}{" "}
                        {mastery.attempts === 1 ? "tentativa" : "tentativas"} · confiança{" "}
                        {Math.round(mastery.confidence * 100)}%
                        {effective < raw && ` (valor bruto ${raw}, reduzido por falta de reavaliação)`}
                      </p>
                    </li>
                  );
                })}
            </ul>
          )}
        </section>

        {/* ── Dados */}
        <section className="mt-8 card">
          <p className="label">Seus dados</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Guardados em: {storageLabel}. {totalXP(state)} XP e {state.attempts.length}{" "}
            {state.attempts.length === 1 ? "tentativa registrada" : "tentativas registradas"}.
          </p>
          {user ? (
            <p className="mt-2 text-sm text-ink-muted">
              Conectado como <strong className="text-ink">{user.displayName}</strong> ({user.email}).
            </p>
          ) : (
            <p className="mt-2 text-sm text-ink-muted">
              Sem conta.{" "}
              <Link href="/entrar" className="text-brand underline underline-offset-2">
                Criar uma
              </Link>{" "}
              faz seu progresso acompanhar você entre aparelhos.
            </p>
          )}
          <button
            type="button"
            className="btn-ghost mt-3 border-danger/40 text-danger"
            onClick={() => {
              if (window.confirm("Apagar todo o seu progresso deste navegador? Não há como desfazer.")) {
                reset();
              }
            }}
          >
            Apagar meu progresso
          </button>
        </section>
      </main>
    </>
  );
}

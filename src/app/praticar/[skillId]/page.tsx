"use client";

/**
 * Prática dirigida a uma habilidade.
 *
 * Serve itens do banco de prática da habilidade — os que a lição não usa. Existe
 * porque conteúdo que ninguém serve não é verificável: o banco gerado precisa
 * chegar ao aluno para provar que funciona.
 *
 * A sessão diária adaptativa completa é outro bloco. Aqui é uma coisa só:
 * treinar UMA habilidade, com os mesmos efeitos de domínio, revisão e Foco de
 * qualquer outra tentativa — o motor de sessão é o mesmo.
 */

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useProgress } from "@/components/ProgressProvider";
import { StatusBar } from "@/components/ui/StatusBar";
import { ProgressBar } from "@/components/ui/Meters";
import { AnswerInput } from "@/components/lesson/AnswerInput";
import { Feedback } from "@/components/lesson/Feedback";
import { Fontes } from "@/components/lesson/Fontes";
import { COURSE } from "@/content";
import { buildIndex } from "@/domain/curriculum";
import { effectiveMastery } from "@/domain/mastery";
import { masteryMap, recordAttempt, type AttemptEffects } from "@/domain/session";
import type { UserAnswer } from "@/domain/chess/evaluate";
import { MASTERY_STATE_LABELS } from "@/domain/types";

const INDEX = buildIndex(COURSE);
const SKILL_TITLES = Object.fromEntries([...INDEX.skills.values()].map((s) => [s.id, s.title]));

/** Quantos itens numa rodada de prática. Curto o bastante para caber num intervalo. */
const ITENS_POR_RODADA = 5;

export default function PraticarPage() {
  const params = useParams<{ skillId: string }>();
  const router = useRouter();
  const { state, ready, update } = useProgress();

  const skill = INDEX.skills.get(decodeURIComponent(params.skillId));

  const [passo, setPasso] = useState(0);
  const [dicas, setDicas] = useState(0);
  const [inicio, setInicio] = useState(() => Date.now());
  const [efeitos, setEfeitos] = useState<AttemptEffects | null>(null);
  const [concluido, setConcluido] = useState(false);

  /**
   * Escolhe os itens da rodada.
   *
   * Ordem: itens de prática primeiro, os de lição depois, e dentro disso os
   * menos tentados na frente. Assim a rodada não devolve sempre a mesma posição
   * — que era exatamente o problema que este banco veio resolver.
   */
  const itens = useMemo(() => {
    if (!skill || !state) return [];
    const tentativasPor = new Map<string, number>();
    for (const a of state.attempts) {
      tentativasPor.set(a.exerciseSlug, (tentativasPor.get(a.exerciseSlug) ?? 0) + 1);
    }

    return [...(INDEX.exercisesBySkill.get(skill.id) ?? [])]
      .sort((a, b) => {
        const tentadoA = tentativasPor.get(a.slug) ?? 0;
        const tentadoB = tentativasPor.get(b.slug) ?? 0;
        if (tentadoA !== tentadoB) return tentadoA - tentadoB;
        const praticaA = a.tags.includes("gerado") ? 0 : 1;
        const praticaB = b.tags.includes("gerado") ? 0 : 1;
        if (praticaA !== praticaB) return praticaA - praticaB;
        return a.difficulty - b.difficulty;
      })
      .slice(0, ITENS_POR_RODADA);
  }, [skill, state]);

  const exercicio = itens[passo];

  const responder = useCallback(
    (answer: UserAnswer) => {
      if (!exercicio || !state) return;
      const resultado = recordAttempt(state, {
        exercise: exercicio,
        answer,
        hintsUsed: dicas,
        elapsedMs: Date.now() - inicio,
        at: new Date().toISOString(),
      });
      update(() => resultado.state);
      setEfeitos(resultado.effects);
    },
    [exercicio, state, dicas, inicio, update],
  );

  const avancar = useCallback(() => {
    if (passo + 1 >= itens.length) {
      setConcluido(true);
      return;
    }
    setPasso((p) => p + 1);
    setDicas(0);
    setInicio(Date.now());
    setEfeitos(null);
  }, [passo, itens.length]);

  if (!ready || !state) {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-2xl px-5 py-10 text-ink-muted">Carregando…</main>
      </>
    );
  }

  if (!skill) {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-2xl px-5 py-10">
          <h1 className="text-xl font-bold">Habilidade não encontrada</h1>
          <Link href="/mapa" className="btn-primary mt-5">
            Voltar ao mapa
          </Link>
        </main>
      </>
    );
  }

  const dominio = state.masteries[skill.id];
  const valor = dominio ? effectiveMastery(dominio, new Date().toISOString()) : 0;
  const fontes = [...new Set([...skill.sources, ...itens.flatMap((e) => e.sources)])];

  return (
    <>
      <StatusBar />
      <main className="mx-auto max-w-2xl px-5 py-6">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/mapa" className="text-sm text-ink-muted hover:text-ink" aria-label="Voltar ao mapa">
            ←
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Praticar: {skill.title}</p>
            {!concluido && (
              <p className="text-xs text-ink-faint">
                {passo + 1} de {itens.length} · domínio {valor}/100
              </p>
            )}
          </div>
          <div className="w-24">
            <ProgressBar
              value={concluido ? itens.length : passo}
              max={Math.max(1, itens.length)}
              tone="brand"
              label="Progresso da prática"
            />
          </div>
        </div>

        {itens.length === 0 && (
          <div className="card">
            <p className="text-sm font-semibold">Ainda não há itens de prática para esta habilidade.</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Dizemos isso em vez de mostrar uma tela vazia. O banco de prática desta habilidade
              ainda não foi gerado.
            </p>
            <Link href="/mapa" className="btn-primary mt-4">
              Voltar ao mapa
            </Link>
          </div>
        )}

        {!concluido && exercicio && !efeitos && (
          <div className="space-y-5">
            <p
              className="text-[15px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: negrito(exercicio.prompt) }}
            />

            <AnswerInput exercise={exercicio} disabled={false} onSubmit={responder} marks={[]} />

            <div className="rounded-xl2 border border-line p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="label">Dicas</p>
                <button
                  type="button"
                  className="text-sm font-semibold text-brand disabled:text-ink-faint"
                  disabled={dicas >= 3}
                  onClick={() => setDicas((d) => d + 1)}
                >
                  {dicas >= 3 ? "Todas usadas" : `Ver dica ${dicas + 1} de 3`}
                </button>
              </div>
              {dicas > 0 && (
                <ol className="mt-3 space-y-2">
                  {exercicio.hints.slice(0, dicas).map((dica, i) => (
                    <li key={i} className="text-sm leading-relaxed text-ink-muted">
                      <span className="text-ink-faint">{i + 1}.</span> {dica}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}

        {!concluido && exercicio && efeitos && (
          <Feedback
            exercise={exercicio}
            effects={efeitos}
            skillTitles={SKILL_TITLES}
            onContinue={avancar}
            isLast={passo + 1 >= itens.length}
          />
        )}

        {concluido && (
          <div className="space-y-5">
            <h1 className="text-2xl font-bold tracking-tight">Prática concluída</h1>

            <div className="card border-mastery/30">
              <p className="label text-mastery">{skill.title}</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-mastery">
                {valor}
                <span className="text-base font-normal text-ink-faint"> / 100</span>
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {dominio ? MASTERY_STATE_LABELS[dominio.state] : "Desconhecida"} ·{" "}
                {dominio?.attempts ?? 0} tentativas no total
              </p>
              <div className="mt-3">
                <ProgressBar value={valor} tone="mastery" label={`Domínio em ${skill.title}`} />
              </div>
            </div>

            <Fontes sourceIds={fontes} />

            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-primary" onClick={() => router.push("/mapa")}>
                Voltar ao mapa
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setPasso(0);
                  setDicas(0);
                  setInicio(Date.now());
                  setEfeitos(null);
                  setConcluido(false);
                }}
              >
                Praticar mais
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

/** Suporte mínimo a **negrito**. Nada mais é interpretado. */
function negrito(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, "<strong class='text-ink'>$1</strong>");
}

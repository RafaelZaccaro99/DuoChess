"use client";

/**
 * Teste rápido / Diagnóstico completo — o A6 de verdade.
 *
 * Responde a mesma pergunta que qualquer exame de colocação: o que a pessoa
 * consegue fazer agora, não o que ela diz que consegue. Cada item usa o
 * mesmo motor de avaliação e domínio de qualquer exercício (ver
 * `src/domain/diagnostic/run.ts`); a diferença é que nada é gravado item a
 * item — o resultado só entra no progresso de verdade ao final, de uma vez.
 */

import Link from "next/link";
import { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProgress } from "@/components/ProgressProvider";
import { ProgressBar } from "@/components/ui/Meters";
import { ExecutorDeExercicios } from "@/components/exercicio/ExecutorDeExercicios";
import { useDiagnosticExecutor } from "@/components/diagnostico/useDiagnosticExecutor";
import { registrarDiagnostico } from "@/app/actions";
import { COURSE } from "@/content";
import { buildIndex, skillIndexForScore } from "@/domain/curriculum";
import { selectDiagnosticItems } from "@/domain/diagnostic/select";
import { applyDiagnosticResult, type EntryPoint } from "@/domain/session";
import { computeChessScore, competencySkillCounts, scoreBand } from "@/domain/score/chess-score";
import { assessReliability } from "@/domain/score/reliability";
import { COMPETENCIES, COMPETENCY_LABELS } from "@/domain/types";
import type { SkillMastery } from "@/domain/types";
import type { ChessScore } from "@/domain/score/chess-score";

const INDEX = buildIndex(COURSE);
const SKILL_INDEX = skillIndexForScore(INDEX);
const SKILL_TITLES = Object.fromEntries([...INDEX.skills.values()].map((s) => [s.id, s.title]));
const SKILL_COUNTS = competencySkillCounts(SKILL_INDEX);

function DiagnosticoInterno() {
  const router = useRouter();
  const params = useSearchParams();
  const { state, ready, update } = useProgress();

  const modo = params.get("modo") === "full" ? "FULL" : "QUICK";
  const entryPoint: EntryPoint = modo;
  const itens = useMemo(() => selectDiagnosticItems(INDEX, modo), [modo]);

  const [resultado, setResultado] = useState<{ score: ChessScore; reliable: boolean; reason: string | null } | null>(
    null,
  );

  const aoConcluir = useCallback(
    (masterySeed: Record<string, SkillMastery>) => {
      const now = new Date().toISOString();
      const score = computeChessScore(Object.values(masterySeed), SKILL_INDEX, now);
      const band = scoreBand(score.total);
      const { reliable, reason } = assessReliability(score.total, 0);

      update((previous) => applyDiagnosticResult(previous, masterySeed, now));

      if (state?.onboarding) {
        void registrarDiagnostico(entryPoint, state.onboarding, {
          estimated: score.components,
          ratingBand: band.range,
          reliable,
        });
      }

      setResultado({ score, reliable, reason });
    },
    [entryPoint, state?.onboarding, update],
  );

  const executor = useDiagnosticExecutor({ itens, aoConcluir });

  if (!ready || !state) {
    return <main className="mx-auto max-w-lg px-5 py-20 text-ink-muted">Carregando…</main>;
  }

  if (resultado) {
    const band = scoreBand(resultado.score.total);
    return (
      <main className="mx-auto max-w-lg px-5 py-10 space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Resultado do diagnóstico</h1>

        <div className="card border-mastery/30">
          <p className="label text-mastery">Chess Score estimado</p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-mastery">
            {resultado.score.total}
            <span className="text-lg font-normal text-ink-faint"> / 1000</span>
          </p>
          <p className="mt-1 text-sm text-ink-faint">
            Faixa indicativa: {band.league} ({band.range})
          </p>
          <p className="mt-3 text-xs leading-relaxed text-ink-faint">
            Não é rating, não prevê Elo e não substitui desempenho em partidas oficiais.
          </p>
        </div>

        {!resultado.reliable && resultado.reason && (
          <div className="rounded-xl2 border border-warn/40 bg-warn/10 p-4">
            <p className="text-sm font-semibold text-warn">Estimativa não confiável neste nível</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{resultado.reason}</p>
            <Link href="/jogar" className="btn-primary mt-3">
              Importar partidas
            </Link>
          </div>
        )}

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink-faint">Por competência</h2>
          <ul className="mt-3 space-y-2">
            {COMPETENCIES.map((c) => {
              const avaliada = resultado.score.coverage[c] > 0;
              const temConteudo = SKILL_COUNTS[c] > 0;
              return (
                <li key={c} className="card py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold">{COMPETENCY_LABELS[c]}</p>
                    {avaliada && (
                      <p className="text-xs tabular-nums text-ink-faint">
                        {resultado.score.components[c]}/100
                      </p>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-ink-faint">
                    {avaliada
                      ? `${resultado.score.coverage[c]}% das habilidades avaliadas.`
                      : temConteudo
                        ? "Ainda não foi avaliada nesta rodada."
                        : "Conteúdo ainda não publicado — entra conforme for lançado."}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        <button type="button" className="btn-primary w-full" onClick={() => router.push("/mapa")}>
          Ir para o mapa
        </button>
      </main>
    );
  }

  if (itens.length === 0) {
    return (
      <main className="mx-auto max-w-lg px-5 py-20">
        <p className="text-sm text-ink-muted">Nenhum item disponível para diagnóstico ainda.</p>
        <Link href="/mapa" className="btn-primary mt-4">
          Ir para o mapa
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-5 py-10">
      <div className="mb-8">
        <ProgressBar
          value={executor.indice}
          max={executor.total}
          tone="brand"
          label={`Item ${executor.indice + 1} de ${executor.total}`}
        />
        <p className="mt-2 text-xs text-ink-faint">
          {executor.indice + 1} de {executor.total}
        </p>
      </div>

      {executor.exercicio && (
        <ExecutorDeExercicios
          exercicio={executor.exercicio}
          dicasUsadas={executor.dicasUsadas}
          efeitos={executor.efeitos}
          ehUltimo={executor.ehUltimo}
          skillTitles={SKILL_TITLES}
          onResponder={executor.responder}
          onPedirDica={executor.pedirDica}
          onAvancar={executor.avancar}
          motivo={executor.item ? `${COMPETENCY_LABELS[executor.item.competency]} · item ${executor.indice + 1} de ${executor.total}` : undefined}
          rotuloDoFim="Ver resultado"
        />
      )}
    </main>
  );
}

export default function DiagnosticoPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-lg px-5 py-20 text-ink-muted">Carregando…</main>}>
      <DiagnosticoInterno />
    </Suspense>
  );
}

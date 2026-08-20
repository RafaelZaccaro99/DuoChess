"use client";

/**
 * A fila de revisão.
 *
 * Existe separada da sessão diária porque responde outra pergunta. A sessão
 * pergunta "o que estudar hoje" e reserva 20% para revisão; quem acumulou trinta
 * itens vencidos nunca zeraria a fila a dois por sessão.
 *
 * O teto diário vem do FSRS (`dailyReviewCap`) e não é decorativo: sem ele, quem
 * sumiu por um mês volta, encontra trezentos itens e some de novo.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgress } from "@/components/ProgressProvider";
import { StatusBar } from "@/components/ui/StatusBar";
import { ProgressBar } from "@/components/ui/Meters";
import { ExecutorDeExercicios } from "@/components/exercicio/ExecutorDeExercicios";
import { useExecutorDeExercicios } from "@/components/exercicio/useExecutorDeExercicios";
import { useCongelado } from "@/components/exercicio/useCongelado";
import { COURSE } from "@/content";
import { buildIndex } from "@/domain/curriculum";
import { mergeExercises } from "@/domain/curriculum/merge";
import { resolverRevisao } from "@/domain/adaptive/resolver";
import { DEFAULT_FSRS, dueQueue, retrievability } from "@/domain/srs";
import { daysBetween } from "@/domain/types";
import { exerciciosPublicadosTodos } from "@/app/actions";
import type { ExerciseDef } from "@/content/schema";
import { track } from "@/lib/track";

const INDEX = buildIndex(COURSE);
const SKILL_TITLES = Object.fromEntries([...INDEX.skills.values()].map((s) => [s.id, s.title]));

export default function RevisaoPage() {
  const { state, ready } = useProgress();

  // Exercícios publicados via CMS (A7) — mesma lógica de /sessao: sacados antes
  // de montar o índice que o resolvedor de revisão usa.
  const [cms, setCms] = useState<ExerciseDef[] | null>(null);
  useEffect(() => {
    exerciciosPublicadosTodos().then(setCms);
  }, []);

  /**
   * A fila é congelada na entrada.
   *
   * Responder um item reagenda o cartão, o que o tiraria da fila no meio da
   * sessão e faria os itens dançarem debaixo do aluno.
   */
  const fila = useCongelado(ready && state !== null && cms !== null, () => {
    if (!state || !cms) return null;
    const now = new Date().toISOString();
    const cartoes = Object.values(state.reviewCards);
    const vencidos = dueQueue(cartoes, now);
    const index = mergeExercises(INDEX, cms);

    const { itens, semItem } = resolverRevisao({
      index,
      cardIds: vencidos.map((c) => c.id),
      attempts: state.attempts,
    });

    // Quanto do que venceu ficou de fora por causa do teto do dia.
    const totalVencido = cartoes.filter((c) => new Date(c.dueAt).getTime() <= Date.now()).length;

    // O mais esquecido da fila — o que justifica a ordem.
    const maisEsquecido = vencidos[0];
    const retencao = maisEsquecido?.lastReviewedAt
      ? retrievability(
          maisEsquecido.stability,
          Math.max(0, daysBetween(maisEsquecido.lastReviewedAt, now)),
        )
      : null;

    return { itens, semItem, totalVencido, acimaDoTeto: totalVencido - vencidos.length, retencao };
  });

  const executor = useExecutorDeExercicios({
    itens: fila?.itens ?? [],
    // Concluir revisão recupera Foco — está na tabela do domínio.
    recuperaFocoAoConcluir: "REVIEW_COMPLETED",
  });

  const filaAvisadaRef = useState(() => ({ avisada: false }))[0];
  useEffect(() => {
    if (!fila || filaAvisadaRef.avisada) return;
    filaAvisadaRef.avisada = true;
    track("review_due_shown", { vencidos: fila.totalVencido });
  }, [fila, filaAvisadaRef]);

  useEffect(() => {
    if (executor.concluido) track("review_completed", { itens: executor.total });
  }, [executor.concluido, executor.total]);

  if (!ready || !state || !fila) {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-2xl px-5 py-10 text-ink-muted">Carregando a fila…</main>
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
            <p className="truncate text-sm font-semibold">Revisão de hoje</p>
            {!executor.concluido && fila.itens.length > 0 && (
              <p className="text-xs text-ink-faint">
                {executor.indice + 1} de {fila.itens.length}
              </p>
            )}
          </div>
          <div className="w-24">
            <ProgressBar
              value={executor.concluido ? fila.itens.length : executor.indice}
              max={Math.max(1, fila.itens.length)}
              tone="focus"
              label="Progresso da revisão"
            />
          </div>
        </div>

        {fila.itens.length === 0 && (
          <div className="card">
            <p className="text-sm font-semibold">Nada venceu ainda.</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              A revisão espaçada devolve cada item no ponto em que você está prestes a esquecê-lo,
              não antes. Voltar aqui todo dia não acelera nada — o intervalo é o remédio.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/sessao" className="btn-primary">
                Fazer a sessão de hoje
              </Link>
              <Link href="/mapa" className="btn-ghost">
                Ver o mapa
              </Link>
            </div>
          </div>
        )}

        {!executor.concluido && executor.exercicio && (
          <>
            {executor.indice === 0 && fila.retencao !== null && (
              <p className="mb-5 rounded-xl2 border border-focus/40 bg-focus/10 px-4 py-2.5 text-xs leading-relaxed text-ink-muted">
                Começando pelo item mais próximo de ser esquecido — chance estimada de você
                lembrar: {Math.round(fila.retencao * 100)}%.
              </p>
            )}

            <ExecutorDeExercicios
              exercicio={executor.exercicio}
              dicasUsadas={executor.dicasUsadas}
              efeitos={executor.efeitos}
              ehUltimo={executor.ehUltimo}
              skillTitles={SKILL_TITLES}
              onResponder={executor.responder}
              onPedirDica={executor.pedirDica}
              onAvancar={executor.avancar}
              rotuloDoFim="Terminar a revisão"
            />
          </>
        )}

        {executor.concluido && (
          <div className="space-y-5">
            <h1 className="text-2xl font-bold tracking-tight">Revisão em dia</h1>

            <div className="card border-focus/40">
              <p className="label text-focus">Foco</p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-focus">
                {state.focus.value}
                <span className="text-sm font-normal text-ink-faint"> / 100</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                Concluir revisão recupera Foco. Ele também volta com microlição, com revisitar um
                fundamento, com reflexão e com pausa — nunca com compra.
              </p>
            </div>

            <div className="card">
              <p className="label">O que acontece agora</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Cada item que você acertou sem dica volta com intervalo maior. Os que erraram
                voltam logo. É o FSRS ajustando a distância até o próximo reencontro.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/sessao" className="btn-primary">
                Fazer a sessão de hoje
              </Link>
              <Link href="/mapa" className="btn-ghost">
                Voltar ao mapa
              </Link>
            </div>
          </div>
        )}

        {fila.acimaDoTeto > 0 && !executor.concluido && (
          <p className="mt-6 text-xs leading-relaxed text-ink-faint">
            Outros {fila.acimaDoTeto} itens venceram e ficaram para amanhã: a fila tem teto de{" "}
            {DEFAULT_FSRS.dailyReviewCap} por dia. Devolver tudo de uma vez é o jeito mais rápido
            de fazer alguém desistir.
          </p>
        )}

        {fila.semItem.length > 0 && !executor.concluido && (
          <p className="mt-3 text-xs leading-relaxed text-ink-faint">
            {fila.semItem.length}{" "}
            {fila.semItem.length === 1 ? "agendamento não achou" : "agendamentos não acharam"}{" "}
            exercício correspondente e {fila.semItem.length === 1 ? "foi ignorado" : "foram ignorados"}.
          </p>
        )}
      </main>
    </>
  );
}

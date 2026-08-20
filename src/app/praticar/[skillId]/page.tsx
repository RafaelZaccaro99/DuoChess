"use client";

/**
 * Prática dirigida a uma habilidade.
 *
 * Serve itens do banco daquela habilidade — os que a lição não usa. É a rota
 * para quem quer escolher à mão o que treinar; a sessão diária, que o motor
 * adaptativo monta, fica em `/sessao`.
 *
 * O laço de execução é o compartilhado: esta tela só decide QUAIS itens servir.
 */

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useProgress } from "@/components/ProgressProvider";
import { StatusBar } from "@/components/ui/StatusBar";
import { ProgressBar } from "@/components/ui/Meters";
import { ExecutorDeExercicios } from "@/components/exercicio/ExecutorDeExercicios";
import { useExecutorDeExercicios } from "@/components/exercicio/useExecutorDeExercicios";
import { Fontes } from "@/components/lesson/Fontes";
import { COURSE } from "@/content";
import { buildIndex } from "@/domain/curriculum";
import { mergeExercises } from "@/domain/curriculum/merge";
import { effectiveMastery } from "@/domain/mastery";
import { MASTERY_STATE_LABELS } from "@/domain/types";
import { exerciciosPublicadosPara, slugsContestados } from "@/app/actions";
import type { ExerciseDef } from "@/content/schema";

const INDEX = buildIndex(COURSE);
const SKILL_TITLES = Object.fromEntries([...INDEX.skills.values()].map((s) => [s.id, s.title]));

/** Quantos itens numa rodada. Curto o bastante para caber num intervalo. */
const ITENS_POR_RODADA = 5;

export default function PraticarPage() {
  const params = useParams<{ skillId: string }>();
  const router = useRouter();
  const { state, ready } = useProgress();

  const skill = INDEX.skills.get(decodeURIComponent(params.skillId));

  // Exercícios publicados via CMS (A7) — sem eles, "publicar sem deploy" seria
  // só verdade no banco, nunca na tela que o aluno vê.
  const [cms, setCms] = useState<ExerciseDef[]>([]);
  useEffect(() => {
    if (!skill) return;
    exerciciosPublicadosPara(skill.id).then(setCms);
  }, [skill]);

  // Contestados (A8) somem da rotação — estático ou de CMS.
  const [excluidos, setExcluidos] = useState<string[]>([]);
  useEffect(() => {
    slugsContestados().then(setExcluidos);
  }, []);

  const index = useMemo(() => mergeExercises(INDEX, cms, new Set(excluidos)), [cms, excluidos]);

  /**
   * Menos tentados primeiro, e entre empatados os do banco de prática.
   *
   * Devolver sempre o item mais visto mediria reconhecimento da posição, não
   * domínio do padrão — que era exatamente o problema do acervo antigo.
   */
  const itens = useMemo(() => {
    if (!skill || !state) return [];

    const tentativasPor = new Map<string, number>();
    for (const a of state.attempts) {
      tentativasPor.set(a.exerciseSlug, (tentativasPor.get(a.exerciseSlug) ?? 0) + 1);
    }

    return [...(index.exercisesBySkill.get(skill.id) ?? [])]
      .sort((a, b) => {
        const ta = tentativasPor.get(a.slug) ?? 0;
        const tb = tentativasPor.get(b.slug) ?? 0;
        if (ta !== tb) return ta - tb;
        const pa = a.tags.includes("gerado") ? 0 : 1;
        const pb = b.tags.includes("gerado") ? 0 : 1;
        if (pa !== pb) return pa - pb;
        return a.difficulty - b.difficulty;
      })
      .slice(0, ITENS_POR_RODADA);
  }, [skill, state, index]);

  const executor = useExecutorDeExercicios({ itens });

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
            {!executor.concluido && (
              <p className="text-xs text-ink-faint">
                {executor.indice + 1} de {itens.length} · domínio {valor}/100
              </p>
            )}
          </div>
          <div className="w-24">
            <ProgressBar
              value={executor.concluido ? itens.length : executor.indice}
              max={Math.max(1, itens.length)}
              tone="brand"
              label="Progresso da prática"
            />
          </div>
        </div>

        {itens.length === 0 && (
          <div className="card">
            <p className="text-sm font-semibold">Ainda não há itens para esta habilidade.</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Dizemos isso em vez de mostrar uma tela vazia.
            </p>
            <Link href="/mapa" className="btn-primary mt-4">
              Voltar ao mapa
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
            onAvancar={executor.avancar}
            rotuloDoFim="Ver resultado"
          />
        )}

        {executor.concluido && (
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
              <button type="button" className="btn-ghost" onClick={executor.reiniciar}>
                Praticar mais
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

"use client";

/**
 * O laço do diagnóstico — mesma INTERFACE de `useExecutorDeExercicios`, para
 * que `ExecutorDeExercicios`/`Feedback` renderizem sem nenhuma mudança, mas
 * por dentro é outra coisa: nada aqui escreve em `ProgressState` item a
 * item. O domínio se acumula só localmente (`applyDiagnosticAnswer`) e vai
 * para o progresso de verdade numa única mesclada, ao final, via
 * `aoConcluir`.
 *
 * XP, cartão de revisão, taxonomia de erro, sequência e Foco não fazem
 * sentido para quem está sendo colocado a partir de domínio zero em tudo —
 * por isso este hook não é uma variação de `useExecutorDeExercicios`, é um
 * laço próprio.
 */

import { useCallback, useMemo, useState } from "react";
import type { UserAnswer } from "@/domain/chess/evaluate";
import type { AttemptEffects } from "@/domain/session";
import type { SkillMastery } from "@/domain/types";
import { applyDiagnosticAnswer } from "@/domain/diagnostic/run";
import type { DiagnosticItem } from "@/domain/diagnostic/select";

export interface DiagnosticExecutorOptions {
  itens: readonly DiagnosticItem[];
  aoConcluir(masterySeed: Record<string, SkillMastery>): void;
}

export function useDiagnosticExecutor(options: DiagnosticExecutorOptions) {
  const { itens } = options;

  const [indice, setIndice] = useState(0);
  const [dicasUsadas, setDicasUsadas] = useState(0);
  const [inicio, setInicio] = useState(() => Date.now());
  const [efeitos, setEfeitos] = useState<AttemptEffects | null>(null);
  const [concluido, setConcluido] = useState(false);
  const [masterySeed, setMasterySeed] = useState<Record<string, SkillMastery>>({});

  const total = itens.length;
  const item = itens[indice];
  const exercicio = item?.exercise;
  const ehUltimo = indice + 1 >= total;

  const responder = useCallback(
    (answer: UserAnswer) => {
      if (!item || efeitos) return;

      const resultado = applyDiagnosticAnswer(
        masterySeed,
        item,
        answer,
        dicasUsadas,
        Date.now() - inicio,
        new Date().toISOString(),
      );

      setMasterySeed(resultado.masteries);
      setEfeitos({
        evaluation: resultado.evaluation,
        masteryDelta: resultado.delta,
        xpAwarded: 0,
        microlesson: false,
        nextReviewDays: null,
      });
    },
    [item, efeitos, masterySeed, dicasUsadas, inicio],
  );

  const pedirDica = useCallback(() => {
    setDicasUsadas((d) => Math.min(3, d + 1));
  }, []);

  const avancar = useCallback(() => {
    if (indice + 1 >= total) {
      setConcluido(true);
      options.aoConcluir(masterySeed);
      return;
    }
    setIndice((i) => i + 1);
    setDicasUsadas(0);
    setInicio(Date.now());
    setEfeitos(null);
  }, [indice, total, masterySeed, options]);

  return useMemo(
    () => ({
      indice,
      exercicio,
      item,
      dicasUsadas,
      efeitos,
      concluido,
      ehUltimo,
      total,
      responder,
      pedirDica,
      avancar,
    }),
    [indice, exercicio, item, dicasUsadas, efeitos, concluido, ehUltimo, total, responder, pedirDica, avancar],
  );
}

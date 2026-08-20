"use client";

/**
 * O laço de execução de exercícios, num lugar só.
 *
 * A lição, a prática, a sessão diária e a revisão fazem exatamente a mesma
 * coisa: servir um item, receber a resposta, mostrar o feedback e avançar. Antes
 * disto o laço estava copiado em dois arquivos; a sessão e a revisão fariam
 * quatro cópias, e uma correção futura seria aplicada em duas e esquecida em
 * duas.
 *
 * O que cada tela ainda decide por conta própria é o que importa: QUAIS itens
 * servir e POR QUÊ. O resto é isto.
 *
 * A transição de estado continua sendo do domínio (`recordAttempt`); este hook
 * só transporta.
 */

import { useCallback, useState } from "react";
import type { ExerciseDef } from "@/content/schema";
import { useProgress } from "@/components/ProgressProvider";
import type { UserAnswer } from "@/domain/chess/evaluate";
import {
  applyFocusRecovery,
  recordAttempt,
  type AttemptEffects,
  type ProgressState,
} from "@/domain/session";
import type { FocusRecoveryAction } from "@/domain/gamification";

export interface ExecutorOptions {
  itens: readonly ExerciseDef[];
  /**
   * Ação pedagógica que recupera Foco ao concluir a série.
   *
   * Revisão e microlição recuperam Foco porque o spec diz que recuperam — e o
   * tipo só aceita ação pedagógica, nunca compra.
   */
  recuperaFocoAoConcluir?: FocusRecoveryAction;
  /** Chamado quando a série termina, depois de gravar o estado. */
  aoConcluir?(state: ProgressState): void;
}

export interface Executor {
  indice: number;
  exercicio: ExerciseDef | undefined;
  dicasUsadas: number;
  efeitos: AttemptEffects | null;
  concluido: boolean;
  ehUltimo: boolean;
  total: number;
  responder(answer: UserAnswer): void;
  pedirDica(): void;
  avancar(): void;
  reiniciar(): void;
}

export function useExecutorDeExercicios(options: ExecutorOptions): Executor {
  const { state, update } = useProgress();

  const [indice, setIndice] = useState(0);
  const [dicasUsadas, setDicasUsadas] = useState(0);
  const [inicio, setInicio] = useState(() => Date.now());
  const [efeitos, setEfeitos] = useState<AttemptEffects | null>(null);
  const [concluido, setConcluido] = useState(false);

  const total = options.itens.length;
  const exercicio = options.itens[indice];
  const ehUltimo = indice + 1 >= total;

  const responder = useCallback(
    (answer: UserAnswer) => {
      if (!exercicio || !state || efeitos) return;

      const resultado = recordAttempt(state, {
        exercise: exercicio,
        answer,
        hintsUsed: dicasUsadas,
        elapsedMs: Date.now() - inicio,
        at: new Date().toISOString(),
      });

      update(() => resultado.state);
      setEfeitos(resultado.effects);
    },
    [exercicio, state, efeitos, dicasUsadas, inicio, update],
  );

  const pedirDica = useCallback(() => {
    setDicasUsadas((d) => Math.min(3, d + 1));
  }, []);

  const avancar = useCallback(() => {
    if (indice + 1 >= total) {
      setConcluido(true);

      const acao = options.recuperaFocoAoConcluir;
      update((anterior) => {
        const proximo = acao
          ? applyFocusRecovery(anterior, acao, new Date().toISOString())
          : anterior;
        options.aoConcluir?.(proximo);
        return proximo;
      });
      return;
    }

    setIndice((i) => i + 1);
    setDicasUsadas(0);
    setInicio(Date.now());
    setEfeitos(null);
  }, [indice, total, options, update]);

  const reiniciar = useCallback(() => {
    setIndice(0);
    setDicasUsadas(0);
    setInicio(Date.now());
    setEfeitos(null);
    setConcluido(false);
  }, []);

  return {
    indice,
    exercicio,
    dicasUsadas,
    efeitos,
    concluido,
    ehUltimo,
    total,
    responder,
    pedirDica,
    avancar,
    reiniciar,
  };
}

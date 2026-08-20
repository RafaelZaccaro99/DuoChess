"use client";

/**
 * A parte visual do laço: enunciado, resposta, dicas e feedback.
 *
 * Par do `useExecutorDeExercicios`. Junto com ele, é o que as quatro telas de
 * exercício compartilham — a lição, a prática, a sessão diária e a revisão.
 */

import type { ExerciseDef } from "@/content/schema";
import { AnswerInput } from "@/components/lesson/AnswerInput";
import { Feedback } from "@/components/lesson/Feedback";
import type { AttemptEffects } from "@/domain/session";
import type { UserAnswer } from "@/domain/chess/evaluate";

export interface ExecutorDeExerciciosProps {
  exercicio: ExerciseDef;
  dicasUsadas: number;
  efeitos: AttemptEffects | null;
  ehUltimo: boolean;
  skillTitles: Record<string, string>;
  onResponder(answer: UserAnswer): void;
  onPedirDica(): void;
  onAvancar(): void;
  /** Texto acima do enunciado, dizendo por que este item está aqui. */
  motivo?: string;
  /** Rótulo do botão de avanço no último item. */
  rotuloDoFim?: string;
}

export function ExecutorDeExercicios({
  exercicio,
  dicasUsadas,
  efeitos,
  ehUltimo,
  skillTitles,
  onResponder,
  onPedirDica,
  onAvancar,
  motivo,
  rotuloDoFim,
}: ExecutorDeExerciciosProps) {
  if (efeitos) {
    return (
      <Feedback
        exercise={exercicio}
        effects={efeitos}
        skillTitles={skillTitles}
        onContinue={onAvancar}
        isLast={ehUltimo}
        lastLabel={rotuloDoFim}
      />
    );
  }

  return (
    <div className="space-y-5">
      {motivo && (
        <p className="rounded-xl2 border border-line bg-surface-raised px-4 py-2.5 text-xs leading-relaxed text-ink-muted">
          {motivo}
        </p>
      )}

      <p
        className="text-[15px] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: negrito(exercicio.prompt) }}
      />

      <AnswerInput exercise={exercicio} disabled={false} onSubmit={onResponder} marks={[]} />

      <div className="rounded-xl2 border border-line p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="label">Dicas</p>
          <button
            type="button"
            className="text-sm font-semibold text-brand disabled:text-ink-faint"
            disabled={dicasUsadas >= 3}
            onClick={onPedirDica}
          >
            {dicasUsadas >= 3 ? "Todas usadas" : `Ver dica ${dicasUsadas + 1} de 3`}
          </button>
        </div>

        {dicasUsadas > 0 ? (
          <ol className="mt-3 space-y-2">
            {exercicio.hints.slice(0, dicasUsadas).map((dica, i) => (
              <li key={i} className="text-sm leading-relaxed text-ink-muted">
                <span className="text-ink-faint">{i + 1}.</span> {dica}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-xs text-ink-faint">
            Cada dica reduz o crédito desta tentativa no seu domínio. O XP não muda — dica afeta
            competência, não esforço.
          </p>
        )}
      </div>
    </div>
  );
}

/** Suporte mínimo a **negrito** no texto do conteúdo. Nada mais é interpretado. */
export function negrito(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, "<strong class='text-ink'>$1</strong>");
}

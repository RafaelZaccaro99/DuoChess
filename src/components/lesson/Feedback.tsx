"use client";

/**
 * Feedback explicativo.
 *
 * O spec proíbe mostrar apenas certo ou errado. Sempre exibimos: o que foi
 * percebido, a ameaça, a melhor defesa, o motivo, o padrão e a regra
 * transferível — mais o efeito no domínio, que é onde o usuário vê competência e
 * atividade se moverem separadamente.
 */

import type { ExerciseDef } from "@/content/schema";
import type { AttemptEffects } from "@/domain/session";
import { Board } from "@/components/board/Board";
import { ERROR_TAXONOMY } from "@/domain/errors/taxonomy";
import { formatExpected } from "./AnswerInput";
import { cn } from "@/lib/cn";

const SECTIONS: Array<{ key: keyof ExerciseDef["explanation"]; title: string }> = [
  { key: "perceived", title: "O que você percebeu" },
  { key: "threat", title: "A ameaça" },
  { key: "bestDefense", title: "A melhor resposta" },
  { key: "reason", title: "Por quê" },
  { key: "pattern", title: "O padrão" },
  { key: "transferableRule", title: "Regra transferível" },
];

export function Feedback({
  exercise,
  effects,
  skillTitles,
  onContinue,
  isLast,
  lastLabel,
}: {
  exercise: ExerciseDef;
  effects: AttemptEffects;
  skillTitles: Record<string, string>;
  onContinue(): void;
  isLast: boolean;
  /** Rótulo do botão no último item; cada tela termina numa coisa diferente. */
  lastLabel?: string;
}) {
  const { evaluation } = effects;

  // Erro nosso, não do usuário: nada foi gravado e dizemos isso.
  if (evaluation.contentError) {
    return (
      <div className="card border-danger/50">
        <p className="label text-danger">Problema no conteúdo</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Este exercício tem gabarito divergente do motor de regras, então sua resposta não foi
          avaliada e nada foi registrado no seu progresso. O detalhe técnico:
        </p>
        <p className="mt-2 rounded-lg bg-surface-sunken p-3 font-mono text-xs text-ink-muted">
          {evaluation.contentError}
        </p>
        <button type="button" className="btn-ghost mt-4" onClick={onContinue}>
          Pular este exercício
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "rounded-xl2 border p-4",
          evaluation.correct ? "border-ok/50 bg-ok/10" : "border-danger/50 bg-danger/10",
        )}
      >
        <p className={cn("text-sm font-bold", evaluation.correct ? "text-ok" : "text-danger")}>
          {evaluation.correct ? "✓ Correto" : "✗ Não é essa"}
        </p>
        {!evaluation.correct && (
          <p className="mt-1.5 text-sm leading-relaxed text-ink">
            {evaluation.specificFeedback ?? `A resposta era ${formatExpected(evaluation.expected)}.`}
          </p>
        )}
        {!evaluation.correct && evaluation.cause && (
          <p className="mt-2 text-xs text-ink-muted">
            Causa classificada: <strong className="text-ink">{ERROR_TAXONOMY[evaluation.cause].label}</strong>{" "}
            {evaluation.causeConfidence < 0.6 && "(confiança baixa — não entra no seu gargalo)"}
          </p>
        )}
      </div>

      {exercise.marks.length > 0 && (
        <Board
          fen={exercise.fen}
          orientation={exercise.sideToMove === "w" ? "white" : "black"}
          marks={exercise.marks}
          mode="none"
        />
      )}

      <div className="card space-y-4">
        {SECTIONS.map((section) => (
          <div key={section.key}>
            <p className="label">{section.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              {exercise.explanation[section.key]}
            </p>
          </div>
        ))}
      </div>

      {/* Atividade e competência lado a lado, nunca somadas. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card border-xp/30">
          <p className="label text-xp">Atividade</p>
          <p className="mt-2 text-sm text-ink-muted">
            +{effects.xpAwarded} XP. Mede seu esforço, não o que você domina.
          </p>
        </div>
        <div className="card border-mastery/30">
          <p className="label text-mastery">Competência</p>
          <ul className="mt-2 space-y-1">
            {effects.masteryDelta.map((delta) => (
              <li key={delta.skillId} className="text-sm text-ink-muted">
                {skillTitles[delta.skillId] ?? delta.skillId}:{" "}
                <span className="tabular-nums text-ink">
                  {delta.before} → {delta.after}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {effects.microlesson && (
        <div className="card border-focus/50">
          <p className="label text-focus">Microlição acionada</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Este erro foi <strong className="text-ink">conceitual</strong>, não de distração. Em vez
            de só encurtar o intervalo de revisão, esta habilidade volta ao início e você vai
            reencontrá-la logo.
          </p>
        </div>
      )}

      {effects.nextReviewDays !== null && (
        <p className="text-xs text-ink-faint">
          Próxima revisão deste item em {effects.nextReviewDays}{" "}
          {effects.nextReviewDays === 1 ? "dia" : "dias"}. O intervalo vem do FSRS e leva em conta
          acerto, tempo e uso de dicas.
        </p>
      )}

      <button type="button" className="btn-primary w-full" onClick={onContinue}>
        {isLast ? (lastLabel ?? "Ver resumo da sessão") : "Continuar"}
      </button>
    </div>
  );
}

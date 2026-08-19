"use client";

/**
 * Entrada de resposta por tipo de exercício.
 *
 * Cada tipo tem a sua forma natural: marcar casas, mover peça, escolher entre
 * alternativas ou escrever notação. Nenhum botão aqui existe sem função.
 */

import { useMemo, useState } from "react";
import { Chess, type Square } from "chess.js";
import type { ExerciseDef } from "@/content/schema";
import type { UserAnswer } from "@/domain/chess/evaluate";
import { Board, type Mark } from "@/components/board/Board";
import { PIECE_NAMES_PT, sanToPt } from "@/domain/chess/board";
import { cn } from "@/lib/cn";

interface Props {
  exercise: ExerciseDef;
  disabled: boolean;
  onSubmit(answer: UserAnswer): void;
  marks: readonly Mark[];
}

const SQUARE_MODES = new Set(["ATTACKED_SQUARES", "LEGAL_MOVES"]);
const MOVE_MODES = new Set(["BEST_MOVE", "CHECK_ESCAPE", "CAPTURE"]);

export function AnswerInput({ exercise, disabled, onSubmit, marks }: Props) {
  const orientation = exercise.sideToMove === "w" ? "white" : "black";

  if (SQUARE_MODES.has(exercise.type)) {
    return (
      <SquaresAnswer exercise={exercise} disabled={disabled} onSubmit={onSubmit} marks={marks} orientation={orientation} />
    );
  }
  if (MOVE_MODES.has(exercise.type)) {
    return (
      <MoveAnswer exercise={exercise} disabled={disabled} onSubmit={onSubmit} marks={marks} orientation={orientation} />
    );
  }
  if (exercise.type === "NOTATION_WRITE") {
    return <TextAnswer exercise={exercise} disabled={disabled} onSubmit={onSubmit} marks={marks} orientation={orientation} />;
  }
  return <ChoiceAnswer exercise={exercise} disabled={disabled} onSubmit={onSubmit} marks={marks} orientation={orientation} />;
}

// ─────────────────────────────────────────────────────── marcar casas

function SquaresAnswer({
  exercise,
  disabled,
  onSubmit,
  marks,
  orientation,
}: Props & { orientation: "white" | "black" }) {
  const [squares, setSquares] = useState<string[]>([]);

  return (
    <div className="space-y-4">
      <Board
        fen={exercise.fen}
        orientation={orientation}
        mode="squares"
        selectedSquares={squares}
        onSelectedSquaresChange={setSquares}
        marks={marks}
        disabled={disabled}
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn-primary"
          disabled={disabled || squares.length === 0}
          onClick={() => onSubmit({ kind: "squares", squares })}
        >
          Confirmar {squares.length > 0 && `(${squares.length})`}
        </button>
        <button
          type="button"
          className="btn-ghost"
          disabled={disabled || squares.length === 0}
          onClick={() => setSquares([])}
        >
          Limpar
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────── mover peça

function MoveAnswer({
  exercise,
  disabled,
  onSubmit,
  marks,
  orientation,
}: Props & { orientation: "white" | "black" }) {
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);

  const canCastle = useMemo(() => {
    const chess = new Chess(exercise.fen);
    return chess.moves().filter((m) => m.startsWith("O-O"));
  }, [exercise.fen]);

  function handleMove(move: { from: string; to: string }) {
    const chess = new Chess(exercise.fen);
    const piece = chess.get(move.from as Square);
    const lastRank = exercise.sideToMove === "w" ? "8" : "1";

    // Promoção precisa da escolha do usuário: promover sempre para dama
    // esconderia justamente a lição da subpromoção.
    if (piece?.type === "p" && move.to[1] === lastRank) {
      setPendingPromotion(move);
      return;
    }
    onSubmit({ kind: "move", from: move.from, to: move.to });
  }

  return (
    <div className="space-y-4">
      <Board
        fen={exercise.fen}
        orientation={orientation}
        mode="move"
        onMove={handleMove}
        marks={marks}
        disabled={disabled || pendingPromotion !== null}
      />

      {pendingPromotion && (
        <div className="card border-brand/50">
          <p className="text-sm font-semibold">Para qual peça o peão promove?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["q", "r", "b", "n"] as const).map((piece) => (
              <button
                key={piece}
                type="button"
                className="btn-ghost"
                onClick={() => {
                  onSubmit({ kind: "move", ...pendingPromotion, promotion: piece });
                  setPendingPromotion(null);
                }}
              >
                {PIECE_NAMES_PT[piece]}
              </button>
            ))}
          </div>
        </div>
      )}

      {canCastle.length > 0 && !pendingPromotion && (
        <div className="flex flex-wrap gap-2">
          {canCastle.map((san) => (
            <button
              key={san}
              type="button"
              className="btn-ghost"
              disabled={disabled}
              onClick={() => onSubmit({ kind: "move", san })}
            >
              {san === "O-O" ? "Roque pequeno (O-O)" : "Roque grande (O-O-O)"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────── alternativas

const CHOICE_LABELS: Record<string, string> = {
  light: "Clara",
  dark: "Escura",
  mate: "Xeque-mate",
  afogamento: "Afogamento",
  xeque: "Xeque",
  nenhum: "Nenhum dos três",
  sim: "Sim",
  nao: "Não",
  "tanto faz": "Tanto faz",
};

function ChoiceAnswer({
  exercise,
  disabled,
  onSubmit,
  marks,
  orientation,
}: Props & { orientation: "white" | "black" }) {
  const options = useMemo(() => {
    const answer = exercise.acceptedAnswer;
    const correct = "color" in answer ? answer.color : "choice" in answer ? answer.choice : "";

    if (exercise.type === "IS_MATE_OR_STALEMATE") {
      return ["xeque", "mate", "afogamento", "nenhum"];
    }
    if ("color" in answer) return ["light", "dark"];

    const wrong = exercise.predictableErrors.map((e) => e.answer);
    // Ordem estável, derivada do slug: sem aleatoriedade, o teste não fica instável
    // e o usuário não vê as alternativas dançarem ao voltar.
    const all = [...new Set([correct, ...wrong])];
    const offset = exercise.slug.charCodeAt(exercise.slug.length - 1) % all.length;
    return [...all.slice(offset), ...all.slice(0, offset)];
  }, [exercise]);

  const showBoard = exercise.type !== "PIECE_VALUE";

  return (
    <div className="space-y-4">
      {showBoard && (
        <Board fen={exercise.fen} orientation={orientation} marks={marks} mode="none" />
      )}
      <ul className="space-y-2.5">
        {options.map((option) => (
          <li key={option}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSubmit({ kind: "choice", choice: option })}
              className={cn(
                "w-full rounded-xl2 border border-line bg-surface-raised px-4 py-3.5 text-left text-sm font-semibold",
                "transition-colors hover:border-brand hover:bg-brand-soft disabled:opacity-50",
              )}
            >
              {CHOICE_LABELS[option] ?? option}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────── escrever notação

function TextAnswer({
  exercise,
  disabled,
  onSubmit,
  marks,
  orientation,
}: Props & { orientation: "white" | "black" }) {
  const [value, setValue] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (value.trim()) onSubmit({ kind: "choice", choice: value.trim() });
      }}
    >
      <Board fen={exercise.fen} orientation={orientation} marks={marks} mode="none" />
      <div>
        <label htmlFor="notacao" className="label">
          Notação do lance
        </label>
        <input
          id="notacao"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          placeholder="ex.: Cf3"
          className="mt-2 w-full rounded-xl2 border border-line bg-surface-sunken px-4 py-3 font-mono text-sm text-ink placeholder:text-ink-faint"
        />
        <p className="mt-2 text-xs text-ink-faint">
          Aceitamos a notação em português (C, B, T, D, R) e em inglês (N, B, R, Q, K).
        </p>
      </div>
      <button type="submit" className="btn-primary" disabled={disabled || !value.trim()}>
        Confirmar
      </button>
    </form>
  );
}

export function formatExpected(expected: string): string {
  return expected
    .split(" ou ")
    .map((part) => sanToPt(part))
    .join(" ou ");
}

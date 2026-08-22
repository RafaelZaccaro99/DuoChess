"use client";

/**
 * Tabuleiro acessível (ADR-008).
 *
 * Cada casa é um <button> com rótulo lido por leitor de tela. Navegação por
 * setas do teclado, seleção por Enter/Espaço, e uma região aria-live que anuncia
 * o que acabou de acontecer. Cor nunca é o único portador de informação:
 * destaques usam cor E forma (anel, ponto, faixa diagonal).
 *
 * Dois modos:
 *  - "move"    seleciona origem e destino; a legalidade vem de chess.js;
 *  - "squares" marca um conjunto de casas (casas atacadas, lances legais).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Square } from "chess.js";
import { Piece } from "./pieces";
import {
  FILES,
  RANKS,
  legalMovesFrom,
  readBoard,
  squareLabel,
  type BoardSquare,
} from "@/domain/chess/board";
import { cn } from "@/lib/cn";

export interface Mark {
  kind: "arrow" | "highlight";
  from: string;
  to?: string;
  tone: "good" | "bad" | "neutral";
}

export interface BoardProps {
  fen: string;
  orientation?: "white" | "black";
  showCoordinates?: boolean;
  marks?: readonly Mark[];
  /** Modo de interação. "none" deixa o tabuleiro apenas para leitura. */
  mode?: "none" | "move" | "squares";
  /** Casas marcadas no modo "squares" (controlado). */
  selectedSquares?: readonly string[];
  onSelectedSquaresChange?(squares: string[]): void;
  onMove?(move: { from: string; to: string; promotion?: string }): void;
  /** Desenha as casas alcançáveis ao selecionar uma peça, no modo "move". */
  showLegalHints?: boolean;
  disabled?: boolean;
  className?: string;
}

const TONE_RING: Record<Mark["tone"], string> = {
  good: "ring-ok",
  bad: "ring-danger",
  neutral: "ring-brand",
};

const TONE_STROKE: Record<Mark["tone"], string> = {
  good: "#4BB98A",
  bad: "#E0655F",
  neutral: "#D9A441",
};

export function Board({
  fen,
  orientation = "white",
  showCoordinates = true,
  marks = [],
  mode = "none",
  selectedSquares = [],
  onSelectedSquaresChange,
  onMove,
  showLegalHints = true,
  disabled = false,
  className,
}: BoardProps) {
  const squares = useMemo(() => readBoard(fen), [fen]);
  const ordered = useMemo(
    () => (orientation === "white" ? squares : [...squares].reverse()),
    [squares, orientation],
  );
  // `readBoard` já entrega fileira por fileira, em grupos de 8 — inverter o
  // array inteiro (orientação preta) preserva os grupos, só invertidos por
  // dentro também, que é a rotação correta do tabuleiro.
  const linhas = useMemo(
    () => Array.from({ length: 8 }, (_, r) => ordered.slice(r * 8, r * 8 + 8)),
    [ordered],
  );

  const [cursor, setCursor] = useState<string>(orientation === "white" ? "e4" : "e5");
  const [origin, setOrigin] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);

  const legalTargets = useMemo(() => {
    if (mode !== "move" || !origin || !showLegalHints) return new Set<string>();
    return new Set(legalMovesFrom(fen, origin as Square));
  }, [mode, origin, fen, showLegalHints]);

  const selected = useMemo(() => new Set(selectedSquares), [selectedSquares]);
  const highlights = useMemo(
    () => new Map(marks.filter((m) => m.kind === "highlight").map((m) => [m.from, m.tone])),
    [marks],
  );
  const arrows = useMemo(() => marks.filter((m) => m.kind === "arrow" && m.to), [marks]);

  const squareByName = useMemo(
    () => new Map(squares.map((s) => [s.square as string, s])),
    [squares],
  );

  const describe = useCallback(
    (name: string) => {
      const square = squareByName.get(name);
      return square ? squareLabel(square) : name;
    },
    [squareByName],
  );

  const activate = useCallback(
    (name: string) => {
      if (disabled || mode === "none") return;

      if (mode === "squares") {
        const next = selected.has(name)
          ? selectedSquares.filter((s) => s !== name)
          : [...selectedSquares, name];
        onSelectedSquaresChange?.(next);
        setAnnouncement(`${describe(name)}. ${selected.has(name) ? "Desmarcada" : "Marcada"}. ${next.length} casas marcadas.`);
        return;
      }

      // modo "move"
      if (!origin) {
        const square = squareByName.get(name);
        if (!square?.piece) {
          setAnnouncement(`${describe(name)}. Não há peça para selecionar.`);
          return;
        }
        setOrigin(name);
        const targets = legalMovesFrom(fen, name as Square);
        setAnnouncement(
          targets.length === 0
            ? `${describe(name)}. Selecionada, mas não tem lances legais.`
            : `${describe(name)}. Selecionada. ${targets.length} lances possíveis.`,
        );
        return;
      }

      if (origin === name) {
        setOrigin(null);
        setAnnouncement("Seleção cancelada.");
        return;
      }

      onMove?.({ from: origin, to: name });
      setAnnouncement(`Lance de ${origin} para ${name}.`);
      setOrigin(null);
    },
    [
      disabled,
      mode,
      selected,
      selectedSquares,
      onSelectedSquaresChange,
      describe,
      origin,
      squareByName,
      fen,
      onMove,
    ],
  );

  const moveCursor = useCallback(
    (deltaFile: number, deltaRank: number) => {
      const file = FILES.indexOf(cursor[0] as (typeof FILES)[number]);
      const rank = RANKS.indexOf(cursor[1] as (typeof RANKS)[number]);
      const flip = orientation === "white" ? 1 : -1;

      const nextFile = Math.min(7, Math.max(0, file + deltaFile * flip));
      const nextRank = Math.min(7, Math.max(0, rank + deltaRank * flip));
      const next = `${FILES[nextFile]}${RANKS[nextRank]}`;

      setCursor(next);
      setAnnouncement(describe(next));
      gridRef.current?.querySelector<HTMLButtonElement>(`[data-square="${next}"]`)?.focus();
    },
    [cursor, orientation, describe],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const map: Record<string, [number, number]> = {
        ArrowRight: [1, 0],
        ArrowLeft: [-1, 0],
        ArrowUp: [0, 1],
        ArrowDown: [0, -1],
      };
      const delta = map[event.key];
      if (delta) {
        event.preventDefault();
        moveCursor(delta[0], delta[1]);
        return;
      }
      if (event.key === "Escape" && origin) {
        event.preventDefault();
        setOrigin(null);
        setAnnouncement("Seleção cancelada.");
      }
    },
    [moveCursor, origin],
  );

  // Trocar de posição limpa a seleção pendente: manter origem de outra posição
  // produziria um lance sem sentido.
  useEffect(() => {
    setOrigin(null);
  }, [fen]);

  const interactive = mode !== "none" && !disabled;

  return (
    <div className={cn("w-full", className)}>
      <div
        ref={gridRef}
        role="grid"
        aria-label="Tabuleiro de xadrez"
        onKeyDown={onKeyDown}
        className="relative grid aspect-square w-full grid-cols-8 auto-rows-fr overflow-hidden rounded-xl2 border border-line-strong"
      >
        {linhas.map((linha, r) => (
          // display:contents — a linha existe pra ARIA (role="row", exigido
          // pelo padrão de grid: gridcell precisa de um row como pai), sem
          // participar do layout: as 8 casas continuam encaixando direto nas
          // colunas do CSS Grid do pai (achado real do axe-core, A8).
          <div role="row" key={r} className="contents">
            {linha.map((square) => (
              <SquareButton
                key={square.square}
                square={square}
                isCursor={cursor === square.square}
                isOrigin={origin === square.square}
                isSelected={selected.has(square.square)}
                isLegalTarget={legalTargets.has(square.square)}
                highlightTone={highlights.get(square.square)}
                interactive={interactive}
                showCoordinates={showCoordinates}
                orientation={orientation}
                onActivate={() => activate(square.square)}
                onFocusSquare={() => setCursor(square.square)}
              />
            ))}
          </div>
        ))}

        {arrows.length > 0 && <ArrowLayer arrows={arrows} orientation={orientation} />}
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {interactive && (
        <p className="mt-2 text-xs text-ink-faint">
          Use as setas para navegar e Enter para {mode === "squares" ? "marcar a casa" : "selecionar e mover"}.
          {mode === "move" && " Esc cancela a seleção."}
        </p>
      )}
    </div>
  );
}

interface SquareButtonProps {
  square: BoardSquare;
  isCursor: boolean;
  isOrigin: boolean;
  isSelected: boolean;
  isLegalTarget: boolean;
  highlightTone?: Mark["tone"];
  interactive: boolean;
  showCoordinates: boolean;
  orientation: "white" | "black";
  onActivate(): void;
  onFocusSquare(): void;
}

function SquareButton({
  square,
  isCursor,
  isOrigin,
  isSelected,
  isLegalTarget,
  highlightTone,
  interactive,
  showCoordinates,
  orientation,
  onActivate,
  onFocusSquare,
}: SquareButtonProps) {
  const file = square.square[0]!;
  const rank = square.square[1]!;
  const showFile = orientation === "white" ? rank === "1" : rank === "8";
  const showRank = orientation === "white" ? file === "a" : file === "h";

  const state = isSelected
    ? "Marcada."
    : isOrigin
      ? "Selecionada."
      : isLegalTarget
        ? "Destino possível."
        : "";

  return (
    <button
      type="button"
      role="gridcell"
      data-square={square.square}
      tabIndex={isCursor ? 0 : -1}
      disabled={!interactive}
      onClick={onActivate}
      onFocus={onFocusSquare}
      aria-label={`${squareLabel(square)}${state ? `. ${state}` : ""}`}
      // `aria-pressed` não é permitido em `role="gridcell"` (achado real do
      // axe-core em e2e/acessibilidade.spec.ts, A8) — `aria-selected` é o
      // atributo correto da especificação ARIA para esse papel.
      aria-selected={interactive ? isSelected || isOrigin : undefined}
      className={cn(
        "relative flex items-center justify-center p-[6%] transition-colors",
        square.light ? "bg-board-light" : "bg-board-dark",
        interactive && "cursor-pointer hover:brightness-110",
        !interactive && "cursor-default",
        (isOrigin || isSelected) && "ring-4 ring-inset ring-brand",
        highlightTone && `ring-4 ring-inset ${TONE_RING[highlightTone]}`,
      )}
    >
      {/* Marca de seleção redundante à cor: um X no canto sobrevive ao daltonismo. */}
      {isSelected && (
        <span
          aria-hidden="true"
          className="absolute right-[6%] top-[4%] text-[clamp(8px,2vw,14px)] font-bold leading-none text-surface-sunken"
        >
          ✕
        </span>
      )}

      {isLegalTarget && !square.piece && (
        <span
          aria-hidden="true"
          className="absolute h-[26%] w-[26%] rounded-full bg-brand/70"
        />
      )}
      {isLegalTarget && square.piece && (
        <span
          aria-hidden="true"
          className="absolute inset-[8%] rounded-full border-4 border-brand/70"
        />
      )}

      {square.piece && <Piece type={square.piece.type} color={square.piece.color} />}

      {showCoordinates && showFile && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute bottom-[2%] right-[6%] text-[clamp(7px,1.6vw,11px)] font-bold leading-none",
            square.light ? "text-board-dark" : "text-board-light",
          )}
        >
          {file}
        </span>
      )}
      {showCoordinates && showRank && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-[6%] top-[5%] text-[clamp(7px,1.6vw,11px)] font-bold leading-none",
            square.light ? "text-board-dark" : "text-board-light",
          )}
        >
          {rank}
        </span>
      )}
    </button>
  );
}

function ArrowLayer({
  arrows,
  orientation,
}: {
  arrows: readonly Mark[];
  orientation: "white" | "black";
}) {
  const center = (name: string): [number, number] => {
    const fileIndex = FILES.indexOf(name[0] as (typeof FILES)[number]);
    const rankIndex = RANKS.indexOf(name[1] as (typeof RANKS)[number]);
    const col = orientation === "white" ? fileIndex : 7 - fileIndex;
    const row = orientation === "white" ? 7 - rankIndex : rankIndex;
    return [col * 12.5 + 6.25, row * 12.5 + 6.25];
  };

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        {(["good", "bad", "neutral"] as const).map((tone) => (
          <marker
            key={tone}
            id={`arrowhead-${tone}`}
            markerWidth="3"
            markerHeight="3"
            refX="2.2"
            refY="1.5"
            orient="auto"
          >
            <path d="M0,0 L3,1.5 L0,3 z" fill={TONE_STROKE[tone]} />
          </marker>
        ))}
      </defs>
      {arrows.map((arrow, i) => {
        const [x1, y1] = center(arrow.from);
        const [x2, y2] = center(arrow.to!);
        return (
          <line
            key={`${arrow.from}${arrow.to}${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={TONE_STROKE[arrow.tone]}
            strokeWidth={1.8}
            strokeLinecap="round"
            opacity={0.85}
            markerEnd={`url(#arrowhead-${arrow.tone})`}
          />
        );
      })}
    </svg>
  );
}

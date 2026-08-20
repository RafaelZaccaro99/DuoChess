"use client";

/**
 * `Board` já tipa `onMove` com `promotion?`, mas nada nele dispara a escolha
 * de peça — um peão que chega à última fileira sempre promoveria a dama por
 * padrão. Este wrapper intercepta esse caso e pergunta antes de repassar o
 * lance ao chamador.
 */

import { useCallback, useState } from "react";
import { Chess, type PieceSymbol, type Square } from "chess.js";
import { Board, type BoardProps } from "./Board";
import { Piece } from "./pieces";
import { PIECE_LETTER_PT } from "@/domain/chess/board";
import { cn } from "@/lib/cn";

const OPCOES_DE_PROMOCAO: PieceSymbol[] = ["q", "r", "b", "n"];

function ehLanceDePromocao(fen: string, from: string, to: string): boolean {
  const chess = new Chess(fen);
  const peca = chess.get(from as Square);
  if (!peca || peca.type !== "p") return false;
  const filaDeChegada = to[1];
  return filaDeChegada === "8" || filaDeChegada === "1";
}

export function PromotionPrompt(props: BoardProps) {
  const [pendente, setPendente] = useState<{ from: string; to: string; color: "w" | "b" } | null>(null);
  const cor = props.fen.split(" ")[1] === "b" ? "b" : "w";

  const handleMove = useCallback(
    (move: { from: string; to: string; promotion?: string }) => {
      if (ehLanceDePromocao(props.fen, move.from, move.to)) {
        setPendente({ from: move.from, to: move.to, color: cor });
        return;
      }
      props.onMove?.(move);
    },
    [props, cor],
  );

  const escolher = useCallback(
    (promotion: PieceSymbol) => {
      if (!pendente) return;
      props.onMove?.({ from: pendente.from, to: pendente.to, promotion });
      setPendente(null);
    },
    [pendente, props],
  );

  return (
    <div className="relative">
      <Board {...props} onMove={handleMove} disabled={props.disabled || pendente !== null} />

      {pendente && (
        <div
          role="dialog"
          aria-label="Escolha a peça da promoção"
          className="absolute inset-0 z-10 flex items-center justify-center rounded-xl2 bg-surface-sunken/90 backdrop-blur-sm"
        >
          <div className="card flex items-center gap-2 p-3">
            {OPCOES_DE_PROMOCAO.map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => escolher(tipo)}
                aria-label={`Promover a ${PIECE_LETTER_PT[tipo] || "dama"}`}
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-xl2 border border-line-strong",
                  "hover:border-brand hover:bg-brand/10",
                )}
              >
                <Piece type={tipo} color={pendente.color} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

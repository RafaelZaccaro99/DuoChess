"use client";

/**
 * Partida ao vivo contra bot.
 *
 * O bot não decide legalidade — o servidor confere cada lance do usuário via
 * chess.js antes de responder (ADR-001), e a resposta do bot vem sempre de
 * uma linha real da engine (`chooseBotMove`, A5), nunca de um lance
 * inventado. O `cpLoss` mostrado depois do lance do bot é a prova visível
 * disso: não é lance aleatório.
 */

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useProgress } from "@/components/ProgressProvider";
import { StatusBar } from "@/components/ui/StatusBar";
import { PromotionPrompt } from "@/components/board/PromotionPrompt";
import { carregarPartida, encerrarPartida, jogarLance } from "@/app/actions";
import { START_FEN } from "@/domain/chess/board";

const ROTULO_STATUS: Record<string, string> = {
  ONGOING: "Em andamento",
  CHECKMATE: "Xeque-mate",
  STALEMATE: "Afogamento",
  DRAW: "Empate",
};

export default function PartidaPage() {
  const params = useParams<{ gameId: string }>();
  const router = useRouter();
  const { user, ready } = useProgress();

  const [fen, setFen] = useState(START_FEN);
  const [userColor, setUserColor] = useState<"w" | "b">("w");
  const [status, setStatus] = useState("ONGOING");
  const [ultimoLanceBot, setUltimoLanceBot] = useState<{ san: string; cpLoss: number } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) return;
    carregarPartida(params.gameId).then((r) => {
      if (r.ok) {
        setFen(r.fen);
        setUserColor(r.userColor);
        setStatus(r.status);
      } else {
        setErro(r.error ?? "Partida não encontrada.");
      }
      setCarregando(false);
    });
  }, [user, params.gameId]);

  const jogar = (move: { from: string; to: string; promotion?: string }) => {
    setErro(null);
    startTransition(async () => {
      const resultado = await jogarLance(params.gameId, move);
      if (!resultado.ok) {
        setErro(resultado.error ?? "Lance recusado.");
        return;
      }
      if (resultado.fen) setFen(resultado.fen);
      if (resultado.status) setStatus(resultado.status);
      setUltimoLanceBot(resultado.botMove ?? null);
    });
  };

  const desistir = () => {
    startTransition(async () => {
      await encerrarPartida(params.gameId, userColor === "w" ? "0-1" : "1-0");
      router.push(`/analise/${params.gameId}`);
    });
  };

  if (!ready || carregando) {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-xl px-5 py-10 text-ink-muted">Carregando partida…</main>
      </>
    );
  }

  if (!user || erro) {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-xl px-5 py-10">
          <div className="card">
            <p className="text-sm font-semibold">{erro ?? "Entre para ver esta partida."}</p>
            <Link href="/jogar" className="btn-primary mt-4">
              Voltar
            </Link>
          </div>
        </main>
      </>
    );
  }

  const acabou = status !== "ONGOING";

  return (
    <>
      <StatusBar />
      <main className="mx-auto max-w-xl px-5 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/jogar" className="text-sm text-ink-muted hover:text-ink" aria-label="Voltar">
            ←
          </Link>
          <h1 className="text-lg font-bold tracking-tight">
            {acabou ? ROTULO_STATUS[status] : "Sua vez"}
          </h1>
        </div>

        {erro && (
          <div role="alert" className="rounded-xl2 border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            {erro}
          </div>
        )}

        <PromotionPrompt
          fen={fen}
          orientation={userColor === "w" ? "white" : "black"}
          mode={acabou || pending ? "none" : "move"}
          onMove={jogar}
        />

        {ultimoLanceBot && (
          <p className="text-xs text-ink-faint">
            Bot jogou {ultimoLanceBot.san}
            {ultimoLanceBot.cpLoss > 0 ? ` — perdeu ${ultimoLanceBot.cpLoss} centipawns em relação à melhor linha.` : " — melhor linha."}
          </p>
        )}

        {acabou && (
          <div className="card">
            <p className="text-sm font-semibold">Partida terminada.</p>
            <Link href={`/analise/${params.gameId}`} className="btn-primary mt-3">
              Ver análise
            </Link>
          </div>
        )}

        {!acabou && (
          <button type="button" className="btn-ghost text-xs" onClick={desistir} disabled={pending}>
            Desistir
          </button>
        )}
      </main>
    </>
  );
}

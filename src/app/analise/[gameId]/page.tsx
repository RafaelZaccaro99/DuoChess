"use client";

/**
 * Análise de partida — etapa humana antes da engine (ADR-007, wireframe W7).
 *
 * A engine nunca aparece antes do registro humano. Isto não é só uma ordem de
 * telas: `revelarEngine` recusa no servidor até o momento ter resposta humana
 * ou pulo explícito — mesmo que esta tela nunca existisse, um cliente que
 * chamasse a ação direto seria barrado do mesmo jeito.
 */

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Chess } from "chess.js";
import { useProgress } from "@/components/ProgressProvider";
import { StatusBar } from "@/components/ui/StatusBar";
import { Board, type Mark } from "@/components/board/Board";
import {
  finalizarAnalise,
  iniciarAnalise,
  pularAnaliseHumana,
  registrarAnaliseHumana,
  revelarEngine,
} from "@/app/actions";
import type { CriticalMomentSummary } from "@/lib/games-server";

type EvalChoice = "GANHANDO" | "IGUAL" | "PIOR";

interface Revelacao {
  bestSan: string;
  cpBefore: number;
  cpAfter: number;
}

function sanToSquares(fen: string, san: string): { from: string; to: string } | null {
  try {
    const chess = new Chess(fen);
    const move = chess.move(san);
    return { from: move.from, to: move.to };
  } catch {
    return null;
  }
}

export default function AnalisePage() {
  const params = useParams<{ gameId: string }>();
  const router = useRouter();
  const { user, ready } = useProgress();

  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [momentos, setMomentos] = useState<CriticalMomentSummary[]>([]);
  const [indice, setIndice] = useState(0);
  const [candidatos, setCandidatos] = useState("");
  const [avaliacao, setAvaliacao] = useState<EvalChoice | null>(null);
  const [tempoSeg, setTempoSeg] = useState("");
  const [revelado, setRevelado] = useState<Revelacao | null>(null);
  const [aprendizado, setAprendizado] = useState("");
  const [transferidas, setTransferidas] = useState<string[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) return;
    iniciarAnalise(params.gameId).then((r) => {
      if (r.ok && r.analysisId && r.moments) {
        setAnalysisId(r.analysisId);
        setMomentos(r.moments);
      } else {
        setErro(r.error ?? "Não foi possível iniciar a análise.");
      }
      setCarregando(false);
    });
  }, [user, params.gameId]);

  const momento = momentos[indice];
  const ehUltimo = indice + 1 >= momentos.length;

  const registrar = (pulou: boolean) => {
    if (!analysisId || !momento) return;
    setErro(null);
    startTransition(async () => {
      const resposta = pulou
        ? await pularAnaliseHumana(analysisId, momento.id)
        : await registrarAnaliseHumana(analysisId, momento.id, {
            candidates: candidatos,
            evalChoice: avaliacao ?? "IGUAL",
            timeSec: Number(tempoSeg) || 0,
          });

      if (!resposta.ok) {
        setErro(resposta.error ?? "Não foi possível registrar.");
        return;
      }

      const engine = await revelarEngine(analysisId, momento.id);
      if (!engine.ok || engine.bestSan === undefined) {
        setErro(engine.error ?? "A engine não pôde ser revelada.");
        return;
      }
      setRevelado({ bestSan: engine.bestSan, cpBefore: engine.cpBefore ?? 0, cpAfter: engine.cpAfter ?? 0 });
    });
  };

  const proximo = () => {
    setRevelado(null);
    setCandidatos("");
    setAvaliacao(null);
    setTempoSeg("");
    setIndice((i) => i + 1);
  };

  const finalizar = () => {
    if (!analysisId) return;
    setErro(null);
    startTransition(async () => {
      const resultado = await finalizarAnalise(analysisId, {
        summary: `Análise de ${momentos.length} momento${momentos.length === 1 ? "" : "s"} crítico${momentos.length === 1 ? "" : "s"}.`,
        learning: aprendizado,
      });
      if (!resultado.ok) {
        setErro(resultado.error ?? "Não foi possível concluir a análise.");
        return;
      }
      setTransferidas(resultado.transferredSkillIds ?? []);
    });
  };

  if (!ready || carregando) {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-xl px-5 py-10 text-ink-muted">Preparando a análise…</main>
      </>
    );
  }

  if (!user || (erro && !momento && transferidas === null)) {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-xl px-5 py-10">
          <div className="card">
            <p className="text-sm font-semibold">{erro ?? "Entre para ver esta análise."}</p>
            <Link href="/jogar" className="btn-primary mt-4">
              Voltar
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (transferidas !== null) {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-xl px-5 py-10 space-y-5">
          <h1 className="text-2xl font-bold tracking-tight">Análise concluída</h1>
          <div className="card border-mastery/30">
            <p className="label text-mastery">Habilidades transferidas nesta partida</p>
            {transferidas.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">
                Nenhuma desta vez — transferência exige acertar o lance certo numa habilidade já
                dominada. Continue jogando.
              </p>
            ) : (
              <p className="mt-2 text-2xl font-bold tabular-nums text-mastery">{transferidas.length}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/jogar" className="btn-primary">
              Jogar de novo
            </Link>
            <button type="button" className="btn-ghost" onClick={() => router.push("/mapa")}>
              Voltar ao mapa
            </button>
          </div>
        </main>
      </>
    );
  }

  if (momentos.length === 0) {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-xl px-5 py-10">
          <div className="card">
            <p className="text-sm font-semibold">Nenhum momento crítico nesta partida.</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Acontece em partidas curtas ou muito parelhas — não há decisão que tenha virado o
              jogo o bastante para valer análise lance a lance. Sem momento para registrar, não há
              etapa humana a cumprir: a análise já pode ser concluída.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" className="btn-primary" onClick={finalizar} disabled={pending}>
                Concluir análise
              </button>
              <Link href="/jogar" className="btn-ghost">
                Voltar
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!momento) return null;

  const marks: Mark[] = revelado
    ? [
        ...(() => {
          const m = sanToSquares(momento.fen, revelado.bestSan);
          return m ? [{ kind: "arrow" as const, from: m.from, to: m.to, tone: "good" as const }] : [];
        })(),
        ...(() => {
          if (momento.playedSan === revelado.bestSan) return [];
          const m = sanToSquares(momento.fen, momento.playedSan);
          return m ? [{ kind: "highlight" as const, from: m.to, tone: "bad" as const }] : [];
        })(),
      ]
    : [];

  return (
    <>
      <StatusBar />
      <main className="mx-auto max-w-xl px-5 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/jogar" className="text-sm text-ink-muted hover:text-ink" aria-label="Voltar">
            ←
          </Link>
          <h1 className="text-lg font-bold tracking-tight">
            Momento crítico {indice + 1} de {momentos.length}
          </h1>
        </div>

        {erro && (
          <div role="alert" className="rounded-xl2 border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            {erro}
          </div>
        )}

        <Board fen={momento.fen} mode="none" marks={marks} />
        <p className="text-xs text-ink-faint">Lance jogado: {momento.playedSan}</p>

        {!revelado && (
          <div className="card space-y-3">
            <p className="label">Antes de ver a engine</p>
            <label className="block text-sm">
              Que candidatos você considerou?
              <textarea
                value={candidatos}
                onChange={(e) => setCandidatos(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
              />
            </label>
            <div>
              <p className="text-sm">Como você avaliava a posição?</p>
              <div className="mt-1 flex gap-2">
                {(["GANHANDO", "IGUAL", "PIOR"] as const).map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setAvaliacao(op)}
                    className={`rounded-xl2 border px-3 py-1.5 text-sm font-semibold ${
                      avaliacao === op ? "border-brand bg-brand/10 text-brand" : "border-line-strong text-ink-muted"
                    }`}
                  >
                    {op === "GANHANDO" ? "Ganhando" : op === "IGUAL" ? "Igual" : "Pior"}
                  </button>
                ))}
              </div>
            </div>
            <label className="block text-sm">
              Quanto tempo você gastou aqui (segundos)?
              <input
                type="number"
                value={tempoSeg}
                onChange={(e) => setTempoSeg(e.target.value)}
                className="mt-1 w-24 rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
              />
            </label>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                className="btn-primary"
                onClick={() => registrar(false)}
                disabled={pending || !avaliacao}
              >
                Registrar e ver a engine
              </button>
              <button type="button" className="btn-ghost text-xs" onClick={() => registrar(true)} disabled={pending}>
                pular — reduz a confiança do diagnóstico deste momento
              </button>
            </div>
          </div>
        )}

        {revelado && (
          <div className="card space-y-3">
            <p className="label text-mastery">A engine encontrou</p>
            <p className="text-sm text-ink-muted">
              Melhor lance: <span className="font-semibold text-ink">{revelado.bestSan}</span>
              {momento.playedSan === revelado.bestSan
                ? " — foi exatamente o que você jogou."
                : ` (você jogou ${momento.playedSan})`}
            </p>
            {ehUltimo ? (
              <label className="block text-sm">
                O que você leva desta partida?
                <textarea
                  value={aprendizado}
                  onChange={(e) => setAprendizado(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
                />
              </label>
            ) : null}
            <button
              type="button"
              className="btn-primary"
              onClick={ehUltimo ? finalizar : proximo}
              disabled={pending}
            >
              {ehUltimo ? "Concluir análise" : "Próximo momento"}
            </button>
          </div>
        )}
      </main>
    </>
  );
}

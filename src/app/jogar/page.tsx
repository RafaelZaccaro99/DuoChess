"use client";

/**
 * Central de partidas.
 *
 * Jogar contra bot ou importar PGN — as duas portas de entrada para a
 * aplicação em partida que a North Star Metric mede (D6). Nenhuma delas tem
 * caminho local-first: uma partida precisa existir no servidor para virar
 * análise depois, então esta tela exige conta.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useProgress } from "@/components/ProgressProvider";
import { StatusBar } from "@/components/ui/StatusBar";
import {
  dnaDoJogador,
  importarPgn,
  iniciarPartidaContraBot,
  listarPartidas,
} from "@/app/actions";
import { BOT_RATING_PRESETS, type BotRating } from "@/domain/game/bot";
import { ERROR_TAXONOMY } from "@/domain/errors/taxonomy";
import type { GameSummary, PlayerDNA } from "@/lib/games-server";

const ROTULO_MODO: Record<string, string> = {
  BOT: "Contra bot",
  IMPORTED: "Importada",
};

export default function JogarPage() {
  const router = useRouter();
  const { user, ready } = useProgress();

  const [rating, setRating] = useState<BotRating>(800);
  const [cor, setCor] = useState<"w" | "b">("w");
  const [pgn, setPgn] = useState("");
  const [corPgn, setCorPgn] = useState<"w" | "b">("w");
  const [erro, setErro] = useState<string | null>(null);
  const [partidas, setPartidas] = useState<GameSummary[] | null>(null);
  const [dna, setDna] = useState<PlayerDNA | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) return;
    listarPartidas().then(setPartidas);
    dnaDoJogador().then(setDna);
  }, [user]);

  const jogarContraBot = () => {
    setErro(null);
    startTransition(async () => {
      const resultado = await iniciarPartidaContraBot(rating, cor);
      if ("gameId" in resultado) {
        router.push(`/jogar/partida/${resultado.gameId}`);
      } else {
        setErro(resultado.error ?? "Não foi possível iniciar a partida.");
      }
    });
  };

  const importar = () => {
    setErro(null);
    startTransition(async () => {
      const resultado = await importarPgn(pgn, corPgn);
      if (resultado.ok && resultado.gameId) {
        router.push(`/analise/${resultado.gameId}`);
      } else {
        setErro(resultado.error ?? "Não foi possível importar este PGN.");
      }
    });
  };

  if (!ready) {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-2xl px-5 py-10 text-ink-muted">Carregando…</main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-2xl px-5 py-10">
          <div className="card">
            <p className="text-sm font-semibold">Jogar exige conta.</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Uma partida — contra bot ou importada — precisa existir no servidor para virar
              análise depois. O progresso de exercícios funciona sem conta; partidas, não.
            </p>
            <Link href="/entrar" className="btn-primary mt-4">
              Entrar ou criar conta
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <StatusBar />
      <main className="mx-auto max-w-2xl px-5 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/mapa" className="text-sm text-ink-muted hover:text-ink" aria-label="Voltar ao mapa">
            ←
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Jogar</h1>
        </div>

        {erro && (
          <div role="alert" className="rounded-xl2 border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            {erro}
          </div>
        )}

        <div className="card space-y-4">
          <p className="label">Contra bot</p>
          <div className="flex flex-wrap gap-2">
            {BOT_RATING_PRESETS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRating(r)}
                className={`rounded-xl2 border px-3 py-1.5 text-sm font-semibold ${
                  rating === r ? "border-brand bg-brand/10 text-brand" : "border-line-strong text-ink-muted"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(["w", "b"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCor(c)}
                className={`rounded-xl2 border px-3 py-1.5 text-sm font-semibold ${
                  cor === c ? "border-brand bg-brand/10 text-brand" : "border-line-strong text-ink-muted"
                }`}
              >
                {c === "w" ? "Jogar de brancas" : "Jogar de pretas"}
              </button>
            ))}
          </div>
          <button type="button" className="btn-primary" onClick={jogarContraBot} disabled={pending}>
            Começar partida
          </button>
        </div>

        <div className="card space-y-3">
          <p className="label">Importar PGN</p>
          <p className="text-xs text-ink-muted">Uma partida por importação. Cole o texto completo abaixo.</p>
          <textarea
            value={pgn}
            onChange={(e) => setPgn(e.target.value)}
            rows={6}
            className="w-full rounded-xl2 border border-line-strong bg-surface p-3 font-mono text-xs"
            placeholder={'[Event "..."]\n\n1. e4 e5 2. Nf3 ...'}
          />
          <div className="flex gap-2">
            {(["w", "b"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCorPgn(c)}
                className={`rounded-xl2 border px-3 py-1.5 text-sm font-semibold ${
                  corPgn === c ? "border-brand bg-brand/10 text-brand" : "border-line-strong text-ink-muted"
                }`}
              >
                {c === "w" ? "Eu joguei de brancas" : "Eu joguei de pretas"}
              </button>
            ))}
          </div>
          <button type="button" className="btn-primary" onClick={importar} disabled={pending || !pgn.trim()}>
            Importar
          </button>
        </div>

        {dna && dna.gamesAnalyzed > 0 && (
          <div className="card border-mastery/30">
            <p className="label text-mastery">DNA do Jogador</p>
            <p className="mt-1 text-xs text-ink-muted">
              {dna.gamesAnalyzed} {dna.gamesAnalyzed === 1 ? "partida analisada" : "partidas analisadas"} ·{" "}
              {dna.skillsTransferred} {dna.skillsTransferred === 1 ? "habilidade transferida" : "habilidades transferidas"}
            </p>
            {dna.topCauses.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-ink-muted">
                {dna.topCauses.slice(0, 3).map((c) => (
                  <li key={c.cause}>
                    {ERROR_TAXONOMY[c.cause].label} — {c.count}×
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {partidas && partidas.length > 0 && (
          <div className="card">
            <p className="label">Suas partidas</p>
            <ul className="mt-2 divide-y divide-line">
              {partidas.map((g) => (
                <li key={g.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {ROTULO_MODO[g.mode] ?? g.mode} · {g.opponent}
                    </p>
                    <p className="text-xs text-ink-faint">{g.result ?? "em andamento"}</p>
                  </div>
                  {g.finishedAt ? (
                    <Link href={`/analise/${g.id}`} className="btn-ghost shrink-0 text-xs">
                      {g.analyzed ? "Ver análise" : "Analisar"}
                    </Link>
                  ) : (
                    <Link href={`/jogar/partida/${g.id}`} className="btn-ghost shrink-0 text-xs">
                      Continuar
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </>
  );
}

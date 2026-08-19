"use client";

import Link from "next/link";
import { useProgress } from "@/components/ProgressProvider";
import { totalXP, masteryList } from "@/domain/session";
import { computeChessScore } from "@/domain/score/chess-score";
import { buildIndex, skillIndexForScore } from "@/domain/curriculum";
import { dueQueue } from "@/domain/srs";
import { COURSE } from "@/content";
import { StatChip } from "./Meters";

const INDEX = buildIndex(COURSE);
const SKILL_INDEX = skillIndexForScore(INDEX);

export function StatusBar() {
  const { state, ready, user, saveError } = useProgress();
  if (!ready || !state) return <div className="h-14 border-b border-line" />;

  const now = new Date().toISOString();
  const score = computeChessScore(masteryList(state), SKILL_INDEX, now);
  const due = dueQueue(Object.values(state.reviewCards), now).length;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-2.5">
        <Link href="/mapa" className="shrink-0 text-sm font-bold tracking-tight text-brand">
          MestreXadrez
        </Link>
        <div className="flex items-center gap-3 overflow-x-auto sm:gap-4">
          <StatChip
            label="Seq"
            value={`${state.streak.current}d`}
            tone="streak"
            icon="◈"
            hint="Mede hábito. Não mede competência."
          />
          <StatChip
            label="XP"
            value={totalXP(state)}
            tone="xp"
            icon="◆"
            hint="Mede atividade e esforço. Não mede competência."
          />
          <StatChip
            label="Foco"
            value={state.focus.value}
            tone="focus"
            icon="◐"
            hint="Energia pedagógica. Recupera com revisão, microlição ou pausa — nunca com compra."
          />
          <StatChip
            label="Score"
            value={score.total}
            tone="mastery"
            icon="●"
            hint="Mede competência demonstrada, de 0 a 1000. Não sobe com atividade."
          />
        </div>
      </div>
      {/* Gravação que falhou nunca some em silêncio: o usuário continuaria
          estudando achando que está sendo salvo. */}
      {saveError && (
        <div role="alert" className="border-t border-danger/40 bg-danger/10">
          <div className="mx-auto max-w-3xl px-4 py-1.5 text-xs text-danger">
            {saveError} Seu progresso desta sessão ainda está nesta aba — não feche antes de
            resolver.
          </div>
        </div>
      )}

      {due > 0 && (
        <div className="border-t border-line bg-surface-raised">
          <div className="mx-auto max-w-3xl px-4 py-1.5 text-xs text-ink-muted">
            {due} {due === 1 ? "item venceu" : "itens venceram"} na revisão espaçada.{" "}
            <Link href="/mapa" className="font-semibold text-brand underline underline-offset-2">
              Revisar
            </Link>
          </div>
        </div>
      )}

      {!user && (
        <div className="border-t border-line bg-surface-raised">
          <div className="mx-auto max-w-3xl px-4 py-1.5 text-xs text-ink-muted">
            Progresso salvo só neste navegador.{" "}
            <Link href="/entrar" className="font-semibold text-brand underline underline-offset-2">
              Criar conta para sincronizar
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

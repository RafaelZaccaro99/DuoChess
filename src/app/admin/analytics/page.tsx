"use client";

/**
 * Prova de vida do pipeline de analytics (A8) — não é dashboard de produto.
 *
 * North Star da semana atual, calculada sobre SkillMastery/ReviewSchedule
 * reais do Postgres (não sobre um ProgressState de teste), mais a contagem de
 * eventos das últimas 24h por nome. Existe para provar visualmente que
 * "calculável a partir de eventos reais" (docs/09) é verdade, não para
 * substituir uma ferramenta de produto.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgress } from "@/components/ProgressProvider";
import { StatusBar } from "@/components/ui/StatusBar";
import { painelDeAnalytics } from "@/app/actions";
import type { EventCount, NorthStarResult } from "@/lib/analytics-server";

export default function AnalyticsAdminPage() {
  const { user, ready } = useProgress();
  const [painel, setPainel] = useState<{ northStar: NorthStarResult; eventos: EventCount[] } | null>(null);

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    painelDeAnalytics().then((r) => {
      if ("northStar" in r) setPainel(r);
    });
  }, [user]);

  if (!ready) {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-2xl px-5 py-10 text-ink-muted">Carregando…</main>
      </>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-2xl px-5 py-10">
          <div className="card">
            <p className="text-sm font-semibold">Esta área exige conta de administrador.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <StatusBar />
      <main className="mx-auto max-w-3xl px-5 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-sm text-ink-muted hover:text-ink" aria-label="Voltar à fila">
            ←
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Analytics</h1>
        </div>

        {!painel && <p className="text-sm text-ink-muted">Carregando…</p>}

        {painel && (
          <>
            <div className="card border-mastery/30">
              <p className="label text-mastery">North Star desta semana</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-mastery">{painel.northStar.count}</p>
              <p className="mt-1 text-xs text-ink-muted">
                pares (usuário, habilidade) dominados e transferidos · {painel.northStar.usersCounted}{" "}
                {painel.northStar.usersCounted === 1 ? "usuário considerado" : "usuários considerados"}
              </p>
            </div>

            <div className="card">
              <p className="label">Eventos das últimas 24h</p>
              {painel.eventos.length === 0 && (
                <p className="mt-2 text-sm text-ink-muted">Nenhum evento gravado ainda.</p>
              )}
              {painel.eventos.length > 0 && (
                <ul className="mt-2 divide-y divide-line text-sm">
                  {painel.eventos.map((e) => (
                    <li key={e.name} className="flex items-center justify-between py-1.5">
                      <span className="text-ink-muted">{e.name}</span>
                      <span className="font-semibold tabular-nums">{e.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}

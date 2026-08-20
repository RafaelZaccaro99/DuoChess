"use client";

/**
 * Fila de conteúdo do CMS (A7).
 *
 * A guarda real de segurança não é esta tela — é `currentAdmin()` em cada
 * server action, o mesmo jeito que todo o resto do app já funciona sem
 * `middleware.ts`. Esta tela só evita mostrar um formulário a quem a ação vai
 * recusar de qualquer jeito.
 *
 * Fila compartilhada: todo exercício autorado por CMS aparece aqui, não só os
 * do administrador logado — dois administradores revisam o mesmo acervo.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgress } from "@/components/ProgressProvider";
import { StatusBar } from "@/components/ui/StatusBar";
import { listarExerciciosAutorados } from "@/app/actions";
import type { AuthoredExerciseSummary } from "@/lib/content-server";

const ROTULO_ESTADO: Record<string, string> = {
  DRAFT: "Rascunho",
  PUBLISHED: "Publicado",
};

export default function AdminPage() {
  const { user, ready } = useProgress();
  const [itens, setItens] = useState<AuthoredExerciseSummary[] | null>(null);

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    listarExerciciosAutorados().then((r) => {
      setItens(Array.isArray(r) ? r : []);
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

  if (!user) {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-2xl px-5 py-10">
          <div className="card">
            <p className="text-sm font-semibold">Esta área exige conta.</p>
            <Link href="/entrar" className="btn-primary mt-4">
              Entrar
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-2xl px-5 py-10">
          <div className="card">
            <p className="text-sm font-semibold">Esta área exige conta de administrador.</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Sua conta não tem esse papel. Não há como virar administrador pelo app.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <StatusBar />
      <main className="mx-auto max-w-3xl px-5 py-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/mapa" className="text-sm text-ink-muted hover:text-ink" aria-label="Voltar ao mapa">
              ←
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Conteúdo (CMS)</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/analytics" className="btn-ghost">
              Analytics
            </Link>
            <Link href="/admin/exercicios/novo" className="btn-primary">
              Novo exercício
            </Link>
          </div>
        </div>

        {itens === null && <p className="text-sm text-ink-muted">Carregando fila…</p>}

        {itens !== null && itens.length === 0 && (
          <div className="card">
            <p className="text-sm font-semibold">Nenhum exercício autorado ainda.</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Todo item criado por CMS, de qualquer administrador, aparece aqui.
            </p>
          </div>
        )}

        {itens !== null && itens.length > 0 && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-faint">
                  <th className="pb-2 pr-3 font-medium">Slug</th>
                  <th className="pb-2 pr-3 font-medium">Habilidades</th>
                  <th className="pb-2 pr-3 font-medium">Estado</th>
                  <th className="pb-2 font-medium">Atualizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {itens.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2 pr-3">
                      <Link href={`/admin/exercicios/${e.id}`} className="font-semibold text-brand hover:underline">
                        {e.slug}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 text-ink-muted">{e.skillIds.join(", ") || "—"}</td>
                    <td className="py-2 pr-3">
                      <span
                        className={
                          e.reviewState === "PUBLISHED"
                            ? "rounded-full bg-ok/10 px-2 py-0.5 text-xs font-semibold text-ok"
                            : "rounded-full bg-warn/10 px-2 py-0.5 text-xs font-semibold text-warn"
                        }
                      >
                        {ROTULO_ESTADO[e.reviewState] ?? e.reviewState}
                      </span>
                    </td>
                    <td className="py-2 text-ink-faint">{new Date(e.updatedAt).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}

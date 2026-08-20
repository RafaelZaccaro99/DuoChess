"use client";

/**
 * Auditoria por amostragem (A8.5, docs/09 §0, item 3).
 *
 * Um jogador forte sorteia ~5% do acervo publicado e procura erro
 * SISTEMÁTICO — nome de padrão errado, fonte que não sustenta a afirmação,
 * regra que não generaliza — não erro item a item. Esta tela só registra o
 * veredito de cada item sorteado; a leitura em si acontece na cabeça de
 * quem audita.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgress } from "@/components/ProgressProvider";
import { StatusBar } from "@/components/ui/StatusBar";
import {
  sortearAmostraAction,
  salvarAuditoriaAction,
  historicoDeAuditoriasAction,
} from "@/app/actions";
import type { AuditSampleItem, AuditRecordInput, AuditRecordSummary } from "@/lib/content-server";

type Veredito = { outcome: "OK" | "FLAGGED"; notes: string };

export default function AuditoriaPage() {
  const { user, ready } = useProgress();
  const [amostra, setAmostra] = useState<AuditSampleItem[] | null>(null);
  const [vereditos, setVereditos] = useState<Record<string, Veredito>>({});
  const [sorteando, setSorteando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [historico, setHistorico] = useState<AuditRecordSummary[] | null>(null);

  const carregarHistorico = () => {
    historicoDeAuditoriasAction().then((r) => setHistorico(Array.isArray(r) ? r : []));
  };

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    carregarHistorico();
  }, [user]);

  const novaAmostra = () => {
    setSorteando(true);
    setSalvo(false);
    setErro(null);
    sortearAmostraAction(5).then((r) => {
      setSorteando(false);
      if (!Array.isArray(r)) {
        setErro(r.error ?? "Não foi possível sortear a amostra.");
        return;
      }
      setAmostra(r);
      setVereditos(Object.fromEntries(r.map((item) => [item.slug, { outcome: "OK" as const, notes: "" }])));
    });
  };

  const salvar = () => {
    if (!amostra) return;
    setSalvando(true);
    setErro(null);
    const itens: AuditRecordInput[] = amostra.map((item) => ({
      slug: item.slug,
      outcome: vereditos[item.slug]?.outcome ?? "OK",
      notes: vereditos[item.slug]?.notes ?? "",
    }));
    salvarAuditoriaAction(itens).then((r) => {
      setSalvando(false);
      if (!r.ok) {
        setErro(r.error ?? "Não foi possível salvar a auditoria.");
        return;
      }
      setSalvo(true);
      setAmostra(null);
      carregarHistorico();
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
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-ink-muted hover:text-ink" aria-label="Voltar ao painel">
              ←
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Auditoria por amostragem</h1>
          </div>
          <button type="button" className="btn-primary" disabled={sorteando} onClick={novaAmostra}>
            {sorteando ? "Sorteando…" : "Nova amostra"}
          </button>
        </div>

        <p className="text-sm leading-relaxed text-ink-muted">
          Sorteia ~5% do acervo publicado. Procure erro SISTEMÁTICO — nome de padrão errado, fonte que não sustenta a
          afirmação, regra que não generaliza — não erro item a item.
        </p>

        {erro && <p className="text-sm text-danger">{erro}</p>}
        {salvo && <p className="text-sm text-ok">Auditoria salva.</p>}

        {amostra !== null && (
          <div className="space-y-4">
            {amostra.map((item) => (
              <div key={item.slug} className="card space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold">
                    {item.slug} <span className="text-ink-faint">({item.where})</span>
                  </p>
                  <span className="text-xs text-ink-faint">{item.type}</span>
                </div>
                <p className="text-xs text-ink-muted">{item.skills}</p>
                <p className="font-mono text-xs text-ink-muted">{item.fen}</p>
                <p className="text-sm">{item.prompt}</p>
                <p className="text-xs text-ink-muted">Gabarito: {item.acceptedAnswer}</p>
                <div className="space-y-1 text-xs text-ink-muted">
                  <p>Percebido: {item.explanation.perceived}</p>
                  <p>Ameaça: {item.explanation.threat}</p>
                  <p>Defesa: {item.explanation.bestDefense}</p>
                  <p>Motivo: {item.explanation.reason}</p>
                  <p>Padrão: {item.explanation.pattern}</p>
                  <p>Regra geral: {item.explanation.transferableRule}</p>
                </div>
                <p className="text-xs text-ink-faint">Fontes: {item.sources}</p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      name={`veredito-${item.slug}`}
                      checked={(vereditos[item.slug]?.outcome ?? "OK") === "OK"}
                      onChange={() =>
                        setVereditos((v) => ({ ...v, [item.slug]: { ...v[item.slug]!, outcome: "OK" } }))
                      }
                    />
                    OK
                  </label>
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      name={`veredito-${item.slug}`}
                      checked={vereditos[item.slug]?.outcome === "FLAGGED"}
                      onChange={() =>
                        setVereditos((v) => ({ ...v, [item.slug]: { ...v[item.slug]!, outcome: "FLAGGED" } }))
                      }
                    />
                    FLAGGED
                  </label>
                </div>
                <textarea
                  className="w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
                  rows={2}
                  placeholder="Observação (opcional)"
                  value={vereditos[item.slug]?.notes ?? ""}
                  onChange={(e) =>
                    setVereditos((v) => ({
                      ...v,
                      [item.slug]: { outcome: v[item.slug]?.outcome ?? "OK", notes: e.target.value },
                    }))
                  }
                />
              </div>
            ))}

            <button type="button" className="btn-primary" disabled={salvando} onClick={salvar}>
              {salvando ? "Salvando…" : "Salvar auditoria"}
            </button>
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink-faint">Histórico</h2>

          {historico === null && <p className="text-sm text-ink-muted">Carregando…</p>}
          {historico !== null && historico.length === 0 && (
            <p className="text-sm text-ink-muted">Nenhuma auditoria registrada ainda.</p>
          )}
          {historico !== null && historico.length > 0 && (
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-faint">
                    <th className="pb-2 pr-3 font-medium">Slug</th>
                    <th className="pb-2 pr-3 font-medium">Resultado</th>
                    <th className="pb-2 pr-3 font-medium">Auditor</th>
                    <th className="pb-2 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {historico.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2 pr-3 font-semibold">{r.exerciseSlug}</td>
                      <td className="py-2 pr-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            r.outcome === "FLAGGED" ? "bg-danger/10 text-danger" : "bg-ok/10 text-ok"
                          }`}
                        >
                          {r.outcome}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-ink-muted">{r.auditorName}</td>
                      <td className="py-2 text-ink-faint">{new Date(r.auditedAt).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

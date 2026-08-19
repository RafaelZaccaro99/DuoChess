"use client";

/**
 * Fontes da lição.
 *
 * O conteúdo enxadrístico é pesquisado a partir de bibliografia especializada,
 * sem revisor titulado no fluxo. Exibir a fonte não é crédito acadêmico: é o que
 * permite ao aluno conferir a afirmação e discordar dela com base em algo.
 */

import { getSource } from "@/content/bibliografia";

export function Fontes({ sourceIds }: { sourceIds: readonly string[] }) {
  const fontes = [...new Set(sourceIds)].map(getSource).filter((s) => s !== undefined);
  if (fontes.length === 0) return null;

  return (
    <details className="rounded-xl2 border border-line bg-surface-raised px-5 py-4">
      <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-wider text-ink-faint">
        Baseado em {fontes.length} {fontes.length === 1 ? "fonte" : "fontes"}
      </summary>
      <ul className="mt-3 space-y-2.5">
        {fontes.map((fonte) => (
          <li key={fonte.id} className="text-sm leading-relaxed">
            <span className="text-ink">
              {fonte.author}. <em>{fonte.title}</em>
              {fonte.edition && <span className="text-ink-muted"> ({fonte.edition})</span>}.
            </span>
            <span className="mt-0.5 block text-xs text-ink-muted">{fonte.use}</span>
            {fonte.url && (
              <a
                href={fonte.url}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-0.5 inline-block text-xs text-brand underline underline-offset-2"
              >
                Consultar a fonte
              </a>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-ink-faint">
        Regras seguem as Leis do Xadrez da FIDE vigentes. Se você encontrar uma divergência
        entre o que ensinamos e a fonte, ela é um erro nosso — e queremos saber.
      </p>
    </details>
  );
}

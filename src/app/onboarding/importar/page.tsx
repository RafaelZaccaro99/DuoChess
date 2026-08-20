/**
 * Porta de entrada "Importar partidas".
 *
 * Não existe diagnóstico paralelo aqui — isto aponta direto para o pipeline
 * de partidas que o A5 já construiu (`/jogar` → análise com etapa humana
 * antes da engine). Duplicar aquilo seria exatamente o tipo de diagnóstico
 * simulado que este produto se recusa a fazer.
 */

import Link from "next/link";

export default function ImportarPage() {
  return (
    <main className="mx-auto max-w-lg px-5 py-14">
      <h1 className="text-2xl font-bold leading-tight tracking-tight">Traga suas partidas</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        Analisamos suas decisões reais em vez de perguntar sobre elas. Para uma estimativa
        confiável de nível avançado, importe pelo menos 10 partidas — quanto mais recentes e sem
        assistência, melhor.
      </p>
      <Link href="/jogar" className="btn-primary mt-6">
        Importar PGN
      </Link>
    </main>
  );
}

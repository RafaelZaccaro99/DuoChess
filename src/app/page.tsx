import Link from "next/link";
import { COURSE } from "@/content";

const PILARES = [
  {
    titulo: "Escola",
    texto: "Um caminho curricular que responde à pergunta que nenhuma plataforma responde: o que eu estudo primeiro?",
  },
  {
    titulo: "Treinador",
    texto: "Cada erro é classificado por causa — regra, padrão, cálculo interrompido, relógio, emoção. A correção depende da causa.",
  },
  {
    titulo: "Sistema de performance",
    texto: "Estudo, partidas e rating no mesmo ciclo. O que você domina precisa aparecer no tabuleiro.",
  },
];

export default function LandingPage() {
  const ligas = COURSE.leagues;

  return (
    <main className="mx-auto max-w-3xl px-5 py-14">
      <p className="label">MestreXadrez</p>

      <h1 className="mt-4 text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
        Aprenda a pensar como um enxadrista, treine como um atleta.
      </h1>

      <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
        Do primeiro lance ao xadrez competitivo, por um caminho verificável. Aqui, resolver
        exercícios não é a prova de que você aprendeu — <strong className="text-ink">aplicar em partida é</strong>.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/onboarding" className="btn-primary">
          Começar agora
        </Link>
        <Link href="/mapa" className="btn-ghost">
          Ver o caminho
        </Link>
      </div>

      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        {PILARES.map((pilar) => (
          <div key={pilar.titulo} className="card">
            <h2 className="text-sm font-bold text-brand">{pilar.titulo}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{pilar.texto}</p>
          </div>
        ))}
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold tracking-tight">Duas medidas que nunca se misturam</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="card border-xp/30">
            <p className="label text-xp">XP, sequência, Foco</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Medem <strong className="text-ink">atividade e hábito</strong>. Sobem quando você aparece
              e se esforça. Exercícios fáceis rendem menos, e não existe como acumular repetindo o
              que já é trivial.
            </p>
          </div>
          <div className="card border-mastery/30">
            <p className="label text-mastery">Chess Score e domínio</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Medem <strong className="text-ink">competência</strong>. Sobem só com demonstração sem
              dicas, caem sozinhos quando você para de reavaliar, e{" "}
              <strong className="text-ink">nenhum plano pago os altera</strong>.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold tracking-tight">Oito ligas, do zero ao circuito</h2>
        <ol className="mt-4 divide-y divide-line overflow-hidden rounded-xl2 border border-line">
          {ligas.map((liga) => {
            const temConteudo = liga.units.length > 0;
            return (
              <li key={liga.id} className="flex items-baseline gap-3 bg-surface-raised px-4 py-3">
                <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-ink-faint">
                  {liga.order}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {liga.title}{" "}
                    <span className="font-normal text-ink-faint">
                      {liga.ratingMin}–{liga.ratingMax}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{liga.focus}</p>
                </div>
                <span
                  className={
                    temConteudo
                      ? "shrink-0 rounded-full bg-ok/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ok"
                      : "shrink-0 rounded-full border border-line-strong px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-faint"
                  }
                >
                  {temConteudo ? `${liga.units.length} unidades` : "em produção"}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          As ligas marcadas como “em produção” ainda não têm conteúdo publicado. Preferimos dizer
          isso a exibir unidades vazias que parecem prontas. Concluir um curso não garante rating
          nem título: níveis avançados dependem de transferência para partidas oficiais.
        </p>
      </section>
    </main>
  );
}

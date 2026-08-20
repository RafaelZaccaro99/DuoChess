"use client";

/**
 * A microlição, agora acontecendo de verdade.
 *
 * O feedback anunciava "você vai reencontrar o conceito por outra abordagem" e
 * nada acontecia — o cartão do FSRS era reiniciado, e só. Esta tela é a metade
 * que faltava: conceito de volta, complexidade reduzida, nova aplicação.
 */

import { useState } from "react";
import type { Microlicao as MicrolicaoDef } from "@/domain/adaptive/microlicao";
import { Board } from "@/components/board/Board";
import { ExecutorDeExercicios, negrito } from "./ExecutorDeExercicios";
import { useExecutorDeExercicios } from "./useExecutorDeExercicios";

export function Microlicao({
  microlicao,
  skillTitles,
  onConcluir,
}: {
  microlicao: MicrolicaoDef;
  skillTitles: Record<string, string>;
  onConcluir(): void;
}) {
  const [fase, setFase] = useState<"conceito" | "aplicar">("conceito");

  const executor = useExecutorDeExercicios({
    itens: microlicao.exercicio ? [microlicao.exercicio] : [],
    // Concluir microlição recupera Foco: está na tabela do domínio, e é ação
    // pedagógica — nunca compra.
    recuperaFocoAoConcluir: "MICROLESSON_COMPLETED",
    aoConcluir: onConcluir,
  });

  if (fase === "conceito") {
    return (
      <div className="space-y-5">
        <div className="rounded-xl2 border border-focus/50 bg-focus/10 p-4">
          <p className="label text-focus">Microlição · {microlicao.causaLabel}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            Este erro foi <strong>conceitual</strong>, não de distração. Antes de seguir, vamos
            rever <strong>{microlicao.skillTitle}</strong> e tentar de novo com um exercício mais
            simples.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">{microlicao.intervencao}</p>
        </div>

        <div className="card">
          <p className="label">O conceito</p>
          <div className="mt-3 space-y-3">
            {microlicao.conceito.split("\n\n").map((paragrafo, i) => (
              <p
                key={i}
                className="text-sm leading-relaxed text-ink-muted"
                dangerouslySetInnerHTML={{ __html: negrito(paragrafo) }}
              />
            ))}
          </div>
        </div>

        {microlicao.demo && (
          <div className="card">
            <p className="label">Demonstração</p>
            <div className="mt-3">
              <Board fen={microlicao.demo.fen} mode="none" />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{microlicao.demo.caption}</p>
          </div>
        )}

        <button
          type="button"
          className="btn-primary w-full"
          onClick={() => (microlicao.exercicio ? setFase("aplicar") : onConcluir())}
        >
          {microlicao.exercicio ? "Tentar de novo, mais simples" : "Continuar a sessão"}
        </button>
      </div>
    );
  }

  if (!executor.exercicio || executor.concluido) {
    return (
      <div className="space-y-5">
        <div className="card border-focus/50">
          <p className="label text-focus">Microlição concluída</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            A habilidade volta para a fila de revisão em intervalo curto. Você vai reencontrá-la
            antes de esquecer de novo.
          </p>
        </div>
        <button type="button" className="btn-primary w-full" onClick={onConcluir}>
          Continuar a sessão
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl2 border border-focus/40 bg-focus/5 px-4 py-2.5">
        <p className="text-xs leading-relaxed text-ink-muted">
          Microlição · versão mais simples de <strong className="text-ink">{microlicao.skillTitle}</strong>
        </p>
      </div>

      <ExecutorDeExercicios
        exercicio={executor.exercicio}
        dicasUsadas={executor.dicasUsadas}
        efeitos={executor.efeitos}
        ehUltimo
        skillTitles={skillTitles}
        onResponder={executor.responder}
        onPedirDica={executor.pedirDica}
        onAvancar={executor.avancar}
        rotuloDoFim="Continuar a sessão"
      />
    </div>
  );
}

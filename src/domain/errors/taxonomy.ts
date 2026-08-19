/**
 * Taxonomia de causas de erro (13 causas, conforme o spec).
 *
 * Este é o coração do diferencial do produto: outras plataformas dizem QUE o lance
 * foi ruim. Aqui dizemos POR QUE ele aconteceu, porque a correção depende da causa.
 * Errar por não conhecer o padrão e errar por parar o cálculo cedo demais exigem
 * intervenções diferentes.
 */

import type { Competency } from "../types";

export const ERROR_CAUSES = [
  "RULE",
  "TACTIC",
  "PATTERN",
  "VISUALIZATION",
  "CALCULATION_STOPPED",
  "CANDIDATE_IGNORED",
  "EVALUATION",
  "STRATEGY",
  "ENDGAME",
  "OPENING",
  "CLOCK",
  "OVERCONFIDENCE",
  "EMOTION",
] as const;

export type ErrorCause = (typeof ERROR_CAUSES)[number];

export type ErrorSeverity = "MINOR" | "SERIOUS" | "DECISIVE";

export interface ErrorCauseInfo {
  cause: ErrorCause;
  label: string;
  /** O que caracteriza esta causa. */
  description: string;
  /** Competência que a correção deve treinar. */
  competency: Competency;
  /**
   * Conceitual = falha de compreensão, aciona microlição e reinicia o cartão da
   * habilidade. Não-conceitual = falha de execução, apenas encurta o intervalo.
   */
  conceptual: boolean;
  /** Intervenção padrão do motor adaptativo. */
  intervention: string;
}

export const ERROR_TAXONOMY: Record<ErrorCause, ErrorCauseInfo> = {
  RULE: {
    cause: "RULE",
    label: "Regra",
    description: "Lance ilegal, ou desconhecimento de roque, en passant, promoção ou empate.",
    competency: "rules",
    conceptual: true,
    intervention: "Reensinar a regra com demonstração e exigir prova de domínio antes de avançar.",
  },
  TACTIC: {
    cause: "TACTIC",
    label: "Tática",
    description: "Deixou peça, permitiu tática do adversário ou perdeu uma tática disponível.",
    competency: "tactics",
    conceptual: true,
    intervention: "Treino do padrão específico + verificação antierro obrigatória.",
  },
  PATTERN: {
    cause: "PATTERN",
    label: "Padrão não reconhecido",
    description: "O motivo existia na posição mas não foi percebido como padrão conhecido.",
    competency: "tactics",
    conceptual: true,
    intervention: "Bloco de reconhecimento rápido do mesmo motivo em posições variadas.",
  },
  VISUALIZATION: {
    cause: "VISUALIZATION",
    label: "Visualização",
    description: "Perdeu a posição mental: linha aberta, peça removida ou casa esquecida.",
    competency: "calculation",
    conceptual: true,
    intervention: "Exercícios de cores de casas, rotas de cavalo e cálculo sem mover peças.",
  },
  CALCULATION_STOPPED: {
    cause: "CALCULATION_STOPPED",
    label: "Cálculo interrompido",
    description: "Parou a variante antes de uma posição estável e avaliável.",
    competency: "calculation",
    conceptual: false,
    intervention: "Exigir declaração explícita do fim da linha e da avaliação final.",
  },
  CANDIDATE_IGNORED: {
    cause: "CANDIDATE_IGNORED",
    label: "Candidato ignorado",
    description: "Não considerou um lance forte disponível; viés de confirmação da primeira ideia.",
    competency: "calculation",
    conceptual: false,
    intervention: "Exercícios de listar três candidatos antes de calcular qualquer um.",
  },
  EVALUATION: {
    cause: "EVALUATION",
    label: "Avaliação",
    description: "Calculou corretamente, mas julgou mal a posição final da variante.",
    competency: "strategy",
    conceptual: true,
    intervention: "Comparar avaliações próprias com a engine em posições estáveis.",
  },
  STRATEGY: {
    cause: "STRATEGY",
    label: "Estratégia",
    description: "Plano inexistente, incoerente com a estrutura, ou peça pior não melhorada.",
    competency: "strategy",
    conceptual: true,
    intervention: "Exercícios de plano e de pior peça na mesma estrutura.",
  },
  ENDGAME: {
    cause: "ENDGAME",
    label: "Final",
    description: "Falha de técnica em final teórico ou prático: oposição, conversão, defesa.",
    competency: "endgame",
    conceptual: true,
    intervention: "Final teórico correspondente até conversão sem erro, depois revisão espaçada.",
  },
  OPENING: {
    cause: "OPENING",
    label: "Abertura",
    description: "Saiu do repertório, ou seguiu a teoria sem compreender o plano.",
    competency: "opening",
    conceptual: true,
    intervention: "Revisar a linha pelo plano, não pela sequência de lances.",
  },
  CLOCK: {
    cause: "CLOCK",
    label: "Relógio",
    description: "Tempo mal distribuído: lento em posição simples, rápido em momento crítico.",
    competency: "practical",
    conceptual: false,
    intervention: "Treino com orçamento de tempo por lance e alerta de momento crítico.",
  },
  OVERCONFIDENCE: {
    cause: "OVERCONFIDENCE",
    label: "Excesso de confiança",
    description: "Jogou sem verificar porque a posição parecia ganha.",
    competency: "practical",
    conceptual: false,
    intervention: "Verificação antierro obrigatória em posições de vantagem.",
  },
  EMOTION: {
    cause: "EMOTION",
    label: "Emoção",
    description: "Decisão alterada por frustração, pressa, medo ou revanche após erro anterior.",
    competency: "practical",
    conceptual: false,
    intervention: "Protocolo de reset após erro e registro do estado emocional na análise.",
  },
};

/** Uma classificação só alimenta o gargalo acima deste limiar (docs/02 D5). */
export const MIN_CONFIDENCE_FOR_BOTTLENECK = 0.6;

export interface ClassifiedError {
  cause: ErrorCause;
  severity: ErrorSeverity;
  /** 0..1 */
  confidence: number;
  explanation: string;
  ply?: number;
  skillId?: string;
  at: string;
}

export function isConceptual(cause: ErrorCause): boolean {
  return ERROR_TAXONOMY[cause].conceptual;
}

export function competencyFor(cause: ErrorCause): Competency {
  return ERROR_TAXONOMY[cause].competency;
}

/** Conta reincidência por causa dentro de uma janela (padrão: 14 dias). */
export function recurrenceByCause(
  errors: readonly ClassifiedError[],
  nowIso: string,
  windowDays = 14,
): Map<ErrorCause, number> {
  const cutoff = new Date(nowIso).getTime() - windowDays * 86_400_000;
  const counts = new Map<ErrorCause, number>();
  for (const e of errors) {
    if (new Date(e.at).getTime() < cutoff) continue;
    if (e.confidence < MIN_CONFIDENCE_FOR_BOTTLENECK) continue;
    counts.set(e.cause, (counts.get(e.cause) ?? 0) + 1);
  }
  return counts;
}

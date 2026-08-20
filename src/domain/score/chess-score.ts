/**
 * Chess Score — 0 a 1000.
 *
 * Medida INTERNA de competência. Separada de XP, nível da conta, rating online e
 * rating oficial. Nenhuma delas entra neste cálculo, e nada aqui pode ser comprado.
 *
 * Componentes e pesos padrão vêm do spec e são configuráveis.
 */

import {
  COMPETENCIES,
  COMPETENCY_LABELS,
  type Competency,
  type SkillMastery,
  clamp,
} from "../types";
import { effectiveMastery } from "../mastery";

export type CompetencyWeights = Record<Competency, number>;

/** Pesos do spec: regras 10, tática 20, cálculo 20, estratégia 15, finais 15,
 *  aberturas 5, análise 5, desempenho prático 10. Somam 100. */
export const DEFAULT_WEIGHTS: CompetencyWeights = {
  rules: 0.1,
  tactics: 0.2,
  calculation: 0.2,
  strategy: 0.15,
  endgame: 0.15,
  opening: 0.05,
  analysis: 0.05,
  practical: 0.1,
};

export interface ChessScore {
  /** 0..1000 */
  total: number;
  /** Cada competência 0..100. */
  components: Record<Competency, number>;
  /** Quantas habilidades foram avaliadas por competência — mede cobertura. */
  coverage: Record<Competency, number>;
  weights: CompetencyWeights;
  strength: Competency | null;
  bottleneck: Competency | null;
  nextRecommendation: string;
}

export interface SkillIndexEntry {
  skillId: string;
  competency: Competency;
}

/**
 * Uma competência não avaliada vale 0, não "média". Fingir que o usuário tem
 * nível médio em finais porque nunca testamos finais seria inventar dado.
 */
export function computeChessScore(
  masteries: readonly SkillMastery[],
  skillIndex: readonly SkillIndexEntry[],
  nowIso: string,
  weights: CompetencyWeights = DEFAULT_WEIGHTS,
): ChessScore {
  const competencyOf = new Map(skillIndex.map((s) => [s.skillId, s.competency]));

  const sums = {} as Record<Competency, number>;
  const counts = {} as Record<Competency, number>;
  const totals = {} as Record<Competency, number>;
  for (const c of COMPETENCIES) {
    sums[c] = 0;
    counts[c] = 0;
    totals[c] = 0;
  }
  for (const entry of skillIndex) totals[entry.competency] += 1;

  for (const m of masteries) {
    const c = competencyOf.get(m.skillId);
    if (!c) continue;
    sums[c] += effectiveMastery(m, nowIso);
    counts[c] += 1;
  }

  const components = {} as Record<Competency, number>;
  const coverage = {} as Record<Competency, number>;
  for (const c of COMPETENCIES) {
    // Divide pelo TOTAL de habilidades da competência, não pelas avaliadas:
    // ter 100 numa habilidade de tática não é ter 100 em tática.
    const denom = totals[c] || 1;
    components[c] = clamp(Math.round(sums[c] / denom), 0, 100);
    coverage[c] = totals[c] === 0 ? 0 : Math.round((counts[c] / totals[c]) * 100);
  }

  const total = clamp(
    Math.round(COMPETENCIES.reduce((acc, c) => acc + components[c] * weights[c] * 10, 0)),
    0,
    1000,
  );

  const { strength, bottleneck } = findStrengthAndBottleneck(components, coverage, weights);

  return {
    total,
    components,
    coverage,
    weights,
    strength,
    bottleneck,
    nextRecommendation: recommendationFor(bottleneck, coverage),
  };
}

/**
 * Quantas habilidades existem por competência no currículo — não quantas
 * foram avaliadas. `coverage[c] === 0` sozinho não diz se a competência está
 * vazia de conteúdo ou só ainda não foi testada; esta função é o que permite
 * a tela de resultado distinguir as duas coisas em vez de tratá-las como a
 * mesma mensagem.
 */
export function competencySkillCounts(
  skillIndex: readonly SkillIndexEntry[],
): Record<Competency, number> {
  const counts = {} as Record<Competency, number>;
  for (const c of COMPETENCIES) counts[c] = 0;
  for (const entry of skillIndex) counts[entry.competency] += 1;
  return counts;
}

function findStrengthAndBottleneck(
  components: Record<Competency, number>,
  coverage: Record<Competency, number>,
  weights: CompetencyWeights,
): { strength: Competency | null; bottleneck: Competency | null } {
  let strength: Competency | null = null;
  let bottleneck: Competency | null = null;
  let best = -1;
  let worstImpact = -1;

  for (const c of COMPETENCIES) {
    if (coverage[c] > 0 && components[c] > best) {
      best = components[c];
      strength = c;
    }
    // Gargalo = onde o ganho ponderado disponível é maior. Uma competência fraca
    // e pesada importa mais que uma competência fraca e leve.
    const impact = (100 - components[c]) * weights[c];
    if (impact > worstImpact) {
      worstImpact = impact;
      bottleneck = c;
    }
  }
  return { strength, bottleneck };
}

function recommendationFor(
  bottleneck: Competency | null,
  coverage: Record<Competency, number>,
): string {
  if (!bottleneck) return "Faça o diagnóstico para receber uma recomendação.";
  const label = COMPETENCY_LABELS[bottleneck];
  if (coverage[bottleneck] === 0) {
    return `${label} ainda não foi avaliada. Faça a primeira lição desta competência.`;
  }
  return `Priorize ${label}: é onde você tem mais pontos disponíveis no Chess Score.`;
}

/**
 * Faixa indicativa. NÃO é rating e não deve ser apresentada como previsão de Elo.
 * O spec é explícito: conclusão de curso não garante rating nem título.
 */
export function scoreBand(total: number): { league: string; range: string } {
  const bands: Array<[number, string, string]> = [
    [0, "Recruta", "0–800"],
    [130, "Estrategista", "800–1200"],
    [280, "Tático", "1200–1400"],
    [420, "Competidor", "1400–1600"],
    [550, "Especialista", "1600–1800"],
    [680, "Elite", "1800–2000"],
    [800, "Mestre", "2000–2200"],
    [900, "Candidato a título", "2200–2300+"],
  ];
  let result = bands[0]!;
  for (const b of bands) if (total >= b[0]) result = b;
  return { league: result[1], range: result[2] };
}

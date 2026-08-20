/**
 * Motor adaptativo: monta a sessão e reage à reincidência.
 *
 * Mistura padrão do spec: 50% gargalo, 20% revisão espaçada, 20% conteúdo novo,
 * 10% desafio prático. Proporções configuráveis.
 *
 * A regra que mais importa não é a mistura — é o INTERRUPTOR: se o usuário
 * reincide, o motor para de avançar. Uma plataforma que continua entregando
 * conteúdo novo para quem está errando o anterior está gerando atividade, não
 * aprendizagem.
 */

import type { ClassifiedError, ErrorCause } from "../errors/taxonomy";
import { ERROR_TAXONOMY, recurrenceByCause } from "../errors/taxonomy";
import type { CurriculumIndex } from "../curriculum";
import { nextLesson, skillStatus } from "../curriculum";
import type { ReviewCard } from "../srs";
import { dueQueue } from "../srs";
import type { SkillMastery } from "../types";
import { effectiveMastery } from "../mastery";
import { type FocusState, shouldPauseNewContent } from "../gamification";

export interface SessionMix {
  bottleneck: number;
  spacedReview: number;
  newContent: number;
  practicalChallenge: number;
}

export const DEFAULT_MIX: SessionMix = {
  bottleneck: 0.5,
  spacedReview: 0.2,
  newContent: 0.2,
  practicalChallenge: 0.1,
};

export interface AdaptiveConfig {
  mix: SessionMix;
  /** Itens por sessão. */
  sessionSize: number;
  /** A partir de quantas ocorrências da mesma causa o avanço é interrompido. */
  recurrenceThreshold: number;
  recurrenceWindowDays: number;
}

/**
 * Mistura enquanto não existem partidas.
 *
 * A fatia de desafio prático é minipartida contra bot, que é outro bloco. Deixar
 * os 10% reservados produziria sessão com buraco; substituir por um exercício
 * qualquer fingindo que é aplicação em partida seria pior — a transferência para
 * partida é justamente o que o produto promete medir e não pode ser simulada.
 *
 * Então a fatia vai para o gargalo, e a tela diz que a aplicação em partida
 * ainda não existe. Volta a `DEFAULT_MIX` quando os bots entrarem.
 */
export const MIX_SEM_PARTIDAS: SessionMix = {
  bottleneck: 0.6,
  spacedReview: 0.2,
  newContent: 0.2,
  practicalChallenge: 0,
};

export const DEFAULT_ADAPTIVE: AdaptiveConfig = {
  mix: MIX_SEM_PARTIDAS,
  sessionSize: 10,
  recurrenceThreshold: 3,
  recurrenceWindowDays: 14,
};

export type SessionSlotKind = "BOTTLENECK" | "REVIEW" | "NEW" | "PRACTICAL";

export interface SessionSlot {
  kind: SessionSlotKind;
  /** Preenchido para REVIEW. */
  reviewCardId?: string;
  /** Preenchido para BOTTLENECK e NEW. */
  skillId?: string;
  lessonId?: string;
  /** Por que este item entrou na sessão — exibido ao usuário. */
  rationale: string;
}

export interface SessionPlan {
  slots: SessionSlot[];
  /** Quando true, nenhum conteúdo novo entrou: o motor interrompeu o avanço. */
  advancementBlocked: boolean;
  blockReason: string | null;
  bottleneckCause: ErrorCause | null;
}

export interface PlanInput {
  index: CurriculumIndex;
  masteries: ReadonlyMap<string, SkillMastery>;
  reviewCards: readonly ReviewCard[];
  errors: readonly ClassifiedError[];
  focus: FocusState;
  nowIso: string;
  config?: AdaptiveConfig;
}

/**
 * Detecta o gargalo: a causa de erro mais reincidente acima do limiar de confiança.
 * Classificações de baixa confiança são ignoradas de propósito — um diagnóstico
 * ruim que sequestra a trilha é pior que nenhum diagnóstico.
 */
export function detectBottleneck(
  errors: readonly ClassifiedError[],
  nowIso: string,
  config: AdaptiveConfig = DEFAULT_ADAPTIVE,
): { cause: ErrorCause; count: number } | null {
  const counts = recurrenceByCause(errors, nowIso, config.recurrenceWindowDays);
  let best: { cause: ErrorCause; count: number } | null = null;
  for (const [cause, count] of counts) {
    if (!best || count > best.count) best = { cause, count };
  }
  return best;
}

/** Habilidades mais fracas ligadas à competência do gargalo. */
function weakSkillsFor(
  input: PlanInput,
  cause: ErrorCause | null,
): Array<{ skillId: string; mastery: number }> {
  const competency = cause ? ERROR_TAXONOMY[cause].competency : null;
  const statuses = skillStatus(input.index, input.masteries, input.nowIso);

  const disponiveis = [...input.index.skills.values()]
    .filter((s) => statuses.get(s.id)?.availability !== "LOCKED")
    .map((s) => {
      const m = input.masteries.get(s.id);
      return {
        skillId: s.id,
        competency: s.competency,
        mastery: m ? effectiveMastery(m, input.nowIso) : 0,
      };
    })
    .filter((s) => s.mastery < 80)
    .sort((a, b) => a.mastery - b.mastery);

  if (!competency) return disponiveis;

  // A competência do gargalo é PRIORIDADE, não filtro rígido.
  //
  // Filtrar duro deixava a sessão curta quando aquela competência tinha poucas
  // habilidades fracas disponíveis: o aluno pedia dez itens e recebia cinco.
  // O gargalo vem primeiro e o resto completa, para a sessão ter o tamanho que
  // prometeu.
  const doGargalo = disponiveis.filter((s) => s.competency === competency);
  const restante = disponiveis.filter((s) => s.competency !== competency);
  return [...doGargalo, ...restante];
}

export function planSession(input: PlanInput): SessionPlan {
  const config = input.config ?? DEFAULT_ADAPTIVE;
  const { mix, sessionSize } = config;

  const bottleneck = detectBottleneck(input.errors, input.nowIso, config);
  const due = dueQueue(input.reviewCards, input.nowIso);

  // ── O interruptor. Duas razões independentes para não introduzir nada novo.
  const recurrenceBlock =
    bottleneck !== null && bottleneck.count >= config.recurrenceThreshold;
  const focusBlock = shouldPauseNewContent(input.focus);
  const advancementBlocked = recurrenceBlock || focusBlock;

  let blockReason: string | null = null;
  if (recurrenceBlock && bottleneck) {
    blockReason = `Você repetiu ${bottleneck.count} vezes o mesmo tipo de erro (${ERROR_TAXONOMY[bottleneck.cause].label}). Antes de avançar, vamos corrigir isso: ${ERROR_TAXONOMY[bottleneck.cause].intervention}`;
  } else if (focusBlock) {
    blockReason =
      "Seu Foco está baixo. Esta sessão é de consolidação — sem conteúdo novo até você recuperar.";
  }

  const counts = {
    BOTTLENECK: Math.round(sessionSize * mix.bottleneck),
    REVIEW: Math.round(sessionSize * mix.spacedReview),
    NEW: advancementBlocked ? 0 : Math.round(sessionSize * mix.newContent),
    PRACTICAL: Math.round(sessionSize * mix.practicalChallenge),
  };

  // O espaço liberado pelo conteúdo novo vai para o gargalo, não some.
  if (advancementBlocked) counts.BOTTLENECK += Math.round(sessionSize * mix.newContent);

  const slots: SessionSlot[] = [];
  const weak = weakSkillsFor(input, bottleneck?.cause ?? null);

  // Percorre as habilidades fracas em ciclo quando há mais espaços do que
  // habilidades. Parar na última deixava a sessão curta sem motivo: cada
  // habilidade tem itens de sobra, e servir dois da mesma é melhor que entregar
  // sete itens quando dez foram prometidos.
  for (let i = 0; i < counts.BOTTLENECK && weak.length > 0; i++) {
    const skill = weak[i % weak.length]!;
    slots.push({
      kind: "BOTTLENECK",
      skillId: skill.skillId,
      lessonId: input.index.lessonsBySkill.get(skill.skillId)?.[0],
      rationale: bottleneck
        ? `Gargalo: ${ERROR_TAXONOMY[bottleneck.cause].label} (domínio ${skill.mastery}/100)`
        : `Habilidade mais fraca disponível (domínio ${skill.mastery}/100)`,
    });
  }

  for (let i = 0; i < counts.REVIEW && i < due.length; i++) {
    const card = due[i]!;
    slots.push({
      kind: "REVIEW",
      reviewCardId: card.id,
      skillId: card.skillId ?? undefined,
      rationale: "Revisão agendada — chegou a hora de reencontrar este item.",
    });
  }

  if (counts.NEW > 0) {
    const lessonId = nextLesson(input.index, input.masteries, input.nowIso);
    if (lessonId) {
      for (let i = 0; i < counts.NEW; i++) {
        slots.push({
          kind: "NEW",
          lessonId,
          rationale: "Próximo passo do seu caminho.",
        });
      }
    }
  }

  for (let i = 0; i < counts.PRACTICAL; i++) {
    slots.push({
      kind: "PRACTICAL",
      rationale: "Aplicação em partida — é onde o conceito vira decisão.",
    });
  }

  // Completa o que sobrou com trabalho de gargalo.
  //
  // As fatias são proporções desejadas, não cotas rígidas: quando nada venceu na
  // revisão, ou quando o avanço está bloqueado, os espaços daquelas fatias
  // ficariam vazios e o aluno receberia menos do que pediu. "Não há revisão
  // vencida" não é motivo para entregar meia sessão.
  for (let i = 0; slots.length < sessionSize && weak.length > 0; i++) {
    const skill = weak[i % weak.length]!;
    slots.push({
      kind: "BOTTLENECK",
      skillId: skill.skillId,
      lessonId: input.index.lessonsBySkill.get(skill.skillId)?.[0],
      rationale: `Reforço da habilidade mais fraca disponível (domínio ${skill.mastery}/100)`,
    });
  }

  return {
    slots: slots.slice(0, sessionSize),
    advancementBlocked,
    blockReason,
    bottleneckCause: bottleneck?.cause ?? null,
  };
}

/**
 * Resolvedor de sessão: slots viram exercícios concretos.
 *
 * O mixer decide a COMPOSIÇÃO da sessão — quanto de gargalo, quanto de revisão,
 * quanto de conteúdo novo — mas devolve slots que apontam para habilidade, lição
 * ou cartão de revisão, nunca para um item. Escolher qual item servir é decisão
 * pedagógica, não detalhe de tela: mora aqui, é puro e tem teste próprio.
 *
 * Sessão com slot que não resolve é sessão quebrada. Este módulo nunca devolve
 * buraco: ou entrega um exercício, ou informa por que aquele slot ficou de fora.
 */

import type { ExerciseDef } from "@/content/schema";
import type { SessionSlot, SessionSlotKind } from ".";
import type { CurriculumIndex } from "../curriculum";
import { skillStatus } from "../curriculum";
import { effectiveMastery } from "../mastery";
import type { AttemptLog } from "../session";
import type { SkillMastery } from "../types";

export interface ExercicioDaSessao {
  tipo: "exercicio";
  exercise: ExerciseDef;
  kind: SessionSlotKind;
  /** Por que este item está na sessão — vem do mixer e é exibido ao aluno. */
  rationale: string;
  /** Habilidade que o item treina, quando o slot a nomeia. */
  skillId?: string;
}

/**
 * Convite à minipartida — o slot PRACTICAL, desde que os bots existam (A5).
 *
 * Jogar uma partida não cabe no laço de "responder um item e avançar": não tem
 * resposta única, nem fim previsível em passos. Por isso não é um exercício —
 * é um convite que aparece junto da sessão e leva para `/jogar`, sem bloquear
 * nem contar como tentativa.
 */
export interface MinipartidaDaSessao {
  tipo: "minipartida";
  kind: "PRACTICAL";
  rationale: string;
}

export type ItemDaSessao = ExercicioDaSessao | MinipartidaDaSessao;

export interface SlotNaoResolvido {
  kind: SessionSlotKind;
  motivo: string;
}

export interface SessaoResolvida {
  itens: ItemDaSessao[];
  naoResolvidos: SlotNaoResolvido[];
}

export interface EntradaDoResolvedor {
  index: CurriculumIndex;
  slots: readonly SessionSlot[];
  masteries: ReadonlyMap<string, SkillMastery>;
  attempts: readonly AttemptLog[];
  nowIso: string;
}

/** Quantas vezes cada exercício já foi tentado. */
function contarTentativas(attempts: readonly AttemptLog[]): Map<string, number> {
  const contagem = new Map<string, number>();
  for (const a of attempts) {
    contagem.set(a.exerciseSlug, (contagem.get(a.exerciseSlug) ?? 0) + 1);
  }
  return contagem;
}

/**
 * Ordena candidatos: menos tentados primeiro, e entre empatados o mais fácil.
 *
 * Servir o item mais tentado seria devolver a posição que o aluno já decorou —
 * exatamente o problema que o banco de prática veio resolver.
 */
function ordenarCandidatos(
  itens: readonly ExerciseDef[],
  tentativas: ReadonlyMap<string, number>,
): ExerciseDef[] {
  return [...itens].sort((a, b) => {
    const ta = tentativas.get(a.slug) ?? 0;
    const tb = tentativas.get(b.slug) ?? 0;
    if (ta !== tb) return ta - tb;
    return a.difficulty - b.difficulty;
  });
}

/**
 * Habilidade referida por um cartão de revisão.
 *
 * O id do cartão é `ex:<slug>` ou `sk:<habilidade>`, formato criado em
 * `recordAttempt` quando a tentativa agenda as duas granularidades.
 */
export function alvoDoCartao(
  cardId: string,
): { tipo: "exercicio"; slug: string } | { tipo: "habilidade"; skillId: string } | null {
  if (cardId.startsWith("ex:")) return { tipo: "exercicio", slug: cardId.slice(3) };
  if (cardId.startsWith("sk:")) return { tipo: "habilidade", skillId: cardId.slice(3) };
  return null;
}

/** Índice de exercícios por slug, montado uma vez por resolução. */
function indexarPorSlug(index: CurriculumIndex): Map<string, ExerciseDef> {
  const porSlug = new Map<string, ExerciseDef>();
  for (const itens of index.exercisesBySkill.values()) {
    for (const e of itens) porSlug.set(e.slug, e);
  }
  return porSlug;
}

export function resolverSessao(entrada: EntradaDoResolvedor): SessaoResolvida {
  const { index, slots, masteries, attempts, nowIso } = entrada;

  const tentativas = contarTentativas(attempts);
  const porSlug = indexarPorSlug(index);
  const status = skillStatus(index, masteries, nowIso);

  const itens: ItemDaSessao[] = [];
  const naoResolvidos: SlotNaoResolvido[] = [];
  // Um mesmo exercício não pode aparecer duas vezes na mesma sessão.
  const jaServidos = new Set<string>();

  const servir = (
    candidatos: readonly ExerciseDef[],
    slot: SessionSlot,
    skillId?: string,
  ): boolean => {
    const escolhido = ordenarCandidatos(candidatos, tentativas).find(
      (e) => !jaServidos.has(e.slug),
    );
    if (!escolhido) return false;
    jaServidos.add(escolhido.slug);
    itens.push({ tipo: "exercicio", exercise: escolhido, kind: slot.kind, rationale: slot.rationale, skillId });
    return true;
  };

  for (const slot of slots) {
    switch (slot.kind) {
      case "REVIEW": {
        const alvo = slot.reviewCardId ? alvoDoCartao(slot.reviewCardId) : null;
        if (!alvo) {
          naoResolvidos.push({ kind: slot.kind, motivo: "cartão de revisão sem alvo reconhecível" });
          break;
        }

        if (alvo.tipo === "exercicio") {
          const exercise = porSlug.get(alvo.slug);
          if (exercise && !jaServidos.has(exercise.slug)) {
            jaServidos.add(exercise.slug);
            itens.push({
              tipo: "exercicio",
              exercise,
              kind: slot.kind,
              rationale: slot.rationale,
              skillId: exercise.skillIds[0],
            });
          } else if (!exercise) {
            // Exercício saiu do currículo depois de agendado.
            naoResolvidos.push({ kind: slot.kind, motivo: `exercício ${alvo.slug} não existe mais` });
          }
          break;
        }

        const daHabilidade = index.exercisesBySkill.get(alvo.skillId) ?? [];
        if (!servir(daHabilidade, slot, alvo.skillId)) {
          naoResolvidos.push({
            kind: slot.kind,
            motivo: `sem item disponível para a habilidade ${alvo.skillId}`,
          });
        }
        break;
      }

      case "BOTTLENECK":
      case "NEW": {
        const skillId = slot.skillId ?? habilidadeDaLicao(index, slot.lessonId, status, masteries, nowIso);
        if (!skillId) {
          naoResolvidos.push({ kind: slot.kind, motivo: "slot sem habilidade nem lição" });
          break;
        }
        const candidatos = index.exercisesBySkill.get(skillId) ?? [];
        if (!servir(candidatos, slot, skillId)) {
          naoResolvidos.push({
            kind: slot.kind,
            motivo: `sem item novo para a habilidade ${skillId}`,
          });
        }
        break;
      }

      case "PRACTICAL":
        // Minipartida é convite, não item respondível — ver MinipartidaDaSessao.
        itens.push({ tipo: "minipartida", kind: "PRACTICAL", rationale: slot.rationale });
        break;
    }
  }

  return { itens, naoResolvidos };
}

/** Quando o slot só traz a lição, escolhe a habilidade dela com menor domínio. */
function habilidadeDaLicao(
  index: CurriculumIndex,
  lessonId: string | undefined,
  status: ReturnType<typeof skillStatus>,
  masteries: ReadonlyMap<string, SkillMastery>,
  nowIso: string,
): string | undefined {
  if (!lessonId) return undefined;
  const lesson = index.lessons.get(lessonId);
  if (!lesson) return undefined;

  const habilidades = [...new Set(lesson.exercises.flatMap((e) => e.skillIds))]
    .filter((id) => status.get(id)?.availability !== "LOCKED")
    .sort((a, b) => {
      const ma = masteries.get(a);
      const mb = masteries.get(b);
      return (
        (ma ? effectiveMastery(ma, nowIso) : 0) - (mb ? effectiveMastery(mb, nowIso) : 0)
      );
    });

  return habilidades[0];
}

/**
 * Fila de revisão como exercícios.
 *
 * `dueQueue` já aplica o teto diário e ordena por quem está mais próximo de ser
 * esquecido; aqui só traduzimos cartão em item.
 */
export function resolverRevisao(entrada: {
  index: CurriculumIndex;
  cardIds: readonly string[];
  attempts: readonly AttemptLog[];
}): { itens: ExerciseDef[]; semItem: string[] } {
  const tentativas = contarTentativas(entrada.attempts);
  const porSlug = indexarPorSlug(entrada.index);

  const itens: ExerciseDef[] = [];
  const semItem: string[] = [];
  const jaServidos = new Set<string>();

  for (const cardId of entrada.cardIds) {
    const alvo = alvoDoCartao(cardId);
    if (!alvo) {
      semItem.push(cardId);
      continue;
    }

    if (alvo.tipo === "exercicio") {
      const exercise = porSlug.get(alvo.slug);
      if (!exercise) {
        semItem.push(cardId);
        continue;
      }
      if (jaServidos.has(exercise.slug)) continue;
      jaServidos.add(exercise.slug);
      itens.push(exercise);
      continue;
    }

    // Cartão de conceito: serve o item menos tentado daquela habilidade, para o
    // aluno reencontrar o conceito numa posição que ainda não decorou.
    const candidatos = ordenarCandidatos(
      entrada.index.exercisesBySkill.get(alvo.skillId) ?? [],
      tentativas,
    ).filter((e) => !jaServidos.has(e.slug));

    const escolhido = candidatos[0];
    if (!escolhido) {
      semItem.push(cardId);
      continue;
    }
    jaServidos.add(escolhido.slug);
    itens.push(escolhido);
  }

  return { itens, semItem };
}

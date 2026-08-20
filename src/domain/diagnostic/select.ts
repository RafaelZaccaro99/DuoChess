/**
 * Seleção de itens do diagnóstico.
 *
 * Determinístico de propósito: a mesma bateria sempre, para as mesmas oito
 * (ou dezoito) posições. A diferença de trilha entre duas pessoas vem das
 * RESPOSTAS, não de sorteio — do contrário "duas pessoas com respostas
 * diferentes recebem trilhas diferentes" (critério de aceite do bloco)
 * ficaria contaminado por acaso.
 */

import type { ExerciseDef } from "@/content/schema";
import type { CurriculumIndex, SkillNode } from "../curriculum";
import type { Competency } from "../types";

export interface DiagnosticItem {
  exercise: ExerciseDef;
  /** Habilidade que este item foi escolhido para representar. */
  skillId: string;
  competency: Competency;
}

/** Quantos itens no total no Teste rápido — o mesmo número que o texto do W6 promete. */
export const QUICK_ITEM_COUNT = 8;

/**
 * Pool de uma habilidade, filtrado para o que serve como item de colocação.
 *
 * GUIDED é andaime de primeira exposição — responder errado ali não mede
 * nada. REVIEW pressupõe que a habilidade já foi vista antes, o que não é o
 * caso de quem está sendo diagnosticado.
 */
function poolFor(index: CurriculumIndex, skillId: string): ExerciseDef[] {
  return (index.exercisesBySkill.get(skillId) ?? [])
    .filter((e) => e.phase !== "GUIDED" && e.phase !== "REVIEW")
    .sort((a, b) => a.ratingHint - b.ratingHint);
}

/** O item mais próximo da mediana de `ratingHint` do pool — "típico", nem o mais fácil nem o mais difícil. */
function medianItem(pool: readonly ExerciseDef[]): ExerciseDef {
  return pool[Math.floor((pool.length - 1) / 2)]!;
}

interface CompetencyGroup {
  competency: Competency;
  /** Habilidades com pool não vazio, na ordem em que o currículo as declara. */
  skills: SkillNode[];
}

function groupByCompetency(index: CurriculumIndex): CompetencyGroup[] {
  const groups = new Map<Competency, SkillNode[]>();
  for (const skill of index.skills.values()) {
    if (poolFor(index, skill.id).length === 0) continue;
    const list = groups.get(skill.competency) ?? [];
    list.push(skill);
    groups.set(skill.competency, list);
  }
  return [...groups.entries()].map(([competency, skills]) => ({ competency, skills }));
}

/**
 * Quantas habilidades de cada competência entram no Teste rápido.
 *
 * Proporcional ao número de habilidades da competência, arredondado pelo
 * maior resto, com piso de 1 por competência populada — uma competência
 * minoritária nunca some por arredondamento. Os números saem do conteúdo em
 * tempo real: quando mais competências forem publicadas, a distribuição se
 * reequilibra sozinha, sem precisar editar este arquivo.
 */
function allocateQuickCounts(groups: readonly CompetencyGroup[]): Map<Competency, number> {
  const totalSkills = groups.reduce((sum, g) => sum + g.skills.length, 0);
  const target = Math.min(QUICK_ITEM_COUNT, totalSkills);

  const shares = groups.map((g) => ({
    competency: g.competency,
    exact: totalSkills > 0 ? (g.skills.length / totalSkills) * target : 0,
    cap: g.skills.length,
  }));

  const allocation = new Map<Competency, number>();
  for (const s of shares) {
    allocation.set(s.competency, Math.min(s.cap, Math.max(1, Math.floor(s.exact))));
  }

  let assigned = [...allocation.values()].reduce((a, b) => a + b, 0);

  const porResto = [...shares]
    .map((s) => ({ competency: s.competency, frac: s.exact - Math.floor(s.exact), cap: s.cap }))
    .sort((a, b) => b.frac - a.frac);

  for (const r of porResto) {
    if (assigned >= target) break;
    const atual = allocation.get(r.competency)!;
    if (atual < r.cap) {
      allocation.set(r.competency, atual + 1);
      assigned++;
    }
  }

  return allocation;
}

/** N elementos espaçados ao longo do array, em vez de só os primeiros. */
function pickEvenlySpaced<T>(arr: readonly T[], n: number): T[] {
  if (n >= arr.length) return [...arr];
  if (n <= 0) return [];
  const step = arr.length / n;
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(arr[Math.floor(i * step)]!);
  return out;
}

export function selectDiagnosticItems(
  index: CurriculumIndex,
  mode: "QUICK" | "FULL",
): DiagnosticItem[] {
  const groups = groupByCompetency(index);

  const toItem = (competency: Competency, skill: SkillNode): DiagnosticItem => ({
    exercise: medianItem(poolFor(index, skill.id)),
    skillId: skill.id,
    competency,
  });

  if (mode === "FULL") {
    return groups.flatMap((g) => g.skills.map((skill) => toItem(g.competency, skill)));
  }

  const counts = allocateQuickCounts(groups);
  return groups.flatMap((g) => {
    const n = counts.get(g.competency) ?? 0;
    return pickEvenlySpaced(g.skills, n).map((skill) => toItem(g.competency, skill));
  });
}

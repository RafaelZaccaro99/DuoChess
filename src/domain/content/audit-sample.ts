/**
 * Auditoria por amostragem (A8, docs/09 §0, item 3) — lógica de sorteio
 * compartilhada entre o CLI (`scripts/auditoria-amostragem.ts`) e a
 * ferramenta de rastreamento em `/admin/auditoria`. Puro: sem banco, sem
 * `server-only`, testável isolado.
 */

import type { CourseDef, ExerciseDef } from "@/content/schema";
import type { CurriculumIndex } from "../curriculum";
import { getSource, type Source } from "@/content/bibliografia";

export interface AuditSampleItem {
  where: string;
  slug: string;
  skills: string; // "título [competência], título [competência]"
  type: string;
  difficulty: number;
  ratingHint: number;
  fen: string;
  prompt: string;
  acceptedAnswer: string;
  predictableErrors: { answer: string; cause: string; explanation: string }[];
  explanation: {
    perceived: string;
    threat: string;
    bestDefense: string;
    reason: string;
    pattern: string;
    transferableRule: string;
  };
  sources: string; // "id — Autor, "Título" [faixa]"
}

/** Amostra aleatória simples, sem repetição — Fisher-Yates parcial. */
export function sortear<T>(itens: readonly T[], quantos: number): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j]!, copia[i]!];
  }
  return copia.slice(0, quantos);
}

/** Sorteia ~porcentagem% do acervo publicado e resolve habilidades/fontes pra leitura direta. */
export function amostrarConteudo(
  course: CourseDef,
  index: CurriculumIndex,
  porcentagem: number,
): AuditSampleItem[] {
  const todos: { where: string; exercise: ExerciseDef }[] = [];
  for (const league of course.leagues) {
    for (const unit of league.units) {
      for (const lesson of unit.lessons) {
        for (const exercise of lesson.exercises) {
          todos.push({ where: `${league.id}/${unit.id}/${lesson.id}`, exercise });
        }
      }
      for (const exercise of unit.practice) {
        todos.push({ where: `${league.id}/${unit.id}/prática`, exercise });
      }
    }
  }

  const tamanhoAmostra = Math.max(1, Math.round((todos.length * porcentagem) / 100));
  const sorteados = sortear(todos, tamanhoAmostra);

  return sorteados.map(({ where, exercise }) => {
    const skills = exercise.skillIds.map((id) => index.skills.get(id)).filter((s) => s !== undefined);
    const fontesIds = [...new Set([...exercise.sources, ...skills.flatMap((s) => s.sources)])];
    const fontes = fontesIds.map((id) => getSource(id)).filter((s): s is Source => s !== undefined);

    return {
      where,
      slug: exercise.slug,
      skills: skills.map((s) => `${s.title} [${s.competency}]`).join(", ") || "—",
      type: exercise.type,
      difficulty: exercise.difficulty,
      ratingHint: exercise.ratingHint,
      fen: exercise.fen,
      prompt: exercise.prompt,
      acceptedAnswer: JSON.stringify(exercise.acceptedAnswer),
      predictableErrors: exercise.predictableErrors,
      explanation: exercise.explanation,
      sources:
        fontes.map((f) => `${f.id} — ${f.author}, "${f.title}" [${f.levelMin}-${f.levelMax}]`).join("; ") ||
        "NENHUMA (falha do gate — não deveria acontecer)",
    };
  });
}

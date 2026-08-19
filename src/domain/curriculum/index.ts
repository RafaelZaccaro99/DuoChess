/**
 * Currículo: índice achatado e grafo de dependências.
 *
 * O mapa não é uma trilha linear. Uma habilidade fica disponível quando TODOS os
 * seus pré-requisitos atingem o domínio mínimo — quem já sabe pula, quem não sabe
 * não é empurrado. É a diferença entre um caminho e um corredor.
 */

import type { CourseDef, LeagueDef, SkillDef, UnitDef, LessonDef } from "@/content/schema";
import type { Competency, SkillMastery } from "../types";
import { effectiveMastery } from "../mastery";

export interface SkillNode extends SkillDef {
  unitId: string;
  leagueId: string;
}

export interface CurriculumIndex {
  course: CourseDef;
  leagues: LeagueDef[];
  units: Map<string, UnitDef & { leagueId: string }>;
  skills: Map<string, SkillNode>;
  lessons: Map<string, LessonDef & { unitId: string; leagueId: string }>;
  /** skillId → lessonIds que treinam essa habilidade. */
  lessonsBySkill: Map<string, string[]>;
  /** skillId → skillIds que dependem dela. */
  dependents: Map<string, string[]>;
}

export function buildIndex(course: CourseDef): CurriculumIndex {
  const units = new Map<string, UnitDef & { leagueId: string }>();
  const skills = new Map<string, SkillNode>();
  const lessons = new Map<string, LessonDef & { unitId: string; leagueId: string }>();
  const lessonsBySkill = new Map<string, string[]>();
  const dependents = new Map<string, string[]>();

  for (const league of course.leagues) {
    for (const unit of league.units) {
      units.set(unit.id, { ...unit, leagueId: league.id });

      for (const skill of unit.skills) {
        skills.set(skill.id, { ...skill, unitId: unit.id, leagueId: league.id });
        for (const dep of skill.dependsOn) {
          dependents.set(dep, [...(dependents.get(dep) ?? []), skill.id]);
        }
      }

      for (const lesson of unit.lessons) {
        lessons.set(lesson.id, { ...lesson, unitId: unit.id, leagueId: league.id });
        const skillIds = new Set(lesson.exercises.flatMap((e) => e.skillIds));
        for (const skillId of skillIds) {
          lessonsBySkill.set(skillId, [...(lessonsBySkill.get(skillId) ?? []), lesson.id]);
        }
      }
    }
  }

  return { course, leagues: course.leagues, units, skills, lessons, lessonsBySkill, dependents };
}

export function skillIndexForScore(
  index: CurriculumIndex,
): Array<{ skillId: string; competency: Competency }> {
  return [...index.skills.values()].map((s) => ({ skillId: s.id, competency: s.competency }));
}

export type SkillAvailability = "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "MASTERED";

export interface SkillStatus {
  skillId: string;
  availability: SkillAvailability;
  mastery: number;
  /** Pré-requisitos ainda não satisfeitos — o que a interface mostra em "requer ...". */
  missingPrerequisites: string[];
}

export function skillStatus(
  index: CurriculumIndex,
  masteries: ReadonlyMap<string, SkillMastery>,
  nowIso: string,
): Map<string, SkillStatus> {
  const result = new Map<string, SkillStatus>();

  for (const skill of index.skills.values()) {
    const own = masteries.get(skill.id);
    const mastery = own ? effectiveMastery(own, nowIso) : 0;

    const missing = skill.dependsOn.filter((depId) => {
      const dep = masteries.get(depId);
      const depValue = dep ? effectiveMastery(dep, nowIso) : 0;
      return depValue < skill.minPrerequisiteMastery;
    });

    let availability: SkillAvailability;
    if (missing.length > 0 && mastery === 0) availability = "LOCKED";
    else if (mastery >= 80) availability = "MASTERED";
    else if (mastery > 0) availability = "IN_PROGRESS";
    else availability = "AVAILABLE";

    result.set(skill.id, {
      skillId: skill.id,
      availability,
      mastery,
      missingPrerequisites: missing,
    });
  }

  return result;
}

export interface UnitProgress {
  unitId: string;
  title: string;
  leagueId: string;
  /** Média do domínio das habilidades da unidade. */
  mastery: number;
  availability: SkillAvailability;
  missingPrerequisiteUnits: string[];
  skillCount: number;
  masteredCount: number;
}

export function unitProgress(
  index: CurriculumIndex,
  masteries: ReadonlyMap<string, SkillMastery>,
  nowIso: string,
): UnitProgress[] {
  const statuses = skillStatus(index, masteries, nowIso);

  return [...index.units.values()].map((unit) => {
    const skills = unit.skills;
    const values = skills.map((s) => statuses.get(s.id)?.mastery ?? 0);
    const mastery = values.length
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 0;
    const masteredCount = values.filter((v) => v >= 80).length;

    const missingUnits = new Set<string>();
    for (const s of skills) {
      for (const missingSkillId of statuses.get(s.id)?.missingPrerequisites ?? []) {
        const owner = index.skills.get(missingSkillId)?.unitId;
        if (owner && owner !== unit.id) missingUnits.add(owner);
      }
    }

    // A unidade está disponível se ao menos uma habilidade dela estiver.
    const anyAvailable = skills.some((s) => statuses.get(s.id)?.availability !== "LOCKED");

    let availability: SkillAvailability;
    if (!anyAvailable) availability = "LOCKED";
    else if (masteredCount === skills.length) availability = "MASTERED";
    else if (mastery > 0) availability = "IN_PROGRESS";
    else availability = "AVAILABLE";

    return {
      unitId: unit.id,
      title: unit.title,
      leagueId: unit.leagueId,
      mastery,
      availability,
      missingPrerequisiteUnits: [...missingUnits],
      skillCount: skills.length,
      masteredCount,
    };
  });
}

/** Próxima lição recomendada: a da fronteira com menor domínio. */
export function nextLesson(
  index: CurriculumIndex,
  masteries: ReadonlyMap<string, SkillMastery>,
  nowIso: string,
): string | null {
  const statuses = skillStatus(index, masteries, nowIso);
  const frontier = [...statuses.values()]
    .filter((s) => s.availability === "AVAILABLE" || s.availability === "IN_PROGRESS")
    .sort((a, b) => a.mastery - b.mastery);

  for (const status of frontier) {
    const lessonId = index.lessonsBySkill.get(status.skillId)?.[0];
    if (lessonId) return lessonId;
  }
  return null;
}

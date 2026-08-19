/**
 * Semeia o currículo no banco a partir do conteúdo tipado.
 *
 * O conteúdo continua sendo código versionado (ADR-002); o banco é uma projeção
 * dele. Idempotente: os ids do conteúdo viram os ids do banco, então rodar duas
 * vezes atualiza em vez de duplicar.
 *
 * Isto é o que permite `SkillMastery.skillId` ser chave estrangeira de verdade —
 * sem a semeadura, o progresso apontaria para habilidades inexistentes.
 */

import { PrismaClient } from "@prisma/client";
import { COURSE } from "../src/content";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const course = await prisma.course.upsert({
    where: { slug: COURSE.slug },
    update: { title: COURSE.title, locale: COURSE.locale },
    create: { id: COURSE.slug, slug: COURSE.slug, title: COURSE.title, locale: COURSE.locale },
  });

  let skills = 0;
  let lessons = 0;
  let exercises = 0;

  for (const league of COURSE.leagues) {
    await prisma.world.upsert({
      where: { id: league.id },
      update: {
        title: league.title,
        order: league.order,
        ratingMin: league.ratingMin,
        ratingMax: league.ratingMax,
        focusSummary: league.focus,
      },
      create: {
        id: league.id,
        courseId: course.id,
        slug: league.id,
        title: league.title,
        order: league.order,
        ratingMin: league.ratingMin,
        ratingMax: league.ratingMax,
        focusSummary: league.focus,
      },
    });

    for (const [unitIndex, unit] of league.units.entries()) {
      await prisma.unit.upsert({
        where: { id: unit.id },
        update: { title: unit.title, summary: unit.summary, masteryTest: unit.masteryTest, order: unitIndex },
        create: {
          id: unit.id,
          worldId: league.id,
          slug: unit.id,
          title: unit.title,
          order: unitIndex,
          summary: unit.summary,
          masteryTest: unit.masteryTest,
        },
      });

      for (const [skillIndex, skill] of unit.skills.entries()) {
        await prisma.skill.upsert({
          where: { id: skill.id },
          update: {
            title: skill.title,
            competency: skill.competency,
            description: skill.description,
            order: skillIndex,
          },
          create: {
            id: skill.id,
            unitId: unit.id,
            slug: skill.id,
            title: skill.title,
            competency: skill.competency,
            description: skill.description,
            order: skillIndex,
          },
        });
        skills += 1;
      }

      // Dependências depois das habilidades: a aresta precisa dos dois vértices.
      for (const skill of unit.skills) {
        for (const prerequisiteId of skill.dependsOn ?? []) {
          await prisma.skillDependency.upsert({
            where: { skillId_prerequisiteId: { skillId: skill.id, prerequisiteId } },
            update: { minMastery: skill.minPrerequisiteMastery ?? 60 },
            create: {
              skillId: skill.id,
              prerequisiteId,
              minMastery: skill.minPrerequisiteMastery ?? 60,
            },
          });
        }
      }

      for (const [lessonIndex, lesson] of unit.lessons.entries()) {
        await prisma.lesson.upsert({
          where: { id: lesson.id },
          update: { title: lesson.title, conceptMd: lesson.concept, demoFen: lesson.demo?.fen ?? null },
          create: {
            id: lesson.id,
            unitId: unit.id,
            slug: lesson.id,
            title: lesson.title,
            order: lessonIndex,
            conceptMd: lesson.concept,
            demoFen: lesson.demo?.fen ?? null,
          },
        });
        lessons += 1;

        for (const exercise of lesson.exercises) {
          const data = {
            lessonId: lesson.id,
            phase: exercise.phase,
            type: exercise.type,
            prompt: exercise.prompt,
            fen: exercise.fen,
            pgn: exercise.pgn ?? null,
            sideToMove: exercise.sideToMove,
            difficulty: exercise.difficulty,
            ratingHint: exercise.ratingHint,
            acceptedAnswers: exercise.acceptedAnswer,
            predictableErrors: exercise.predictableErrors,
            explanation: JSON.stringify(exercise.explanation),
            hint1: exercise.hints[0],
            hint2: exercise.hints[1],
            hint3: exercise.hints[2],
            tags: exercise.tags ?? [],
            expectedSeconds: exercise.expectedSeconds,
            points: exercise.points,
            // O conteúdo em git já passou pelos dois gates em CI.
            reviewState: "PUBLISHED",
          };

          await prisma.exercise.upsert({
            where: { id: exercise.slug },
            update: data,
            create: { id: exercise.slug, slug: exercise.slug, ...data },
          });

          for (const skillId of exercise.skillIds) {
            await prisma.exerciseSkill.upsert({
              where: { exerciseId_skillId: { exerciseId: exercise.slug, skillId } },
              update: {},
              create: { exerciseId: exercise.slug, skillId },
            });
          }
          exercises += 1;
        }
      }
    }
  }

  console.log(
    `Currículo semeado: ${COURSE.leagues.length} ligas, ${skills} habilidades, ${lessons} lições, ${exercises} exercícios.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

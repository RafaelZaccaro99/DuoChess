/**
 * Critério de aceite do bloco A1.
 *
 * "O mesmo usuário abre em dois aparelhos e vê o mesmo domínio, e os testes
 * continuam verdes sem tocar em src/domain."
 *
 * Roda contra um Postgres de verdade. Sem DATABASE_URL, o arquivo é pulado em
 * vez de fingir que passou — teste de integração que roda sem banco não é teste
 * de integração.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { COURSE } from "@/content";
import { buildIndex } from "@/domain/curriculum";
import { emptyProgress, recordAttempt, type ProgressState } from "@/domain/session";
import { effectiveMastery } from "@/domain/mastery";
import type { ExerciseDef } from "@/content/schema";

const temBanco = Boolean(process.env.DATABASE_URL);
const suite = temBanco ? describe : describe.skip;

const prisma = new PrismaClient();
const index = buildIndex(COURSE);

function exercicio(slug: string): ExerciseDef {
  for (const l of index.lessons.values()) {
    const e = l.exercises.find((x) => x.slug === slug);
    if (e) return e;
  }
  throw new Error(`exercício não encontrado: ${slug}`);
}

function respostaCerta(e: ExerciseDef) {
  const a = e.acceptedAnswer;
  if ("squares" in a) return { kind: "squares", squares: a.squares } as const;
  if ("moves" in a) return { kind: "move", san: a.moves[0] } as const;
  if ("color" in a) return { kind: "choice", choice: a.color } as const;
  return { kind: "choice", choice: a.choice } as const;
}

suite("persistência no servidor", () => {
  let userId = "";
  const email = `teste-${Date.now()}@exemplo.test`;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: { email, displayName: "Aparelho A", passwordHash: "hash-de-teste" },
    });
    userId = user.id;
  });

  afterAll(async () => {
    if (userId) await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    await prisma.$disconnect();
  });

  it("o currículo foi semeado com chaves estrangeiras reais", async () => {
    const habilidades = await prisma.skill.count();
    const exercicios = await prisma.exercise.count();
    const dependencias = await prisma.skillDependency.count();

    expect(habilidades).toBe(index.skills.size);
    expect(exercicios).toBeGreaterThan(0);
    expect(dependencias).toBeGreaterThan(0);

    // Toda aresta do grafo precisa resolver dos dois lados — é o que permite
    // SkillMastery.skillId ser chave estrangeira de verdade.
    const arestas = await prisma.skillDependency.findMany({
      include: { skill: { select: { id: true } }, prerequisite: { select: { id: true } } },
    });
    for (const aresta of arestas) {
      expect(aresta.skill?.id, `aresta sem habilidade: ${aresta.skillId}`).toBeTruthy();
      expect(aresta.prerequisite?.id, `aresta sem pré-requisito: ${aresta.prerequisiteId}`).toBeTruthy();
    }
  });

  it("o que o aparelho A estudou aparece no aparelho B", async () => {
    const { loadProgress, saveProgress } = await import("@/lib/progress-server");

    // ── Aparelho A: estuda a lição R1 inteira
    let noAparelhoA: ProgressState = emptyProgress(new Date().toISOString());
    const lesson = index.lessons.get("r1.l1")!;
    for (const [i, e] of lesson.exercises.entries()) {
      noAparelhoA = recordAttempt(noAparelhoA, {
        exercise: e,
        answer: respostaCerta(e),
        hintsUsed: 0,
        elapsedMs: e.expectedSeconds * 700,
        at: new Date(Date.UTC(2026, 0, 2, 10, i)).toISOString(),
      }).state;
    }

    await saveProgress(userId, noAparelhoA);

    // ── Aparelho B: só abre e carrega
    const noAparelhoB = await loadProgress(userId);

    const agora = new Date(Date.UTC(2026, 0, 2, 11)).toISOString();
    for (const skillId of Object.keys(noAparelhoA.masteries)) {
      const a = noAparelhoA.masteries[skillId]!;
      const b = noAparelhoB.masteries[skillId];
      expect(b, `habilidade ${skillId} não chegou ao aparelho B`).toBeDefined();
      expect(effectiveMastery(b!, agora)).toBe(effectiveMastery(a, agora));
    }

    expect(noAparelhoB.attempts).toHaveLength(noAparelhoA.attempts.length);
    expect(Object.keys(noAparelhoB.reviewCards).length).toBe(
      Object.keys(noAparelhoA.reviewCards).length,
    );
    expect(noAparelhoB.xpEvents.reduce((s, e) => s + e.amount, 0)).toBe(
      noAparelhoA.xpEvents.reduce((s, e) => s + e.amount, 0),
    );
    expect(noAparelhoB.streak.current).toBe(noAparelhoA.streak.current);
  });

  it("salvar duas vezes não duplica histórico nem infla XP", async () => {
    const { loadProgress, saveProgress } = await import("@/lib/progress-server");

    const antes = await loadProgress(userId);
    await saveProgress(userId, antes);
    const depois = await loadProgress(userId);

    expect(depois.attempts.length).toBe(antes.attempts.length);
    expect(depois.xpEvents.length).toBe(antes.xpEvents.length);
  });

  it("o erro classificado sobrevive à ida e volta, preso à tentativa", async () => {
    const { loadProgress, saveProgress } = await import("@/lib/progress-server");

    const e = exercicio("r4.e3"); // única defesa: Bf8
    const antes = await loadProgress(userId);
    const comErro = recordAttempt(antes, {
      exercise: e,
      answer: { kind: "move", san: "Be7" }, // erro previsível declarado no conteúdo
      hintsUsed: 0,
      elapsedMs: 40_000,
      at: new Date(Date.UTC(2026, 0, 3, 10)).toISOString(),
    }).state;

    await saveProgress(userId, comErro);
    const depois = await loadProgress(userId);

    const erro = depois.errors.find((x) => x.cause === "VISUALIZATION");
    expect(erro, "a classificação de erro não sobreviveu").toBeDefined();
    expect(erro!.confidence).toBeGreaterThan(0.6);
    expect(erro!.skillId).toBeTruthy();

    const naTentativa = await prisma.errorClassification.findFirst({
      where: { attempt: { userId }, cause: "VISUALIZATION" },
    });
    expect(naTentativa?.attemptId, "erro gravado solto, sem tentativa").toBeTruthy();
  });
});

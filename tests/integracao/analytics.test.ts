/**
 * Critério de aceite do bloco A8 (parte de analytics).
 *
 * "North Star calculável a partir de eventos reais" — não a partir de um
 * ProgressState fabricado em teste. Roda contra Postgres de verdade.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";

const temBanco = Boolean(process.env.DATABASE_URL);
const suite = temBanco ? describe : describe.skip;

const prisma = new PrismaClient();

suite("analytics (A8)", () => {
  let userId = "";
  const email = `analytics-teste-${Date.now()}@exemplo.test`;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: { email, displayName: "Aparelho de teste", passwordHash: "hash-de-teste" },
    });
    userId = user.id;
  });

  afterAll(async () => {
    if (userId) {
      await prisma.analyticsEvent.deleteMany({ where: { userId } });
      await prisma.skillMastery.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it("track() grava uma linha real em AnalyticsEvent", async () => {
    const { track } = await import("@/lib/analytics-server");

    await track("exercise_attempted", userId, { exerciseSlug: "r1.teste", correct: true }, "sessao-1");

    const linha = await prisma.analyticsEvent.findFirst({
      where: { userId, name: "exercise_attempted" },
      orderBy: { createdAt: "desc" },
    });
    expect(linha).toBeDefined();
    expect(linha?.sessionId).toBe("sessao-1");
    expect(linha?.props).toMatchObject({ exerciseSlug: "r1.teste", correct: true });
  });

  it("track() nunca lança, mesmo com userId inexistente", async () => {
    const { track } = await import("@/lib/analytics-server");
    await expect(track("hint_used", "usuario-que-nao-existe", {})).resolves.toBeUndefined();
  });

  it("computeNorthStarForWeek lê SkillMastery real, não um ProgressState fabricado", async () => {
    const { computeNorthStarForWeek } = await import("@/lib/analytics-server");

    // Habilidade real da Recruta, semeada — precisa existir para a FK.
    await prisma.skillMastery.create({
      data: {
        userId,
        skillId: "r1.localizar",
        value: 95,
        state: "MASTERED",
        confidence: 1,
        appliedInGame: 1,
      },
    });

    const resultado = await computeNorthStarForWeek(new Date().toISOString());

    expect(resultado.pairs).toEqual(
      expect.arrayContaining([{ userId, skillId: "r1.localizar" }]),
    );
  });
});

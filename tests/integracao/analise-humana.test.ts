/**
 * Critério de aceite do bloco A5 — a metade do ADR-007.
 *
 * "A engine só aparece depois do registro humano, e pular reduz a confiança
 * da classificação." Roda contra um Postgres de verdade: o portão
 * (`revealEngine`) precisa recusar mesmo que alguém pule a tela e chame a
 * ação direto — é isso que só um teste contra o banco real prova.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";

const temBanco = Boolean(process.env.DATABASE_URL);
const suite = temBanco ? describe : describe.skip;

const prisma = new PrismaClient();

suite("etapa humana antes da engine (ADR-007)", () => {
  let userId = "";
  let gameId = "";

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `analise-${Date.now()}@exemplo.test`,
        displayName: "Teste A5",
        passwordHash: "hash-de-teste",
      },
    });
    userId = user.id;

    const game = await prisma.game.create({
      data: {
        userId,
        mode: "BOT",
        userColor: "w",
        opponent: "Bot 800",
        botRating: 800,
        finalFen: "8/8/8/8/8/8/8/8 w - - 0 1",
        finishedAt: new Date(),
        result: "1-0",
      },
    });
    gameId = game.id;
  });

  afterAll(async () => {
    if (userId) await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    await prisma.$disconnect();
  });

  it("revealEngine recusa antes de resposta humana ou pulo — sem vazar dado de engine", async () => {
    const { revealEngine } = await import("@/lib/games-server");

    const analysis = await prisma.gameAnalysis.create({ data: { gameId, engineDepth: 12 } });
    const momento = await prisma.criticalMoment.create({
      data: {
        analysisId: analysis.id,
        ply: 18,
        fen: "8/8/8/8/8/8/8/8 w - - 0 1",
        playedSan: "Nc3",
        bestSan: "Qxh5+",
        cpBefore: 200,
        cpAfter: -100,
      },
    });

    const antes = await revealEngine(userId, analysis.id, momento.id);
    expect(antes.ok).toBe(false);
    expect(antes.bestSan).toBeUndefined();
    expect(antes.cpBefore).toBeUndefined();
    expect(antes.cpAfter).toBeUndefined();

    await prisma.criticalMoment.delete({ where: { id: momento.id } });
    await prisma.gameAnalysis.delete({ where: { id: analysis.id } });
  });

  it("pular libera a revelação — o portão aceita pulo explícito, não só resposta", async () => {
    const { revealEngine, skipHumanAnalysis } = await import("@/lib/games-server");

    const analysis = await prisma.gameAnalysis.create({ data: { gameId, engineDepth: 12 } });
    const momento = await prisma.criticalMoment.create({
      data: {
        analysisId: analysis.id,
        ply: 20,
        fen: "8/8/8/8/8/8/8/8 w - - 0 1",
        playedSan: "Nc3",
        bestSan: "Qxh5+",
        cpBefore: 200,
        cpAfter: -100,
      },
    });

    const pulou = await skipHumanAnalysis(userId, analysis.id, momento.id);
    expect(pulou.ok).toBe(true);

    const depois = await revealEngine(userId, analysis.id, momento.id);
    expect(depois.ok).toBe(true);
    expect(depois.bestSan).toBe("Qxh5+");

    await prisma.criticalMoment.delete({ where: { id: momento.id } });
    await prisma.gameAnalysis.delete({ where: { id: analysis.id } });
  });

  it("finalizeAnalysis recusa enquanto algum momento não tem resposta nem pulo", async () => {
    const { finalizeAnalysis, submitHumanAnalysis } = await import("@/lib/games-server");

    const analysis = await prisma.gameAnalysis.create({ data: { gameId, engineDepth: 12 } });
    const respondido = await prisma.criticalMoment.create({
      data: { analysisId: analysis.id, ply: 10, fen: "x", playedSan: "Bc4", bestSan: "Nf3", cpBefore: 50, cpAfter: -50 },
    });
    const pendente = await prisma.criticalMoment.create({
      data: { analysisId: analysis.id, ply: 22, fen: "x", playedSan: "Nc3", bestSan: "Qxh5+", cpBefore: 200, cpAfter: -100 },
    });

    await submitHumanAnalysis(userId, analysis.id, respondido.id, {
      candidates: "Só pensei em Bc4",
      evalChoice: "IGUAL",
      timeSec: 20,
    });

    const resultado = await finalizeAnalysis(userId, analysis.id, { summary: "teste", learning: "teste" });
    expect(resultado.ok).toBe(false);

    await prisma.criticalMoment.deleteMany({ where: { id: { in: [respondido.id, pendente.id] } } });
    await prisma.gameAnalysis.delete({ where: { id: analysis.id } });
  });

  it("pular reduz a confiança: classificação de momento pulado nunca alimenta o gargalo", async () => {
    const { finalizeAnalysis, skipHumanAnalysis, submitHumanAnalysis } = await import("@/lib/games-server");
    const { MIN_CONFIDENCE_FOR_BOTTLENECK } = await import("@/domain/errors/taxonomy");

    const analysis = await prisma.gameAnalysis.create({ data: { gameId, engineDepth: 12 } });
    const pulado = await prisma.criticalMoment.create({
      data: { analysisId: analysis.id, ply: 14, fen: "x", playedSan: "Nc3", bestSan: "Qxh5+", cpBefore: 200, cpAfter: -100 },
    });
    const respondido = await prisma.criticalMoment.create({
      data: { analysisId: analysis.id, ply: 16, fen: "x", playedSan: "Bc4", bestSan: "Nf3", cpBefore: 50, cpAfter: -50 },
    });

    await skipHumanAnalysis(userId, analysis.id, pulado.id);
    await submitHumanAnalysis(userId, analysis.id, respondido.id, {
      candidates: "Só pensei em Bc4", // não menciona Nf3 nem f3 → CANDIDATE_IGNORED, confiança 0.7
      evalChoice: "IGUAL",
      timeSec: 20,
    });

    const resultado = await finalizeAnalysis(userId, analysis.id, { summary: "teste", learning: "teste" });
    expect(resultado.ok).toBe(true);

    const classificacoes = await prisma.errorClassification.findMany({ where: { analysisId: analysis.id } });
    const daPulada = classificacoes.find((c) => c.ply === 14);
    const daRespondida = classificacoes.find((c) => c.ply === 16);

    expect(daPulada).toBeDefined();
    expect(daPulada!.confidence).toBeLessThan(MIN_CONFIDENCE_FOR_BOTTLENECK);

    expect(daRespondida).toBeDefined();
    expect(daRespondida!.confidence).toBeGreaterThanOrEqual(MIN_CONFIDENCE_FOR_BOTTLENECK);

    // Invariante XOR do schema: toda classificação vinda de partida tem
    // attemptId nulo — o repositório garante o que o schema não consegue expressar.
    for (const c of classificacoes) {
      expect(c.attemptId).toBeNull();
      expect(c.analysisId).toBe(analysis.id);
    }

    await prisma.errorClassification.deleteMany({ where: { analysisId: analysis.id } });
    await prisma.criticalMoment.deleteMany({ where: { id: { in: [pulado.id, respondido.id] } } });
    await prisma.gameAnalysis.delete({ where: { id: analysis.id } });
  });
});

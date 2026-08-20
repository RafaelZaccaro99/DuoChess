/**
 * Critério de aceite do bloco A7.
 *
 * "Um administrador publica um exercício novo sem deploy, e o item reprovado
 * em qualquer dos dois gates não sobe."
 *
 * Roda contra um Postgres de verdade e o Stockfish de verdade — os dois gates
 * inteiros, não só as regras isoladas de content-gates.test.ts.
 */

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { PrismaClient } from "@prisma/client";
import { COURSE } from "@/content";
import { buildIndex } from "@/domain/curriculum";
import { mergeExercises } from "@/domain/curriculum/merge";
import type { ExerciseInput } from "@/content/schema";

const temBanco = Boolean(process.env.DATABASE_URL);
const suite = temBanco ? describe : describe.skip;

// `cookies()` do Next só funciona dentro de um request real. As server actions
// de CMS (src/app/actions.ts) dependem dela via currentAdmin() — sem um jarro
// de cookie simulado, o teste do papel de administrador não chegaria à
// fronteira real, e o gate de segurança viveria só no typecheck.
const cookieJar = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (cookieJar.has(name) ? { value: cookieJar.get(name)! } : undefined),
    set: (name: string, value: string) => {
      cookieJar.set(name, value);
    },
    delete: (name: string) => {
      cookieJar.delete(name);
    },
  }),
}));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

const prisma = new PrismaClient();
const index = buildIndex(COURSE);

// Habilidade real da Recruta, já semeada — o item novo entra nela.
const SKILL_ID = "r1.localizar";

function exercicioValido(over: Partial<ExerciseInput> = {}): ExerciseInput {
  return {
    slug: `cms-teste.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`,
    phase: "INDEPENDENT",
    type: "BEST_MOVE",
    prompt: "Encontre o melhor lance para as brancas.",
    fen: "6k1/5ppp/8/8/8/8/8/R3K2R w KQ - 0 1",
    sideToMove: "w",
    skillIds: [SKILL_ID],
    difficulty: 3,
    ratingHint: 200,
    acceptedAnswer: { moves: ["Ta8#"] },
    predictableErrors: [{ answer: "Re2", cause: "PATTERN", explanation: "Lance de rei que ignora o mate disponível." }],
    explanation: {
      perceived: "Parece um lance de rei qualquer.",
      threat: "Não há ameaça contra as brancas nesta posição.",
      bestDefense: "Não há defesa: é a vez das brancas matarem.",
      reason: "A torre entrega mate na oitava fileira.",
      pattern: "Mate na fileira de fundo.",
      transferableRule: "Rei preso na última fileira sem fuga é mate com torre.",
    },
    hints: ["Pense na oitava fileira.", "Uma peça pesada pode chegar lá.", "A torre da coluna a chega direto."],
    expectedSeconds: 20,
    points: 10,
    verification: "BEST",
    ...over,
  };
}

suite("publicação de CMS (A7)", () => {
  let adminId = "";
  let estudanteId = "";
  const emailAdmin = `admin-teste-${Date.now()}@exemplo.test`;
  const emailEstudante = `estudante-teste-${Date.now()}@exemplo.test`;

  beforeAll(async () => {
    const admin = await prisma.user.create({
      data: { email: emailAdmin, displayName: "Admin de teste", passwordHash: "hash-de-teste", role: "ADMIN" },
    });
    adminId = admin.id;
    const estudante = await prisma.user.create({
      data: { email: emailEstudante, displayName: "Estudante de teste", passwordHash: "hash-de-teste" },
    });
    estudanteId = estudante.id;
  }, 30_000);

  afterAll(async () => {
    await prisma.exercise.deleteMany({ where: { authorId: { in: [adminId, estudanteId] } } });
    if (adminId) await prisma.user.delete({ where: { id: adminId } }).catch(() => {});
    if (estudanteId) await prisma.user.delete({ where: { id: estudanteId } }).catch(() => {});
    await prisma.$disconnect();
  });

  it(
    "caminho feliz: publica sem deploy e o item aparece na mesclagem em tempo de execução",
    async () => {
      const conteudo = await import("@/lib/content-server");

      const rascunho = await conteudo.salvarRascunho(adminId, exercicioValido());
      expect(rascunho.reviewState).toBe("DRAFT");

      const resultado = await conteudo.publicarExercicio(adminId, rascunho.exerciseId);
      expect(resultado.ok, JSON.stringify(resultado.findings)).toBe(true);
      expect(resultado.reviewState).toBe("PUBLISHED");

      const publicados = await conteudo.publishedExercisesForSkill(SKILL_ID);
      expect(publicados.some((e) => e.slug.startsWith("cms-teste."))).toBe(true);

      // A prova de ponta a ponta: o processo de teste nunca tocou src/content — o
      // item só existe porque foi publicado pelo CMS, e ainda assim aparece no
      // índice que /praticar, /sessão e /revisão usam.
      const mesclado = mergeExercises(index, publicados);
      const itensDaHabilidade = mesclado.exercisesBySkill.get(SKILL_ID) ?? [];
      expect(itensDaHabilidade.some((e) => e.slug === rascunho.exerciseId || e.slug.startsWith("cms-teste."))).toBe(
        true,
      );

      const linhaDeAuditoria = await prisma.contentReview.findMany({ where: { exerciseId: rascunho.exerciseId } });
      expect(linhaDeAuditoria.map((r) => r.stage).sort()).toEqual(["ENGINE_REVIEW", "SOURCE_REVIEW"]);
      expect(linhaDeAuditoria.every((r) => r.approved)).toBe(true);
    },
    60_000,
  );

  it(
    "ENGINE_REVIEW bloqueia: gabarito declarado não é a melhor jogada de verdade",
    async () => {
      const conteudo = await import("@/lib/content-server");

      // Mesma posição de mate em 1 do critério de aceite do A2 (tests/integracao/engine.test.ts):
      // Ta8# está disponível; um lance de rei qualquer não é a melhor jogada.
      const rascunho = await conteudo.salvarRascunho(
        adminId,
        exercicioValido({
          acceptedAnswer: { moves: ["Re2"] },
          predictableErrors: [{ answer: "Ta8", cause: "PATTERN", explanation: "Move de torre plausível, mas não é o mate." }],
        }),
      );

      const resultado = await conteudo.publicarExercicio(adminId, rascunho.exerciseId);
      expect(resultado.ok).toBe(false);
      expect(resultado.reviewState).toBe("DRAFT");

      const engineFindings = resultado.findings.filter((f) => f.gate === "ENGINE_REVIEW" && f.severity === "BLOQUEIA");
      expect(engineFindings.length).toBeGreaterThan(0);

      const linhaEngine = await prisma.contentReview.findFirst({
        where: { exerciseId: rascunho.exerciseId, stage: "ENGINE_REVIEW" },
      });
      expect(linhaEngine?.approved).toBe(false);

      const exercicioNoBanco = await prisma.exercise.findUnique({ where: { id: rascunho.exerciseId } });
      expect(exercicioNoBanco?.reviewState).toBe("DRAFT");
    },
    60_000,
  );

  it(
    "SOURCE_REVIEW bloqueia: item cita fonte fora do registro",
    async () => {
      const conteudo = await import("@/lib/content-server");

      const rascunho = await conteudo.salvarRascunho(
        adminId,
        exercicioValido({ sources: ["fonte-que-nao-existe-no-registro"] }),
      );

      const resultado = await conteudo.publicarExercicio(adminId, rascunho.exerciseId);
      expect(resultado.ok).toBe(false);
      expect(resultado.reviewState).toBe("DRAFT");

      const sourceFindings = resultado.findings.filter((f) => f.gate === "SOURCE_REVIEW" && f.severity === "BLOQUEIA");
      expect(sourceFindings.length).toBeGreaterThan(0);
    },
    60_000,
  );

  it("papel: usuário STUDENT é recusado pelas server actions de CMS; ADMIN passa", async () => {
    const auth = await import("@/lib/auth");
    const acoes = await import("@/app/actions");

    await auth.createSession(estudanteId);
    const salvou = await acoes.salvarRascunhoDeExercicio(exercicioValido());
    expect("error" in salvou).toBe(true);

    const publicou = await acoes.publicarExercicioAction("qualquer-id");
    expect("error" in publicou).toBe(true);

    const listou = await acoes.listarExerciciosAutorados();
    expect("error" in listou).toBe(true);

    // reviewState do exercício não muda: nenhuma das chamadas recusadas escreveu no banco.
    const antes = await prisma.exercise.count({ where: { authorId: estudanteId } });
    expect(antes).toBe(0);

    await auth.createSession(adminId);
    const salvouAdmin = await acoes.salvarRascunhoDeExercicio(exercicioValido());
    expect("exerciseId" in salvouAdmin).toBe(true);

    await auth.destroySession();
  });
});

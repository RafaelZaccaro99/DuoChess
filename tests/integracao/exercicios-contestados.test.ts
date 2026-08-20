/**
 * Canal de exercícios contestados (A8, docs/09 §0) — correção empírica pro
 * risco "xadrez certo, pedagogia errada". Roda contra Postgres de verdade:
 * prova que contestar tira o item de rotação SEM DEPLOY, tanto pro conteúdo
 * estático (que só existe no Postgres como espelho de prisma/seed.ts) quanto
 * pro conteúdo de CMS.
 */

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { PrismaClient } from "@prisma/client";
import { COURSE } from "@/content";
import { buildIndex } from "@/domain/curriculum";
import { mergeExercises } from "@/domain/curriculum/merge";
import type { ExerciseInput } from "@/content/schema";

const temBanco = Boolean(process.env.DATABASE_URL);
const suite = temBanco ? describe : describe.skip;

// Mesma técnica de cms-publicacao.test.ts: `cookies()` do Next só funciona
// dentro de um request real, e o teste do papel de administrador precisa
// chegar até `currentAdmin()` de verdade.
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

// Item estático real, semeado por prisma/seed.ts (r1.l1, fase GUIDED).
const SLUG_ESTATICO = "r1.e1";
const SKILL_ESTATICO = "r1.cor-casa";
const SKILL_CMS = "r1.localizar";

function exercicioCmsValido(): ExerciseInput {
  return {
    slug: `contest-cms-${Date.now()}`,
    phase: "INDEPENDENT",
    type: "SQUARE_COLOR",
    prompt: "b4 é clara ou escura?",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    sideToMove: "w",
    skillIds: [SKILL_CMS],
    difficulty: 3,
    ratingHint: 100,
    acceptedAnswer: { color: "dark" },
    predictableErrors: [{ answer: "light", cause: "PATTERN", explanation: "Contou a paridade errada das coordenadas." }],
    explanation: {
      perceived: "Parece precisar contar casa por casa.",
      threat: "Nenhuma — é reconhecimento de padrão, não tática.",
      bestDefense: "Não se aplica a este tipo de item.",
      reason: "b4: b=2, 4 → soma par, então escura (a1 é escura e soma 2).",
      pattern: "Paridade de coordenadas decide a cor.",
      transferableRule: "Soma par de coluna e fileira é sempre casa escura.",
    },
    hints: ["Pense na paridade.", "Some a coluna e a fileira.", "Par é clara, ímpar é escura."],
    tags: ["square:b4"],
    expectedSeconds: 15,
    points: 5,
    verification: "BEST",
  };
}

suite("exercícios contestados (A8)", () => {
  let reporterId = "";
  let adminId = "";
  const reportIds: string[] = [];
  let cmsExerciseId = "";
  let cmsSlug = "";

  beforeAll(async () => {
    const reporter = await prisma.user.create({
      data: { email: `contest-reporter-${Date.now()}@exemplo.test`, displayName: "Denunciante", passwordHash: "x" },
    });
    reporterId = reporter.id;
    const admin = await prisma.user.create({
      data: { email: `contest-admin-${Date.now()}@exemplo.test`, displayName: "Admin", passwordHash: "x", role: "ADMIN" },
    });
    adminId = admin.id;
  }, 30_000);

  afterAll(async () => {
    await prisma.contestedReport.deleteMany({ where: { reporterId } });
    if (cmsExerciseId) await prisma.exercise.delete({ where: { id: cmsExerciseId } }).catch(() => {});
    // Devolve o item estático ao estado normal — outra execução não pode herdar CONTESTED.
    await prisma.exercise.update({ where: { slug: SLUG_ESTATICO }, data: { reviewState: "PUBLISHED" } }).catch(() => {});
    await prisma.user.delete({ where: { id: reporterId } }).catch(() => {});
    await prisma.user.delete({ where: { id: adminId } }).catch(() => {});
    await prisma.$disconnect();
  });

  it("contestar um item ESTÁTICO tira ele de exercisesBySkill sem tocar em src/content", async () => {
    const conteudo = await import("@/lib/content-server");

    const antes = await conteudo.excludedSlugs();
    expect(antes.has(SLUG_ESTATICO)).toBe(false);

    const resultado = await conteudo.contestarExercicio(reporterId, SLUG_ESTATICO, "O gabarito parece contar a casa errada.");
    expect(resultado.ok).toBe(true);

    const excluidos = await conteudo.excludedSlugs();
    expect(excluidos.has(SLUG_ESTATICO)).toBe(true);

    // A prova de ponta a ponta: o merge em tempo de execução — o mesmo que
    // /praticar, /sessão e /revisão usam — some com o item sem qualquer
    // mudança em src/content/recruta.ts.
    const mesclado = mergeExercises(index, [], excluidos);
    const itens = mesclado.exercisesBySkill.get(SKILL_ESTATICO) ?? [];
    expect(itens.some((e) => e.slug === SLUG_ESTATICO)).toBe(false);
    // O acervo original continua intacto — a exclusão é só na visão mesclada.
    expect((index.exercisesBySkill.get(SKILL_ESTATICO) ?? []).some((e) => e.slug === SLUG_ESTATICO)).toBe(true);

    const relatorios = await conteudo.listarContestados();
    const meu = relatorios.find((r) => r.exerciseSlug === SLUG_ESTATICO);
    expect(meu).toBeDefined();
    expect(meu?.authoredByCms).toBe(false);
    if (meu) reportIds.push(meu.id);
  });

  it("reincluir devolve o item estático à rotação", async () => {
    const conteudo = await import("@/lib/content-server");
    const meuReport = reportIds[0]!;

    const resultado = await conteudo.resolverContestacao(adminId, meuReport, "Revisado — gabarito está correto.", true);
    expect(resultado.ok).toBe(true);

    const excluidos = await conteudo.excludedSlugs();
    expect(excluidos.has(SLUG_ESTATICO)).toBe(false);

    const relatorios = await conteudo.listarContestados();
    expect(relatorios.some((r) => r.id === meuReport)).toBe(false);
  });

  it("contestar um item de CMS some de publishedExercisesForSkill e do merge, sem reincluir automático", async () => {
    const conteudo = await import("@/lib/content-server");

    const rascunho = await conteudo.salvarRascunho(adminId, exercicioCmsValido());
    const publicado = await conteudo.publicarExercicio(adminId, rascunho.exerciseId);
    expect(publicado.ok, JSON.stringify(publicado.findings)).toBe(true);
    cmsExerciseId = rascunho.exerciseId;
    cmsSlug = (await conteudo.getAuthoredExercise(cmsExerciseId))!.slug;

    const antesDeContestar = await conteudo.publishedExercisesForSkill(SKILL_CMS);
    expect(antesDeContestar.some((e) => e.slug === cmsSlug)).toBe(true);

    const contestacao = await conteudo.contestarExercicio(reporterId, cmsSlug, "Explicação parece incompleta.");
    expect(contestacao.ok).toBe(true);

    const depoisDeContestar = await conteudo.publishedExercisesForSkill(SKILL_CMS);
    expect(depoisDeContestar.some((e) => e.slug === cmsSlug)).toBe(false);

    const excluidos = await conteudo.excludedSlugs();
    const mesclado = mergeExercises(index, await conteudo.publishedExercisesForSkill(SKILL_CMS), excluidos);
    expect((mesclado.exercisesBySkill.get(SKILL_CMS) ?? []).some((e) => e.slug === cmsSlug)).toBe(false);

    const relatorios = await conteudo.listarContestados();
    const meu = relatorios.find((r) => r.exerciseId === cmsExerciseId);
    expect(meu?.authoredByCms).toBe(true);
    if (meu) reportIds.push(meu.id);
  });

  it("papel: usuário comum não resolve contestação; administrador resolve", async () => {
    const auth = await import("@/lib/auth");
    const acoes = await import("@/app/actions");
    const meuReport = reportIds[1]!;

    await auth.createSession(reporterId);
    const recusado = await acoes.resolverContestacaoAction(meuReport, "tentativa indevida", true);
    expect("error" in recusado).toBe(true);

    await auth.createSession(adminId);
    const aceito = await acoes.resolverContestacaoAction(meuReport, "Revisado.", false);
    expect("error" in aceito).toBe(false);

    await auth.destroySession();
  });
});

"use server";

/**
 * Server actions: a fronteira entre o cliente e o banco.
 *
 * Toda ação confere a sessão do lado do servidor. O cliente nunca manda um
 * `userId` — se mandasse, bastaria trocar o número para ler o progresso alheio.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  createSession,
  currentAdmin,
  currentUser,
  destroySession,
  hashPassword,
  normalizeEmail,
  validateCredentials,
  verifyPassword,
  type SessionUser,
} from "@/lib/auth";
import { loadProgress, saveDiagnostic, saveProgress, type DiagnosticResultPayload } from "@/lib/progress-server";
import type { EntryPoint, OnboardingAnswers, ProgressState } from "@/domain/session";
import * as jogos from "@/lib/games-server";
import type { BotRating } from "@/domain/game/bot";
import * as conteudo from "@/lib/content-server";
import type { ExerciseDef, ExerciseInput } from "@/content/schema";
import {
  computeNorthStarForWeek,
  eventCountsLast24h,
  track,
  type AnalyticsEventName,
  type EventCount,
  type NorthStarResult,
} from "@/lib/analytics-server";

export interface ActionResult {
  ok: boolean;
  /** Mensagem pronta para exibir: diz o que houve e como resolver. */
  error?: string;
  field?: "email" | "password" | "displayName";
}

export async function registrar(formData: FormData): Promise<ActionResult> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();

  const problemas = validateCredentials({ email, password, displayName });
  if (problemas[0]) return { ok: false, error: problemas[0].message, field: problemas[0].field };

  const existente = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existente) {
    return {
      ok: false,
      field: "email",
      error: "Já existe uma conta com este e-mail. Entre em vez de criar outra.",
    };
  }

  const user = await prisma.user.create({
    data: { email, displayName, passwordHash: await hashPassword(password) },
  });

  await createSession(user.id);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function entrar(formData: FormData): Promise<ActionResult> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });

  // Mesma mensagem para e-mail inexistente e senha errada: dizer qual dos dois
  // falhou entrega ao atacante quais e-mails estão cadastrados.
  const generico = { ok: false as const, error: "E-mail ou senha incorretos.", field: "password" as const };

  if (!user?.passwordHash) return generico;
  if (!(await verifyPassword(password, user.passwordHash))) return generico;

  await createSession(user.id);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function sair(): Promise<void> {
  await destroySession();
  revalidatePath("/", "layout");
}

export async function usuarioAtual(): Promise<SessionUser | null> {
  return currentUser();
}

export async function carregarProgresso(): Promise<ProgressState | null> {
  const user = await currentUser();
  if (!user) return null;
  return loadProgress(user.id);
}

export async function salvarProgresso(state: ProgressState): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return { ok: false, error: "Sua sessão expirou. Entre novamente para sincronizar." };

  await saveProgress(user.id, state);
  return { ok: true };
}

/**
 * Registra o resultado do diagnóstico como um ponto no tempo (auditoria).
 *
 * Anônimo é no-op de propósito: `ProgressState.onboarding`/`.entryPoint` já
 * viajam pelo repositório local como o resto do progresso — só falta o
 * registro de auditoria no banco, que exige conta.
 */
export async function registrarDiagnostico(
  entryPoint: EntryPoint,
  answers: OnboardingAnswers,
  result: DiagnosticResultPayload,
): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return { ok: true };
  await saveDiagnostic(user.id, entryPoint, answers, result);
  await track("diagnostic_completed", user.id, { entryPoint, reliable: result.reliable });
  return { ok: true };
}

// ────────────────────────────────────────────────── partidas, PGN, análise (A5)

const SEM_SESSAO = { ok: false as const, error: "Sua sessão expirou. Entre novamente." };

export async function listarPartidas(): Promise<jogos.GameSummary[]> {
  const user = await currentUser();
  if (!user) return [];
  return jogos.listGames(user.id);
}

export async function dnaDoJogador(): Promise<jogos.PlayerDNA | null> {
  const user = await currentUser();
  if (!user) return null;
  return jogos.playerDNA(user.id, new Date().toISOString());
}

export async function iniciarPartidaContraBot(
  botRating: BotRating,
  userColor: "w" | "b",
): Promise<{ gameId: string; fen: string } | ActionResult> {
  const user = await currentUser();
  if (!user) return SEM_SESSAO;
  return jogos.startBotGame(user.id, { botRating, userColor });
}

export async function carregarPartida(gameId: string): Promise<jogos.LoadGameResult> {
  const user = await currentUser();
  if (!user) return SEM_SESSAO;
  return jogos.loadGame(user.id, gameId);
}

export async function jogarLance(
  gameId: string,
  move: { from: string; to: string; promotion?: string },
): Promise<jogos.PlayUserMoveResult> {
  const user = await currentUser();
  if (!user) return SEM_SESSAO;
  return jogos.playUserMove(user.id, gameId, move);
}

export async function encerrarPartida(gameId: string, result: string): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return SEM_SESSAO;
  return jogos.finishGame(user.id, gameId, result);
}

export async function importarPgn(
  rawPgn: string,
  userColor: "w" | "b",
): Promise<jogos.ImportPgnResult> {
  const user = await currentUser();
  if (!user) return SEM_SESSAO;
  return jogos.importPgn(user.id, rawPgn, userColor);
}

export async function iniciarAnalise(gameId: string): Promise<jogos.StartAnalysisResult> {
  const user = await currentUser();
  if (!user) return SEM_SESSAO;
  return jogos.startAnalysis(user.id, gameId);
}

export async function registrarAnaliseHumana(
  analysisId: string,
  momentId: string,
  data: jogos.SubmitHumanAnalysisInput,
): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return SEM_SESSAO;
  return jogos.submitHumanAnalysis(user.id, analysisId, momentId, data);
}

export async function pularAnaliseHumana(analysisId: string, momentId: string): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return SEM_SESSAO;
  return jogos.skipHumanAnalysis(user.id, analysisId, momentId);
}

export async function revelarEngine(
  analysisId: string,
  momentId: string,
): Promise<jogos.RevealEngineResult> {
  const user = await currentUser();
  if (!user) return SEM_SESSAO;
  return jogos.revealEngine(user.id, analysisId, momentId);
}

export async function finalizarAnalise(
  analysisId: string,
  extra: jogos.FinalizeAnalysisInput,
): Promise<jogos.FinalizeAnalysisResult> {
  const user = await currentUser();
  if (!user) return SEM_SESSAO;
  return jogos.finalizeAnalysis(user.id, analysisId, extra);
}

// ────────────────────────────────────────────────── CMS (A7)

const NAO_ADMIN = { ok: false as const, error: "Esta ação exige conta de administrador." };

export async function salvarRascunhoDeExercicio(
  input: ExerciseInput,
  exerciseId?: string,
): Promise<{ exerciseId: string; reviewState: "DRAFT" } | ActionResult> {
  const admin = await currentAdmin();
  if (!admin) return NAO_ADMIN;
  return conteudo.salvarRascunho(admin.id, input, exerciseId);
}

export async function verificarRascunhoDeExercicio(
  input: ExerciseInput,
): Promise<conteudo.PublishFinding[] | ActionResult> {
  const admin = await currentAdmin();
  if (!admin) return NAO_ADMIN;
  return conteudo.verificarRascunho(input);
}

export async function publicarExercicioAction(exerciseId: string): Promise<conteudo.PublishResult | ActionResult> {
  const admin = await currentAdmin();
  if (!admin) return NAO_ADMIN;
  return conteudo.publicarExercicio(admin.id, exerciseId);
}

export async function listarExerciciosAutorados(): Promise<conteudo.AuthoredExerciseSummary[] | ActionResult> {
  const admin = await currentAdmin();
  if (!admin) return NAO_ADMIN;
  return conteudo.listAuthoredExercises();
}

export async function exercicioAutoradoPorId(exerciseId: string): Promise<ExerciseDef | null | ActionResult> {
  const admin = await currentAdmin();
  if (!admin) return NAO_ADMIN;
  return conteudo.getAuthoredExercise(exerciseId);
}

/** Leitura pública, sem checagem de admin — é o que /praticar consome. */
export async function exerciciosPublicadosPara(skillId: string): Promise<ExerciseDef[]> {
  return conteudo.publishedExercisesForSkill(skillId);
}

/** Leitura pública, sem checagem de admin — /sessão e /revisão sacam de várias habilidades de uma vez. */
export async function exerciciosPublicadosTodos(): Promise<ExerciseDef[]> {
  return conteudo.publishedExercises();
}

// ────────────────────────────────────────────────── analytics (A8)

/**
 * Porta fina para os eventos que só existem do lado do cliente (docs/08).
 * Anônimo grava com userId nulo — o contrato de eventos não exige conta.
 */
export async function registrarEvento(
  name: AnalyticsEventName,
  props: Record<string, unknown> = {},
  sessionId?: string,
): Promise<void> {
  const user = await currentUser();
  await track(name, user?.id ?? null, props, sessionId);
}

export async function painelDeAnalytics(): Promise<
  { northStar: NorthStarResult; eventos: EventCount[] } | ActionResult
> {
  const admin = await currentAdmin();
  if (!admin) return NAO_ADMIN;
  const [northStar, eventos] = await Promise.all([
    computeNorthStarForWeek(new Date().toISOString()),
    eventCountsLast24h(),
  ]);
  return { northStar, eventos };
}

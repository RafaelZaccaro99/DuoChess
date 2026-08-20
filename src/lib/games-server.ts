/**
 * Adaptador de servidor para partidas contra bot, import de PGN e análise
 * (A5). Paralelo a `progress-server.ts`: traduz entre o domínio puro e as
 * tabelas do Prisma; nada aqui é importado por `src/domain`.
 *
 * `revealEngine` é O portão do ADR-007: lê o `CriticalMoment` fresco do
 * banco e só devolve dado de engine depois que o usuário registrou a leitura
 * humana ou pulou explicitamente — nunca confia num "já respondi" vindo do
 * cliente.
 */

import "server-only";
import { Chess } from "chess.js";
import { prisma } from "./db";
import { startEngine } from "./engine/uci";
import { START_FEN } from "@/domain/chess/board";
import type { EngineLine } from "@/domain/chess/verification";
import { scoreOf } from "@/domain/chess/verification";
import {
  BOT_RATING_PRESETS,
  chooseBotMove,
  ratingToProfile,
  type BotRating,
} from "@/domain/game/bot";
import { parsePgn, countGamesInPgn } from "@/domain/game/pgn";
import { detectCriticalMoments, type MoveWithEval } from "@/domain/game/criticalMoments";
import { classifyGameError, type HumanMomentReport } from "@/domain/game/classify";
import { detectTransfers, type TransferMoment } from "@/domain/game/transfer";
import { masteredSkillIn, weakestAvailableSkillIn } from "@/domain/game/skillAssignment";
import { computePlayerDNA, type PlayerDNA } from "@/domain/game/dna";
import { competencyFor } from "@/domain/errors/taxonomy";
import type { ErrorCause, ErrorSeverity } from "@/domain/errors/taxonomy";
import { registerGameApplication } from "@/domain/mastery";
import { buildIndex } from "@/domain/curriculum";
import { COURSE } from "@/content";
import { rowToMastery } from "./progress-server";

const INDEX = buildIndex(COURSE);

export interface GameResult {
  ok: boolean;
  error?: string;
}

// ────────────────────────────────────────────────────────── utilidades

function uciToMove(uci: string): { from: string; to: string; promotion?: string } {
  return {
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.length > 4 ? uci.slice(4, 5) : undefined,
  };
}

/** UCI do lance que, jogado na posição dada, produz o SAN informado. */
function sanToUci(fen: string, san: string): string | null {
  const chess = new Chess(fen);
  try {
    const move = chess.move(san);
    return move.from + move.to + (move.promotion ?? "");
  } catch {
    return null;
  }
}

type GameStatus = "ONGOING" | "CHECKMATE" | "STALEMATE" | "DRAW";

function statusFromChess(chess: Chess): GameStatus {
  if (chess.isCheckmate()) return "CHECKMATE";
  if (chess.isStalemate()) return "STALEMATE";
  if (chess.isDraw()) return "DRAW";
  return "ONGOING";
}

function resultFromStatus(chess: Chess, status: GameStatus): string | null {
  if (status === "CHECKMATE") return chess.turn() === "w" ? "0-1" : "1-0";
  if (status === "STALEMATE" || status === "DRAW") return "1/2-1/2";
  return null;
}

async function ownsGame(userId: string, gameId: string): Promise<boolean> {
  const game = await prisma.game.findUnique({ where: { id: gameId }, select: { userId: true } });
  return game?.userId === userId;
}

async function ownsAnalysis(userId: string, analysisId: string): Promise<boolean> {
  const analysis = await prisma.gameAnalysis.findUnique({
    where: { id: analysisId },
    select: { game: { select: { userId: true } } },
  });
  return analysis?.game.userId === userId;
}

// ────────────────────────────────────────────────────────── bot: iniciar/jogar

export interface StartBotGameInput {
  botRating: BotRating;
  userColor: "w" | "b";
}

export async function startBotGame(
  userId: string,
  input: StartBotGameInput,
): Promise<{ gameId: string; fen: string }> {
  const game = await prisma.game.create({
    data: {
      userId,
      mode: "BOT",
      userColor: input.userColor,
      opponent: `Bot ${input.botRating}`,
      botRating: input.botRating,
      finalFen: START_FEN,
    },
  });

  let fen = START_FEN;

  // Bot joga de brancas quando o usuário escolheu as pretas — precisa abrir.
  if (input.userColor === "b") {
    const engine = await startEngine();
    try {
      const lines = await engine.analyse(fen, { depth: 12, multiPv: 6 });
      const choice = chooseBotMove(lines, ratingToProfile(input.botRating));
      const chess = new Chess(fen);
      const played = chess.move(uciToMove(choice.moveUci));
      await prisma.gameMove.create({
        data: { gameId: game.id, ply: 1, san: played.san, fenAfter: chess.fen() },
      });
      fen = chess.fen();
      await prisma.game.update({ where: { id: game.id }, data: { finalFen: fen } });
    } finally {
      await engine.quit();
    }
  }

  return { gameId: game.id, fen };
}

export interface PlayUserMoveInput {
  from: string;
  to: string;
  promotion?: string;
}

export interface PlayUserMoveResult extends GameResult {
  fen?: string;
  status?: GameStatus;
  botMove?: { san: string; cpLoss: number };
}

export async function playUserMove(
  userId: string,
  gameId: string,
  move: PlayUserMoveInput,
): Promise<PlayUserMoveResult> {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { moves: { orderBy: { ply: "asc" } } },
  });
  if (!game || game.userId !== userId) return { ok: false, error: "Partida não encontrada." };
  if (game.finishedAt) return { ok: false, error: "Esta partida já terminou." };

  const fenAtual = game.finalFen ?? START_FEN;
  const chess = new Chess(fenAtual);

  let jogado;
  try {
    jogado = chess.move(move);
  } catch {
    return { ok: false, error: "Esse lance não é legal nesta posição." };
  }

  const proximoPly = (game.moves.at(-1)?.ply ?? 0) + 1;
  await prisma.gameMove.create({
    data: { gameId, ply: proximoPly, san: jogado.san, fenAfter: chess.fen() },
  });

  let fen = chess.fen();
  let status = statusFromChess(chess);
  let botMove: { san: string; cpLoss: number } | undefined;

  if (status === "ONGOING") {
    const engine = await startEngine();
    try {
      const lines = await engine.analyse(fen, { depth: 12, multiPv: 6 });
      const rating = game.botRating ?? 800;
      const choice = chooseBotMove(lines, ratingToProfile(rating));
      const chessBot = new Chess(fen);
      const botPlayed = chessBot.move(uciToMove(choice.moveUci));
      const botPly = proximoPly + 1;
      await prisma.gameMove.create({
        data: { gameId, ply: botPly, san: botPlayed.san, fenAfter: chessBot.fen() },
      });
      fen = chessBot.fen();
      status = statusFromChess(chessBot);
      botMove = { san: botPlayed.san, cpLoss: choice.cpLoss };
    } finally {
      await engine.quit();
    }
  }

  const acabou = status !== "ONGOING";
  await prisma.game.update({
    where: { id: gameId },
    data: {
      finalFen: fen,
      ...(acabou
        ? { finishedAt: new Date(), result: resultFromStatus(new Chess(fen), status) }
        : {}),
    },
  });

  return { ok: true, fen, status, botMove };
}

export interface GameStateView {
  fen: string;
  userColor: "w" | "b";
  botRating: number | null;
  status: GameStatus;
  moves: Array<{ ply: number; san: string }>;
  finishedAt: string | null;
  result: string | null;
}

export type LoadGameResult = ({ ok: true } & GameStateView) | { ok: false; error: string };

/** Estado atual da partida — permite retomar por navegação direta ou recarregar a página. */
export async function loadGame(userId: string, gameId: string): Promise<LoadGameResult> {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { moves: { orderBy: { ply: "asc" } } },
  });
  if (!game || game.userId !== userId) return { ok: false, error: "Partida não encontrada." };

  const fen = game.finalFen ?? START_FEN;
  return {
    ok: true,
    fen,
    userColor: game.userColor as "w" | "b",
    botRating: game.botRating,
    status: statusFromChess(new Chess(fen)),
    moves: game.moves.map((m) => ({ ply: m.ply, san: m.san })),
    finishedAt: game.finishedAt?.toISOString() ?? null,
    result: game.result,
  };
}

export async function finishGame(userId: string, gameId: string, result: string): Promise<GameResult> {
  if (!(await ownsGame(userId, gameId))) return { ok: false, error: "Partida não encontrada." };
  await prisma.game.update({ where: { id: gameId }, data: { result, finishedAt: new Date() } });
  return { ok: true };
}

// ────────────────────────────────────────────────────────── import de PGN

export interface ImportPgnResult extends GameResult {
  gameId?: string;
  movesImported?: number;
  gamesFoundInPaste?: number;
}

export async function importPgn(
  userId: string,
  rawPgn: string,
  userColor: "w" | "b",
): Promise<ImportPgnResult> {
  const parsed = parsePgn(rawPgn);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const gamesFoundInPaste = countGamesInPgn(rawPgn);

  const game = await prisma.game.create({
    data: {
      userId,
      mode: "IMPORTED",
      userColor,
      opponent: "Importado de PGN",
      pgn: rawPgn,
      finalFen: parsed.game.finalFen,
      result: parsed.game.result,
      finishedAt: new Date(),
    },
  });

  await prisma.gameMove.createMany({
    data: parsed.game.moves.map((m) => ({
      gameId: game.id,
      ply: m.ply,
      san: m.san,
      fenAfter: m.fenAfter,
    })),
  });

  await prisma.importedPGN.create({ data: { userId, rawPgn, gamesFound: gamesFoundInPaste } });

  return { ok: true, gameId: game.id, movesImported: parsed.game.moves.length, gamesFoundInPaste };
}

// ────────────────────────────────────────────────────────── análise

export interface CriticalMomentSummary {
  id: string;
  ply: number;
  fen: string;
  playedSan: string;
  humanEval: string | null;
  humanSkipped: boolean;
}

function toMomentSummary(m: {
  id: string;
  ply: number;
  fen: string;
  playedSan: string;
  humanEval: string | null;
  humanSkipped: boolean;
}): CriticalMomentSummary {
  // Deliberadamente NÃO inclui bestSan/cpBefore/cpAfter — vazar isso aqui
  // seria contornar o portão do ADR-007 pela lista em vez da revelação.
  return {
    id: m.id,
    ply: m.ply,
    fen: m.fen,
    playedSan: m.playedSan,
    humanEval: m.humanEval,
    humanSkipped: m.humanSkipped,
  };
}

export interface StartAnalysisResult extends GameResult {
  analysisId?: string;
  moments?: CriticalMomentSummary[];
}

/** Avaliação do lance jogado, resolvida mesmo quando ele não é uma das linhas de topo. */
async function resolvePlayedScore(
  engine: Awaited<ReturnType<typeof startEngine>>,
  fenBefore: string,
  fenAfter: string,
  lines: readonly EngineLine[],
  playedUci: string | null,
): Promise<number> {
  const naLista = lines.find((l) => l.moveUci === playedUci);
  if (naLista) return scoreOf(naLista);

  // Fora do topo: avalia a posição resultante do ponto de vista de quem
  // responde, e inverte — dá o valor exato do lance sem precisar de multiPV
  // gigante.
  const resposta = await engine.analyse(fenAfter, { depth: 10, multiPv: 1 });
  return resposta[0] ? -scoreOf(resposta[0]) : scoreOf(lines[lines.length - 1] ?? { moveUci: "" });
}

export async function startAnalysis(userId: string, gameId: string): Promise<StartAnalysisResult> {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      moves: { orderBy: { ply: "asc" } },
      analysis: { include: { criticalMoments: { orderBy: { ply: "asc" } } } },
    },
  });
  if (!game || game.userId !== userId) return { ok: false, error: "Partida não encontrada." };

  if (game.analysis) {
    return {
      ok: true,
      analysisId: game.analysis.id,
      moments: game.analysis.criticalMoments.map(toMomentSummary),
    };
  }

  if (game.moves.length === 0) {
    return { ok: false, error: "Esta partida não tem lances para analisar." };
  }

  const engine = await startEngine();
  const movesWithEval: MoveWithEval[] = [];
  try {
    let fenAnterior = START_FEN;
    for (const m of game.moves) {
      const lines = await engine.analyse(fenAnterior, { depth: 12, multiPv: 3 });
      const bestLine = lines[0];
      if (!bestLine) {
        fenAnterior = m.fenAfter;
        continue;
      }
      const secondLine = lines[1] ?? bestLine;
      const playedUci = sanToUci(fenAnterior, m.san);
      const playedScore = await resolvePlayedScore(engine, fenAnterior, m.fenAfter, lines, playedUci);

      movesWithEval.push({
        ply: m.ply,
        san: m.san,
        fenBefore: fenAnterior,
        fenAfter: m.fenAfter,
        bestLine,
        secondLine,
        playedScore,
      });
      fenAnterior = m.fenAfter;
    }
  } finally {
    await engine.quit();
  }

  const criticos = detectCriticalMoments(movesWithEval);

  const analysis = await prisma.gameAnalysis.create({ data: { gameId, engineDepth: 12 } });
  await prisma.criticalMoment.createMany({
    data: criticos.map((c) => ({
      analysisId: analysis.id,
      ply: c.ply,
      fen: c.fen,
      playedSan: c.playedSan,
      bestSan: c.bestSan,
      cpBefore: c.cpBefore,
      cpAfter: c.cpAfter,
    })),
  });

  const moments = await prisma.criticalMoment.findMany({
    where: { analysisId: analysis.id },
    orderBy: { ply: "asc" },
  });

  return { ok: true, analysisId: analysis.id, moments: moments.map(toMomentSummary) };
}

export interface SubmitHumanAnalysisInput {
  candidates: string;
  evalChoice: "GANHANDO" | "IGUAL" | "PIOR";
  timeSec: number;
}

export async function submitHumanAnalysis(
  userId: string,
  analysisId: string,
  momentId: string,
  data: SubmitHumanAnalysisInput,
): Promise<GameResult> {
  if (!(await ownsAnalysis(userId, analysisId))) return { ok: false, error: "Análise não encontrada." };
  await prisma.criticalMoment.update({
    where: { id: momentId },
    data: {
      humanCandidates: data.candidates.trim() ? [data.candidates.trim()] : [],
      humanEval: data.evalChoice,
      humanTimeSec: data.timeSec,
    },
  });
  return { ok: true };
}

export async function skipHumanAnalysis(
  userId: string,
  analysisId: string,
  momentId: string,
): Promise<GameResult> {
  if (!(await ownsAnalysis(userId, analysisId))) return { ok: false, error: "Análise não encontrada." };
  await prisma.criticalMoment.update({ where: { id: momentId }, data: { humanSkipped: true } });
  return { ok: true };
}

export interface RevealEngineResult extends GameResult {
  bestSan?: string;
  cpBefore?: number;
  cpAfter?: number;
}

/**
 * O portão do ADR-007. Lê o momento fresco do banco — nunca confia num
 * "já respondi" vindo do cliente — e só devolve dado de engine depois do
 * registro humano ou do pulo explícito.
 */
export async function revealEngine(
  userId: string,
  analysisId: string,
  momentId: string,
): Promise<RevealEngineResult> {
  if (!(await ownsAnalysis(userId, analysisId))) return { ok: false, error: "Análise não encontrada." };

  const moment = await prisma.criticalMoment.findUnique({ where: { id: momentId } });
  if (!moment || moment.analysisId !== analysisId) {
    return { ok: false, error: "Momento não encontrado." };
  }

  const respondeu = moment.humanEval !== null || moment.humanSkipped;
  if (!respondeu) {
    return { ok: false, error: "Registre sua leitura da posição antes de ver a engine." };
  }

  return {
    ok: true,
    bestSan: moment.bestSan ?? "",
    cpBefore: moment.cpBefore ?? 0,
    cpAfter: moment.cpAfter ?? 0,
  };
}

export interface FinalizeAnalysisInput {
  summary: string;
  learning: string;
}

export interface FinalizeAnalysisResult extends GameResult {
  transferredSkillIds?: string[];
}

export async function finalizeAnalysis(
  userId: string,
  analysisId: string,
  extra: FinalizeAnalysisInput,
): Promise<FinalizeAnalysisResult> {
  const analysis = await prisma.gameAnalysis.findUnique({
    where: { id: analysisId },
    include: { game: true, criticalMoments: true },
  });
  if (!analysis || analysis.game.userId !== userId) {
    return { ok: false, error: "Análise não encontrada." };
  }

  const pendente = analysis.criticalMoments.some((m) => m.humanEval === null && !m.humanSkipped);
  if (pendente) {
    return { ok: false, error: "Ainda há momentos sem resposta humana — registre ou pule cada um." };
  }

  const nowIso = new Date().toISOString();
  const masteryRows = await prisma.skillMastery.findMany({ where: { userId } });
  const masteries = new Map(masteryRows.map((m) => [m.skillId, rowToMastery(m)]));

  const transferMoments: TransferMoment[] = [];
  const classifications: Array<{ momentId: string; skillId: string | null; error: ReturnType<typeof classifyGameError> }> = [];

  for (const m of analysis.criticalMoments) {
    const bestSan = m.bestSan ?? "";
    const acertou = bestSan.length > 0 && m.playedSan === bestSan;

    if (acertou) {
      const skillId = masteredSkillIn(INDEX, masteries, "tactics");
      if (skillId) transferMoments.push({ ply: m.ply, fen: m.fen, playedSan: m.playedSan, bestSan, cpBefore: m.cpBefore ?? 0, cpAfter: m.cpAfter ?? 0, skillId });
      continue;
    }

    const human: HumanMomentReport = {
      candidates: m.humanCandidates[0] ?? null,
      evalChoice: (m.humanEval as HumanMomentReport["evalChoice"]) ?? null,
      timeSec: m.humanTimeSec,
      skipped: m.humanSkipped,
    };
    const classified = classifyGameError(
      { ply: m.ply, fen: m.fen, playedSan: m.playedSan, bestSan, cpBefore: m.cpBefore ?? 0, cpAfter: m.cpAfter ?? 0 },
      human,
      nowIso,
    );
    const skillId = weakestAvailableSkillIn(INDEX, masteries, competencyFor(classified.cause), nowIso);
    classifications.push({ momentId: m.id, skillId, error: { ...classified, skillId: skillId ?? undefined } });
  }

  const { skillIds: transferredSkillIds } = detectTransfers({ moments: transferMoments, masteries });

  await prisma.$transaction(async (tx) => {
    for (const { skillId, error } of classifications) {
      await tx.errorClassification.create({
        data: {
          analysisId,
          skillId,
          ply: error.ply ?? null,
          cause: error.cause,
          severity: error.severity,
          confidence: error.confidence,
          explanation: error.explanation,
        },
      });
    }

    for (const skillId of transferredSkillIds) {
      const atual = masteries.get(skillId);
      const atualizado = atual
        ? registerGameApplication(atual, nowIso)
        : registerGameApplication(
            { skillId, value: 0, state: "UNKNOWN", confidence: 0, decayRatePerDay: 0.6, attempts: 0, correctStreak: 0, lastAssessedAt: null, appliedInGame: 0 },
            nowIso,
          );

      await tx.skillMastery.upsert({
        where: { userId_skillId: { userId, skillId } },
        update: {
          appliedInGame: atualizado.appliedInGame,
          confidence: atualizado.confidence,
          lastAssessedAt: new Date(nowIso),
        },
        create: {
          userId,
          skillId,
          value: atualizado.value,
          state: atualizado.state,
          confidence: atualizado.confidence,
          decayRatePerDay: atualizado.decayRatePerDay,
          attempts: atualizado.attempts,
          correctStreak: atualizado.correctStreak,
          lastAssessedAt: new Date(nowIso),
          appliedInGame: atualizado.appliedInGame,
        },
      });
    }

    await tx.gameAnalysis.update({
      where: { id: analysisId },
      data: {
        humanStageCompleted: true,
        summary: extra.summary,
        learning: extra.learning,
        transferredSkillIds,
        engineDepth: 12,
        analyzedAt: new Date(),
      },
    });
  });

  return { ok: true, transferredSkillIds };
}

// ────────────────────────────────────────────────────────── listagem/DNA

export interface GameSummary {
  id: string;
  mode: string;
  opponent: string;
  result: string | null;
  startedAt: string;
  finishedAt: string | null;
  analyzed: boolean;
}

export async function listGames(userId: string): Promise<GameSummary[]> {
  const games = await prisma.game.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
    include: { analysis: { select: { humanStageCompleted: true } } },
  });

  return games.map((g) => ({
    id: g.id,
    mode: g.mode,
    opponent: g.opponent,
    result: g.result,
    startedAt: g.startedAt.toISOString(),
    finishedAt: g.finishedAt?.toISOString() ?? null,
    analyzed: g.analysis?.humanStageCompleted ?? false,
  }));
}

export async function playerDNA(userId: string, nowIso: string): Promise<PlayerDNA> {
  const [errors, analyses] = await Promise.all([
    prisma.errorClassification.findMany({ where: { analysis: { game: { userId } } } }),
    prisma.gameAnalysis.findMany({
      where: { game: { userId }, humanStageCompleted: true },
      select: { transferredSkillIds: true },
    }),
  ]);

  return computePlayerDNA({
    errors: errors.map((e) => ({
      cause: e.cause as ErrorCause,
      severity: e.severity as ErrorSeverity,
      confidence: e.confidence,
      explanation: e.explanation,
      skillId: e.skillId ?? undefined,
      ply: e.ply ?? undefined,
      at: e.createdAt.toISOString(),
    })),
    transferredSkillIdsPerGame: analyses.map((a) => a.transferredSkillIds),
    nowIso,
  });
}

export { BOT_RATING_PRESETS };
export type { PlayerDNA };

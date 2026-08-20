/**
 * ENGINE_REVIEW sobre UM exercício de lance.
 *
 * Extraído de `scripts/verify-engine.ts`: mesma lógica, agora chamável por
 * item — o CLI ainda percorre o acervo inteiro contra uma engine só; o CMS
 * (A7) precisa checar um rascunho novo contra a MESMA engine já subida numa
 * chamada de publicação, sem replicar o laço inteiro.
 *
 * Precisa de uma engine viva (I/O), então não pode morar em src/domain — mas,
 * como src/lib/engine/uci.ts, fica sem `import "server-only"` de propósito:
 * tanto o CLI (`scripts/verify-engine.ts`, tsx puro) quanto o CMS
 * (`src/lib/content-server.ts`, que É `server-only`) importam este arquivo.
 */

import { Chess, type Square } from "chess.js";
import type { ExerciseDef } from "@/content/schema";
import type { Engine } from "@/lib/engine/uci";
import { checkDifficulty, verifyMoveExercise, type Finding } from "@/domain/chess/verification";
import { sanFromPt } from "@/domain/chess/board";

export const TIPOS_DE_LANCE = new Set(["BEST_MOVE", "CHECK_ESCAPE", "CAPTURE"]);

/** SAN do conteúdo (em português) para a notação longa que a engine fala. */
function paraUci(fen: string, san: string): string | null {
  for (const candidato of [san, sanFromPt(san)]) {
    try {
      const chess = new Chess(fen);
      const move = chess.move(candidato.trim());
      if (move) return `${move.from}${move.to}${move.promotion ?? ""}`;
    } catch {
      // ilegal nesta leitura; tenta a outra língua
    }
  }
  return null;
}

/** O enunciado promete mate em N? Detecta pelo SAN da solução e pela posição. */
function mateEmQuanto(exercise: ExerciseDef, uciAceitos: string[]): number | undefined {
  const prometeMate =
    /mate em 1/i.test(exercise.prompt) ||
    ("moves" in exercise.acceptedAnswer && exercise.acceptedAnswer.moves.some((m) => m.includes("#")));
  if (!prometeMate) return undefined;

  const primeiro = uciAceitos[0];
  if (!primeiro) return undefined;

  const chess = new Chess(exercise.fen);
  chess.move({
    from: primeiro.slice(0, 2) as Square,
    to: primeiro.slice(2, 4) as Square,
    promotion: (primeiro[4] as "q" | "r" | "b" | "n" | undefined) ?? undefined,
  });
  return chess.isCheckmate() ? 1 : undefined;
}

/**
 * Lances que respondem à pergunta feita pelo item.
 *
 * Um exercício de CAPTURA pergunta qual captura ganha material. Reprová-lo
 * porque existe um lance quieto mais forte seria julgar uma pergunta que ele
 * não fez. Os demais tipos aceitam qualquer lance legal como candidato.
 */
function candidatosDaPergunta(exercise: ExerciseDef): string[] | undefined {
  if (exercise.type !== "CAPTURE") return undefined;

  const chess = new Chess(exercise.fen);
  return chess
    .moves({ verbose: true })
    .filter((m) => m.captured !== undefined)
    .map((m) => `${m.from}${m.to}${m.promotion ?? ""}`);
}

/** Menor profundidade em que a engine já apontava a solução. */
async function profundidadeDaSolucao(engine: Engine, fen: string, solucao: string): Promise<number | null> {
  for (const depth of [1, 2, 4, 6, 8, 12]) {
    const linhas = await engine.analyse(fen, { depth, multiPv: 1 });
    if (linhas[0]?.moveUci === solucao) return depth;
  }
  return null;
}

export interface EngineGateOptions {
  depth?: number;
  multiPv?: number;
}

/**
 * Roda ENGINE_REVIEW para um exercício contra uma engine já subida.
 *
 * Devolve [] de cara para tipos que não são de lance e para itens
 * RULE_EXECUTION — a afirmação deles é sobre legalidade, e disso o motor de
 * regras já dá conta (checkExercise, em src/domain/content/gates.ts).
 */
export async function runEngineGate(
  exercise: ExerciseDef,
  engine: Engine,
  options: EngineGateOptions = {},
): Promise<Finding[]> {
  if (!TIPOS_DE_LANCE.has(exercise.type)) return [];
  if (!("moves" in exercise.acceptedAnswer)) return [];
  if (exercise.verification === "RULE_EXECUTION") return [];

  const depth = options.depth ?? 14;
  const multiPv = options.multiPv ?? 5;

  const aceitos = exercise.acceptedAnswer.moves
    .map((san) => paraUci(exercise.fen, san))
    .filter((u): u is string => u !== null);

  if (aceitos.length === 0) {
    return [
      {
        severity: "BLOQUEIA",
        code: "GABARITO_ILEGAL",
        message: "nenhum lance aceito é legal nesta posição.",
      },
    ];
  }

  const previsiveis = exercise.predictableErrors
    .map((e) => paraUci(exercise.fen, e.answer))
    .filter((u): u is string => u !== null);

  const linhas = await engine.analyse(exercise.fen, { depth, multiPv });

  return [
    ...verifyMoveExercise({
      acceptedUci: aceitos,
      predictableUci: previsiveis,
      lines: linhas,
      claimsMateIn: mateEmQuanto(exercise, aceitos),
      candidateUci: candidatosDaPergunta(exercise),
    }),
    ...checkDifficulty({
      declared: exercise.difficulty,
      depthFound: await profundidadeDaSolucao(engine, exercise.fen, aceitos[0]!),
    }),
  ];
}

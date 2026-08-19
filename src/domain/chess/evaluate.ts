/**
 * Avaliação de exercícios.
 *
 * Toda verificação é determinística e passa pelo motor de regras (ADR-001).
 * A resposta declarada no conteúdo é CONFERIDA contra a posição, não aceita de
 * boa-fé: se o conteúdo disser que Cc6 é legal e a posição disser que não é,
 * o avaliador reporta conteúdo inválido em vez de reprovar o usuário.
 */

import { Chess, type Square } from "chess.js";
import type { ExerciseDef } from "@/content/schema";
import type { ErrorCause } from "../errors/taxonomy";
import { ERROR_CAUSES } from "../errors/taxonomy";
import { attackedSquaresFrom, isLightSquare, legalMovesFrom, sanFromPt, sanToPt } from "./board";

export type UserAnswer =
  | { kind: "squares"; squares: string[] }
  | { kind: "move"; san?: string; from?: string; to?: string; promotion?: string }
  | { kind: "choice"; choice: string };

export interface EvaluationResult {
  correct: boolean;
  /** Causa provável quando incorreto — vem de `predictableErrors` ou de heurística. */
  cause: ErrorCause | null;
  /** Confiança da classificação (0..1). Abaixo de 0.6 não alimenta o gargalo. */
  causeConfidence: number;
  /** Texto específico do erro previsível, quando houver. */
  specificFeedback: string | null;
  /** Resposta correta, para exibir depois da tentativa. */
  expected: string;
  /** Preenchido quando o CONTEÚDO está errado, não a resposta do usuário. */
  contentError: string | null;
}

function normalizeSquares(squares: readonly string[]): string[] {
  return [...new Set(squares.map((s) => s.trim().toLowerCase()))].sort();
}

function sameSet(a: readonly string[], b: readonly string[]): boolean {
  const na = normalizeSquares(a);
  const nb = normalizeSquares(b);
  return na.length === nb.length && na.every((v, i) => v === nb[i]);
}

function stripSan(san: string): string {
  return san.trim().replace(/[+#!?]/g, "").replace(/0/g, "O");
}

/**
 * SAN em português e em inglês colidem: "R" é Rei em português e Rook em inglês.
 * Traduzir cegamente corrompe a entrada. Em vez disso geramos as duas leituras
 * possíveis e consideramos que houve casamento se alguma delas coincidir.
 */
function sanCandidates(san: string): Set<string> {
  const raw = stripSan(san);
  return new Set([raw, stripSan(sanFromPt(raw))]);
}

/** Compara dois SAN tolerando idioma e símbolos. */
export function sanMatches(a: string, b: string): boolean {
  const ca = sanCandidates(a);
  for (const candidate of sanCandidates(b)) {
    if (ca.has(candidate)) return true;
  }
  return false;
}

function matchPredictableError(
  exercise: ExerciseDef,
  given: string,
): { cause: ErrorCause; explanation: string } | null {
  for (const pe of exercise.predictableErrors) {
    if (sanMatches(pe.answer, given)) {
      const cause = (ERROR_CAUSES as readonly string[]).includes(pe.cause)
        ? (pe.cause as ErrorCause)
        : "PATTERN";
      return { cause, explanation: pe.explanation };
    }
  }
  return null;
}

export function evaluateExercise(exercise: ExerciseDef, answer: UserAnswer): EvaluationResult {
  const base: EvaluationResult = {
    correct: false,
    cause: null,
    causeConfidence: 0,
    specificFeedback: null,
    expected: describeExpected(exercise),
    contentError: null,
  };

  switch (exercise.type) {
    case "LEGAL_MOVES":
    case "ATTACKED_SQUARES": {
      if (answer.kind !== "squares") return { ...base, cause: "RULE", causeConfidence: 0.4 };
      const declared = "squares" in exercise.acceptedAnswer ? exercise.acceptedAnswer.squares : [];
      const origin = exercise.tags.find((t) => /^from:[a-h][1-8]$/.test(t))?.slice(5);

      // Confere o gabarito contra o motor antes de julgar o usuário.
      if (origin) {
        const truth =
          exercise.type === "LEGAL_MOVES"
            ? legalMovesFrom(exercise.fen, origin as Square)
            : attackedSquaresFrom(exercise.fen, origin as Square);
        if (!sameSet(truth, declared)) {
          return {
            ...base,
            contentError: `Gabarito diverge do motor de regras. Motor: ${normalizeSquares(truth).join(", ")}. Conteúdo: ${normalizeSquares(declared).join(", ")}.`,
          };
        }
      }

      const correct = sameSet(answer.squares, declared);
      if (correct) return { ...base, correct: true };

      const chosen = normalizeSquares(answer.squares);
      const truthSet = new Set(normalizeSquares(declared));
      const missed = normalizeSquares(declared).filter((s) => !chosen.includes(s));
      const extra = chosen.filter((s) => !truthSet.has(s));

      return {
        ...base,
        cause: extra.length > 0 ? "RULE" : "VISUALIZATION",
        causeConfidence: 0.7,
        specificFeedback:
          extra.length > 0
            ? `Você marcou casas que não fazem parte: ${extra.join(", ")}.`
            : `Faltaram: ${missed.join(", ")}.`,
      };
    }

    case "SQUARE_COLOR": {
      if (answer.kind !== "choice") return base;
      const square = exercise.tags.find((t) => /^square:[a-h][1-8]$/.test(t))?.slice(7);
      if (!square) return { ...base, contentError: "Exercício sem tag `square:<casa>`." };

      const truth = isLightSquare(square) ? "light" : "dark";
      const declared = "color" in exercise.acceptedAnswer ? exercise.acceptedAnswer.color : null;
      if (declared && declared !== truth) {
        return { ...base, contentError: `Gabarito diz "${declared}", geometria diz "${truth}".` };
      }
      return answer.choice === truth
        ? { ...base, correct: true }
        : { ...base, cause: "VISUALIZATION", causeConfidence: 0.8 };
    }

    case "BEST_MOVE":
    case "CHECK_ESCAPE":
    case "CAPTURE": {
      if (answer.kind !== "move") return base;
      const accepted = "moves" in exercise.acceptedAnswer ? exercise.acceptedAnswer.moves : [];

      const chess = new Chess(exercise.fen);
      const legal = chess.moves({ verbose: true });

      // Gabarito conferido contra o motor: um lance aceito precisa ser legal.
      const illegalAccepted = accepted.filter(
        (san) => !legal.some((m) => sanMatches(m.san, san)),
      );
      if (illegalAccepted.length > 0) {
        return {
          ...base,
          contentError: `Gabarito contém lance ilegal nesta posição: ${illegalAccepted.join(", ")}.`,
        };
      }

      const playedSan = resolveSan(exercise.fen, answer);

      // Um erro previsível declarado pelo autor vale mais que a constatação de
      // ilegalidade: "Be7 bloqueia a coluna, mas o xeque vem pela fileira" ensina;
      // "lance ilegal" não. Por isso a taxonomia do autor é consultada primeiro.
      const predictable = matchPredictableError(exercise, playedSan ?? answer.san ?? "");
      if (predictable) {
        return {
          ...base,
          cause: predictable.cause,
          causeConfidence: 0.9,
          specificFeedback: predictable.explanation,
        };
      }

      if (!playedSan) {
        return {
          ...base,
          cause: "RULE",
          causeConfidence: 0.9,
          specificFeedback: "Esse lance não é legal nesta posição.",
        };
      }

      if (accepted.some((san) => sanMatches(san, playedSan))) {
        return { ...base, correct: true };
      }

      // Heurística: se a posição exigia sair do xeque e o lance é legal, o usuário
      // conhece a regra mas escolheu a defesa pior — isso é padrão, não regra.
      return {
        ...base,
        cause: exercise.type === "CHECK_ESCAPE" ? "PATTERN" : "CANDIDATE_IGNORED",
        causeConfidence: 0.55,
        specificFeedback: `${sanToPt(playedSan)} é legal, mas não é a solução.`,
      };
    }

    case "IS_MATE_OR_STALEMATE": {
      if (answer.kind !== "choice") return base;
      const chess = new Chess(exercise.fen);
      const truth = chess.isCheckmate()
        ? "mate"
        : chess.isStalemate()
          ? "afogamento"
          : chess.isCheck()
            ? "xeque"
            : "nenhum";
      const declared = "choice" in exercise.acceptedAnswer ? exercise.acceptedAnswer.choice : null;
      if (declared && declared !== truth) {
        return { ...base, contentError: `Gabarito diz "${declared}", motor diz "${truth}".` };
      }
      return answer.choice === truth
        ? { ...base, correct: true }
        : { ...base, cause: "RULE", causeConfidence: 0.85 };
    }

    case "PIECE_VALUE":
    case "NOTATION_READ":
    case "NOTATION_WRITE": {
      if (answer.kind !== "choice") return base;
      const declared = "choice" in exercise.acceptedAnswer ? exercise.acceptedAnswer.choice : null;
      if (declared === null) return { ...base, contentError: "Gabarito ausente." };

      const matched =
        exercise.type === "NOTATION_WRITE"
          ? sanMatches(answer.choice, declared)
          : answer.choice.trim().toLowerCase() === declared.trim().toLowerCase();
      if (matched) return { ...base, correct: true };
      const predictable = matchPredictableError(exercise, answer.choice);
      return {
        ...base,
        cause: predictable?.cause ?? (exercise.type === "PIECE_VALUE" ? "EVALUATION" : "RULE"),
        causeConfidence: predictable ? 0.9 : 0.6,
        specificFeedback: predictable?.explanation ?? null,
      };
    }

    default:
      return { ...base, contentError: `Tipo de exercício sem avaliador: ${exercise.type}` };
  }
}

/**
 * Resolve a entrada do usuário para o SAN do motor.
 *
 * "Ra8" é torre em inglês e rei em português. Tentamos as duas leituras e
 * ficamos com a que produz um lance legal — assumir uma língua rejeitaria
 * silenciosamente respostas corretas escritas na outra.
 */
function resolveSan(fen: string, answer: Extract<UserAnswer, { kind: "move" }>): string | null {
  const tryMove = (move: string | { from: Square; to: Square; promotion: "q" | "r" | "b" | "n" }) => {
    try {
      const chess = new Chess(fen); // instância nova: `move` muta o estado
      const played = chess.move(move as never);
      return played ? played.san : null;
    } catch {
      return null; // chess.js lança em lance ilegal
    }
  };

  if (answer.san) {
    const raw = answer.san.trim();
    return tryMove(raw) ?? tryMove(sanFromPt(raw));
  }
  if (answer.from && answer.to) {
    return tryMove({
      from: answer.from as Square,
      to: answer.to as Square,
      promotion: (answer.promotion ?? "q") as "q" | "r" | "b" | "n",
    });
  }
  return null;
}

export function describeExpected(exercise: ExerciseDef): string {
  const a = exercise.acceptedAnswer;
  if ("squares" in a) return normalizeSquares(a.squares).join(", ");
  if ("moves" in a) return a.moves.map(sanToPt).join(" ou ");
  if ("color" in a) return a.color === "light" ? "clara" : "escura";
  return a.choice;
}

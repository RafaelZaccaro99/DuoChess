/**
 * Síntese de posições.
 *
 * Coloca peças com semente e filtra pelo motor de regras até a posição ter a
 * propriedade desejada. Sondagem que sustenta a abordagem: com material
 * K+D+T contra rei solitário, cerca de 25% das posições legais têm mate em um
 * e 53% são xeque simples — volume nunca é o problema aqui, qualidade é.
 *
 * A composição do material é o que controla a dificuldade: rei e dama contra rei
 * é trivial; peças menores com material equilibrado exigem cálculo.
 */

import { Chess, type Color, type PieceSymbol, type Square } from "chess.js";
import { Aleatorio } from "./aleatorio";
import { FILES, RANKS } from "@/domain/chess/board";

export const TODAS_AS_CASAS: Square[] = FILES.flatMap((f) =>
  RANKS.map((r) => `${f}${r}` as Square),
);

export interface Peca {
  tipo: PieceSymbol;
  cor: Color;
}

/** Peças a colocar, além dos dois reis (que são obrigatórios e implícitos). */
export type Material = readonly Peca[];

export const peca = (tipo: PieceSymbol, cor: Color): Peca => ({ tipo, cor });

/** Monta um FEN a partir de um mapa casa → peça. */
export function montarFen(
  tabuleiro: ReadonlyMap<Square, Peca>,
  ladoAJogar: Color,
): string {
  const linhas: string[] = [];

  for (const rank of [...RANKS].reverse()) {
    let linha = "";
    let vazias = 0;

    for (const file of FILES) {
      const p = tabuleiro.get(`${file}${rank}` as Square);
      if (!p) {
        vazias += 1;
        continue;
      }
      if (vazias > 0) {
        linha += String(vazias);
        vazias = 0;
      }
      const letra = p.tipo.toUpperCase();
      linha += p.cor === "w" ? letra : letra.toLowerCase();
    }
    if (vazias > 0) linha += String(vazias);
    linhas.push(linha);
  }

  // Sem roque e sem en passant: posições sintetizadas não têm histórico.
  return `${linhas.join("/")} ${ladoAJogar} - - 0 1`;
}

/**
 * FEN com direitos de roque e casa de en passant.
 *
 * Posições de regra especial não podem ser sorteadas: roque exige rei e torre
 * nas casas de origem com direito preservado, e en passant exige um peão que
 * acabou de avançar duas casas. São construídas, não sintetizadas.
 */
export function montarFenComHistorico(
  tabuleiro: ReadonlyMap<Square, Peca>,
  ladoAJogar: Color,
  roque: string,
  enPassant: string,
): string {
  const base = montarFen(tabuleiro, ladoAJogar);
  const campos = base.split(" ");
  campos[2] = roque || "-";
  campos[3] = enPassant || "-";
  return campos.join(" ");
}

/** Capturas disponíveis, em notação longa — o escopo da pergunta de um item de captura. */
export function capturasEmUci(chess: Chess): string[] {
  return chess
    .moves({ verbose: true })
    .filter((m) => m.captured !== undefined)
    .map((m) => `${m.from}${m.to}${m.promotion ?? ""}`);
}

/** Reis nunca podem ficar adjacentes — a posição seria ilegal. */
function adjacentes(a: Square, b: Square): boolean {
  const df = Math.abs(a.charCodeAt(0) - b.charCodeAt(0));
  const dr = Math.abs(Number(a[1]) - Number(b[1]));
  return df <= 1 && dr <= 1;
}

/** Peão em primeira ou última fileira é posição impossível. */
function casaValidaPara(p: Peca, casa: Square): boolean {
  if (p.tipo !== "p") return true;
  const rank = casa[1];
  return rank !== "1" && rank !== "8";
}

export interface PosicaoSintetizada {
  fen: string;
  chess: Chess;
  /** Onde cada peça do material pedido acabou. */
  colocacao: Map<Square, Peca>;
}

/** Uma tentativa de posição legal com o material pedido. `null` se saiu ilegal. */
export function sintetizar(
  aleatorio: Aleatorio,
  material: Material,
  ladoAJogar: Color,
): PosicaoSintetizada | null {
  const tabuleiro = new Map<Square, Peca>();
  const livres = new Set(TODAS_AS_CASAS);

  const reiBranco = aleatorio.escolher([...livres]);
  tabuleiro.set(reiBranco, peca("k", "w"));
  livres.delete(reiBranco);

  const candidatasPretoRei = [...livres].filter((c) => !adjacentes(c, reiBranco));
  if (candidatasPretoRei.length === 0) return null;
  const reiPreto = aleatorio.escolher(candidatasPretoRei);
  tabuleiro.set(reiPreto, peca("k", "b"));
  livres.delete(reiPreto);

  for (const p of material) {
    const candidatas = [...livres].filter((c) => casaValidaPara(p, c));
    if (candidatas.length === 0) return null;
    const casa = aleatorio.escolher(candidatas);
    tabuleiro.set(casa, p);
    livres.delete(casa);
  }

  const fen = montarFen(tabuleiro, ladoAJogar);
  try {
    const chess = new Chess(fen);
    // O lado que NÃO joga não pode estar em xeque: a posição seria inalcançável.
    const espelho = new Chess(montarFen(tabuleiro, ladoAJogar === "w" ? "b" : "w"));
    if (espelho.isCheck()) return null;
    return { fen, chess, colocacao: tabuleiro };
  } catch {
    return null; // chess.js recusou: material impossível, reis adjacentes etc.
  }
}

/**
 * Tenta até achar uma posição que satisfaça o filtro, ou desistir.
 *
 * O limite existe para o gerador falhar rápido e alto em vez de rodar para
 * sempre quando um filtro é impossível de satisfazer.
 */
export function sintetizarAte(
  aleatorio: Aleatorio,
  material: Material,
  ladoAJogar: Color,
  filtro: (p: PosicaoSintetizada) => boolean,
  tentativasMaximas = 4_000,
): PosicaoSintetizada | null {
  for (let i = 0; i < tentativasMaximas; i++) {
    const posicao = sintetizar(aleatorio, material, ladoAJogar);
    if (posicao && filtro(posicao)) return posicao;
  }
  return null;
}

// ───────────────────────────────────────────────────── filtros de propriedade

/** Lances que dão mate imediato. */
export function lancesDeMate(chess: Chess): string[] {
  return chess.moves().filter((san) => {
    const t = new Chess(chess.fen());
    t.move(san);
    return t.isCheckmate();
  });
}

/**
 * Mate em um, e SÓ um.
 *
 * Aceitar um mate entre vários seria afirmar que existe uma única solução onde
 * há várias — e o gate de unicidade reprovaria, com razão.
 */
export function temMateEmUmUnico(p: PosicaoSintetizada): boolean {
  return lancesDeMate(p.chess).length === 1;
}

export function estaEmXequeSemMate(p: PosicaoSintetizada): boolean {
  return p.chess.isCheck() && !p.chess.isCheckmate();
}

export function ehAfogamento(p: PosicaoSintetizada): boolean {
  return p.chess.isStalemate();
}

/**
 * Nem xeque, nem afogamento: posição sem urgência.
 *
 * NÃO usa `isDraw()`. Rei e cavalo contra rei é empate por material
 * insuficiente, e isso tornaria impossível gerar um exercício de "quais casas
 * este cavalo ataca" — a pergunta não tem nada a ver com o resultado da partida.
 * Material insuficiente não é urgência.
 */
export function ehPosicaoTranquila(p: PosicaoSintetizada): boolean {
  return !p.chess.isCheck() && !p.chess.isStalemate();
}

/** Quantas respostas legais existem — usado para calibrar dificuldade do xeque. */
export function quantidadeDeRespostas(p: PosicaoSintetizada): number {
  return p.chess.moves().length;
}

/** Casa da peça pedida, quando ela é única no tabuleiro. */
export function casaDa(p: PosicaoSintetizada, tipo: PieceSymbol, cor: Color): Square | null {
  const achadas = [...p.colocacao.entries()].filter(
    ([, x]) => x.tipo === tipo && x.cor === cor,
  );
  return achadas.length === 1 ? achadas[0]![0] : null;
}

/**
 * Receitas: posição sintetizada → exercício completo.
 *
 * Cada receita produz um `ExerciseInput` já com gabarito, erros previsíveis,
 * explicação em seis partes, três dicas e fontes. O gabarito nunca é escrito à
 * mão: vem do motor de regras, então é correto por construção.
 *
 * As receitas de lance (mate em um, xeque) ainda passam pelo gate de engine no
 * gerador — construção correta garante que o lance é legal, não que ele seja o
 * melhor nem que seja único.
 */

import { Chess, type PieceSymbol, type Square } from "chess.js";
import type { Explanation, ExerciseInput } from "@/content/schema";
import {
  PIECE_NAMES_PT,
  attackedSquaresFrom,
  isLightSquare,
  legalMovesFrom,
  sanToPt,
} from "@/domain/chess/board";
import { Aleatorio } from "./aleatorio";
import {
  type PosicaoSintetizada,
  casaDa,
  lancesDeMate,
  TODAS_AS_CASAS,
} from "./sintese";
import {
  comArtigo,
  dePeca,
  paraPeca,
  porPeca,
  explicacaoCasasAtacadas,
  explicacaoClassificacao,
  explicacaoCorDaCasa,
  explicacaoLancesLegais,
  explicacaoMateEmUm,
  explicacaoNotacao,
  nomeDaPeca,
  regiaoDa,
} from "./textos";

/** Todo item gerado é prática independente ou revisão, nunca fase de ensino. */
export type FaseGerada = "INDEPENDENT" | "REVIEW";

export interface ContextoDaReceita {
  slug: string;
  skillIds: string[];
  difficulty: number;
  ratingHint: number;
  phase: FaseGerada;
  sources: string[];
}

// ─────────────────────────────────────────────────────────── cor da casa

export function receitaCorDaCasa(
  casa: Square,
  ctx: ContextoDaReceita,
): ExerciseInput {
  const clara = isLightSquare(casa);
  return {
    slug: ctx.slug,
    phase: ctx.phase,
    type: "SQUARE_COLOR",
    prompt: `Sem contar casa por casa: **${casa}** é clara ou escura?`,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    sideToMove: "w",
    skillIds: ctx.skillIds,
    difficulty: ctx.difficulty,
    ratingHint: ctx.ratingHint,
    acceptedAnswer: { color: clara ? "light" : "dark" },
    predictableErrors: [
      {
        answer: clara ? "dark" : "light",
        cause: "VISUALIZATION",
        explanation: `Quem conta casa por casa a partir de a1 costuma parar uma antes. ${casa} é ${clara ? "clara" : "escura"}: use a paridade em vez de contar.`,
      },
    ],
    explanation: explicacaoCorDaCasa(casa),
    hints: [
      "Não conte casa por casa. Use a paridade da coluna e da fileira.",
      `A coluna ${casa[0]} é a ${casa.charCodeAt(0) - 96}ª. A fileira é ${casa[1]}.`,
      "Soma ímpar dá casa clara; soma par dá casa escura.",
    ],
    tags: [`square:${casa}`, "gerado"],
    expectedSeconds: 20,
    points: 6,
    sources: ctx.sources,
  };
}

// ────────────────────────────────────────────── casas atacadas / lances legais

export function receitaCasasAtacadas(
  posicao: PosicaoSintetizada,
  origem: Square,
  ctx: ContextoDaReceita,
): ExerciseInput | null {
  const p = posicao.chess.get(origem);
  if (!p) return null;

  const casas = attackedSquaresFrom(posicao.fen, origem).sort();
  // Peça que não ataca nada não ensina nada.
  if (casas.length === 0) return null;

  const regiao = regiaoDa(origem);
  const bloqueada = temBloqueio(posicao, origem, casas);

  return {
    slug: ctx.slug,
    phase: ctx.phase,
    type: "ATTACKED_SQUARES",
    prompt: `Marque **todas** as casas atacadas ${porPeca(p.type)} de ${origem}.`,
    fen: posicao.fen,
    sideToMove: posicao.chess.turn(),
    skillIds: ctx.skillIds,
    difficulty: ctx.difficulty,
    ratingHint: ctx.ratingHint,
    acceptedAnswer: { squares: casas },
    predictableErrors: [
      {
        answer: casaVizinhaForaDaLista(origem, casas),
        cause: "RULE",
        explanation: `Essa casa não entra: ${comArtigo(p.type)} não alcança dali. Confira a geometria da peça antes de marcar.`,
      },
    ],
    explanation: explicacaoCasasAtacadas({
      tipo: p.type,
      origem,
      casas,
      regiao,
      bloqueada,
    }),
    hints: [
      `Percorra as direções ${dePeca(p.type)}, uma por vez.`,
      bloqueada
        ? "Uma peça no caminho interrompe a linha. A casa dela conta; o que vem depois, não."
        : `Do ${regiao}, essa peça alcança menos casas do que alcançaria de outro ponto do tabuleiro.`,
      `São ${casas.length} casas no total.`,
    ],
    tags: [`from:${origem}`, "gerado"],
    expectedSeconds: 20 + casas.length * 4,
    points: 6 + casas.length,
    sources: ctx.sources,
  };
}

export function receitaLancesLegais(
  posicao: PosicaoSintetizada,
  origem: Square,
  ctx: ContextoDaReceita,
): ExerciseInput | null {
  const p = posicao.chess.get(origem);
  if (!p) return null;

  const casas = legalMovesFrom(posicao.fen, origem).sort();
  if (casas.length === 0) return null;

  return {
    slug: ctx.slug,
    phase: ctx.phase,
    type: "LEGAL_MOVES",
    prompt: `Marque todas as casas para onde ${comArtigo(p.type)} de ${origem} **pode ir**.`,
    fen: posicao.fen,
    sideToMove: posicao.chess.turn(),
    skillIds: ctx.skillIds,
    difficulty: ctx.difficulty,
    ratingHint: ctx.ratingHint,
    acceptedAnswer: { squares: casas },
    predictableErrors: [
      {
        answer: casaVizinhaForaDaLista(origem, casas),
        cause: "RULE",
        explanation: `Essa casa não é destino legal ${paraPeca(p.type)} a partir de ${origem}.`,
      },
    ],
    explanation: explicacaoLancesLegais({
      tipo: p.type,
      origem,
      casas,
      regiao: regiaoDa(origem),
    }),
    hints: [
      `Comece pelas direções ${dePeca(p.type)}.`,
      "Casa ocupada por peça sua não é destino, mesmo estando na linha.",
      `São ${casas.length} destinos possíveis.`,
    ],
    tags: [`from:${origem}`, "gerado"],
    expectedSeconds: 20 + casas.length * 4,
    points: 6 + casas.length,
    sources: ctx.sources,
  };
}

// ────────────────────────────────────────────── classificação da posição

export function receitaClassificacao(
  posicao: PosicaoSintetizada,
  ctx: ContextoDaReceita,
): ExerciseInput {
  const chess = posicao.chess;
  const correta = chess.isCheckmate()
    ? "mate"
    : chess.isStalemate()
      ? "afogamento"
      : chess.isCheck()
        ? "xeque"
        : "nenhum";

  const erroPlausivel: Record<typeof correta, { answer: string; explanation: string }> = {
    mate: {
      answer: "xeque",
      explanation: "É mais que xeque: não sobrou nenhuma resposta legal. Confira as três — capturar, bloquear, mover — e veja que todas falham.",
    },
    xeque: {
      answer: "mate",
      explanation: "Ainda existem respostas legais, então não é mate. Antes de anunciar mate, tente capturar o atacante, bloquear a linha e mover o rei.",
    },
    afogamento: {
      answer: "mate",
      explanation: "Para ser mate, o rei precisa estar ATACADO. Aqui ele não está: sem xeque e sem lance legal, o nome disso é afogamento, e o resultado é empate.",
    },
    nenhum: {
      answer: "xeque",
      explanation: "Nenhuma peça está atacando o rei nesta posição. Confira a linha, a coluna e as diagonais que chegam até ele.",
    },
  };

  return {
    slug: ctx.slug,
    phase: ctx.phase,
    type: "IS_MATE_OR_STALEMATE",
    prompt: `Quem joga são as ${chess.turn() === "w" ? "brancas" : "pretas"}. Esta posição é xeque, mate, afogamento ou nenhum dos três?`,
    fen: posicao.fen,
    sideToMove: chess.turn(),
    skillIds: ctx.skillIds,
    difficulty: ctx.difficulty,
    ratingHint: ctx.ratingHint,
    acceptedAnswer: { choice: correta },
    predictableErrors: [{ ...erroPlausivel[correta], cause: "RULE" }],
    explanation: explicacaoClassificacao({
      correta,
      respostasLegais: chess.moves().length,
    }),
    hints: [
      "Primeiro: o rei do lado da vez está sendo atacado?",
      "Depois: existe algum lance legal?",
      "Atacado com resposta é xeque. Atacado sem resposta é mate. Sem ataque e sem resposta é afogamento.",
    ],
    tags: ["gerado"],
    expectedSeconds: 30,
    points: 8,
    sources: ctx.sources,
  };
}

// ───────────────────────────────────────────────────────────── mate em 1

export function receitaMateEmUm(
  posicao: PosicaoSintetizada,
  ctx: ContextoDaReceita,
): ExerciseInput | null {
  const mates = lancesDeMate(posicao.chess);
  if (mates.length !== 1) return null; // unicidade é requisito, não preferência

  const lance = mates[0]!;
  const outros = posicao.chess.moves().filter((m) => m !== lance);
  if (outros.length === 0) return null; // sem alternativa, não há o que escolher

  const casasDoRei = contarCasasDoRei(posicao);

  return {
    slug: ctx.slug,
    phase: ctx.phase,
    type: "BEST_MOVE",
    prompt: `As ${posicao.chess.turn() === "w" ? "brancas" : "pretas"} jogam e dão mate em 1.`,
    fen: posicao.fen,
    sideToMove: posicao.chess.turn(),
    skillIds: ctx.skillIds,
    difficulty: ctx.difficulty,
    ratingHint: ctx.ratingHint,
    acceptedAnswer: { moves: [sanToPt(lance)] },
    predictableErrors: [
      {
        answer: sanToPt(escolherErroPlausivel(posicao, outros)),
        cause: "CALCULATION_STOPPED",
        explanation:
          "Esse lance não dá mate. Xeque não é sinônimo de mate: depois de dar o xeque, confira se o rei tem casa, se a peça atacante pode ser capturada e se a linha pode ser bloqueada.",
      },
    ],
    explanation: explicacaoMateEmUm({ lance: sanToPt(lance), casasDoRei }),
    hints: [
      "Comece pelos xeques. Só um deles termina a partida.",
      casasDoRei === 0
        ? "O rei adversário já não tem casa de fuga. Basta atacá-lo de onde ele não possa capturar."
        : `O rei adversário tem ${casasDoRei} casa(s) livre(s). O mate precisa cobrir todas.`,
      "Depois de escolher, confira: o rei pode capturar quem deu o xeque?",
    ],
    tags: ["gerado"],
    expectedSeconds: 60,
    points: 14,
    sources: ctx.sources,
  };
}

// ─────────────────────────────────────────────────── resposta ao xeque

export function receitaRespostaAoXeque(
  posicao: PosicaoSintetizada,
  ctx: ContextoDaReceita,
): ExerciseInput | null {
  const respostas = posicao.chess.moves();
  if (respostas.length === 0 || respostas.length > 3) return null;

  return {
    slug: ctx.slug,
    phase: ctx.phase,
    type: "CHECK_ESCAPE",
    prompt:
      respostas.length === 1
        ? `As ${posicao.chess.turn() === "w" ? "brancas" : "pretas"} estão em xeque e existe **uma única** resposta legal. Encontre-a.`
        : `As ${posicao.chess.turn() === "w" ? "brancas" : "pretas"} estão em xeque. Encontre uma resposta legal.`,
    fen: posicao.fen,
    sideToMove: posicao.chess.turn(),
    skillIds: ctx.skillIds,
    difficulty: ctx.difficulty,
    ratingHint: ctx.ratingHint,
    acceptedAnswer: { moves: respostas.map(sanToPt) },
    predictableErrors: [
      {
        answer: lanceIlegalPlausivel(posicao),
        cause: "RULE",
        explanation:
          "Esse lance deixa o rei atacado, então não é legal. Diante de xeque só valem três coisas: capturar quem ataca, bloquear a linha ou mover o rei para casa segura.",
      },
    ],
    explanation: {
      perceived: "Você procurou uma saída para o xeque.",
      threat: "O rei está atacado agora. Nenhum outro plano importa até isso ser resolvido.",
      bestDefense: `Existem ${respostas.length} resposta(s) legal(is): ${respostas.map(sanToPt).join(", ")}.`,
      reason:
        respostas.length === 1
          ? "Só um lance resolve o xeque; todos os outros deixariam o rei atacado."
          : "Qualquer uma dessas resolve o xeque. As demais deixariam o rei atacado e por isso são ilegais.",
      pattern: "Contra xeque, procure sempre na ordem: capturar, bloquear, mover.",
      transferableRule:
        "Xeque de cavalo não pode ser bloqueado, porque o cavalo salta. Xeque duplo obriga a mover o rei.",
    },
    hints: [
      "Dá para capturar a peça que dá o xeque?",
      "Dá para colocar uma peça na linha do ataque?",
      "Se nenhuma das duas, mova o rei — e confira quais casas o atacante já cobre.",
    ],
    tags: ["gerado"],
    expectedSeconds: 45,
    points: 12,
    sources: ctx.sources,
  };
}

// ──────────────────────────────────────────────────────────────── notação

export function receitaNotacao(
  posicao: PosicaoSintetizada,
  aleatorio: Aleatorio,
  ctx: ContextoDaReceita,
): ExerciseInput | null {
  const lances = posicao.chess.moves({ verbose: true }).filter((m) => m.piece !== "p");
  if (lances.length === 0) return null;

  const lance = aleatorio.escolher(lances);
  const san = sanToPt(lance.san);

  return {
    slug: ctx.slug,
    phase: ctx.phase,
    type: "NOTATION_WRITE",
    prompt: `Escreva em notação algébrica o lance ${dePeca(lance.piece)} de ${lance.from} para ${lance.to}.`,
    fen: posicao.fen,
    sideToMove: posicao.chess.turn(),
    skillIds: ctx.skillIds,
    difficulty: ctx.difficulty,
    ratingHint: ctx.ratingHint,
    acceptedAnswer: { choice: san },
    predictableErrors: [
      {
        answer: `${lance.from}${lance.to}`,
        cause: "RULE",
        explanation:
          "Isso é notação de coordenadas, usada por computador. A notação algébrica de competição registra a inicial da peça e a casa de destino.",
      },
    ],
    explanation: explicacaoNotacao({
      san,
      tipo: lance.piece as PieceSymbol,
      destino: lance.to as Square,
    }),
    hints: [
      `Qual é a inicial de ${nomeDaPeca(lance.piece)} em português?`,
      "A casa que se escreve é a de destino, não a de origem.",
      `A origem só entra quando há ambiguidade entre duas peças iguais.`,
    ],
    tags: ["gerado"],
    expectedSeconds: 35,
    points: 10,
    sources: ctx.sources,
  };
}

// ───────────────────────────────────────────────────────────────── apoios

function temBloqueio(
  posicao: PosicaoSintetizada,
  origem: Square,
  atacadas: readonly string[],
): boolean {
  return atacadas.some((casa) => posicao.chess.get(casa as Square) !== undefined);
}

/** Uma casa vizinha que NÃO está na resposta — erro previsível plausível. */
function casaVizinhaForaDaLista(origem: Square, lista: readonly string[]): string {
  const dentro = new Set(lista);
  const file = origem.charCodeAt(0);
  const rank = Number(origem[1]);

  for (const [df, dr] of [[1, 0], [0, 1], [1, 1], [-1, 0], [0, -1], [-1, -1], [1, -1], [-1, 1]]) {
    const f = file + df!;
    const r = rank + dr!;
    if (f < 97 || f > 104 || r < 1 || r > 8) continue;
    const casa = `${String.fromCharCode(f)}${r}`;
    if (!dentro.has(casa) && casa !== origem) return casa;
  }
  // Fallback: qualquer casa fora da lista.
  return TODAS_AS_CASAS.find((c) => !dentro.has(c) && c !== origem) ?? "a1";
}

function contarCasasDoRei(posicao: PosicaoSintetizada): number {
  const inimigo = posicao.chess.turn() === "w" ? "b" : "w";
  const casaDoRei = casaDa(posicao, "k", inimigo);
  if (!casaDoRei) return 0;

  const espelho = new Chess(posicao.fen.replace(/ (w|b) /, ` ${inimigo} `));
  return espelho.moves({ square: casaDoRei as Square, verbose: true }).length;
}

/** Prefere um xeque que NÃO é mate: é o erro que o aluno realmente comete. */
function escolherErroPlausivel(posicao: PosicaoSintetizada, outros: readonly string[]): string {
  const xequeSemMate = outros.find((san) => {
    const t = new Chess(posicao.fen);
    t.move(san);
    return t.isCheck() && !t.isCheckmate();
  });
  return xequeSemMate ?? outros[0]!;
}

/** Um lance de rei que continuaria em xeque — ilegal e tentador. */
function lanceIlegalPlausivel(posicao: PosicaoSintetizada): string {
  const casaDoRei = casaDa(posicao, "k", posicao.chess.turn());
  if (!casaDoRei) return "Ra1";

  const legais = new Set<string>(
    posicao.chess.moves({ verbose: true }).filter((m) => m.piece === "k").map((m) => m.to),
  );
  const file = casaDoRei.charCodeAt(0);
  const rank = Number(casaDoRei[1]);

  for (const [df, dr] of [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
    const f = file + df!;
    const r = rank + dr!;
    if (f < 97 || f > 104 || r < 1 || r > 8) continue;
    const destino = `${String.fromCharCode(f)}${r}`;
    if (!legais.has(destino) && !posicao.chess.get(destino as Square)) {
      return `R${destino}`;
    }
  }
  return `R${casaDoRei}`;
}

export const NOME_DA_PECA = PIECE_NAMES_PT;

// ────────────────────────────────────────────────────────────── capturas

/**
 * Captura vantajosa entre alternativas.
 *
 * O item só faz sentido quando existe mais de uma captura possível: sem escolha,
 * não há decisão a treinar. A captura errada vira o erro previsível, e o gate de
 * engine confere que ela realmente perde — foi assim que o erro do `r3.e3`
 * escrito à mão apareceu.
 */
export function receitaCaptura(
  posicao: PosicaoSintetizada,
  ctx: ContextoDaReceita,
): ExerciseInput | null {
  const capturas = posicao.chess.moves({ verbose: true }).filter((m) => m.captured);
  if (capturas.length < 2) return null;

  // Melhor captura = a que ganha mais material sem recaptura; senão, a maior peça.
  const avaliadas = capturas.map((m) => {
    const t = new Chess(posicao.fen);
    t.move(m.san);
    const recapturam = t
      .moves({ verbose: true })
      .filter((r) => r.to === m.to)
      .length;
    return {
      m,
      valor: VALOR[m.captured as PieceSymbol] - (recapturam > 0 ? VALOR[m.piece] : 0),
    };
  });

  avaliadas.sort((a, b) => b.valor - a.valor);
  const melhor = avaliadas[0]!;
  const pior = avaliadas[avaliadas.length - 1]!;

  // Sem diferença material entre as opções, não há o que ensinar.
  if (melhor.valor - pior.valor < 2) return null;

  return {
    slug: ctx.slug,
    phase: ctx.phase,
    type: "CAPTURE",
    prompt: `As ${posicao.chess.turn() === "w" ? "brancas" : "pretas"} jogam. Há mais de uma captura possível — encontre a que ganha material.`,
    fen: posicao.fen,
    sideToMove: posicao.chess.turn(),
    skillIds: ctx.skillIds,
    difficulty: ctx.difficulty,
    ratingHint: ctx.ratingHint,
    acceptedAnswer: { moves: [sanToPt(melhor.m.san)] },
    predictableErrors: [
      {
        answer: sanToPt(pior.m.san),
        cause: "EVALUATION",
        explanation:
          "Essa captura parece boa pelo valor da peça capturada, mas o saldo depois da recaptura é pior. Antes de capturar, conte os defensores da casa de destino e some a troca inteira, não só a primeira peça.",
      },
    ],
    explanation: {
      perceived: "Você localizou as peças adversárias ao alcance e teve de escolher entre elas.",
      threat:
        "A armadilha é o valor da peça capturada. A peça mais valiosa costuma ser a mais defendida.",
      bestDefense: `${sanToPt(melhor.m.san)} é a captura que aumenta o saldo.`,
      reason: `${sanToPt(melhor.m.san)} ganha material; ${sanToPt(pior.m.san)} sai perdendo depois da recaptura.`,
      pattern:
        "Peça indefesa é alvo. Peça defendida é uma troca — e troca só vale a pena quando o saldo é seu.",
      transferableRule:
        "A cada lance do adversário, pergunte: sobrou alguma peça sem defensor? É a pergunta que mais ganha material até 1200.",
    },
    hints: [
      "Liste todas as capturas disponíveis antes de escolher uma.",
      "Para cada uma, pergunte: alguma peça adversária recaptura nessa casa?",
      "Some a troca inteira: o que você ganha menos o que você perde.",
    ],
    tags: ["gerado"],
    expectedSeconds: 60,
    points: 14,
    sources: ctx.sources,
  };
}

const VALOR: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

// ─────────────────────────────────────────────────────── regras especiais

/**
 * Execução de regra: roque, en passant, promoção.
 *
 * Marcadas como `RULE_EXECUTION` porque afirmam LEGALIDADE, não avaliação.
 * Julgá-las por centipawns seria erro de categoria — o item pede para executar
 * a regra, não para achar o melhor lance da posição.
 */
export function receitaRegraEspecial(input: {
  fen: string;
  lanceEsperado: string;
  erro: { answer: string; explanation: string };
  prompt: string;
  explanation: Explanation;
  hints: [string, string, string];
  ctx: ContextoDaReceita;
}): ExerciseInput | null {
  const chess = new Chess(input.fen);
  if (!chess.moves().includes(input.lanceEsperado)) return null;

  return {
    slug: input.ctx.slug,
    phase: input.ctx.phase,
    type: "BEST_MOVE",
    verification: "RULE_EXECUTION",
    prompt: input.prompt,
    fen: input.fen,
    sideToMove: chess.turn(),
    skillIds: input.ctx.skillIds,
    difficulty: input.ctx.difficulty,
    ratingHint: input.ctx.ratingHint,
    acceptedAnswer: { moves: [sanToPt(input.lanceEsperado)] },
    predictableErrors: [{ ...input.erro, cause: "RULE" }],
    explanation: input.explanation,
    hints: input.hints,
    tags: ["gerado"],
    expectedSeconds: 35,
    points: 10,
    sources: input.ctx.sources,
  };
}

// ────────────────────────────────────────────────────────────── orientação

/**
 * Orientação do tabuleiro.
 *
 * Diferente dos outros geradores: não sorteia posição. Orientação tem um
 * conjunto FINITO de perguntas com sentido — cantos, lados, a casa clara à
 * direita. Sortear aqui produziria variação sem conteúdo novo, então o conjunto
 * é curado e o gerador só percorre.
 */
export interface PerguntaDeOrientacao {
  prompt: string;
  correta: string;
  erros: Array<{ answer: string; explanation: string }>;
  reason: string;
  hints: [string, string, string];
}

export const PERGUNTAS_DE_ORIENTACAO: PerguntaDeOrientacao[] = [
  {
    prompt: "Qual casa fica no canto **inferior esquerdo** de quem joga com as brancas?",
    correta: "a1",
    erros: [
      { answer: "h1", explanation: "h1 é o canto inferior DIREITO das brancas — a casa clara que confirma a orientação." },
      { answer: "a8", explanation: "a8 é o canto superior esquerdo visto pelas brancas." },
    ],
    reason: "a1 é o canto inferior esquerdo das brancas, e é escura — a ponta da diagonal longa a1–h8.",
    hints: [
      "A coluna a é a mais à esquerda, do ponto de vista das brancas.",
      "A fileira 1 é a mais próxima de quem joga de brancas.",
      "É a casa escura da diagonal longa.",
    ],
  },
  {
    prompt: "Você senta com as **pretas**. Qual casa fica no seu canto inferior direito?",
    correta: "a8",
    erros: [
      { answer: "h1", explanation: "h1 é o canto inferior direito das BRANCAS. Com as pretas, o tabuleiro está de cabeça para baixo." },
      { answer: "h8", explanation: "h8 fica no canto inferior ESQUERDO de quem joga com as pretas." },
    ],
    reason: "a8 é o canto inferior direito das pretas — e, como manda a regra, é uma casa clara.",
    hints: [
      "Gire o tabuleiro mentalmente: as pretas veem a fileira 8 mais perto de si.",
      "A regra vale para os dois: casa clara no canto inferior direito.",
      "Qual casa da fileira 8 é clara e fica na ponta?",
    ],
  },
  {
    prompt: "Se o canto inferior direito de um jogador estiver **escuro**, o que aconteceu?",
    correta: "o tabuleiro está girado",
    erros: [
      { answer: "está correto", explanation: "Não está: a regra é casa CLARA no canto inferior direito de cada jogador." },
      { answer: "depende da cor das peças", explanation: "Não depende. A orientação é a mesma para os dois lados." },
    ],
    reason: "A regra é casa clara no canto inferior direito. Escura significa tabuleiro girado 90 graus.",
    hints: [
      "Qual é a regra de montagem do tabuleiro?",
      "Casa clara no canto inferior direito, para os dois jogadores.",
      "Se está escura, alguém girou o tabuleiro.",
    ],
  },
  {
    prompt: "Na posição inicial, a **dama branca** começa em qual casa?",
    correta: "d1",
    erros: [
      { answer: "e1", explanation: "e1 é a casa do rei branco. A dama fica à esquerda dele, do ponto de vista das brancas." },
      { answer: "d8", explanation: "d8 é a casa da dama PRETA." },
    ],
    reason: "A dama branca começa em d1 — uma casa clara, da cor dela. Rei e dama ocupam d e e.",
    hints: [
      "A dama começa numa casa da própria cor.",
      "Ela divide o centro da primeira fileira com o rei.",
      "Das duas casas centrais, d1 e e1, qual é clara?",
    ],
  },
  {
    prompt: "Na posição inicial, a **dama preta** começa em qual casa?",
    correta: "d8",
    erros: [
      { answer: "e8", explanation: "e8 é a casa do rei preto." },
      { answer: "d1", explanation: "d1 é a casa da dama BRANCA." },
    ],
    reason: "A dama preta começa em d8, casa escura — a cor dela. Os dois reis ficam na coluna e, uma de frente para a outra.",
    hints: [
      "A dama começa numa casa da própria cor.",
      "Rei e dama ocupam as colunas d e e nas duas cores.",
      "Das duas casas centrais da oitava fileira, qual é escura?",
    ],
  },
  {
    prompt: "As colunas do tabuleiro são nomeadas de a a h. Elas correm em qual direção?",
    correta: "da esquerda para a direita das brancas",
    erros: [
      { answer: "de baixo para cima", explanation: "De baixo para cima correm as FILEIRAS, numeradas de 1 a 8." },
      { answer: "da esquerda para a direita das pretas", explanation: "A nomeação é fixa e não muda com o lado: a coluna a fica à esquerda de quem joga de brancas." },
    ],
    reason: "As colunas vão de a a h da esquerda para a direita, visto pelas brancas. Fileiras são as numeradas.",
    hints: [
      "Uma das duas dimensões usa letras e a outra usa números.",
      "As letras nomeiam as colunas; os números, as fileiras.",
      "A coluna a fica à esquerda de quem joga com as brancas.",
    ],
  },
];

export function receitaOrientacao(
  pergunta: PerguntaDeOrientacao,
  ctx: ContextoDaReceita,
): ExerciseInput {
  return {
    slug: ctx.slug,
    phase: ctx.phase,
    type: "NOTATION_READ",
    prompt: pergunta.prompt,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    sideToMove: "w",
    skillIds: ctx.skillIds,
    difficulty: ctx.difficulty,
    ratingHint: ctx.ratingHint,
    acceptedAnswer: { choice: pergunta.correta },
    predictableErrors: pergunta.erros.map((e) => ({ ...e, cause: "RULE" })),
    explanation: {
      perceived: "Você relacionou coordenada e posição física no tabuleiro.",
      threat:
        "Tabuleiro girado inverte todas as diagonais e os dois roques. É erro que aparece em torneio escolar toda semana.",
      bestDefense: "Confira a casa clara à direita antes do primeiro lance, não no meio da partida.",
      reason: pergunta.reason,
      pattern: "Casa clara no canto inferior direito de cada jogador.",
      transferableRule:
        "Se o canto inferior direito estiver escuro, chame o árbitro antes de começar — depois do primeiro lance a discussão fica mais difícil.",
    },
    hints: pergunta.hints,
    tags: ["gerado", "orientacao"],
    expectedSeconds: 25,
    points: 8,
    sources: ctx.sources,
  };
}

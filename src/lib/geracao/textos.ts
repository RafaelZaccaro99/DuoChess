/**
 * Textos dos itens gerados.
 *
 * O risco de conteúdo por template é ficar oco — vinte exercícios repetindo a
 * mesma frase com a casa trocada. A defesa aqui é que os textos são
 * parametrizados por FATOS da posição, não por preenchimento: um cavalo no
 * centro alcança oito casas e um no canto alcança duas, e o que se ensina em
 * cada caso é diferente porque a posição é diferente.
 *
 * Onde o template não teria nada de novo a dizer, o item simplesmente não é
 * gerado — a lição escrita à mão cobre aquele ponto.
 */

import type { PieceSymbol, Square } from "chess.js";
import type { Explanation } from "@/content/schema";
import { PIECE_NAMES_PT, isLightSquare } from "@/domain/chess/board";

export const ARTIGO: Record<PieceSymbol, string> = {
  p: "o", n: "o", b: "o", r: "a", q: "a", k: "o",
};

export function nomeDaPeca(tipo: PieceSymbol): string {
  return PIECE_NAMES_PT[tipo];
}

/** "o cavalo", "a torre" — sujeito da frase. */
export function comArtigo(tipo: PieceSymbol): string {
  return `${ARTIGO[tipo]} ${nomeDaPeca(tipo)}`;
}

/**
 * "do cavalo", "da torre" — posse.
 *
 * Existe porque template em português precisa contrair preposição com artigo.
 * Sem isto sai "as casas atacadas o cavalo", que foi exatamente o que apareceu
 * na primeira leitura do conteúdo gerado.
 */
export function dePeca(tipo: PieceSymbol): string {
  return `${ARTIGO[tipo] === "o" ? "do" : "da"} ${nomeDaPeca(tipo)}`;
}

/** "pelo cavalo", "pela torre" — agente da passiva. */
export function porPeca(tipo: PieceSymbol): string {
  return `${ARTIGO[tipo] === "o" ? "pelo" : "pela"} ${nomeDaPeca(tipo)}`;
}

/** "para o cavalo", "para a torre" — destinatário. */
export function paraPeca(tipo: PieceSymbol): string {
  return `para ${ARTIGO[tipo]} ${nomeDaPeca(tipo)}`;
}

/** Onde a peça está: centro, borda ou canto. Muda o que há para ensinar. */
export type Regiao = "centro" | "borda" | "canto";

export function regiaoDa(casa: Square): Regiao {
  const file = casa[0]!;
  const rank = casa[1]!;
  const naBordaF = file === "a" || file === "h";
  const naBordaR = rank === "1" || rank === "8";
  if (naBordaF && naBordaR) return "canto";
  if (naBordaF || naBordaR) return "borda";
  return "centro";
}

// ───────────────────────────────────────────── casas atacadas / lances legais

const LICAO_POR_REGIAO: Record<Regiao, string> = {
  centro:
    "Do centro, a peça enxerga o máximo que a sua geometria permite. É por isso que desenvolver para o centro vale um tempo.",
  borda:
    "Na borda, metade das direções sai do tabuleiro. A peça continua a mesma, mas trabalha com menos.",
  canto:
    "No canto, a peça alcança o mínimo possível. Peça encostada no canto é peça quase parada.",
};

export function explicacaoCasasAtacadas(input: {
  tipo: PieceSymbol;
  origem: Square;
  casas: readonly string[];
  regiao: Regiao;
  bloqueada: boolean;
}): Explanation {
  const nome = nomeDaPeca(input.tipo);
  const quantas = input.casas.length;
  const lista = [...input.casas].sort().join(", ");

  return {
    perceived: `Você percorreu as direções ${dePeca(input.tipo)} a partir de ${input.origem}.`,
    threat:
      "Deixar de ver uma casa atacada é como se perde material sem entender por quê: a peça adversária chega numa casa que você achava segura.",
    bestDefense: input.bloqueada
      ? "Percorra cada direção até encontrar a primeira peça. Essa casa entra na conta; o que vem depois dela, não."
      : "Percorra as direções em ordem fixa, sempre no mesmo sentido, para não pular nenhuma.",
    reason: `São ${quantas} casas: ${lista}.`,
    pattern: LICAO_POR_REGIAO[input.regiao],
    transferableRule:
      input.tipo === "n"
        ? "O cavalo troca de cor de casa a cada lance. Se a sua peça está numa casa clara, o cavalo que está a um lance dela só ataca casas escuras."
        : "Peça de linha para na primeira peça do caminho. Se essa peça é sua, ela não é um obstáculo — está sendo defendida.",
  };
}

export function explicacaoLancesLegais(input: {
  tipo: PieceSymbol;
  origem: Square;
  casas: readonly string[];
  regiao: Regiao;
}): Explanation {
  const base = explicacaoCasasAtacadas({ ...input, bloqueada: false });
  return {
    ...base,
    perceived: `Você buscou para onde ${comArtigo(input.tipo)} de ${input.origem} pode ir.`,
    reason: `São ${input.casas.length} casas de destino: ${[...input.casas].sort().join(", ")}.`,
    transferableRule:
      "Onde a peça PODE IR e o que ela ATACA são listas diferentes. A casa ocupada por peça sua é atacada (defendida), mas não é destino.",
  };
}

// ───────────────────────────────────────────────────────────── cor da casa

export function explicacaoCorDaCasa(casa: Square): Explanation {
  const clara = isLightSquare(casa);
  const file = casa[0]!;
  const rank = Number(casa[1]);
  const indiceColuna = file.charCodeAt(0) - 96; // a = 1
  const paridade = (indiceColuna + rank) % 2 === 1 ? "ímpar" : "par";

  return {
    perceived: `Você localizou ${casa} e teve que decidir a cor sem olhar o tabuleiro.`,
    threat:
      "Sem esse automatismo, todo cálculo de final de bispo gasta tempo de relógio que você não tem.",
    bestDefense: `Some a coluna e a fileira: ${file} é a ${indiceColuna}ª coluna, mais ${rank} dá soma ${paridade}.`,
    reason: `${casa} é ${clara ? "clara" : "escura"}.`,
    pattern: "Soma ímpar significa casa clara. Soma par significa casa escura.",
    transferableRule:
      "O bispo nunca muda a cor da casa. Saber a cor de cor é o que permite calcular finais de bispo sem tabuleiro.",
  };
}

// ─────────────────────────────────────────────────── xeque, mate, afogamento

export function explicacaoClassificacao(input: {
  correta: "xeque" | "mate" | "afogamento" | "nenhum";
  respostasLegais: number;
}): Explanation {
  const porResposta: Record<typeof input.correta, Explanation> = {
    xeque: {
      perceived: "Você viu que o rei está sendo atacado.",
      threat: "O rei está em xeque e isso precisa ser resolvido neste lance — não existe adiar.",
      bestDefense: `Existem ${input.respostasLegais} respostas legais: capturar o atacante, bloquear a linha ou mover o rei.`,
      reason: "É xeque, e não mate, porque ainda existe pelo menos uma resposta legal.",
      pattern: "Rei atacado com resposta possível é xeque. Rei atacado sem resposta é mate.",
      transferableRule:
        "Antes de anunciar mate, confira as três respostas na ordem: capturar, bloquear, mover. Se alguma funciona, é só xeque.",
    },
    mate: {
      perceived: "Você viu que o rei está atacado e procurou as saídas.",
      threat: "O rei está atacado e nenhuma resposta legal existe. A partida acabou.",
      bestDefense: "Não há defesa — é essa a definição de mate.",
      reason: "É xeque-mate: rei atacado e zero lances legais.",
      pattern: "Mate exige as duas coisas ao mesmo tempo: rei atacado e nenhuma resposta.",
      transferableRule:
        "Rei preso atrás dos próprios peões é o que transforma um xeque comum em mate de corredor.",
    },
    afogamento: {
      perceived: "Você viu que o lado da vez não tem para onde ir.",
      threat:
        "A ameaça aqui é contra quem está ganhando: sem lance legal e sem xeque, o resultado é empate.",
      bestDefense:
        "Do lado que está à frente, a defesa contra o próprio erro é deixar uma casa livre antes de aproximar as peças.",
      reason: "É afogamento: o jogador da vez não está em xeque e não tem nenhum lance legal.",
      pattern: "Sem xeque somado a sem lance legal é igual a empate.",
      transferableRule:
        "Quando estiver muito à frente, antes de cada lance pergunte se o adversário ainda tem lance legal. Meio ponto perdido por descuido custa o mesmo que uma derrota.",
    },
    nenhum: {
      perceived: "Você conferiu se o rei estava atacado e se havia lances legais.",
      threat: "Nada urgente acontece nesta posição — e reconhecer isso também é uma decisão.",
      bestDefense: "Com a posição tranquila, o próximo passo é melhorar a peça pior colocada.",
      reason: "Não é xeque, não é mate e não é afogamento: a posição segue normalmente.",
      pattern: "Nem toda posição tem urgência. Checar primeiro e concluir que não há é parte do método.",
      transferableRule:
        "O ciclo de decisão começa sempre por urgências. Quando não existe nenhuma, aí sim se pensa em plano.",
    },
  };

  return porResposta[input.correta];
}

// ─────────────────────────────────────────────────────────────── mate em 1

export function explicacaoMateEmUm(input: { lance: string; casasDoRei: number }): Explanation {
  return {
    perceived: "Você procurou o lance que ataca o rei e fecha todas as saídas ao mesmo tempo.",
    threat:
      input.casasDoRei === 0
        ? "O rei adversário já não tem casa de fuga: basta atacá-lo de onde ele não possa capturar o atacante."
        : `O rei ainda tem ${input.casasDoRei} casa(s) de fuga, e o lance certo precisa cobrir todas elas.`,
    bestDefense: "Depois do lance correto não existe defesa — capturar, bloquear e fugir estão todos fora.",
    reason: `${input.lance} é o único mate da posição.`,
    pattern:
      "Mate em um é xeque somado a zero respostas. Verifique as três: dá para capturar quem deu o xeque? Dá para bloquear? O rei tem casa?",
    transferableRule:
      "Xeque não é mate. Antes de jogar o xeque, confira se a peça que ataca pode ser simplesmente capturada.",
  };
}

// ───────────────────────────────────────────────────────────────── notação

export function explicacaoNotacao(input: { san: string; tipo: PieceSymbol; destino: Square }): Explanation {
  return {
    perceived: "Você identificou a peça e a casa de destino.",
    threat:
      "Súmula mal preenchida impede reclamar tríplice repetição e inviabiliza analisar a própria partida depois.",
    bestDefense:
      "Inicial da peça mais casa de destino. Acrescente x para captura, + para xeque, # para mate e = para promoção.",
    reason: `${input.san}: ${comArtigo(input.tipo)} vai para ${input.destino}.`,
    pattern: "Peça mais destino. Peões dispensam a inicial: só a casa de destino.",
    transferableRule:
      "A notação em inglês usa outras iniciais. Cf3 e Nf3 são o mesmo lance — livro importado não muda o xadrez.",
  };
}

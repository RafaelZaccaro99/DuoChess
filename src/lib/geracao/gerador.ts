/**
 * O gerador.
 *
 * Monta o banco de prática da Liga Recruta: para cada habilidade, itens
 * suficientes para a repetição espaçada ter o que reagendar sem repetir a mesma
 * posição.
 *
 * Duas garantias:
 *  1. **determinismo** — mesma semente, mesmo conteúdo, byte a byte;
 *  2. **aprovado na saída** — cada item passa pelo avaliador com o próprio
 *     gabarito, e os de lance passam também pelo gate de engine. Item que não
 *     passa é descartado aqui, não reprovado no CI.
 */

import { Chess, type Square } from "chess.js";
import type { ExerciseInput } from "@/content/schema";
import { exerciseSchema } from "@/content/schema";
import { evaluateExercise } from "@/domain/chess/evaluate";
import { blocks, verifyMoveExercise } from "@/domain/chess/verification";
import { sanFromPt } from "@/domain/chess/board";
import type { Engine } from "@/lib/engine/uci";
import { Aleatorio } from "./aleatorio";
import {
  type PosicaoSintetizada,
  type Peca,
  capturasEmUci,
  ehAfogamento,
  montarFenComHistorico,
  ehPosicaoTranquila,
  estaEmXequeSemMate,
  peca,
  sintetizarAte,
  temMateEmUmUnico,
} from "./sintese";
import {
  type ContextoDaReceita,
  receitaCaptura,
  receitaCasasAtacadas,
  receitaClassificacao,
  receitaCorDaCasa,
  receitaLancesLegais,
  receitaMateEmUm,
  receitaNotacao,
  receitaOrientacao,
  receitaRegraEspecial,
  receitaRespostaAoXeque,
  PERGUNTAS_DE_ORIENTACAO,
} from "./receitas";
import { TODAS_AS_CASAS } from "./sintese";

export interface Pedido {
  /** Prefixo do slug: `g.<unidade>.<n>`. */
  unidade: string;
  skillIds: string[];
  sources: string[];
  quantidade: number;
  /** Dificuldades a distribuir entre os itens gerados. */
  dificuldades: number[];
  ratingHint: number;
}

export interface ResultadoGeracao {
  itens: ExerciseInput[];
  descartados: number;
  motivos: Map<string, number>;
}

const TIPOS_DE_LANCE = new Set(["BEST_MOVE", "CHECK_ESCAPE", "CAPTURE"]);

/**
 * Confere o item contra o avaliador usando o próprio gabarito.
 *
 * Se o avaliador reprova a resposta que o gerador declarou correta, quem está
 * errado é o gerador — e o item não pode sair.
 */
function passaNoAvaliador(item: ExerciseInput): string | null {
  const parsed = exerciseSchema.safeParse(item);
  if (!parsed.success) return `schema: ${parsed.error.issues[0]?.message ?? "inválido"}`;

  const exercise = parsed.data;
  const a = exercise.acceptedAnswer;
  const resposta =
    "squares" in a
      ? ({ kind: "squares", squares: a.squares } as const)
      : "moves" in a
        ? ({ kind: "move", san: a.moves[0]! } as const)
        : "color" in a
          ? ({ kind: "choice", choice: a.color } as const)
          : ({ kind: "choice", choice: a.choice } as const);

  const r = evaluateExercise(exercise, resposta);
  if (r.contentError) return `gabarito divergente: ${r.contentError}`;
  if (!r.correct) return "o avaliador reprova o próprio gabarito";

  for (const pe of exercise.predictableErrors) {
    const comoResposta =
      "moves" in a
        ? ({ kind: "move", san: pe.answer } as const)
        : ({ kind: "choice", choice: pe.answer } as const);
    if (evaluateExercise(exercise, comoResposta).correct) {
      return `erro previsível "${pe.answer}" é aceito como correto`;
    }
  }
  return null;
}

/** Gate de engine, para os tipos em que a avaliação importa. */
async function passaNaEngine(item: ExerciseInput, engine: Engine): Promise<string | null> {
  if (!TIPOS_DE_LANCE.has(item.type)) return null;
  if (item.verification === "RULE_EXECUTION") return null;

  const a = item.acceptedAnswer;
  if (!("moves" in a)) return null;

  const paraUci = (san: string): string | null => {
    for (const candidato of [san, sanFromPt(san)]) {
      try {
        const chess = new Chess(item.fen);
        const m = chess.move(candidato);
        if (m) return `${m.from}${m.to}${m.promotion ?? ""}`;
      } catch {
        // ilegal nesta leitura
      }
    }
    return null;
  };

  const aceitos = a.moves.map(paraUci).filter((u): u is string => u !== null);
  if (aceitos.length === 0) return "nenhum lance aceito é legal";

  const previsiveis = item.predictableErrors
    .map((e) => paraUci(e.answer))
    .filter((u): u is string => u !== null);

  const linhas = await engine.analyse(item.fen, { depth: 12, multiPv: 5 });
  const achados = verifyMoveExercise({
    acceptedUci: aceitos,
    predictableUci: previsiveis,
    lines: linhas,
    // Item de captura pergunta qual CAPTURA ganha material. Um lance quieto mais
    // forte não é resposta possível — o mesmo escopo que o gate de CI aplica.
    candidateUci: item.type === "CAPTURE" ? capturasEmUci(new Chess(item.fen)) : undefined,
  });

  if (blocks(achados)) {
    return achados.find((f) => f.severity === "BLOQUEIA")!.code;
  }
  return null;
}

interface Tentativa {
  item: ExerciseInput | null;
  motivo?: string;
}

/**
 * Produz um banco de prática.
 *
 * `fabricar` recebe o índice do item e devolve um candidato. O laço tenta várias
 * vezes por item porque a síntese é aleatória: nem toda posição sorteada serve.
 */
export async function gerar(
  pedido: Pedido,
  fabricar: (indice: number, aleatorio: Aleatorio, ctx: ContextoDaReceita) => Tentativa,
  semente: number,
  engine: Engine | null,
): Promise<ResultadoGeracao> {
  const aleatorio = new Aleatorio(semente);
  const itens: ExerciseInput[] = [];
  const motivos = new Map<string, number>();
  let descartados = 0;
  const fensUsadas = new Set<string>();

  const anotar = (motivo: string): void => {
    motivos.set(motivo, (motivos.get(motivo) ?? 0) + 1);
    descartados += 1;
  };

  let indice = 0;
  let tentativas = 0;
  const limite = pedido.quantidade * 60;

  while (itens.length < pedido.quantidade && tentativas < limite) {
    tentativas += 1;

    const ctx: ContextoDaReceita = {
      slug: `g.${pedido.unidade}.${String(itens.length + 1).padStart(2, "0")}`,
      skillIds: pedido.skillIds,
      difficulty: pedido.dificuldades[itens.length % pedido.dificuldades.length]!,
      ratingHint: pedido.ratingHint,
      phase: itens.length % 3 === 2 ? "REVIEW" : "INDEPENDENT",
      sources: pedido.sources,
    };

    const { item, motivo } = fabricar(indice++, aleatorio, ctx);
    if (!item) {
      anotar(motivo ?? "síntese falhou");
      continue;
    }

    // Duas posições idênticas ensinariam a mesma coisa duas vezes.
    //
    // Mesma chave que o validador usa, pelo mesmo motivo: nem todo item se
    // distingue pelo FEN. Os de cor da casa e de orientação usam todos a posição
    // inicial, porque a posição não é o assunto deles — a pergunta é.
    const chave = [
      item.type,
      item.fen,
      item.prompt,
      JSON.stringify(item.acceptedAnswer),
    ].join("::");
    if (fensUsadas.has(chave)) {
      anotar("posição repetida");
      continue;
    }

    const problemaLocal = passaNoAvaliador(item);
    if (problemaLocal) {
      anotar(problemaLocal);
      continue;
    }

    if (engine) {
      const problemaEngine = await passaNaEngine(item, engine);
      if (problemaEngine) {
        anotar(problemaEngine);
        continue;
      }
    }

    fensUsadas.add(chave);
    itens.push(item);
  }

  return { itens, descartados, motivos };
}

// ─────────────────────────────────────────────────── fabricantes por unidade

export const MATERIAL = { peca };

/** R1: cor da casa e localização. Sem posição: a geometria basta. */
export function fabricarCorDaCasa(
  indice: number,
  aleatorio: Aleatorio,
  ctx: ContextoDaReceita,
): Tentativa {
  // Percorre as casas em ordem embaralhada e estável, sem repetir.
  const casa = TODAS_AS_CASAS[(indice * 7 + 11) % 64]!;
  return { item: receitaCorDaCasa(casa, ctx) };
}

/** R2: casas atacadas e lances legais, com material que varia. */
export function fabricarAlcance(
  tipo: "n" | "b" | "r" | "q",
  modo: "ATTACKED_SQUARES" | "LEGAL_MOVES",
  comBloqueio: boolean,
) {
  return (_indice: number, aleatorio: Aleatorio, ctx: ContextoDaReceita): Tentativa => {
    const material = comBloqueio
      ? [peca(tipo, "w"), peca("p", "w"), peca("p", "b")]
      : [peca(tipo, "w")];

    const posicao = sintetizarAte(aleatorio, material, "w", (p) => {
      if (!ehPosicaoTranquila(p)) return false;
      const casa = casaDaPeca(p, tipo);
      return casa !== null;
    });
    if (!posicao) return { item: null, motivo: "não achou posição tranquila" };

    const origem = casaDaPeca(posicao, tipo)!;
    const item =
      modo === "ATTACKED_SQUARES"
        ? receitaCasasAtacadas(posicao, origem, ctx)
        : receitaLancesLegais(posicao, origem, ctx);

    return { item, motivo: item ? undefined : "peça sem alcance" };
  };
}

/** R4/R5: classificação da posição, alternando entre as quatro respostas. */
export function fabricarClassificacao(
  alvo: "xeque" | "mate" | "afogamento" | "nenhum",
) {
  return (_indice: number, aleatorio: Aleatorio, ctx: ContextoDaReceita): Tentativa => {
    const material =
      alvo === "afogamento"
        ? [peca("q", "w"), peca("r", "w")]
        : [peca("q", "w"), peca("r", "w"), peca("n", "w")];

    const filtro = (p: PosicaoSintetizada): boolean => {
      switch (alvo) {
        case "mate":
          return p.chess.isCheckmate();
        case "xeque":
          return estaEmXequeSemMate(p);
        case "afogamento":
          return ehAfogamento(p);
        case "nenhum":
          return ehPosicaoTranquila(p);
      }
    };

    const posicao = sintetizarAte(aleatorio, material, "b", filtro, 8_000);
    if (!posicao) return { item: null, motivo: `não achou posição de ${alvo}` };
    return { item: receitaClassificacao(posicao, ctx) };
  };
}

/** R5: mate em um, com solução única. */
export function fabricarMateEmUm(
  _indice: number,
  aleatorio: Aleatorio,
  ctx: ContextoDaReceita,
): Tentativa {
  const posicao = sintetizarAte(
    aleatorio,
    [peca("q", "w"), peca("r", "w")],
    "w",
    temMateEmUmUnico,
    8_000,
  );
  if (!posicao) return { item: null, motivo: "não achou mate em 1 único" };
  const item = receitaMateEmUm(posicao, ctx);
  return { item, motivo: item ? undefined : "mate não era único" };
}

/** R4: resposta ao xeque, com poucas saídas. */
export function fabricarRespostaAoXeque(
  _indice: number,
  aleatorio: Aleatorio,
  ctx: ContextoDaReceita,
): Tentativa {
  const posicao = sintetizarAte(
    aleatorio,
    [peca("q", "w"), peca("n", "w"), peca("r", "b")],
    "b",
    (p) => estaEmXequeSemMate(p) && p.chess.moves().length <= 3,
    8_000,
  );
  if (!posicao) return { item: null, motivo: "não achou xeque com poucas saídas" };
  const item = receitaRespostaAoXeque(posicao, ctx);
  return { item, motivo: item ? undefined : "respostas demais" };
}

/** R6: escrever a notação de um lance. */
export function fabricarNotacao(
  _indice: number,
  aleatorio: Aleatorio,
  ctx: ContextoDaReceita,
): Tentativa {
  const posicao = sintetizarAte(
    aleatorio,
    [peca("n", "w"), peca("b", "w"), peca("r", "w")],
    "w",
    ehPosicaoTranquila,
  );
  if (!posicao) return { item: null, motivo: "não achou posição tranquila" };
  const item = receitaNotacao(posicao, aleatorio, ctx);
  return { item, motivo: item ? undefined : "sem lance de peça" };
}

function casaDaPeca(p: PosicaoSintetizada, tipo: string): Square | null {
  for (const [casa, x] of p.colocacao) {
    if (x.tipo === tipo && x.cor === "w") return casa;
  }
  return null;
}

// ─────────────────────────────────────────────── fabricantes: R3 e R6

/** R3: escolher entre capturas. Material com peças de valores diferentes. */
export function fabricarCaptura(
  _indice: number,
  aleatorio: Aleatorio,
  ctx: ContextoDaReceita,
): Tentativa {
  const posicao = sintetizarAte(
    aleatorio,
    [peca("q", "w"), peca("r", "b"), peca("n", "b"), peca("p", "b")],
    "w",
    (p) => {
      if (p.chess.isCheck()) return false;
      const capturas = p.chess.moves({ verbose: true }).filter((m) => m.captured);
      return capturas.length >= 2;
    },
    8_000,
  );
  if (!posicao) return { item: null, motivo: "não achou posição com duas capturas" };

  const item = receitaCaptura(posicao, ctx);
  return { item, motivo: item ? undefined : "capturas equivalentes, sem decisão a treinar" };
}

const COLUNAS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

/** R6 — roque: rei e torres nas origens, com direito preservado. */
export function fabricarRoque(
  indice: number,
  aleatorio: Aleatorio,
  ctx: ContextoDaReceita,
): Tentativa {
  const curto = indice % 2 === 0;
  const direitos = curto ? "K" : "Q";
  const lance = curto ? "O-O" : "O-O-O";

  const tabuleiro = new Map<Square, Peca>([
    ["e1" as Square, peca("k", "w")],
    [(curto ? "h1" : "a1") as Square, peca("r", "w")],
  ]);

  // Rei preto longe, e um punhado de peças que não bloqueiam o roque.
  const proibidas = new Set(
    curto ? ["e1", "f1", "g1", "h1"] : ["a1", "b1", "c1", "d1", "e1"],
  );
  const casasLivres = TODAS_AS_CASAS.filter(
    (c) => !proibidas.has(c) && c[1] !== "1" && c[1] !== "2",
  );

  const reiPreto = aleatorio.escolher(casasLivres.filter((c) => Number(c[1]) >= 6));
  tabuleiro.set(reiPreto, peca("k", "b"));

  for (const p of [peca("n", "w"), peca("b", "b")]) {
    const candidatas = casasLivres.filter((c) => !tabuleiro.has(c));
    if (candidatas.length === 0) break;
    tabuleiro.set(aleatorio.escolher(candidatas), p);
  }

  const fen = montarFenComHistorico(tabuleiro, "w", direitos, "-");

  const item = receitaRegraEspecial({
    fen,
    lanceEsperado: lance,
    prompt: `As brancas jogam. Coloque o rei em segurança fazendo o roque ${curto ? "pequeno" : "grande"}.`,
    erro: {
      answer: curto ? "O-O-O" : "O-O",
      explanation: curto
        ? "Esse é o roque grande, do lado da dama. O enunciado pediu o lado do rei: O-O."
        : "Esse é o roque pequeno, do lado do rei. O enunciado pediu o lado da dama: O-O-O.",
    },
    explanation: {
      perceived: "Você identificou que rei e torre continuam nas casas de origem.",
      threat: "Rei no centro com colunas prestes a abrir é a causa mais comum de derrota rápida.",
      bestDefense: `${lance} tira o rei do centro e traz a torre para o jogo num único lance.`,
      reason: `As cinco condições estão satisfeitas: rei e torre na origem, nada entre eles, rei fora de xeque, e nenhuma casa do trajeto atacada.`,
      pattern: "Roque pequeno é O-O. Roque grande é O-O-O. Conta como um lance só.",
      transferableRule:
        "Em competição, mova o REI primeiro ao rocar. Tocar a torre antes pode obrigar você a jogar só a torre, pela regra da peça tocada.",
    },
    hints: [
      curto ? "O lado do rei é o da coluna h." : "O lado da dama é o da coluna a.",
      "A notação do roque não usa casas: usa a letra O e hífens.",
      `Escreve-se ${lance}.`,
    ],
    ctx,
  });

  return { item, motivo: item ? undefined : "roque ilegal na posição montada" };
}

/** R6 — en passant: peão adversário acabou de avançar duas casas. */
export function fabricarEnPassant(
  _indice: number,
  aleatorio: Aleatorio,
  ctx: ContextoDaReceita,
): Tentativa {
  // O peão preto avança de 7 para 5; o branco está ao lado, na quinta fileira.
  const colunaPreta = aleatorio.escolher(COLUNAS.slice(1, 7));
  const indiceColuna = COLUNAS.indexOf(colunaPreta);
  const colunaBranca = aleatorio.escolher(
    [COLUNAS[indiceColuna - 1]!, COLUNAS[indiceColuna + 1]!],
  );

  const tabuleiro = new Map<Square, Peca>([
    [`${colunaPreta}5` as Square, peca("p", "b")],
    [`${colunaBranca}5` as Square, peca("p", "w")],
  ]);

  const ocupadas = new Set([...tabuleiro.keys()]);
  const casasReis = TODAS_AS_CASAS.filter(
    (c) => !ocupadas.has(c) && c[1] !== "5" && c[1] !== "6" && c[1] !== "4",
  );
  const reiBranco = aleatorio.escolher(casasReis.filter((c) => Number(c[1]) <= 2));
  tabuleiro.set(reiBranco, peca("k", "w"));
  const reiPreto = aleatorio.escolher(casasReis.filter((c) => Number(c[1]) >= 7));
  tabuleiro.set(reiPreto, peca("k", "b"));

  const fen = montarFenComHistorico(tabuleiro, "w", "-", `${colunaPreta}6`);
  const lance = `${colunaBranca}x${colunaPreta}6`;

  const item = receitaRegraEspecial({
    fen,
    lanceEsperado: lance,
    prompt: `O peão preto acabou de jogar ${colunaPreta}7–${colunaPreta}5. As brancas jogam e capturam esse peão. Qual é o lance?`,
    erro: {
      answer: `${colunaBranca}6`,
      explanation:
        "Avançar deixa o peão preto passar. O direito de capturar en passant existe SÓ neste lance — no próximo, ele desaparece para sempre.",
    },
    explanation: {
      perceived:
        "Você reconheceu a configuração do en passant: peão que avançou duas casas parando ao lado do seu.",
      threat: `Se as brancas não capturarem agora, o peão de ${colunaPreta}5 passa e o direito some.`,
      bestDefense: `Do lado preto, a defesa seria ter jogado ${colunaPreta}7–${colunaPreta}6, avançando uma casa só.`,
      reason: `${lance} captura o peão de ${colunaPreta}5, mas o peão branco para em ${colunaPreta}6 — a casa que o peão preto atravessou. É a única captura do xadrez em que a peça capturada não está na casa de destino.`,
      pattern:
        "En passant: peão adversário avança duas casas e para ao seu lado; você captura como se ele tivesse avançado uma.",
      transferableRule:
        "O direito dura exatamente um lance. Em partida com relógio, decida en passant antes de qualquer outra coisa.",
    },
    hints: [
      "A captura de peão se escreve com a coluna de origem, um x e a casa de destino.",
      `Para onde vai o peão branco: ${colunaPreta}5 ou ${colunaPreta}6?`,
      `Ele para em ${colunaPreta}6, a casa atravessada pelo peão preto.`,
    ],
    ctx,
  });

  return { item, motivo: item ? undefined : "en passant ilegal na posição montada" };
}

/** R6 — promoção: peão na sétima, oitava livre. */
export function fabricarPromocao(
  _indice: number,
  aleatorio: Aleatorio,
  ctx: ContextoDaReceita,
): Tentativa {
  const coluna = aleatorio.escolher(COLUNAS);
  const tabuleiro = new Map<Square, Peca>([[`${coluna}7` as Square, peca("p", "w")]]);

  const proibidas = new Set([`${coluna}7`, `${coluna}8`]);
  const livres = TODAS_AS_CASAS.filter((c) => !proibidas.has(c));

  const reiBranco = aleatorio.escolher(livres.filter((c) => Number(c[1]) <= 3));
  tabuleiro.set(reiBranco, peca("k", "w"));

  // Rei preto longe da coluna de promoção, para não haver captura nem afogamento.
  const distantes = livres.filter(
    (c) => Number(c[1]) <= 4 && Math.abs(c.charCodeAt(0) - coluna.charCodeAt(0)) >= 3,
  );
  if (distantes.length === 0) return { item: null, motivo: "sem casa para o rei preto" };
  const reiPreto = aleatorio.escolher(distantes);
  if (
    Math.abs(reiPreto.charCodeAt(0) - reiBranco.charCodeAt(0)) <= 1 &&
    Math.abs(Number(reiPreto[1]) - Number(reiBranco[1])) <= 1
  ) {
    return { item: null, motivo: "reis adjacentes" };
  }
  tabuleiro.set(reiPreto, peca("k", "b"));

  const fen = montarFenComHistorico(tabuleiro, "w", "-", "-");
  const lance = `${coluna}8=Q`;

  const item = receitaRegraEspecial({
    fen,
    lanceEsperado: lance,
    prompt: "As brancas jogam. Promova o peão da forma mais forte.",
    erro: {
      answer: `${coluna}8=C`,
      explanation:
        "O cavalo é a mais fraca das quatro opções. Promover para cavalo só se justifica quando ele dá xeque, cria um garfo ou evita afogamento — nada disso acontece aqui.",
    },
    explanation: {
      perceived: "Você levou o peão à última fileira e teve de escolher a peça.",
      threat:
        "Não há ameaça aqui. O que existe é a tentação de promover no automático sem conferir afogamento.",
      bestDefense: "O rei preto está longe e continua com lances legais: não há afogamento.",
      reason: `${lance.replace("=Q", "=D")} é o mais forte. A dama vale 9 e nada nesta posição justifica abrir mão dela.`,
      pattern:
        "Promoção padrão é para dama. Subpromoção só com motivo concreto: xeque, garfo ou fugir do afogamento.",
      transferableRule:
        "Antes de promover com o adversário quase sem lances, confira se a nova dama afoga o rei dele. Empate por descuido custa meio ponto.",
    },
    hints: [
      "A promoção se escreve com a casa de destino, um sinal de igual e a inicial da peça.",
      "Em português, a dama é D.",
      `${coluna}8 igual a D.`,
    ],
    ctx,
  });

  return { item, motivo: item ? undefined : "promoção ilegal na posição montada" };
}

/** R1 — orientação: percorre o conjunto curado de perguntas. */
export function fabricarOrientacao(
  indice: number,
  _aleatorio: Aleatorio,
  ctx: ContextoDaReceita,
): Tentativa {
  const pergunta = PERGUNTAS_DE_ORIENTACAO[indice % PERGUNTAS_DE_ORIENTACAO.length];
  if (!pergunta) return { item: null, motivo: "sem pergunta de orientação" };
  return { item: receitaOrientacao(pergunta, ctx) };
}

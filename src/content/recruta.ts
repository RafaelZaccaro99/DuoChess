/**
 * Liga Recruta (0–800) — conteúdo do MVP.
 *
 * Todo exercício aqui é validado em CI contra o motor de regras
 * (`npm run content:validate`): FEN legal, gabarito coerente com a posição,
 * lance aceito realmente legal. Conteúdo com divergência não sobe.
 *
 * Convenção: SAN escrito em PORTUGUÊS (R D T B C). O avaliador aceita as duas
 * línguas na resposta do usuário.
 */

import type { LeagueInput } from "./schema";
import { START_FEN } from "@/domain/chess/board";

export const RECRUTA: LeagueInput = {
  id: "recruta",
  title: "Recruta",
  order: 1,
  ratingMin: 0,
  ratingMax: 800,
  focus:
    "Tabuleiro, coordenadas, movimento das peças, capturas, xeque, mate, afogamento, regras especiais e notação.",
  units: [
    // ───────────────────────────────────────────────── R1
    {
      id: "r1",
      title: "Tabuleiro e coordenadas",
      summary:
        "O tabuleiro é o sistema de endereços do xadrez. Quem não localiza casas de cabeça calcula devagar e erra por representação, não por tática.",
      masteryTest: "Nomear a cor de 10 casas e localizá-las sem olhar o tabuleiro, em menos de 30 segundos.",
      skills: [
        {
          id: "r1.localizar",
          title: "Localizar casas por coordenada",
          competency: "rules",
          description: "Encontrar qualquer casa pelo par coluna-fileira, das colunas a–h e fileiras 1–8.",
          sources: ["dagostini-basico", "maizelis-primer"],
          dependsOn: [],
          minPrerequisiteMastery: 60,
        },
        {
          id: "r1.cor-casa",
          title: "Cor da casa",
          competency: "rules",
          description:
            "Dizer se uma casa é clara ou escura sem olhar. Base da visualização e da geometria do bispo.",
          sources: ["dagostini-basico", "maizelis-primer"],
          dependsOn: ["r1.localizar"],
          minPrerequisiteMastery: 50,
        },
        {
          id: "r1.orientacao",
          title: "Orientação do tabuleiro",
          competency: "rules",
          description: "Montar o tabuleiro corretamente: casa clara no canto inferior direito de cada jogador.",
          sources: ["fide-laws", "dagostini-basico"],
          dependsOn: [],
          minPrerequisiteMastery: 60,
        },
      ],
      lessons: [
        {
          id: "r1.l1",
          title: "O tabuleiro, as coordenadas e as cores",
          concept:
            "O tabuleiro tem 64 casas: oito colunas, de **a** a **h**, e oito fileiras, de **1** a **8**. Toda casa tem um endereço formado pela coluna e pela fileira: e4, h8, c7.\n\nA casa **a1 é escura**. A partir dela, a cor alterna a cada passo. Isso significa que existe uma regra simples: se você somar a posição da coluna e a da fileira e o resultado for par, a casa é escura; se for ímpar, é clara.\n\nPara montar o tabuleiro corretamente, a **casa clara fica no canto inferior direito** de cada jogador. Se h1 estiver escura, o tabuleiro está girado.",
          demo: {
            fen: START_FEN,
            caption:
              "Posição inicial. Repare que h1, no canto inferior direito das brancas, é uma casa clara — é assim que se confere a orientação.",
            marks: [{ kind: "highlight", from: "h1", tone: "good" }],
          },
          exercises: [
            {
              slug: "r1.e1",
              phase: "GUIDED",
              type: "SQUARE_COLOR",
              prompt: "A casa **e4** é clara ou escura?",
              fen: START_FEN,
              sideToMove: "w",
              skillIds: ["r1.cor-casa"],
              difficulty: 2,
              ratingHint: 100,
              acceptedAnswer: { color: "light" },
              predictableErrors: [
                {
                  answer: "dark",
                  cause: "VISUALIZATION",
                  explanation:
                    "e4 parece escura para quem conta a partir de a1 sem alternar direito. e1 é escura; subindo uma casa por vez pela coluna e, você chega em e4 numa casa clara.",
                },
              ],
              explanation: {
                perceived: "Você foi localizar a casa e4 no tabuleiro — o primeiro passo está certo.",
                threat:
                  "Errar a cor de uma casa não custa nada agora, mas custa caro no final de bispos, quando metade do tabuleiro é inalcançável.",
                bestDefense:
                  "Conte a partir de a1, que é escura, alternando: a1 escura, a2 clara, a3 escura, a4 clara. Depois ande pela fileira do mesmo jeito.",
                reason: "e4 é clara. Coluna e é a quinta, fileira 4 é a quarta: 5 + 4 = 9, ímpar, logo clara.",
                pattern: "Soma par → escura. Soma ímpar → clara.",
                transferableRule:
                  "O bispo nunca muda a cor da casa. Saber a cor de cor é o que permite calcular finais de bispo sem tabuleiro.",
              },
              hints: [
                "Comece de a1. Que cor ela tem?",
                "Suba pela coluna e alternando as cores: e1, e2, e3, e4.",
                "e1 é escura. Alternando quatro vezes, e4 fica clara.",
              ],
              marks: [{ kind: "highlight", from: "e4", tone: "neutral" }],
              tags: ["square:e4"],
              expectedSeconds: 15,
              points: 5,
            },
            {
              slug: "r1.e2",
              phase: "INDEPENDENT",
              type: "SQUARE_COLOR",
              prompt: "A casa **h8** é clara ou escura?",
              fen: START_FEN,
              sideToMove: "w",
              skillIds: ["r1.cor-casa"],
              difficulty: 4,
              ratingHint: 150,
              acceptedAnswer: { color: "dark" },
              predictableErrors: [
                {
                  answer: "light",
                  cause: "VISUALIZATION",
                  explanation:
                    "h1 é clara, e muita gente assume que h8 também é. Mas a coluna alterna: da fileira 1 até a 8 há sete trocas de cor, um número ímpar.",
                },
              ],
              explanation: {
                perceived: "Você buscou h8, o canto oposto ao seu canto inferior direito.",
                threat: "Confundir os cantos é o erro que faz o tabuleiro ser montado ao contrário numa partida oficial.",
                bestDefense: "Lembre da diagonal longa: a1 e h8 são as pontas da mesma diagonal escura.",
                reason: "h8 é escura, como a1. As duas estão na diagonal a1–h8.",
                pattern: "Cantos opostos na mesma diagonal têm a mesma cor.",
                transferableRule:
                  "As duas diagonais longas, a1–h8 e a8–h1, têm cores diferentes. Um bispo só enxerga uma delas.",
              },
              hints: [
                "h8 está na mesma diagonal de qual outro canto?",
                "A diagonal a1–h8 tem uma única cor do começo ao fim.",
                "a1 é escura, e h8 está na mesma diagonal.",
              ],
              marks: [{ kind: "highlight", from: "h8", tone: "neutral" }],
              tags: ["square:h8"],
              expectedSeconds: 15,
              points: 6,
            },
            {
              slug: "r1.e3",
              phase: "MASTERY_TEST",
              type: "SQUARE_COLOR",
              prompt: "Sem contar casa por casa: **c7** é clara ou escura?",
              fen: START_FEN,
              sideToMove: "w",
              skillIds: ["r1.cor-casa", "r1.localizar"],
              difficulty: 7,
              ratingHint: 250,
              acceptedAnswer: { color: "dark" },
              predictableErrors: [
                {
                  answer: "light",
                  cause: "VISUALIZATION",
                  explanation:
                    "Quem conta a partir de c1 e se perde no meio do caminho costuma parar uma casa antes. c1 é escura e a fileira 7 mantém a cor: as duas são ímpares.",
                },
              ],
              explanation: {
                perceived: "Você aplicou a regra em vez de olhar o tabuleiro — é exatamente isso que treinamos aqui.",
                threat: "Sem esse automatismo, cada cálculo de final gasta tempo de relógio que você não tem.",
                bestDefense: "Coluna c é a terceira (ímpar), fileira 7 é ímpar. Ímpar + ímpar = par → escura.",
                reason: "c7 é escura.",
                pattern: "Duas coordenadas com a mesma paridade → casa escura. Paridades diferentes → casa clara.",
                transferableRule:
                  "Essa regra vale para o tabuleiro inteiro e é a base para calcular oposição em finais de rei e peão.",
              },
              hints: [
                "Não conte casa por casa. Use a paridade.",
                "c é a terceira coluna. 7 é a sétima fileira.",
                "Ímpar + ímpar dá par, e soma par significa casa escura.",
              ],
              marks: [],
              tags: ["square:c7"],
              expectedSeconds: 20,
              points: 8,
            },
            {
              slug: "r1.e4",
              phase: "INDEPENDENT",
              type: "NOTATION_READ",
              prompt:
                "Você senta com as brancas. Qual casa fica no seu canto **inferior direito** quando o tabuleiro está montado corretamente?",
              fen: START_FEN,
              sideToMove: "w",
              skillIds: ["r1.orientacao", "r1.localizar"],
              difficulty: 5,
              ratingHint: 150,
              acceptedAnswer: { choice: "h1" },
              predictableErrors: [
                {
                  answer: "a1",
                  cause: "RULE",
                  explanation:
                    "a1 fica no canto inferior ESQUERDO das brancas. É também uma casa escura — se ela estivesse à direita, o tabuleiro estaria girado.",
                },
                {
                  answer: "h8",
                  cause: "RULE",
                  explanation:
                    "h8 é o canto superior direito visto pelas brancas. É o canto inferior direito de quem joga com as pretas.",
                },
              ],
              explanation: {
                perceived: "Você relacionou coordenada e posição física no tabuleiro.",
                threat:
                  "Um tabuleiro girado inverte todas as diagonais e todos os roques. É um erro que aparece em torneio escolar toda semana.",
                bestDefense: "Confira sempre a casa clara à direita antes do primeiro lance.",
                reason: "h1 é o canto inferior direito das brancas, e é uma casa clara.",
                pattern: "Casa clara no canto inferior direito de cada jogador.",
                transferableRule:
                  "Se h1 estiver escura, o tabuleiro está errado — chame o árbitro antes de começar, não no meio da partida.",
              },
              hints: [
                "A coluna h é a mais à direita, do ponto de vista das brancas.",
                "A fileira 1 é a mais próxima de quem joga de brancas.",
                "Junte a coluna mais à direita com a fileira mais próxima.",
              ],
              marks: [{ kind: "highlight", from: "h1", tone: "good" }],
              tags: [],
              expectedSeconds: 20,
              points: 6,
            },
          ],
        },
      ],
    },

    // ───────────────────────────────────────────────── R2
    {
      id: "r2",
      title: "Movimento das peças",
      summary:
        "Saber para onde a peça vai é diferente de saber o que ela ataca. A segunda pergunta é a que ganha partidas.",
      masteryTest: "Listar todas as casas atacadas por uma peça, com bloqueios, sem erro e sem mover as peças.",
      skills: [
        {
          id: "r2.cavalo",
          title: "Movimento do cavalo",
          competency: "rules",
          description: "Duas casas numa direção e uma perpendicular. É a única peça que salta.",
          sources: ["fide-laws", "dagostini-basico", "maizelis-primer"],
          dependsOn: ["r1.localizar"],
          minPrerequisiteMastery: 50,
        },
        {
          id: "r2.linhas",
          title: "Peças de linha: torre, bispo e dama",
          competency: "rules",
          description: "Movem-se por linhas, colunas e diagonais, e são detidas pela primeira peça no caminho.",
          sources: ["fide-laws", "dagostini-basico", "maizelis-primer"],
          dependsOn: ["r1.localizar"],
          minPrerequisiteMastery: 50,
        },
        {
          id: "r2.casas-atacadas",
          title: "Casas atacadas",
          competency: "rules",
          description:
            "Distinguir onde a peça pode ir de onde a peça ataca. Um peão em e4 ataca d5 e f5, mas anda para e5.",
          sources: ["maizelis-primer", "dagostini-basico"],
          dependsOn: ["r2.cavalo", "r2.linhas"],
          minPrerequisiteMastery: 55,
        },
      ],
      lessons: [
        {
          id: "r2.l1",
          title: "O cavalo: a peça que salta",
          concept:
            "O cavalo move-se **duas casas numa direção e uma perpendicular**, formando um L. É a única peça que **salta** sobre as outras: nada bloqueia um cavalo.\n\nDo centro, um cavalo alcança oito casas. Do canto, apenas duas. Por isso existe o velho conselho: *cavalo na borda vive na sombra*.\n\nRepare numa propriedade útil: o cavalo **sempre muda a cor da casa** a cada lance. De uma casa clara ele vai para uma escura, e vice-versa.",
          demo: {
            fen: "4k3/8/8/4N3/8/8/8/4K3 w - - 0 1",
            caption: "Um cavalo em e5 alcança oito casas: c4, c6, d3, d7, f3, f7, g4 e g6.",
            marks: [
              { kind: "arrow", from: "e5", to: "d7", tone: "good" },
              { kind: "arrow", from: "e5", to: "f7", tone: "good" },
              { kind: "arrow", from: "e5", to: "c6", tone: "good" },
              { kind: "arrow", from: "e5", to: "g6", tone: "good" },
            ],
          },
          exercises: [
            {
              slug: "r2.e1",
              phase: "GUIDED",
              type: "ATTACKED_SQUARES",
              prompt: "Marque **todas** as casas atacadas pelo cavalo de e5.",
              fen: "4k3/8/8/4N3/8/8/8/4K3 w - - 0 1",
              sideToMove: "w",
              skillIds: ["r2.cavalo", "r2.casas-atacadas"],
              difficulty: 3,
              ratingHint: 200,
              acceptedAnswer: { squares: ["c4", "c6", "d3", "d7", "f3", "f7", "g4", "g6"] },
              predictableErrors: [
                {
                  answer: "e6",
                  cause: "RULE",
                  explanation:
                    "e6 está a uma casa em linha reta. O cavalo nunca anda em linha reta: ele sempre faz duas mais uma.",
                },
                {
                  answer: "d6",
                  cause: "RULE",
                  explanation:
                    "d6 está a uma casa na diagonal. Também não é movimento de cavalo — isso é movimento de rei.",
                },
              ],
              explanation: {
                perceived: "Você procurou o padrão em L a partir de e5.",
                threat:
                  "Deixar de ver uma casa de cavalo é a origem mais comum de garfo sofrido nos primeiros meses de xadrez.",
                bestDefense:
                  "Percorra as oito direções de forma organizada, sempre no mesmo sentido: duas para cima e uma para o lado, depois duas para o lado e uma para cima, e assim por diante.",
                reason:
                  "Do centro, o cavalo alcança oito casas: c4, c6, d3, d7, f3, f7, g4 e g6. Todas escuras — e5 é clara, e o cavalo troca de cor a cada lance.",
                pattern: "Cavalo no centro: oito casas. Cavalo no canto: duas.",
                transferableRule:
                  "Antes de jogar, verifique se algum cavalo adversário alcança uma casa que ataca duas peças suas ao mesmo tempo.",
              },
              hints: [
                "O cavalo faz duas casas numa direção e uma perpendicular.",
                "Percorra as direções em ordem: cima, direita, baixo, esquerda — duas casas e depois uma.",
                "São oito casas no total, e todas têm a cor oposta à de e5.",
              ],
              marks: [],
              tags: ["from:e5"],
              expectedSeconds: 60,
              points: 10,
            },
            {
              slug: "r2.e2",
              phase: "INDEPENDENT",
              type: "LEGAL_MOVES",
              prompt: "O cavalo está no canto, em a1. Marque todas as casas para onde ele **pode ir**.",
              fen: "4k3/8/8/8/8/8/8/N3K3 w - - 0 1",
              sideToMove: "w",
              skillIds: ["r2.cavalo"],
              difficulty: 5,
              ratingHint: 250,
              acceptedAnswer: { squares: ["b3", "c2"] },
              predictableErrors: [
                {
                  answer: "b2",
                  cause: "RULE",
                  explanation: "b2 é uma casa na diagonal, movimento de rei ou bispo. O cavalo não vai para lá.",
                },
              ],
              explanation: {
                perceived: "Você aplicou o padrão em L a partir do canto.",
                threat:
                  "Peça no canto é peça quase parada. Quem coloca cavalo na borda sem motivo joga com uma peça a menos.",
                bestDefense: "Do canto só existem duas saídas: b3 e c2. Metade dos Ls sai do tabuleiro.",
                reason: "Do canto a1, o cavalo alcança apenas b3 e c2.",
                pattern: "Cavalo no canto controla 2 casas; no centro, 8. A diferença é quatro vezes.",
                transferableRule:
                  "Na abertura, desenvolva os cavalos para o centro — normalmente f3 e c3 nas brancas, f6 e c6 nas pretas.",
              },
              hints: [
                "Quantas das oito direções ainda cabem no tabuleiro a partir de a1?",
                "Tente duas casas para cima e uma para o lado.",
                "Só sobram duas casas.",
              ],
              marks: [],
              tags: ["from:a1"],
              expectedSeconds: 40,
              points: 10,
            },
          ],
        },
        {
          id: "r2.l2",
          title: "Peças de linha e o que as detém",
          concept:
            "Torre, bispo e dama percorrem linhas inteiras — mas **param na primeira peça do caminho**. Se essa peça é adversária, elas podem capturá-la. Se é sua, elas param antes.\n\nHá uma distinção que quase todo iniciante ignora: a peça **ataca** a casa onde está uma peça sua também. Ela não pode ir para lá, mas está **defendendo** aquela peça. Ataque e movimento não são a mesma lista.",
          demo: {
            fen: "4k3/8/3P4/8/3R4/8/8/4K3 w - - 0 1",
            caption:
              "A torre de d4 alcança toda a coluna d até o peão de d6 — e defende esse peão. Além dele, não enxerga nada.",
            marks: [
              { kind: "arrow", from: "d4", to: "d6", tone: "good" },
              { kind: "arrow", from: "d4", to: "h4", tone: "neutral" },
            ],
          },
          exercises: [
            {
              slug: "r2.e3",
              phase: "MASTERY_TEST",
              type: "ATTACKED_SQUARES",
              prompt:
                "Marque **todas** as casas atacadas pela torre de d4. Atenção: uma peça branca também ocupa uma casa atacada.",
              fen: "4k3/8/3P4/8/3R4/8/8/4K3 w - - 0 1",
              sideToMove: "w",
              skillIds: ["r2.linhas", "r2.casas-atacadas"],
              difficulty: 8,
              ratingHint: 400,
              acceptedAnswer: {
                squares: ["a4", "b4", "c4", "e4", "f4", "g4", "h4", "d1", "d2", "d3", "d5", "d6"],
              },
              predictableErrors: [
                {
                  answer: "d7",
                  cause: "RULE",
                  explanation:
                    "d7 fica atrás do peão de d6. A torre para na primeira peça que encontra e não enxerga o que vem depois.",
                },
                {
                  answer: "e5",
                  cause: "RULE",
                  explanation: "e5 está na diagonal. Torre não anda em diagonal — isso é bispo.",
                },
              ],
              explanation: {
                perceived:
                  "Você percorreu a coluna e a fileira da torre e teve que decidir o que fazer com o próprio peão.",
                threat:
                  "Quem exclui as casas ocupadas por peças próprias deixa de contar defensores — e troca peças achando que estava ganhando material.",
                bestDefense:
                  "A torre ataca d6 (onde está o peão branco), o que significa que **defende** esse peão. E para ali: d7 e d8 estão fora do seu alcance.",
                reason:
                  "São 12 casas: toda a fileira 4 exceto d4, mais d1, d2, d3, d5 e d6. A partir de d6 a coluna está bloqueada.",
                pattern:
                  "Peça de linha ataca até a primeira peça inclusive. Se a peça é sua, ela está sendo defendida.",
                transferableRule:
                  "Antes de trocar peças, conte atacantes e defensores de uma casa. Peça própria no caminho conta como defensor.",
              },
              hints: [
                "Comece pela fileira 4, de a4 até h4.",
                "Agora a coluna d. Onde a torre é obrigada a parar?",
                "O peão de d6 é atacado (defendido) pela torre, mas d7 e d8 não são alcançáveis.",
              ],
              marks: [],
              tags: ["from:d4"],
              expectedSeconds: 90,
              points: 14,
            },
          ],
        },
      ],
    },

    // ───────────────────────────────────────────────── R3
    {
      id: "r3",
      title: "Capturas e valor das peças",
      summary:
        "Capturar é fácil. Decidir se a captura é boa exige contar defensores e comparar valor — e é aí que se ganha ou perde material.",
      masteryTest: "Identificar a captura vantajosa numa posição com peça indefesa e peça defendida.",
      skills: [
        {
          id: "r3.captura",
          title: "Executar capturas",
          competency: "rules",
          description: "Ocupar a casa da peça adversária, retirando-a do tabuleiro.",
          sources: ["fide-laws", "dagostini-basico"],
          dependsOn: ["r2.casas-atacadas"],
          minPrerequisiteMastery: 55,
        },
        {
          id: "r3.valor",
          title: "Valor relativo das peças",
          competency: "tactics",
          description: "Peão 1, cavalo 3, bispo 3, torre 5, dama 9. Referência, não lei.",
          sources: ["capablanca-fundamentals", "dagostini-basico"],
          dependsOn: ["r3.captura"],
          minPrerequisiteMastery: 50,
        },
        {
          id: "r3.indefesa",
          title: "Peça indefesa",
          competency: "tactics",
          description: "Reconhecer peças sem defensor — a matéria-prima de quase toda tática.",
          sources: ["maizelis-primer", "capablanca-fundamentals"],
          dependsOn: ["r3.valor"],
          minPrerequisiteMastery: 50,
        },
      ],
      lessons: [
        {
          id: "r3.l1",
          title: "Capturar o que está solto",
          concept:
            "Uma peça **indefesa** é uma peça que, se capturada, não é recapturada. Ela é o alvo mais barato do tabuleiro.\n\nA referência de valor é: peão 1, cavalo 3, bispo 3, torre 5 e dama 9. O rei não tem valor porque não pode ser trocado.\n\nMas o valor é uma **referência**, não uma lei: um cavalo bem posto no centro pode valer mais que uma torre parada. Por enquanto, use os números — a exceção vem depois do domínio da regra.",
          demo: {
            fen: "4k3/8/8/3q4/8/4N3/8/4K3 w - - 0 1",
            caption: "A dama preta em d5 está indefesa, e o cavalo de e3 alcança d5.",
            marks: [
              { kind: "arrow", from: "e3", to: "d5", tone: "good" },
              { kind: "highlight", from: "d5", tone: "bad" },
            ],
          },
          exercises: [
            {
              slug: "r3.e1",
              phase: "GUIDED",
              type: "CAPTURE",
              prompt: "As brancas jogam. Ganhe material com um único lance.",
              fen: "4k3/8/8/3q4/8/4N3/8/4K3 w - - 0 1",
              sideToMove: "w",
              skillIds: ["r3.captura", "r3.indefesa"],
              difficulty: 3,
              ratingHint: 300,
              acceptedAnswer: { moves: ["Cxd5"] },
              predictableErrors: [
                {
                  answer: "Cg4",
                  cause: "CANDIDATE_IGNORED",
                  explanation:
                    "Cg4 é um lance legal, mas ignora a captura disponível. Antes de melhorar uma peça, verifique sempre se há captura vantajosa.",
                },
                {
                  answer: "Cc4",
                  cause: "CANDIDATE_IGNORED",
                  explanation:
                    "Cc4 aproxima o cavalo do centro, mas deixa a dama preta viva. Capturas grátis vêm primeiro.",
                },
              ],
              explanation: {
                perceived: "Você notou que o cavalo de e3 alcança a dama preta.",
                threat: "A dama preta em d5 não tem nenhum defensor: se ela for capturada, ninguém recaptura.",
                bestDefense: "Não existe defesa depois de Cxd5 — as pretas já perderam a dama.",
                reason:
                  "Cxd5 ganha uma dama (9) por nada. Foi possível porque o cavalo de e3 ataca d5 e nada defende essa casa.",
                pattern: "Peça indefesa ao alcance de uma peça sua: capture.",
                transferableRule:
                  "A cada lance do adversário, pergunte: sobrou alguma peça sem defensor? Essa é a pergunta que mais ganha material até 1200.",
              },
              hints: [
                "Uma peça preta está ao alcance de uma peça branca. Qual?",
                "O cavalo de e3 ataca oito casas. Alguma delas tem peça preta?",
                "Cavalo de e3 alcança d5, onde está a dama — e ninguém a defende.",
              ],
              marks: [],
              tags: [],
              expectedSeconds: 30,
              points: 10,
            },
            {
              slug: "r3.e2",
              phase: "INDEPENDENT",
              type: "PIECE_VALUE",
              prompt:
                "Você pode capturar uma **torre** adversária com seu **cavalo**, e o adversário recaptura o cavalo em seguida. Essa troca é favorável para você?",
              fen: START_FEN,
              sideToMove: "w",
              skillIds: ["r3.valor"],
              difficulty: 5,
              ratingHint: 350,
              acceptedAnswer: { choice: "sim" },
              predictableErrors: [
                {
                  answer: "nao",
                  cause: "EVALUATION",
                  explanation:
                    "Você deu a mesma importância às duas peças. Torre vale 5 e cavalo vale 3: trocar cavalo por torre ganha 2 pontos, o chamado ganho de qualidade.",
                },
                {
                  answer: "tanto faz",
                  cause: "EVALUATION",
                  explanation:
                    "Não é indiferente. Dois pontos de material é normalmente suficiente para ganhar um final com técnica.",
                },
              ],
              explanation: {
                perceived: "Você comparou o valor das duas peças envolvidas na troca.",
                threat: "Quem trata todas as peças como equivalentes troca torre por cavalo achando que empatou.",
                bestDefense: "Antes de trocar, some o que sai e o que entra: 5 − 3 = +2 para você.",
                reason: "Sim. Cavalo (3) por torre (5) é um ganho de 2 pontos — o chamado ganho de qualidade.",
                pattern: "Peão 1 · cavalo 3 · bispo 3 · torre 5 · dama 9.",
                transferableRule:
                  "Ganho de qualidade é vantagem real, mas só se converte com técnica. Vale mais em posições abertas, onde a torre tem colunas.",
              },
              hints: [
                "Quanto vale um cavalo? E uma torre?",
                "Faça a conta: o que você ganha menos o que você perde.",
                "5 menos 3 é positivo para você.",
              ],
              marks: [],
              tags: [],
              expectedSeconds: 25,
              points: 8,
            },
            {
              slug: "r3.e3",
              phase: "MASTERY_TEST",
              type: "CAPTURE",
              prompt:
                "As brancas jogam. A dama tem duas capturas possíveis. Só uma delas ganha material.",
              fen: "4k3/8/2p5/3r4/7n/8/8/4K2Q w - - 0 1",
              sideToMove: "w",
              skillIds: ["r3.captura", "r3.valor", "r3.indefesa"],
              difficulty: 8,
              ratingHint: 600,
              acceptedAnswer: { moves: ["Dxh4"] },
              predictableErrors: [
                {
                  answer: "Dxd5",
                  cause: "EVALUATION",
                  explanation:
                    "A torre vale mais que o cavalo, e por isso Dxd5 parece melhor. Mas a torre de d5 está DEFENDIDA pelo peão de c6: depois de cxd5 você trocou dama (9) por torre (5) e perdeu 4 pontos. Valor da peça capturada não decide nada sozinho — quem decide é o saldo depois da recaptura.",
                },
              ],
              explanation: {
                perceived:
                  "Você identificou as duas peças pretas ao alcance da dama: a torre de d5 e o cavalo de h4.",
                threat:
                  "A armadilha é a torre. Ela vale mais, está na diagonal da dama e parece o alvo óbvio — mas o peão de c6 a defende.",
                bestDefense:
                  "Dxh4 leva o cavalo de graça: nada preto defende h4. É a captura que aumenta o saldo.",
                reason:
                  "Dxh4 ganha 3 pontos limpos. Dxd5 seria respondida por cxd5 e custaria 4 pontos: dama por torre.",
                pattern:
                  "Antes de capturar, conte os defensores da casa de destino. Peça defendida exige comparar o saldo da troca inteira, não o valor da primeira peça.",
                transferableRule:
                  "Peça indefesa é alvo. Peça defendida é uma troca — e troca só vale a pena quando o saldo é seu.",
              },
              hints: [
                "As duas capturas da dama são Dxd5 e Dxh4. Qual dessas casas tem defensor?",
                "Um peão preto captura na diagonal, avançando para baixo. Qual casa o peão de c6 defende?",
                "c6 defende d5. Então capturar a torre custa a dama; capturar o cavalo não custa nada.",
              ],
              marks: [{ kind: "arrow", from: "c6", to: "d5", tone: "bad" }],
              tags: [],
              expectedSeconds: 90,
              points: 18,
            },
          ],
        },
      ],
    },

    // ───────────────────────────────────────────────── R4
    {
      id: "r4",
      title: "Xeque e resposta ao xeque",
      summary:
        "Xeque é um ataque ao rei que precisa ser resolvido imediatamente. Existem três respostas possíveis — e nem sempre as três estão disponíveis.",
      masteryTest: "Encontrar a única defesa legal numa posição de xeque com uma só saída.",
      skills: [
        {
          id: "r4.reconhecer",
          title: "Reconhecer o xeque",
          competency: "rules",
          description: "Identificar quando o rei está atacado e por qual peça.",
          sources: ["fide-laws", "dagostini-basico", "maizelis-primer"],
          dependsOn: ["r2.casas-atacadas"],
          minPrerequisiteMastery: 55,
        },
        {
          id: "r4.tres-respostas",
          title: "As três respostas ao xeque",
          competency: "rules",
          description: "Capturar a peça atacante, bloquear a linha ou mover o rei — nessa ordem de busca.",
          sources: ["fide-laws", "dagostini-basico", "maizelis-primer"],
          dependsOn: ["r4.reconhecer"],
          minPrerequisiteMastery: 55,
        },
        {
          id: "r4.xeque-cavalo",
          title: "Xeque de cavalo não se bloqueia",
          competency: "rules",
          description: "O cavalo salta: entre ele e o rei não existe linha para interpor peça.",
          sources: ["fide-laws", "maizelis-primer"],
          dependsOn: ["r4.tres-respostas"],
          minPrerequisiteMastery: 55,
        },
      ],
      lessons: [
        {
          id: "r4.l1",
          title: "As três respostas ao xeque",
          concept:
            "Diante de um xeque, procure nesta ordem:\n\n1. **Capturar** a peça que dá o xeque;\n2. **Bloquear** a linha do ataque, interpondo uma peça;\n3. **Mover** o rei para uma casa segura.\n\nEssa ordem não é arbitrária: capturar resolve o problema e ganha material; bloquear resolve mas pode custar a peça interposta; mover o rei quase sempre custa o direito de roque.\n\nDuas exceções importantes: **xeque de cavalo não pode ser bloqueado**, porque o cavalo salta. E **xeque duplo obriga a mover o rei**, porque não existe lance que resolva dois ataques de uma vez.",
          demo: {
            fen: "4k3/4r3/5N2/8/8/8/8/K7 b - - 0 1",
            caption:
              "O cavalo de f6 dá xeque ao rei de e8. Não há o que bloquear e nada alcança f6: só restam lances de rei.",
            marks: [{ kind: "arrow", from: "f6", to: "e8", tone: "bad" }],
          },
          exercises: [
            {
              slug: "r4.e1",
              phase: "GUIDED",
              type: "IS_MATE_OR_STALEMATE",
              prompt: "As pretas jogam. Esta posição é xeque, mate, afogamento ou nenhum dos três?",
              fen: "4k3/4r3/5N2/8/8/8/8/K7 b - - 0 1",
              sideToMove: "b",
              skillIds: ["r4.reconhecer"],
              difficulty: 3,
              ratingHint: 250,
              acceptedAnswer: { choice: "xeque" },
              predictableErrors: [
                {
                  answer: "mate",
                  cause: "RULE",
                  explanation:
                    "Não é mate: o rei preto ainda tem casas livres. Mate exige que **nenhuma** resposta legal exista.",
                },
                {
                  answer: "afogamento",
                  cause: "RULE",
                  explanation:
                    "Afogamento é quando o jogador **não está em xeque** e não tem lance legal. Aqui o rei está atacado.",
                },
              ],
              explanation: {
                perceived: "Você viu que o cavalo de f6 alcança e8.",
                threat: "O cavalo ataca o rei preto. As pretas são obrigadas a resolver isso neste lance.",
                bestDefense: "O rei tem saídas: d8, f8 e f7 continuam livres.",
                reason: "É xeque, e não mate, porque existem respostas legais.",
                pattern: "Rei atacado + existe resposta legal = xeque. Rei atacado + nenhuma resposta = mate.",
                transferableRule:
                  "Antes de anunciar mate, confira as três respostas: capturar, bloquear, mover. Se alguma funciona, é só xeque.",
              },
              hints: [
                "Que peça branca alcança a casa do rei preto?",
                "O cavalo de f6 ataca d5, d7, e4, e8, g4, g8, h5 e h7.",
                "O rei está atacado — mas ele ainda tem para onde ir.",
              ],
              marks: [],
              tags: [],
              expectedSeconds: 30,
              points: 8,
            },
            {
              slug: "r4.e2",
              phase: "INDEPENDENT",
              type: "CHECK_ESCAPE",
              prompt:
                "As pretas jogam e estão em xeque do cavalo de f6. Encontre uma resposta legal.",
              fen: "4k3/4r3/5N2/8/8/8/8/K7 b - - 0 1",
              sideToMove: "b",
              skillIds: ["r4.reconhecer", "r4.tres-respostas", "r4.xeque-cavalo"],
              difficulty: 5,
              ratingHint: 350,
              acceptedAnswer: { moves: ["Rd8", "Rf8", "Rf7"] },
              predictableErrors: [
                {
                  answer: "Te6",
                  cause: "PATTERN",
                  explanation:
                    "Você tentou bloquear. Mas o cavalo **salta**: não existe casa entre f6 e e8 para interpor peça. Xeque de cavalo só se resolve capturando o cavalo ou movendo o rei.",
                },
                {
                  answer: "Tf7",
                  cause: "PATTERN",
                  explanation:
                    "Mesma ideia: interpor a torre não resolve nada contra um cavalo, e ainda entrega a torre.",
                },
              ],
              explanation: {
                perceived: "Você procurou uma saída para o xeque de cavalo.",
                threat: "O cavalo de f6 ataca e8. Se as pretas não resolverem agora, a posição é ilegal.",
                bestDefense:
                  "Capturar não dá: nada preto alcança f6. Bloquear não existe contra cavalo. Sobra mover o rei: d8, f8 ou f7.",
                reason:
                  "As casas d7 e g7 estão atacadas pelo próprio cavalo, e e7 está ocupada pela torre preta. Restam d8, f8 e f7.",
                pattern: "Xeque de cavalo: capturar ou mover. Nunca bloquear.",
                transferableRule:
                  "Antes de mover o rei, confira quais casas o atacante já controla — o cavalo costuma cobrir justamente a casa de fuga natural.",
              },
              hints: [
                "Comece pelas três respostas: dá para capturar o cavalo? Dá para bloquear?",
                "Cavalo salta. Bloquear está fora de questão, e nenhuma peça preta alcança f6.",
                "Só restam lances de rei. Cuidado: d7 e g7 são atacadas pelo próprio cavalo.",
              ],
              marks: [],
              tags: [],
              expectedSeconds: 45,
              points: 12,
            },
            {
              slug: "r4.e3",
              phase: "MASTERY_TEST",
              type: "CHECK_ESCAPE",
              prompt: "As pretas jogam. Existe **uma única** resposta legal. Encontre-a.",
              fen: "4R2k/6pp/8/2b5/8/8/8/K7 b - - 0 1",
              sideToMove: "b",
              skillIds: ["r4.tres-respostas"],
              difficulty: 8,
              ratingHint: 550,
              acceptedAnswer: { moves: ["Bf8"] },
              predictableErrors: [
                {
                  answer: "Be7",
                  cause: "VISUALIZATION",
                  explanation:
                    "Be7 bloqueia a **coluna** e, mas o xeque vem pela **oitava fileira**. Para bloquear, o bispo precisa parar entre e8 e h8 — ou seja, em f8 ou g8.",
                },
                {
                  answer: "Bd6",
                  cause: "VISUALIZATION",
                  explanation:
                    "Bd6 sai da diagonal que leva a f8 e não interfere na oitava fileira. O xeque continua.",
                },
              ],
              explanation: {
                perceived: "Você identificou que a torre de e8 ataca o rei de h8 ao longo da oitava fileira.",
                threat: "A torre dá xeque por e8–f8–g8–h8. Os peões de g7 e h7 tapam as saídas do rei.",
                bestDefense:
                  "Bf8 é a única. O bispo de c5 chega a f8 pela diagonal c5–d6–e7–f8 e se planta exatamente na linha do xeque.",
                reason:
                  "Capturar a torre é impossível — nada preto alcança e8. Mover o rei também: g8 está atacada pela torre, e g7 e h7 estão ocupadas pelos próprios peões. Sobra bloquear, e só f8 e g8 servem; o bispo só alcança f8.",
                pattern:
                  "Para bloquear, a peça precisa parar **entre** o atacante e o rei, na mesma linha do ataque.",
                transferableRule:
                  "Rei preso atrás dos próprios peões na última fileira é o motivo do mate de corredor. Abrir uma casa de fuga é profilaxia barata.",
              },
              hints: [
                "Por qual linha vem o xeque: coluna, fileira ou diagonal?",
                "Vem pela oitava fileira. Que casas ficam entre a torre de e8 e o rei de h8?",
                "f8 e g8. O bispo de c5 alcança uma delas pela diagonal c5–d6–e7–f8.",
              ],
              marks: [{ kind: "arrow", from: "e8", to: "h8", tone: "bad" }],
              tags: [],
              expectedSeconds: 90,
              points: 18,
            },
          ],
        },
      ],
    },

    // ───────────────────────────────────────────────── R5
    {
      id: "r5",
      title: "Mate e afogamento",
      summary:
        "Mate termina a partida. Afogamento a empata. A diferença é uma casa livre — e custa meio ponto por descuido.",
      masteryTest: "Dar mate em 1 em oito posições novas e distinguir mate de afogamento sem hesitar.",
      skills: [
        {
          id: "r5.mate-em-1",
          title: "Mate em 1",
          competency: "tactics",
          description: "Encontrar o lance que ataca o rei sem deixar resposta legal.",
          sources: ["dagostini-basico", "maizelis-primer"],
          dependsOn: ["r4.tres-respostas"],
          minPrerequisiteMastery: 60,
        },
        {
          id: "r5.afogamento",
          title: "Reconhecer afogamento",
          competency: "rules",
          description: "Jogador da vez sem lance legal e sem estar em xeque: empate.",
          sources: ["fide-laws", "silman-endgame"],
          dependsOn: ["r4.reconhecer"],
          minPrerequisiteMastery: 55,
        },
      ],
      lessons: [
        {
          id: "r5.l1",
          title: "Mate, afogamento e a casa que faz a diferença",
          concept:
            "**Xeque-mate**: o rei está atacado e nenhuma resposta legal existe. A partida acaba na hora.\n\n**Afogamento**: o jogador da vez **não está em xeque**, mas não tem nenhum lance legal. O resultado é empate — meio ponto para quem estava perdendo.\n\nO afogamento é o erro técnico mais caro do xadrez de iniciante. Ele quase sempre aparece quando o lado que está ganhando aproxima peças sem verificar se sobrou casa para o rei adversário.\n\nRegra prática: quando estiver muito à frente, antes de cada lance pergunte *o adversário ainda tem lance legal?*",
          demo: {
            fen: "7k/5Q2/6K1/8/8/8/8/8 b - - 0 1",
            caption:
              "As pretas jogam e não têm lance legal — mas também não estão em xeque. Afogamento: empate, com uma dama de desvantagem.",
            marks: [{ kind: "highlight", from: "h8", tone: "bad" }],
          },
          exercises: [
            {
              slug: "r5.e1",
              phase: "GUIDED",
              type: "IS_MATE_OR_STALEMATE",
              prompt: "As pretas jogam. Classifique a posição.",
              fen: "7k/5Q2/6K1/8/8/8/8/8 b - - 0 1",
              sideToMove: "b",
              skillIds: ["r5.afogamento"],
              difficulty: 3,
              ratingHint: 400,
              acceptedAnswer: { choice: "afogamento" },
              predictableErrors: [
                {
                  answer: "mate",
                  cause: "RULE",
                  explanation:
                    "Para ser mate, o rei precisa estar **atacado**. A dama de f7 não ataca h8: nem a fileira, nem a coluna, nem a diagonal de f7 passam por h8.",
                },
                {
                  answer: "xeque",
                  cause: "RULE",
                  explanation:
                    "O rei preto não está sendo atacado por nenhuma peça branca. Sem ataque ao rei, não há xeque.",
                },
              ],
              explanation: {
                perceived: "Você percebeu que as pretas não têm para onde ir.",
                threat:
                  "A dama de f7 cobre g7 e g8, e o rei de g6 cobre h7 — as três únicas saídas do rei preto.",
                bestDefense:
                  "Do lado branco, a defesa contra o próprio erro seria ter jogado o rei para g5 ou a dama para outra casa, deixando uma saída antes de dar o mate.",
                reason:
                  "É afogamento: as pretas não estão em xeque e não têm nenhum lance legal. Empate, com uma dama a menos.",
                pattern: "Sem xeque + sem lance legal = empate por afogamento.",
                transferableRule:
                  "Com dama contra rei, nunca aproxime a dama a uma casa de cavalo do rei adversário sem que o seu rei já esteja cobrindo a casa de fuga.",
              },
              hints: [
                "Primeiro: o rei preto está sendo atacado por alguma peça branca?",
                "Não está. Agora: ele tem alguma casa livre?",
                "g7, g8 e h7 estão todas cobertas. Sem xeque e sem lance legal, o nome disso é afogamento.",
              ],
              marks: [],
              tags: [],
              expectedSeconds: 40,
              points: 10,
            },
            {
              slug: "r5.e2",
              phase: "INDEPENDENT",
              type: "BEST_MOVE",
              prompt: "As brancas jogam e dão mate em 1.",
              fen: "6k1/5ppp/8/8/8/8/8/R3K2R w KQ - 0 1",
              sideToMove: "w",
              skillIds: ["r5.mate-em-1"],
              difficulty: 5,
              ratingHint: 400,
              acceptedAnswer: { moves: ["Ta8#"] },
              predictableErrors: [
                {
                  answer: "Th8+",
                  cause: "CALCULATION_STOPPED",
                  explanation:
                    "Th8+ é xeque, mas o rei simplesmente captura: Rxh8. A torre de h8 está indefesa. Xeque não é sinônimo de mate.",
                },
                {
                  answer: "Te8+",
                  cause: "CALCULATION_STOPPED",
                  explanation:
                    "Te8+ dá xeque, mas o rei foge para h7? Não — melhor: a torre em e8 fica ao alcance do rei? Não. O problema é outro: o rei tem g7... que está ocupada. Confira com calma qual torre chega a uma casa segura na oitava fileira.",
                },
              ],
              explanation: {
                perceived: "Você viu que o rei preto está preso atrás dos próprios peões.",
                threat:
                  "Os peões de f7, g7 e h7 nunca se moveram. O rei de g8 não tem casa de fuga na sétima fileira.",
                bestDefense: "Não existe defesa: nada preto alcança a8, e o rei não tem casas.",
                reason:
                  "Ta8# ataca o rei pela oitava fileira e a torre está longe demais para ser capturada. f8 e h8 também são cobertas pela torre, e f7/g7/h7 estão ocupadas.",
                pattern:
                  "Mate de corredor: rei trancado na última fileira pelos próprios peões, torre ou dama entra na fileira.",
                transferableRule:
                  "Fazer uma casa de fuga (h3 nas brancas, h6 nas pretas) na hora certa evita esse mate. Cedo demais enfraquece o roque; tarde demais é mate.",
              },
              hints: [
                "O rei preto tem alguma casa livre? Olhe a sétima fileira.",
                "Não tem: f7, g7 e h7 estão ocupadas pelos próprios peões. Basta atacar a oitava fileira.",
                "Cuidado com qual torre você usa: uma delas pode ser capturada pelo rei.",
              ],
              marks: [{ kind: "arrow", from: "a1", to: "a8", tone: "good" }],
              tags: [],
              expectedSeconds: 60,
              points: 12,
            },
            {
              slug: "r5.e3",
              phase: "MASTERY_TEST",
              type: "BEST_MOVE",
              prompt:
                "As brancas jogam e dão mate em 1. Cuidado: nesta posição existe um lance que empata a partida.",
              fen: "7k/8/6K1/3Q4/8/8/8/8 w - - 0 1",
              sideToMove: "w",
              skillIds: ["r5.mate-em-1", "r5.afogamento"],
              difficulty: 8,
              ratingHint: 650,
              acceptedAnswer: { moves: ["Dd8#", "Dh5#"] },
              predictableErrors: [
                {
                  answer: "Dg5",
                  cause: "OVERCONFIDENCE",
                  explanation:
                    "Dg5 não dá xeque — e é exatamente aí que está o problema. O rei preto tem g7, g8 e h7 cobertas pelo rei branco de g6, e nenhuma outra casa. Sem xeque e sem lance legal: afogamento. Empate com uma dama de vantagem.",
                },
                {
                  answer: "Dg8+",
                  cause: "CALCULATION_STOPPED",
                  explanation:
                    "Dg8+ é xeque, mas a dama vai para uma casa ao lado do rei preto sem estar defendida — o rei de g6 não alcança g8. As pretas simplesmente jogam Rxg8.",
                },
              ],
              explanation: {
                perceived:
                  "Você viu que o rei branco de g6 já controla g7, g8 e h7 — as três saídas do rei preto.",
                threat:
                  "A ameaça aqui é contra você: com o rei adversário sem casas, qualquer lance de dama que não dê xeque produz afogamento.",
                bestDefense:
                  "As pretas não têm defesa depois de Dd8# nem de Dh5#: a dama ataca h8 e o rei branco já cobre todas as fugas.",
                reason:
                  "Dd8# ataca pela oitava fileira e Dh5# ataca pela coluna h. Nos dois casos o rei de g6 sustenta o mate.",
                pattern:
                  "Rei adversário sem casas de fuga: todo lance ou é mate, ou é afogamento. Não existe meio-termo.",
                transferableRule:
                  "Quando estiver muito à frente, antes de cada lance pergunte se o adversário ainda tem lance legal. Meio ponto perdido por afogamento custa o mesmo que uma derrota evitável.",
              },
              hints: [
                "Quantas casas o rei preto de h8 ainda tem? Olhe o que o rei branco de g6 controla.",
                "Nenhuma. Isso significa que um lance sem xeque produz afogamento.",
                "Procure um xeque à dama que o rei branco já sustente: pela oitava fileira ou pela coluna h.",
              ],
              marks: [{ kind: "highlight", from: "h8", tone: "bad" }],
              tags: [],
              expectedSeconds: 120,
              points: 20,
            },
          ],
        },
      ],
    },

    // ───────────────────────────────────────────────── R6
    {
      id: "r6",
      title: "Regras especiais e notação",
      summary:
        "Roque, en passant e promoção são as três regras que mais geram confusão em torneio. Notação é o que permite analisar a própria partida depois.",
      masteryTest: "Executar as três regras especiais e reconstruir uma posição a partir da notação.",
      skills: [
        {
          id: "r6.roque",
          title: "Roque",
          competency: "rules",
          description:
            "Rei duas casas em direção à torre, torre para a casa atravessada. Cinco condições precisam ser satisfeitas.",
          sources: ["fide-laws", "dagostini-basico"],
          dependsOn: ["r4.reconhecer"],
          minPrerequisiteMastery: 55,
        },
        {
          id: "r6.en-passant",
          title: "En passant",
          competency: "rules",
          description: "Captura de peão que acabou de avançar duas casas, disponível apenas no lance seguinte.",
          sources: ["fide-laws", "dagostini-basico"],
          dependsOn: ["r3.captura"],
          minPrerequisiteMastery: 55,
        },
        {
          id: "r6.promocao",
          title: "Promoção",
          competency: "rules",
          description: "Peão que chega à última fileira vira dama, torre, bispo ou cavalo — à escolha.",
          sources: ["fide-laws", "dagostini-basico"],
          dependsOn: ["r3.valor"],
          minPrerequisiteMastery: 50,
        },
        {
          id: "r6.notacao",
          title: "Notação algébrica",
          competency: "analysis",
          description: "Registrar lances: peça, destino, captura, xeque, mate, promoção e roque.",
          sources: ["fide-laws", "dagostini-basico"],
          dependsOn: ["r1.localizar"],
          minPrerequisiteMastery: 55,
        },
      ],
      lessons: [
        {
          id: "r6.l1",
          title: "Roque, en passant e promoção",
          concept:
            "**Roque.** O rei anda duas casas em direção à torre e a torre pula para a casa que o rei atravessou. Só é permitido se: rei e torre nunca se moveram, não há peças entre eles, o rei não está em xeque, e o rei não atravessa nem termina em casa atacada. Atenção: a **torre pode estar atacada** — isso não impede o roque.\n\n**En passant.** Se um peão avança duas casas e para ao lado de um peão adversário, esse peão pode capturá-lo como se ele tivesse avançado só uma. O direito existe **apenas no lance imediatamente seguinte**; depois disso, some.\n\n**Promoção.** Peão que chega à última fileira vira dama, torre, bispo ou cavalo — independentemente das peças já capturadas. Você pode ter duas damas. E promover para cavalo às vezes é a única forma de dar xeque ou de evitar afogamento.",
          demo: {
            fen: "4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 2",
            caption:
              "O peão preto acabou de jogar d7–d5, parando ao lado do peão branco de e5. As brancas podem capturar en passant com exd6 — mas só agora.",
            marks: [
              { kind: "arrow", from: "e5", to: "d6", tone: "good" },
              { kind: "highlight", from: "d5", tone: "bad" },
            ],
          },
          exercises: [
            {
              slug: "r6.e1",
              phase: "GUIDED",
              type: "BEST_MOVE",
              prompt:
                "As brancas jogam. Coloque o rei em segurança e ligue as torres com um único lance, do lado do rei.",
              fen: "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1",
              sideToMove: "w",
              skillIds: ["r6.roque"],
              difficulty: 3,
              ratingHint: 300,
              acceptedAnswer: { moves: ["O-O"] },
              predictableErrors: [
                {
                  answer: "O-O-O",
                  cause: "RULE",
                  explanation:
                    "O-O-O é o roque grande, do lado da dama. O enunciado pediu o lado do rei, que é o roque pequeno: O-O.",
                },
                {
                  answer: "Rf1",
                  cause: "RULE",
                  explanation:
                    "Rf1 move o rei uma casa e perde o direito de roque para sempre — sem colocar o rei em segurança nem ligar as torres.",
                },
              ],
              explanation: {
                perceived: "Você identificou que o rei ainda está no centro e que as duas torres estão nas casas de origem.",
                threat:
                  "Rei no centro com colunas prestes a abrir é a causa número um de derrota rápida abaixo de 1200.",
                bestDefense:
                  "O-O leva o rei para g1 e a torre de h1 para f1 — o rei sai da coluna e e a torre entra no jogo.",
                reason:
                  "As cinco condições estão satisfeitas: rei e torre na origem, nada entre eles, rei fora de xeque, e nem f1 nem g1 estão atacadas.",
                pattern: "Roque pequeno: O-O. Roque grande: O-O-O. Conta como um único lance, feito com o rei primeiro.",
                transferableRule:
                  "Em competição, mova sempre o **rei primeiro** ao rocar. Tocar a torre antes pode obrigar você a jogar só a torre, pela regra da peça tocada.",
              },
              hints: [
                "O lado do rei é o lado da coluna h.",
                "A notação do roque não usa casas: usa O e hífens.",
                "Roque pequeno se escreve O-O.",
              ],
              marks: [],
              tags: [],
              verification: "RULE_EXECUTION",
              expectedSeconds: 30,
              points: 8,
            },
            {
              slug: "r6.e2",
              phase: "INDEPENDENT",
              type: "BEST_MOVE",
              prompt:
                "O peão preto acabou de jogar d7–d5. As brancas jogam e capturam esse peão. Qual é o lance?",
              fen: "4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 2",
              sideToMove: "w",
              skillIds: ["r6.en-passant"],
              difficulty: 6,
              ratingHint: 450,
              acceptedAnswer: { moves: ["exd6"] },
              predictableErrors: [
                {
                  answer: "e6",
                  cause: "RULE",
                  explanation:
                    "e6 avança o peão e deixa o peão preto passar. O direito de capturar en passant existe **só neste lance** — no próximo já não existe mais.",
                },
                {
                  answer: "Rd2",
                  cause: "CANDIDATE_IGNORED",
                  explanation:
                    "Rd2 é legal, mas desperdiça a única chance de capturar en passant. Depois deste lance, o peão de d5 está a salvo.",
                },
              ],
              explanation: {
                perceived: "Você reconheceu a configuração do en passant: peão que avançou duas casas parando ao lado do seu.",
                threat: "Se as brancas não capturarem agora, o peão de d5 passa e o direito desaparece para sempre.",
                bestDefense:
                  "Do lado preto, a defesa teria sido jogar d7–d6 em vez de d7–d5, avançando uma casa só.",
                reason:
                  "exd6 captura o peão de d5, mas o peão branco vai parar em **d6** — a casa que o peão preto atravessou. É a única captura do xadrez em que a peça capturada não está na casa de destino.",
                pattern: "En passant: peão adversário avança duas casas e para ao seu lado; você captura como se ele tivesse avançado uma.",
                transferableRule:
                  "O direito dura exatamente um lance. Em partida com relógio, decida en passant antes de qualquer outra coisa.",
              },
              hints: [
                "A captura de peão se escreve com a coluna de origem, um x e a casa de destino.",
                "Para onde vai o peão branco: d5 ou d6?",
                "Ele vai para d6, a casa atravessada pelo peão preto: exd6.",
              ],
              marks: [],
              tags: [],
              verification: "RULE_EXECUTION",
              expectedSeconds: 60,
              points: 14,
            },
            {
              slug: "r6.e3",
              phase: "INDEPENDENT",
              type: "BEST_MOVE",
              prompt: "As brancas jogam. Promova o peão da forma mais forte.",
              fen: "8/4P3/8/8/8/8/8/4K2k w - - 0 1",
              sideToMove: "w",
              skillIds: ["r6.promocao"],
              difficulty: 4,
              ratingHint: 250,
              acceptedAnswer: { moves: ["e8=D"] },
              predictableErrors: [
                {
                  answer: "e8=C",
                  cause: "EVALUATION",
                  explanation:
                    "O cavalo é a mais fraca das quatro opções. Promover para cavalo só se justifica quando ele dá xeque, cria um garfo ou evita afogamento — nada disso acontece aqui.",
                },
                {
                  answer: "e8=T",
                  cause: "EVALUATION",
                  explanation:
                    "A torre também ganha, mas vale 5 contra 9 da dama. Sem motivo tático, escolha sempre a peça mais forte.",
                },
              ],
              explanation: {
                perceived: "Você levou o peão até a última fileira e teve de escolher a peça.",
                threat:
                  "Não há ameaça aqui — o que existe é a tentação de promover no automático sem verificar afogamento.",
                bestDefense: "As pretas não têm defesa: o rei de h1 continua com g1 livre, então também não há afogamento.",
                reason:
                  "e8=D é o mais forte. A dama vale 9 e nada nesta posição justifica abrir mão dela.",
                pattern:
                  "Promoção padrão é para dama. Subpromoção só quando há um motivo concreto: xeque, garfo ou fugir do afogamento.",
                transferableRule:
                  "Antes de promover com o adversário quase sem lances, confira se a nova dama afoga o rei dele. Um empate por descuido custa meio ponto.",
              },
              hints: [
                "A promoção se escreve com a casa de destino, um sinal de igual e a inicial da peça.",
                "Em português, a dama é D.",
                "e8 igual a D.",
              ],
              marks: [],
              tags: [],
              verification: "RULE_EXECUTION",
              expectedSeconds: 30,
              points: 8,
            },
            {
              slug: "r6.e4",
              phase: "MASTERY_TEST",
              type: "NOTATION_WRITE",
              prompt:
                "Na posição inicial, as brancas movem o cavalo de g1 para f3. Escreva esse lance em notação algébrica.",
              fen: START_FEN,
              sideToMove: "w",
              skillIds: ["r6.notacao"],
              difficulty: 7,
              ratingHint: 350,
              acceptedAnswer: { choice: "Cf3" },
              predictableErrors: [
                {
                  answer: "g1f3",
                  cause: "RULE",
                  explanation:
                    "Isso é notação de coordenadas, usada por computadores. A notação algébrica de competição registra a inicial da peça e a casa de **destino**: Cf3.",
                },
                {
                  answer: "Cg1-f3",
                  cause: "RULE",
                  explanation:
                    "A casa de origem só entra quando há ambiguidade — quando dois cavalos poderiam ir para f3. Aqui não há, então escreve-se apenas Cf3.",
                },
              ],
              explanation: {
                perceived: "Você identificou a peça e a casa de destino.",
                threat:
                  "Súmula mal preenchida impede reclamação de tríplice repetição e inviabiliza a análise da própria partida depois.",
                bestDefense:
                  "Escreva inicial da peça + casa de destino. Acrescente x para captura, + para xeque, # para mate, = para promoção.",
                reason:
                  "Cf3: C é a inicial de cavalo em português, e f3 é o destino. A casa de origem é omitida porque não há outro cavalo capaz de ir a f3.",
                pattern: "Peça + destino. Peões dispensam a inicial: só a casa de destino.",
                transferableRule:
                  "A notação em inglês usa N para knight — se você ler livros importados, Nf3 e Cf3 são o mesmo lance.",
              },
              hints: [
                "Qual é a inicial de cavalo em português?",
                "Peões não levam inicial; as outras peças sim. A casa que se escreve é a de destino.",
                "C mais f3.",
              ],
              marks: [{ kind: "arrow", from: "g1", to: "f3", tone: "good" }],
              tags: [],
              expectedSeconds: 40,
              points: 12,
            },
          ],
        },
      ],
    },
  ],
};

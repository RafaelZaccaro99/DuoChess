/**
 * Liga Estrategista (800–1200) — primeira unidade: Garfo.
 *
 * Mesma convenção da Recruta: SAN escrito em PORTUGUÊS (R=rei, D=dama,
 * T=torre, B=bispo, C=cavalo; peão sem letra). O avaliador aceita as duas
 * línguas na resposta do usuário.
 *
 * Todo item aqui é `BEST_MOVE` com resposta única: o gate ENGINE_REVIEW
 * (Stockfish) exige que o gabarito esteja a mais de 100 centipawns de
 * distância da segunda melhor linha (`MARGEM_UNICIDADE`,
 * `src/domain/chess/verification.ts`). Cada uma das 12 posições abaixo foi
 * verificada diretamente contra o Stockfish (profundidade 14) antes de
 * entrar aqui — não é suposição.
 *
 * Duas lições aprendidas na construção desta unidade, registradas porque
 * vão se repetir nas próximas:
 *  1. Posição "só as peças do garfo" (poucas peças, sem outros peões) faz o
 *     motor avaliar tudo como equivalente — material insuficiente pra
 *     converter a vantagem em algo que apareça em centipawns. É preciso
 *     massa de peão suficiente dos dois lados pra o ganho do garfo virar
 *     vantagem REAL, não só "ganhei uma peça que não muda o resultado".
 *  2. Garfo por AVANÇO de peão (empurrar pro quadrado, sem capturar) dá
 *     tempo demais ao adversário — ele costuma conseguir defender as duas
 *     peças com um único lance (uma foge, ou a que ficou parada passa a
 *     estar defendida pela que fugiu). Garfo por CAPTURA já garante o
 *     ganho na hora — o resto é bônus. Por isso os 6 itens de garfo de peão
 *     aqui são todos por captura.
 */

import type { LeagueInput } from "./schema";

export const ESTRATEGISTA: LeagueInput = {
  id: "estrategista",
  title: "Estrategista",
  order: 2,
  ratingMin: 800,
  ratingMax: 1200,
  focus:
    "Desenvolvimento, centro, segurança do rei, garfo, cravada, espeto, ataque descoberto, remoção do defensor, mates, oposição e finais básicos.",
  units: [
    // ───────────────────────────────────────────────── E2 — Garfo
    {
      id: "e2",
      title: "Garfo",
      summary:
        "Um garfo é uma peça atacando duas peças ao mesmo tempo. O adversário só tem um lance — não dá para salvar as duas. É o motivo tático mais comum entre 800 e 1200: quem enxerga garfo ganha material sem precisar calcular fundo.",
      masteryTest:
        "Encontrar o garfo certo em 8 de 10 posições novas, com peça atacante variada (cavalo ou peão), em até 45 segundos cada.",
      skills: [
        {
          id: "e2.garfo-cavalo",
          title: "Garfo de cavalo",
          competency: "tactics",
          description:
            "Reconhecer e executar o lance de cavalo que ataca duas peças (ou o rei e uma peça) ao mesmo tempo.",
          sources: ["dagostini-basico", "maizelis-primer", "capablanca-fundamentals"],
          dependsOn: [],
          minPrerequisiteMastery: 60,
        },
        {
          id: "e2.garfo-peao",
          title: "Garfo de peão",
          competency: "tactics",
          description:
            "Reconhecer que a captura de um peão pode abrir ataque simultâneo contra duas peças, e executá-la.",
          sources: ["dagostini-basico", "maizelis-primer", "capablanca-fundamentals"],
          dependsOn: [],
          minPrerequisiteMastery: 60,
        },
      ],
      lessons: [
        {
          id: "e2.l1",
          title: "O garfo: uma peça, dois alvos",
          concept:
            "**Garfo** é quando uma peça ataca duas peças adversárias na mesma jogada. O adversário só tem UM lance para responder — e um lance não salva duas peças ao mesmo tempo (a menos que uma defenda a outra).\n\nO **cavalo** é a peça clássica de garfo: ele ataca em L, então frequentemente alcança duas peças distantes uma da outra que nem se enxergam. O **peão** também garfa — ele ataca as duas casas na diagonal à frente dele. O jeito mais seguro de garfo de peão é por **captura**: o peão já ganha a peça capturada na hora, e o ataque às outras duas casas é bônus — diferente de avançar para uma casa vazia, que dá ao adversário um lance inteiro para se reorganizar.\n\nO processo é sempre o mesmo: ache uma casa (ou uma captura) que ataque dois alvos ao mesmo tempo, e prefira quando um dos alvos é o rei — aí o adversário é OBRIGADO a responder ao xeque, e a segunda peça cai garantida.",
          demo: {
            fen: "1nr3k1/pp4p1/2N5/8/8/8/PP4P1/4K2R w - - 0 1",
            caption:
              "O cavalo de c6 pula para e7: xeque no rei de g8 e, ao mesmo tempo, ataca a torre indefesa de c8. As pretas respondem ao xeque agora — a torre cai no lance seguinte.",
            marks: [
              { kind: "arrow", from: "c6", to: "e7", tone: "good" },
              { kind: "highlight", from: "c8", tone: "bad" },
            ],
          },
          exercises: [
            {
              slug: "e2.c1",
              phase: "GUIDED",
              type: "BEST_MOVE",
              prompt: "As brancas jogam. Encontre o garfo.",
              fen: "1nr3k1/pp4p1/2N5/8/8/8/PP4P1/4K2R w - - 0 1",
              sideToMove: "w",
              skillIds: ["e2.garfo-cavalo"],
              difficulty: 3,
              ratingHint: 800,
              acceptedAnswer: { moves: ["Ce7+"] },
              predictableErrors: [
                {
                  answer: "Ce5",
                  cause: "PATTERN",
                  explanation:
                    "Ce5 recua o cavalo sem necessidade — de lá ele não dá xeque nem ataca a torre de c8. Antes de recuar, confira se existe um lance de cavalo que ataca duas coisas de uma vez.",
                },
              ],
              explanation: {
                perceived: "Você viu um cavalo perto do rei preto e uma torre desprotegida na oitava fileira.",
                threat: "Nenhuma ameaça contra você — a oportunidade é sua: duas peças pretas ao alcance de um lance só.",
                bestDefense: "As pretas não têm defesa: qualquer resposta ao xeque deixa a torre de c8 cair no lance seguinte.",
                reason:
                  "Ce7+ ataca o rei de g8 (xeque) e a torre de c8 ao mesmo tempo. As pretas têm que resolver o xeque agora; a torre não tem mais ninguém para defendê-la.",
                pattern: "Garfo de cavalo com xeque: o adversário é obrigado a responder ao rei, e a segunda peça cai de graça.",
                transferableRule:
                  "Quando um lance de cavalo dá xeque, pergunte sempre: 'esse mesmo lance ataca mais alguma coisa?' Xeque que também ataca é garfo.",
              },
              hints: [
                "O cavalo de c6 tem um lance que dá xeque. Ache-o.",
                "Ce7 dá xeque no rei de g8. O que mais essa casa enxerga?",
                "De e7, o cavalo também ataca a torre de c8 — que não tem ninguém para defendê-la.",
              ],
              marks: [{ kind: "arrow", from: "c6", to: "e7", tone: "good" }],
              tags: ["garfo", "cavalo"],
              expectedSeconds: 25,
              points: 8,
            },
            {
              slug: "e2.p1",
              phase: "GUIDED",
              type: "BEST_MOVE",
              prompt: "As brancas jogam. O peão pode capturar e ainda garfar.",
              fen: "6k1/pr1n2p1/2n5/3P4/8/8/PP4P1/4K2R w - - 0 1",
              sideToMove: "w",
              skillIds: ["e2.garfo-peao"],
              difficulty: 4,
              ratingHint: 820,
              acceptedAnswer: { moves: ["dxc6"] },
              predictableErrors: [
                {
                  answer: "d6",
                  cause: "CANDIDATE_IGNORED",
                  explanation:
                    "d6 avança sem capturar nada e deixa o cavalo de c6 vivo. dxc6 captura o cavalo E ainda ataca duas peças a mais — compare captura com avanço antes de escolher.",
                },
              ],
              explanation: {
                perceived: "Você viu um cavalo preto bloqueando o avanço direto do seu peão, com uma torre e outro cavalo mais além.",
                threat: "Nenhuma ameaça contra você — as três peças pretas estão indefesas.",
                bestDefense: "As pretas perdem o cavalo agora, de graça, e não conseguem salvar torre e cavalo juntos no lance seguinte.",
                reason:
                  "dxc6 captura o cavalo de c6 e, ao pousar em c6, ataca a torre de b7 e o cavalo de d7 ao mesmo tempo — três peças pretas perdidas em dois lances.",
                pattern: "A captura que garfa é o garfo mais forte: você já ganha uma peça na hora E ainda deixa duas outras penduradas.",
                transferableRule:
                  "Antes de escolher entre capturar e avançar, veja para onde a captura leva o seu peão — às vezes ela não é só 'ganhar a peça capturada', mas abrir um garfo novo.",
              },
              hints: [
                "Existe uma captura disponível aqui, não só um avanço.",
                "dxc6 captura o cavalo. Depois de capturar, o que a casa c6 ataca?",
                "De c6, o peão ataca a torre de b7 e o cavalo de d7.",
              ],
              marks: [],
              tags: ["garfo", "peao"],
              expectedSeconds: 30,
              points: 10,
            },
            {
              slug: "e2.c6",
              phase: "MASTERY_TEST",
              type: "BEST_MOVE",
              prompt: "As brancas jogam. Encontre o garfo.",
              fen: "k1r5/1p4pp/8/3N4/8/8/1P4PP/4R1K1 w - - 0 1",
              sideToMove: "w",
              skillIds: ["e2.garfo-cavalo"],
              difficulty: 7,
              ratingHint: 930,
              acceptedAnswer: { moves: ["Cb6+"] },
              predictableErrors: [
                {
                  answer: "Cc7+",
                  cause: "CANDIDATE_IGNORED",
                  explanation:
                    "Cc7 também dá xeque no rei de a8 — mas de lá o cavalo enxerga a6, a8, b5, d5 e e6, nenhuma delas a torre de c8. Compare os xeques disponíveis antes de escolher, sempre.",
                },
              ],
              explanation: {
                perceived: "Você viu o rei preto encurralado no canto, com a torre ao lado dele.",
                threat: "Nenhuma ameaça contra você — a torre de c8 está sem defesa.",
                bestDefense: "As pretas respondem ao xeque; a torre de c8 cai no lance seguinte.",
                reason: "Cb6+ ataca o rei de a8 (xeque) e a torre de c8 ao mesmo tempo.",
                pattern: "Rei encurralado no canto, cercado por peças maiores: prova de domínio junta tudo que a unidade ensinou.",
                transferableRule:
                  "Antes de anunciar o lance, sempre liste TODOS os xeques disponíveis e compare o que cada um ataca — não jogue o primeiro que aparecer.",
              },
              hints: [
                "O rei preto está preso no canto — há mais de um xeque de cavalo disponível.",
                "Cb6 dá xeque. Compare com as outras casas de xeque antes de decidir.",
                "De b6, o cavalo também ataca a torre de c8.",
              ],
              marks: [],
              tags: ["garfo", "cavalo"],
              expectedSeconds: 45,
              points: 15,
            },
            {
              slug: "e2.p6",
              phase: "MASTERY_TEST",
              type: "BEST_MOVE",
              prompt: "As brancas jogam. O peão pode capturar uma torre e ainda garfar.",
              fen: "1k6/1p2n1np/5r2/4P3/8/8/1P4PP/R2K4 w - - 0 1",
              sideToMove: "w",
              skillIds: ["e2.garfo-peao"],
              difficulty: 7,
              ratingHint: 920,
              acceptedAnswer: { moves: ["exf6"] },
              predictableErrors: [
                {
                  answer: "e6",
                  cause: "CANDIDATE_IGNORED",
                  explanation:
                    "e6 avança sem capturar e deixa a torre de f6 viva. exf6 captura a torre inteira E ainda ataca dois cavalos.",
                },
              ],
              explanation: {
                perceived: "Você viu uma torre preta bloqueando o avanço direto do seu peão, com dois cavalos mais além.",
                threat: "Nenhuma ameaça contra você — as três peças pretas estão indefesas.",
                bestDefense: "As pretas perdem a torre agora, de graça, e não conseguem salvar os dois cavalos juntos no lance seguinte.",
                reason: "exf6 captura a torre de f6 e, ao pousar em f6, ataca o cavalo de g7 e o cavalo de e7 ao mesmo tempo.",
                pattern: "Prova de domínio: mesma captura-garfo da lição, agora com a peça de maior valor em jogo.",
                transferableRule:
                  "Antes de capturar, compare o valor da peça capturada com as alternativas. Uma torre vale muito mais que um cavalo.",
              },
              hints: [
                "Existe uma captura disponível aqui, não só um avanço.",
                "exf6 captura a torre. Depois de capturar, o que a casa f6 ataca?",
                "De f6, o peão ataca o cavalo de g7 e o cavalo de e7.",
              ],
              marks: [],
              tags: ["garfo", "peao"],
              expectedSeconds: 45,
              points: 15,
            },
          ],
        },
      ],
      practice: [
        // ── e2.garfo-cavalo (5 itens além do da lição)
        {
          slug: "e2.c2",
          phase: "INDEPENDENT",
          type: "BEST_MOVE",
          prompt: "As brancas jogam. Encontre o garfo.",
          fen: "1k3rn1/1p4pp/5N2/8/8/8/1P4PP/R2K4 w - - 0 1",
          sideToMove: "w",
          skillIds: ["e2.garfo-cavalo"],
          difficulty: 4,
          ratingHint: 820,
          acceptedAnswer: { moves: ["Cd7+"] },
          predictableErrors: [
            {
              answer: "Ce8",
              cause: "PATTERN",
              explanation:
                "Ce8 chega perto da torre de f8, mas não a ataca e não dá xeque. Chegar perto não é atacar: confira as casas que o cavalo realmente alcança.",
            },
          ],
          explanation: {
            perceived: "Você viu um cavalo perto do rei preto e uma torre desprotegida na oitava fileira.",
            threat: "Nenhuma ameaça contra você — a torre de f8 está sem defesa.",
            bestDefense: "As pretas não têm defesa: qualquer resposta ao xeque deixa a torre de f8 cair no lance seguinte.",
            reason: "Cd7+ ataca o rei de b8 (xeque) e a torre de f8 ao mesmo tempo.",
            pattern: "Mesmo garfo do primeiro exercício, só espelhado — o padrão funciona em qualquer canto do tabuleiro.",
            transferableRule:
              "Depois de aprender um padrão de garfo, procure-o dos dois lados do tabuleiro. A geometria do cavalo não muda com o lado.",
          },
          hints: [
            "O cavalo de f6 tem um lance que dá xeque. Ache-o.",
            "Cd7 dá xeque no rei de b8. O que mais essa casa enxerga?",
            "De d7, o cavalo também ataca a torre de f8.",
          ],
          marks: [],
          tags: ["garfo", "cavalo"],
          expectedSeconds: 25,
          points: 9,
        },
        {
          slug: "e2.c3",
          phase: "INDEPENDENT",
          type: "BEST_MOVE",
          prompt: "As brancas jogam. Existe mais de um xeque aqui — só um deles garfa.",
          fen: "4k3/pq3pp1/8/5N2/8/8/P4PP1/6KR w - - 0 1",
          sideToMove: "w",
          skillIds: ["e2.garfo-cavalo"],
          difficulty: 5,
          ratingHint: 850,
          acceptedAnswer: { moves: ["Cd6+"] },
          predictableErrors: [
            {
              answer: "Cg7+",
              cause: "CANDIDATE_IGNORED",
              explanation:
                "Cg7 também dá xeque — mas de lá o cavalo só enxerga e8 (o rei), e5 e h5, nenhuma peça a mais. Achar UM xeque não basta: compare com outras casas que também dão xeque antes de escolher.",
            },
          ],
          explanation: {
            perceived: "Você viu duas casas de onde o cavalo dá xeque no rei de e8.",
            threat: "Nenhuma ameaça contra você — a dama preta de b7 está sem defesa.",
            bestDefense: "As pretas respondem ao xeque; a dama de b7 cai no lance seguinte, sem ninguém para recapturar.",
            reason: "Cd6+ ataca o rei de e8 (xeque) e a dama de b7 ao mesmo tempo — o garfo mais valioso, rei e dama.",
            pattern: "Nem todo xeque de cavalo é garfo. Quando há mais de um xeque disponível, o que também ataca outra peça é o certo.",
            transferableRule:
              "Antes de jogar o primeiro xeque que você enxergar, pergunte se existe outro xeque que ataca mais alguma coisa. Xeque é só metade da pergunta.",
          },
          hints: [
            "Duas casas dão xeque no rei de e8. Uma delas ataca mais alguma coisa.",
            "Cd6 dá xeque. O que mais a casa d6 enxerga, além do rei?",
            "De d6, o cavalo também ataca a dama de b7.",
          ],
          marks: [],
          tags: ["garfo", "cavalo"],
          expectedSeconds: 35,
          points: 11,
        },
        {
          slug: "e2.c4",
          phase: "INDEPENDENT",
          type: "BEST_MOVE",
          prompt: "As brancas jogam. Existe mais de um xeque aqui — só um deles garfa.",
          fen: "3k4/1pp3qp/8/2N5/8/8/1PP4P/RK6 w - - 0 1",
          sideToMove: "w",
          skillIds: ["e2.garfo-cavalo"],
          difficulty: 5,
          ratingHint: 860,
          acceptedAnswer: { moves: ["Ce6+"] },
          predictableErrors: [
            {
              answer: "Cb7+",
              cause: "CANDIDATE_IGNORED",
              explanation:
                "Cb7 também dá xeque — mas de lá o cavalo só enxerga a5, c5, d6 e d8 (o rei), nenhuma peça a mais. De novo: existe mais de um xeque, e só um deles é garfo.",
            },
          ],
          explanation: {
            perceived: "Você viu duas casas de onde o cavalo dá xeque no rei de d8.",
            threat: "Nenhuma ameaça contra você — a dama preta de g7 está sem defesa.",
            bestDefense: "As pretas respondem ao xeque; a dama de g7 cai no lance seguinte.",
            reason: "Ce6+ ataca o rei de d8 (xeque) e a dama de g7 ao mesmo tempo.",
            pattern: "Mesmo padrão do exercício anterior, espelhado — rei e dama continua sendo o garfo mais valioso.",
            transferableRule:
              "Antes de jogar o primeiro xeque que você enxergar, pergunte se existe outro xeque que ataca mais alguma coisa.",
          },
          hints: [
            "Duas casas dão xeque no rei de d8. Uma delas ataca mais alguma coisa.",
            "Ce6 dá xeque. O que mais a casa e6 enxerga, além do rei?",
            "De e6, o cavalo também ataca a dama de g7.",
          ],
          marks: [],
          tags: ["garfo", "cavalo"],
          expectedSeconds: 35,
          points: 11,
        },
        {
          slug: "e2.c5",
          phase: "INDEPENDENT",
          type: "BEST_MOVE",
          prompt: "As brancas jogam. Encontre o garfo.",
          fen: "5r1k/pp4p1/8/4N3/8/8/PP4P1/1K1R4 w - - 0 1",
          sideToMove: "w",
          skillIds: ["e2.garfo-cavalo"],
          difficulty: 6,
          ratingHint: 900,
          acceptedAnswer: { moves: ["Cg6+"] },
          predictableErrors: [
            {
              answer: "Cf7+",
              cause: "CANDIDATE_IGNORED",
              explanation:
                "Cf7 também dá xeque no rei de h8 — mas de lá o cavalo enxerga d6, d8, e5, g5 e h6, nenhuma delas a torre de f8. Mais uma vez: existe mais de um xeque, e só um deles é garfo.",
            },
          ],
          explanation: {
            perceived: "Você viu o rei preto encurralado no canto, com a torre ao lado dele.",
            threat: "Nenhuma ameaça contra você — a torre de f8 está sem defesa.",
            bestDefense: "As pretas respondem ao xeque; a torre de f8 cai no lance seguinte.",
            reason: "Cg6+ ataca o rei de h8 (xeque) e a torre de f8 ao mesmo tempo.",
            pattern: "Rei encurralado no canto é terreno fértil para garfo: poucas casas de fuga, cavalo por perto.",
            transferableRule:
              "Rei na borda do tabuleiro tem menos casas de fuga. Sempre que o rei adversário estiver lá, vale a pena procurar garfo de cavalo antes de qualquer outro plano.",
          },
          hints: [
            "O rei preto está preso no canto — há mais de um xeque de cavalo disponível.",
            "Cg6 dá xeque. Compare com as outras casas de xeque antes de decidir.",
            "De g6, o cavalo também ataca a torre de f8.",
          ],
          marks: [],
          tags: ["garfo", "cavalo"],
          expectedSeconds: 40,
          points: 13,
        },
        // ── e2.garfo-peao (5 itens além do da lição)
        {
          slug: "e2.p2",
          phase: "INDEPENDENT",
          type: "BEST_MOVE",
          prompt: "As brancas jogam. O peão pode capturar e ainda garfar.",
          fen: "1k6/1p2n1rp/5n2/4P3/8/8/1P4PP/R2K4 w - - 0 1",
          sideToMove: "w",
          skillIds: ["e2.garfo-peao"],
          difficulty: 4,
          ratingHint: 830,
          acceptedAnswer: { moves: ["exf6"] },
          predictableErrors: [
            {
              answer: "e6",
              cause: "CANDIDATE_IGNORED",
              explanation:
                "e6 avança sem capturar e deixa o cavalo de f6 vivo. exf6 captura o cavalo E ainda ataca duas peças a mais — compare captura com avanço antes de escolher.",
            },
          ],
          explanation: {
            perceived: "Você viu um cavalo preto bloqueando o avanço direto do seu peão, com uma torre e outro cavalo mais além.",
            threat: "Nenhuma ameaça contra você — as três peças pretas estão indefesas.",
            bestDefense: "As pretas perdem o cavalo agora, de graça, e não conseguem salvar torre e cavalo juntos no lance seguinte.",
            reason:
              "exf6 captura o cavalo de f6 e, ao pousar em f6, ataca a torre de g7 e o cavalo de e7 ao mesmo tempo.",
            pattern: "Mesmo garfo do primeiro exercício de peão, só espelhado.",
            transferableRule:
              "Antes de escolher entre capturar e avançar, veja para onde a captura leva o seu peão — às vezes ela abre um garfo novo.",
          },
          hints: [
            "Existe uma captura disponível aqui, não só um avanço.",
            "exf6 captura o cavalo. Depois de capturar, o que a casa f6 ataca?",
            "De f6, o peão ataca a torre de g7 e o cavalo de e7.",
          ],
          marks: [],
          tags: ["garfo", "peao"],
          expectedSeconds: 30,
          points: 10,
        },
        {
          slug: "e2.p3",
          phase: "INDEPENDENT",
          type: "BEST_MOVE",
          prompt: "As brancas jogam. O peão pode capturar e ainda garfar.",
          fen: "6k1/r1n2pp1/1n6/P7/8/8/PP4P1/4K2R w - - 0 1",
          sideToMove: "w",
          skillIds: ["e2.garfo-peao"],
          difficulty: 5,
          ratingHint: 850,
          acceptedAnswer: { moves: ["axb6"] },
          predictableErrors: [
            {
              answer: "a6",
              cause: "CANDIDATE_IGNORED",
              explanation:
                "a6 avança sem capturar e deixa o cavalo de b6 vivo. axb6 captura o cavalo E ainda ataca duas peças a mais.",
            },
          ],
          explanation: {
            perceived: "Você viu um cavalo preto bloqueando o avanço direto do seu peão, com uma torre e outro cavalo mais além.",
            threat: "Nenhuma ameaça contra você — as três peças pretas estão indefesas.",
            bestDefense: "As pretas perdem o cavalo agora, de graça, e não conseguem salvar torre e cavalo juntos no lance seguinte.",
            reason: "axb6 captura o cavalo de b6 e, ao pousar em b6, ataca a torre de a7 e o cavalo de c7 ao mesmo tempo.",
            pattern: "A captura que garfa continua sendo o garfo mais forte, agora do outro lado do tabuleiro.",
            transferableRule:
              "Antes de escolher entre capturar e avançar, veja para onde a captura leva o seu peão — às vezes ela abre um garfo novo.",
          },
          hints: [
            "Existe uma captura disponível aqui, não só um avanço.",
            "axb6 captura o cavalo. Depois de capturar, o que a casa b6 ataca?",
            "De b6, o peão ataca a torre de a7 e o cavalo de c7.",
          ],
          marks: [],
          tags: ["garfo", "peao"],
          expectedSeconds: 35,
          points: 12,
        },
        {
          slug: "e2.p4",
          phase: "INDEPENDENT",
          type: "BEST_MOVE",
          prompt: "As brancas jogam. O peão pode capturar e ainda garfar.",
          fen: "1k6/1pp2n1r/6n1/7P/8/8/1P4PP/R2K4 w - - 0 1",
          sideToMove: "w",
          skillIds: ["e2.garfo-peao"],
          difficulty: 5,
          ratingHint: 860,
          acceptedAnswer: { moves: ["hxg6"] },
          predictableErrors: [
            {
              answer: "h6",
              cause: "CANDIDATE_IGNORED",
              explanation:
                "h6 avança sem capturar e deixa o cavalo de g6 vivo. hxg6 captura o cavalo E ainda ataca duas peças a mais.",
            },
          ],
          explanation: {
            perceived: "Você viu um cavalo preto bloqueando o avanço direto do seu peão, com uma torre e outro cavalo mais além.",
            threat: "Nenhuma ameaça contra você — as três peças pretas estão indefesas.",
            bestDefense: "As pretas perdem o cavalo agora, de graça, e não conseguem salvar torre e cavalo juntos no lance seguinte.",
            reason: "hxg6 captura o cavalo de g6 e, ao pousar em g6, ataca a torre de h7 e o cavalo de f7 ao mesmo tempo.",
            pattern: "Mesmo garfo dos exercícios anteriores, agora na borda do tabuleiro — o peão da coluna h garfa igual a qualquer outro.",
            transferableRule:
              "Antes de escolher entre capturar e avançar, veja para onde a captura leva o seu peão — às vezes ela abre um garfo novo.",
          },
          hints: [
            "Existe uma captura disponível aqui, não só um avanço.",
            "hxg6 captura o cavalo. Depois de capturar, o que a casa g6 ataca?",
            "De g6, o peão ataca a torre de h7 e o cavalo de f7.",
          ],
          marks: [],
          tags: ["garfo", "peao"],
          expectedSeconds: 35,
          points: 12,
        },
        {
          slug: "e2.p5",
          phase: "INDEPENDENT",
          type: "BEST_MOVE",
          prompt: "As brancas jogam. O peão pode capturar uma torre e ainda garfar.",
          fen: "6k1/pn1n2p1/2r5/3P4/8/8/PP4P1/4K2R w - - 0 1",
          sideToMove: "w",
          skillIds: ["e2.garfo-peao"],
          difficulty: 6,
          ratingHint: 890,
          acceptedAnswer: { moves: ["dxc6"] },
          predictableErrors: [
            {
              answer: "d6",
              cause: "CANDIDATE_IGNORED",
              explanation:
                "d6 avança sem capturar e deixa a torre de c6 viva. dxc6 captura a torre inteira E ainda ataca dois cavalos — muito mais material do que um simples avanço.",
            },
          ],
          explanation: {
            perceived: "Você viu uma torre preta bloqueando o avanço direto do seu peão, com dois cavalos mais além.",
            threat: "Nenhuma ameaça contra você — as três peças pretas estão indefesas.",
            bestDefense: "As pretas perdem a torre agora, de graça, e não conseguem salvar os dois cavalos juntos no lance seguinte.",
            reason: "dxc6 captura a torre de c6 e, ao pousar em c6, ataca o cavalo de b7 e o cavalo de d7 ao mesmo tempo.",
            pattern: "Quando a peça capturada é mais valiosa (torre em vez de cavalo), o garfo vale ainda mais — confira sempre o que está capturando, não só se pode capturar.",
            transferableRule:
              "Antes de capturar, compare o valor da peça capturada com as alternativas. Uma torre vale muito mais que um cavalo — a diferença de material importa mais do que a diferença de casas.",
          },
          hints: [
            "Existe uma captura disponível aqui, não só um avanço.",
            "dxc6 captura a torre. Depois de capturar, o que a casa c6 ataca?",
            "De c6, o peão ataca o cavalo de b7 e o cavalo de d7.",
          ],
          marks: [],
          tags: ["garfo", "peao"],
          expectedSeconds: 40,
          points: 14,
        },
      ],
    },
  ],
};

/**
 * Liga Estrategista (800–1200) — duas unidades: Garfo (e2) e Cravada (e3).
 *
 * Mesma convenção da Recruta: SAN escrito em PORTUGUÊS (R=rei, D=dama,
 * T=torre, B=bispo, C=cavalo; peão sem letra). O avaliador aceita as duas
 * línguas na resposta do usuário.
 *
 * Todo item aqui é `BEST_MOVE` com resposta única: o gate ENGINE_REVIEW
 * (Stockfish) exige que o gabarito esteja a mais de 100 centipawns de
 * distância da segunda melhor linha (`MARGEM_UNICIDADE`,
 * `src/domain/chess/verification.ts`). Toda posição abaixo foi verificada
 * diretamente contra o Stockfish (profundidade 14, via
 * `scripts/lab/testar-posicao.ts`) antes de entrar aqui — não é suposição.
 *
 * Lições aprendidas na construção desta unidade, registradas porque vão se
 * repetir nas próximas:
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
 *  3. Cravada precisa de material PRÉ-tática equilibrado dos dois lados. Se
 *     um lado já está muito à frente (ex.: uma torre inteira a mais), o
 *     motor acha quase qualquer lance vencedor e a margem de unicidade
 *     desaparece — não porque a cravada não funcione, mas porque a posição
 *     de base já estava decidida antes do lance. Também é preciso cuidado
 *     para a peça que faz a cravada não conseguir capturar a peça cravada
 *     por um valor comparável ao lance pretendido: isso cria um segundo
 *     lance quase tão bom quanto o certo. Nas cravadas relativas aqui, o
 *     alvo do lance nunca é a peça cravada em si — é o que ela defende
 *     (capturar a peça cravada diretamente costuma só trocar torre por
 *     cavalo, porque a peça de trás, não sendo o rei, pode legalmente
 *     recapturar).
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
    // ───────────────────────────────────────────────── E3 — Cravada
    {
      id: "e3",
      title: "Cravada",
      summary:
        "Uma cravada é quando uma peça não pode se mover porque, se saísse do lugar, exporia uma peça mais valiosa atrás dela a um ataque. Contra o rei, a peça cravada não pode se mover de jeito nenhum — cravada absoluta, é regra. Contra qualquer outra peça (a dama, por exemplo), ela PODE se mover, mas o preço é alto demais — cravada relativa. Nos dois casos, o resultado prático é o mesmo: a peça cravada não vai te incomodar.",
      masteryTest:
        "Encontrar o lance que aproveita a cravada em 8 de 10 posições novas, reconhecendo se é absoluta ou relativa, em até 45 segundos cada.",
      skills: [
        {
          id: "e3.cravada-absoluta",
          title: "Cravada absoluta",
          competency: "tactics",
          description:
            "Reconhecer uma peça cravada contra o próprio rei — que por regra não pode se mover — e capturá-la quando não tiver outro defensor.",
          sources: ["dagostini-basico", "maizelis-primer", "capablanca-fundamentals"],
          dependsOn: [],
          minPrerequisiteMastery: 60,
        },
        {
          id: "e3.cravada-relativa",
          title: "Cravada relativa",
          competency: "tactics",
          description:
            "Reconhecer uma peça cravada contra uma peça de maior valor (não o rei) e capturar o que ela defende, já que mover a peça cravada custa mais caro do que vale.",
          sources: ["dagostini-basico", "maizelis-primer", "capablanca-fundamentals"],
          dependsOn: [],
          minPrerequisiteMastery: 60,
        },
      ],
      lessons: [
        {
          id: "e3.l1",
          title: "A cravada: uma peça presa entre duas ameaças",
          concept:
            "**Cravada** é quando uma peça está na linha de ataque de uma peça adversária de longo alcance (torre, bispo ou dama) e, atrás dela, na mesma linha, está uma peça ainda mais valiosa.\n\nSe a peça de trás for o **rei**, a cravada é **absoluta**: por regra, ninguém pode fazer um lance que deixe o próprio rei em xeque, então a peça cravada literalmente não pode se mover — nem para capturar, nem para fugir. Se ela não tiver outro defensor, capturá-la é sempre seguro.\n\nSe a peça de trás for **qualquer outra coisa** (a dama, por exemplo), a cravada é **relativa**: a peça cravada PODE se mover, tecnicamente. Mas se mover expõe a peça mais valiosa a um ataque — então, na prática, o adversário prefere perder o que a peça cravada defendia a perder a dama. Nos dois casos, o processo é o mesmo: ache a peça cravada, veja o que ela defende (ela mesma, no caso absoluto; outra peça, no caso relativo) e capture.",
          demo: {
            fen: "k6r/2pppppp/np6/8/8/2N5/1PPPPPPP/R5K1 w - - 0 1",
            caption:
              "O cavalo de a6 está entre a torre de a1 e o rei de a8 — cravado. Como não tem outro defensor, Txa6 captura de graça: o cavalo não pode recapturar nem fugir.",
            marks: [
              { kind: "arrow", from: "a1", to: "a6", tone: "good" },
              { kind: "highlight", from: "a8", tone: "neutral" },
            ],
          },
          exercises: [
            {
              slug: "e3.a1",
              phase: "GUIDED",
              type: "BEST_MOVE",
              prompt: "As brancas jogam. O cavalo preto está cravado — ele não pode se mexer.",
              fen: "k6r/2pppppp/np6/8/8/2N5/1PPPPPPP/R5K1 w - - 0 1",
              sideToMove: "w",
              skillIds: ["e3.cravada-absoluta"],
              difficulty: 3,
              ratingHint: 800,
              acceptedAnswer: { moves: ["Txa6"] },
              predictableErrors: [
                {
                  answer: "Ta3",
                  cause: "PATTERN",
                  explanation:
                    "Ta3 recua a torre sem necessidade — o cavalo de a6 está cravado contra o rei de a8 e não pode fugir nem recapturar. Antes de recuar, confira se uma peça cravada pode simplesmente ser capturada de graça.",
                },
              ],
              explanation: {
                perceived: "Você viu um cavalo preto na coluna a, na mesma linha do rei preto e da sua torre.",
                threat: "Nenhuma ameaça contra você — o cavalo de a6 está indefeso.",
                bestDefense:
                  "As pretas não têm defesa: o cavalo não pode se mover (cravado contra o próprio rei) nem tem outra peça que o proteja.",
                reason:
                  "Txa6 captura o cavalo. Como ele está cravado ao rei de a8 pela sua torre, ele não pode recapturar nem fugir — a peça é sua de graça.",
                pattern:
                  "Cravada absoluta: quando uma peça está entre o rei adversário e quem a ataca, ela não pode se mover. Se ninguém mais a defende, capturá-la é sempre seguro.",
                transferableRule:
                  "Antes de qualquer outra decisão, confira se alguma peça adversária está cravada ao rei dela — se estiver e não tiver outro defensor, ela já é sua.",
              },
              hints: [
                "O cavalo de a6 está na mesma coluna que o rei preto e sua torre — ele está cravado.",
                "Uma peça cravada ao rei não pode se mover, mesmo para se defender.",
                "Confira: alguma outra peça preta defende a6? Não. Txa6 captura de graça.",
              ],
              marks: [
                { kind: "arrow", from: "a1", to: "a6", tone: "good" },
                { kind: "highlight", from: "a8", tone: "neutral" },
              ],
              tags: ["cravada", "absoluta"],
              expectedSeconds: 30,
              points: 8,
            },
            {
              slug: "e3.r1",
              phase: "GUIDED",
              type: "BEST_MOVE",
              prompt: "As brancas jogam. O cavalo preto está cravado contra a dama — ele não vai recapturar.",
              fen: "2kq4/ppp2ppp/3n4/5b2/Q3P3/8/PPP2PPP/3R2K1 w - - 0 1",
              sideToMove: "w",
              skillIds: ["e3.cravada-relativa"],
              difficulty: 4,
              ratingHint: 830,
              acceptedAnswer: { moves: ["exf5"] },
              predictableErrors: [
                {
                  answer: "f3",
                  cause: "PATTERN",
                  explanation:
                    "f3 é um lance de espera que não aproveita nada — o bispo de f5 está pendurado, defendido só pelo cavalo cravado. Antes de jogar um lance calmo, confira se existe uma captura disponível.",
                },
              ],
              explanation: {
                perceived:
                  "Você viu um cavalo preto na coluna d, entre sua torre e a dama preta, e um bispo preto em f5 defendido só por esse cavalo.",
                threat: "Nenhuma ameaça contra você — o bispo de f5 está, na prática, indefeso.",
                bestDefense:
                  "As pretas podem recapturar com o cavalo, mas isso perde a dama para sua torre no lance seguinte — muito pior do que simplesmente perder o bispo. Na prática, elas não vão recapturar.",
                reason:
                  "exf5 captura o bispo. O cavalo de d6 até PODE recapturar em f5 (ele não está fisicamente preso), mas fazer isso abre a coluna d e perde a dama para Txd8 — as pretas preferem perder só o bispo.",
                pattern:
                  "Cravada relativa: a peça cravada não está proibida de se mover como na cravada contra o rei, mas mover custa mais caro do que vale a peça que ela defenderia. Na prática, ela fica paralisada do mesmo jeito.",
                transferableRule:
                  "Quando uma peça está cravada contra a dama (ou outra peça valiosa, não o rei), pergunte: o que ela defende? Se for possível capturar aquilo, o defensor 'não pode' recapturar — recapturar custaria mais caro do que vale.",
              },
              hints: [
                "O cavalo de d6 está entre sua torre e a dama preta — ele está cravado contra a dama.",
                "O bispo de f5 só tem o cavalo cravado como defensor.",
                "exf5 captura o bispo. Recapturar com o cavalo perderia a dama — as pretas não vão fazer isso.",
              ],
              marks: [
                { kind: "arrow", from: "e4", to: "f5", tone: "good" },
                { kind: "highlight", from: "d6", tone: "neutral" },
              ],
              tags: ["cravada", "relativa"],
              expectedSeconds: 35,
              points: 10,
            },
            {
              slug: "e3.a6",
              phase: "MASTERY_TEST",
              type: "BEST_MOVE",
              prompt: "As brancas jogam. Encontre o lance que aproveita a cravada.",
              fen: "R3n2k/pppppppp/1n6/8/8/2N5/PPPPPPPP/6K1 w - - 0 1",
              sideToMove: "w",
              skillIds: ["e3.cravada-absoluta"],
              difficulty: 7,
              ratingHint: 900,
              acceptedAnswer: { moves: ["Txe8#"] },
              predictableErrors: [
                {
                  answer: "Txd8",
                  cause: "CANDIDATE_IGNORED",
                  explanation:
                    "Txd8 não captura nada e ainda deixa o cavalo de e8 no tabuleiro — ele continua cravado e pronto para cair. Antes de deslocar a torre, veja se ela já pode capturar a peça cravada diretamente.",
                },
              ],
              explanation: {
                perceived:
                  "Você viu um cavalo preto cravado na oitava fileira, entre sua torre e o rei preto encurralado no canto.",
                threat: "Nenhuma ameaça contra você — o cavalo de e8 está indefeso e o rei preto não tem casas de fuga.",
                bestDefense: "As pretas não têm defesa: o cavalo não pode recapturar (está cravado) e o rei não tem para onde ir.",
                reason:
                  "Txe8 captura o cavalo cravado e, como as casas f8 e g8 estão cobertas pela torre na oitava fileira e g7/h7 estão ocupadas pelos próprios peões pretos, é xeque-mate.",
                pattern:
                  "Prova de domínio: a mesma cravada absoluta da lição, agora levando direto ao mate porque o rei preto não tinha nenhuma casa de fuga.",
                transferableRule:
                  "Sempre que capturar uma peça cravada, confira se a captura também dá xeque — às vezes o rei adversário fica sem nenhuma resposta.",
              },
              hints: [
                "O cavalo de e8 está cravado entre sua torre e o rei preto.",
                "Sua torre já pode capturar o cavalo diretamente.",
                "Depois de capturar, confira as casas de fuga do rei — g7 e h7 têm peões pretos.",
              ],
              marks: [{ kind: "arrow", from: "a8", to: "e8", tone: "good" }],
              tags: ["cravada", "absoluta", "mate"],
              expectedSeconds: 45,
              points: 15,
            },
            {
              slug: "e3.r6",
              phase: "MASTERY_TEST",
              type: "BEST_MOVE",
              prompt: "As brancas jogam. O cavalo preto está cravado contra a dama.",
              fen: "1q4k1/p1p2ppp/1n6/3b4/2P4Q/8/P2PPPP1/1R4K1 w - - 0 1",
              sideToMove: "w",
              skillIds: ["e3.cravada-relativa"],
              difficulty: 7,
              ratingHint: 890,
              acceptedAnswer: { moves: ["cxd5"] },
              predictableErrors: [
                {
                  answer: "Tb2",
                  cause: "CANDIDATE_IGNORED",
                  explanation:
                    "Tb2 recua a torre sem necessidade e ignora a captura disponível em d5 — o bispo ali só é defendido pelo cavalo cravado. Compare sempre as capturas disponíveis antes de um lance de espera.",
                },
              ],
              explanation: {
                perceived:
                  "Você viu um cavalo preto entre sua torre e a dama preta, e um bispo preto em d5 defendido só por esse cavalo.",
                threat: "Nenhuma ameaça contra você — o bispo de d5 está, na prática, indefeso.",
                bestDefense: "As pretas podem recapturar com o cavalo, mas isso perde a dama para sua torre — elas preferem perder só o bispo.",
                reason: "cxd5 captura o bispo. Recapturar com o cavalo de b6 abriria a coluna b e perderia a dama para Txb8.",
                pattern: "Prova de domínio: mesma cravada relativa da lição, com a captura vindo de um peão em vez de outra peça.",
                transferableRule:
                  "A cravada relativa vale para qualquer peça atacante, não só peças maiores — inclusive peões. O que importa é sempre o que está atrás da peça cravada.",
              },
              hints: [
                "O cavalo de b6 está entre sua torre e a dama preta — cravado contra a dama.",
                "O bispo de d5 só tem o cavalo cravado como defensor.",
                "cxd5 captura o bispo. Recapturar com o cavalo perderia a dama.",
              ],
              marks: [
                { kind: "arrow", from: "c4", to: "d5", tone: "good" },
                { kind: "highlight", from: "b6", tone: "neutral" },
              ],
              tags: ["cravada", "relativa"],
              expectedSeconds: 45,
              points: 15,
            },
          ],
        },
      ],
      practice: [
        // ── e3.cravada-absoluta (4 itens além do da lição)
        {
          slug: "e3.a2",
          phase: "INDEPENDENT",
          type: "BEST_MOVE",
          prompt: "As brancas jogam. O cavalo preto está cravado — ele não pode se mexer.",
          fen: "r6k/pppppp2/6pn/8/8/5N2/PPPPPPP1/1K5R w - - 0 1",
          sideToMove: "w",
          skillIds: ["e3.cravada-absoluta"],
          difficulty: 4,
          ratingHint: 820,
          acceptedAnswer: { moves: ["Txh6"] },
          predictableErrors: [
            {
              answer: "Cg5",
              cause: "CANDIDATE_IGNORED",
              explanation:
                "Cg5 ignora a captura disponível na coluna h — o cavalo preto está cravado e não pode recapturar. Antes de jogar outra peça, confira se existe uma peça cravada e indefesa no tabuleiro.",
            },
          ],
          explanation: {
            perceived: "Você viu um cavalo preto na coluna h, na mesma linha do rei preto e da sua torre.",
            threat: "Nenhuma ameaça contra você — o cavalo de h6 está indefeso.",
            bestDefense: "As pretas não têm defesa: o cavalo está cravado contra o próprio rei e não tem outro defensor.",
            reason: "Txh6 captura o cavalo cravado, que não pode recapturar nem fugir.",
            pattern: "Mesma cravada absoluta da lição, agora do outro lado do tabuleiro — a geometria da torre não muda de lado.",
            transferableRule: "Depois de aprender a reconhecer uma cravada absoluta, procure-a dos dois lados do tabuleiro.",
          },
          hints: [
            "O cavalo de h6 está na mesma coluna que o rei preto e sua torre — cravado.",
            "Uma peça cravada ao rei não pode se mover.",
            "Txh6 captura de graça — confira que ninguém mais defende h6.",
          ],
          marks: [{ kind: "arrow", from: "h1", to: "h6", tone: "good" }],
          tags: ["cravada", "absoluta"],
          expectedSeconds: 30,
          points: 9,
        },
        {
          slug: "e3.a3",
          phase: "INDEPENDENT",
          type: "BEST_MOVE",
          prompt: "As brancas jogam. O cavalo preto está cravado — ele não pode se mexer.",
          fen: "1k5r/3ppppp/pnp5/8/8/3N4/P1PPPPPP/1R4K1 w - - 0 1",
          sideToMove: "w",
          skillIds: ["e3.cravada-absoluta"],
          difficulty: 5,
          ratingHint: 850,
          acceptedAnswer: { moves: ["Txb6"] },
          predictableErrors: [
            {
              answer: "Ce5",
              cause: "PATTERN",
              explanation:
                "Ce5 desenvolve o cavalo mas ignora a cravada: o cavalo preto em b6 está preso entre sua torre e o rei preto e não tem defensor. Antes de qualquer outro plano, capture a peça cravada indefesa.",
            },
          ],
          explanation: {
            perceived: "Você viu um cavalo preto na coluna b, na mesma linha do rei preto e da sua torre.",
            threat: "Nenhuma ameaça contra você — o cavalo de b6 está indefeso.",
            bestDefense: "As pretas não têm defesa: o cavalo está cravado contra o rei e não tem outro defensor.",
            reason: "Txb6 captura o cavalo cravado, que não pode recapturar nem fugir.",
            pattern: "Mesma cravada absoluta, com o rei preto num canto diferente — vale para qualquer coluna aberta entre torre e rei.",
            transferableRule:
              "Uma peça cravada indefesa é sempre capturável de graça, não importa em qual coluna ou fileira a cravada acontece.",
          },
          hints: [
            "O cavalo de b6 está na mesma coluna que o rei preto e sua torre — cravado.",
            "Confira se alguma peça preta defende b6 antes de decidir.",
            "Txb6 captura de graça — ninguém mais defende a casa.",
          ],
          marks: [{ kind: "arrow", from: "b1", to: "b6", tone: "good" }],
          tags: ["cravada", "absoluta"],
          expectedSeconds: 35,
          points: 11,
        },
        {
          slug: "e3.a4",
          phase: "INDEPENDENT",
          type: "BEST_MOVE",
          prompt: "As brancas jogam. O cavalo preto está cravado — ele não pode se mexer.",
          fen: "r5k1/ppppp3/5pnp/8/8/4N3/PPPPPP1P/1K4R1 w - - 0 1",
          sideToMove: "w",
          skillIds: ["e3.cravada-absoluta"],
          difficulty: 5,
          ratingHint: 860,
          acceptedAnswer: { moves: ["Txg6"] },
          predictableErrors: [
            {
              answer: "Cd5",
              cause: "PATTERN",
              explanation:
                "Cd5 ignora a cravada: o cavalo preto em g6 está preso entre sua torre e o rei preto e não tem defensor. Confira sempre se existe uma peça cravada indefesa antes de escolher outro plano.",
            },
          ],
          explanation: {
            perceived: "Você viu um cavalo preto na coluna g, na mesma linha do rei preto e da sua torre.",
            threat: "Nenhuma ameaça contra você — o cavalo de g6 está indefeso.",
            bestDefense: "As pretas não têm defesa: o cavalo está cravado contra o rei e não tem outro defensor.",
            reason: "Txg6 captura o cavalo cravado, que não pode recapturar nem fugir.",
            pattern: "Mesma cravada absoluta, mais uma vez do outro lado do tabuleiro.",
            transferableRule: "Treine reconhecer a cravada absoluta em qualquer coluna — o padrão geométrico é sempre o mesmo.",
          },
          hints: [
            "O cavalo de g6 está na mesma coluna que o rei preto e sua torre — cravado.",
            "Confira se alguma peça preta defende g6.",
            "Txg6 captura de graça.",
          ],
          marks: [{ kind: "arrow", from: "g1", to: "g6", tone: "good" }],
          tags: ["cravada", "absoluta"],
          expectedSeconds: 35,
          points: 11,
        },
        {
          slug: "e3.a5",
          phase: "INDEPENDENT",
          type: "BEST_MOVE",
          prompt: "As brancas jogam. Encontre o lance que aproveita a cravada.",
          fen: "k2n3R/pppppppp/6n1/8/8/5N2/PPPPPPPP/1K6 w - - 0 1",
          sideToMove: "w",
          skillIds: ["e3.cravada-absoluta"],
          difficulty: 6,
          ratingHint: 880,
          acceptedAnswer: { moves: ["Txd8#"] },
          predictableErrors: [
            {
              answer: "Tg8",
              cause: "CANDIDATE_IGNORED",
              explanation:
                "Tg8 não captura nada e deixa o cavalo de d8 cravado no tabuleiro, sem aproveitar a chance. Antes de deslocar a torre, veja se ela já pode capturar a peça cravada.",
            },
          ],
          explanation: {
            perceived:
              "Você viu um cavalo preto cravado na oitava fileira, entre sua torre e o rei preto encurralado no canto.",
            threat: "Nenhuma ameaça contra você — o cavalo de d8 está indefeso e o rei preto não tem casas de fuga.",
            bestDefense: "As pretas não têm defesa: o cavalo não pode recapturar e o rei não tem para onde ir.",
            reason:
              "Txd8 captura o cavalo cravado e, como o rei preto está sem casas de fuga (a7 e b7 ocupadas pelos próprios peões), é xeque-mate.",
            pattern: "Mesma combinação de cravada e mate da prova de domínio, agora no outro canto do tabuleiro.",
            transferableRule:
              "Depois de capturar uma peça cravada, sempre confira se o rei adversário ficou sem casas de fuga — a cravada pode virar mate.",
          },
          hints: [
            "O cavalo de d8 está cravado entre sua torre e o rei preto.",
            "Sua torre já pode capturar o cavalo diretamente.",
            "Depois de capturar, confira as casas de fuga do rei — a7 e b7 têm peões pretos.",
          ],
          marks: [{ kind: "arrow", from: "h8", to: "d8", tone: "good" }],
          tags: ["cravada", "absoluta", "mate"],
          expectedSeconds: 40,
          points: 13,
        },
        // ── e3.cravada-relativa (4 itens além do da lição)
        {
          slug: "e3.r2",
          phase: "INDEPENDENT",
          type: "BEST_MOVE",
          prompt: "As brancas jogam. O cavalo preto está cravado contra a dama.",
          fen: "1k4q1/ppp2p1p/6n1/4b3/Q2P4/8/PPP2P1P/2K3R1 w - - 0 1",
          sideToMove: "w",
          skillIds: ["e3.cravada-relativa"],
          difficulty: 5,
          ratingHint: 850,
          acceptedAnswer: { moves: ["dxe5"] },
          predictableErrors: [
            {
              answer: "Txg6",
              cause: "PATTERN",
              explanation:
                "Txg6 captura o cavalo cravado, mas Dxg6 recaptura em seguida — você perde a torre por um cavalo. O cavalo cravado não é o alvo: é o que ELE defende que está indefeso de verdade.",
            },
          ],
          explanation: {
            perceived:
              "Você viu um cavalo preto entre sua torre e a dama preta, e um bispo preto em e5 defendido só por esse cavalo.",
            threat: "Nenhuma ameaça contra você — o bispo de e5 está, na prática, indefeso.",
            bestDefense: "As pretas podem recapturar com o cavalo, mas isso perde a dama para sua torre — elas preferem perder só o bispo.",
            reason: "dxe5 captura o bispo. Recapturar com o cavalo de g6 abriria a coluna g e perderia a dama.",
            pattern: "Cravada relativa: o alvo certo não é a peça cravada, é o que ela defende.",
            transferableRule:
              "Antes de capturar a peça cravada em si, pergunte: o que ela está defendendo? Geralmente é aquilo que está indefeso de verdade.",
          },
          hints: [
            "O cavalo de g6 está entre sua torre e a dama preta — cravado contra a dama.",
            "O bispo de e5 só tem o cavalo cravado como defensor.",
            "dxe5 captura o bispo. Recapturar com o cavalo perderia a dama.",
          ],
          marks: [
            { kind: "arrow", from: "d4", to: "e5", tone: "good" },
            { kind: "highlight", from: "g6", tone: "neutral" },
          ],
          tags: ["cravada", "relativa"],
          expectedSeconds: 40,
          points: 12,
        },
        {
          slug: "e3.r3",
          phase: "INDEPENDENT",
          type: "BEST_MOVE",
          prompt: "As brancas jogam. O cavalo preto está cravado contra a dama.",
          fen: "1q4k1/p1p2ppp/1n6/3b4/4P2Q/8/P1P2PPP/1R3K2 w - - 0 1",
          sideToMove: "w",
          skillIds: ["e3.cravada-relativa"],
          difficulty: 5,
          ratingHint: 860,
          acceptedAnswer: { moves: ["exd5"] },
          predictableErrors: [
            {
              answer: "Txb6",
              cause: "PATTERN",
              explanation:
                "Txb6 captura o cavalo cravado, mas Dxb6 recaptura — você perde a torre por um cavalo. O alvo certo é o que o cavalo defende, não ele mesmo.",
            },
          ],
          explanation: {
            perceived:
              "Você viu um cavalo preto entre sua torre e a dama preta, e um bispo preto em d5 defendido só por esse cavalo.",
            threat: "Nenhuma ameaça contra você — o bispo de d5 está, na prática, indefeso.",
            bestDefense: "As pretas podem recapturar com o cavalo, mas isso perde a dama — elas preferem perder só o bispo.",
            reason: "exd5 captura o bispo. Recapturar com o cavalo de b6 abriria a coluna b e perderia a dama.",
            pattern: "Mesma cravada relativa, do outro lado do tabuleiro.",
            transferableRule: "O alvo certo numa cravada relativa é sempre o que a peça cravada defende, não ela mesma.",
          },
          hints: [
            "O cavalo de b6 está entre sua torre e a dama preta — cravado.",
            "O bispo de d5 só tem o cavalo cravado como defensor.",
            "exd5 captura o bispo. Recapturar com o cavalo perderia a dama.",
          ],
          marks: [
            { kind: "arrow", from: "e4", to: "d5", tone: "good" },
            { kind: "highlight", from: "b6", tone: "neutral" },
          ],
          tags: ["cravada", "relativa"],
          expectedSeconds: 40,
          points: 12,
        },
        {
          slug: "e3.r4",
          phase: "INDEPENDENT",
          type: "BEST_MOVE",
          prompt: "As brancas jogam. O cavalo preto está cravado contra a dama.",
          fen: "1k2q3/pppp3p/4n3/6b1/5P2/8/PPP3PP/Q3R1K1 w - - 0 1",
          sideToMove: "w",
          skillIds: ["e3.cravada-relativa"],
          difficulty: 6,
          ratingHint: 880,
          acceptedAnswer: { moves: ["fxg5"] },
          predictableErrors: [
            {
              answer: "Txe6",
              cause: "PATTERN",
              explanation:
                "Txe6 captura o cavalo cravado, mas Dxe6 recaptura — troca torre por cavalo, prejuízo claro. O alvo certo é o bispo que o cavalo defende, não o cavalo.",
            },
          ],
          explanation: {
            perceived:
              "Você viu um cavalo preto entre sua torre e a dama preta, e um bispo preto em g5 defendido só por esse cavalo.",
            threat: "Nenhuma ameaça contra você — o bispo de g5 está, na prática, indefeso.",
            bestDefense: "As pretas podem recapturar com o cavalo, mas isso perde a dama — elas preferem perder só o bispo.",
            reason: "fxg5 captura o bispo. Recapturar com o cavalo de e6 abriria a coluna e e perderia a dama.",
            pattern: "Mesma cravada relativa, com a captura vindo de um peão.",
            transferableRule:
              "A cravada relativa funciona igual não importa qual peça sua faz a captura final — o que importa é o que a peça cravada defende.",
          },
          hints: [
            "O cavalo de e6 está entre sua torre e a dama preta — cravado.",
            "O bispo de g5 só tem o cavalo cravado como defensor.",
            "fxg5 captura o bispo. Recapturar com o cavalo perderia a dama.",
          ],
          marks: [
            { kind: "arrow", from: "f4", to: "g5", tone: "good" },
            { kind: "highlight", from: "e6", tone: "neutral" },
          ],
          tags: ["cravada", "relativa"],
          expectedSeconds: 40,
          points: 13,
        },
        {
          slug: "e3.r5",
          phase: "INDEPENDENT",
          type: "BEST_MOVE",
          prompt: "As brancas jogam. O cavalo preto está cravado contra a dama.",
          fen: "3q2k1/p3pppp/3n4/1b6/2P5/8/PP3PPP/1K1R3Q w - - 0 1",
          sideToMove: "w",
          skillIds: ["e3.cravada-relativa"],
          difficulty: 6,
          ratingHint: 890,
          acceptedAnswer: { moves: ["cxb5"] },
          predictableErrors: [
            {
              answer: "Txd6",
              cause: "PATTERN",
              explanation:
                "Txd6 captura o cavalo cravado, mas Dxd6 recaptura — troca torre por cavalo. O alvo certo é o bispo que o cavalo defende.",
            },
          ],
          explanation: {
            perceived:
              "Você viu um cavalo preto entre sua torre e a dama preta, e um bispo preto em b5 defendido só por esse cavalo.",
            threat: "Nenhuma ameaça contra você — o bispo de b5 está, na prática, indefeso.",
            bestDefense: "As pretas podem recapturar com o cavalo, mas isso perde a dama — elas preferem perder só o bispo.",
            reason: "cxb5 captura o bispo. Recapturar com o cavalo de d6 abriria a coluna d e perderia a dama.",
            pattern: "Mesma cravada relativa mais uma vez, para fixar o padrão.",
            transferableRule:
              "Antes de aceitar 'a peça está protegida', confira se quem protege está cravado — a proteção pode ser só aparente.",
          },
          hints: [
            "O cavalo de d6 está entre sua torre e a dama preta — cravado.",
            "O bispo de b5 só tem o cavalo cravado como defensor.",
            "cxb5 captura o bispo. Recapturar com o cavalo perderia a dama.",
          ],
          marks: [
            { kind: "arrow", from: "c4", to: "b5", tone: "good" },
            { kind: "highlight", from: "d6", tone: "neutral" },
          ],
          tags: ["cravada", "relativa"],
          expectedSeconds: 40,
          points: 13,
        },
      ],
    },
  ],
};

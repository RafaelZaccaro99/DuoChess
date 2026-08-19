/**
 * ARQUIVO GERADO — não editar à mão.
 *
 * Produzido por `npm run content:gerar` com semente 20260819.
 * Rode o comando de novo para reproduzir byte a byte.
 *
 * Cada item saiu daqui já aprovado: o gabarito vem do motor de regras, o
 * avaliador confere o próprio gabarito, e os itens de lance passam pelo gate de
 * engine durante a geração. O CI confere de novo, porque gerador com defeito é
 * possível.
 *
 * 92 itens de prática.
 */

import type { ExerciseInput } from "../schema";

export const PRATICA_RECRUTA: Record<string, ExerciseInput[]> = {
  "r1": [
    {
      "slug": "g.r1.01",
      "phase": "INDEPENDENT",
      "type": "SQUARE_COLOR",
      "prompt": "Sem contar casa por casa: **b4** é clara ou escura?",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r1.cor-casa",
        "r1.localizar"
      ],
      "difficulty": 3,
      "ratingHint": 250,
      "acceptedAnswer": {
        "color": "dark"
      },
      "predictableErrors": [
        {
          "answer": "light",
          "cause": "VISUALIZATION",
          "explanation": "Quem conta casa por casa a partir de a1 costuma parar uma antes. b4 é escura: use a paridade em vez de contar."
        }
      ],
      "explanation": {
        "perceived": "Você localizou b4 e teve que decidir a cor sem olhar o tabuleiro.",
        "threat": "Sem esse automatismo, todo cálculo de final de bispo gasta tempo de relógio que você não tem.",
        "bestDefense": "Some a coluna e a fileira: b é a 2ª coluna, mais 4 dá soma par.",
        "reason": "b4 é escura.",
        "pattern": "Soma ímpar significa casa clara. Soma par significa casa escura.",
        "transferableRule": "O bispo nunca muda a cor da casa. Saber a cor de cor é o que permite calcular finais de bispo sem tabuleiro."
      },
      "hints": [
        "Não conte casa por casa. Use a paridade da coluna e da fileira.",
        "A coluna b é a 2ª. A fileira é 4.",
        "Soma ímpar dá casa clara; soma par dá casa escura."
      ],
      "tags": [
        "square:b4",
        "gerado"
      ],
      "expectedSeconds": 20,
      "points": 6,
      "sources": [
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r1.02",
      "phase": "INDEPENDENT",
      "type": "SQUARE_COLOR",
      "prompt": "Sem contar casa por casa: **c3** é clara ou escura?",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r1.cor-casa",
        "r1.localizar"
      ],
      "difficulty": 4,
      "ratingHint": 250,
      "acceptedAnswer": {
        "color": "dark"
      },
      "predictableErrors": [
        {
          "answer": "light",
          "cause": "VISUALIZATION",
          "explanation": "Quem conta casa por casa a partir de a1 costuma parar uma antes. c3 é escura: use a paridade em vez de contar."
        }
      ],
      "explanation": {
        "perceived": "Você localizou c3 e teve que decidir a cor sem olhar o tabuleiro.",
        "threat": "Sem esse automatismo, todo cálculo de final de bispo gasta tempo de relógio que você não tem.",
        "bestDefense": "Some a coluna e a fileira: c é a 3ª coluna, mais 3 dá soma par.",
        "reason": "c3 é escura.",
        "pattern": "Soma ímpar significa casa clara. Soma par significa casa escura.",
        "transferableRule": "O bispo nunca muda a cor da casa. Saber a cor de cor é o que permite calcular finais de bispo sem tabuleiro."
      },
      "hints": [
        "Não conte casa por casa. Use a paridade da coluna e da fileira.",
        "A coluna c é a 3ª. A fileira é 3.",
        "Soma ímpar dá casa clara; soma par dá casa escura."
      ],
      "tags": [
        "square:c3",
        "gerado"
      ],
      "expectedSeconds": 20,
      "points": 6,
      "sources": [
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r1.03",
      "phase": "REVIEW",
      "type": "SQUARE_COLOR",
      "prompt": "Sem contar casa por casa: **d2** é clara ou escura?",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r1.cor-casa",
        "r1.localizar"
      ],
      "difficulty": 5,
      "ratingHint": 250,
      "acceptedAnswer": {
        "color": "dark"
      },
      "predictableErrors": [
        {
          "answer": "light",
          "cause": "VISUALIZATION",
          "explanation": "Quem conta casa por casa a partir de a1 costuma parar uma antes. d2 é escura: use a paridade em vez de contar."
        }
      ],
      "explanation": {
        "perceived": "Você localizou d2 e teve que decidir a cor sem olhar o tabuleiro.",
        "threat": "Sem esse automatismo, todo cálculo de final de bispo gasta tempo de relógio que você não tem.",
        "bestDefense": "Some a coluna e a fileira: d é a 4ª coluna, mais 2 dá soma par.",
        "reason": "d2 é escura.",
        "pattern": "Soma ímpar significa casa clara. Soma par significa casa escura.",
        "transferableRule": "O bispo nunca muda a cor da casa. Saber a cor de cor é o que permite calcular finais de bispo sem tabuleiro."
      },
      "hints": [
        "Não conte casa por casa. Use a paridade da coluna e da fileira.",
        "A coluna d é a 4ª. A fileira é 2.",
        "Soma ímpar dá casa clara; soma par dá casa escura."
      ],
      "tags": [
        "square:d2",
        "gerado"
      ],
      "expectedSeconds": 20,
      "points": 6,
      "sources": [
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r1.04",
      "phase": "INDEPENDENT",
      "type": "SQUARE_COLOR",
      "prompt": "Sem contar casa por casa: **e1** é clara ou escura?",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r1.cor-casa",
        "r1.localizar"
      ],
      "difficulty": 6,
      "ratingHint": 250,
      "acceptedAnswer": {
        "color": "dark"
      },
      "predictableErrors": [
        {
          "answer": "light",
          "cause": "VISUALIZATION",
          "explanation": "Quem conta casa por casa a partir de a1 costuma parar uma antes. e1 é escura: use a paridade em vez de contar."
        }
      ],
      "explanation": {
        "perceived": "Você localizou e1 e teve que decidir a cor sem olhar o tabuleiro.",
        "threat": "Sem esse automatismo, todo cálculo de final de bispo gasta tempo de relógio que você não tem.",
        "bestDefense": "Some a coluna e a fileira: e é a 5ª coluna, mais 1 dá soma par.",
        "reason": "e1 é escura.",
        "pattern": "Soma ímpar significa casa clara. Soma par significa casa escura.",
        "transferableRule": "O bispo nunca muda a cor da casa. Saber a cor de cor é o que permite calcular finais de bispo sem tabuleiro."
      },
      "hints": [
        "Não conte casa por casa. Use a paridade da coluna e da fileira.",
        "A coluna e é a 5ª. A fileira é 1.",
        "Soma ímpar dá casa clara; soma par dá casa escura."
      ],
      "tags": [
        "square:e1",
        "gerado"
      ],
      "expectedSeconds": 20,
      "points": 6,
      "sources": [
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r1.05",
      "phase": "INDEPENDENT",
      "type": "SQUARE_COLOR",
      "prompt": "Sem contar casa por casa: **e8** é clara ou escura?",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r1.cor-casa",
        "r1.localizar"
      ],
      "difficulty": 7,
      "ratingHint": 250,
      "acceptedAnswer": {
        "color": "light"
      },
      "predictableErrors": [
        {
          "answer": "dark",
          "cause": "VISUALIZATION",
          "explanation": "Quem conta casa por casa a partir de a1 costuma parar uma antes. e8 é clara: use a paridade em vez de contar."
        }
      ],
      "explanation": {
        "perceived": "Você localizou e8 e teve que decidir a cor sem olhar o tabuleiro.",
        "threat": "Sem esse automatismo, todo cálculo de final de bispo gasta tempo de relógio que você não tem.",
        "bestDefense": "Some a coluna e a fileira: e é a 5ª coluna, mais 8 dá soma ímpar.",
        "reason": "e8 é clara.",
        "pattern": "Soma ímpar significa casa clara. Soma par significa casa escura.",
        "transferableRule": "O bispo nunca muda a cor da casa. Saber a cor de cor é o que permite calcular finais de bispo sem tabuleiro."
      },
      "hints": [
        "Não conte casa por casa. Use a paridade da coluna e da fileira.",
        "A coluna e é a 5ª. A fileira é 8.",
        "Soma ímpar dá casa clara; soma par dá casa escura."
      ],
      "tags": [
        "square:e8",
        "gerado"
      ],
      "expectedSeconds": 20,
      "points": 6,
      "sources": [
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r1.06",
      "phase": "REVIEW",
      "type": "SQUARE_COLOR",
      "prompt": "Sem contar casa por casa: **f7** é clara ou escura?",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r1.cor-casa",
        "r1.localizar"
      ],
      "difficulty": 3,
      "ratingHint": 250,
      "acceptedAnswer": {
        "color": "light"
      },
      "predictableErrors": [
        {
          "answer": "dark",
          "cause": "VISUALIZATION",
          "explanation": "Quem conta casa por casa a partir de a1 costuma parar uma antes. f7 é clara: use a paridade em vez de contar."
        }
      ],
      "explanation": {
        "perceived": "Você localizou f7 e teve que decidir a cor sem olhar o tabuleiro.",
        "threat": "Sem esse automatismo, todo cálculo de final de bispo gasta tempo de relógio que você não tem.",
        "bestDefense": "Some a coluna e a fileira: f é a 6ª coluna, mais 7 dá soma ímpar.",
        "reason": "f7 é clara.",
        "pattern": "Soma ímpar significa casa clara. Soma par significa casa escura.",
        "transferableRule": "O bispo nunca muda a cor da casa. Saber a cor de cor é o que permite calcular finais de bispo sem tabuleiro."
      },
      "hints": [
        "Não conte casa por casa. Use a paridade da coluna e da fileira.",
        "A coluna f é a 6ª. A fileira é 7.",
        "Soma ímpar dá casa clara; soma par dá casa escura."
      ],
      "tags": [
        "square:f7",
        "gerado"
      ],
      "expectedSeconds": 20,
      "points": 6,
      "sources": [
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r1.07",
      "phase": "INDEPENDENT",
      "type": "SQUARE_COLOR",
      "prompt": "Sem contar casa por casa: **g6** é clara ou escura?",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r1.cor-casa",
        "r1.localizar"
      ],
      "difficulty": 4,
      "ratingHint": 250,
      "acceptedAnswer": {
        "color": "light"
      },
      "predictableErrors": [
        {
          "answer": "dark",
          "cause": "VISUALIZATION",
          "explanation": "Quem conta casa por casa a partir de a1 costuma parar uma antes. g6 é clara: use a paridade em vez de contar."
        }
      ],
      "explanation": {
        "perceived": "Você localizou g6 e teve que decidir a cor sem olhar o tabuleiro.",
        "threat": "Sem esse automatismo, todo cálculo de final de bispo gasta tempo de relógio que você não tem.",
        "bestDefense": "Some a coluna e a fileira: g é a 7ª coluna, mais 6 dá soma ímpar.",
        "reason": "g6 é clara.",
        "pattern": "Soma ímpar significa casa clara. Soma par significa casa escura.",
        "transferableRule": "O bispo nunca muda a cor da casa. Saber a cor de cor é o que permite calcular finais de bispo sem tabuleiro."
      },
      "hints": [
        "Não conte casa por casa. Use a paridade da coluna e da fileira.",
        "A coluna g é a 7ª. A fileira é 6.",
        "Soma ímpar dá casa clara; soma par dá casa escura."
      ],
      "tags": [
        "square:g6",
        "gerado"
      ],
      "expectedSeconds": 20,
      "points": 6,
      "sources": [
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r1.08",
      "phase": "INDEPENDENT",
      "type": "SQUARE_COLOR",
      "prompt": "Sem contar casa por casa: **h5** é clara ou escura?",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r1.cor-casa",
        "r1.localizar"
      ],
      "difficulty": 5,
      "ratingHint": 250,
      "acceptedAnswer": {
        "color": "light"
      },
      "predictableErrors": [
        {
          "answer": "dark",
          "cause": "VISUALIZATION",
          "explanation": "Quem conta casa por casa a partir de a1 costuma parar uma antes. h5 é clara: use a paridade em vez de contar."
        }
      ],
      "explanation": {
        "perceived": "Você localizou h5 e teve que decidir a cor sem olhar o tabuleiro.",
        "threat": "Sem esse automatismo, todo cálculo de final de bispo gasta tempo de relógio que você não tem.",
        "bestDefense": "Some a coluna e a fileira: h é a 8ª coluna, mais 5 dá soma ímpar.",
        "reason": "h5 é clara.",
        "pattern": "Soma ímpar significa casa clara. Soma par significa casa escura.",
        "transferableRule": "O bispo nunca muda a cor da casa. Saber a cor de cor é o que permite calcular finais de bispo sem tabuleiro."
      },
      "hints": [
        "Não conte casa por casa. Use a paridade da coluna e da fileira.",
        "A coluna h é a 8ª. A fileira é 5.",
        "Soma ímpar dá casa clara; soma par dá casa escura."
      ],
      "tags": [
        "square:h5",
        "gerado"
      ],
      "expectedSeconds": 20,
      "points": 6,
      "sources": [
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r1.09",
      "phase": "REVIEW",
      "type": "SQUARE_COLOR",
      "prompt": "Sem contar casa por casa: **a4** é clara ou escura?",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r1.cor-casa",
        "r1.localizar"
      ],
      "difficulty": 6,
      "ratingHint": 250,
      "acceptedAnswer": {
        "color": "light"
      },
      "predictableErrors": [
        {
          "answer": "dark",
          "cause": "VISUALIZATION",
          "explanation": "Quem conta casa por casa a partir de a1 costuma parar uma antes. a4 é clara: use a paridade em vez de contar."
        }
      ],
      "explanation": {
        "perceived": "Você localizou a4 e teve que decidir a cor sem olhar o tabuleiro.",
        "threat": "Sem esse automatismo, todo cálculo de final de bispo gasta tempo de relógio que você não tem.",
        "bestDefense": "Some a coluna e a fileira: a é a 1ª coluna, mais 4 dá soma ímpar.",
        "reason": "a4 é clara.",
        "pattern": "Soma ímpar significa casa clara. Soma par significa casa escura.",
        "transferableRule": "O bispo nunca muda a cor da casa. Saber a cor de cor é o que permite calcular finais de bispo sem tabuleiro."
      },
      "hints": [
        "Não conte casa por casa. Use a paridade da coluna e da fileira.",
        "A coluna a é a 1ª. A fileira é 4.",
        "Soma ímpar dá casa clara; soma par dá casa escura."
      ],
      "tags": [
        "square:a4",
        "gerado"
      ],
      "expectedSeconds": 20,
      "points": 6,
      "sources": [
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r1.10",
      "phase": "INDEPENDENT",
      "type": "SQUARE_COLOR",
      "prompt": "Sem contar casa por casa: **b3** é clara ou escura?",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r1.cor-casa",
        "r1.localizar"
      ],
      "difficulty": 7,
      "ratingHint": 250,
      "acceptedAnswer": {
        "color": "light"
      },
      "predictableErrors": [
        {
          "answer": "dark",
          "cause": "VISUALIZATION",
          "explanation": "Quem conta casa por casa a partir de a1 costuma parar uma antes. b3 é clara: use a paridade em vez de contar."
        }
      ],
      "explanation": {
        "perceived": "Você localizou b3 e teve que decidir a cor sem olhar o tabuleiro.",
        "threat": "Sem esse automatismo, todo cálculo de final de bispo gasta tempo de relógio que você não tem.",
        "bestDefense": "Some a coluna e a fileira: b é a 2ª coluna, mais 3 dá soma ímpar.",
        "reason": "b3 é clara.",
        "pattern": "Soma ímpar significa casa clara. Soma par significa casa escura.",
        "transferableRule": "O bispo nunca muda a cor da casa. Saber a cor de cor é o que permite calcular finais de bispo sem tabuleiro."
      },
      "hints": [
        "Não conte casa por casa. Use a paridade da coluna e da fileira.",
        "A coluna b é a 2ª. A fileira é 3.",
        "Soma ímpar dá casa clara; soma par dá casa escura."
      ],
      "tags": [
        "square:b3",
        "gerado"
      ],
      "expectedSeconds": 20,
      "points": 6,
      "sources": [
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
  ],
  "r1b": [
    {
      "slug": "g.r1b.01",
      "phase": "INDEPENDENT",
      "type": "NOTATION_READ",
      "prompt": "Qual casa fica no canto **inferior esquerdo** de quem joga com as brancas?",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r1.orientacao",
        "r1.localizar"
      ],
      "difficulty": 4,
      "ratingHint": 300,
      "acceptedAnswer": {
        "choice": "a1"
      },
      "predictableErrors": [
        {
          "answer": "h1",
          "explanation": "h1 é o canto inferior DIREITO das brancas — a casa clara que confirma a orientação.",
          "cause": "RULE"
        },
        {
          "answer": "a8",
          "explanation": "a8 é o canto superior esquerdo visto pelas brancas.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você relacionou coordenada e posição física no tabuleiro.",
        "threat": "Tabuleiro girado inverte todas as diagonais e os dois roques. É erro que aparece em torneio escolar toda semana.",
        "bestDefense": "Confira a casa clara à direita antes do primeiro lance, não no meio da partida.",
        "reason": "a1 é o canto inferior esquerdo das brancas, e é escura — a ponta da diagonal longa a1–h8.",
        "pattern": "Casa clara no canto inferior direito de cada jogador.",
        "transferableRule": "Se o canto inferior direito estiver escuro, chame o árbitro antes de começar — depois do primeiro lance a discussão fica mais difícil."
      },
      "hints": [
        "A coluna a é a mais à esquerda, do ponto de vista das brancas.",
        "A fileira 1 é a mais próxima de quem joga de brancas.",
        "É a casa escura da diagonal longa."
      ],
      "tags": [
        "gerado",
        "orientacao"
      ],
      "expectedSeconds": 25,
      "points": 8,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r1b.02",
      "phase": "INDEPENDENT",
      "type": "NOTATION_READ",
      "prompt": "Você senta com as **pretas**. Qual casa fica no seu canto inferior direito?",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r1.orientacao",
        "r1.localizar"
      ],
      "difficulty": 5,
      "ratingHint": 300,
      "acceptedAnswer": {
        "choice": "a8"
      },
      "predictableErrors": [
        {
          "answer": "h1",
          "explanation": "h1 é o canto inferior direito das BRANCAS. Com as pretas, o tabuleiro está de cabeça para baixo.",
          "cause": "RULE"
        },
        {
          "answer": "h8",
          "explanation": "h8 fica no canto inferior ESQUERDO de quem joga com as pretas.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você relacionou coordenada e posição física no tabuleiro.",
        "threat": "Tabuleiro girado inverte todas as diagonais e os dois roques. É erro que aparece em torneio escolar toda semana.",
        "bestDefense": "Confira a casa clara à direita antes do primeiro lance, não no meio da partida.",
        "reason": "a8 é o canto inferior direito das pretas — e, como manda a regra, é uma casa clara.",
        "pattern": "Casa clara no canto inferior direito de cada jogador.",
        "transferableRule": "Se o canto inferior direito estiver escuro, chame o árbitro antes de começar — depois do primeiro lance a discussão fica mais difícil."
      },
      "hints": [
        "Gire o tabuleiro mentalmente: as pretas veem a fileira 8 mais perto de si.",
        "A regra vale para os dois: casa clara no canto inferior direito.",
        "Qual casa da fileira 8 é clara e fica na ponta?"
      ],
      "tags": [
        "gerado",
        "orientacao"
      ],
      "expectedSeconds": 25,
      "points": 8,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r1b.03",
      "phase": "REVIEW",
      "type": "NOTATION_READ",
      "prompt": "Se o canto inferior direito de um jogador estiver **escuro**, o que aconteceu?",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r1.orientacao",
        "r1.localizar"
      ],
      "difficulty": 6,
      "ratingHint": 300,
      "acceptedAnswer": {
        "choice": "o tabuleiro está girado"
      },
      "predictableErrors": [
        {
          "answer": "está correto",
          "explanation": "Não está: a regra é casa CLARA no canto inferior direito de cada jogador.",
          "cause": "RULE"
        },
        {
          "answer": "depende da cor das peças",
          "explanation": "Não depende. A orientação é a mesma para os dois lados.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você relacionou coordenada e posição física no tabuleiro.",
        "threat": "Tabuleiro girado inverte todas as diagonais e os dois roques. É erro que aparece em torneio escolar toda semana.",
        "bestDefense": "Confira a casa clara à direita antes do primeiro lance, não no meio da partida.",
        "reason": "A regra é casa clara no canto inferior direito. Escura significa tabuleiro girado 90 graus.",
        "pattern": "Casa clara no canto inferior direito de cada jogador.",
        "transferableRule": "Se o canto inferior direito estiver escuro, chame o árbitro antes de começar — depois do primeiro lance a discussão fica mais difícil."
      },
      "hints": [
        "Qual é a regra de montagem do tabuleiro?",
        "Casa clara no canto inferior direito, para os dois jogadores.",
        "Se está escura, alguém girou o tabuleiro."
      ],
      "tags": [
        "gerado",
        "orientacao"
      ],
      "expectedSeconds": 25,
      "points": 8,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r1b.04",
      "phase": "INDEPENDENT",
      "type": "NOTATION_READ",
      "prompt": "Na posição inicial, a **dama branca** começa em qual casa?",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r1.orientacao",
        "r1.localizar"
      ],
      "difficulty": 7,
      "ratingHint": 300,
      "acceptedAnswer": {
        "choice": "d1"
      },
      "predictableErrors": [
        {
          "answer": "e1",
          "explanation": "e1 é a casa do rei branco. A dama fica à esquerda dele, do ponto de vista das brancas.",
          "cause": "RULE"
        },
        {
          "answer": "d8",
          "explanation": "d8 é a casa da dama PRETA.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você relacionou coordenada e posição física no tabuleiro.",
        "threat": "Tabuleiro girado inverte todas as diagonais e os dois roques. É erro que aparece em torneio escolar toda semana.",
        "bestDefense": "Confira a casa clara à direita antes do primeiro lance, não no meio da partida.",
        "reason": "A dama branca começa em d1 — uma casa clara, da cor dela. Rei e dama ocupam d e e.",
        "pattern": "Casa clara no canto inferior direito de cada jogador.",
        "transferableRule": "Se o canto inferior direito estiver escuro, chame o árbitro antes de começar — depois do primeiro lance a discussão fica mais difícil."
      },
      "hints": [
        "A dama começa numa casa da própria cor.",
        "Ela divide o centro da primeira fileira com o rei.",
        "Das duas casas centrais, d1 e e1, qual é clara?"
      ],
      "tags": [
        "gerado",
        "orientacao"
      ],
      "expectedSeconds": 25,
      "points": 8,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r1b.05",
      "phase": "INDEPENDENT",
      "type": "NOTATION_READ",
      "prompt": "Na posição inicial, a **dama preta** começa em qual casa?",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r1.orientacao",
        "r1.localizar"
      ],
      "difficulty": 4,
      "ratingHint": 300,
      "acceptedAnswer": {
        "choice": "d8"
      },
      "predictableErrors": [
        {
          "answer": "e8",
          "explanation": "e8 é a casa do rei preto.",
          "cause": "RULE"
        },
        {
          "answer": "d1",
          "explanation": "d1 é a casa da dama BRANCA.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você relacionou coordenada e posição física no tabuleiro.",
        "threat": "Tabuleiro girado inverte todas as diagonais e os dois roques. É erro que aparece em torneio escolar toda semana.",
        "bestDefense": "Confira a casa clara à direita antes do primeiro lance, não no meio da partida.",
        "reason": "A dama preta começa em d8, casa escura — a cor dela. Os dois reis ficam na coluna e, uma de frente para a outra.",
        "pattern": "Casa clara no canto inferior direito de cada jogador.",
        "transferableRule": "Se o canto inferior direito estiver escuro, chame o árbitro antes de começar — depois do primeiro lance a discussão fica mais difícil."
      },
      "hints": [
        "A dama começa numa casa da própria cor.",
        "Rei e dama ocupam as colunas d e e nas duas cores.",
        "Das duas casas centrais da oitava fileira, qual é escura?"
      ],
      "tags": [
        "gerado",
        "orientacao"
      ],
      "expectedSeconds": 25,
      "points": 8,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r1b.06",
      "phase": "REVIEW",
      "type": "NOTATION_READ",
      "prompt": "As colunas do tabuleiro são nomeadas de a a h. Elas correm em qual direção?",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r1.orientacao",
        "r1.localizar"
      ],
      "difficulty": 5,
      "ratingHint": 300,
      "acceptedAnswer": {
        "choice": "da esquerda para a direita das brancas"
      },
      "predictableErrors": [
        {
          "answer": "de baixo para cima",
          "explanation": "De baixo para cima correm as FILEIRAS, numeradas de 1 a 8.",
          "cause": "RULE"
        },
        {
          "answer": "da esquerda para a direita das pretas",
          "explanation": "A nomeação é fixa e não muda com o lado: a coluna a fica à esquerda de quem joga de brancas.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você relacionou coordenada e posição física no tabuleiro.",
        "threat": "Tabuleiro girado inverte todas as diagonais e os dois roques. É erro que aparece em torneio escolar toda semana.",
        "bestDefense": "Confira a casa clara à direita antes do primeiro lance, não no meio da partida.",
        "reason": "As colunas vão de a a h da esquerda para a direita, visto pelas brancas. Fileiras são as numeradas.",
        "pattern": "Casa clara no canto inferior direito de cada jogador.",
        "transferableRule": "Se o canto inferior direito estiver escuro, chame o árbitro antes de começar — depois do primeiro lance a discussão fica mais difícil."
      },
      "hints": [
        "Uma das duas dimensões usa letras e a outra usa números.",
        "As letras nomeiam as colunas; os números, as fileiras.",
        "A coluna a fica à esquerda de quem joga com as brancas."
      ],
      "tags": [
        "gerado",
        "orientacao"
      ],
      "expectedSeconds": 25,
      "points": 8,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
  ],
  "r2a": [
    {
      "slug": "g.r2a.01",
      "phase": "INDEPENDENT",
      "type": "ATTACKED_SQUARES",
      "prompt": "Marque **todas** as casas atacadas pelo cavalo de f2.",
      "fen": "3k4/8/4K3/8/8/8/5N2/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r2.cavalo",
        "r2.casas-atacadas"
      ],
      "difficulty": 4,
      "ratingHint": 300,
      "acceptedAnswer": {
        "squares": [
          "d1",
          "d3",
          "e4",
          "g4",
          "h1",
          "h3"
        ]
      },
      "predictableErrors": [
        {
          "answer": "g2",
          "cause": "RULE",
          "explanation": "Essa casa não entra: o cavalo não alcança dali. Confira a geometria da peça antes de marcar."
        }
      ],
      "explanation": {
        "perceived": "Você percorreu as direções do cavalo a partir de f2.",
        "threat": "Deixar de ver uma casa atacada é como se perde material sem entender por quê: a peça adversária chega numa casa que você achava segura.",
        "bestDefense": "Percorra as direções em ordem fixa, sempre no mesmo sentido, para não pular nenhuma.",
        "reason": "São 6 casas: d1, d3, e4, g4, h1, h3.",
        "pattern": "Do centro, a peça enxerga o máximo que a sua geometria permite. É por isso que desenvolver para o centro vale um tempo.",
        "transferableRule": "O cavalo troca de cor de casa a cada lance. Se a sua peça está numa casa clara, o cavalo que está a um lance dela só ataca casas escuras."
      },
      "hints": [
        "Percorra as direções do cavalo, uma por vez.",
        "Do centro, essa peça alcança menos casas do que alcançaria de outro ponto do tabuleiro.",
        "São 6 casas no total."
      ],
      "tags": [
        "from:f2",
        "gerado"
      ],
      "expectedSeconds": 44,
      "points": 12,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r2a.02",
      "phase": "INDEPENDENT",
      "type": "ATTACKED_SQUARES",
      "prompt": "Marque **todas** as casas atacadas pelo cavalo de g4.",
      "fen": "8/8/4K3/8/6N1/8/4k3/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r2.cavalo",
        "r2.casas-atacadas"
      ],
      "difficulty": 5,
      "ratingHint": 300,
      "acceptedAnswer": {
        "squares": [
          "e3",
          "e5",
          "f2",
          "f6",
          "h2",
          "h6"
        ]
      },
      "predictableErrors": [
        {
          "answer": "h4",
          "cause": "RULE",
          "explanation": "Essa casa não entra: o cavalo não alcança dali. Confira a geometria da peça antes de marcar."
        }
      ],
      "explanation": {
        "perceived": "Você percorreu as direções do cavalo a partir de g4.",
        "threat": "Deixar de ver uma casa atacada é como se perde material sem entender por quê: a peça adversária chega numa casa que você achava segura.",
        "bestDefense": "Percorra as direções em ordem fixa, sempre no mesmo sentido, para não pular nenhuma.",
        "reason": "São 6 casas: e3, e5, f2, f6, h2, h6.",
        "pattern": "Do centro, a peça enxerga o máximo que a sua geometria permite. É por isso que desenvolver para o centro vale um tempo.",
        "transferableRule": "O cavalo troca de cor de casa a cada lance. Se a sua peça está numa casa clara, o cavalo que está a um lance dela só ataca casas escuras."
      },
      "hints": [
        "Percorra as direções do cavalo, uma por vez.",
        "Do centro, essa peça alcança menos casas do que alcançaria de outro ponto do tabuleiro.",
        "São 6 casas no total."
      ],
      "tags": [
        "from:g4",
        "gerado"
      ],
      "expectedSeconds": 44,
      "points": 12,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r2a.03",
      "phase": "REVIEW",
      "type": "ATTACKED_SQUARES",
      "prompt": "Marque **todas** as casas atacadas pelo cavalo de d5.",
      "fen": "8/8/8/3N4/8/8/7K/4k3 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r2.cavalo",
        "r2.casas-atacadas"
      ],
      "difficulty": 6,
      "ratingHint": 300,
      "acceptedAnswer": {
        "squares": [
          "b4",
          "b6",
          "c3",
          "c7",
          "e3",
          "e7",
          "f4",
          "f6"
        ]
      },
      "predictableErrors": [
        {
          "answer": "e5",
          "cause": "RULE",
          "explanation": "Essa casa não entra: o cavalo não alcança dali. Confira a geometria da peça antes de marcar."
        }
      ],
      "explanation": {
        "perceived": "Você percorreu as direções do cavalo a partir de d5.",
        "threat": "Deixar de ver uma casa atacada é como se perde material sem entender por quê: a peça adversária chega numa casa que você achava segura.",
        "bestDefense": "Percorra as direções em ordem fixa, sempre no mesmo sentido, para não pular nenhuma.",
        "reason": "São 8 casas: b4, b6, c3, c7, e3, e7, f4, f6.",
        "pattern": "Do centro, a peça enxerga o máximo que a sua geometria permite. É por isso que desenvolver para o centro vale um tempo.",
        "transferableRule": "O cavalo troca de cor de casa a cada lance. Se a sua peça está numa casa clara, o cavalo que está a um lance dela só ataca casas escuras."
      },
      "hints": [
        "Percorra as direções do cavalo, uma por vez.",
        "Do centro, essa peça alcança menos casas do que alcançaria de outro ponto do tabuleiro.",
        "São 8 casas no total."
      ],
      "tags": [
        "from:d5",
        "gerado"
      ],
      "expectedSeconds": 52,
      "points": 14,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r2a.04",
      "phase": "INDEPENDENT",
      "type": "ATTACKED_SQUARES",
      "prompt": "Marque **todas** as casas atacadas pelo cavalo de d8.",
      "fen": "1K1N4/8/8/8/8/8/8/4k3 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r2.cavalo",
        "r2.casas-atacadas"
      ],
      "difficulty": 7,
      "ratingHint": 300,
      "acceptedAnswer": {
        "squares": [
          "b7",
          "c6",
          "e6",
          "f7"
        ]
      },
      "predictableErrors": [
        {
          "answer": "e8",
          "cause": "RULE",
          "explanation": "Essa casa não entra: o cavalo não alcança dali. Confira a geometria da peça antes de marcar."
        }
      ],
      "explanation": {
        "perceived": "Você percorreu as direções do cavalo a partir de d8.",
        "threat": "Deixar de ver uma casa atacada é como se perde material sem entender por quê: a peça adversária chega numa casa que você achava segura.",
        "bestDefense": "Percorra as direções em ordem fixa, sempre no mesmo sentido, para não pular nenhuma.",
        "reason": "São 4 casas: b7, c6, e6, f7.",
        "pattern": "Na borda, metade das direções sai do tabuleiro. A peça continua a mesma, mas trabalha com menos.",
        "transferableRule": "O cavalo troca de cor de casa a cada lance. Se a sua peça está numa casa clara, o cavalo que está a um lance dela só ataca casas escuras."
      },
      "hints": [
        "Percorra as direções do cavalo, uma por vez.",
        "Do borda, essa peça alcança menos casas do que alcançaria de outro ponto do tabuleiro.",
        "São 4 casas no total."
      ],
      "tags": [
        "from:d8",
        "gerado"
      ],
      "expectedSeconds": 36,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r2a.05",
      "phase": "INDEPENDENT",
      "type": "ATTACKED_SQUARES",
      "prompt": "Marque **todas** as casas atacadas pelo cavalo de h6.",
      "fen": "8/8/7N/8/8/5K2/8/1k6 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r2.cavalo",
        "r2.casas-atacadas"
      ],
      "difficulty": 4,
      "ratingHint": 300,
      "acceptedAnswer": {
        "squares": [
          "f5",
          "f7",
          "g4",
          "g8"
        ]
      },
      "predictableErrors": [
        {
          "answer": "h7",
          "cause": "RULE",
          "explanation": "Essa casa não entra: o cavalo não alcança dali. Confira a geometria da peça antes de marcar."
        }
      ],
      "explanation": {
        "perceived": "Você percorreu as direções do cavalo a partir de h6.",
        "threat": "Deixar de ver uma casa atacada é como se perde material sem entender por quê: a peça adversária chega numa casa que você achava segura.",
        "bestDefense": "Percorra as direções em ordem fixa, sempre no mesmo sentido, para não pular nenhuma.",
        "reason": "São 4 casas: f5, f7, g4, g8.",
        "pattern": "Na borda, metade das direções sai do tabuleiro. A peça continua a mesma, mas trabalha com menos.",
        "transferableRule": "O cavalo troca de cor de casa a cada lance. Se a sua peça está numa casa clara, o cavalo que está a um lance dela só ataca casas escuras."
      },
      "hints": [
        "Percorra as direções do cavalo, uma por vez.",
        "Do borda, essa peça alcança menos casas do que alcançaria de outro ponto do tabuleiro.",
        "São 4 casas no total."
      ],
      "tags": [
        "from:h6",
        "gerado"
      ],
      "expectedSeconds": 36,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r2a.06",
      "phase": "REVIEW",
      "type": "ATTACKED_SQUARES",
      "prompt": "Marque **todas** as casas atacadas pelo cavalo de b2.",
      "fen": "1k6/8/8/2K5/8/8/1N6/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r2.cavalo",
        "r2.casas-atacadas"
      ],
      "difficulty": 5,
      "ratingHint": 300,
      "acceptedAnswer": {
        "squares": [
          "a4",
          "c4",
          "d1",
          "d3"
        ]
      },
      "predictableErrors": [
        {
          "answer": "c2",
          "cause": "RULE",
          "explanation": "Essa casa não entra: o cavalo não alcança dali. Confira a geometria da peça antes de marcar."
        }
      ],
      "explanation": {
        "perceived": "Você percorreu as direções do cavalo a partir de b2.",
        "threat": "Deixar de ver uma casa atacada é como se perde material sem entender por quê: a peça adversária chega numa casa que você achava segura.",
        "bestDefense": "Percorra as direções em ordem fixa, sempre no mesmo sentido, para não pular nenhuma.",
        "reason": "São 4 casas: a4, c4, d1, d3.",
        "pattern": "Do centro, a peça enxerga o máximo que a sua geometria permite. É por isso que desenvolver para o centro vale um tempo.",
        "transferableRule": "O cavalo troca de cor de casa a cada lance. Se a sua peça está numa casa clara, o cavalo que está a um lance dela só ataca casas escuras."
      },
      "hints": [
        "Percorra as direções do cavalo, uma por vez.",
        "Do centro, essa peça alcança menos casas do que alcançaria de outro ponto do tabuleiro.",
        "São 4 casas no total."
      ],
      "tags": [
        "from:b2",
        "gerado"
      ],
      "expectedSeconds": 36,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
  ],
  "r2b": [
    {
      "slug": "g.r2b.01",
      "phase": "INDEPENDENT",
      "type": "ATTACKED_SQUARES",
      "prompt": "Marque **todas** as casas atacadas pela torre de b8.",
      "fen": "1R6/8/4KP2/8/k7/3p4/8/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r2.linhas",
        "r2.casas-atacadas"
      ],
      "difficulty": 5,
      "ratingHint": 400,
      "acceptedAnswer": {
        "squares": [
          "a8",
          "b1",
          "b2",
          "b3",
          "b4",
          "b5",
          "b6",
          "b7",
          "c8",
          "d8",
          "e8",
          "f8",
          "g8",
          "h8"
        ]
      },
      "predictableErrors": [
        {
          "answer": "a7",
          "cause": "RULE",
          "explanation": "Essa casa não entra: a torre não alcança dali. Confira a geometria da peça antes de marcar."
        }
      ],
      "explanation": {
        "perceived": "Você percorreu as direções da torre a partir de b8.",
        "threat": "Deixar de ver uma casa atacada é como se perde material sem entender por quê: a peça adversária chega numa casa que você achava segura.",
        "bestDefense": "Percorra as direções em ordem fixa, sempre no mesmo sentido, para não pular nenhuma.",
        "reason": "São 14 casas: a8, b1, b2, b3, b4, b5, b6, b7, c8, d8, e8, f8, g8, h8.",
        "pattern": "Na borda, metade das direções sai do tabuleiro. A peça continua a mesma, mas trabalha com menos.",
        "transferableRule": "Peça de linha para na primeira peça do caminho. Se essa peça é sua, ela não é um obstáculo — está sendo defendida."
      },
      "hints": [
        "Percorra as direções da torre, uma por vez.",
        "Do borda, essa peça alcança menos casas do que alcançaria de outro ponto do tabuleiro.",
        "São 14 casas no total."
      ],
      "tags": [
        "from:b8",
        "gerado"
      ],
      "expectedSeconds": 76,
      "points": 20,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r2b.02",
      "phase": "INDEPENDENT",
      "type": "ATTACKED_SQUARES",
      "prompt": "Marque **todas** as casas atacadas pela torre de d3.",
      "fen": "8/4p3/P7/8/8/3RK3/8/5k2 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r2.linhas",
        "r2.casas-atacadas"
      ],
      "difficulty": 6,
      "ratingHint": 400,
      "acceptedAnswer": {
        "squares": [
          "a3",
          "b3",
          "c3",
          "d1",
          "d2",
          "d4",
          "d5",
          "d6",
          "d7",
          "d8",
          "e3"
        ]
      },
      "predictableErrors": [
        {
          "answer": "e4",
          "cause": "RULE",
          "explanation": "Essa casa não entra: a torre não alcança dali. Confira a geometria da peça antes de marcar."
        }
      ],
      "explanation": {
        "perceived": "Você percorreu as direções da torre a partir de d3.",
        "threat": "Deixar de ver uma casa atacada é como se perde material sem entender por quê: a peça adversária chega numa casa que você achava segura.",
        "bestDefense": "Percorra cada direção até encontrar a primeira peça. Essa casa entra na conta; o que vem depois dela, não.",
        "reason": "São 11 casas: a3, b3, c3, d1, d2, d4, d5, d6, d7, d8, e3.",
        "pattern": "Do centro, a peça enxerga o máximo que a sua geometria permite. É por isso que desenvolver para o centro vale um tempo.",
        "transferableRule": "Peça de linha para na primeira peça do caminho. Se essa peça é sua, ela não é um obstáculo — está sendo defendida."
      },
      "hints": [
        "Percorra as direções da torre, uma por vez.",
        "Uma peça no caminho interrompe a linha. A casa dela conta; o que vem depois, não.",
        "São 11 casas no total."
      ],
      "tags": [
        "from:d3",
        "gerado"
      ],
      "expectedSeconds": 64,
      "points": 17,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r2b.03",
      "phase": "REVIEW",
      "type": "ATTACKED_SQUARES",
      "prompt": "Marque **todas** as casas atacadas pela torre de b6.",
      "fen": "8/8/1R6/K6p/8/P7/8/7k w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r2.linhas",
        "r2.casas-atacadas"
      ],
      "difficulty": 7,
      "ratingHint": 400,
      "acceptedAnswer": {
        "squares": [
          "a6",
          "b1",
          "b2",
          "b3",
          "b4",
          "b5",
          "b7",
          "b8",
          "c6",
          "d6",
          "e6",
          "f6",
          "g6",
          "h6"
        ]
      },
      "predictableErrors": [
        {
          "answer": "c7",
          "cause": "RULE",
          "explanation": "Essa casa não entra: a torre não alcança dali. Confira a geometria da peça antes de marcar."
        }
      ],
      "explanation": {
        "perceived": "Você percorreu as direções da torre a partir de b6.",
        "threat": "Deixar de ver uma casa atacada é como se perde material sem entender por quê: a peça adversária chega numa casa que você achava segura.",
        "bestDefense": "Percorra as direções em ordem fixa, sempre no mesmo sentido, para não pular nenhuma.",
        "reason": "São 14 casas: a6, b1, b2, b3, b4, b5, b7, b8, c6, d6, e6, f6, g6, h6.",
        "pattern": "Do centro, a peça enxerga o máximo que a sua geometria permite. É por isso que desenvolver para o centro vale um tempo.",
        "transferableRule": "Peça de linha para na primeira peça do caminho. Se essa peça é sua, ela não é um obstáculo — está sendo defendida."
      },
      "hints": [
        "Percorra as direções da torre, uma por vez.",
        "Do centro, essa peça alcança menos casas do que alcançaria de outro ponto do tabuleiro.",
        "São 14 casas no total."
      ],
      "tags": [
        "from:b6",
        "gerado"
      ],
      "expectedSeconds": 76,
      "points": 20,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r2b.04",
      "phase": "INDEPENDENT",
      "type": "ATTACKED_SQUARES",
      "prompt": "Marque **todas** as casas atacadas pela torre de f3.",
      "fen": "2K5/5P2/8/p1k5/8/5R2/8/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r2.linhas",
        "r2.casas-atacadas"
      ],
      "difficulty": 8,
      "ratingHint": 400,
      "acceptedAnswer": {
        "squares": [
          "a3",
          "b3",
          "c3",
          "d3",
          "e3",
          "f1",
          "f2",
          "f4",
          "f5",
          "f6",
          "f7",
          "g3",
          "h3"
        ]
      },
      "predictableErrors": [
        {
          "answer": "g4",
          "cause": "RULE",
          "explanation": "Essa casa não entra: a torre não alcança dali. Confira a geometria da peça antes de marcar."
        }
      ],
      "explanation": {
        "perceived": "Você percorreu as direções da torre a partir de f3.",
        "threat": "Deixar de ver uma casa atacada é como se perde material sem entender por quê: a peça adversária chega numa casa que você achava segura.",
        "bestDefense": "Percorra cada direção até encontrar a primeira peça. Essa casa entra na conta; o que vem depois dela, não.",
        "reason": "São 13 casas: a3, b3, c3, d3, e3, f1, f2, f4, f5, f6, f7, g3, h3.",
        "pattern": "Do centro, a peça enxerga o máximo que a sua geometria permite. É por isso que desenvolver para o centro vale um tempo.",
        "transferableRule": "Peça de linha para na primeira peça do caminho. Se essa peça é sua, ela não é um obstáculo — está sendo defendida."
      },
      "hints": [
        "Percorra as direções da torre, uma por vez.",
        "Uma peça no caminho interrompe a linha. A casa dela conta; o que vem depois, não.",
        "São 13 casas no total."
      ],
      "tags": [
        "from:f3",
        "gerado"
      ],
      "expectedSeconds": 72,
      "points": 19,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r2b.05",
      "phase": "INDEPENDENT",
      "type": "ATTACKED_SQUARES",
      "prompt": "Marque **todas** as casas atacadas pela torre de f4.",
      "fen": "8/4k3/8/8/5R2/4p3/5P2/5K2 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r2.linhas",
        "r2.casas-atacadas"
      ],
      "difficulty": 5,
      "ratingHint": 400,
      "acceptedAnswer": {
        "squares": [
          "a4",
          "b4",
          "c4",
          "d4",
          "e4",
          "f2",
          "f3",
          "f5",
          "f6",
          "f7",
          "f8",
          "g4",
          "h4"
        ]
      },
      "predictableErrors": [
        {
          "answer": "g5",
          "cause": "RULE",
          "explanation": "Essa casa não entra: a torre não alcança dali. Confira a geometria da peça antes de marcar."
        }
      ],
      "explanation": {
        "perceived": "Você percorreu as direções da torre a partir de f4.",
        "threat": "Deixar de ver uma casa atacada é como se perde material sem entender por quê: a peça adversária chega numa casa que você achava segura.",
        "bestDefense": "Percorra cada direção até encontrar a primeira peça. Essa casa entra na conta; o que vem depois dela, não.",
        "reason": "São 13 casas: a4, b4, c4, d4, e4, f2, f3, f5, f6, f7, f8, g4, h4.",
        "pattern": "Do centro, a peça enxerga o máximo que a sua geometria permite. É por isso que desenvolver para o centro vale um tempo.",
        "transferableRule": "Peça de linha para na primeira peça do caminho. Se essa peça é sua, ela não é um obstáculo — está sendo defendida."
      },
      "hints": [
        "Percorra as direções da torre, uma por vez.",
        "Uma peça no caminho interrompe a linha. A casa dela conta; o que vem depois, não.",
        "São 13 casas no total."
      ],
      "tags": [
        "from:f4",
        "gerado"
      ],
      "expectedSeconds": 72,
      "points": 19,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r2b.06",
      "phase": "REVIEW",
      "type": "ATTACKED_SQUARES",
      "prompt": "Marque **todas** as casas atacadas pela torre de b2.",
      "fen": "7k/7p/P7/8/8/8/1R5K/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r2.linhas",
        "r2.casas-atacadas"
      ],
      "difficulty": 6,
      "ratingHint": 400,
      "acceptedAnswer": {
        "squares": [
          "a2",
          "b1",
          "b3",
          "b4",
          "b5",
          "b6",
          "b7",
          "b8",
          "c2",
          "d2",
          "e2",
          "f2",
          "g2",
          "h2"
        ]
      },
      "predictableErrors": [
        {
          "answer": "c3",
          "cause": "RULE",
          "explanation": "Essa casa não entra: a torre não alcança dali. Confira a geometria da peça antes de marcar."
        }
      ],
      "explanation": {
        "perceived": "Você percorreu as direções da torre a partir de b2.",
        "threat": "Deixar de ver uma casa atacada é como se perde material sem entender por quê: a peça adversária chega numa casa que você achava segura.",
        "bestDefense": "Percorra cada direção até encontrar a primeira peça. Essa casa entra na conta; o que vem depois dela, não.",
        "reason": "São 14 casas: a2, b1, b3, b4, b5, b6, b7, b8, c2, d2, e2, f2, g2, h2.",
        "pattern": "Do centro, a peça enxerga o máximo que a sua geometria permite. É por isso que desenvolver para o centro vale um tempo.",
        "transferableRule": "Peça de linha para na primeira peça do caminho. Se essa peça é sua, ela não é um obstáculo — está sendo defendida."
      },
      "hints": [
        "Percorra as direções da torre, uma por vez.",
        "Uma peça no caminho interrompe a linha. A casa dela conta; o que vem depois, não.",
        "São 14 casas no total."
      ],
      "tags": [
        "from:b2",
        "gerado"
      ],
      "expectedSeconds": 76,
      "points": 20,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
  ],
  "r2c": [
    {
      "slug": "g.r2c.01",
      "phase": "INDEPENDENT",
      "type": "LEGAL_MOVES",
      "prompt": "Marque todas as casas para onde o bispo de g7 **pode ir**.",
      "fen": "8/4K1B1/2P5/8/4k3/1p6/8/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r2.linhas",
        "r2.cavalo"
      ],
      "difficulty": 4,
      "ratingHint": 350,
      "acceptedAnswer": {
        "squares": [
          "a1",
          "b2",
          "c3",
          "d4",
          "e5",
          "f6",
          "f8",
          "h6",
          "h8"
        ]
      },
      "predictableErrors": [
        {
          "answer": "h7",
          "cause": "RULE",
          "explanation": "Essa casa não é destino legal para o bispo a partir de g7."
        }
      ],
      "explanation": {
        "perceived": "Você buscou para onde o bispo de g7 pode ir.",
        "threat": "Deixar de ver uma casa atacada é como se perde material sem entender por quê: a peça adversária chega numa casa que você achava segura.",
        "bestDefense": "Percorra as direções em ordem fixa, sempre no mesmo sentido, para não pular nenhuma.",
        "reason": "São 9 casas de destino: a1, b2, c3, d4, e5, f6, f8, h6, h8.",
        "pattern": "Do centro, a peça enxerga o máximo que a sua geometria permite. É por isso que desenvolver para o centro vale um tempo.",
        "transferableRule": "Onde a peça PODE IR e o que ela ATACA são listas diferentes. A casa ocupada por peça sua é atacada (defendida), mas não é destino."
      },
      "hints": [
        "Comece pelas direções do bispo.",
        "Casa ocupada por peça sua não é destino, mesmo estando na linha.",
        "São 9 destinos possíveis."
      ],
      "tags": [
        "from:g7",
        "gerado"
      ],
      "expectedSeconds": 56,
      "points": 15,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r2c.02",
      "phase": "INDEPENDENT",
      "type": "LEGAL_MOVES",
      "prompt": "Marque todas as casas para onde o bispo de b3 **pode ir**.",
      "fen": "1k6/4P3/8/4K3/8/1B1p4/8/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r2.linhas",
        "r2.cavalo"
      ],
      "difficulty": 5,
      "ratingHint": 350,
      "acceptedAnswer": {
        "squares": [
          "a2",
          "a4",
          "c2",
          "c4",
          "d1",
          "d5",
          "e6",
          "f7",
          "g8"
        ]
      },
      "predictableErrors": [
        {
          "answer": "c3",
          "cause": "RULE",
          "explanation": "Essa casa não é destino legal para o bispo a partir de b3."
        }
      ],
      "explanation": {
        "perceived": "Você buscou para onde o bispo de b3 pode ir.",
        "threat": "Deixar de ver uma casa atacada é como se perde material sem entender por quê: a peça adversária chega numa casa que você achava segura.",
        "bestDefense": "Percorra as direções em ordem fixa, sempre no mesmo sentido, para não pular nenhuma.",
        "reason": "São 9 casas de destino: a2, a4, c2, c4, d1, d5, e6, f7, g8.",
        "pattern": "Do centro, a peça enxerga o máximo que a sua geometria permite. É por isso que desenvolver para o centro vale um tempo.",
        "transferableRule": "Onde a peça PODE IR e o que ela ATACA são listas diferentes. A casa ocupada por peça sua é atacada (defendida), mas não é destino."
      },
      "hints": [
        "Comece pelas direções do bispo.",
        "Casa ocupada por peça sua não é destino, mesmo estando na linha.",
        "São 9 destinos possíveis."
      ],
      "tags": [
        "from:b3",
        "gerado"
      ],
      "expectedSeconds": 56,
      "points": 15,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r2c.03",
      "phase": "REVIEW",
      "type": "LEGAL_MOVES",
      "prompt": "Marque todas as casas para onde o bispo de c8 **pode ir**.",
      "fen": "2B5/8/8/K7/8/1P5p/8/4k3 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r2.linhas",
        "r2.cavalo"
      ],
      "difficulty": 6,
      "ratingHint": 350,
      "acceptedAnswer": {
        "squares": [
          "a6",
          "b7",
          "d7",
          "e6",
          "f5",
          "g4",
          "h3"
        ]
      },
      "predictableErrors": [
        {
          "answer": "d8",
          "cause": "RULE",
          "explanation": "Essa casa não é destino legal para o bispo a partir de c8."
        }
      ],
      "explanation": {
        "perceived": "Você buscou para onde o bispo de c8 pode ir.",
        "threat": "Deixar de ver uma casa atacada é como se perde material sem entender por quê: a peça adversária chega numa casa que você achava segura.",
        "bestDefense": "Percorra as direções em ordem fixa, sempre no mesmo sentido, para não pular nenhuma.",
        "reason": "São 7 casas de destino: a6, b7, d7, e6, f5, g4, h3.",
        "pattern": "Na borda, metade das direções sai do tabuleiro. A peça continua a mesma, mas trabalha com menos.",
        "transferableRule": "Onde a peça PODE IR e o que ela ATACA são listas diferentes. A casa ocupada por peça sua é atacada (defendida), mas não é destino."
      },
      "hints": [
        "Comece pelas direções do bispo.",
        "Casa ocupada por peça sua não é destino, mesmo estando na linha.",
        "São 7 destinos possíveis."
      ],
      "tags": [
        "from:c8",
        "gerado"
      ],
      "expectedSeconds": 48,
      "points": 13,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r2c.04",
      "phase": "INDEPENDENT",
      "type": "LEGAL_MOVES",
      "prompt": "Marque todas as casas para onde o bispo de f3 **pode ir**.",
      "fen": "K7/5p2/P7/8/3k4/5B2/8/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r2.linhas",
        "r2.cavalo"
      ],
      "difficulty": 4,
      "ratingHint": 350,
      "acceptedAnswer": {
        "squares": [
          "b7",
          "c6",
          "d1",
          "d5",
          "e2",
          "e4",
          "g2",
          "g4",
          "h1",
          "h5"
        ]
      },
      "predictableErrors": [
        {
          "answer": "g3",
          "cause": "RULE",
          "explanation": "Essa casa não é destino legal para o bispo a partir de f3."
        }
      ],
      "explanation": {
        "perceived": "Você buscou para onde o bispo de f3 pode ir.",
        "threat": "Deixar de ver uma casa atacada é como se perde material sem entender por quê: a peça adversária chega numa casa que você achava segura.",
        "bestDefense": "Percorra as direções em ordem fixa, sempre no mesmo sentido, para não pular nenhuma.",
        "reason": "São 10 casas de destino: b7, c6, d1, d5, e2, e4, g2, g4, h1, h5.",
        "pattern": "Do centro, a peça enxerga o máximo que a sua geometria permite. É por isso que desenvolver para o centro vale um tempo.",
        "transferableRule": "Onde a peça PODE IR e o que ela ATACA são listas diferentes. A casa ocupada por peça sua é atacada (defendida), mas não é destino."
      },
      "hints": [
        "Comece pelas direções do bispo.",
        "Casa ocupada por peça sua não é destino, mesmo estando na linha.",
        "São 10 destinos possíveis."
      ],
      "tags": [
        "from:f3",
        "gerado"
      ],
      "expectedSeconds": 60,
      "points": 16,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r2c.05",
      "phase": "INDEPENDENT",
      "type": "LEGAL_MOVES",
      "prompt": "Marque todas as casas para onde o bispo de a5 **pode ir**.",
      "fen": "8/8/Pp4K1/B7/8/7k/8/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r2.linhas",
        "r2.cavalo"
      ],
      "difficulty": 5,
      "ratingHint": 350,
      "acceptedAnswer": {
        "squares": [
          "b4",
          "b6",
          "c3",
          "d2",
          "e1"
        ]
      },
      "predictableErrors": [
        {
          "answer": "b5",
          "cause": "RULE",
          "explanation": "Essa casa não é destino legal para o bispo a partir de a5."
        }
      ],
      "explanation": {
        "perceived": "Você buscou para onde o bispo de a5 pode ir.",
        "threat": "Deixar de ver uma casa atacada é como se perde material sem entender por quê: a peça adversária chega numa casa que você achava segura.",
        "bestDefense": "Percorra as direções em ordem fixa, sempre no mesmo sentido, para não pular nenhuma.",
        "reason": "São 5 casas de destino: b4, b6, c3, d2, e1.",
        "pattern": "Na borda, metade das direções sai do tabuleiro. A peça continua a mesma, mas trabalha com menos.",
        "transferableRule": "Onde a peça PODE IR e o que ela ATACA são listas diferentes. A casa ocupada por peça sua é atacada (defendida), mas não é destino."
      },
      "hints": [
        "Comece pelas direções do bispo.",
        "Casa ocupada por peça sua não é destino, mesmo estando na linha.",
        "São 5 destinos possíveis."
      ],
      "tags": [
        "from:a5",
        "gerado"
      ],
      "expectedSeconds": 40,
      "points": 11,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
  ],
  "r4a": [
    {
      "slug": "g.r4a.01",
      "phase": "INDEPENDENT",
      "type": "IS_MATE_OR_STALEMATE",
      "prompt": "Quem joga são as pretas. Esta posição é xeque, mate, afogamento ou nenhum dos três?",
      "fen": "k7/4K3/8/3Q3N/8/8/R7/8 b - - 0 1",
      "sideToMove": "b",
      "skillIds": [
        "r4.reconhecer"
      ],
      "difficulty": 4,
      "ratingHint": 350,
      "acceptedAnswer": {
        "choice": "xeque"
      },
      "predictableErrors": [
        {
          "answer": "mate",
          "explanation": "Ainda existem respostas legais, então não é mate. Antes de anunciar mate, tente capturar o atacante, bloquear a linha e mover o rei.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você viu que o rei está sendo atacado.",
        "threat": "O rei está em xeque e isso precisa ser resolvido neste lance — não existe adiar.",
        "bestDefense": "Existem 1 respostas legais: capturar o atacante, bloquear a linha ou mover o rei.",
        "reason": "É xeque, e não mate, porque ainda existe pelo menos uma resposta legal.",
        "pattern": "Rei atacado com resposta possível é xeque. Rei atacado sem resposta é mate.",
        "transferableRule": "Antes de anunciar mate, confira as três respostas na ordem: capturar, bloquear, mover. Se alguma funciona, é só xeque."
      },
      "hints": [
        "Primeiro: o rei do lado da vez está sendo atacado?",
        "Depois: existe algum lance legal?",
        "Atacado com resposta é xeque. Atacado sem resposta é mate. Sem ataque e sem resposta é afogamento."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 30,
      "points": 8,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r4a.02",
      "phase": "INDEPENDENT",
      "type": "IS_MATE_OR_STALEMATE",
      "prompt": "Quem joga são as pretas. Esta posição é xeque, mate, afogamento ou nenhum dos três?",
      "fen": "8/8/8/4R3/Q7/8/4k1K1/6N1 b - - 0 1",
      "sideToMove": "b",
      "skillIds": [
        "r4.reconhecer"
      ],
      "difficulty": 5,
      "ratingHint": 350,
      "acceptedAnswer": {
        "choice": "xeque"
      },
      "predictableErrors": [
        {
          "answer": "mate",
          "explanation": "Ainda existem respostas legais, então não é mate. Antes de anunciar mate, tente capturar o atacante, bloquear a linha e mover o rei.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você viu que o rei está sendo atacado.",
        "threat": "O rei está em xeque e isso precisa ser resolvido neste lance — não existe adiar.",
        "bestDefense": "Existem 2 respostas legais: capturar o atacante, bloquear a linha ou mover o rei.",
        "reason": "É xeque, e não mate, porque ainda existe pelo menos uma resposta legal.",
        "pattern": "Rei atacado com resposta possível é xeque. Rei atacado sem resposta é mate.",
        "transferableRule": "Antes de anunciar mate, confira as três respostas na ordem: capturar, bloquear, mover. Se alguma funciona, é só xeque."
      },
      "hints": [
        "Primeiro: o rei do lado da vez está sendo atacado?",
        "Depois: existe algum lance legal?",
        "Atacado com resposta é xeque. Atacado sem resposta é mate. Sem ataque e sem resposta é afogamento."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 30,
      "points": 8,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r4a.03",
      "phase": "REVIEW",
      "type": "IS_MATE_OR_STALEMATE",
      "prompt": "Quem joga são as pretas. Esta posição é xeque, mate, afogamento ou nenhum dos três?",
      "fen": "2N4Q/8/R7/8/7k/8/8/6K1 b - - 0 1",
      "sideToMove": "b",
      "skillIds": [
        "r4.reconhecer"
      ],
      "difficulty": 6,
      "ratingHint": 350,
      "acceptedAnswer": {
        "choice": "xeque"
      },
      "predictableErrors": [
        {
          "answer": "mate",
          "explanation": "Ainda existem respostas legais, então não é mate. Antes de anunciar mate, tente capturar o atacante, bloquear a linha e mover o rei.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você viu que o rei está sendo atacado.",
        "threat": "O rei está em xeque e isso precisa ser resolvido neste lance — não existe adiar.",
        "bestDefense": "Existem 3 respostas legais: capturar o atacante, bloquear a linha ou mover o rei.",
        "reason": "É xeque, e não mate, porque ainda existe pelo menos uma resposta legal.",
        "pattern": "Rei atacado com resposta possível é xeque. Rei atacado sem resposta é mate.",
        "transferableRule": "Antes de anunciar mate, confira as três respostas na ordem: capturar, bloquear, mover. Se alguma funciona, é só xeque."
      },
      "hints": [
        "Primeiro: o rei do lado da vez está sendo atacado?",
        "Depois: existe algum lance legal?",
        "Atacado com resposta é xeque. Atacado sem resposta é mate. Sem ataque e sem resposta é afogamento."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 30,
      "points": 8,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r4a.04",
      "phase": "INDEPENDENT",
      "type": "IS_MATE_OR_STALEMATE",
      "prompt": "Quem joga são as pretas. Esta posição é xeque, mate, afogamento ou nenhum dos três?",
      "fen": "8/2k4N/K7/8/2R5/8/8/1Q6 b - - 0 1",
      "sideToMove": "b",
      "skillIds": [
        "r4.reconhecer"
      ],
      "difficulty": 7,
      "ratingHint": 350,
      "acceptedAnswer": {
        "choice": "xeque"
      },
      "predictableErrors": [
        {
          "answer": "mate",
          "explanation": "Ainda existem respostas legais, então não é mate. Antes de anunciar mate, tente capturar o atacante, bloquear a linha e mover o rei.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você viu que o rei está sendo atacado.",
        "threat": "O rei está em xeque e isso precisa ser resolvido neste lance — não existe adiar.",
        "bestDefense": "Existem 3 respostas legais: capturar o atacante, bloquear a linha ou mover o rei.",
        "reason": "É xeque, e não mate, porque ainda existe pelo menos uma resposta legal.",
        "pattern": "Rei atacado com resposta possível é xeque. Rei atacado sem resposta é mate.",
        "transferableRule": "Antes de anunciar mate, confira as três respostas na ordem: capturar, bloquear, mover. Se alguma funciona, é só xeque."
      },
      "hints": [
        "Primeiro: o rei do lado da vez está sendo atacado?",
        "Depois: existe algum lance legal?",
        "Atacado com resposta é xeque. Atacado sem resposta é mate. Sem ataque e sem resposta é afogamento."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 30,
      "points": 8,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r4a.05",
      "phase": "INDEPENDENT",
      "type": "IS_MATE_OR_STALEMATE",
      "prompt": "Quem joga são as pretas. Esta posição é xeque, mate, afogamento ou nenhum dos três?",
      "fen": "5K2/5N2/8/8/2k5/8/8/2R3Q1 b - - 0 1",
      "sideToMove": "b",
      "skillIds": [
        "r4.reconhecer"
      ],
      "difficulty": 4,
      "ratingHint": 350,
      "acceptedAnswer": {
        "choice": "xeque"
      },
      "predictableErrors": [
        {
          "answer": "mate",
          "explanation": "Ainda existem respostas legais, então não é mate. Antes de anunciar mate, tente capturar o atacante, bloquear a linha e mover o rei.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você viu que o rei está sendo atacado.",
        "threat": "O rei está em xeque e isso precisa ser resolvido neste lance — não existe adiar.",
        "bestDefense": "Existem 5 respostas legais: capturar o atacante, bloquear a linha ou mover o rei.",
        "reason": "É xeque, e não mate, porque ainda existe pelo menos uma resposta legal.",
        "pattern": "Rei atacado com resposta possível é xeque. Rei atacado sem resposta é mate.",
        "transferableRule": "Antes de anunciar mate, confira as três respostas na ordem: capturar, bloquear, mover. Se alguma funciona, é só xeque."
      },
      "hints": [
        "Primeiro: o rei do lado da vez está sendo atacado?",
        "Depois: existe algum lance legal?",
        "Atacado com resposta é xeque. Atacado sem resposta é mate. Sem ataque e sem resposta é afogamento."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 30,
      "points": 8,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
  ],
  "r4b": [
    {
      "slug": "g.r4b.01",
      "phase": "INDEPENDENT",
      "type": "CHECK_ESCAPE",
      "prompt": "As pretas estão em xeque. Encontre uma resposta legal.",
      "fen": "8/k1r5/Q7/4K3/8/8/8/6N1 b - - 0 1",
      "sideToMove": "b",
      "skillIds": [
        "r4.tres-respostas",
        "r4.xeque-cavalo",
        "r4.reconhecer"
      ],
      "difficulty": 5,
      "ratingHint": 450,
      "acceptedAnswer": {
        "moves": [
          "Rb8",
          "Rxa6"
        ]
      },
      "predictableErrors": [
        {
          "answer": "Rb7",
          "cause": "RULE",
          "explanation": "Esse lance deixa o rei atacado, então não é legal. Diante de xeque só valem três coisas: capturar quem ataca, bloquear a linha ou mover o rei para casa segura."
        }
      ],
      "explanation": {
        "perceived": "Você procurou uma saída para o xeque.",
        "threat": "O rei está atacado agora. Nenhum outro plano importa até isso ser resolvido.",
        "bestDefense": "Existem 2 resposta(s) legal(is): Rb8, Rxa6.",
        "reason": "Qualquer uma dessas resolve o xeque. As demais deixariam o rei atacado e por isso são ilegais.",
        "pattern": "Contra xeque, procure sempre na ordem: capturar, bloquear, mover.",
        "transferableRule": "Xeque de cavalo não pode ser bloqueado, porque o cavalo salta. Xeque duplo obriga a mover o rei."
      },
      "hints": [
        "Dá para capturar a peça que dá o xeque?",
        "Dá para colocar uma peça na linha do ataque?",
        "Se nenhuma das duas, mova o rei — e confira quais casas o atacante já cobre."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 45,
      "points": 12,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r4b.02",
      "phase": "INDEPENDENT",
      "type": "CHECK_ESCAPE",
      "prompt": "As pretas estão em xeque. Encontre uma resposta legal.",
      "fen": "8/8/N7/5K2/8/4r2Q/7k/8 b - - 0 1",
      "sideToMove": "b",
      "skillIds": [
        "r4.tres-respostas",
        "r4.xeque-cavalo",
        "r4.reconhecer"
      ],
      "difficulty": 6,
      "ratingHint": 450,
      "acceptedAnswer": {
        "moves": [
          "Txh3",
          "Rxh3",
          "Rg1"
        ]
      },
      "predictableErrors": [
        {
          "answer": "Rg2",
          "cause": "RULE",
          "explanation": "Esse lance deixa o rei atacado, então não é legal. Diante de xeque só valem três coisas: capturar quem ataca, bloquear a linha ou mover o rei para casa segura."
        }
      ],
      "explanation": {
        "perceived": "Você procurou uma saída para o xeque.",
        "threat": "O rei está atacado agora. Nenhum outro plano importa até isso ser resolvido.",
        "bestDefense": "Existem 3 resposta(s) legal(is): Txh3, Rxh3, Rg1.",
        "reason": "Qualquer uma dessas resolve o xeque. As demais deixariam o rei atacado e por isso são ilegais.",
        "pattern": "Contra xeque, procure sempre na ordem: capturar, bloquear, mover.",
        "transferableRule": "Xeque de cavalo não pode ser bloqueado, porque o cavalo salta. Xeque duplo obriga a mover o rei."
      },
      "hints": [
        "Dá para capturar a peça que dá o xeque?",
        "Dá para colocar uma peça na linha do ataque?",
        "Se nenhuma das duas, mova o rei — e confira quais casas o atacante já cobre."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 45,
      "points": 12,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r4b.03",
      "phase": "REVIEW",
      "type": "CHECK_ESCAPE",
      "prompt": "As pretas estão em xeque. Encontre uma resposta legal.",
      "fen": "8/4Q3/8/8/r7/3K4/6N1/4k3 b - - 0 1",
      "sideToMove": "b",
      "skillIds": [
        "r4.tres-respostas",
        "r4.xeque-cavalo",
        "r4.reconhecer"
      ],
      "difficulty": 7,
      "ratingHint": 450,
      "acceptedAnswer": {
        "moves": [
          "Rf2",
          "Rf1",
          "Rd1"
        ]
      },
      "predictableErrors": [
        {
          "answer": "Re2",
          "cause": "RULE",
          "explanation": "Esse lance deixa o rei atacado, então não é legal. Diante de xeque só valem três coisas: capturar quem ataca, bloquear a linha ou mover o rei para casa segura."
        }
      ],
      "explanation": {
        "perceived": "Você procurou uma saída para o xeque.",
        "threat": "O rei está atacado agora. Nenhum outro plano importa até isso ser resolvido.",
        "bestDefense": "Existem 3 resposta(s) legal(is): Rf2, Rf1, Rd1.",
        "reason": "Qualquer uma dessas resolve o xeque. As demais deixariam o rei atacado e por isso são ilegais.",
        "pattern": "Contra xeque, procure sempre na ordem: capturar, bloquear, mover.",
        "transferableRule": "Xeque de cavalo não pode ser bloqueado, porque o cavalo salta. Xeque duplo obriga a mover o rei."
      },
      "hints": [
        "Dá para capturar a peça que dá o xeque?",
        "Dá para colocar uma peça na linha do ataque?",
        "Se nenhuma das duas, mova o rei — e confira quais casas o atacante já cobre."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 45,
      "points": 12,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r4b.04",
      "phase": "INDEPENDENT",
      "type": "CHECK_ESCAPE",
      "prompt": "As pretas estão em xeque. Encontre uma resposta legal.",
      "fen": "8/6r1/8/8/8/5k2/2N2Q2/2K5 b - - 0 1",
      "sideToMove": "b",
      "skillIds": [
        "r4.tres-respostas",
        "r4.xeque-cavalo",
        "r4.reconhecer"
      ],
      "difficulty": 8,
      "ratingHint": 450,
      "acceptedAnswer": {
        "moves": [
          "Re4",
          "Rg4",
          "Rxf2"
        ]
      },
      "predictableErrors": [
        {
          "answer": "Rg3",
          "cause": "RULE",
          "explanation": "Esse lance deixa o rei atacado, então não é legal. Diante de xeque só valem três coisas: capturar quem ataca, bloquear a linha ou mover o rei para casa segura."
        }
      ],
      "explanation": {
        "perceived": "Você procurou uma saída para o xeque.",
        "threat": "O rei está atacado agora. Nenhum outro plano importa até isso ser resolvido.",
        "bestDefense": "Existem 3 resposta(s) legal(is): Re4, Rg4, Rxf2.",
        "reason": "Qualquer uma dessas resolve o xeque. As demais deixariam o rei atacado e por isso são ilegais.",
        "pattern": "Contra xeque, procure sempre na ordem: capturar, bloquear, mover.",
        "transferableRule": "Xeque de cavalo não pode ser bloqueado, porque o cavalo salta. Xeque duplo obriga a mover o rei."
      },
      "hints": [
        "Dá para capturar a peça que dá o xeque?",
        "Dá para colocar uma peça na linha do ataque?",
        "Se nenhuma das duas, mova o rei — e confira quais casas o atacante já cobre."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 45,
      "points": 12,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r4b.05",
      "phase": "INDEPENDENT",
      "type": "CHECK_ESCAPE",
      "prompt": "As pretas estão em xeque. Encontre uma resposta legal.",
      "fen": "2Qk3N/8/8/8/7r/8/6K1/8 b - - 0 1",
      "sideToMove": "b",
      "skillIds": [
        "r4.tres-respostas",
        "r4.xeque-cavalo",
        "r4.reconhecer"
      ],
      "difficulty": 5,
      "ratingHint": 450,
      "acceptedAnswer": {
        "moves": [
          "Re7",
          "Rxc8"
        ]
      },
      "predictableErrors": [
        {
          "answer": "Re8",
          "cause": "RULE",
          "explanation": "Esse lance deixa o rei atacado, então não é legal. Diante de xeque só valem três coisas: capturar quem ataca, bloquear a linha ou mover o rei para casa segura."
        }
      ],
      "explanation": {
        "perceived": "Você procurou uma saída para o xeque.",
        "threat": "O rei está atacado agora. Nenhum outro plano importa até isso ser resolvido.",
        "bestDefense": "Existem 2 resposta(s) legal(is): Re7, Rxc8.",
        "reason": "Qualquer uma dessas resolve o xeque. As demais deixariam o rei atacado e por isso são ilegais.",
        "pattern": "Contra xeque, procure sempre na ordem: capturar, bloquear, mover.",
        "transferableRule": "Xeque de cavalo não pode ser bloqueado, porque o cavalo salta. Xeque duplo obriga a mover o rei."
      },
      "hints": [
        "Dá para capturar a peça que dá o xeque?",
        "Dá para colocar uma peça na linha do ataque?",
        "Se nenhuma das duas, mova o rei — e confira quais casas o atacante já cobre."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 45,
      "points": 12,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r4b.06",
      "phase": "REVIEW",
      "type": "CHECK_ESCAPE",
      "prompt": "As pretas estão em xeque. Encontre uma resposta legal.",
      "fen": "8/8/2K5/2N5/8/k5r1/8/2Q5 b - - 0 1",
      "sideToMove": "b",
      "skillIds": [
        "r4.tres-respostas",
        "r4.xeque-cavalo",
        "r4.reconhecer"
      ],
      "difficulty": 6,
      "ratingHint": 450,
      "acceptedAnswer": {
        "moves": [
          "Rb4",
          "Ra2"
        ]
      },
      "predictableErrors": [
        {
          "answer": "Rb3",
          "cause": "RULE",
          "explanation": "Esse lance deixa o rei atacado, então não é legal. Diante de xeque só valem três coisas: capturar quem ataca, bloquear a linha ou mover o rei para casa segura."
        }
      ],
      "explanation": {
        "perceived": "Você procurou uma saída para o xeque.",
        "threat": "O rei está atacado agora. Nenhum outro plano importa até isso ser resolvido.",
        "bestDefense": "Existem 2 resposta(s) legal(is): Rb4, Ra2.",
        "reason": "Qualquer uma dessas resolve o xeque. As demais deixariam o rei atacado e por isso são ilegais.",
        "pattern": "Contra xeque, procure sempre na ordem: capturar, bloquear, mover.",
        "transferableRule": "Xeque de cavalo não pode ser bloqueado, porque o cavalo salta. Xeque duplo obriga a mover o rei."
      },
      "hints": [
        "Dá para capturar a peça que dá o xeque?",
        "Dá para colocar uma peça na linha do ataque?",
        "Se nenhuma das duas, mova o rei — e confira quais casas o atacante já cobre."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 45,
      "points": 12,
      "sources": [
        "fide-laws",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
  ],
  "r5a": [
    {
      "slug": "g.r5a.01",
      "phase": "INDEPENDENT",
      "type": "BEST_MOVE",
      "prompt": "As brancas jogam e dão mate em 1.",
      "fen": "8/1R6/8/k7/8/8/1K2Q3/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r5.mate-em-1"
      ],
      "difficulty": 5,
      "ratingHint": 500,
      "acceptedAnswer": {
        "moves": [
          "Db5#"
        ]
      },
      "predictableErrors": [
        {
          "answer": "Tb5+",
          "cause": "CALCULATION_STOPPED",
          "explanation": "Esse lance não dá mate. Xeque não é sinônimo de mate: depois de dar o xeque, confira se o rei tem casa, se a peça atacante pode ser capturada e se a linha pode ser bloqueada."
        }
      ],
      "explanation": {
        "perceived": "Você procurou o lance que ataca o rei e fecha todas as saídas ao mesmo tempo.",
        "threat": "O rei ainda tem 1 casa(s) de fuga, e o lance certo precisa cobrir todas elas.",
        "bestDefense": "Depois do lance correto não existe defesa — capturar, bloquear e fugir estão todos fora.",
        "reason": "Db5# é o único mate da posição.",
        "pattern": "Mate em um é xeque somado a zero respostas. Verifique as três: dá para capturar quem deu o xeque? Dá para bloquear? O rei tem casa?",
        "transferableRule": "Xeque não é mate. Antes de jogar o xeque, confira se a peça que ataca pode ser simplesmente capturada."
      },
      "hints": [
        "Comece pelos xeques. Só um deles termina a partida.",
        "O rei adversário tem 1 casa(s) livre(s). O mate precisa cobrir todas.",
        "Depois de escolher, confira: o rei pode capturar quem deu o xeque?"
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 60,
      "points": 14,
      "sources": [
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r5a.02",
      "phase": "INDEPENDENT",
      "type": "BEST_MOVE",
      "prompt": "As brancas jogam e dão mate em 1.",
      "fen": "8/Q7/8/7k/1K6/6R1/8/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r5.mate-em-1"
      ],
      "difficulty": 6,
      "ratingHint": 500,
      "acceptedAnswer": {
        "moves": [
          "Dh7#"
        ]
      },
      "predictableErrors": [
        {
          "answer": "Df7+",
          "cause": "CALCULATION_STOPPED",
          "explanation": "Esse lance não dá mate. Xeque não é sinônimo de mate: depois de dar o xeque, confira se o rei tem casa, se a peça atacante pode ser capturada e se a linha pode ser bloqueada."
        }
      ],
      "explanation": {
        "perceived": "Você procurou o lance que ataca o rei e fecha todas as saídas ao mesmo tempo.",
        "threat": "O rei ainda tem 2 casa(s) de fuga, e o lance certo precisa cobrir todas elas.",
        "bestDefense": "Depois do lance correto não existe defesa — capturar, bloquear e fugir estão todos fora.",
        "reason": "Dh7# é o único mate da posição.",
        "pattern": "Mate em um é xeque somado a zero respostas. Verifique as três: dá para capturar quem deu o xeque? Dá para bloquear? O rei tem casa?",
        "transferableRule": "Xeque não é mate. Antes de jogar o xeque, confira se a peça que ataca pode ser simplesmente capturada."
      },
      "hints": [
        "Comece pelos xeques. Só um deles termina a partida.",
        "O rei adversário tem 2 casa(s) livre(s). O mate precisa cobrir todas.",
        "Depois de escolher, confira: o rei pode capturar quem deu o xeque?"
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 60,
      "points": 14,
      "sources": [
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r5a.03",
      "phase": "REVIEW",
      "type": "BEST_MOVE",
      "prompt": "As brancas jogam e dão mate em 1.",
      "fen": "8/5Q2/8/3K4/8/8/7R/1k6 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r5.mate-em-1"
      ],
      "difficulty": 7,
      "ratingHint": 500,
      "acceptedAnswer": {
        "moves": [
          "Df1#"
        ]
      },
      "predictableErrors": [
        {
          "answer": "Dh7+",
          "cause": "CALCULATION_STOPPED",
          "explanation": "Esse lance não dá mate. Xeque não é sinônimo de mate: depois de dar o xeque, confira se o rei tem casa, se a peça atacante pode ser capturada e se a linha pode ser bloqueada."
        }
      ],
      "explanation": {
        "perceived": "Você procurou o lance que ataca o rei e fecha todas as saídas ao mesmo tempo.",
        "threat": "O rei ainda tem 2 casa(s) de fuga, e o lance certo precisa cobrir todas elas.",
        "bestDefense": "Depois do lance correto não existe defesa — capturar, bloquear e fugir estão todos fora.",
        "reason": "Df1# é o único mate da posição.",
        "pattern": "Mate em um é xeque somado a zero respostas. Verifique as três: dá para capturar quem deu o xeque? Dá para bloquear? O rei tem casa?",
        "transferableRule": "Xeque não é mate. Antes de jogar o xeque, confira se a peça que ataca pode ser simplesmente capturada."
      },
      "hints": [
        "Comece pelos xeques. Só um deles termina a partida.",
        "O rei adversário tem 2 casa(s) livre(s). O mate precisa cobrir todas.",
        "Depois de escolher, confira: o rei pode capturar quem deu o xeque?"
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 60,
      "points": 14,
      "sources": [
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r5a.04",
      "phase": "INDEPENDENT",
      "type": "BEST_MOVE",
      "prompt": "As brancas jogam e dão mate em 1.",
      "fen": "8/7R/3k4/8/3K4/8/8/2Q5 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r5.mate-em-1"
      ],
      "difficulty": 8,
      "ratingHint": 500,
      "acceptedAnswer": {
        "moves": [
          "Dh6#"
        ]
      },
      "predictableErrors": [
        {
          "answer": "Th6+",
          "cause": "CALCULATION_STOPPED",
          "explanation": "Esse lance não dá mate. Xeque não é sinônimo de mate: depois de dar o xeque, confira se o rei tem casa, se a peça atacante pode ser capturada e se a linha pode ser bloqueada."
        }
      ],
      "explanation": {
        "perceived": "Você procurou o lance que ataca o rei e fecha todas as saídas ao mesmo tempo.",
        "threat": "O rei ainda tem 1 casa(s) de fuga, e o lance certo precisa cobrir todas elas.",
        "bestDefense": "Depois do lance correto não existe defesa — capturar, bloquear e fugir estão todos fora.",
        "reason": "Dh6# é o único mate da posição.",
        "pattern": "Mate em um é xeque somado a zero respostas. Verifique as três: dá para capturar quem deu o xeque? Dá para bloquear? O rei tem casa?",
        "transferableRule": "Xeque não é mate. Antes de jogar o xeque, confira se a peça que ataca pode ser simplesmente capturada."
      },
      "hints": [
        "Comece pelos xeques. Só um deles termina a partida.",
        "O rei adversário tem 1 casa(s) livre(s). O mate precisa cobrir todas.",
        "Depois de escolher, confira: o rei pode capturar quem deu o xeque?"
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 60,
      "points": 14,
      "sources": [
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r5a.05",
      "phase": "INDEPENDENT",
      "type": "BEST_MOVE",
      "prompt": "As brancas jogam e dão mate em 1.",
      "fen": "3k4/4R3/8/8/K7/8/2Q5/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r5.mate-em-1"
      ],
      "difficulty": 5,
      "ratingHint": 500,
      "acceptedAnswer": {
        "moves": [
          "Dc7#"
        ]
      },
      "predictableErrors": [
        {
          "answer": "Te8+",
          "cause": "CALCULATION_STOPPED",
          "explanation": "Esse lance não dá mate. Xeque não é sinônimo de mate: depois de dar o xeque, confira se o rei tem casa, se a peça atacante pode ser capturada e se a linha pode ser bloqueada."
        }
      ],
      "explanation": {
        "perceived": "Você procurou o lance que ataca o rei e fecha todas as saídas ao mesmo tempo.",
        "threat": "O rei ainda tem 1 casa(s) de fuga, e o lance certo precisa cobrir todas elas.",
        "bestDefense": "Depois do lance correto não existe defesa — capturar, bloquear e fugir estão todos fora.",
        "reason": "Dc7# é o único mate da posição.",
        "pattern": "Mate em um é xeque somado a zero respostas. Verifique as três: dá para capturar quem deu o xeque? Dá para bloquear? O rei tem casa?",
        "transferableRule": "Xeque não é mate. Antes de jogar o xeque, confira se a peça que ataca pode ser simplesmente capturada."
      },
      "hints": [
        "Comece pelos xeques. Só um deles termina a partida.",
        "O rei adversário tem 1 casa(s) livre(s). O mate precisa cobrir todas.",
        "Depois de escolher, confira: o rei pode capturar quem deu o xeque?"
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 60,
      "points": 14,
      "sources": [
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r5a.06",
      "phase": "REVIEW",
      "type": "BEST_MOVE",
      "prompt": "As brancas jogam e dão mate em 1.",
      "fen": "2K5/k7/3R4/6Q1/8/8/8/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r5.mate-em-1"
      ],
      "difficulty": 6,
      "ratingHint": 500,
      "acceptedAnswer": {
        "moves": [
          "Da5#"
        ]
      },
      "predictableErrors": [
        {
          "answer": "Td7+",
          "cause": "CALCULATION_STOPPED",
          "explanation": "Esse lance não dá mate. Xeque não é sinônimo de mate: depois de dar o xeque, confira se o rei tem casa, se a peça atacante pode ser capturada e se a linha pode ser bloqueada."
        }
      ],
      "explanation": {
        "perceived": "Você procurou o lance que ataca o rei e fecha todas as saídas ao mesmo tempo.",
        "threat": "O rei ainda tem 1 casa(s) de fuga, e o lance certo precisa cobrir todas elas.",
        "bestDefense": "Depois do lance correto não existe defesa — capturar, bloquear e fugir estão todos fora.",
        "reason": "Da5# é o único mate da posição.",
        "pattern": "Mate em um é xeque somado a zero respostas. Verifique as três: dá para capturar quem deu o xeque? Dá para bloquear? O rei tem casa?",
        "transferableRule": "Xeque não é mate. Antes de jogar o xeque, confira se a peça que ataca pode ser simplesmente capturada."
      },
      "hints": [
        "Comece pelos xeques. Só um deles termina a partida.",
        "O rei adversário tem 1 casa(s) livre(s). O mate precisa cobrir todas.",
        "Depois de escolher, confira: o rei pode capturar quem deu o xeque?"
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 60,
      "points": 14,
      "sources": [
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
  ],
  "r5b": [
    {
      "slug": "g.r5b.01",
      "phase": "INDEPENDENT",
      "type": "IS_MATE_OR_STALEMATE",
      "prompt": "Quem joga são as pretas. Esta posição é xeque, mate, afogamento ou nenhum dos três?",
      "fen": "8/3R4/8/8/3Q4/7K/8/7k b - - 0 1",
      "sideToMove": "b",
      "skillIds": [
        "r5.afogamento",
        "r4.reconhecer"
      ],
      "difficulty": 5,
      "ratingHint": 450,
      "acceptedAnswer": {
        "choice": "afogamento"
      },
      "predictableErrors": [
        {
          "answer": "mate",
          "explanation": "Para ser mate, o rei precisa estar ATACADO. Aqui ele não está: sem xeque e sem lance legal, o nome disso é afogamento, e o resultado é empate.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você viu que o lado da vez não tem para onde ir.",
        "threat": "A ameaça aqui é contra quem está ganhando: sem lance legal e sem xeque, o resultado é empate.",
        "bestDefense": "Do lado que está à frente, a defesa contra o próprio erro é deixar uma casa livre antes de aproximar as peças.",
        "reason": "É afogamento: o jogador da vez não está em xeque e não tem nenhum lance legal.",
        "pattern": "Sem xeque somado a sem lance legal é igual a empate.",
        "transferableRule": "Quando estiver muito à frente, antes de cada lance pergunte se o adversário ainda tem lance legal. Meio ponto perdido por descuido custa o mesmo que uma derrota."
      },
      "hints": [
        "Primeiro: o rei do lado da vez está sendo atacado?",
        "Depois: existe algum lance legal?",
        "Atacado com resposta é xeque. Atacado sem resposta é mate. Sem ataque e sem resposta é afogamento."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 30,
      "points": 8,
      "sources": [
        "fide-laws",
        "silman-endgame"
      ]
    },
    {
      "slug": "g.r5b.02",
      "phase": "INDEPENDENT",
      "type": "IS_MATE_OR_STALEMATE",
      "prompt": "Quem joga são as pretas. Esta posição é xeque, mate, afogamento ou nenhum dos três?",
      "fen": "3R4/8/2Q5/k1K5/8/8/8/8 b - - 0 1",
      "sideToMove": "b",
      "skillIds": [
        "r5.afogamento",
        "r4.reconhecer"
      ],
      "difficulty": 6,
      "ratingHint": 450,
      "acceptedAnswer": {
        "choice": "afogamento"
      },
      "predictableErrors": [
        {
          "answer": "mate",
          "explanation": "Para ser mate, o rei precisa estar ATACADO. Aqui ele não está: sem xeque e sem lance legal, o nome disso é afogamento, e o resultado é empate.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você viu que o lado da vez não tem para onde ir.",
        "threat": "A ameaça aqui é contra quem está ganhando: sem lance legal e sem xeque, o resultado é empate.",
        "bestDefense": "Do lado que está à frente, a defesa contra o próprio erro é deixar uma casa livre antes de aproximar as peças.",
        "reason": "É afogamento: o jogador da vez não está em xeque e não tem nenhum lance legal.",
        "pattern": "Sem xeque somado a sem lance legal é igual a empate.",
        "transferableRule": "Quando estiver muito à frente, antes de cada lance pergunte se o adversário ainda tem lance legal. Meio ponto perdido por descuido custa o mesmo que uma derrota."
      },
      "hints": [
        "Primeiro: o rei do lado da vez está sendo atacado?",
        "Depois: existe algum lance legal?",
        "Atacado com resposta é xeque. Atacado sem resposta é mate. Sem ataque e sem resposta é afogamento."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 30,
      "points": 8,
      "sources": [
        "fide-laws",
        "silman-endgame"
      ]
    },
    {
      "slug": "g.r5b.03",
      "phase": "REVIEW",
      "type": "IS_MATE_OR_STALEMATE",
      "prompt": "Quem joga são as pretas. Esta posição é xeque, mate, afogamento ou nenhum dos três?",
      "fen": "7k/8/6Q1/8/7K/8/8/R7 b - - 0 1",
      "sideToMove": "b",
      "skillIds": [
        "r5.afogamento",
        "r4.reconhecer"
      ],
      "difficulty": 7,
      "ratingHint": 450,
      "acceptedAnswer": {
        "choice": "afogamento"
      },
      "predictableErrors": [
        {
          "answer": "mate",
          "explanation": "Para ser mate, o rei precisa estar ATACADO. Aqui ele não está: sem xeque e sem lance legal, o nome disso é afogamento, e o resultado é empate.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você viu que o lado da vez não tem para onde ir.",
        "threat": "A ameaça aqui é contra quem está ganhando: sem lance legal e sem xeque, o resultado é empate.",
        "bestDefense": "Do lado que está à frente, a defesa contra o próprio erro é deixar uma casa livre antes de aproximar as peças.",
        "reason": "É afogamento: o jogador da vez não está em xeque e não tem nenhum lance legal.",
        "pattern": "Sem xeque somado a sem lance legal é igual a empate.",
        "transferableRule": "Quando estiver muito à frente, antes de cada lance pergunte se o adversário ainda tem lance legal. Meio ponto perdido por descuido custa o mesmo que uma derrota."
      },
      "hints": [
        "Primeiro: o rei do lado da vez está sendo atacado?",
        "Depois: existe algum lance legal?",
        "Atacado com resposta é xeque. Atacado sem resposta é mate. Sem ataque e sem resposta é afogamento."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 30,
      "points": 8,
      "sources": [
        "fide-laws",
        "silman-endgame"
      ]
    },
    {
      "slug": "g.r5b.04",
      "phase": "INDEPENDENT",
      "type": "IS_MATE_OR_STALEMATE",
      "prompt": "Quem joga são as pretas. Esta posição é xeque, mate, afogamento ou nenhum dos três?",
      "fen": "8/8/8/8/1Q6/8/5R2/5K1k b - - 0 1",
      "sideToMove": "b",
      "skillIds": [
        "r5.afogamento",
        "r4.reconhecer"
      ],
      "difficulty": 5,
      "ratingHint": 450,
      "acceptedAnswer": {
        "choice": "afogamento"
      },
      "predictableErrors": [
        {
          "answer": "mate",
          "explanation": "Para ser mate, o rei precisa estar ATACADO. Aqui ele não está: sem xeque e sem lance legal, o nome disso é afogamento, e o resultado é empate.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você viu que o lado da vez não tem para onde ir.",
        "threat": "A ameaça aqui é contra quem está ganhando: sem lance legal e sem xeque, o resultado é empate.",
        "bestDefense": "Do lado que está à frente, a defesa contra o próprio erro é deixar uma casa livre antes de aproximar as peças.",
        "reason": "É afogamento: o jogador da vez não está em xeque e não tem nenhum lance legal.",
        "pattern": "Sem xeque somado a sem lance legal é igual a empate.",
        "transferableRule": "Quando estiver muito à frente, antes de cada lance pergunte se o adversário ainda tem lance legal. Meio ponto perdido por descuido custa o mesmo que uma derrota."
      },
      "hints": [
        "Primeiro: o rei do lado da vez está sendo atacado?",
        "Depois: existe algum lance legal?",
        "Atacado com resposta é xeque. Atacado sem resposta é mate. Sem ataque e sem resposta é afogamento."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 30,
      "points": 8,
      "sources": [
        "fide-laws",
        "silman-endgame"
      ]
    },
    {
      "slug": "g.r5b.05",
      "phase": "INDEPENDENT",
      "type": "IS_MATE_OR_STALEMATE",
      "prompt": "Quem joga são as pretas. Esta posição é xeque, mate, afogamento ou nenhum dos três?",
      "fen": "7k/1R6/8/8/8/8/6Q1/1K6 b - - 0 1",
      "sideToMove": "b",
      "skillIds": [
        "r5.afogamento",
        "r4.reconhecer"
      ],
      "difficulty": 6,
      "ratingHint": 450,
      "acceptedAnswer": {
        "choice": "afogamento"
      },
      "predictableErrors": [
        {
          "answer": "mate",
          "explanation": "Para ser mate, o rei precisa estar ATACADO. Aqui ele não está: sem xeque e sem lance legal, o nome disso é afogamento, e o resultado é empate.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você viu que o lado da vez não tem para onde ir.",
        "threat": "A ameaça aqui é contra quem está ganhando: sem lance legal e sem xeque, o resultado é empate.",
        "bestDefense": "Do lado que está à frente, a defesa contra o próprio erro é deixar uma casa livre antes de aproximar as peças.",
        "reason": "É afogamento: o jogador da vez não está em xeque e não tem nenhum lance legal.",
        "pattern": "Sem xeque somado a sem lance legal é igual a empate.",
        "transferableRule": "Quando estiver muito à frente, antes de cada lance pergunte se o adversário ainda tem lance legal. Meio ponto perdido por descuido custa o mesmo que uma derrota."
      },
      "hints": [
        "Primeiro: o rei do lado da vez está sendo atacado?",
        "Depois: existe algum lance legal?",
        "Atacado com resposta é xeque. Atacado sem resposta é mate. Sem ataque e sem resposta é afogamento."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 30,
      "points": 8,
      "sources": [
        "fide-laws",
        "silman-endgame"
      ]
    },
  ],
  "r5c": [
    {
      "slug": "g.r5c.01",
      "phase": "INDEPENDENT",
      "type": "IS_MATE_OR_STALEMATE",
      "prompt": "Quem joga são as pretas. Esta posição é xeque, mate, afogamento ou nenhum dos três?",
      "fen": "2K5/Q7/6N1/8/8/k7/8/1R6 b - - 0 1",
      "sideToMove": "b",
      "skillIds": [
        "r5.afogamento"
      ],
      "difficulty": 4,
      "ratingHint": 400,
      "acceptedAnswer": {
        "choice": "mate"
      },
      "predictableErrors": [
        {
          "answer": "xeque",
          "explanation": "É mais que xeque: não sobrou nenhuma resposta legal. Confira as três — capturar, bloquear, mover — e veja que todas falham.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você viu que o rei está atacado e procurou as saídas.",
        "threat": "O rei está atacado e nenhuma resposta legal existe. A partida acabou.",
        "bestDefense": "Não há defesa — é essa a definição de mate.",
        "reason": "É xeque-mate: rei atacado e zero lances legais.",
        "pattern": "Mate exige as duas coisas ao mesmo tempo: rei atacado e nenhuma resposta.",
        "transferableRule": "Rei preso atrás dos próprios peões é o que transforma um xeque comum em mate de corredor."
      },
      "hints": [
        "Primeiro: o rei do lado da vez está sendo atacado?",
        "Depois: existe algum lance legal?",
        "Atacado com resposta é xeque. Atacado sem resposta é mate. Sem ataque e sem resposta é afogamento."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 30,
      "points": 8,
      "sources": [
        "fide-laws",
        "silman-endgame"
      ]
    },
    {
      "slug": "g.r5c.02",
      "phase": "INDEPENDENT",
      "type": "IS_MATE_OR_STALEMATE",
      "prompt": "Quem joga são as pretas. Esta posição é xeque, mate, afogamento ou nenhum dos três?",
      "fen": "8/kQ6/8/6N1/8/5K2/1R6/8 b - - 0 1",
      "sideToMove": "b",
      "skillIds": [
        "r5.afogamento"
      ],
      "difficulty": 5,
      "ratingHint": 400,
      "acceptedAnswer": {
        "choice": "mate"
      },
      "predictableErrors": [
        {
          "answer": "xeque",
          "explanation": "É mais que xeque: não sobrou nenhuma resposta legal. Confira as três — capturar, bloquear, mover — e veja que todas falham.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você viu que o rei está atacado e procurou as saídas.",
        "threat": "O rei está atacado e nenhuma resposta legal existe. A partida acabou.",
        "bestDefense": "Não há defesa — é essa a definição de mate.",
        "reason": "É xeque-mate: rei atacado e zero lances legais.",
        "pattern": "Mate exige as duas coisas ao mesmo tempo: rei atacado e nenhuma resposta.",
        "transferableRule": "Rei preso atrás dos próprios peões é o que transforma um xeque comum em mate de corredor."
      },
      "hints": [
        "Primeiro: o rei do lado da vez está sendo atacado?",
        "Depois: existe algum lance legal?",
        "Atacado com resposta é xeque. Atacado sem resposta é mate. Sem ataque e sem resposta é afogamento."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 30,
      "points": 8,
      "sources": [
        "fide-laws",
        "silman-endgame"
      ]
    },
    {
      "slug": "g.r5c.03",
      "phase": "REVIEW",
      "type": "IS_MATE_OR_STALEMATE",
      "prompt": "Quem joga são as pretas. Esta posição é xeque, mate, afogamento ou nenhum dos três?",
      "fen": "8/8/1K6/8/8/4N3/2R5/Q1k5 b - - 0 1",
      "sideToMove": "b",
      "skillIds": [
        "r5.afogamento"
      ],
      "difficulty": 6,
      "ratingHint": 400,
      "acceptedAnswer": {
        "choice": "mate"
      },
      "predictableErrors": [
        {
          "answer": "xeque",
          "explanation": "É mais que xeque: não sobrou nenhuma resposta legal. Confira as três — capturar, bloquear, mover — e veja que todas falham.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você viu que o rei está atacado e procurou as saídas.",
        "threat": "O rei está atacado e nenhuma resposta legal existe. A partida acabou.",
        "bestDefense": "Não há defesa — é essa a definição de mate.",
        "reason": "É xeque-mate: rei atacado e zero lances legais.",
        "pattern": "Mate exige as duas coisas ao mesmo tempo: rei atacado e nenhuma resposta.",
        "transferableRule": "Rei preso atrás dos próprios peões é o que transforma um xeque comum em mate de corredor."
      },
      "hints": [
        "Primeiro: o rei do lado da vez está sendo atacado?",
        "Depois: existe algum lance legal?",
        "Atacado com resposta é xeque. Atacado sem resposta é mate. Sem ataque e sem resposta é afogamento."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 30,
      "points": 8,
      "sources": [
        "fide-laws",
        "silman-endgame"
      ]
    },
    {
      "slug": "g.r5c.04",
      "phase": "INDEPENDENT",
      "type": "IS_MATE_OR_STALEMATE",
      "prompt": "Quem joga são as pretas. Esta posição é xeque, mate, afogamento ou nenhum dos três?",
      "fen": "8/7R/7k/8/8/5N2/2Q5/6K1 b - - 0 1",
      "sideToMove": "b",
      "skillIds": [
        "r5.afogamento"
      ],
      "difficulty": 4,
      "ratingHint": 400,
      "acceptedAnswer": {
        "choice": "mate"
      },
      "predictableErrors": [
        {
          "answer": "xeque",
          "explanation": "É mais que xeque: não sobrou nenhuma resposta legal. Confira as três — capturar, bloquear, mover — e veja que todas falham.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você viu que o rei está atacado e procurou as saídas.",
        "threat": "O rei está atacado e nenhuma resposta legal existe. A partida acabou.",
        "bestDefense": "Não há defesa — é essa a definição de mate.",
        "reason": "É xeque-mate: rei atacado e zero lances legais.",
        "pattern": "Mate exige as duas coisas ao mesmo tempo: rei atacado e nenhuma resposta.",
        "transferableRule": "Rei preso atrás dos próprios peões é o que transforma um xeque comum em mate de corredor."
      },
      "hints": [
        "Primeiro: o rei do lado da vez está sendo atacado?",
        "Depois: existe algum lance legal?",
        "Atacado com resposta é xeque. Atacado sem resposta é mate. Sem ataque e sem resposta é afogamento."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 30,
      "points": 8,
      "sources": [
        "fide-laws",
        "silman-endgame"
      ]
    },
  ],
  "r3": [
    {
      "slug": "g.r3.01",
      "phase": "INDEPENDENT",
      "type": "CAPTURE",
      "prompt": "As brancas jogam. Há mais de uma captura possível — encontre a que ganha material.",
      "fen": "8/8/3rn3/7K/3k4/1Q4p1/8/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r3.captura",
        "r3.indefesa",
        "r3.valor"
      ],
      "difficulty": 5,
      "ratingHint": 500,
      "acceptedAnswer": {
        "moves": [
          "Dxg3"
        ]
      },
      "predictableErrors": [
        {
          "answer": "Dxe6",
          "cause": "EVALUATION",
          "explanation": "Essa captura parece boa pelo valor da peça capturada, mas o saldo depois da recaptura é pior. Antes de capturar, conte os defensores da casa de destino e some a troca inteira, não só a primeira peça."
        }
      ],
      "explanation": {
        "perceived": "Você localizou as peças adversárias ao alcance e teve de escolher entre elas.",
        "threat": "A armadilha é o valor da peça capturada. A peça mais valiosa costuma ser a mais defendida.",
        "bestDefense": "Dxg3 é a captura que aumenta o saldo.",
        "reason": "Dxg3 ganha material; Dxe6 sai perdendo depois da recaptura.",
        "pattern": "Peça indefesa é alvo. Peça defendida é uma troca — e troca só vale a pena quando o saldo é seu.",
        "transferableRule": "A cada lance do adversário, pergunte: sobrou alguma peça sem defensor? É a pergunta que mais ganha material até 1200."
      },
      "hints": [
        "Liste todas as capturas disponíveis antes de escolher uma.",
        "Para cada uma, pergunte: alguma peça adversária recaptura nessa casa?",
        "Some a troca inteira: o que você ganha menos o que você perde."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 60,
      "points": 14,
      "sources": [
        "capablanca-fundamentals",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r3.02",
      "phase": "INDEPENDENT",
      "type": "CAPTURE",
      "prompt": "As brancas jogam. Há mais de uma captura possível — encontre a que ganha material.",
      "fen": "8/7k/5p2/8/r7/Q7/5K2/4n3 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r3.captura",
        "r3.indefesa",
        "r3.valor"
      ],
      "difficulty": 6,
      "ratingHint": 500,
      "acceptedAnswer": {
        "moves": [
          "Dxa4"
        ]
      },
      "predictableErrors": [
        {
          "answer": "Rxe1",
          "cause": "EVALUATION",
          "explanation": "Essa captura parece boa pelo valor da peça capturada, mas o saldo depois da recaptura é pior. Antes de capturar, conte os defensores da casa de destino e some a troca inteira, não só a primeira peça."
        }
      ],
      "explanation": {
        "perceived": "Você localizou as peças adversárias ao alcance e teve de escolher entre elas.",
        "threat": "A armadilha é o valor da peça capturada. A peça mais valiosa costuma ser a mais defendida.",
        "bestDefense": "Dxa4 é a captura que aumenta o saldo.",
        "reason": "Dxa4 ganha material; Rxe1 sai perdendo depois da recaptura.",
        "pattern": "Peça indefesa é alvo. Peça defendida é uma troca — e troca só vale a pena quando o saldo é seu.",
        "transferableRule": "A cada lance do adversário, pergunte: sobrou alguma peça sem defensor? É a pergunta que mais ganha material até 1200."
      },
      "hints": [
        "Liste todas as capturas disponíveis antes de escolher uma.",
        "Para cada uma, pergunte: alguma peça adversária recaptura nessa casa?",
        "Some a troca inteira: o que você ganha menos o que você perde."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 60,
      "points": 14,
      "sources": [
        "capablanca-fundamentals",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r3.03",
      "phase": "REVIEW",
      "type": "CAPTURE",
      "prompt": "As brancas jogam. Há mais de uma captura possível — encontre a que ganha material.",
      "fen": "4k3/Q6K/5r2/8/n7/8/5p2/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r3.captura",
        "r3.indefesa",
        "r3.valor"
      ],
      "difficulty": 7,
      "ratingHint": 500,
      "acceptedAnswer": {
        "moves": [
          "Dxa4+"
        ]
      },
      "predictableErrors": [
        {
          "answer": "Dxf2",
          "cause": "EVALUATION",
          "explanation": "Essa captura parece boa pelo valor da peça capturada, mas o saldo depois da recaptura é pior. Antes de capturar, conte os defensores da casa de destino e some a troca inteira, não só a primeira peça."
        }
      ],
      "explanation": {
        "perceived": "Você localizou as peças adversárias ao alcance e teve de escolher entre elas.",
        "threat": "A armadilha é o valor da peça capturada. A peça mais valiosa costuma ser a mais defendida.",
        "bestDefense": "Dxa4+ é a captura que aumenta o saldo.",
        "reason": "Dxa4+ ganha material; Dxf2 sai perdendo depois da recaptura.",
        "pattern": "Peça indefesa é alvo. Peça defendida é uma troca — e troca só vale a pena quando o saldo é seu.",
        "transferableRule": "A cada lance do adversário, pergunte: sobrou alguma peça sem defensor? É a pergunta que mais ganha material até 1200."
      },
      "hints": [
        "Liste todas as capturas disponíveis antes de escolher uma.",
        "Para cada uma, pergunte: alguma peça adversária recaptura nessa casa?",
        "Some a troca inteira: o que você ganha menos o que você perde."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 60,
      "points": 14,
      "sources": [
        "capablanca-fundamentals",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r3.04",
      "phase": "INDEPENDENT",
      "type": "CAPTURE",
      "prompt": "As brancas jogam. Há mais de uma captura possível — encontre a que ganha material.",
      "fen": "8/8/4Qp2/2K5/2n5/8/6k1/2r5 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r3.captura",
        "r3.indefesa",
        "r3.valor"
      ],
      "difficulty": 8,
      "ratingHint": 500,
      "acceptedAnswer": {
        "moves": [
          "Dxf6"
        ]
      },
      "predictableErrors": [
        {
          "answer": "Dxc4",
          "cause": "EVALUATION",
          "explanation": "Essa captura parece boa pelo valor da peça capturada, mas o saldo depois da recaptura é pior. Antes de capturar, conte os defensores da casa de destino e some a troca inteira, não só a primeira peça."
        }
      ],
      "explanation": {
        "perceived": "Você localizou as peças adversárias ao alcance e teve de escolher entre elas.",
        "threat": "A armadilha é o valor da peça capturada. A peça mais valiosa costuma ser a mais defendida.",
        "bestDefense": "Dxf6 é a captura que aumenta o saldo.",
        "reason": "Dxf6 ganha material; Dxc4 sai perdendo depois da recaptura.",
        "pattern": "Peça indefesa é alvo. Peça defendida é uma troca — e troca só vale a pena quando o saldo é seu.",
        "transferableRule": "A cada lance do adversário, pergunte: sobrou alguma peça sem defensor? É a pergunta que mais ganha material até 1200."
      },
      "hints": [
        "Liste todas as capturas disponíveis antes de escolher uma.",
        "Para cada uma, pergunte: alguma peça adversária recaptura nessa casa?",
        "Some a troca inteira: o que você ganha menos o que você perde."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 60,
      "points": 14,
      "sources": [
        "capablanca-fundamentals",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r3.05",
      "phase": "INDEPENDENT",
      "type": "CAPTURE",
      "prompt": "As brancas jogam. Há mais de uma captura possível — encontre a que ganha material.",
      "fen": "6KQ/8/2k2r2/6n1/8/8/7p/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r3.captura",
        "r3.indefesa",
        "r3.valor"
      ],
      "difficulty": 5,
      "ratingHint": 500,
      "acceptedAnswer": {
        "moves": [
          "Dxf6+"
        ]
      },
      "predictableErrors": [
        {
          "answer": "Dxh2",
          "cause": "EVALUATION",
          "explanation": "Essa captura parece boa pelo valor da peça capturada, mas o saldo depois da recaptura é pior. Antes de capturar, conte os defensores da casa de destino e some a troca inteira, não só a primeira peça."
        }
      ],
      "explanation": {
        "perceived": "Você localizou as peças adversárias ao alcance e teve de escolher entre elas.",
        "threat": "A armadilha é o valor da peça capturada. A peça mais valiosa costuma ser a mais defendida.",
        "bestDefense": "Dxf6+ é a captura que aumenta o saldo.",
        "reason": "Dxf6+ ganha material; Dxh2 sai perdendo depois da recaptura.",
        "pattern": "Peça indefesa é alvo. Peça defendida é uma troca — e troca só vale a pena quando o saldo é seu.",
        "transferableRule": "A cada lance do adversário, pergunte: sobrou alguma peça sem defensor? É a pergunta que mais ganha material até 1200."
      },
      "hints": [
        "Liste todas as capturas disponíveis antes de escolher uma.",
        "Para cada uma, pergunte: alguma peça adversária recaptura nessa casa?",
        "Some a troca inteira: o que você ganha menos o que você perde."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 60,
      "points": 14,
      "sources": [
        "capablanca-fundamentals",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r3.06",
      "phase": "REVIEW",
      "type": "CAPTURE",
      "prompt": "As brancas jogam. Há mais de uma captura possível — encontre a que ganha material.",
      "fen": "1K4Q1/8/p3r3/3k4/8/6n1/8/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r3.captura",
        "r3.indefesa",
        "r3.valor"
      ],
      "difficulty": 6,
      "ratingHint": 500,
      "acceptedAnswer": {
        "moves": [
          "Dxg3"
        ]
      },
      "predictableErrors": [
        {
          "answer": "Dxe6+",
          "cause": "EVALUATION",
          "explanation": "Essa captura parece boa pelo valor da peça capturada, mas o saldo depois da recaptura é pior. Antes de capturar, conte os defensores da casa de destino e some a troca inteira, não só a primeira peça."
        }
      ],
      "explanation": {
        "perceived": "Você localizou as peças adversárias ao alcance e teve de escolher entre elas.",
        "threat": "A armadilha é o valor da peça capturada. A peça mais valiosa costuma ser a mais defendida.",
        "bestDefense": "Dxg3 é a captura que aumenta o saldo.",
        "reason": "Dxg3 ganha material; Dxe6+ sai perdendo depois da recaptura.",
        "pattern": "Peça indefesa é alvo. Peça defendida é uma troca — e troca só vale a pena quando o saldo é seu.",
        "transferableRule": "A cada lance do adversário, pergunte: sobrou alguma peça sem defensor? É a pergunta que mais ganha material até 1200."
      },
      "hints": [
        "Liste todas as capturas disponíveis antes de escolher uma.",
        "Para cada uma, pergunte: alguma peça adversária recaptura nessa casa?",
        "Some a troca inteira: o que você ganha menos o que você perde."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 60,
      "points": 14,
      "sources": [
        "capablanca-fundamentals",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
    {
      "slug": "g.r3.07",
      "phase": "INDEPENDENT",
      "type": "CAPTURE",
      "prompt": "As brancas jogam. Há mais de uma captura possível — encontre a que ganha material.",
      "fen": "3n4/3K4/r7/p4Q2/8/8/7k/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r3.captura",
        "r3.indefesa",
        "r3.valor"
      ],
      "difficulty": 7,
      "ratingHint": 500,
      "acceptedAnswer": {
        "moves": [
          "Rxd8"
        ]
      },
      "predictableErrors": [
        {
          "answer": "Dxa5",
          "cause": "EVALUATION",
          "explanation": "Essa captura parece boa pelo valor da peça capturada, mas o saldo depois da recaptura é pior. Antes de capturar, conte os defensores da casa de destino e some a troca inteira, não só a primeira peça."
        }
      ],
      "explanation": {
        "perceived": "Você localizou as peças adversárias ao alcance e teve de escolher entre elas.",
        "threat": "A armadilha é o valor da peça capturada. A peça mais valiosa costuma ser a mais defendida.",
        "bestDefense": "Rxd8 é a captura que aumenta o saldo.",
        "reason": "Rxd8 ganha material; Dxa5 sai perdendo depois da recaptura.",
        "pattern": "Peça indefesa é alvo. Peça defendida é uma troca — e troca só vale a pena quando o saldo é seu.",
        "transferableRule": "A cada lance do adversário, pergunte: sobrou alguma peça sem defensor? É a pergunta que mais ganha material até 1200."
      },
      "hints": [
        "Liste todas as capturas disponíveis antes de escolher uma.",
        "Para cada uma, pergunte: alguma peça adversária recaptura nessa casa?",
        "Some a troca inteira: o que você ganha menos o que você perde."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 60,
      "points": 14,
      "sources": [
        "capablanca-fundamentals",
        "dagostini-basico",
        "maizelis-primer"
      ]
    },
  ],
  "r6a": [
    {
      "slug": "g.r6a.01",
      "phase": "INDEPENDENT",
      "type": "BEST_MOVE",
      "verification": "RULE_EXECUTION",
      "prompt": "As brancas jogam. Coloque o rei em segurança fazendo o roque grande.",
      "fen": "8/7k/1b6/8/4N3/8/8/R3K3 w Q - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.roque"
      ],
      "difficulty": 4,
      "ratingHint": 350,
      "acceptedAnswer": {
        "moves": [
          "O-O-O"
        ]
      },
      "predictableErrors": [
        {
          "answer": "O-O",
          "explanation": "Esse é o roque pequeno, do lado do rei. O enunciado pediu o lado da dama: O-O-O.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você identificou que rei e torre continuam nas casas de origem.",
        "threat": "Rei no centro com colunas prestes a abrir é a causa mais comum de derrota rápida.",
        "bestDefense": "O-O-O tira o rei do centro e traz a torre para o jogo num único lance.",
        "reason": "As cinco condições estão satisfeitas: rei e torre na origem, nada entre eles, rei fora de xeque, e nenhuma casa do trajeto atacada.",
        "pattern": "Roque pequeno é O-O. Roque grande é O-O-O. Conta como um lance só.",
        "transferableRule": "Em competição, mova o REI primeiro ao rocar. Tocar a torre antes pode obrigar você a jogar só a torre, pela regra da peça tocada."
      },
      "hints": [
        "O lado da dama é o da coluna a.",
        "A notação do roque não usa casas: usa a letra O e hífens.",
        "Escreve-se O-O-O."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r6a.02",
      "phase": "INDEPENDENT",
      "type": "BEST_MOVE",
      "verification": "RULE_EXECUTION",
      "prompt": "As brancas jogam. Coloque o rei em segurança fazendo o roque pequeno.",
      "fen": "7k/2Nb4/8/8/8/8/8/4K2R w K - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.roque"
      ],
      "difficulty": 5,
      "ratingHint": 350,
      "acceptedAnswer": {
        "moves": [
          "O-O"
        ]
      },
      "predictableErrors": [
        {
          "answer": "O-O-O",
          "explanation": "Esse é o roque grande, do lado da dama. O enunciado pediu o lado do rei: O-O.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você identificou que rei e torre continuam nas casas de origem.",
        "threat": "Rei no centro com colunas prestes a abrir é a causa mais comum de derrota rápida.",
        "bestDefense": "O-O tira o rei do centro e traz a torre para o jogo num único lance.",
        "reason": "As cinco condições estão satisfeitas: rei e torre na origem, nada entre eles, rei fora de xeque, e nenhuma casa do trajeto atacada.",
        "pattern": "Roque pequeno é O-O. Roque grande é O-O-O. Conta como um lance só.",
        "transferableRule": "Em competição, mova o REI primeiro ao rocar. Tocar a torre antes pode obrigar você a jogar só a torre, pela regra da peça tocada."
      },
      "hints": [
        "O lado do rei é o da coluna h.",
        "A notação do roque não usa casas: usa a letra O e hífens.",
        "Escreve-se O-O."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r6a.03",
      "phase": "REVIEW",
      "type": "BEST_MOVE",
      "verification": "RULE_EXECUTION",
      "prompt": "As brancas jogam. Coloque o rei em segurança fazendo o roque grande.",
      "fen": "1b6/8/Nk6/8/8/8/8/R3K3 w Q - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.roque"
      ],
      "difficulty": 6,
      "ratingHint": 350,
      "acceptedAnswer": {
        "moves": [
          "O-O-O"
        ]
      },
      "predictableErrors": [
        {
          "answer": "O-O",
          "explanation": "Esse é o roque pequeno, do lado do rei. O enunciado pediu o lado da dama: O-O-O.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você identificou que rei e torre continuam nas casas de origem.",
        "threat": "Rei no centro com colunas prestes a abrir é a causa mais comum de derrota rápida.",
        "bestDefense": "O-O-O tira o rei do centro e traz a torre para o jogo num único lance.",
        "reason": "As cinco condições estão satisfeitas: rei e torre na origem, nada entre eles, rei fora de xeque, e nenhuma casa do trajeto atacada.",
        "pattern": "Roque pequeno é O-O. Roque grande é O-O-O. Conta como um lance só.",
        "transferableRule": "Em competição, mova o REI primeiro ao rocar. Tocar a torre antes pode obrigar você a jogar só a torre, pela regra da peça tocada."
      },
      "hints": [
        "O lado da dama é o da coluna a.",
        "A notação do roque não usa casas: usa a letra O e hífens.",
        "Escreve-se O-O-O."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r6a.04",
      "phase": "INDEPENDENT",
      "type": "BEST_MOVE",
      "verification": "RULE_EXECUTION",
      "prompt": "As brancas jogam. Coloque o rei em segurança fazendo o roque pequeno.",
      "fen": "8/4N2k/8/8/8/5b2/8/4K2R w K - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.roque"
      ],
      "difficulty": 4,
      "ratingHint": 350,
      "acceptedAnswer": {
        "moves": [
          "O-O"
        ]
      },
      "predictableErrors": [
        {
          "answer": "O-O-O",
          "explanation": "Esse é o roque grande, do lado da dama. O enunciado pediu o lado do rei: O-O.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você identificou que rei e torre continuam nas casas de origem.",
        "threat": "Rei no centro com colunas prestes a abrir é a causa mais comum de derrota rápida.",
        "bestDefense": "O-O tira o rei do centro e traz a torre para o jogo num único lance.",
        "reason": "As cinco condições estão satisfeitas: rei e torre na origem, nada entre eles, rei fora de xeque, e nenhuma casa do trajeto atacada.",
        "pattern": "Roque pequeno é O-O. Roque grande é O-O-O. Conta como um lance só.",
        "transferableRule": "Em competição, mova o REI primeiro ao rocar. Tocar a torre antes pode obrigar você a jogar só a torre, pela regra da peça tocada."
      },
      "hints": [
        "O lado do rei é o da coluna h.",
        "A notação do roque não usa casas: usa a letra O e hífens.",
        "Escreve-se O-O."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r6a.05",
      "phase": "INDEPENDENT",
      "type": "BEST_MOVE",
      "verification": "RULE_EXECUTION",
      "prompt": "As brancas jogam. Coloque o rei em segurança fazendo o roque grande.",
      "fen": "1b1N3k/8/8/8/8/8/8/R3K3 w Q - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.roque"
      ],
      "difficulty": 5,
      "ratingHint": 350,
      "acceptedAnswer": {
        "moves": [
          "O-O-O"
        ]
      },
      "predictableErrors": [
        {
          "answer": "O-O",
          "explanation": "Esse é o roque pequeno, do lado do rei. O enunciado pediu o lado da dama: O-O-O.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você identificou que rei e torre continuam nas casas de origem.",
        "threat": "Rei no centro com colunas prestes a abrir é a causa mais comum de derrota rápida.",
        "bestDefense": "O-O-O tira o rei do centro e traz a torre para o jogo num único lance.",
        "reason": "As cinco condições estão satisfeitas: rei e torre na origem, nada entre eles, rei fora de xeque, e nenhuma casa do trajeto atacada.",
        "pattern": "Roque pequeno é O-O. Roque grande é O-O-O. Conta como um lance só.",
        "transferableRule": "Em competição, mova o REI primeiro ao rocar. Tocar a torre antes pode obrigar você a jogar só a torre, pela regra da peça tocada."
      },
      "hints": [
        "O lado da dama é o da coluna a.",
        "A notação do roque não usa casas: usa a letra O e hífens.",
        "Escreve-se O-O-O."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r6a.06",
      "phase": "REVIEW",
      "type": "BEST_MOVE",
      "verification": "RULE_EXECUTION",
      "prompt": "As brancas jogam. Coloque o rei em segurança fazendo o roque pequeno.",
      "fen": "8/k7/8/6N1/4b3/8/8/4K2R w K - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.roque"
      ],
      "difficulty": 6,
      "ratingHint": 350,
      "acceptedAnswer": {
        "moves": [
          "O-O"
        ]
      },
      "predictableErrors": [
        {
          "answer": "O-O-O",
          "explanation": "Esse é o roque grande, do lado da dama. O enunciado pediu o lado do rei: O-O.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você identificou que rei e torre continuam nas casas de origem.",
        "threat": "Rei no centro com colunas prestes a abrir é a causa mais comum de derrota rápida.",
        "bestDefense": "O-O tira o rei do centro e traz a torre para o jogo num único lance.",
        "reason": "As cinco condições estão satisfeitas: rei e torre na origem, nada entre eles, rei fora de xeque, e nenhuma casa do trajeto atacada.",
        "pattern": "Roque pequeno é O-O. Roque grande é O-O-O. Conta como um lance só.",
        "transferableRule": "Em competição, mova o REI primeiro ao rocar. Tocar a torre antes pode obrigar você a jogar só a torre, pela regra da peça tocada."
      },
      "hints": [
        "O lado do rei é o da coluna h.",
        "A notação do roque não usa casas: usa a letra O e hífens.",
        "Escreve-se O-O."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
  ],
  "r6b": [
    {
      "slug": "g.r6b.01",
      "phase": "INDEPENDENT",
      "type": "BEST_MOVE",
      "verification": "RULE_EXECUTION",
      "prompt": "O peão preto acabou de jogar e7–e5. As brancas jogam e capturam esse peão. Qual é o lance?",
      "fen": "4k3/8/8/4pP2/8/8/5K2/8 w - e6 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.en-passant"
      ],
      "difficulty": 5,
      "ratingHint": 450,
      "acceptedAnswer": {
        "moves": [
          "fxe6"
        ]
      },
      "predictableErrors": [
        {
          "answer": "f6",
          "explanation": "Avançar deixa o peão preto passar. O direito de capturar en passant existe SÓ neste lance — no próximo, ele desaparece para sempre.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você reconheceu a configuração do en passant: peão que avançou duas casas parando ao lado do seu.",
        "threat": "Se as brancas não capturarem agora, o peão de e5 passa e o direito some.",
        "bestDefense": "Do lado preto, a defesa seria ter jogado e7–e6, avançando uma casa só.",
        "reason": "fxe6 captura o peão de e5, mas o peão branco para em e6 — a casa que o peão preto atravessou. É a única captura do xadrez em que a peça capturada não está na casa de destino.",
        "pattern": "En passant: peão adversário avança duas casas e para ao seu lado; você captura como se ele tivesse avançado uma.",
        "transferableRule": "O direito dura exatamente um lance. Em partida com relógio, decida en passant antes de qualquer outra coisa."
      },
      "hints": [
        "A captura de peão se escreve com a coluna de origem, um x e a casa de destino.",
        "Para onde vai o peão branco: e5 ou e6?",
        "Ele para em e6, a casa atravessada pelo peão preto."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r6b.02",
      "phase": "INDEPENDENT",
      "type": "BEST_MOVE",
      "verification": "RULE_EXECUTION",
      "prompt": "O peão preto acabou de jogar c7–c5. As brancas jogam e capturam esse peão. Qual é o lance?",
      "fen": "1k6/8/8/1Pp5/8/8/8/K7 w - c6 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.en-passant"
      ],
      "difficulty": 6,
      "ratingHint": 450,
      "acceptedAnswer": {
        "moves": [
          "bxc6"
        ]
      },
      "predictableErrors": [
        {
          "answer": "b6",
          "explanation": "Avançar deixa o peão preto passar. O direito de capturar en passant existe SÓ neste lance — no próximo, ele desaparece para sempre.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você reconheceu a configuração do en passant: peão que avançou duas casas parando ao lado do seu.",
        "threat": "Se as brancas não capturarem agora, o peão de c5 passa e o direito some.",
        "bestDefense": "Do lado preto, a defesa seria ter jogado c7–c6, avançando uma casa só.",
        "reason": "bxc6 captura o peão de c5, mas o peão branco para em c6 — a casa que o peão preto atravessou. É a única captura do xadrez em que a peça capturada não está na casa de destino.",
        "pattern": "En passant: peão adversário avança duas casas e para ao seu lado; você captura como se ele tivesse avançado uma.",
        "transferableRule": "O direito dura exatamente um lance. Em partida com relógio, decida en passant antes de qualquer outra coisa."
      },
      "hints": [
        "A captura de peão se escreve com a coluna de origem, um x e a casa de destino.",
        "Para onde vai o peão branco: c5 ou c6?",
        "Ele para em c6, a casa atravessada pelo peão preto."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r6b.03",
      "phase": "REVIEW",
      "type": "BEST_MOVE",
      "verification": "RULE_EXECUTION",
      "prompt": "O peão preto acabou de jogar f7–f5. As brancas jogam e capturam esse peão. Qual é o lance?",
      "fen": "4k3/8/8/5pP1/8/8/4K3/8 w - f6 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.en-passant"
      ],
      "difficulty": 7,
      "ratingHint": 450,
      "acceptedAnswer": {
        "moves": [
          "gxf6"
        ]
      },
      "predictableErrors": [
        {
          "answer": "g6",
          "explanation": "Avançar deixa o peão preto passar. O direito de capturar en passant existe SÓ neste lance — no próximo, ele desaparece para sempre.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você reconheceu a configuração do en passant: peão que avançou duas casas parando ao lado do seu.",
        "threat": "Se as brancas não capturarem agora, o peão de f5 passa e o direito some.",
        "bestDefense": "Do lado preto, a defesa seria ter jogado f7–f6, avançando uma casa só.",
        "reason": "gxf6 captura o peão de f5, mas o peão branco para em f6 — a casa que o peão preto atravessou. É a única captura do xadrez em que a peça capturada não está na casa de destino.",
        "pattern": "En passant: peão adversário avança duas casas e para ao seu lado; você captura como se ele tivesse avançado uma.",
        "transferableRule": "O direito dura exatamente um lance. Em partida com relógio, decida en passant antes de qualquer outra coisa."
      },
      "hints": [
        "A captura de peão se escreve com a coluna de origem, um x e a casa de destino.",
        "Para onde vai o peão branco: f5 ou f6?",
        "Ele para em f6, a casa atravessada pelo peão preto."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r6b.04",
      "phase": "INDEPENDENT",
      "type": "BEST_MOVE",
      "verification": "RULE_EXECUTION",
      "prompt": "O peão preto acabou de jogar b7–b5. As brancas jogam e capturam esse peão. Qual é o lance?",
      "fen": "4k3/8/8/1pP5/8/8/3K4/8 w - b6 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.en-passant"
      ],
      "difficulty": 5,
      "ratingHint": 450,
      "acceptedAnswer": {
        "moves": [
          "cxb6"
        ]
      },
      "predictableErrors": [
        {
          "answer": "c6",
          "explanation": "Avançar deixa o peão preto passar. O direito de capturar en passant existe SÓ neste lance — no próximo, ele desaparece para sempre.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você reconheceu a configuração do en passant: peão que avançou duas casas parando ao lado do seu.",
        "threat": "Se as brancas não capturarem agora, o peão de b5 passa e o direito some.",
        "bestDefense": "Do lado preto, a defesa seria ter jogado b7–b6, avançando uma casa só.",
        "reason": "cxb6 captura o peão de b5, mas o peão branco para em b6 — a casa que o peão preto atravessou. É a única captura do xadrez em que a peça capturada não está na casa de destino.",
        "pattern": "En passant: peão adversário avança duas casas e para ao seu lado; você captura como se ele tivesse avançado uma.",
        "transferableRule": "O direito dura exatamente um lance. Em partida com relógio, decida en passant antes de qualquer outra coisa."
      },
      "hints": [
        "A captura de peão se escreve com a coluna de origem, um x e a casa de destino.",
        "Para onde vai o peão branco: b5 ou b6?",
        "Ele para em b6, a casa atravessada pelo peão preto."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r6b.05",
      "phase": "INDEPENDENT",
      "type": "BEST_MOVE",
      "verification": "RULE_EXECUTION",
      "prompt": "O peão preto acabou de jogar b7–b5. As brancas jogam e capturam esse peão. Qual é o lance?",
      "fen": "8/3k4/8/Pp6/8/8/8/5K2 w - b6 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.en-passant"
      ],
      "difficulty": 6,
      "ratingHint": 450,
      "acceptedAnswer": {
        "moves": [
          "axb6"
        ]
      },
      "predictableErrors": [
        {
          "answer": "a6",
          "explanation": "Avançar deixa o peão preto passar. O direito de capturar en passant existe SÓ neste lance — no próximo, ele desaparece para sempre.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você reconheceu a configuração do en passant: peão que avançou duas casas parando ao lado do seu.",
        "threat": "Se as brancas não capturarem agora, o peão de b5 passa e o direito some.",
        "bestDefense": "Do lado preto, a defesa seria ter jogado b7–b6, avançando uma casa só.",
        "reason": "axb6 captura o peão de b5, mas o peão branco para em b6 — a casa que o peão preto atravessou. É a única captura do xadrez em que a peça capturada não está na casa de destino.",
        "pattern": "En passant: peão adversário avança duas casas e para ao seu lado; você captura como se ele tivesse avançado uma.",
        "transferableRule": "O direito dura exatamente um lance. Em partida com relógio, decida en passant antes de qualquer outra coisa."
      },
      "hints": [
        "A captura de peão se escreve com a coluna de origem, um x e a casa de destino.",
        "Para onde vai o peão branco: b5 ou b6?",
        "Ele para em b6, a casa atravessada pelo peão preto."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r6b.06",
      "phase": "REVIEW",
      "type": "BEST_MOVE",
      "verification": "RULE_EXECUTION",
      "prompt": "O peão preto acabou de jogar b7–b5. As brancas jogam e capturam esse peão. Qual é o lance?",
      "fen": "8/5k2/8/1pP5/8/8/2K5/8 w - b6 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.en-passant"
      ],
      "difficulty": 7,
      "ratingHint": 450,
      "acceptedAnswer": {
        "moves": [
          "cxb6"
        ]
      },
      "predictableErrors": [
        {
          "answer": "c6",
          "explanation": "Avançar deixa o peão preto passar. O direito de capturar en passant existe SÓ neste lance — no próximo, ele desaparece para sempre.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você reconheceu a configuração do en passant: peão que avançou duas casas parando ao lado do seu.",
        "threat": "Se as brancas não capturarem agora, o peão de b5 passa e o direito some.",
        "bestDefense": "Do lado preto, a defesa seria ter jogado b7–b6, avançando uma casa só.",
        "reason": "cxb6 captura o peão de b5, mas o peão branco para em b6 — a casa que o peão preto atravessou. É a única captura do xadrez em que a peça capturada não está na casa de destino.",
        "pattern": "En passant: peão adversário avança duas casas e para ao seu lado; você captura como se ele tivesse avançado uma.",
        "transferableRule": "O direito dura exatamente um lance. Em partida com relógio, decida en passant antes de qualquer outra coisa."
      },
      "hints": [
        "A captura de peão se escreve com a coluna de origem, um x e a casa de destino.",
        "Para onde vai o peão branco: b5 ou b6?",
        "Ele para em b6, a casa atravessada pelo peão preto."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
  ],
  "r6c": [
    {
      "slug": "g.r6c.01",
      "phase": "INDEPENDENT",
      "type": "BEST_MOVE",
      "verification": "RULE_EXECUTION",
      "prompt": "As brancas jogam. Promova o peão da forma mais forte.",
      "fen": "8/5P2/8/8/k7/8/3K4/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.promocao"
      ],
      "difficulty": 4,
      "ratingHint": 350,
      "acceptedAnswer": {
        "moves": [
          "f8=D"
        ]
      },
      "predictableErrors": [
        {
          "answer": "f8=C",
          "explanation": "O cavalo é a mais fraca das quatro opções. Promover para cavalo só se justifica quando ele dá xeque, cria um garfo ou evita afogamento — nada disso acontece aqui.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você levou o peão à última fileira e teve de escolher a peça.",
        "threat": "Não há ameaça aqui. O que existe é a tentação de promover no automático sem conferir afogamento.",
        "bestDefense": "O rei preto está longe e continua com lances legais: não há afogamento.",
        "reason": "f8=D é o mais forte. A dama vale 9 e nada nesta posição justifica abrir mão dela.",
        "pattern": "Promoção padrão é para dama. Subpromoção só com motivo concreto: xeque, garfo ou fugir do afogamento.",
        "transferableRule": "Antes de promover com o adversário quase sem lances, confira se a nova dama afoga o rei dele. Empate por descuido custa meio ponto."
      },
      "hints": [
        "A promoção se escreve com a casa de destino, um sinal de igual e a inicial da peça.",
        "Em português, a dama é D.",
        "f8 igual a D."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r6c.02",
      "phase": "INDEPENDENT",
      "type": "BEST_MOVE",
      "verification": "RULE_EXECUTION",
      "prompt": "As brancas jogam. Promova o peão da forma mais forte.",
      "fen": "8/1P6/8/8/8/4k3/K7/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.promocao"
      ],
      "difficulty": 5,
      "ratingHint": 350,
      "acceptedAnswer": {
        "moves": [
          "b8=D"
        ]
      },
      "predictableErrors": [
        {
          "answer": "b8=C",
          "explanation": "O cavalo é a mais fraca das quatro opções. Promover para cavalo só se justifica quando ele dá xeque, cria um garfo ou evita afogamento — nada disso acontece aqui.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você levou o peão à última fileira e teve de escolher a peça.",
        "threat": "Não há ameaça aqui. O que existe é a tentação de promover no automático sem conferir afogamento.",
        "bestDefense": "O rei preto está longe e continua com lances legais: não há afogamento.",
        "reason": "b8=D é o mais forte. A dama vale 9 e nada nesta posição justifica abrir mão dela.",
        "pattern": "Promoção padrão é para dama. Subpromoção só com motivo concreto: xeque, garfo ou fugir do afogamento.",
        "transferableRule": "Antes de promover com o adversário quase sem lances, confira se a nova dama afoga o rei dele. Empate por descuido custa meio ponto."
      },
      "hints": [
        "A promoção se escreve com a casa de destino, um sinal de igual e a inicial da peça.",
        "Em português, a dama é D.",
        "b8 igual a D."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r6c.03",
      "phase": "REVIEW",
      "type": "BEST_MOVE",
      "verification": "RULE_EXECUTION",
      "prompt": "As brancas jogam. Promova o peão da forma mais forte.",
      "fen": "8/P7/8/8/8/8/K2k4/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.promocao"
      ],
      "difficulty": 6,
      "ratingHint": 350,
      "acceptedAnswer": {
        "moves": [
          "a8=D"
        ]
      },
      "predictableErrors": [
        {
          "answer": "a8=C",
          "explanation": "O cavalo é a mais fraca das quatro opções. Promover para cavalo só se justifica quando ele dá xeque, cria um garfo ou evita afogamento — nada disso acontece aqui.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você levou o peão à última fileira e teve de escolher a peça.",
        "threat": "Não há ameaça aqui. O que existe é a tentação de promover no automático sem conferir afogamento.",
        "bestDefense": "O rei preto está longe e continua com lances legais: não há afogamento.",
        "reason": "a8=D é o mais forte. A dama vale 9 e nada nesta posição justifica abrir mão dela.",
        "pattern": "Promoção padrão é para dama. Subpromoção só com motivo concreto: xeque, garfo ou fugir do afogamento.",
        "transferableRule": "Antes de promover com o adversário quase sem lances, confira se a nova dama afoga o rei dele. Empate por descuido custa meio ponto."
      },
      "hints": [
        "A promoção se escreve com a casa de destino, um sinal de igual e a inicial da peça.",
        "Em português, a dama é D.",
        "a8 igual a D."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r6c.04",
      "phase": "INDEPENDENT",
      "type": "BEST_MOVE",
      "verification": "RULE_EXECUTION",
      "prompt": "As brancas jogam. Promova o peão da forma mais forte.",
      "fen": "8/4P3/8/8/8/K7/8/k7 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.promocao"
      ],
      "difficulty": 4,
      "ratingHint": 350,
      "acceptedAnswer": {
        "moves": [
          "e8=D"
        ]
      },
      "predictableErrors": [
        {
          "answer": "e8=C",
          "explanation": "O cavalo é a mais fraca das quatro opções. Promover para cavalo só se justifica quando ele dá xeque, cria um garfo ou evita afogamento — nada disso acontece aqui.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você levou o peão à última fileira e teve de escolher a peça.",
        "threat": "Não há ameaça aqui. O que existe é a tentação de promover no automático sem conferir afogamento.",
        "bestDefense": "O rei preto está longe e continua com lances legais: não há afogamento.",
        "reason": "e8=D é o mais forte. A dama vale 9 e nada nesta posição justifica abrir mão dela.",
        "pattern": "Promoção padrão é para dama. Subpromoção só com motivo concreto: xeque, garfo ou fugir do afogamento.",
        "transferableRule": "Antes de promover com o adversário quase sem lances, confira se a nova dama afoga o rei dele. Empate por descuido custa meio ponto."
      },
      "hints": [
        "A promoção se escreve com a casa de destino, um sinal de igual e a inicial da peça.",
        "Em português, a dama é D.",
        "e8 igual a D."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r6c.05",
      "phase": "INDEPENDENT",
      "type": "BEST_MOVE",
      "verification": "RULE_EXECUTION",
      "prompt": "As brancas jogam. Promova o peão da forma mais forte.",
      "fen": "8/6P1/8/8/8/5K2/2k5/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.promocao"
      ],
      "difficulty": 5,
      "ratingHint": 350,
      "acceptedAnswer": {
        "moves": [
          "g8=D"
        ]
      },
      "predictableErrors": [
        {
          "answer": "g8=C",
          "explanation": "O cavalo é a mais fraca das quatro opções. Promover para cavalo só se justifica quando ele dá xeque, cria um garfo ou evita afogamento — nada disso acontece aqui.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você levou o peão à última fileira e teve de escolher a peça.",
        "threat": "Não há ameaça aqui. O que existe é a tentação de promover no automático sem conferir afogamento.",
        "bestDefense": "O rei preto está longe e continua com lances legais: não há afogamento.",
        "reason": "g8=D é o mais forte. A dama vale 9 e nada nesta posição justifica abrir mão dela.",
        "pattern": "Promoção padrão é para dama. Subpromoção só com motivo concreto: xeque, garfo ou fugir do afogamento.",
        "transferableRule": "Antes de promover com o adversário quase sem lances, confira se a nova dama afoga o rei dele. Empate por descuido custa meio ponto."
      },
      "hints": [
        "A promoção se escreve com a casa de destino, um sinal de igual e a inicial da peça.",
        "Em português, a dama é D.",
        "g8 igual a D."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r6c.06",
      "phase": "REVIEW",
      "type": "BEST_MOVE",
      "verification": "RULE_EXECUTION",
      "prompt": "As brancas jogam. Promova o peão da forma mais forte.",
      "fen": "8/2P5/8/8/8/8/3K4/5k2 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.promocao"
      ],
      "difficulty": 6,
      "ratingHint": 350,
      "acceptedAnswer": {
        "moves": [
          "c8=D"
        ]
      },
      "predictableErrors": [
        {
          "answer": "c8=C",
          "explanation": "O cavalo é a mais fraca das quatro opções. Promover para cavalo só se justifica quando ele dá xeque, cria um garfo ou evita afogamento — nada disso acontece aqui.",
          "cause": "RULE"
        }
      ],
      "explanation": {
        "perceived": "Você levou o peão à última fileira e teve de escolher a peça.",
        "threat": "Não há ameaça aqui. O que existe é a tentação de promover no automático sem conferir afogamento.",
        "bestDefense": "O rei preto está longe e continua com lances legais: não há afogamento.",
        "reason": "c8=D é o mais forte. A dama vale 9 e nada nesta posição justifica abrir mão dela.",
        "pattern": "Promoção padrão é para dama. Subpromoção só com motivo concreto: xeque, garfo ou fugir do afogamento.",
        "transferableRule": "Antes de promover com o adversário quase sem lances, confira se a nova dama afoga o rei dele. Empate por descuido custa meio ponto."
      },
      "hints": [
        "A promoção se escreve com a casa de destino, um sinal de igual e a inicial da peça.",
        "Em português, a dama é D.",
        "c8 igual a D."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
  ],
  "r6": [
    {
      "slug": "g.r6.01",
      "phase": "INDEPENDENT",
      "type": "NOTATION_WRITE",
      "prompt": "Escreva em notação algébrica o lance do rei de e6 para f7.",
      "fen": "8/8/4K3/6N1/2B5/8/R7/3k4 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.notacao",
        "r1.localizar"
      ],
      "difficulty": 4,
      "ratingHint": 400,
      "acceptedAnswer": {
        "choice": "Rf7"
      },
      "predictableErrors": [
        {
          "answer": "e6f7",
          "cause": "RULE",
          "explanation": "Isso é notação de coordenadas, usada por computador. A notação algébrica de competição registra a inicial da peça e a casa de destino."
        }
      ],
      "explanation": {
        "perceived": "Você identificou a peça e a casa de destino.",
        "threat": "Súmula mal preenchida impede reclamar tríplice repetição e inviabiliza analisar a própria partida depois.",
        "bestDefense": "Inicial da peça mais casa de destino. Acrescente x para captura, + para xeque, # para mate e = para promoção.",
        "reason": "Rf7: o rei vai para f7.",
        "pattern": "Peça mais destino. Peões dispensam a inicial: só a casa de destino.",
        "transferableRule": "A notação em inglês usa outras iniciais. Cf3 e Nf3 são o mesmo lance — livro importado não muda o xadrez."
      },
      "hints": [
        "Qual é a inicial de rei em português?",
        "A casa que se escreve é a de destino, não a de origem.",
        "A origem só entra quando há ambiguidade entre duas peças iguais."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r6.02",
      "phase": "INDEPENDENT",
      "type": "NOTATION_WRITE",
      "prompt": "Escreva em notação algébrica o lance da torre de h8 para e8.",
      "fen": "7R/2B5/7K/8/2k5/2N5/8/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.notacao",
        "r1.localizar"
      ],
      "difficulty": 5,
      "ratingHint": 400,
      "acceptedAnswer": {
        "choice": "Te8"
      },
      "predictableErrors": [
        {
          "answer": "h8e8",
          "cause": "RULE",
          "explanation": "Isso é notação de coordenadas, usada por computador. A notação algébrica de competição registra a inicial da peça e a casa de destino."
        }
      ],
      "explanation": {
        "perceived": "Você identificou a peça e a casa de destino.",
        "threat": "Súmula mal preenchida impede reclamar tríplice repetição e inviabiliza analisar a própria partida depois.",
        "bestDefense": "Inicial da peça mais casa de destino. Acrescente x para captura, + para xeque, # para mate e = para promoção.",
        "reason": "Te8: a torre vai para e8.",
        "pattern": "Peça mais destino. Peões dispensam a inicial: só a casa de destino.",
        "transferableRule": "A notação em inglês usa outras iniciais. Cf3 e Nf3 são o mesmo lance — livro importado não muda o xadrez."
      },
      "hints": [
        "Qual é a inicial de torre em português?",
        "A casa que se escreve é a de destino, não a de origem.",
        "A origem só entra quando há ambiguidade entre duas peças iguais."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r6.03",
      "phase": "REVIEW",
      "type": "NOTATION_WRITE",
      "prompt": "Escreva em notação algébrica o lance do rei de d3 para c4.",
      "fen": "B7/3k4/8/8/8/3K4/8/3N1R2 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.notacao",
        "r1.localizar"
      ],
      "difficulty": 6,
      "ratingHint": 400,
      "acceptedAnswer": {
        "choice": "Rc4"
      },
      "predictableErrors": [
        {
          "answer": "d3c4",
          "cause": "RULE",
          "explanation": "Isso é notação de coordenadas, usada por computador. A notação algébrica de competição registra a inicial da peça e a casa de destino."
        }
      ],
      "explanation": {
        "perceived": "Você identificou a peça e a casa de destino.",
        "threat": "Súmula mal preenchida impede reclamar tríplice repetição e inviabiliza analisar a própria partida depois.",
        "bestDefense": "Inicial da peça mais casa de destino. Acrescente x para captura, + para xeque, # para mate e = para promoção.",
        "reason": "Rc4: o rei vai para c4.",
        "pattern": "Peça mais destino. Peões dispensam a inicial: só a casa de destino.",
        "transferableRule": "A notação em inglês usa outras iniciais. Cf3 e Nf3 são o mesmo lance — livro importado não muda o xadrez."
      },
      "hints": [
        "Qual é a inicial de rei em português?",
        "A casa que se escreve é a de destino, não a de origem.",
        "A origem só entra quando há ambiguidade entre duas peças iguais."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r6.04",
      "phase": "INDEPENDENT",
      "type": "NOTATION_WRITE",
      "prompt": "Escreva em notação algébrica o lance do bispo de a6 para f1.",
      "fen": "8/3K2N1/B7/8/3R4/8/8/6k1 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.notacao",
        "r1.localizar"
      ],
      "difficulty": 7,
      "ratingHint": 400,
      "acceptedAnswer": {
        "choice": "Bf1"
      },
      "predictableErrors": [
        {
          "answer": "a6f1",
          "cause": "RULE",
          "explanation": "Isso é notação de coordenadas, usada por computador. A notação algébrica de competição registra a inicial da peça e a casa de destino."
        }
      ],
      "explanation": {
        "perceived": "Você identificou a peça e a casa de destino.",
        "threat": "Súmula mal preenchida impede reclamar tríplice repetição e inviabiliza analisar a própria partida depois.",
        "bestDefense": "Inicial da peça mais casa de destino. Acrescente x para captura, + para xeque, # para mate e = para promoção.",
        "reason": "Bf1: o bispo vai para f1.",
        "pattern": "Peça mais destino. Peões dispensam a inicial: só a casa de destino.",
        "transferableRule": "A notação em inglês usa outras iniciais. Cf3 e Nf3 são o mesmo lance — livro importado não muda o xadrez."
      },
      "hints": [
        "Qual é a inicial de bispo em português?",
        "A casa que se escreve é a de destino, não a de origem.",
        "A origem só entra quando há ambiguidade entre duas peças iguais."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r6.05",
      "phase": "INDEPENDENT",
      "type": "NOTATION_WRITE",
      "prompt": "Escreva em notação algébrica o lance do rei de g6 para g5.",
      "fen": "3R4/1N6/6K1/8/8/1k6/6B1/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.notacao",
        "r1.localizar"
      ],
      "difficulty": 8,
      "ratingHint": 400,
      "acceptedAnswer": {
        "choice": "Rg5"
      },
      "predictableErrors": [
        {
          "answer": "g6g5",
          "cause": "RULE",
          "explanation": "Isso é notação de coordenadas, usada por computador. A notação algébrica de competição registra a inicial da peça e a casa de destino."
        }
      ],
      "explanation": {
        "perceived": "Você identificou a peça e a casa de destino.",
        "threat": "Súmula mal preenchida impede reclamar tríplice repetição e inviabiliza analisar a própria partida depois.",
        "bestDefense": "Inicial da peça mais casa de destino. Acrescente x para captura, + para xeque, # para mate e = para promoção.",
        "reason": "Rg5: o rei vai para g5.",
        "pattern": "Peça mais destino. Peões dispensam a inicial: só a casa de destino.",
        "transferableRule": "A notação em inglês usa outras iniciais. Cf3 e Nf3 são o mesmo lance — livro importado não muda o xadrez."
      },
      "hints": [
        "Qual é a inicial de rei em português?",
        "A casa que se escreve é a de destino, não a de origem.",
        "A origem só entra quando há ambiguidade entre duas peças iguais."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r6.06",
      "phase": "REVIEW",
      "type": "NOTATION_WRITE",
      "prompt": "Escreva em notação algébrica o lance da torre de g3 para h3.",
      "fen": "8/6N1/3k4/5B2/8/6R1/5K2/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.notacao",
        "r1.localizar"
      ],
      "difficulty": 4,
      "ratingHint": 400,
      "acceptedAnswer": {
        "choice": "Th3"
      },
      "predictableErrors": [
        {
          "answer": "g3h3",
          "cause": "RULE",
          "explanation": "Isso é notação de coordenadas, usada por computador. A notação algébrica de competição registra a inicial da peça e a casa de destino."
        }
      ],
      "explanation": {
        "perceived": "Você identificou a peça e a casa de destino.",
        "threat": "Súmula mal preenchida impede reclamar tríplice repetição e inviabiliza analisar a própria partida depois.",
        "bestDefense": "Inicial da peça mais casa de destino. Acrescente x para captura, + para xeque, # para mate e = para promoção.",
        "reason": "Th3: a torre vai para h3.",
        "pattern": "Peça mais destino. Peões dispensam a inicial: só a casa de destino.",
        "transferableRule": "A notação em inglês usa outras iniciais. Cf3 e Nf3 são o mesmo lance — livro importado não muda o xadrez."
      },
      "hints": [
        "Qual é a inicial de torre em português?",
        "A casa que se escreve é a de destino, não a de origem.",
        "A origem só entra quando há ambiguidade entre duas peças iguais."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r6.07",
      "phase": "INDEPENDENT",
      "type": "NOTATION_WRITE",
      "prompt": "Escreva em notação algébrica o lance da torre de e6 para d6.",
      "fen": "2K5/4N1B1/4R3/8/8/5k2/8/8 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.notacao",
        "r1.localizar"
      ],
      "difficulty": 5,
      "ratingHint": 400,
      "acceptedAnswer": {
        "choice": "Td6"
      },
      "predictableErrors": [
        {
          "answer": "e6d6",
          "cause": "RULE",
          "explanation": "Isso é notação de coordenadas, usada por computador. A notação algébrica de competição registra a inicial da peça e a casa de destino."
        }
      ],
      "explanation": {
        "perceived": "Você identificou a peça e a casa de destino.",
        "threat": "Súmula mal preenchida impede reclamar tríplice repetição e inviabiliza analisar a própria partida depois.",
        "bestDefense": "Inicial da peça mais casa de destino. Acrescente x para captura, + para xeque, # para mate e = para promoção.",
        "reason": "Td6: a torre vai para d6.",
        "pattern": "Peça mais destino. Peões dispensam a inicial: só a casa de destino.",
        "transferableRule": "A notação em inglês usa outras iniciais. Cf3 e Nf3 são o mesmo lance — livro importado não muda o xadrez."
      },
      "hints": [
        "Qual é a inicial de torre em português?",
        "A casa que se escreve é a de destino, não a de origem.",
        "A origem só entra quando há ambiguidade entre duas peças iguais."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
    {
      "slug": "g.r6.08",
      "phase": "INDEPENDENT",
      "type": "NOTATION_WRITE",
      "prompt": "Escreva em notação algébrica o lance do bispo de c8 para g4.",
      "fen": "2B5/7R/1N6/8/8/3k4/8/5K2 w - - 0 1",
      "sideToMove": "w",
      "skillIds": [
        "r6.notacao",
        "r1.localizar"
      ],
      "difficulty": 6,
      "ratingHint": 400,
      "acceptedAnswer": {
        "choice": "Bg4"
      },
      "predictableErrors": [
        {
          "answer": "c8g4",
          "cause": "RULE",
          "explanation": "Isso é notação de coordenadas, usada por computador. A notação algébrica de competição registra a inicial da peça e a casa de destino."
        }
      ],
      "explanation": {
        "perceived": "Você identificou a peça e a casa de destino.",
        "threat": "Súmula mal preenchida impede reclamar tríplice repetição e inviabiliza analisar a própria partida depois.",
        "bestDefense": "Inicial da peça mais casa de destino. Acrescente x para captura, + para xeque, # para mate e = para promoção.",
        "reason": "Bg4: o bispo vai para g4.",
        "pattern": "Peça mais destino. Peões dispensam a inicial: só a casa de destino.",
        "transferableRule": "A notação em inglês usa outras iniciais. Cf3 e Nf3 são o mesmo lance — livro importado não muda o xadrez."
      },
      "hints": [
        "Qual é a inicial de bispo em português?",
        "A casa que se escreve é a de destino, não a de origem.",
        "A origem só entra quando há ambiguidade entre duas peças iguais."
      ],
      "tags": [
        "gerado"
      ],
      "expectedSeconds": 35,
      "points": 10,
      "sources": [
        "fide-laws",
        "dagostini-basico"
      ]
    },
  ],
};

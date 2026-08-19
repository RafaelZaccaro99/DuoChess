# 05 — Wireframes textuais

Convenção: `[botão]` `{campo}` `«região viva/aria-live»` `▓` barra de progresso.

## W1 — Mapa do caminho (tela-âncora, mobile 390px)

```
┌───────────────────────────────────────┐
│ ⚡3   XP 1.240   Foco ▓▓▓▓▓░  Score 312│  ← barra de status: 4 sistemas SEPARADOS
├───────────────────────────────────────┤
│ LIGA RECRUTA                 0–800    │
│ ▓▓▓▓▓▓▓░░░░░░░  4 de 6 unidades       │
├───────────────────────────────────────┤
│                                       │
│   ✓ R1 Tabuleiro e coordenadas        │  ✓ = domínio ≥ 80
│   ✓ R2 Movimento das peças            │
│   ✓ R3 Capturas e valor               │
│                                       │
│   ● R4 Xeque e resposta ao xeque      │  ● = fronteira (desbloqueado agora)
│      domínio 46/100 · 3 revisões      │
│      [ CONTINUAR ]                    │
│                                       │
│   ○ R5 Mate e afogamento              │  ○ = bloqueado
│      requer R4                        │
│   ○ R6 Regras especiais e notação     │
│      requer R4                        │
├───────────────────────────────────────┤
│ SEU GARGALO AGORA                     │
│ Xeque duplo — 3 erros seguidos        │
│ [ TREINAR ESTE GARGALO ]              │
├───────────────────────────────────────┤
│ [mapa] [revisão·3] [jogar] [perfil]   │
└───────────────────────────────────────┘
```

Nota de projeto: a barra superior exibe sequência, XP, Foco e Chess Score **como quatro coisas
distintas**, nunca somadas. É a tradução visual da tese do produto.

## W2 — Lição, fase 4 (execução independente)

```
┌───────────────────────────────────────┐
│ ← R4 · Xeque e resposta      3/8  ▓▓▓░│
├───────────────────────────────────────┤
│ As pretas jogam. Só existe uma defesa │
│ legal. Encontre-a.                    │
├───────────────────────────────────────┤
│    a  b  c  d  e  f  g  h             │
│  8 ░▓░▓░▓░▓  8                        │
│  7 ▓░▓░▓░▓░  7      ← tabuleiro       │
│  6 ░▓░▓░▓░▓  6        cada casa é     │
│  5 ▓░▓░▓░▓░  5        <button>        │
│  4 ░▓░▓░▓░▓  4        navegável por   │
│  3 ▓░▓░▓░▓░  3        setas + Enter   │
│  2 ░▓░▓░▓░▓  2                        │
│  1 ▓░▓░▓░▓░  1                        │
│                                       │
│ «e4, cavalo branco. Selecionado.»     │  ← aria-live
├───────────────────────────────────────┤
│ [ 💡 dica 1 de 3 ]     ⏱ 00:24        │
└───────────────────────────────────────┘
```

## W3 — Feedback explicativo (nunca só certo/errado)

```
┌───────────────────────────────────────┐
│ ✗  Cd7 não resolve o xeque            │
├───────────────────────────────────────┤
│ O QUE VOCÊ PERCEBEU                   │
│ Você viu que o cavalo defende f6.     │
│                                       │
│ A AMEAÇA                              │
│ O bispo em b5 dá xeque na diagonal    │
│ b5–e8. Seu rei continua atacado.      │
│                                       │
│ A MELHOR DEFESA                       │
│ Cc6 bloqueia a diagonal e desenvolve. │
│                                       │
│ O PADRÃO                              │
│ Xeque em diagonal longa → bloquear na │
│ casa que também desenvolve.           │
│                                       │
│ REGRA TRANSFERÍVEL                    │
│ Diante de xeque: capturar, bloquear,  │
│ mover — nessa ordem de preferência.   │
├───────────────────────────────────────┤
│ [tabuleiro com seta b5→e8 destacada]  │
├───────────────────────────────────────┤
│ Revisão agendada para amanhã.         │
│ [ ENTENDI, CONTINUAR ]                │
└───────────────────────────────────────┘
```

## W4 — Resumo de sessão

```
┌───────────────────────────────────────┐
│ SESSÃO CONCLUÍDA · 11 min             │
├───────────────────────────────────────┤
│ ATIVIDADE          │ COMPETÊNCIA      │
│ +45 XP             │ Xeque   34 → 46  │
│ Sequência: 3 dias  │ Mate    12 → 12  │
│ Foco: ▓▓▓▓▓░       │ Score  308 → 312 │
│                    │                  │
│ XP mede seu esforço. O Chess Score    │
│ mede o que você domina. São coisas    │
│ diferentes e é assim de propósito.    │
├───────────────────────────────────────┤
│ SUA FORÇA     reconhecer xeque (82)   │
│ SEU GARGALO   xeque duplo (18)        │
│ PRÓXIMO PASSO treinar xeque duplo     │
├───────────────────────────────────────┤
│ 4 revisões chegam amanhã.             │
│ [ VER MAPA ]                          │
└───────────────────────────────────────┘
```

## W5 — Onboarding (passo 3 de 6)

```
┌───────────────────────────────────────┐
│ ▓▓▓░░░  3 de 6                        │
│ Você já jogou em torneio oficial?     │
│  ( ) Nunca                            │
│  ( ) Já joguei alguns                 │
│  ( ) Jogo regularmente                │
│  ( ) Tenho rating FIDE                │
│              [ VOLTAR ] [ CONTINUAR ] │
└───────────────────────────────────────┘
```

## W6 — Porta de entrada

```
┌───────────────────────────────────────┐
│ Por onde você quer começar?           │
├───────────────────────────────────────┤
│ ┌───────────────────────────────────┐ │
│ │ COMEÇAR DO ZERO           ~1 min  │ │
│ │ Nunca joguei ou quase nada.       │ │
│ └───────────────────────────────────┘ │
│ ┌───────────────────────────────────┐ │
│ │ TESTE RÁPIDO              ~5 min  │ │
│ │ 8 posições. Trilha aproximada.    │ │
│ └───────────────────────────────────┘ │
│ ┌───────────────────────────────────┐ │
│ │ DIAGNÓSTICO COMPLETO     ~25 min  │ │
│ │ 7 competências avaliadas.         │ │
│ └───────────────────────────────────┘ │
│ ┌───────────────────────────────────┐ │
│ │ IMPORTAR PARTIDAS         ~2 min  │ │
│ │ Traga seu PGN. Analisamos.        │ │
│ └───────────────────────────────────┘ │
│                                       │
│ ⚠ Não estimamos nível avançado só com │
│   múltipla escolha. Acima de 1400,    │
│   pedimos 10 partidas de 15+10.       │
└───────────────────────────────────────┘
```

## W7 — Análise de partida (etapa humana bloqueia a engine)

```
┌───────────────────────────────────────┐
│ Sua partida · lance 18 · momento      │
│ crítico 2 de 5                        │
├───────────────────────────────────────┤
│ [tabuleiro na posição do lance 18]    │
├───────────────────────────────────────┤
│ ANTES DE VER A ENGINE:                │
│ Que candidatos você considerou?       │
│ {____________________________}        │
│ Como avaliava a posição?              │
│ ( ) ganhando ( ) igual ( ) pior       │
│ Quanto tempo você gastou aqui?        │
│ {___} minutos                         │
├───────────────────────────────────────┤
│ [ REGISTRAR E VER A ENGINE ]          │
│ [ pular — reduz a confiança do        │
│   diagnóstico deste momento ]         │
└───────────────────────────────────────┘
```

## W8 — CMS, editor de exercício

```
┌──────────────────────────────────────────────────────┐
│ EXERCÍCIO #4821            estado: REVISÃO PEDAGÓGICA│
├────────────────────────┬─────────────────────────────┤
│ {FEN}                  │ [preview do tabuleiro]      │
│ {lado a jogar}         │                             │
│ {habilidades}          │ VALIDAÇÃO AUTOMÁTICA        │
│ {dificuldade}          │ ✓ FEN válido                │
│ {respostas aceitas}    │ ✓ posição legal             │
│ {erros previsíveis}    │ ✓ solução única (Stockfish) │
│ {explicação}           │ ✗ duplicata de #3190        │
│ {dica 1} {2} {3}       │ ✓ dificuldade coerente      │
├────────────────────────┴─────────────────────────────┤
│ RASCUNHO → REVISÃO ENXADRÍSTICA → REVISÃO PEDAGÓGICA │
│ → TESTE AUTOMÁTICO → PUBLICADO → MONITORAMENTO       │
│ [ DEVOLVER ]  [ APROVAR ]  (publicar bloqueado: ✗)   │
└──────────────────────────────────────────────────────┘
```

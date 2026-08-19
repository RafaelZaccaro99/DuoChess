# 07 — Riscos e trade-offs

## Riscos de produto

| # | Risco | Impacto | Mitigação |
|---|---|---|---|
| P1 | "Duolingo de xadrez" já existe (curso oficial, 2025) e cobre 0–1500 | alto | diferenciar na primeira sessão: causa do erro + Chess Score não-inflável + análise das partidas do próprio usuário |
| P2 | Gamificação canibaliza aprendizagem: usuário otimiza XP | alto | ADR-004, rendimento decrescente, teto por janela, Chess Score imune a XP |
| P3 | Currículo até 2300+ é caro e pode nunca ser preenchido | alto | MVP entrega 0–1400 com arquitetura para 2300+; ligas altas priorizadas por demanda medida |
| P4 | Sistema de Foco vira mecânica de monetização coercitiva | médio | Foco só se recupera por ação pedagógica; **nunca** por compra. Regra em código |
| P5 | Usuário abandona a etapa humana da análise | médio | pular é permitido, mas reduz a confiança da classificação e isso é dito |
| P6 | Conteúdo enxadrístico errado publicado | alto | workflow editorial de 6 estados + validação automática (FEN, legalidade, unicidade da solução, engine) |

## Riscos técnicos

| # | Risco | Impacto | Mitigação |
|---|---|---|---|
| T1 | Stockfish WASM trava a UI em dispositivos fracos | alto | worker dedicado, profundidade adaptativa, degradação para análise em fila |
| T2 | FSRS mal calibrado gera fila de revisão impossível | médio | teto diário de revisões, pesos configuráveis, teste de simulação em `domain/srs` |
| T3 | Modelo de domínio inflado por exercícios fáceis | alto | ganho de domínio ponderado por dificuldade + decaimento de confiança |
| T4 | Classificação de causa do erro imprecisa | médio | confiança explícita por classificação; abaixo do limiar, não alimenta o gargalo |
| T5 | Análise de PGN em lote estoura custo | médio | fila, cache por posição (FEN normalizado), limites por plano |
| T6 | IA gera explicação que contradiz a posição | alto | ADR-001: validação contra o motor de regras antes de exibir; descartar em caso de conflito |

## Riscos legais e de conformidade

| # | Risco | Mitigação |
|---|---|---|
| L1 | Semelhança com identidade do Duolingo | marca, mascotes, ícones, sons e layout originais; apenas princípios gerais reutilizados |
| L2 | Menores de idade | moderação de chat, rankings desligáveis, sem chat aberto por padrão para menores |
| L3 | Fair play | separação estrita entre estudo e competição; IA nunca assiste partida competitiva; logs auditáveis |
| L4 | Regras FIDE mudam | conteúdo normativo carimbado com edição vigente (Leis FIDE 01/01/2023) e aviso de verificação |

## Trade-offs assumidos

1. **Local-first no MVP × conta na nuvem.** Ganhamos velocidade e um motor demonstrável; perdemos
   sincronização entre dispositivos até a Sprint 3. Mitigado por ADR-005 (porta + adaptador).
2. **Conteúdo como código × CMS desde o dia 1.** Ganhamos validação em CI e revisão por PR;
   perdemos autoria por não-desenvolvedores até a Sprint 6.
3. **Etapa humana obrigatória na análise × conveniência.** Ganhamos aprendizagem real; perdemos
   usuários que só querem o número da engine. Aceito: esses usuários já são bem servidos.
4. **Currículo por grafo de dependências × trilha linear.** Ganhamos personalização real;
   perdemos a simplicidade visual de uma trilha única. Mitigado por um mapa que mostra apenas a
   fronteira desbloqueada.
5. **Chess Score próprio × só rating online.** Ganhamos uma medida de competência que não depende
   de volume de partidas; perdemos comparabilidade externa. Por isso os dois são exibidos lado a
   lado e nunca somados.

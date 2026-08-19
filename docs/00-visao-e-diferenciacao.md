# 00 — Visão, proposta e diferenciação

## Resumo executivo

**MestreXadrez** é um sistema operacional de formação enxadrística: escola, jogo, treinador,
sistema de performance e plataforma de carreira num único produto, PWA mobile-first.

A promessa: *aprenda a pensar como um enxadrista, treine como um atleta e evolua por um caminho
verificável até o xadrez competitivo.*

O produto resolve quatro falhas do mercado atual:

1. o iniciante não sabe o que estudar primeiro → **caminho curricular em 8 ligas**;
2. conteúdo não vira desempenho → **ciclo fechado aprender→praticar→jogar→analisar→corrigir**;
3. partidas sem diagnóstico → **classificação de erro por causa + DNA do Jogador**;
4. confusão entre atividade e domínio → **XP e Chess Score são sistemas separados por contrato**.

### O contrato de separação (regra arquitetural, não estética)

| Sistema | Mede | Pode ser comprado? | Pode ser "farmado"? |
|---|---|---|---|
| XP | esforço e atividade | não | não (rendimento decrescente) |
| Sequência | hábito | proteção limitada | não |
| Nível da conta | participação acumulada | não | não |
| **Chess Score (0–1000)** | **competência interna** | **nunca** | **nunca** |
| Domínio por habilidade (0–100) | força e lacuna | nunca | nunca |
| Rating online | desempenho na plataforma | nunca | nunca |
| Rating oficial (FIDE/CBX) | desempenho competitivo reconhecido | nunca | nunca |

Esta tabela é imposta em código: nenhum evento de XP pode escrever em `SkillMastery` ou
`ChessScore`, e nenhum produto pago altera domínio. Ver `docs/06-decisoes-tecnicas.md` (ADR-004).

## Diferenciação competitiva

| Eixo | Duolingo Chess | Chess.com | Lichess | **MestreXadrez** |
|---|---|---|---|---|
| Teto declarado | ~1500 Elo | sem currículo linear | sem currículo linear | **0 → 2300+** |
| Caminho curricular | sim, raso | fragmentado (Lessons) | fragmentado (Practice) | **8 ligas, dependências entre habilidades** |
| Repetição espaçada | sim, implícita | não | não | **FSRS explícito por habilidade e por posição** |
| Análise das partidas do usuário | não | sim, orientada a engine | sim, orientada a engine | **etapa humana antes da engine + causa do erro** |
| Classificação de erro por causa | não | parcial (blunder/inaccuracy) | parcial | **13 causas + reincidência + DNA do Jogador** |
| Transferência para partida real | não medida | não medida | não medida | **North Star Metric do produto** |
| Repertório | não | sim (produto separado) | estudos manuais | **repertório ligado ao currículo e ao adversário** |
| Competição presencial / carreira | não | não | não | **Centro de Performance, normas, CM→GM** |
| Treinador humano no loop | não | marketplace | não | **painel de treinador nativo, turmas e tarefas** |

**Onde não competimos:** volume de partidas online, comunidade e infraestrutura de servidores de
jogo. Chess.com e Lichess vencem por escala e efeito de rede. Nossa cunha é a *formação
verificável*: o que o usuário domina, por que erra, e a prova de que corrigiu.

**Risco de posicionamento:** "xadrez no estilo Duolingo" já existe desde 2025. Por isso o MVP
precisa mostrar, já na primeira sessão, algo que o Duolingo Chess não faz: diagnóstico de causa
do erro e um Chess Score que não sobe por atividade.

## North Star Metric

> **Decisões enxadrísticas corretamente dominadas e posteriormente transferidas para partidas,
> por semana.**

Uma decisão conta como *transferida* quando: (a) a habilidade atingiu domínio ≥ 80 numa avaliação
sem dicas, **e** (b) a mesma habilidade foi aplicada corretamente numa partida (bot, PvP ou PGN
importado) num momento crítico classificado pelo analisador, **e** (c) a habilidade não regrediu
na revisão espaçada seguinte.

Métricas auxiliares (nunca prova de aprendizagem): XP, tempo no app, número de exercícios.

## Personas

| Persona | Situação | Dor | O que o produto entrega |
|---|---|---|---|
| **Ana, 29, zero absoluto** | quer aprender do zero, 15 min/dia no celular | intimidada pelo jargão | Liga Recruta, microlições, feedback explicativo |
| **Bruno, 16, ~1100 online** | joga muito blitz, estagnou | repete os mesmos erros | DNA do Jogador, gargalo, revisão espaçada |
| **Clara, 34, ~1650 FIDE** | joga torneios locais | falta rotina e repertório | Centro de Performance, repertório, ciclos |
| **Diego, 21, ~2150 FIDE** | busca norma de MI | preparação e gestão de carreira | preparação de adversário, trilha de títulos |
| **Helena, treinadora** | 20 alunos | não escala diagnóstico | painel de treinador, turmas, tarefas |

## Jornada do usuário (Ana, primeira semana)

1. **D0** landing → cadastro → onboarding (6 perguntas) → escolhe "começar do zero".
2. **D0** teste de nivelamento curto (8 itens verificáveis) → recebe trilha e Chess Score inicial.
3. **D0** primeira lição (tabuleiro e coordenadas): apresentação → demonstração → guiado →
   independente → prova de domínio. Ganha XP e vê domínio subir *separadamente*.
4. **D1** notificação: 3 revisões agendadas + próxima lição. Sequência = 2.
5. **D3** primeira minipartida temática (mate de torre) contra bot com estilo.
6. **D5** erro reincidente detectado → o motor interrompe avanço e reensina por outra abordagem.
7. **D7** resumo semanal: força, gargalo, evolução do Chess Score, próxima recomendação.

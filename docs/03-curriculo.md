# 03 — Currículo 0 → 2300+

## 1. Estrutura

`Liga → Unidade → Habilidade → Lição → Exercício`

- **Liga**: faixa de formação (8 no total).
- **Unidade**: bloco temático com prova de domínio ao final.
- **Habilidade** (`Skill`): a unidade atômica de competência. É o que recebe domínio 0–100,
  o que o FSRS agenda e o que a classificação de erro aponta.
- **Lição**: sequência de 5 fases sobre uma ou mais habilidades.
- **Exercício**: item verificável com FEN/PGN.

### As 5 fases obrigatórias de toda lição

| Fase | Nome | O que acontece | Conta para domínio? |
|---|---|---|---|
| 1 | Apresentação | conceito em texto curto + porquê | não |
| 2 | Demonstração | posição no tabuleiro, sistema mostra | não |
| 3 | Execução guiada | usuário executa com dicas disponíveis | parcial (peso reduzido) |
| 4 | Execução independente | sem dicas | sim |
| 5 | Prova de domínio | itens novos, sem dicas, com tempo | sim (peso cheio) |

Depois: **aplicação real** (minipartida temática) e **revisão espaçada** agendada.

## 2. As oito ligas

| # | Liga | Faixa | Foco | Unidades |
|---|---|---|---|---|
| 1 | Recruta | 0–800 | tabuleiro, coordenadas, peças, capturas, xeque, mate, afogamento, roque, promoção, en passant, valor das peças, segurança, notação | 6 |
| 2 | Estrategista | 800–1200 | desenvolvimento, centro, segurança do rei, garfo, cravada, espeto, descoberto, remoção do defensor, mates, oposição, finais básicos | 7 |
| 3 | Tático | 1200–1400 | combinações, desvio, atração, sobrecarga, interferência, lance intermediário, sacrifícios, candidatos, visualização, cálculo, repertório inicial | 7 |
| 4 | Competidor | 1400–1600 | avaliação, atividade, espaço, iniciativa, casas fracas, postos avançados, estruturas, relógio, análise sem engine, primeiros torneios | 7 |
| 5 | Especialista | 1600–1800 | cálculo aprofundado, profilaxia, defesa, segunda fraqueza, peão isolado, pendentes, Carlsbad, Lucena, Philidor, repertório estruturado | 7 |
| 6 | Elite | 1800–2000 | múltiplos candidatos, avaliação dinâmica, sacrifícios posicionais, finais complexos, preparação de adversários, ciclos de torneio | 6 |
| 7 | Mestre | 2000–2200 | estratégia avançada, profilaxia profunda, repertório competitivo, banco de dados, cálculo sem mover peças, performance contra titulados | 6 |
| 8 | Candidato a título | 2200–2300+ | performance de norma, seleção de torneios, preparação específica, controle emocional, recuperação, equipe profissional | 5 |

## 3. Liga Recruta — detalhamento (implementado no MVP)

| Unidade | Habilidades | Prova de domínio |
|---|---|---|
| R1 — Tabuleiro e coordenadas | cor da casa, localizar casa, orientação do tabuleiro | nomear 10 casas e cores < 30s |
| R2 — Movimento das peças | movimento de cada peça, casas atacadas, peça que salta | listar casas atacadas sem erro |
| R3 — Capturas e valor | captura, peça indefesa, valor relativo, troca favorável | identificar captura vantajosa |
| R4 — Xeque e resposta ao xeque | reconhecer xeque, capturar/bloquear/mover, xeque de cavalo, xeque duplo | escolher a única defesa legal |
| R5 — Mate e afogamento | mate em 1, reconhecer afogamento, mate de torre, mate de dama | mate em 1 em 8 posições novas |
| R6 — Regras especiais e notação | roque, en passant, promoção, ler e escrever notação | reconstruir posição a partir do PGN |

**Dependências (grafo, não lista):** R2 exige R1. R3 exige R2. R4 exige R2. R5 exige R4.
R6 exige R4 (roque depende de entender xeque). O mapa desbloqueia por dependência satisfeita,
não por ordem linear — quem já domina R1 pula direto para R2.

## 4. Distribuição de estudo por faixa

| Faixa | Tática | Cálculo | Finais | Estratégia | Aberturas | Partidas/Análise |
|---|---|---|---|---|---|---|
| 0–1400 | 45% | — | 25% | — | 10% | 20% |
| 1400–1800 | — | 35% | 20% | 20% (com abertura) | — | 25% |
| 1800–2100 | — | 30% | 15% | 20% | 10% | 25% |
| 2100+ | plano individual orientado por dados | | | | | |
| 2300+ | preparação específica, repertório profundo, estratégia de normas | | | | | |

O motor adaptativo usa esta tabela como *prior*, e desvia dela conforme o gargalo medido.
A distribuição é configurável por `src/domain/adaptive/config.ts`.

## 5. Currículo de 24 meses

| Fase | Meses | Objetivo |
|---|---|---|
| Fundação | 1–3 | regras sólidas, mates técnicos, tática de padrão único, notação |
| Processo de decisão | 4–6 | candidatos, verificação antierro, análise sem engine |
| Consolidação | 7–12 | estruturas, finais de torre, repertório inicial, primeiros torneios |
| Especialização | 13–18 | profilaxia, cálculo profundo, repertório estruturado, ciclos |
| Avaliação competitiva | 19–24 | performance, rating oficial, decisão de carreira |

## 6. Aviso obrigatório de expectativa

A conclusão de um curso **não** é garantia de rating ou título. Níveis avançados dependem de
transferência para partidas oficiais. Este aviso aparece no resultado do diagnóstico e no
Centro de Performance — não em letra miúda.

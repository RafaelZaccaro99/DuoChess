# 04 — MVP, backlog e sprints

## Definição de pronto do MVP (critério de aceite do produto)

O MVP está pronto quando **todas** as afirmações abaixo forem verdadeiras:

1. O usuário faz onboarding e escolhe uma porta de entrada (zero / teste rápido / diagnóstico completo / importar partidas).
2. Recebe uma trilha personalizada derivada do diagnóstico, não uma trilha fixa.
3. Executa lições completas nas 5 fases e recebe feedback explicativo (nunca só "certo/errado").
4. Acumula **XP e domínio separadamente**, e a interface deixa a diferença explícita.
5. Revisa itens agendados por FSRS.
6. Importa PGN e recebe análise com etapa humana antes da engine.
7. Joga contra bot com estilo e erros humanos plausíveis.
8. Acompanha o Chess Score geral e por competência, com gargalo e próxima recomendação.
9. O administrador publica exercícios **sem alterar código**.
10. Nenhum botão sem função; nenhum dado simulado sem aviso explícito na interface.

Teto pedagógico do MVP: **1200–1400**. Arquitetura suporta 2300+.

## Fases de implementação

| Fase | Nome | Entrega |
|---|---|---|
| F1 | Fundação | tipos de domínio, currículo, modelo de domínio, Chess Score, FSRS, mixer, taxonomia de erro, testes |
| F2 | Tabuleiro | componente acessível, legalidade, setas, destaques, histórico, PGN/FEN |
| F3 | Exercícios | tipos modulares, avaliação, dicas em 3 níveis, feedback explicativo |
| F4 | Caminho | mapa por dependências, onboarding, diagnóstico, sessão adaptativa |
| F5 | Repetição | fila de revisão, microlição por erro conceitual |
| F6 | Gamificação | XP, sequência, Foco, missões, conquistas |
| F7 | Partidas | bots com estilo, minipartidas temáticas, modos |
| F8 | Análise | importação de PGN, etapa humana, engine, classificação de causa, DNA do Jogador |
| F9 | CMS | workflow editorial, validação, publicação |
| F10 | Analytics | eventos, North Star, experimentos, feature flags |
| F11 | Testes e polimento | E2E, acessibilidade, performance |

## Sprints (2 semanas cada)

| Sprint | Escopo | Critério de aceite |
|---|---|---|
| **S1** | F1 completa: `domain/` puro + conteúdo da Liga Recruta + testes | `npm test` verde; domínio, Chess Score e FSRS calculados sem I/O |
| **S2** | F2 + F3: tabuleiro acessível, 6 tipos de exercício, feedback | navegação por teclado funcional; exercício avaliado contra `chess.js` |
| **S3** | F4 + persistência servidor (Prisma/Postgres, auth) | trilha personalizada; progresso sincroniza entre dispositivos |
| **S4** | F5 + F6: revisão espaçada e gamificação | fila do dia respeita teto; teste de arquitetura impede XP→domínio |
| **S5** | F7: bots Stockfish com estilo e minipartidas temáticas | bot erra de forma plausível por faixa de rating |
| **S6** | F8: análise de partidas e DNA do Jogador | etapa humana bloqueia engine; causa classificada com confiança |
| **S7** | F9: CMS e workflow editorial | admin publica exercício novo sem deploy |
| **S8** | F10 + F11: analytics, North Star, E2E, WCAG 2.2 AA | North Star calculável; auditoria de acessibilidade sem violação AA |

## Backlog priorizado (épicos → histórias)

### E1 — Motor pedagógico *(S1)*
- H1.1 Modelo de domínio 0–100 com 6 estados e decaimento de confiança.
- H1.2 Chess Score 0–1000 com 8 componentes configuráveis.
- H1.3 FSRS com estabilidade/dificuldade e microlição em erro conceitual.
- H1.4 Mixer adaptativo 50/20/20/10 configurável.
- H1.5 Taxonomia de 13 causas de erro + reincidência.
- H1.6 Grafo de dependências do currículo com fronteira desbloqueada.

### E2 — Tabuleiro e exercícios *(S2)*
- H2.1 Tabuleiro acessível: teclado, `aria-live`, coordenadas, orientação.
- H2.2 Clique e arraste, promoção, roque, en passant.
- H2.3 Setas e destaques (cor **e** forma).
- H2.4 Tipos de exercício: casas atacadas, lance legal, mate em 1, defesa do xeque, captura vantajosa, notação.
- H2.5 Dicas em 3 níveis com custo de domínio decrescente.
- H2.6 Feedback: percepção, ameaça, melhor defesa, motivo, padrão, regra transferível.

### E3 — Caminho e onboarding *(S3–S4)*
- H3.1 Onboarding de 6 perguntas.
- H3.2 Quatro portas de entrada.
- H3.3 Diagnóstico completo por competência.
- H3.4 Mapa por dependências.
- H3.5 Sessão adaptativa montada pelo mixer.

### E4 — Revisão e gamificação *(S4)*
- H4.1 Fila diária com teto.
- H4.2 XP anti-farming.
- H4.3 Sequência com proteção limitada.
- H4.4 Foco: cai com erro, recupera por ação pedagógica, nunca por compra.

### E5 — Partidas *(S5)* · **E6 — Análise** *(S6)* · **E7 — CMS** *(S7)* · **E8 — Analytics** *(S8)*

## Estado atual desta entrega

Implementado: **E1 completo, E2 parcial (H2.1–H2.4, H2.6), E3 parcial (H3.1, H3.2, H3.4)**, mais
o schema de dados completo e o conteúdo da Liga Recruta. Ver `README.md` §"O que já funciona".

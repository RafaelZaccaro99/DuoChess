# 06 — Decisões técnicas (ADRs)

Formato: contexto → decisão → consequência → alternativa rejeitada.

---

## ADR-001 — Regras de xadrez são determinísticas e nunca decididas por IA

**Contexto.** O produto usa IA para explicar e adaptar. Legalidade de lance, xeque, mate,
afogamento, roque, en passant e reclamações de empate são normativos.

**Decisão.** Toda legalidade passa por `chess.js` dentro de `src/domain/chess`. Nenhuma resposta
de modelo de linguagem entra no caminho de validação. Uma explicação gerada por IA que contradiga
o motor de regras é descartada, não exibida.

**Consequência.** Explicações de IA só podem ser exibidas depois de passarem por uma checagem
contra o estado real da posição. Custa uma camada extra de validação.

**Rejeitado.** Deixar o modelo julgar legalidade "quando a posição for simples" — não há critério
seguro para essa fronteira.

---

## ADR-002 — Conteúdo como código tipado, com CMS escrevendo no mesmo schema

**Contexto.** O spec exige que o administrador publique exercícios sem alterar código, e que o
conteúdo seja validado (FEN, legalidade, solução, duplicidade).

**Decisão.** O conteúdo é definido por tipos Zod (`src/content/schema.ts`). No MVP a fonte é
TypeScript versionado em git, validado em CI por `npm run content:validate`. O CMS da Sprint 6
grava no banco usando **exatamente o mesmo schema**, e o mesmo validador roda no servidor.

**Consequência.** Conteúdo do MVP é revisável por pull request e nunca sobe com FEN inválido.
Migração para o CMS é troca de *loader*, não de formato.

**Rejeitado.** CMS-first desde o início: bloquearia a produção de conteúdo atrás de UI de admin
antes de existir currículo.

---

## ADR-003 — FSRS como algoritmo de repetição espaçada

**Contexto.** Precisamos de estabilidade, dificuldade, e intervalos que reajam à qualidade da
resposta e ao uso de dicas.

**Decisão.** Implementar FSRS (estado: estabilidade, dificuldade, retrievability) em
`src/domain/srs`, com pesos configuráveis. Resposta correta sem dica amplia o intervalo; erro
**conceitual** (não de execução) não apenas reduz o intervalo — dispara microlição.

**Consequência.** Duas trilhas de revisão: por *habilidade* (conceito) e por *posição* (item).
Erro conceitual reinicia a habilidade, não só o cartão.

**Rejeitado.** SM-2: intervalos menos precisos e sem separação entre dificuldade e estabilidade.

---

## ADR-004 — XP e domínio são fisicamente separados

**Contexto.** O risco central do produto é virar um jogo de acumular XP que não ensina.

**Decisão.** `XPEvent` e `SkillMastery` vivem em módulos diferentes, com repositórios diferentes.
`src/domain/gamification` **não importa** `src/domain/mastery`. Um teste de arquitetura falha o
build se essa importação aparecer. XP tem rendimento decrescente por dificuldade e teto por
janela de tempo (anti-farming).

**Consequência.** É impossível, por construção, que uma promoção comercial ou um evento de
engajamento inflem competência.

**Rejeitado.** "Disciplina de código review" — não sobrevive a pressa.

---

## ADR-005 — MVP local-first, servidor na Sprint 3

**Contexto.** O motor pedagógico precisa ser exercitável e demonstrável antes de existir
infraestrutura de contas e banco.

**Decisão.** `ProgressRepository` é uma porta. O adaptador local (browser) é o do MVP; o adaptador
Prisma/Postgres entra na Sprint 3 sem tocar em `src/domain`. A interface **avisa explicitamente**
que o progresso é local ao dispositivo — nunca fingir que há conta na nuvem.

**Consequência.** Sem sincronização entre dispositivos até a Sprint 3.

**Rejeitado.** Mock silencioso de API — o spec proíbe dados simulados sem aviso.

---

## ADR-006 — Stockfish em worker WASM, com tradução obrigatória para linguagem humana

**Contexto.** Centipawns não ensinam. "−2.3" não é feedback.

**Decisão.** A engine roda em Web Worker (nunca no thread da UI). Toda saída passa por um tradutor
que considera rating do usuário, tempo disponível, dificuldade e consequência prática, e produz:
o que foi percebido, a ameaça, a melhor defesa, o motivo do lance, o padrão e a regra transferível.

**Consequência.** Análise nunca exibe avaliação crua sem texto; o custo é um dicionário de
explicações por padrão.

---

## ADR-007 — Etapa humana antes da engine na análise de partidas

**Contexto.** Se a engine fala primeiro, o usuário para de pensar.

**Decisão.** O fluxo de análise bloqueia a engine até o usuário registrar, nos momentos críticos:
candidatos considerados, cálculo, avaliação, emoção e tempo gasto. Só então a engine compara.

**Consequência.** Análise mais lenta e mais valiosa. Usuário pode pular, mas o produto registra
que pulou e isso reduz a confiança da classificação de erro.

---

## ADR-008 — Acessibilidade do tabuleiro é requisito, não polimento

**Contexto.** WCAG 2.2 AA está no spec. Tabuleiros de xadrez costumam ser inacessíveis.

**Decisão.** O tabuleiro é navegável por teclado (setas + Enter para selecionar/mover), cada casa
é um `button` com rótulo acessível ("e4, cavalo branco"), lances são anunciados em `aria-live`,
e a orientação/coordenadas são configuráveis. Cor nunca é o único portador de informação:
destaques usam cor **e** forma.

**Consequência.** O componente de tabuleiro é mais complexo que um `<div>` com drag-and-drop.

# 09 — Plano até o MVP rodando

Escrito depois da fundação, medindo o código que existe. Substitui a sequência
especulativa de `docs/04` como plano de execução; `docs/04` continua valendo como
definição de pronto e backlog de épicos.

> **Decisão tomada — autoria do conteúdo.** O conteúdo enxadrístico é pesquisado e
> escrito a partir de bibliografia especializada e fontes normativas, sem revisor
> humano titulado no fluxo editorial. Esta página já reflete essa escolha: ela
> muda a sequência dos blocos, não só a forma de trabalhar. Ver §4.

## 0. O que a decisão de autoria muda

O workflow editorial do spec previa um gate `CHESS_REVIEW` preenchido por uma
pessoa forte. Sem essa pessoa, o gate ficaria vazio — e o spec é explícito ao
proibir publicar conteúdo gerado por IA sem validação. Então ele foi **dividido
em dois gates verificáveis por máquina**:

| Gate | O que confere | Como |
|---|---|---|
| `ENGINE_REVIEW` | fatos enxadrísticos | motor de regras hoje; Stockfish a partir de A2: unicidade da solução, se o erro previsível realmente perde, calibração de dificuldade |
| `SOURCE_REVIEW` | afirmações pedagógicas | toda habilidade ancorada em obra do registro (`src/content/bibliografia.ts`), coerente com a competência e adequada ao nível |

Nenhum item publica sem passar pelos dois. Ambos já rodam em CI
(`npm run content:validate`) e têm teste que prova que reprovam.

**A consequência de sequência:** sem revisor humano, **a engine passa a ser o
revisor**. Ela deixa de ser um recurso de produto (bots, análise) e vira
infraestrutura de qualidade do conteúdo. Por isso o Stockfish sobe de A4 para
**A2**: nada de tática pode ser publicado com confiança antes dele existir.

**O que essa troca não cobre — e é honesto dizer.** Uma citação prova que a
afirmação está ancorada numa obra reconhecida, não que a explicação foi conferida
por alguém forte. A engine confere que `Dxh5` ganha o cavalo; ela não confere se
chamar aquilo de "peça indefesa" é o nome certo do padrão, nem se a regra
transferível que escrevemos generaliza bem. O risco migra de *xadrez errado* para
*ensino errado*. Três respostas, nesta ordem:

1. os dois gates automáticos, que já existem;
2. o canal de **exercícios contestados** (já previsto em `docs/08`) como correção
   empírica — item contestado volta para revisão;
3. uma **auditoria por amostragem** antes do lançamento: um jogador forte revisa
   ~5% do acervo, procurando erro sistemático em vez de item a item. São poucas
   horas de trabalho avulso e é o único ponto do plano em que eu recomendo
   insistir em gente. Não é revisão item a item; é conferir se o método está torto.

## 1. Onde estamos (medido, não estimado)

| Área | Estado |
|---|---|
| Domínio puro (`src/domain`) | 2.348 linhas, 12 arquivos, sem I/O |
| Testes | 89, incluindo guarda de arquitetura e jornada completa da Liga Recruta |
| Rotas | 5 de ~11 previstas |
| Tipos de exercício | 10 implementados de 28 no spec |
| Conteúdo | 1 liga de 8 · 18 habilidades · 7 lições · 20 exercícios |
| **Itens por habilidade** | **média 1,67 · 7 habilidades com um único item** |
| Persistência | local ao dispositivo; schema Prisma pronto, sem servidor |
| Engine | nenhuma |

O motor pedagógico está pronto e testado. O que falta é quase tudo que o cerca.

## 2. O vão contra o "pronto" do MVP

Os dez critérios de `docs/04`:

| # | Critério | Estado | Falta |
|---|---|---|---|
| 1 | Onboarding + porta de entrada | pronto | — |
| 2 | Trilha personalizada derivada do diagnóstico | parcial | o diagnóstico não existe; a trilha vem só do grafo |
| 3 | Lições 5 fases + feedback explicativo | parcial | mecanismo pronto, volume de conteúdo insuficiente |
| 4 | XP e domínio separados | pronto | — |
| 5 | Revisão espaçada FSRS | parcial | motor pronto, sem tela de fila nem sessão diária |
| 6 | Importar PGN + análise com etapa humana | falta | tudo |
| 7 | Bot com estilo e erro plausível | falta | tudo |
| 8 | Chess Score geral e por competência | pronto | — |
| 9 | Admin publica exercício sem alterar código | falta | CMS e workflow editorial |
| 10 | Nada simulado, nenhum botão morto | pronto | manter sob pressão de prazo |

Fora dos dez, mas necessário para "rodar" como produto: contas e servidor,
Stockfish, filas para análise em lote, PWA/offline, analytics instrumentado,
E2E e auditoria WCAG 2.2 AA.

## 3. A linha crítica é conteúdo, não código

Um exercício neste schema exige FEN, enunciado, gabarito, pelo menos um erro
previsível com causa e explicação, explicação em seis partes e três dicas —
cerca de 40 linhas de texto enxadrístico revisado.

O MVP ensina até 1200–1400, ou seja três ligas. Para o FSRS ter o que agendar
sem repetir a mesma posição, cada habilidade precisa de ~6 itens:

| Liga | Habilidades | Itens necessários | Existem | Faltam |
|---|---:|---:|---:|---:|
| Recruta | 18 | ~110 | 20 | ~90 |
| Estrategista | ~28 | ~170 | 0 | ~170 |
| Tático | ~28 | ~170 | 0 | ~170 |
| **Total** | **~74** | **~450** | **20** | **~430** |

A ritmo de autoria manual honesto (10 itens/dia, já contando revisão), são
**~43 dias-pessoa só de escrita**.

Em dias brutos isso é menos que a engenharia restante (~80 dias-dev). O problema
é outro: engenharia divide entre duas pessoas e se contrata no mercado; autoria
enxadrística revisada depende de alguém que saiba escrever pedagogia de xadrez
correta — e essa pessoa costuma ser uma só. Com um autor, o conteúdo passa a ser
o caminho crítico:

| Frente | Dias-pessoa | Com a equipe recomendada | Vira caminho crítico? |
|---|---:|---|---|
| Engenharia (A1–A8) | ~80 | 2 devs → ~8 semanas | não |
| Conteúdo, autoria manual | ~43 | 1 autor → ~8,6 semanas | **sim** |
| Conteúdo, com as alavancas | ~18 | 1 autor → ~3,6 semanas | não |

Ignorar isso é o jeito mais provável de o plano estourar.

### Três alavancas que derrubam esse número

1. **Geração determinística.** Para `LEGAL_MOVES`, `ATTACKED_SQUARES`,
   `SQUARE_COLOR`, `IS_MATE_OR_STALEMATE` e `NOTATION_*`, o motor de regras
   *sabe* a resposta. Um gerador produz posição e gabarito corretos por
   construção, com explicação por template parametrizado. O validador que já
   existe prova a correção item a item. Cobre boa parte de Recruta e
   Estrategista a custo quase zero.
2. **Posições de base aberta.** Para os tipos táticos, importar as posições de
   uma base pública de puzzles em vez de caçar FEN à mão — **verificar a licença
   antes de usar**. O trabalho humano vira só a explicação.
3. **IA como rascunhista, humano como revisor.** O spec autoriza IA a gerar
   rascunho e proíbe publicar sem validação. O workflow editorial de seis
   estados existe justamente para isso.

Com as três, os ~430 itens caem para a ordem de **15–20 dias-pessoa**.

## 4. O plano: duas trilhas em paralelo

A Trilha B só destrava quando A2 entrega o revisor automatizado e A3 entrega o
gerador. Por isso A2 e A3 vêm cedo, antes de coisas mais vistosas.

### Trilha A — Engenharia

| Bloco | Entrega | Por que nesta posição |
|---|---|---|
| **A1** | Servidor, contas e migração de persistência | Postgres + Prisma + autenticação; troca o adaptador local (ADR-005). Tudo depois disso depende de haver onde gravar. |
| **A2** | **Stockfish e verificação enxadrística automatizada** | Subiu de A4. Sem revisor humano, a engine é o revisor: unicidade da solução, o erro previsível realmente perde, dificuldade calibrada. Nenhum item tático publica com confiança antes disto. |
| **A3** | Gerador determinístico e pipeline de autoria | Geração dos tipos que o motor resolve sozinho, importação de posições, e o gate de fontes já ligado. Destrava a produção de conteúdo em volume. |
| **A4** | Sessão diária e fila de revisão | O motor adaptativo e o FSRS já existem e estão invisíveis. Maior valor por linha de código do plano. |
| **A5** | Bots, minipartida e análise de partidas | A engine já está pronta desde A2, então este bloco fica bem mais barato do que seria. Import de PGN, etapa humana antes da engine (ADR-007), classificação de causa, DNA. Torna a North Star mensurável. |
| **A6** | Diagnóstico real | Teste rápido e diagnóstico completo por competência. Depende de conteúdo (A3/B) e engine (A2). |
| **A7** | CMS com os gates automatizados | Critério 9 do pronto. Vem tarde porque o gerador de A3 já faz o conteúdo fluir antes dele existir. |
| **A8** | Analytics, PWA/offline, E2E, WCAG | Instrumentar a North Star, auditar acessibilidade, fechar. Inclui a auditoria por amostragem do §0. |

### Trilha B — Conteúdo (começa ao fim de A3)

| Bloco | Entrega |
|---|---|
| **B1** | Recruta completa (~90 itens novos) |
| **B2** | Liga Estrategista (~170) |
| **B3** | Liga Tático (~170) |
| **B4** | Revisão enxadrística e pedagógica de todo o acervo |

## 5. Critérios de aceite verificáveis

Cada bloco fecha quando dá para provar, não quando "parece pronto".

| Bloco | Aceite |
|---|---|
| A1 | O mesmo usuário abre em dois aparelhos e vê o mesmo domínio; `npm test` continua verde sem tocar em `src/domain`. |
| A2 | Um exercício com solução ambígua é **reprovado** pelo `ENGINE_REVIEW` sem ninguém apontar; a engine nunca bloqueia a interface. |
| A3 | O gerador produz ≥ 100 itens e `content:validate` passa em todos, sem exceção manual, com fonte citada em cada habilidade. |
| A4 | Um item errado hoje reaparece na fila no dia previsto pelo FSRS; a sessão respeita a mistura configurada e o teto diário. |
| A5 | O bot de 800 comete erro plausível de 800, não lance aleatório; a engine só aparece depois do registro humano, e pular reduz a confiança da classificação. |
| A6 | Duas pessoas com respostas diferentes recebem trilhas diferentes, e o nível avançado continua marcado como não confiável sem partidas. |
| A7 | Um administrador publica um exercício novo sem deploy, e o item reprovado em qualquer dos dois gates não sobe. |
| A8 | North Star calculável a partir de eventos reais; auditoria WCAG 2.2 AA sem violação; E2E cobre onboarding → lição → revisão → análise; auditoria por amostragem concluída. |
| B1–B3 | Nenhuma habilidade com menos de 6 itens; toda unidade com prova de domínio; zero divergência no `content:validate`. |

## 6. Calendário

Blocos de duas semanas. Duas montagens de equipe:

| Cenário | Equipe | Prazo |
|---|---|---|
| Enxuto | 1 dev, pesquisando e escrevendo o conteúdo | **~17 semanas** |
| Recomendado | 2 devs, mais auditoria por amostragem avulsa antes do lançamento | **~10 semanas** |

**O prazo quase não melhorou com a decisão de autoria, e é importante entender
por quê.** O trabalho de conteúdo não desapareceu: ele saiu de um autor
enxadrista e caiu sobre a mesma equipe que escreve o código. As duas trilhas
deixaram de ser paralelas de verdade e viraram uma fila só.

O que a decisão realmente comprou não foi tempo — foi **remover uma dependência
de contratação**. Não é mais preciso encontrar, contratar e coordenar alguém
titulado antes de o conteúdo começar a existir; e o gargalo passa a ser
engenharia, que é o recurso que já se tem.

## 7. Se precisar ser mais rápido, corte conteúdo — não mecanismo

A tentação é cortar bots e análise (A4/A5). É o corte errado: são exatamente
eles que sustentam a diferenciação contra Duolingo Chess, e sem A5 a North Star
não tem como ser medida — o produto perde o instrumento que prova que ensina.

O corte honesto é **de volume**: lançar com duas ligas em vez de três, MVP
ensinando até ~1200. Tira ~170 itens do caminho crítico, mantém o ciclo
pedagógico inteiro de pé, e conteúdo é a única coisa desta lista que cresce
bem depois do lançamento.

## 8. Riscos que estouram o plano

| Risco | Sinal de alerta | Resposta |
|---|---|---|
| **Conteúdo enxadristicamente correto e pedagogicamente errado** | itens contestados concentrados numa mesma habilidade ou padrão | é o risco principal desde a decisão de autoria. Gates automáticos, canal de contestação e auditoria por amostragem (§0) |
| Volume de conteúdo | fim de B1 atrasado | acionar as três alavancas antes, cortar a terceira liga |
| Conteúdo e código competindo pela mesma pessoa | blocos de engenharia escorregando enquanto B avança (ou o contrário) | separar as semanas explicitamente: alternar blocos, nunca intercalar dentro da semana |
| Stockfish em aparelho fraco | análise travando a interface | profundidade adaptativa e degradação para fila |
| FSRS mal calibrado | fila diária impossível ou trivial | teto diário já existe; recalibrar pesos com dados reais em A8 |
| Custo de análise em lote | conta de infraestrutura subindo | cache por FEN normalizado e limite por plano |

## 9. Decisões que dependem de você

1. ~~**Quem escreve e quem revisa o conteúdo enxadrístico?**~~ **Respondido:**
   pesquisa em bibliografia especializada e fontes normativas, sem revisor
   titulado no fluxo. Os dois gates verificáveis já estão implementados; a
   auditoria por amostragem do §0 continua recomendada e ainda não está agendada.
2. **MVP até 1200 (duas ligas) ou até 1400 (três)?** Muda ~4 semanas.
3. **Contas:** e-mail e senha próprios, ou entrar com Google/Apple?
4. **Hospedagem:** o caminho mais curto é Vercel com Postgres gerenciado.

Nas três em aberto eu sigo com o padrão razoável se não houver preferência:
três ligas, entrar com Google e Apple, Vercel com Postgres gerenciado.

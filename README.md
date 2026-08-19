# MestreXadrez

Plataforma educativa de xadrez gamificada e mobile-first — escola, jogo, treinador,
sistema de performance e plataforma de carreira num único produto.

> Aprenda a pensar como um enxadrista, treine como um atleta e evolua por um caminho
> verificável até o xadrez competitivo.

## A tese, em uma tabela

| Sistema | Mede | Pode ser comprado? |
|---|---|---|
| XP, sequência, Foco | atividade e hábito | não |
| **Chess Score (0–1000), domínio por habilidade** | **competência demonstrada** | **nunca** |

Esta separação é imposta em código, não por convenção: `src/domain/gamification` não
pode importar `src/domain/mastery` nem `src/domain/score`, e `tests/architecture.test.ts`
falha o build se isso acontecer.

## O que já funciona

Rode `npm install && npm run dev` e abra `http://localhost:3000`.

- **Landing** com as oito ligas e o estado real de cada uma (as vazias aparecem como vazias).
- **Onboarding** de 6 perguntas + escolha da porta de entrada, com o aviso obrigatório de
  que nível avançado não é estimado por múltipla escolha.
- **Mapa** desbloqueado por grafo de dependências, com o motivo do bloqueio nomeado e o
  gargalo atual em destaque.
- **Lição** nas cinco fases (apresentação → demonstração → guiado → independente → prova
  de domínio), com tabuleiro acessível, dicas em três níveis e feedback explicativo completo.
- **Perfil** com Chess Score por competência, cobertura, DNA do Jogador e transferência.
- **Motor pedagógico completo**: domínio 0–100 com decaimento de confiança, FSRS com
  microlição por erro conceitual, motor adaptativo que interrompe o avanço na reincidência,
  taxonomia de 13 causas de erro, XP anti-farming.
- **Liga Recruta** completa: 6 unidades, 18 habilidades, 7 lições e **112 exercícios** —
  20 escritos à mão e 92 gerados —, todos aprovados nos dois gates.
- **Prática dirigida por habilidade** (`/praticar/[skillId]`), alcançável pelo cartão de
  gargalo do mapa.

### Conteúdo escrito à mão e conteúdo gerado

As fases GUIADA e PROVA DE DOMÍNIO continuam escritas à mão: é onde mora o momento de
ensino. O gerador preenche a repetição — prática independente e revisão —, que é do que a
repetição espaçada precisa e o que faltava: antes deste sprint havia **1,67 item por
habilidade**, então o FSRS reagendava sempre a mesma posição e o aluno decorava o tabuleiro
em vez do padrão. Hoje o mínimo é 7.

O gerador é determinístico e a saída é commitada, para que os gates rodem em CI sobre
exatamente o que vai ao ar.

## O que ainda não existe — e é dito na interface

O spec proíbe dado simulado silencioso e botão sem função. Por isso:

- **Ligas 2 a 8 ainda sem conteúdo** — ver abaixo.
- **Ligas 2 a 8 estão declaradas e sem conteúdo.** Aparecem marcadas como "em produção".
- **Diagnóstico, importação de PGN, bots e análise de partidas** estão nas sprints 3, 5 e 6.
  As portas de entrada do onboarding dizem isso em vez de simular um resultado.

## Banco de dados

O bloco A1 está pronto: contas, sessão e progresso no servidor. Sem `DATABASE_URL`
o app continua funcionando com o adaptador local do navegador — a interface diz onde
o progresso está guardado, em vez de fingir que existe conta.

```bash
createdb mestrexadrez
cp .env.example .env          # ajuste DATABASE_URL e AUTH_SECRET
npm run prisma:migrate        # cria as 47 tabelas
npm run prisma:seed           # semeia o currículo (o conteúdo em git é a fonte)
```

## Comandos

```bash
npm run dev               # desenvolvimento
npm run build             # build de produção
npm test                  # 152 testes; os de integração pulam sem DATABASE_URL
npm run typecheck         # TypeScript estrito
npm run content:validate  # gate SOURCE_REVIEW + regras: FEN, legalidade, gabarito, fontes
npm run content:engine    # gate ENGINE_REVIEW: unicidade da solução, erro que erra mesmo
npm run content:gerar     # regera o banco de prática (determinístico; a saída é commitada)
```

## Estrutura

```
docs/          visão, arquitetura, dados, currículo, backlog, wireframes, ADRs, riscos
prisma/        modelo de dados completo (40 entidades)
src/
  app/         rotas (App Router)
  components/  UI — tabuleiro acessível, lição, medidores
  domain/      LÓGICA PURA, sem I/O: chess, mastery, score, srs, adaptive, errors,
               gamification, curriculum, session
  content/     currículo tipado — fonte da verdade do MVP
  lib/         portas de infraestrutura
tests/         domínio, conteúdo e guardas de arquitetura
scripts/       validação de conteúdo em CI
```

**Regra de ouro:** nada em `src/domain/**` faz `fetch`, toca `window` ou acessa banco.
Recebe estado, devolve estado novo. É o que torna o motor pedagógico auditável — e
testável sem subir nada.

## Documentação

| Documento | Conteúdo |
|---|---|
| [`docs/00`](docs/00-visao-e-diferenciacao.md) | resumo executivo, diferenciação, personas, jornada |
| [`docs/01`](docs/01-arquitetura.md) | domínios, ciclo pedagógico, stack, telas |
| [`docs/02`](docs/02-modelo-de-dados.md) | decisões do modelo relacional |
| [`docs/03`](docs/03-curriculo.md) | currículo 0 → 2300+ e detalhamento da Liga Recruta |
| [`docs/04`](docs/04-mvp-backlog-sprints.md) | definição de pronto, backlog e 8 sprints |
| [`docs/05`](docs/05-wireframes.md) | wireframes textuais das telas-âncora |
| [`docs/06`](docs/06-decisoes-tecnicas.md) | 8 ADRs |
| [`docs/07`](docs/07-riscos-e-tradeoffs.md) | riscos de produto, técnicos e legais |
| [`docs/08`](docs/08-analytics-e-metricas.md) | North Star, eventos e regras de experimentação |

## Aviso

Concluir um curso não garante rating nem título. Níveis avançados dependem de
transferência para partidas oficiais. Regras normativas seguem as Leis do Xadrez FIDE
vigentes desde 1º de janeiro de 2023 — confirme a edição vigente antes de competir.

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
- **Liga Recruta** completa: 6 unidades, 18 habilidades, 7 lições, 20 exercícios validados
  contra o motor de regras.

## O que ainda não existe — e é dito na interface

O spec proíbe dado simulado silencioso e botão sem função. Por isso:

- **Progresso é local ao dispositivo.** Não há conta nem sincronização. A interface diz
  isso; o schema Prisma completo já está em `prisma/schema.prisma` e o adaptador de
  servidor entra na Sprint 3, trocando só `src/lib/storage.ts` (ADR-005).
- **Ligas 2 a 8 estão declaradas e sem conteúdo.** Aparecem marcadas como "em produção".
- **Diagnóstico, importação de PGN, bots e análise de partidas** estão nas sprints 3, 5 e 6.
  As portas de entrada do onboarding dizem isso em vez de simular um resultado.

## Comandos

```bash
npm run dev               # desenvolvimento
npm run build             # build de produção
npm test                  # 85 testes de domínio e arquitetura
npm run typecheck         # TypeScript estrito
npm run content:validate  # confere FEN, legalidade, gabarito, ciclos e duplicidade
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

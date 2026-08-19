# 01 — Arquitetura de informação e arquitetura técnica

## 1. Domínios (bounded contexts)

O sistema é dividido em domínios que **não compartilham estado mutável**. A comunicação
acontece por eventos de domínio ou por portas explícitas.

```
┌──────────────────────────────────────────────────────────────────────┐
│ APRENDIZAGEM            currículo, lições, exercícios, tentativas,   │
│  (learning)             domínio por habilidade, revisão espaçada,    │
│                         motor adaptativo, Chess Score                │
├──────────────────────────────────────────────────────────────────────┤
│ XADREZ                  regras, legalidade, FEN/PGN, tabuleiro,      │
│  (chess)                engine, análise de partidas, classificação   │
│                         de erro, repertório                          │
├──────────────────────────────────────────────────────────────────────┤
│ GAMIFICAÇÃO             XP, sequência, Foco, missões, ligas,         │
│  (gamification)         conquistas, moedas, temporadas               │
├──────────────────────────────────────────────────────────────────────┤
│ SOCIAL                  amigos, clubes, rankings, turmas             │
├──────────────────────────────────────────────────────────────────────┤
│ PERFORMANCE             calendário, torneios, adversários, carga,    │
│                         prontidão, trilha de títulos                 │
├──────────────────────────────────────────────────────────────────────┤
│ CMS                     autoria, revisão enxadrística, revisão       │
│                         pedagógica, publicação, tradução             │
├──────────────────────────────────────────────────────────────────────┤
│ PAGAMENTOS              assinaturas, planos, entitlements            │
├──────────────────────────────────────────────────────────────────────┤
│ ANALYTICS               eventos, experimentos, feature flags         │
└──────────────────────────────────────────────────────────────────────┘
```

### Regras de acoplamento (verificadas em teste)

- `gamification` **pode ler** eventos de `learning`; **não pode escrever** em domínio/Chess Score.
- `learning` **não importa** nada de `gamification`. Teste `tests/architecture.test.ts` falha se importar.
- `chess` é puro e determinístico. Não depende de rede nem de IA.
- `payments` concede acesso a *features*, nunca a *progresso*.

## 2. Fluxo do ciclo pedagógico

```
        ┌────────────┐
        │  APRENDER  │ microlição: conceito → demonstração
        └─────┬──────┘
              ▼
        ┌────────────┐
        │  PRATICAR  │ guiado → independente → prova de domínio
        └─────┬──────┘
              ▼
        ┌────────────┐
        │   JOGAR    │ minipartida temática / bot / PvP / torneio
        └─────┬──────┘
              ▼
        ┌────────────┐
        │  ANALISAR  │ etapa humana primeiro, engine depois
        └─────┬──────┘
              ▼
        ┌──────────────────┐
        │ CLASSIFICAR ERRO │ 13 causas → ErrorClassification
        └─────┬────────────┘
              ▼
        ┌────────────┐   gargalo alimenta o mixer da próxima sessão
        │  CORRIGIR  │──────────────────────────────┐
        └─────┬──────┘                              │
              ▼                                     │
        ┌────────────┐                              │
        │  REVISAR   │ FSRS agenda reencontro       │
        └─────┬──────┘                              │
              ▼                                     │
        ┌──────────────┐                            │
        │ TESTAR DE    │ verifica transferência ────┘
        │ NOVO         │ → conta na North Star
        └──────────────┘
```

## 3. Arquitetura técnica

### Stack

| Camada | Escolha | Motivo |
|---|---|---|
| App | Next.js 15 (App Router) + React 19 + TypeScript estrito | PWA, SSR para landing/SEO, RSC para painéis |
| Estilo | Tailwind CSS + tokens de design próprios | consistência e velocidade; sem dependência de tema de terceiros |
| Regras de xadrez | `chess.js` | determinístico, testado, sem IA no caminho da legalidade |
| Engine | Stockfish WASM (worker) + serviço isolado para lotes | avaliação local barata; análise pesada fora do thread |
| Persistência | PostgreSQL + Prisma | relacional, o modelo é fortemente relacional |
| Filas | worker + fila (BullMQ/Redis ou fila gerenciada) | análise de PGN é assíncrona |
| Conteúdo | *content-as-code* tipado + CMS que escreve no mesmo schema | conteúdo versionado e validável em CI |
| Testes | Vitest (unidade/integração) + Playwright (E2E) | |

### Camadas

```
src/
  app/          Next.js App Router — rotas, RSC, server actions
  components/   UI (tabuleiro, cartões, gráficos) — sem regra de negócio
  domain/       LÓGICA PURA, sem I/O, 100% testável
    chess/        regras, FEN/PGN, avaliação de exercício
    curriculum/   ligas, unidades, habilidades, dependências
    mastery/      modelo de domínio 0–100 e decaimento de confiança
    score/        Chess Score 0–1000
    srs/          FSRS
    adaptive/     mixer de sessão, detecção de reincidência
    errors/       taxonomia e classificação de causa
    gamification/ XP, sequência, Foco
  content/      currículo e exercícios tipados (fonte da verdade do MVP)
  lib/          portas de infraestrutura (storage, engine, analytics)
```

**Regra de ouro:** `src/domain/**` não faz `fetch`, não acessa `window`, não acessa banco.
Recebe estado e devolve estado novo. É isso que torna o motor pedagógico auditável.

### Persistência — porta e adaptadores

```
                     ┌──────────────────────┐
   domain/  ────────▶│  ProgressRepository  │  (porta, interface)
                     └──────────┬───────────┘
                                │
              ┌─────────────────┴─────────────────┐
              ▼                                   ▼
   LocalProgressRepository              PrismaProgressRepository
   (browser, IndexedDB/localStorage)    (PostgreSQL, servidor)
   usado no MVP local e offline         Sprint 3 em diante
```

O estado do MVP atual é **local ao dispositivo** e isso é dito ao usuário na interface — não há
dado simulado silencioso. O schema Prisma completo já está em `prisma/schema.prisma` para que a
migração seja um troco de adaptador, não uma reescrita.

## 4. Arquitetura de informação (mapa de navegação)

```
/                       landing pública
/entrar                 login / cadastro
/onboarding             6 perguntas + escolha de porta de entrada
/diagnostico            nivelamento (rápido, completo, ou importar PGN)
/mapa                   caminho: ligas → unidades → habilidades
/licao/[id]             execução da lição (5 fases)
/revisao                fila do dia (FSRS)
/jogar                  bots, minipartidas temáticas, modos
/analise                importar PGN, análise humana → engine
/perfil                 Chess Score, competências, DNA do Jogador
/performance            Centro de Performance (Competidor+)
/treinador              painel do treinador
/admin                  CMS e workflow editorial
/configuracoes          acessibilidade, sons, rankings, dados
```

## 5. Telas do MVP

1. Landing 2. Cadastro/Login 3. Onboarding 4. Diagnóstico 5. Resultado do diagnóstico
6. Mapa do caminho 7. Lição (5 fases) 8. Exercício + tabuleiro 9. Feedback explicativo
10. Resumo de sessão 11. Fila de revisão 12. Perfil e Chess Score 13. DNA do Jogador
14. Importar PGN 15. Análise de partida 16. Jogar contra bot 17. Ranking (desligável)
18. Configurações 19. CMS: lista de exercícios 20. CMS: editor com validação

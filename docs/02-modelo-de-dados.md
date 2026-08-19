# 02 — Modelo de dados

Fonte da verdade: `prisma/schema.prisma`. Este documento explica as decisões, não repete os campos.

## Agrupamento por domínio

| Domínio | Entidades |
|---|---|
| Identidade | `User`, `Profile`, `Goal`, `Subscription`, `Notification` |
| Currículo | `Course`, `World` (liga), `Unit`, `Skill`, `SkillDependency`, `Lesson`, `Exercise` |
| Aprendizagem | `ExerciseAttempt`, `SkillMastery`, `ReviewSchedule`, `ChessScoreSnapshot`, `DiagnosticResult` |
| Gamificação | `Streak`, `XPEvent`, `Wallet`, `Achievement`, `Quest`, `League`, `FocusState` |
| Social | `Friendship`, `Club`, `ClubMember` |
| Xadrez | `Game`, `GameMove`, `ImportedPGN`, `GameAnalysis`, `CriticalMoment`, `ErrorClassification` |
| Repertório | `Repertoire`, `OpeningLine` |
| Competição | `Tournament`, `TournamentResult` |
| Treinador | `Coach`, `CoachStudent`, `Assignment` |
| Plataforma | `Experiment`, `FeatureFlag`, `ContentReview`, `AnalyticsEvent` |

## Decisões que o schema impõe

### D1 — `SkillMastery` e `XPEvent` não se referenciam

Não existe chave estrangeira entre eles, nem campo derivado de um no outro. A separação da tese do
produto é estrutural (ADR-004), não convenção.

### D2 — `Exercise` carrega tudo que o spec exige de um item

`fen`, `pgn`, `sideToMove`, `skills[]`, `difficulty`, `ratingHint`, `acceptedAnswers[]`,
`predictableErrors[]`, `explanation`, `hints[3]`, `authorId`, `reviewState`, `tags[]`,
`expectedSeconds`, `points`. Um item sem explicação ou sem erros previsíveis **não pode ser
publicado** — restrição do workflow, verificada em `ContentReview`.

### D3 — `SkillMastery` guarda confiança e decaimento

Campos: `value` (0–100), `state` (enum de 6), `confidence` (0–1), `lastAssessedAt`,
`decayRatePerDay`. O valor exibido é `value` ajustado pelo tempo desde `lastAssessedAt` — por isso
domínio **cai sozinho** se não for reavaliado, e exercícios fáceis não elevam indefinidamente.

### D4 — `ReviewSchedule` é FSRS, com duas granularidades

`scope` = `SKILL` ou `EXERCISE`. Guarda `stability`, `difficulty`, `lastReviewedAt`,
`dueAt`, `lapses`, `reps`, `lastGrade`, `usedHints`. Erro **conceitual** grava
`triggeredMicrolesson = true` e reinicia o cartão de habilidade, não só o do item.

### D5 — `ErrorClassification` tem confiança explícita

Uma causa classificada com `confidence < 0.6` é registrada mas **não alimenta** o gargalo do motor
adaptativo. Evita que um diagnóstico ruim sequestre a trilha do usuário.

### D6 — `Game` é a fronteira da transferência

A North Star exige ligar habilidade dominada a uma decisão correta em partida. `CriticalMoment`
referencia `skillId`, e `GameAnalysis.transferredSkillIds[]` materializa essa ligação.

### D7 — Snapshots, não recálculo

`ChessScoreSnapshot` é gravado a cada sessão. O Chess Score é reproduzível a partir dos
componentes guardados no snapshot — auditável, e a evolução é uma série temporal real.

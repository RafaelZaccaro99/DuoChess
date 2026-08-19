# 08 — Analytics, métricas e experimentação

## North Star

```
NSM(semana) = |{ (usuário, habilidade) :
      domínio ≥ 80 em avaliação sem dicas
  AND aplicada corretamente em momento crítico de partida
  AND não regrediu na revisão espaçada seguinte }|
```

Implementada em `src/domain/score/north-star.ts`. Não é derivável de XP nem de tempo no app.

## Métricas de aprendizagem

| Métrica | Definição | Alvo inicial |
|---|---|---|
| Retenção de conteúdo 7/30/90 | acerto sem dica na revisão em D+7 / D+30 / D+90 | ≥ 85% / 75% / 65% |
| Reincidência | mesma causa de erro em janela de 14 dias | ↓ mês a mês |
| Transferência | habilidades dominadas que aparecem corretas em partida | ≥ 40% |
| Erros graves por partida | perde material, permite mate ou muda a avaliação decisivamente | ↓ |
| Momento do primeiro erro | número do lance | ↑ |
| Performance por competência | acerto por eixo do Chess Score | — |

## Métricas de produto

Onboarding concluído · D1/D7/D30 · sequência mediana · lições/sessão · unidades concluídas ·
PGNs importados · taxa de retorno após erro reincidente · conversão para Pro/Elite ·
exercícios contestados · divergências entre revisor e engine.

## Contrato de eventos

Todo evento: `{ name, userId, timestamp, sessionId, props }`. Nomes em `snake_case`, verbo no
passado. Eventos do MVP:

```
onboarding_started · onboarding_completed · diagnostic_started · diagnostic_completed
lesson_started · lesson_phase_completed · exercise_attempted · hint_used
mastery_changed · chess_score_updated · review_due_shown · review_completed
microlesson_triggered · bottleneck_identified · session_summary_viewed
pgn_imported · human_analysis_completed · human_analysis_skipped · engine_analysis_completed
error_classified · game_started · game_finished · skill_transferred
xp_awarded · streak_extended · focus_depleted · focus_recovered
```

**Regra:** `xp_awarded` e `mastery_changed` nunca são disparados pelo mesmo produtor. Se um dia
forem, é bug de arquitetura (ADR-004).

## Experimentação

`Experiment` + `FeatureFlag` no schema. Regras:

1. Nenhum experimento pode ter como métrica primária XP, tempo no app ou nº de exercícios.
2. Métrica primária de experimento de aprendizagem é sempre retenção ou transferência.
3. Experimento que aumenta engajamento e reduz retenção em D+30 é **revertido**, não celebrado.

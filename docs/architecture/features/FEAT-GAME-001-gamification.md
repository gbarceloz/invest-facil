---
feature_id: FEAT-GAME-001
name: XP, níveis, conquistas e streak
domain: gamification
subdomain: progression
status:
  discovery: MAPPED
  implementation: IMPLEMENTED
  test: TESTED
  verification: PARTIAL
  human_review: NOT REQUIRED
  deployment: NOT VERIFIED
  publication: NOT APPLICABLE
---

# FEAT-GAME-001 — XP, níveis, conquistas e streak

## Resumo
Calcula XP total, nível, progresso para o próximo nível, streak atual/melhor e conquistas
desbloqueadas. XP é append-only e idempotente por aula/motivo.

## Frontend
| Item | Referência |
|---|---|
| Dashboard | `frontend/app/app/page.tsx` |
| Progresso | `frontend/app/app/progresso/page.tsx` |
| Shell | `frontend/components/app-shell.tsx` |
| Contexto | `frontend/lib/app-data.tsx` |
| Componentes | `ProgressBar`, `LevelRing` |

## API
| Método/path | Controller → Service | DTO | Auth |
|---|---|---|---|
| `GET /api/v1/gamification/summary` | `GamificationController.summary` → `GamificationService.summary` | — → `GamificationSummary` | autenticado |
| `GET /api/v1/gamification/achievements` | `achievements` | — → `List<AchievementView>` | autenticado; **não usado** |
| `GET /api/v1/gamification/xp` | `xpHistory` | — → `List<XpEntry>` | autenticado |

## Backend
- `LEVELS`: 1 Curioso 0, 2 Explorador 300, 3 Analista 800, 4 Estrategista 1500,
  5 Investidor Consciente 2500, 6 Mestre 4000.
- `awardXp`: único por `(user, lesson, reason)` para `LESSON_COMPLETED`/`QUIZ_PASSED`;
  captura `DataIntegrityViolationException` de corrida.
- `evaluateAchievements`: 7 códigos (`FIRST_LESSON`, `FIRST_QUIZ`, `STREAK_7`,
  `QUIZ_MASTER`, `MODULE_FINISHED`, `XP_1000`, `FIRST_SIMULATION`).
- Streak por datas de atividade em `America/Sao_Paulo`; atual/melhor.
- `ProgressMetrics` fornece aulas, média/tentativas de quiz e módulo concluído.

## Database
`xp_ledger` (append-only; unique partial index), `achievements` (7), `user_achievements`
(PK user+achievement; append-only), `user_progress`, `quiz_attempts` (métricas).
Migrations V1/V3/V5.

## Security
- Ownership por `userId` do principal.
- XP/achievements append-only para o runtime (V5).
- Sem endpoint para conceder XP manualmente.
- Admin não tem endpoint de gamificação.

## Tests
| Teste | Cobertura |
|---|---|
| `MvpFlowIntegrationTest` | XP 120 (50 aula + 30 quiz + 20+20 conquistas) |
| `FlywaySecurityIntegrationTest` | append-only de XP |
| **níveis/streak/achievements** | sem teste dedicado |

## Dependencies
`FEAT-PROGRESS-001/002`, `FEAT-SIM-002` (FIRST_SIMULATION), `FEAT-DASH-001`.

## Evidence / limitations
- Verificado: XP total no fluxo integrado e append-only.
- Não verificado: boundaries de nível, streak em múltiplos dias/timezone, cada achievement,
  concorrência de unlock, UI E2E.

## Change impact
Alterar XP/níveis/streak afeta dashboard, progresso, simulador, conquistas e testes.

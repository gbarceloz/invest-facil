---
feature_id: FEAT-PROGRESS-001
name: Conclusão de aula
domain: progress
subdomain: lesson-completion
status:
  discovery: MAPPED
  implementation: IMPLEMENTED
  test: TESTED
  verification: VERIFIED
  human_review: NOT REQUIRED
  deployment: NOT VERIFIED
  publication: NOT APPLICABLE
---

# FEAT-PROGRESS-001 — Conclusão de aula

## Resumo
Marca uma aula publicada como concluída de forma idempotente e concede 50 XP na primeira
conclusão. Retorna status/XP/level/streak e alimenta o resumo global.

## Frontend
| Item | Referência |
|---|---|
| Página | `frontend/app/app/aprender/aula/[slug]/page.tsx` |
| Ação | `POST /api/v1/progress/lessons/{lessonId}` (frontend monta com o id da aula); depois navega ao quiz |
| Contexto | `frontend/lib/app-data.tsx` (`reload`) |

## API
| Método/path | Controller → Service | DTO | Auth |
|---|---|---|---|
| `POST /api/v1/progress/lessons/{lessonId}` | `ProgressController.complete` → `ProgressService.completeLesson` | — → `CompleteLessonResponse` (201/200) | autenticado |
| `GET /api/v1/progress/lessons/{lessonId}` | `status` → `lessonStatus` | — → `LessonStatus` | autenticado |

## Backend
- `requirePublishedLesson` valida existência/publicação.
- Se não existe `user_progress`, cria e chama `gamification.awardXp(userId, 50,
  LESSON_COMPLETED, lessonId)`.
- Unique `(user_id, lesson_id)` e índice único de XP garantem idempotência inclusive em
  corrida; retorno 201 na primeira, 200 nas seguintes.
- `lessonStatus` lê conclusão + melhor percentual/tentativas de quiz.

## Database
`user_progress` (unique user+lesson), `xp_ledger` (50 XP, unique por aula/motivo),
`user_achievements` (avaliação), `lessons` (published). Testcontainers V1/V3.

## Security
- Ownership: `userId` vem do principal; não há path de outro usuário.
- Aula precisa ser publicada.
- XP é append-only; UPDATE/DELETE revogados ao runtime.

## Tests
| Teste | Cobertura |
|---|---|
| `MvpFlowIntegrationTest` | primeira conclusão 201 + 50 XP; segunda 200 + `alreadyCompleted` |
| `FlywaySecurityIntegrationTest` | append-only do `xp_ledger` |
| **status** | sem teste dedicado |

## Dependencies
`FEAT-AUTH-002`, `FEAT-LEARN-002`, `FEAT-GAME-001`. Tabelas `user_progress`, `xp_ledger`.

## Evidence / limitations
- **VERIFIED** para o caminho principal: idempotência e XP provados no teste integrado.
- Não verificado: aula não publicada/inexistente, concorrência real, UI E2E, streak após
  múltiplos dias.

## Change impact
Alterar XP ou idempotência afeta gamificação, dashboard, progresso e testes integrados.

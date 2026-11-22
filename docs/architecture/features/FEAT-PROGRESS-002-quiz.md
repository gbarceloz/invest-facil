---
feature_id: FEAT-PROGRESS-002
name: Quiz de aula
domain: progress
subdomain: quiz
status:
  discovery: MAPPED
  implementation: IMPLEMENTED
  test: TESTED
  verification: PARTIAL
  human_review: NOT REQUIRED
  deployment: NOT VERIFIED
  publication: NOT APPLICABLE
---

# FEAT-PROGRESS-002 — Quiz de aula

## Resumo
Entrega perguntas sem gabarito, valida respostas completas/únicas, calcula score e aprova
com ≥70%. A primeira aprovação concede 30 XP; toda tentativa é registrada.

## Frontend
| Item | Referência |
|---|---|
| Página | `frontend/app/app/aprender/quiz/[slug]/page.tsx` |
| Pré-requisito | `LessonStatus.completed` (frontend e backend) |
| Progresso visual | evento `quiz:progress` consumido por `FocusedLessonShell` |

## API
| Método/path | Controller → Service | DTO | Auth |
|---|---|---|---|
| `GET /api/v1/progress/lessons/{lessonId}/quiz` | `ProgressController.quiz` → `ProgressService.quiz` | — → `QuizView` | autenticado |
| `POST /api/v1/progress/lessons/{lessonId}/quiz` | `submit` → `submitQuiz` | `QuizSubmitRequest` → `QuizResult` | autenticado |

## Backend
- `quiz`: exige aula publicada e perguntas; retorna opções sem `correctIndex`.
- `submitQuiz`: todas as questões respondidas exatamente uma vez; índice válido;
  calcula score, grava `quiz_attempts` e `quiz_attempt_answers`.
- `passed = percent >= 70`; `hadPassedBefore` evita XP duplicado.
- `awardXp(30, QUIZ_PASSED)` na primeira aprovação; `evaluateAchievements` sempre.
- `QuizView` não expõe gabarito; o resultado expõe `correctIndex` após envio.

## Database
`quiz_questions` (`options jsonb`, `correct_index`), `quiz_attempts` (score/max/taken_at),
`quiz_attempt_answers` (selected/correct), `xp_ledger` (30 XP, unique),
`user_achievements`. Migrations V1/V3.

## Security
- Autenticado; `userId` do principal.
- Ownership por `userId` nas tentativas; não há consulta de tentativas de outro usuário.
- Gabarito não vai na consulta; validação server-side.
- Sem limite de tentativas; XP é limitado pela primeira aprovação.

## Tests
| Teste | Cobertura |
|---|---|
| `MvpFlowIntegrationTest` | GET quiz; POST 100%; pass; XP; resumo |
| **casos negativos** | sem teste para incomplete/duplicate/invalid option/70% |
| **replay de XP** | coberto indiretamente por unique; sem teste dedicado |

## Dependencies
`FEAT-PROGRESS-001` (pré-requisito), `FEAT-LEARN-002`, `FEAT-GAME-001`.

## Evidence / limitations
- Verificado: caminho 100% e XP no teste integrado.
- Não verificado: 70% boundary, respostas duplicadas/incompletas/ inválidas, múltiplas
  tentativas, UI E2E, concorrência.

## Change impact
Alterar regra de aprovação/XP afeta gamificação, dashboard, progresso e testes.

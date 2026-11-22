---
feature_id: FEAT-SIM-002
name: Cenários de simulação salvos
domain: simulator
subdomain: saved-scenarios
status:
  discovery: MAPPED
  implementation: IMPLEMENTED
  test: TESTED
  verification: PARTIAL
  human_review: NOT REQUIRED
  deployment: NOT VERIFIED
  publication: NOT APPLICABLE
---

# FEAT-SIM-002 — Cenários salvos

## Resumo
Salva, lista e exclui cenários do próprio usuário. O salvamento recalcula o cenário e
concede a conquista `FIRST_SIMULATION`; exclusão exige ownership.

## Frontend
| Item | Referência |
|---|---|
| Página | `frontend/app/app/simulador/page.tsx` |
| Chamadas | `POST/GET /api/v1/simulator/scenarios`, `DELETE /scenarios/{id}` |
| Contexto | `frontend/lib/app-data.tsx` (reload de gamificação) |

## API
| Método/path | Controller → Service | DTO | Auth |
|---|---|---|---|
| `POST /api/v1/simulator/scenarios` | `SimulatorController.save` → `SimulatorService.save` | `SaveScenarioRequest` → `SavedScenario` | autenticado |
| `GET /api/v1/simulator/scenarios` | `list` → `list` | — → `List<SavedScenario>` | autenticado |
| `DELETE /api/v1/simulator/scenarios/{id}` | `delete` → `delete` | — → 204 | autenticado |

## Backend
- `save`: recalcula com `calculate`, grava `simulations` (valores finais/investidos),
  chama `gamification.unlockByCode(userId, "FIRST_SIMULATION")`.
- `list`: `findByUserIdOrderByCreatedAtDesc(userId)`.
- `delete`: busca por id, filtra `userId`, 404 se não for do usuário; deleta.
- `V4` adiciona `inflation_rate`; `V3` cria a tabela e índice por usuário.

## Database
`simulations`: user_id, nome, valores, meses, taxa, inflação, finais, created_at;
`xp_ledger`/`user_achievements` via gamificação. FK ON DELETE CASCADE.

## Security
- Ownership em list/delete; `save` usa principal.
- Sem endpoint para ler cenário de outro usuário.
- RLS/FORCE per-user (V6); ownership também é validado na query/service; V7 local.
- Sem rate limit específico para cenários (bucket geral `/api/v1`).

## Tests
| Teste | Cobertura |
|---|---|
| `MvpFlowIntegrationTest` | save 201 |
| **list/delete/ownership** | sem teste |
| **achievement** | sem teste dedicado |

## Dependencies
`FEAT-SIM-001`, `FEAT-AUTH-002`, `FEAT-GAME-001`; `simulations`.

## Evidence / limitations
- Verificado: criação de cenário no fluxo integrado.
- Não verificado: listagem, exclusão, tentativa de excluir cenário de outro usuário,
  limites de nome/valores, UI E2E.

## Change impact
Alterar schema/cálculo afeta cenários salvos e gamificação; migração exige nova V.

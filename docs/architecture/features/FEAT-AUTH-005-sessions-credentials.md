---
feature_id: FEAT-AUTH-005
name: Sessões e troca de senha
domain: auth
subdomain: session-management
status:
  discovery: MAPPED
  implementation: IMPLEMENTED
  test: NOT VERIFIED
  verification: PARTIAL
  human_review: NOT REQUIRED
  deployment: NOT VERIFIED
  publication: NOT APPLICABLE
---

# FEAT-AUTH-005 — Sessões e troca de senha

## Resumo
Lista e revoga sessões ativas do próprio usuário e permite trocar a senha mediante senha
atual. Troca de senha revoga todas as sessões.

## Frontend
| Item | Referência |
|---|---|
| Página | `frontend/app/app/perfil/page.tsx` |
| Sessões | estado local + `GET/DELETE /auth/sessions` |
| Troca de senha | formulário + `POST /auth/change-password`; logout após sucesso |

## API
| Método/path | Controller → Service | DTO | Auth |
|---|---|---|---|
| `GET /api/v1/auth/sessions` | `AuthController.sessions` → `AuthService.sessions` | — → `List<SessionView>` | autenticado |
| `DELETE /api/v1/auth/sessions/{id}` | `revokeSession` | — → 204 | autenticado |
| `DELETE /api/v1/auth/sessions` | `revokeAllSessions` | — → 204 | autenticado |
| `POST /api/v1/auth/change-password` | `changePassword` | `ChangePasswordRequest` → `MessageResponse` | autenticado |

## Backend
- `sessions`: lista refresh tokens ativos do `userId`, marca o atual comparando hash.
- `revokeSession`: `revokeOne(userId, id)`; 0 linhas → 404.
- `revokeAllSessions`: revoga todos; limpa cookie no controller.
- `changePassword`: valida senha atual, troca hash, revoga todas as sessões e audita.

## Database
`refresh_tokens` (hash, família, expiração, revogação), `users.password_hash`, `auth_event`
(`SESSION_REVOKED`, `ALL_SESSIONS_REVOKED`, `PASSWORD_CHANGED`).

## Security
- Ownership: todas as operações filtram `user_id` do principal.
- Revogação de sessão não afeta access JWT já emitido (máx. 15 min).
- Troca de senha limpa cookie e exige novo login.
- Sem MFA obrigatório para trocar senha (apenas senha atual).

## Tests
Nenhum teste automatizado dedicado para sessões ou `change-password`.
`MvpFlowIntegrationTest` cobre rotação/reuso de refresh, não a listagem/revogação.

## Dependencies
`FEAT-AUTH-002` (refresh/sessão), `users`, `refresh_tokens`.

## Evidence / limitations
- Verificado: código e UI; rotação de refresh no teste integrado.
- **NOT VERIFIED:** listagem/revogação de sessão, troca de senha, revogação em massa,
  cookie/UI E2E, concorrência.

## Change impact
Alto: sessões e senha afetam autenticação de todos os usuários; exigir teste de ownership
e revogação antes de alterar.

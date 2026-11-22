---
feature_id: FEAT-USER-001
name: Perfil do usuário
domain: user
subdomain: profile
status:
  discovery: MAPPED
  implementation: IMPLEMENTED
  test: TESTED
  verification: PARTIAL
  human_review: NOT REQUIRED
  deployment: NOT VERIFIED
  publication: NOT APPLICABLE
---

# FEAT-USER-001 — Perfil do usuário

## Resumo
Exibe e atualiza nome/avatar do usuário autenticado. E-mail, papel, verificação e MFA são
somente leitura no perfil.

## Frontend
| Item | Referência |
|---|---|
| Página | `frontend/app/app/perfil/page.tsx` |
| Contexto | `frontend/lib/auth.tsx` (`user`, `setUser`, `refreshUser`) |
| Cliente | `frontend/lib/api.ts` |

## API
| Método/path | Controller → Service | DTO | Auth |
|---|---|---|---|
| `GET /api/v1/users/me` | `UserController.me` → `UserService.require` | — → `UserView` | autenticado |
| `PATCH /api/v1/users/me` | `update` → `UserService.updateProfile` | `UpdateProfileRequest` → `UserView` | autenticado |

## Backend
- `UserService.require(id)` lança 404 se não existir.
- `updateProfile` altera nome (2–120) e avatar HTTPS (≤500) apenas do principal.
- `UserDtos.UserView.from` expõe id, nome, e-mail, role, verified, MFA, avatar, createdAt.
- Não há endpoint para alterar e-mail, role ou verificação.

## Database
`users`: `name`, `email`, `avatar_url`, `role`, `verified`, `mfa_enabled`, `created_at`
(V1 + V3).

## Security
- Ownership pelo `@AuthenticationPrincipal`; não há `id` no path.
- Role/e-mail não são editáveis por este endpoint.
- Avatar exige `https://`; sem upload de arquivo.

## Tests
| Teste | Cobertura |
|---|---|
| `MvpFlowIntegrationTest` | `GET /users/me` após login |
| `RegisterValidationTest` | validação de nome/e-mail no cadastro |
| **PATCH** | sem teste automatizado |

## Dependencies
`FEAT-AUTH-002`; `users`. Consumido por perfil/shell.

## Evidence / limitations
- Verificado: leitura do perfil no fluxo integrado.
- Não verificado: atualização de nome/avatar, erro 404, UI E2E, XSS em nome/avatar.

## Change impact
Alterar DTO de usuário afeta shell, perfil, auth e `MvpFlowIntegrationTest`.

---
feature_id: FEAT-AUTH-002
name: Login, refresh e logout
domain: auth
subdomain: session
status:
  discovery: MAPPED
  implementation: IMPLEMENTED
  test: TESTED
  verification: PARTIAL
  human_review: NOT REQUIRED
  deployment: NOT VERIFIED
  publication: NOT APPLICABLE
---

# FEAT-AUTH-002 — Login, refresh e logout

## Resumo
Autentica credenciais, emite access JWT curto e refresh opaco em cookie HttpOnly. Refresh
rotativo com detecção de reuso; logout revoga a família. MFA é feature separada.

## Frontend
| Item | Referência |
|---|---|
| Página | `frontend/app/entrar/page.tsx` |
| Contexto | `frontend/lib/auth.tsx` (`login`, `logout`, `restoreSession`) |
| Cliente | `frontend/lib/api.ts` (`loginRequest`, `refreshAccessToken`, `logoutRequest`) |
| Guard | `frontend/components/app-shell.tsx` (client-side) |

## API
| Método/path | Controller → Service | DTO | Auth |
|---|---|---|---|
| `POST /api/v1/auth/login` | `AuthController.login` → `AuthService.login` | `LoginRequest` → `AuthResponse` | público |
| `POST /api/v1/auth/refresh` | `refresh` → `AuthService.refresh` | cookie/header → `AuthResponse` | público + `X-Requested-With` |
| `POST /api/v1/auth/logout` | `logout` | — → 204 | público |
| `GET /api/v1/auth/me` | `me` → `AuthService.me` | — → `UserView` | autenticado; **não usado** (frontend usa `/users/me`) |

## Backend
- `AuthService.login`: lockout, BCrypt, verificação de e-mail, MFA condicional.
- `issueTokens`: `JwtService.createAccessToken` + refresh opaco com hash no banco.
- `AuthService.refresh`: lock pessimista, expiração, reuso → revoga família, rotação.
- `RefreshCookieService`: `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/api/v1/auth`.
- `JwtAuthenticationFilter`: recarrega `User` do banco e monta `ROLE_*`.

## Database
`users` (lockout/last login), `refresh_tokens` (hash, família, expiração, revogação),
`auth_event` (`LOGIN_OK`, `LOGIN_FAIL`, `REFRESH_ROTATED`, `REFRESH_REUSE_DETECTED`).

## Security
- Access 15 min; refresh 30 dias; challenge MFA 5 min.
- Papel do JWT não é autoridade; role vem do banco.
- Refresh cookie não é acessível por JS; access token fica em memória.
- Rate limit de login 30/5 min e refresh 120/5 min por IP (memória).
- Sem revogação de access token antes de expirar.

## Tests
| Teste | Cobertura |
|---|---|
| `MvpFlowIntegrationTest` | login, perfil, rotação, reuso 401, fail-closed 401 |
| `JwtServiceTest` | assinatura, propósito, expiração, segredo fraco |
| `FlywaySecurityIntegrationTest` | roles/RLS do banco |

## Dependencies
`FEAT-AUTH-001` (verificação) e `FEAT-AUTH-004` (MFA). Base para USER/PROGRESS/GAME/SIM-002.

## Evidence / limitations
- Verificado: fluxo via header `X-Refresh-Token` no teste integrado.
- Não verificado: cookie real em browser/HTTPS, CORS/proxy real, revogação de access,
  teste de carga, sessão após troca de senha na UI.

## Change impact
Alterar refresh/cookie afeta auth, perfil, shell e todos os endpoints autenticados.

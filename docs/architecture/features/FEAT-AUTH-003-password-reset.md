---
feature_id: FEAT-AUTH-003
name: Recuperação e redefinição de senha
domain: auth
subdomain: password-recovery
status:
  discovery: MAPPED
  implementation: IMPLEMENTED
  test: TESTED
  verification: PARTIAL
  human_review: NOT REQUIRED
  deployment: NOT VERIFIED
  publication: NOT APPLICABLE
---

# FEAT-AUTH-003 — Recuperação e redefinição de senha

## Resumo
Solicita token de reset por e-mail (1 h, uso único) e troca a senha, revogando todas as
sessões. A resposta é sempre genérica para não revelar existência de conta.

## Frontend
| Item | Referência |
|---|---|
| Solicitação | `frontend/app/recuperar-senha/page.tsx` |
| Redefinição | `frontend/app/redefinir-senha/page.tsx` (token via query) |
| Cliente | `frontend/lib/api.ts` |

## API
| Método/path | Controller → Service | DTO | Auth |
|---|---|---|---|
| `POST /api/v1/auth/forgot-password` | `AuthController.forgotPassword` | `ForgotPasswordRequest` → `MessageResponse` | público |
| `POST /api/v1/auth/reset-password` | `resetPassword` → `AuthService.resetPassword` | `ResetPasswordRequest` → `MessageResponse` | público |

## Backend
- `forgotPassword`: busca usuário; se existir, emite `PASSWORD_RESET` (1 h), envia e-mail,
  audita `PASSWORD_RESET_REQUESTED`; sempre mesma resposta.
- `resetPassword`: lock no token, valida usado/expirado, troca hash via `UserService`,
  revoga todos os refresh tokens, invalida tokens de reset restantes e audita.
- `EmailService.sendPasswordReset` monta link para `/redefinir-senha`.

## Database
`users` (hash), `email_tokens` (tipo `PASSWORD_RESET`, hash, expiração, uso),
`refresh_tokens` (revogação em massa), `auth_event`.

## Security
- Token de reset é hash SHA-256, uso único, 1 h.
- Reset revoga todas as sessões; access tokens existentes duram no máximo 15 min.
- Sem enumeração de e-mail; rate limit de 15/h (forgot) e 20/h (reset) por IP.
- Sem e-mail real configurado, o link não é enviado; em dev o log contém o link.

## Tests
| Teste | Cobertura |
|---|---|
| `MvpFlowIntegrationTest` | token de reset inserido, troca de senha, login com nova senha |
| `SecretsScanTest` | sem segredo versionado |
| `RegisterValidationTest` | regra de senha compartilhada |

## Dependencies
`FEAT-AUTH-002` (sessões) e `INT-04` (Resend). Afeta `users` e `refresh_tokens`.

## Evidence / limitations
- Verificado: reset com token e login posterior no teste integrado.
- Não verificado: envio real de e-mail, expiração após 1 h, token usado/expirado em teste
  dedicado, UI E2E, revogação observada na UI.

## Change impact
Alterar validade/token afeta reset, login, e-mail e `MvpFlowIntegrationTest`.

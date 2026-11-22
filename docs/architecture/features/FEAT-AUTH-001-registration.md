---
feature_id: FEAT-AUTH-001
name: Cadastro e verificação de e-mail
domain: auth
subdomain: registration
status:
  discovery: MAPPED
  implementation: IMPLEMENTED
  test: TESTED
  verification: PARTIAL
  human_review: NOT REQUIRED
  deployment: NOT VERIFIED
  publication: NOT APPLICABLE
---

# FEAT-AUTH-001 — Cadastro e verificação de e-mail

## Resumo
Cria a conta, envia token de verificação e bloqueia login até a confirmação. E-mail
duplicado retorna 409 genérico; token é de uso único e expira em 24 h.

## Frontend
| Item | Referência |
|---|---|
| Rota/página | `frontend/app/cadastro/page.tsx`, `frontend/app/verificar-email/page.tsx` |
| Reenvio | `frontend/app/entrar/page.tsx` e `frontend/app/app/perfil/page.tsx` |
| Cliente | `frontend/lib/api.ts` (`api.post`, `ApiError`) |
| Estados | formulário, loading, erro, sucesso; token via query `token` |

## API
| Método/path | Controller → Service | DTO | Auth |
|---|---|---|---|
| `POST /api/v1/auth/register` | `AuthController.register` → `AuthService.register` | `AuthDtos.RegisterRequest` → `RegisterResponse` | público |
| `POST /api/v1/auth/verify-email` | `verifyEmail` → `AuthService.verifyEmail` | `VerifyEmailRequest` → `MessageResponse` | público |
| `POST /api/v1/auth/resend-verification` | `resendVerification` | `ForgotPasswordRequest` → `MessageResponse` | público |

## Backend
- `UserService.create` normaliza e-mail e aplica BCrypt.
- `AuthService.register` grava `users`, cria `email_tokens` (SHA-256) e chama
  `EmailService.sendVerification`.
- `AuthService.verifyEmail` consome token, marca `users.verified=true` e audita.
- `resendVerification` invalida tokens antigos e emite novo.
- `AuthAuditService.record` grava `auth_event`.

## Database
| Tabela | Uso |
|---|---|
| `users` | conta, `password_hash`, `verified`, `locked_until` |
| `email_tokens` | hash, tipo `EMAIL_VERIFY`, expiração, `used_at` |
| `auth_event` | `REGISTER`, `EMAIL_VERIFIED` |

Migrations: `V1__init.sql`, `V3__auth_mfa_simulator.sql`.

## Security
- Público por `SecurityConfig`; rate limit de 20/hora por IP em `/auth/register`.
- Token de verificação nunca é persistido em claro; em dev pode ser exposto por
  `EXPOSE_DEV_TOKENS` (default false).
- E-mail real depende de Resend; sem chave, fallback de log (token cru só em dev).
- Não há RLS per-user; leitura/escrita é do papel da aplicação.

## Tests
| Teste | Cobertura |
|---|---|
| `MvpFlowIntegrationTest.shouldRunCompleteLearnerJourney` | cadastro, login bloqueado antes de verificar, verificação, login; duplicata 409 |
| `RegisterValidationTest` | nome/e-mail/senha válidos e inválidos |
| `SecretsScanTest` | `.env` ausente e padrões de segredo no backend |

## Dependencies
`FEAT-AUTH-002` depende desta verificação. Usa `EmailService` (INT-04) e `users`.

## Evidence / limitations
- Verificado: fluxo integrado com Testcontainers.
- Não verificado: envio real de e-mail, cliques no link, expiração real, rate limit
  distribuído, UI E2E.
- O endpoint de reenvio não tem teste dedicado.

## Change impact
Alterar contrato de token/verificação afeta login, perfil, e-mail e `MvpFlowIntegrationTest`.

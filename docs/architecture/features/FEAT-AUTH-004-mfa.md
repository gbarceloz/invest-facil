---
feature_id: FEAT-AUTH-004
name: MFA TOTP
domain: auth
subdomain: mfa
status:
  discovery: MAPPED
  implementation: IMPLEMENTED
  test: TESTED
  verification: PARTIAL
  human_review: NOT REQUIRED
  deployment: NOT VERIFIED
  publication: NOT APPLICABLE
---

# FEAT-AUTH-004 — MFA TOTP

## Resumo
Configura, ativa, usa e desativa segundo fator TOTP. O segredo é criptografado em repouso;
o login com MFA retorna challenge de 5 min; códigos são de uso único por counter.

## Frontend
| Item | Referência |
|---|---|
| Login desafiado | `frontend/app/entrar/page.tsx` |
| Configuração/gestão | `frontend/app/app/perfil/page.tsx` |
| Contexto | `frontend/lib/auth.tsx` (`verifyMfa`) |
| Cliente | `frontend/lib/api.ts` (`mfaVerifyRequest`) |

## API
| Método/path | Controller → Service | DTO | Auth |
|---|---|---|---|
| `POST /api/v1/auth/mfa/verify` | `AuthController.verifyMfa` → `AuthService.verifyMfa` | `MfaVerifyRequest` → `AuthResponse` | público (challenge) |
| `POST /api/v1/auth/mfa/setup` | `setupMfa` | `MfaSetupRequest` → `MfaSetupResponse` | autenticado |
| `POST /api/v1/auth/mfa/enable` | `enableMfa` | `MfaCodeRequest` → `MessageResponse` | autenticado |
| `POST /api/v1/auth/mfa/disable` | `disableMfa` | `MfaDisableRequest` → `MessageResponse` | autenticado |

## Backend
- `TotpService`: HMAC-SHA1, 6 dígitos, janela de 30 s, `matchedCounter`.
- `SecretCipher`: AES-GCM; chave `APP_MFA_KEY` ou derivada do JWT.
- `AuthService.setupMfa` exige senha atual, gera segredo e `otpauthUri`.
- `enableMfa` valida TOTP; `disableMfa` exige senha + código.
- `UserService.consumeMfaCounter` usa lock pessimista para impedir replay concorrente.
- Login com MFA retorna `mfaRequired=true` e challenge JWT de 5 min.

## Database
`users.mfa_enabled`, `users.mfa_secret`, `users.mfa_last_counter` (V3); `auth_event`
(`MFA_SETUP`, `MFA_ENABLED`, `MFA_DISABLED`, `LOGIN_MFA_CHALLENGE`, `LOGIN_FAIL`).

## Security
- Segredo TOTP criptografado; nunca retornado após setup.
- Replay de código é rejeitado por counter atômico.
- Setup exige reautenticação por senha.
- Sem recovery codes; perda do autenticador exige suporte manual.

## Tests
| Teste | Cobertura |
|---|---|
| `TotpServiceTest` | RFC 6238, janela adjacente, segredo Base32 |
| `JwtServiceTest` | MFA challenge não é aceito como access |
| `MvpFlowIntegrationTest` | **não habilita MFA** |
| manual (documentado em `PROGRESSO_GERAL`) | setup → enable → login → verify → replay → disable |

## Dependencies
`FEAT-AUTH-001/002`; `users`, `auth_event`; `SecretCipher`/`TotpService`.

## Evidence / limitations
- Verificado: unidade TOTP/JWT; teste manual de API registrado.
- Não verificado: teste automatizado integrado completo, UI E2E, recovery codes,
  troca de dispositivo, APP_MFA_KEY separada em produção.

## Change impact
Alterar TOTP/counter afeta login, perfil, `users` e auditoria; risco de bloquear contas.

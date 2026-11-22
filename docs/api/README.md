# API — Invest Fácil

Documentação viva da API REST (`/api/v1/**`). A especificação completa é gerada
do código (springdoc-openapi).

## Swagger

Com a aplicação em execução (porta local de exemplo: 8081):

- **Swagger UI**: <http://localhost:8081/swagger-ui.html>
- **OpenAPI JSON**: <http://localhost:8081/v3/api-docs>

Esquema de segurança global: `bearerAuth` (JWT no header `Authorization`).

## Autenticação

| Token | Formato | Onde fica | Expiração |
|---|---|---|---|
| Access | JWT HS256 | memória do frontend / header `Authorization: Bearer` | 15 min |
| Refresh | opaco, 32 bytes | cookie `if_refresh` HttpOnly/Secure/SameSite=Strict (ou header `X-Refresh-Token` em clientes de API) | 30 dias, rotativo |

- O refresh é de uso único: cada rotação invalida o anterior. Reutilização revoga
  a família inteira (evento `REFRESH_REUSE_DETECTED`).
- O frontend chama `/api` no próprio domínio; o rewrite do Next encaminha ao
  backend, mantendo o cookie first-party.
- Requisições de refresh por cookie exigem `X-Requested-With: XMLHttpRequest`.
- O papel (USER/ADMIN) é lido do banco a cada requisição autenticada.

## Rotas públicas

| Rota | Método | Descrição |
|---|---|---|
| `/actuator/health`, `/actuator/health/**` | GET | liveness/readiness |
| `/v3/api-docs/**`, `/swagger-ui/**` | GET | documentação |
| `/api/v1/auth/register`, `/login`, `/refresh`, `/logout` | POST | ciclo de sessão |
| `/api/v1/auth/verify-email`, `/resend-verification` | POST | verificação |
| `/api/v1/auth/forgot-password`, `/reset-password` | POST | recuperação |
| `/api/v1/auth/mfa/verify` | POST | segundo fator (desafio) |
| `/api/v1/content/**` | GET | catálogo, aulas, artigos, busca, vídeo |
| `/api/v1/market/assets` | GET | cotações informativas |
| `/error` | GET | envelope de erro do Spring |
| `/api/v1/simulator/calculate` | POST | cálculo educativo |

`/error` também é público (infraestrutura de erro). Todo o resto exige
autenticação (401 sem token). `/api/v1/admin/**` exige ADMIN (403 para USER).

## Rotas autenticadas

### Usuário
| Rota | Método | Descrição |
|---|---|---|
| `/api/v1/users/me` | GET/PATCH | perfil (nome/avatar) |
| `/api/v1/auth/me` | GET | resumo do usuário |
| `/api/v1/auth/change-password` | POST | altera senha e revoga sessões |
| `/api/v1/auth/sessions` | GET/DELETE | lista/revoga sessões |
| `/api/v1/auth/sessions/{id}` | DELETE | revoga uma sessão |
| `/api/v1/auth/mfa/setup` | POST | gera segredo TOTP (exige `{ "password": "..." }`) |
| `/api/v1/auth/mfa/enable` | POST | ativa MFA com código |
| `/api/v1/auth/mfa/disable` | POST | desativa com senha + código |

### Progresso e gamificação
| Rota | Método | Descrição |
|---|---|---|
| `/api/v1/progress/lessons/{lessonId}` | POST | conclui aula (idempotente; 201 na 1ª, 200 depois) |
| `/api/v1/progress/lessons/{lessonId}` | GET | status da aula + melhor quiz |
| `/api/v1/progress/lessons/{lessonId}/quiz` | GET/POST | consulta e submete quiz |
| `/api/v1/progress/summary` | GET | progresso, próxima aula, categorias |
| `/api/v1/gamification/summary` | GET | XP, nível, streak, conquistas |
| `/api/v1/gamification/achievements` | GET | conquistas |
| `/api/v1/gamification/xp` | GET | histórico de XP |

### Simulador
| Rota | Método | Descrição |
|---|---|---|
| `/api/v1/simulator/calculate` | POST | cálculo (público) |
| `/api/v1/simulator/scenarios` | GET/POST | lista/salva cenários do usuário |
| `/api/v1/simulator/scenarios/{id}` | DELETE | remove cenário do usuário |

### Admin
| Rota | Método | Descrição |
|---|---|---|
| `/api/v1/admin/videos/{lessonId}` | POST | upload multipart de vídeo |
| `/api/v1/admin/videos` | GET | lista metadados de vídeos |

## Exemplos

### Cadastro

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Marina Lima",
  "email": "marina@example.com",
  "password": "SenhaSegura123"
}
```

Resposta `201`:

```json
{
  "message": "Cadastro criado. Confira seu e-mail para confirmar a conta.",
  "devVerificationToken": null
}
```

Em `dev`, `EXPOSE_DEV_TOKENS=true` faz o token aparecer para teste local. Em
produção o campo é omitido.

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "marina@example.com", "password": "SenhaSegura123" }
```

Resposta `200` (sem MFA):

```json
{
  "accessToken": "eyJ...",
  "expiresIn": 900,
  "user": { "id": "...", "name": "Marina Lima", "email": "...", "role": "USER",
            "emailVerified": true, "mfaEnabled": false },
  "mfaRequired": false
}
```

Com MFA ativo: `mfaRequired=true` e `challengeToken`; o cliente chama
`POST /api/v1/auth/mfa/verify` com `{challengeToken, code}`.

Se o e-mail ainda não foi confirmado, o login responde `403` com
`code=EMAIL_NOT_VERIFIED`. Use `POST /api/v1/auth/resend-verification` para
reenviar o link.

### Refresh

```http
POST /api/v1/auth/refresh
X-Requested-With: XMLHttpRequest
Cookie: if_refresh=...
```

### Simulação

```http
POST /api/v1/simulator/calculate
Content-Type: application/json

{
  "initialAmount": 1000,
  "monthlyContribution": 200,
  "months": 120,
  "annualRate": 8,
  "inflationRate": 4
}
```

Resposta: `finalAmount`, `investedAmount`, `interestAmount`, `realFinalAmount`,
`monthlyRate`, `series[]` (mensal) e `disclaimer`.

## Envelope de erro

```json
{
  "timestamp": "2026-11-20T18:00:00Z",
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Dados inválidos na requisição.",
  "traceId": "…",
  "details": { "password": "A senha deve ter entre 8 e 72 caracteres…" }
}
```

Códigos: `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `UNAUTHORIZED`,
`FORBIDDEN`, `EMAIL_NOT_VERIFIED`, `ACCOUNT_LOCKED`, `RATE_LIMITED`,
`TOKEN_INVALID`, `TOKEN_USED`, `TOKEN_EXPIRED`, `INVALID_PASSWORD`,
`INVALID_TOTP`, `MFA_NOT_SETUP`, `MFA_NOT_ENABLED`, `INVALID_QUESTION`,
`DUPLICATE_ANSWER`, `INVALID_OPTION`, `INCOMPLETE_QUIZ`, `EMPTY_FILE`,
`INVALID_FORMAT`, `FILE_READ_ERROR`, `FILE_TOO_LARGE`, `SERVICE_UNAVAILABLE`,
`INTERNAL_ERROR`.

## Observações

- Cotações são informativas; a API não executa ordens nem custodia valores.
- O simulador é educativo e não representa garantia de retorno.
- Não há endpoint de exclusão de conta no MVP (evita operação irreversível sem
  fluxo de confirmação e retenção legal).

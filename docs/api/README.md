# API — Invest Fácil

Documentação viva da API REST (`/api/v1/**`).

## Swagger

Com a aplicação em execução:

- **Swagger UI**: <http://localhost:8080/swagger-ui.html>
- **OpenAPI JSON**: <http://localhost:8080/v3/api-docs>

A especificação é gerada do código (springdoc-openapi 2.8.9). Esquema de
segurança global declarado: `bearerAuth` (JWT).

## Estado da API (T1)

O skeleton ainda **não expõe endpoints de negócio** — a API está
intencionalmente fail-closed (403 em qualquer rota autenticada) enquanto a
autenticação (T2) não existe. Endpoints públicos atuais:

| Rota | Método | Descrição |
|---|---|---|
| `/actuator/health` | GET | liveness/readiness (probes) |
| `/v3/api-docs/**`, `/swagger-ui/**` | GET | documentação OpenAPI |

## Envelope de erro (todas as respostas de erro)

```json
{
  "timestamp": "2026-11-15T14:00:00Z",
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Dados inválidos na requisição.",
  "traceId": "…",
  "details": { "name": "must not be blank" }
}
```

Códigos estáveis: `VALIDATION_ERROR`, `NOT_FOUND`, `METHOD_NOT_ALLOWED`,
`INTERNAL_ERROR`. Mensagens nunca expõem stack trace, SQL ou caminhos internos.

## Contratos planejados (não implementados)

| Grupo | Rotas | Etapa |
|---|---|---|
| Auth | `POST /api/v1/auth/register`, `/login`, `/refresh`, `/logout`, `/verify-email`, `/forgot-password`, `/reset-password` | T2 |
| Usuários | `GET /api/v1/users/me`, `PATCH /api/v1/users/me` | T2/T3 |
| Conteúdo | `GET /api/v1/categories`, `/modules`, `/lessons/{slug}`, `/articles/{slug}` | T3 |
| Admin | `POST/PUT /api/v1/admin/**` (gestão de conteúdo) | T3 |
| Progresso | `POST /api/v1/progress/{lessonId}`, `POST /api/v1/quiz/{lessonId}/submit` | T4 |
| Gamificação | `GET /api/v1/gamification/me` (XP, nível, conquistas) | T4 |
| Market | `GET /api/v1/market/prices?symbols=BTCUSDT,ETHUSDT` | P1, prazo 04/12 |

Contrato do market (aprovado): Binance REST, somente BTC e ETH, cache TTL 30s,
connect timeout 2s, response timeout 5s, estado FRESH/STALE/UNAVAILABLE,
timestamp de atualização. Informativo — sem execução de ordens.

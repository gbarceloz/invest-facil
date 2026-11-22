# FEATURE MAPS — ÍNDICE

**Data:** 22/11/2026
**Escopo:** funcionalidades reais do produto, rastreadas de UI a banco/teste.
**Regra:** o código/teste é a fonte; este índice e os mapas são representações.

---

## 1. Features

| ID | Nome | Domínio | Rotas | Endpoints principais | Tabelas principais | Status |
|---|---|---|---|---|---|---|
| FEAT-AUTH-001 | Cadastro e verificação de e-mail | auth | `/cadastro`, `/verificar-email` | `POST /auth/register`, `/verify-email`, `/resend-verification` | `users`, `email_tokens`, `auth_event` | `PARTIAL` |
| FEAT-AUTH-002 | Login, refresh e logout | auth | `/entrar` | `POST /auth/login`, `/refresh`, `/logout` | `users`, `refresh_tokens`, `auth_event` | `PARTIAL` |
| FEAT-AUTH-003 | Recuperação e redefinição de senha | auth | `/recuperar-senha`, `/redefinir-senha` | `POST /auth/forgot-password`, `/reset-password` | `users`, `email_tokens`, `refresh_tokens` | `PARTIAL` |
| FEAT-AUTH-004 | MFA TOTP | auth | `/entrar`, `/app/perfil` | `POST /auth/mfa/verify`, `/setup`, `/enable`, `/disable` | `users`, `auth_event` | `PARTIAL` |
| FEAT-AUTH-005 | Sessões e troca de senha | auth | `/app/perfil` | `GET/DELETE /auth/sessions`, `POST /auth/change-password` | `refresh_tokens`, `users` | `PARTIAL` |
| FEAT-USER-001 | Perfil do usuário | user | `/app/perfil` | `GET/PATCH /users/me` | `users` | `PARTIAL` |
| FEAT-LEARN-001 | Catálogo e trilhas | learn | `/app/aprender`, `/app/mercado-financeiro`, `/app/bitcoin` | `GET /content/categories`, `/modules/{slug}` | `categories`, `modules`, `lessons` | `PARTIAL` |
| FEAT-LEARN-002 | Aula e vídeo | learn | `/app/aprender/aula/[slug]` | `GET /content/lessons/{slug}`, `/video` | `lessons`, `video_assets` | `PARTIAL` |
| FEAT-LEARN-003 | Biblioteca, artigos e busca | learn | `/app/biblioteca`, `/app/biblioteca/[slug]`, `/app/aprender?q=` | `GET /content/articles`, `/articles/{slug}`, `/search` | `articles`, `categories` | `NOT VERIFIED` |
| FEAT-PROGRESS-001 | Conclusão de aula | progress | `/app/aprender/aula/[slug]` | `POST/GET /progress/lessons/{id}` | `user_progress`, `xp_ledger` | `VERIFIED` (core) |
| FEAT-PROGRESS-002 | Quiz | progress | `/app/aprender/quiz/[slug]` | `GET/POST /progress/lessons/{id}/quiz` | `quiz_questions`, `quiz_attempts`, `quiz_attempt_answers` | `PARTIAL` |
| FEAT-GAME-001 | XP, níveis, conquistas e streak | gamification | `/app`, `/app/progresso` | `GET /gamification/summary`, `/achievements`, `/xp` | `xp_ledger`, `achievements`, `user_achievements` | `PARTIAL` |
| FEAT-SIM-001 | Cálculo de simulação | simulator | `/app/simulador` | `POST /simulator/calculate` | — | `VERIFIED` (math) |
| FEAT-SIM-002 | Cenários salvos | simulator | `/app/simulador` | `GET/POST /simulator/scenarios`, `DELETE /{id}` | `simulations` | `PARTIAL` |
| FEAT-MARKET-001 | Cotações Binance/FX | market | **sem UI ativa** | `GET /market/assets` | — | `NOT VERIFIED` |
| FEAT-MARKET-002 | Bitcoin (CoinGecko) | market | `/app/bitcoin`, `/app` | `GET /bitcoin/market` | — | `PARTIAL` |
| FEAT-ADMIN-001 | Upload/admin de vídeo | admin | **sem UI** | `POST/GET /admin/videos` | `video_assets` | `NOT VERIFIED` |
| FEAT-DASH-001 | Dashboard e composição | dashboard | `/app` | `GET /bitcoin/market` + AppData | — | `NOT VERIFIED` (frontend) |

---

## 2. Template de mapa

Cada arquivo `FEAT-*.md` usa:

```yaml
---
feature_id: FEAT-...
name: ...
domain: ...
status:
  discovery: MAPPED
  implementation: IMPLEMENTED
  test: TESTED
  verification: PARTIAL
  human_review: NOT REQUIRED
  deployment: NOT VERIFIED
  publication: NOT APPLICABLE
---
```

Seções: resumo, frontend, API, backend, database, security, tests, dependencies,
evidence/limitations, change impact.

---

## 3. Convenções

- `MAPPED` ≠ `IMPLEMENTED`; `IMPLEMENTED` ≠ `TESTED`; `TESTED` ≠ `VERIFIED`.
- Caminhos são reais; símbolos entre backticks.
- Endpoint sem consumidor frontend é marcado explicitamente.
- Tabela sem uso no código é marcada como órfã.
- RLS não é tratada como isolamento per-user.
- Relações sem evidência de código não entram.

---

## 4. Cobertura

- Backend: 42 endpoints mapeados em `../api-map.md`.
- Frontend: 19 rotas de aplicação + `_not-found` em `../frontend-map.md`.
- Banco: 18 tabelas em `../database-map.md`.
- Integrações: 9 em `../integration-map.md`.
- Dependências: `../dependency-map.md`.
- Caminhos críticos: 7 em `../critical-paths.md`.

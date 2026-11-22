# CRITICAL PATHS — INVEST FÁCIL

**Objetivo:** rastrear os caminhos de negócio que não podem quebrar sem afetar a jornada
principal. Cada passo aponta para arquivo/endpoint/tabela; testes e lacunas são explícitos.

---

## CP-01 — Cadastro → verificação → login → dashboard

| Etapa | Frontend | API/backend | Dados | Evidência |
|---:|---|---|---|---|
| 1 | `frontend/app/cadastro/page.tsx` | `POST /api/v1/auth/register` → `AuthController.register` → `AuthService.register` | `users`, `email_tokens`, `auth_event` | `MvpFlowIntegrationTest` |
| 2 | `frontend/app/verificar-email/page.tsx` | `POST /api/v1/auth/verify-email` → `AuthService.verifyEmail` | `email_tokens`, `users.verified` | `MvpFlowIntegrationTest` |
| 3 | `frontend/app/entrar/page.tsx` | `POST /api/v1/auth/login` → `AuthService.login` | `users`, `refresh_tokens`, `auth_event` | `MvpFlowIntegrationTest` |
| 4 | `frontend/lib/auth.tsx`/`app-shell.tsx` | `refresh`/`users/me`/`progress+gamification` | `users`, `refresh_tokens`, `user_progress`, `xp_ledger` | parcial |

**Teste:** `MvpFlowIntegrationTest` cobre 1–3, perfil, progresso e XP.
**Lacuna:** cookie real no browser/HTTPS, redirect `next`, e-mail real.

---

## CP-02 — Login com MFA

| Etapa | Frontend | API/backend | Dados | Evidência |
|---:|---|---|---|---|
| 1 | `entrar/page.tsx` → `useAuth.login` | `POST /auth/login` → challenge JWT 5 min | `users.mfa_enabled`, `mfa_secret` | código; `TotpServiceTest` |
| 2 | `entrar/page.tsx` (form de código) | `POST /auth/mfa/verify` → `AuthService.verifyMfa` | `users.mfa_last_counter` | manual API documentado; sem teste integrado |
| 3 | `lib/auth.tsx` | tokens emitidos; refresh cookie | `refresh_tokens`, `auth_event` | código |

**Lacuna:** não há teste automatizado setup→enable→login→verify→replay; `MvpFlow` não
habilita MFA. UI depende de app autenticador externo.

---

## CP-03 — Aula → conclusão → quiz → XP

| Etapa | Frontend | API/backend | Dados | Evidência |
|---:|---|---|---|---|
| 1 | `aprender/aula/[slug]/page.tsx` | `GET /content/lessons/{slug}` → `ContentService.lesson` | `lessons`, `modules`, `categories` | `MvpFlow` |
| 2 | mesma página | `GET /content/lessons/{slug}/video` → `VideoService.playbackBySlug` | `video_assets` | sem teste; fallback demo |
| 3 | mesma página | `POST /progress/lessons/{id}` → `ProgressService.completeLesson` | `user_progress`, `xp_ledger`, `user_achievements` | `MvpFlow` (201/200) |
| 4 | `aprender/quiz/[slug]/page.tsx` | `GET /progress/lessons/{id}/quiz` | `quiz_questions` | `MvpFlow` |
| 5 | mesma página | `POST /progress/lessons/{id}/quiz` → `submitQuiz` | `quiz_attempts`, `quiz_attempt_answers`, `xp_ledger` | `MvpFlow` (100%) |
| 6 | `lib/app-data.tsx` | `GET /progress/summary`, `GET /gamification/summary` | `user_progress`, `xp_ledger` | `MvpFlow` |

**Regras:** quiz só liberado após conclusão (frontend e backend); 70% para passar; 50 XP
aula + 30 XP quiz; idempotência por unique index.
**Lacunas:** vídeo real não testado; casos de quiz incompleto/duplicado/70% não testados;
sem E2E.

---

## CP-04 — Simulador → cenário salvo → achievement

| Etapa | Frontend | API/backend | Dados | Evidência |
|---:|---|---|---|---|
| 1 | `simulador/page.tsx` | `POST /simulator/calculate` → `SimulatorService.calculate` | nenhum (cálculo puro) | `SimulatorServiceTest` 3/3 |
| 2 | mesma página | `POST /simulator/scenarios` → `save` | `simulations`, `xp_ledger`, `user_achievements` | `MvpFlow` (201) |
| 3 | mesma página | `GET /simulator/scenarios` | `simulations` | sem teste |
| 4 | mesma página | `DELETE /simulator/scenarios/{id}` | `simulations` | sem teste; ownership no service |
| 5 | `lib/app-data.tsx` | `GET /gamification/summary` | `xp_ledger` | `MvpFlow` |

**Regras:** 1–600 meses; taxas 0–100%; inflação; `FIRST_SIMULATION` concede 30 XP.
**Lacunas:** sem teste de list/delete/ownership, validação de limites na UI, E2E.

---

## CP-05 — Mercado público → dashboard/Bitcoin

| Etapa | Frontend | API/backend | Dados | Evidência |
|---:|---|---|---|---|
| 1 | `app/app/page.tsx` | `GET /bitcoin/market` → `BitcoinMarketService.market` | cache em memória (sem tabela) | sem teste |
| 2 | `app/app/bitcoin/page.tsx` | `GET /bitcoin/market` + `GET /content/categories` | cache + conteúdo | sem teste |
| 3 | fallback | `STALE`/`UNAVAILABLE` | último sucesso em memória | código |

**Regras:** nunca inventar cotação; cache 120 s; gráficos 24h/7d; disclaimer.
**Lacunas:** sem teste live/contrato CoinGecko; sem teste de fallback; `/api/v1/market/assets`
(Binance) não é usado pela UI atual.

---

## CP-06 — Perfil, MFA, sessões e senha

| Etapa | Frontend | API/backend | Dados | Evidência |
|---:|---|---|---|---|
| 1 | `perfil/page.tsx` | `GET/PATCH /users/me` | `users` | `MvpFlow` (GET) |
| 2 | mesma página | `POST /auth/mfa/setup/enable/disable` | `users.mfa_*` | `TotpServiceTest`; manual |
| 3 | mesma página | `GET/DELETE /auth/sessions` | `refresh_tokens` | sem teste |
| 4 | mesma página | `POST /auth/change-password` | `users`, `refresh_tokens` | sem teste |
| 5 | `entrar`/`recuperar` | reset/forgot | `email_tokens`, `users`, `refresh_tokens` | `MvpFlow` (reset) |

**Lacunas:** sem teste de sessões/change-password/PATCH; sem E2E de MFA; cookie real.

---

## CP-07 — Admin vídeo (API-only)

| Etapa | Frontend | API/backend | Dados | Evidência |
|---:|---|---|---|---|
| 1 | **não há UI** | `POST /api/v1/admin/videos/{lessonId}` (ADMIN) → `VideoService.upload` | `video_assets`, Supabase Storage | sem teste |
| 2 | **não há UI** | `GET /api/v1/admin/videos` (ADMIN) | `video_assets` | sem teste |
| 3 | `aula` | `GET /content/lessons/{slug}/video` | `video_assets` | sem teste |

**Status:** `IMPLEMENTED`, `NOT VERIFIED`; não há página administrativa nem teste de upload
real. A proteção é path-based `ADMIN`.

---

## Resumo de criticidade

| Caminho | Criticidade | Evidência | Lacuna principal |
|---|---|---|---|
| CP-01 cadastro/login | crítica | integração | cookie/email reais |
| CP-02 MFA | alta | unit/manual | teste integrado |
| CP-03 aprendizagem | crítica | integração | vídeo/E2E |
| CP-04 simulador | média | unit + integração parcial | list/delete |
| CP-05 mercado | baixa/média | código | teste live/fallback |
| CP-06 perfil/segurança | alta | parcial | sessões/password tests |
| CP-07 admin vídeo | média | código | UI/teste/credenciais |

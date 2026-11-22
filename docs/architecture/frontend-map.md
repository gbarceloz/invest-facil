# FRONTEND MAP — INVEST FÁCIL

**Stack:** Next.js 16.4.6 (App Router) · React 19.1 · TypeScript 5.7 · Tailwind 3.4.
**Evidência:** `frontend/package.json`, `frontend/app/**`, `frontend/components/**`, `frontend/lib/**`.
**Build atual:** 20 entradas de rota (19 de aplicação + `_not-found`).

---

## 1. Providers e fluxo de dados

```text
frontend/app/layout.tsx
  └─ Providers (frontend/app/providers.tsx)
       └─ AuthProvider (frontend/lib/auth.tsx)
            └─ AppShell (frontend/components/app-shell.tsx)
                 └─ AppDataProvider (frontend/lib/app-data.tsx)
                      └─ páginas /app/**

Browser
  ↓
Page/Component
  ↓
useAuth / useAppData / estado local
  ↓
apiFetch (frontend/lib/api.ts)
  ↓
/api/v1/** (rewrite Next → backend)
```

- `apiFetch` adiciona `Accept`, `X-Requested-With` e `Authorization: Bearer` quando há
  access token em memória; em 401 tenta refresh uma vez e dispara `auth:expired` se falhar.
- Refresh token fica em cookie HttpOnly; access token **não** é persistido em localStorage.
- `AuthProvider` restaura a sessão no mount chamando `POST /api/v1/auth/refresh`.
- `AppDataProvider` carrega `GET /api/v1/gamification/summary` e
  `GET /api/v1/progress/summary` quando há usuário.
- `AppShell` é o guard **client-side**: se `!user`, redireciona para `/entrar?next=...`.
  Não há middleware Next nem guard server-side; o backend é a autoridade.

---

## 2. Rotas

| Rota | Arquivo | Feature(s) | APIs chamadas |
|---|---|---|---|
| `/` | `frontend/app/page.tsx` | landing (sem feature de negócio) | — |
| `/cadastro` | `frontend/app/cadastro/page.tsx` | FEAT-AUTH-001 | `POST /api/v1/auth/register` |
| `/entrar` | `frontend/app/entrar/page.tsx` | FEAT-AUTH-002, FEAT-AUTH-004 | `POST /api/v1/auth/login`, `POST /api/v1/auth/mfa/verify`, `POST /api/v1/auth/resend-verification` |
| `/verificar-email` | `frontend/app/verificar-email/page.tsx` | FEAT-AUTH-001 | `POST /api/v1/auth/verify-email` |
| `/recuperar-senha` | `frontend/app/recuperar-senha/page.tsx` | FEAT-AUTH-003 | `POST /api/v1/auth/forgot-password` |
| `/redefinir-senha` | `frontend/app/redefinir-senha/page.tsx` | FEAT-AUTH-003 | `POST /api/v1/auth/reset-password` |
| `/app` | `frontend/app/app/page.tsx` | FEAT-DASH-001, FEAT-MARKET-002 | `GET /api/v1/bitcoin/market` + `AppDataProvider` |
| `/app/aprender` | `frontend/app/app/aprender/page.tsx` | FEAT-LEARN-001, FEAT-LEARN-003 | `GET /api/v1/content/categories`, `GET /api/v1/content/search` |
| `/app/aprender/modulo/[slug]` | `frontend/app/app/aprender/modulo/[slug]/page.tsx` | FEAT-LEARN-001 | `GET /api/v1/content/modules/{slug}` |
| `/app/aprender/aula/[slug]` | `frontend/app/app/aprender/aula/[slug]/page.tsx` | FEAT-LEARN-002, FEAT-PROGRESS-001 | `GET /api/v1/content/lessons/{slug}`, `GET .../video`, `GET /api/v1/progress/lessons/{id}`, `POST /api/v1/progress/lessons/{id}` |
| `/app/aprender/quiz/[slug]` | `frontend/app/app/aprender/quiz/[slug]/page.tsx` | FEAT-PROGRESS-002 | `GET /api/v1/content/lessons/{slug}`, `GET /api/v1/progress/lessons/{id}`, `GET .../quiz`, `POST .../quiz` |
| `/app/biblioteca` | `frontend/app/app/biblioteca/page.tsx` | FEAT-LEARN-003 | `GET /api/v1/content/articles` |
| `/app/biblioteca/[slug]` | `frontend/app/app/biblioteca/[slug]/page.tsx` | FEAT-LEARN-003 | `GET /api/v1/content/articles/{slug}` |
| `/app/bitcoin` | `frontend/app/app/bitcoin/page.tsx` | FEAT-MARKET-002, FEAT-LEARN-001 | `GET /api/v1/bitcoin/market`, `GET /api/v1/content/categories` |
| `/app/mercado` | `frontend/app/app/mercado/page.tsx` | legado | `redirect('/app/bitcoin')` |
| `/app/mercado-financeiro` | `frontend/app/app/mercado-financeiro/page.tsx` | FEAT-LEARN-001 | `GET /api/v1/content/categories` + `AppDataProvider` |
| `/app/perfil` | `frontend/app/app/perfil/page.tsx` | FEAT-USER-001, FEAT-AUTH-004, FEAT-AUTH-005 | `GET/PATCH /api/v1/users/me`, MFA, sessões, `change-password` |
| `/app/progresso` | `frontend/app/app/progresso/page.tsx` | FEAT-GAME-001 | `GET /api/v1/gamification/xp` + `AppDataProvider` |
| `/app/simulador` | `frontend/app/app/simulador/page.tsx` | FEAT-SIM-001, FEAT-SIM-002 | `POST /api/v1/simulator/calculate`, `GET/POST /scenarios`, `DELETE /scenarios/{id}` |
| `_not-found` | gerado pelo Next | — | — |

---

## 3. Componentes compartilhados

| Componente/arquivo | Responsabilidade | Consumidores | Risco de alteração |
|---|---|---|---|
| `frontend/components/app-shell.tsx` | shell, nav desktop/mobile, guard client-side, XP/streak, busca global, logout | todas as rotas `/app/**` | alto |
| `frontend/components/progress.tsx` | `ProgressBar`, `LevelRing` acessíveis | dashboard, aprender, progresso, shell | médio |
| `frontend/components/learning-track-list.tsx` | `LearningTrackList`, `LevelCards` | aprender, bitcoin, mercado-financeiro | médio |
| `frontend/components/page.tsx` | `PageHeader`, `Stat`, `Badge` | várias páginas | baixo |
| `frontend/components/ui.tsx` | `Alert`, `EmptyState`, `Spinner`, `Skeleton`, `Disclaimer` | quase todas as páginas | médio |
| `frontend/components/markdown.tsx` | render de artigo Markdown | biblioteca/[slug] | baixo |
| `frontend/components/auth-layout.tsx` | layout das páginas de auth | cadastro, entrar, recuperar, redefinir, verificar | médio |
| `frontend/components/logo.tsx` | marca | landing, shell, auth | baixo |
| `frontend/lib/api.ts` | cliente HTTP, refresh, erros | páginas e providers | alto |
| `frontend/lib/auth.tsx` | sessão, login, MFA, logout | shell e auth pages | alto |
| `frontend/lib/app-data.tsx` | progresso + gamificação globais | shell, dashboard, aprender, progresso, perfil | alto |

---

## 4. Estados e erros

- Loading: `Spinner`, `Skeleton`, placeholders de vídeo.
- Vazio: `EmptyState`; “vídeo em preparação”; mercado `UNAVAILABLE`.
- Erro: `Alert` + mensagem de `ApiError`; páginas mantêm fallback local.
- Formulários: validação HTML + validação de senha no cliente; backend revalida com Jakarta
  Validation.
- Busca: `q` na URL, mínimo 2 caracteres; `GET /api/v1/content/search`.
- Quiz: progresso via evento `quiz:progress` consumido pelo `FocusedLessonShell`; conclusão
  da aula é pré-requisito visual e também validada no backend.

---

## 5. Testes frontend

| Teste | Cobertura | Lacuna |
|---|---|---|
| `frontend/__tests__/format.test.ts` | `money`, `percent`, `signedPercent`, `dayCount`, `initials` | não cobre páginas |
| `frontend/__tests__/progress-bar.test.tsx` | acessibilidade e clamp 0–100 | não cobre fluxo |
| build/typecheck | 20 entradas; TS strict | não prova comportamento em browser |

**Não há** testes de componente de página, integração com API real, E2E, acessibilidade
automatizada ou regressão visual.

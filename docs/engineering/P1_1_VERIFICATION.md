# P1.1 — FEATURE MAPS & SYSTEM TRACEABILITY — VERIFICATION

> **Atualização S2.8 (22/11/2026):** relatório histórico. Estado atual: V1-V7, 63 testes, RLS per-user; a V7 é local e ainda não foi aplicada no Lab. Ver docs/verification/S2.8/S2.8_DATABASE_FUNCTION_HARDENING_REPORT.md.

**Data:** 22/11/2026
**Status:** **PASS WITH LIMITATIONS**
**Escopo:** descoberta da arquitetura real, inventário de features, mapas frontend/backend/
banco/auth/API/integrações, dependências, caminhos críticos e validação.
**Não executado:** commit, push, merge, PR, deploy, publicação, migrations, alteração de
código/agentes/skills/configuração global.

---

## 1. Baseline

| Item | Valor |
|---|---|
| Raiz | `<repo>` |
| Branch | `feat/mvp-completo` |
| HEAD | `100d3fe` |
| Staged | **0** |
| Working tree inicial | 68 entradas (39 modificadas, 29 não rastreadas) |
| Stack declarada | Next.js + Spring Boot + PostgreSQL |
| Documentos canônicos | `SOURCE_OF_TRUTH.md`, `CONTEXT_INDEX.md`, `SOURCE_REGISTRY.md`, `P0_4_VERIFICATION.md` |
| Hashes iniciais | `SOURCE_OF_TRUTH` `C8860E18…A7EB85`; `CONTEXT_INDEX` `CF8D39DC…82CF87D`; `SOURCE_REGISTRY` `B2907EB9…B495EA`; `check_docs.py` `C99790E0…90A9A31` |

---

## 2. Stack real

| Camada | Tecnologia | Evidência |
|---|---|---|
| Frontend | **Next.js 16.4.6**, React 19.1, TypeScript 5.7, Tailwind 3.4 | `frontend/package.json`, `next.config.ts`, `tsconfig.json` |
| Backend | Java 21, Spring Boot 3.5.6, Spring MVC/Security/Data JPA/Validation | `backend/pom.xml`, `InvestFacilApplication` |
| Banco | PostgreSQL 17, schema `investfacil`, Flyway V1–V5 | migrations, `application.yml`, Testcontainers |
| Auth | JWT HS256, refresh opaco, TOTP, BCrypt, AES-GCM | `auth/**`, `common/security/**` |
| API | REST `/api/v1`, 42 mappings, springdoc | controllers, `OpenApiConfig` |
| Testes | JUnit 5 + MockMvc + Testcontainers; Vitest | `backend/src/test/**`, `frontend/__tests__/**` |
| Infra | Dockerfile, Render/Vercel runbooks, CI | `backend/Dockerfile`, `render.yaml`, `docs/DEPLOY.md` |

### 2.1 Angular × Next.js

**Resolvido:** não há Angular no repositório. `frontend/package.json` declara Next/React;
`npm run build` gera rotas do App Router; não existe `angular.json` ou `@angular/*`.
A menção a Angular é um erro histórico sem evidência atual.

---

## 3. Inventário de features

**18 features** em 9 domínios:

| Domínio | IDs |
|---|---|
| auth | `FEAT-AUTH-001` cadastro/verificação; `FEAT-AUTH-002` login/refresh/logout; `FEAT-AUTH-003` reset; `FEAT-AUTH-004` MFA; `FEAT-AUTH-005` sessões/senha |
| user | `FEAT-USER-001` perfil |
| learn | `FEAT-LEARN-001` catálogo; `FEAT-LEARN-002` aula/vídeo; `FEAT-LEARN-003` biblioteca/busca |
| progress | `FEAT-PROGRESS-001` conclusão; `FEAT-PROGRESS-002` quiz |
| gamification | `FEAT-GAME-001` XP/níveis/conquistas/streak |
| simulator | `FEAT-SIM-001` cálculo; `FEAT-SIM-002` cenários |
| market | `FEAT-MARKET-001` Binance/FX (sem UI); `FEAT-MARKET-002` Bitcoin |
| admin | `FEAT-ADMIN-001` vídeo (sem UI) |
| dashboard | `FEAT-DASH-001` composição |

Índice: `docs/architecture/features/README.md`.

---

## 4. Frontend

- **19 rotas de aplicação + `_not-found`** (20 entradas de build).
- Providers: `frontend/app/providers.tsx` → `AuthProvider`; `AppShell` → `AppDataProvider`.
- Guard: `AppShell` client-side; sem middleware Next. Backend é a autoridade.
- HTTP: `frontend/lib/api.ts` (`apiFetch`, refresh em 401, `auth:expired`).
- Estado: React Context (`auth`, `app-data`), estado local; sem Redux/Zustand.
- Componentes compartilhados: `AppShell`, `ProgressBar`/`LevelRing`,
  `LearningTrackList`/`LevelCards`, `PageHeader`/`Stat`/`Badge`, `Markdown`,
  `Alert`/`EmptyState`/`Spinner`/`Skeleton`/`Disclaimer`, `AuthLayout`, `Logo`.
- Rotas/consumidores por feature em `frontend-map.md`.

**Testes:** 2 arquivos, 6 testes (formatadores/ProgressBar); build/typecheck. Sem E2E,
teste de páginas, API real ou acessibilidade automatizada.

---

## 5. Backend

- **42 endpoints** em 9 controllers.
- Fluxo: `RateLimitFilter` → `SecurityFilterChain` → `JwtAuthenticationFilter` →
  controller → service → repository → PostgreSQL.
- 9 controllers: Auth (17), User (2), Content (6), Video (3), Progress (5),
  Gamification (3), Simulator (4), Market (1), Bitcoin (1).
- Services/repos/entities em `backend-map.md`.
- Transações em services; DTOs records; Jakarta Validation; `GlobalExceptionHandler`.
- Regras principais: idempotência de aula/XP, quiz ≥70%, refresh rotativo/reuso,
  lockout, TOTP replay, simulação 1–600 meses.
- **28 testes** em 9 classes; lacunas em MFA integrado, sessões, perfil PATCH, artigos,
  market/bitcoin/video, níveis/streak, ownership cruzado.

---

## 6. Database

- **18 tabelas** (17 V1 + `simulations` V3; V4 adiciona inflação).
- Migrations V1–V5; schema validado em Testcontainers; banco remoto NOT VERIFIED.
- Relações principais: modules→categories, lessons→modules, video_assets→lessons,
  articles→categories, progress/quiz/XP→users/lessons, simulations→users.
- RLS: habilitada em todas; policy `app_rw USING (true)` para `investfacil_app`.
  Guest sem policy vê 0 linhas; app não faz DDL; ledgers append-only.
- **Achado:** RLS não isola por usuário; isolamento é aplicacional (`user_id`).
- **Achado:** `lesson_articles` existe, mas não tem entidade/repository/consulta; órfã.
- Dados sensíveis: password_hash, mfa_secret, token_hash, IP/user-agent, progresso,
  simulações. Nenhum valor real copiado.

---

## 7. Authentication

- Fluxos: cadastro/verificação, login, refresh/reuso, logout, MFA, reset, sessões.
- Roles reais: `USER`, `ADMIN`; sem permissões granulares.
- Path-based: público (auth pública, conteúdo, market, bitcoin, calculate, health/swagger);
  autenticado (`/api/v1/**`); ADMIN (`/api/v1/admin/**`).
- Ownership: perfil, progresso, quiz, gamificação, sessões e cenários filtram principal;
  cenário delete valida dono.
- Frontend guard é client-side; não é segurança.
- Sem revogação de access JWT antes de 15 min; rate limit em memória; cookie real em
  HTTPS não testado; MFA sem recovery codes.
- Detalhes: `authentication-map.md`.

---

## 8. Dependências

`dependency-map.md` documenta:
- Auth → perfil/progresso/quiz/gamificação/simulação/dashboard/admin.
- Progresso ↔ gamificação (conceitual; sem ciclo de beans).
- Conteúdo → aula/vídeo/progresso.
- Simulador → gamificação (achievement).
- Dashboard → progresso + gamificação + Bitcoin.
- Compartilhados: `AppShell`, `api.ts`, `app-data`, `ContentCatalog`, `GamificationService`,
  `UserService`, tabelas `users`/`lessons`/`xp_ledger`.

---

## 9. Critical Paths

7 caminhos em `critical-paths.md`:
1. cadastro → verificação → login → dashboard;
2. login com MFA;
3. aula → conclusão → quiz → XP;
4. simulador → cenário salvo → achievement;
5. mercado/Bitcoin → UI/fallback;
6. perfil/MFA/sessões/senha;
7. admin vídeo (API-only).

Cada um lista passos, arquivos, endpoints, tabelas, testes e lacunas.

---

## 10. Feature Maps

Criados:
- `docs/architecture/README.md`
- `system-overview.md`, `frontend-map.md`, `backend-map.md`, `database-map.md`,
  `authentication-map.md`, `api-map.md`, `integration-map.md`, `dependency-map.md`,
  `critical-paths.md`
- `docs/architecture/features/README.md`
- 18 arquivos `FEAT-*.md`

Status dos mapas: **2 VERIFIED** (`PROGRESS-001`, `SIM-001`), **13 PARTIAL**, **3 NOT VERIFIED** (`LEARN-003`, `MARKET-001`, `ADMIN-001`). Nenhum mapa declara `DEPLOYED`/`PUBLISHED`.

---

## 11. Validador

`scripts/docs/check_docs.py` foi estendido (sem nova dependência):
- canônicos + 18 feature maps;
- frontmatter (`feature_id`, `name`, `domain`, 7 status);
- IDs únicos e status permitidos;
- seções obrigatórias;
- paths referenciados existem;
- classes de teste referenciadas existem;
- endpoints citados existem nos controllers;
- links relativos;
- D01–D20.

Resultado: **PASS** — 19 canônicos, 18 feature maps, **42 endpoints**, **50 referências de
endpoint**, 23 links. O validador não prova comportamento, deploy, aprovação ou
ownership; é validação estrutural/evidência de referência. Símbolos/métodos internos não
são verificados (apenas existência de paths, endpoints e classes de teste).

---

## 12. Testes de descoberta (8)

| ID | Pergunta | Mapas/fonte | Resposta | Ambiguidade | Status |
|---|---|---|---|---|---|
| Q01 | Componentes do progresso | `FEAT-PROGRESS-001/002`, `frontend-map`, `backend-map` | `AppDataProvider`, `ProgressBar`, `ProgressService`, `UserProgress`, `QuizAttempt` | UI vs backend | PASS |
| Q02 | Endpoint que atualiza aprendizagem | `FEAT-PROGRESS-001` | `POST /api/v1/progress/lessons/{lessonId}`; quiz em `/quiz` | nenhum | PASS |
| Q03 | Tabelas afetadas por simulação salva | `FEAT-SIM-002`, `database-map` | `simulations`, `xp_ledger`, `user_achievements` | achievement 30 XP | PASS |
| Q04 | Regras de auth de rota protegida | `authentication-map`, `FEAT-PROGRESS-001` | `/api/v1/**` autenticado; frontend client-side; conteúdo público | página carrega dados públicos antes do guard | PARTIAL |
| Q05 | Testes que cobrem feature | mapas `## Tests` | `MvpFlow`, `SimulatorServiceTest`, unit auth; lacunas explícitas | cobertura indireta | PASS |
| Q06 | Features que dependem de serviço compartilhado | `dependency-map` | `GamificationService` usado por progresso/quiz/simulador/dashboard | dependência conceitual | PASS |
| Q07 | Impacto de mudar tabela | `database-map`, `dependency-map` | ex. `lessons` afeta conteúdo/aula/quiz/progresso/vídeo/admin | sem schema diff | PASS |
| Q08 | Integração implementada ou configurada | `integration-map` | Supabase/Resend/Binance/CoinGecko implementados; sem teste live | credenciais ausentes | PASS |

---

## 13. Verificação local

| Comando | Resultado |
|---|---|
| `mvn -B test -Pdocker-desktop-newapi` (JDK 21, `DOCKER_HOST=tcp://127.0.0.1:2375`) | **exit 0**, 28/28, 0 falhas/erros/skips |
| `python scripts/ci/assert-surefire.py` (raiz) | **PASS**: backend 28, database 5, secrets 2 |
| `npm test` | **exit 0**, 2 arquivos, 6 testes |
| `npm run typecheck` | **exit 0** |
| `npm run build` | **exit 0**, 20 entradas de rota |
| `python scripts/docs/check_docs.py` | **PASS**, 19 canônicos, 18 mapas, 42 endpoints, 50 refs, 23 links |
| link scan amplo | 255 arquivos, 27 links, **0 quebrados** |
| `git diff --check` (docs) | **PASS** (o tree completo tem blank line EOF pré-existente em frontend, não tocado) |

Testcontainers aplicou V1–V5 em PostgreSQL 17; nenhum teste foi skipped.

---

## 14. Lacunas

- Sem E2E de browser, cobertura, contract test, visual regression ou teste de carga.
- Sem teste integrado de MFA, sessões, change-password, PATCH perfil, artigos/search,
  market/bitcoin/video/admin.
- Ownership entre dois usuários não é provado por teste; é inferido por código.
- RLS não é per-user; `app_rw USING (true)`.
- 5 endpoints sem consumidor frontend (auth/me, gamification/achievements, market/assets,
  admin upload/list); admin e market sem UI.
- `lesson_articles` órfã.
- Integrações externas sem teste live; Supabase/Resend sem credenciais.
- Sem feature map de design system/observabilidade (não são capacidades isoladas).
- Mapas podem ficar obsoletos se o código mudar; o validador só verifica referências.

---

## 15. Riscos

| ID | Risco | Severidade | Evidência | Mitigação |
|---|---|---|---|---|
| R-P11-01 | Query sem `user_id` pode vazar dados entre usuários, pois RLS é `USING (true)` | **HIGH** | V2 + `database-map` | testes de ownership; policy per-user futura |
| R-P11-02 | Admin upload sem UI/teste/authorization test | **HIGH** | `FEAT-ADMIN-001` | teste de role + upload; UI/admin |
| R-P11-03 | MFA/sessões sem teste integrado | MEDIUM | `FEAT-AUTH-004/005` | testes E2E/API |
| R-P11-04 | Integrações externas sem teste live/contrato | MEDIUM | `integration-map` | contract tests/credenciais |
| R-P11-05 | Access token não revogável em 15 min | MEDIUM | `authentication-map` | reduzir TTL/denylist |
| R-P11-06 | Rate limit em memória | MEDIUM | `RateLimitFilter` | Redis |
| R-P11-07 | `lesson_articles` órfã | LOW | `database-map` | remover/implementar em missão futura |
| R-P11-08 | Mapas podem divergir do código | MEDIUM | validação estrutural | atualização por evento + CI futuro |
| R-P11-09 | Markdown de artigos (XSS) | LOW/MEDIUM | `Markdown`/`react-markdown` | revisão de sanitização |

---

## 16. Rollback

Novos arquivos (remover somente estes):
- 10 mapas em `docs/architecture/*.md` (exceto `overview.md`/`database.md` existentes);
- `docs/architecture/features/README.md` + 18 `FEAT-*.md`;
- `docs/engineering/P1_1_VERIFICATION.md`.

Alterados:
- `README.md` (hash antes `2542FCF9…72085735`);
- `docs/engineering/CONTEXT_INDEX.md` (hash antes `CF8D39DC…82CF87D`);
- `docs/engineering/SOURCE_REGISTRY.md` (antes `B2907EB9…B495EA`);
- `scripts/docs/check_docs.py` (antes `C99790E0…90A9A31`);
- `docs/transformation/CHANGELOG.md` e `TRANSFORMATION_ROADMAP.md` (untracked; remover
  entradas P1.1).

Não remover `docs/architecture/overview.md`/`database.md`, docs P0, `_audit` ou qualquer
evidência. Não usar `git reset --hard`/`git clean`. Rollback **não executado**.

---

## 17. Git

- Branch: `feat/mvp-completo`
- HEAD: `100d3fe`
- Staged: **0**
- Commits desta missão: **0**
- Push/PR/merge/deploy: **não**
- Working tree final: **79 entradas** (39 modificadas, 40 não rastreadas); docs/architecture e docs/engineering são untracked
- Alterações: documentação + extensão do validador; nenhum código de produto, agente,
  skill, migration, vídeo ou configuração global.

---

## 18. Próxima missão

**P1.2 pode começar** no escopo de contrato/snapshot OpenAPI, tipos gerados, testes de
ownership/E2E e endurecimento da validação — sem tratar os mapas como prova de runtime.

Continuam bloqueando ou exigindo cuidado:
- deploy/publicação/credenciais (NOT DEPLOYED);
- autorização ADMIN e ownership cruzado sem teste;
- RLS `USING (true)` (não é isolamento per-user);
- integrações externas sem teste live;
- MFA/sessões/perfil PATCH/artigos sem teste;
- riscos P0.3 abertos (MCP/shell/global/browser).

Não iniciar P1.2 automaticamente; aguardar revisão.

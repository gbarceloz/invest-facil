# P1.2 — Matriz de rastreabilidade de testes

**Projeto:** Invest Fácil
**Data:** 2026-11-22
**Regra de status:** `TESTED` significa executado localmente com evidência. `VERIFIED` não é usado para comportamento de produto nesta missão. `HUMAN_REVIEW_REQUIRED` indica decisão/ação humana pendente.

---

## 1. Contrato e tipos

| Feature / fluxo | Endpoint ou artefato | Regra verificada | Teste / evidência | Status |
|---|---|---|---|---|
| API contract | `/v3/api-docs` | Documento real deve ser servido e capturado | `OpenApiSnapshotIntegrationTest.capturesExposedOpenApiDocument`; `backend/target/openapi-current.json` | TESTED |
| API contract | `docs/contracts/openapi.json` | Snapshot não pode divergir sem revisão | `scripts/contracts/check_openapi_contract.py`; `BREAKING=0 COMPATIBLE=0` | TESTED |
| API contract | 37 paths / 42 operações / 52 schemas | Contrato exposto corresponde ao snapshot | `docs/contracts/openapi.json`; comparador | TESTED |
| Frontend contract | `frontend/lib/types.ts` × OpenAPI | DTOs mapeados não podem usar campos inexistentes | `scripts/contracts/check_frontend_contracts.cjs`; 37 paths, 35 DTOs | TESTED |
| Frontend HTTP | `frontend/lib/api.ts` | 401 dispara um único refresh e repete a chamada | `frontend/__tests__/api.test.ts` | TESTED |
| Frontend HTTP | `frontend/lib/api.ts` | 403/404/500 preservam status/código; login não tenta refresh | `frontend/__tests__/api.test.ts` | TESTED |

## 2. Autenticação e sessões

| Feature / fluxo | Endpoint | Regra | Teste | Status |
|---|---|---|---|---|
| Cadastro + verificação | `POST /auth/register`, `POST /auth/verify-email` | Conta só entra após verificação | `MvpFlowIntegrationTest.shouldRunCompleteLearnerJourney`; E2E `auth.spec.ts` | TESTED |
| Login | `POST /auth/login` | Credenciais válidas emitem access + refresh | `MvpFlowIntegrationTest`; `OwnershipSecurityIntegrationTest` | TESTED |
| Refresh rotation | `POST /auth/refresh` | Token rotaciona; reuso revoga a família | `MvpFlowIntegrationTest` (passos 11–12) | TESTED |
| MFA setup/login | `/auth/mfa/setup`, `/auth/mfa/enable`, `/auth/login`, `/auth/mfa/verify` | Challenge sem access; código TOTP válido; replay rejeitado | `ExtendedIntegrationTest.mfaSetupLoginChallengeAndReplayProtection` | TESTED |
| Sessões | `GET /auth/sessions`, `DELETE /auth/sessions/{id}` | Lista apenas sessões do usuário; revogação encerra refresh | `ExtendedIntegrationTest.sessionsListRotateAndRevoke` | TESTED |
| Troca de senha | `POST /auth/change-password` | Senha atual obrigatória; sessões revogadas; senha antiga falha | `ExtendedIntegrationTest.changePasswordRevokesSessionsAndOldCredentials` | TESTED |
| Reset de senha | `POST /auth/reset-password` | Token de uso único; login com nova senha | `MvpFlowIntegrationTest` (passo 15) | TESTED |
| Logout | `POST /auth/logout` | Refresh revogado; access expira pelo TTL | E2E `auth.spec.ts`; `AuthService.logout` | TESTED |
| JWT inválido/expirado | Rotas autenticadas | Assinatura/expiração inválidas retornam 401 | `ExtendedIntegrationTest.expiredAndWronglySignedTokensAreRejected` | TESTED |

## 3. Ownership e autorização

| Cenário | Endpoint | Regra | Teste / evidência | Status |
|---|---|---|---|---|
| A lê progresso de B | `GET /progress/lessons/{id}`, `GET /progress/summary` | A vê apenas o próprio estado; banco de B intacto | `OwnershipSecurityIntegrationTest.userCannotReadOrChangeOtherUsersProgress` | TESTED |
| A exclui cenário de B | `DELETE /simulator/scenarios/{id}` | 404 e registro de B preservado | `OwnershipSecurityIntegrationTest.userCannotDeleteOtherUsersScenario` | TESTED |
| A revoga sessão de B | `DELETE /auth/sessions/{id}` | 404 e sessão de B permanece | `OwnershipSecurityIntegrationTest.userCannotRevokeOtherUsersSession` | TESTED |
| A altera perfil de B | `PATCH /users/me` | Só o principal autenticado é alterado | `OwnershipSecurityIntegrationTest.profileUpdateOnlyChangesTheAuthenticatedUser` | TESTED |
| Anônimo em rota protegida | `/progress/summary`, `/users/me`, `/simulator/scenarios`, `/admin/videos` | 401 | `OwnershipSecurityIntegrationTest.anonymousCannotAccessProtectedEndpoints` | TESTED |
| USER em ADMIN | `GET /admin/videos` | 403; ADMIN recebe 200 | `OwnershipSecurityIntegrationTest.userCannotUseAdminEndpointsButAdminCanListVideos` | TESTED |
| Autorização ADMIN de upload | `POST /admin/videos/{lessonId}`, `GET /admin/videos` | Anônimo 401; USER 403; ADMIN cria/lista; storage simulado | `VideoAdminIntegrationTest` (3 testes) | TESTED |
| Upload inválido | `POST /admin/videos/{lessonId}` | Formato/assinatura/lesson inválidos não persistem | `VideoAdminIntegrationTest.adminUploadValidatesFormatAndLessonWithoutPersisting` | TESTED |

## 4. Conteúdo, progresso e gamificação

| Feature / fluxo | Endpoint | Regra | Teste | Status |
|---|---|---|---|---|
| Catálogo | `GET /content/categories` | 8 categorias do seed | `MvpFlowIntegrationTest`; E2E `learning.spec.ts` | TESTED |
| Aula | `GET /content/lessons/{slug}` | Aula publicada e detalhe | `MvpFlowIntegrationTest`; E2E | TESTED |
| Artigos | `GET /content/articles`, `/articles/{slug}` | Lista e detalhe com `contentMd` | `ExtendedIntegrationTest.articlesAndSearchAreServedFromSeededContent` | TESTED |
| Busca | `GET /content/search?q=` | Consulta mínima de 2 caracteres; resultados do seed | `ExtendedIntegrationTest.articlesAndSearchAreServedFromSeededContent` | TESTED |
| Conclusão de aula | `POST /progress/lessons/{id}` | Idempotente; 50 XP na primeira vez | `MvpFlowIntegrationTest`; E2E | TESTED |
| Quiz | `GET/POST /progress/lessons/{id}/quiz` | 100% no seed; ≥70% aprova; +30 XP | `MvpFlowIntegrationTest`; E2E | TESTED |
| Gamificação | `GET /gamification/summary`, `/achievements`, `/xp` | 70 XP inicial; nível Curioso; streak 1; achievement | `ExtendedIntegrationTest.gamificationLevelAndStreakAfterRealCompletion` | TESTED |
| Simulador | `POST /simulator/calculate` | Cálculo e disclaimer | `MvpFlowIntegrationTest`; `SimulatorServiceTest`; E2E | TESTED |
| Cenário salvo | `POST/GET/DELETE /simulator/scenarios` | Persistência e ownership | `MvpFlowIntegrationTest`; `OwnershipSecurityIntegrationTest`; E2E | TESTED |

## 5. Mercado, Bitcoin e vídeo

| Feature / fluxo | Endpoint | Regra | Teste | Status |
|---|---|---|---|---|
| Market fallback | `GET /market/assets` | Provedor desabilitado retorna `UNAVAILABLE`, sem números fictícios | `ExtendedIntegrationTest.marketAndBitcoinReturnExplicitFallbackWithoutNetwork` | TESTED |
| Bitcoin fallback | `GET /bitcoin/market` | Provedor desabilitado retorna `UNAVAILABLE` | `ExtendedIntegrationTest.marketAndBitcoinReturnExplicitFallbackWithoutNetwork` | TESTED |
| Vídeo público | `GET /content/lessons/{slug}/video` | Sem asset/demo retorna 404 | `ExtendedIntegrationTest.videoPlaybackWithoutPublishedAssetIsNotFound` | TESTED |
| Upload/list ADMIN | `/admin/videos` | Autorização e persistência com boundary Supabase simulado | `VideoAdminIntegrationTest` | TESTED |
| Integrações live | Supabase, Resend, Binance, CoinGecko | Não foram chamadas com credenciais reais | — | IMPLEMENTED |

## 6. Jornadas E2E

| Jornada | Fluxo real no navegador | Evidência | Status |
|---|---|---|---|
| A — cadastro/login/logout | Cadastro UI → verificação → login → dashboard → perfil → logout | `frontend/playwright-report`; 5/5 | TESTED |
| B — aprendizagem | Catálogo → módulo → aula → conclusão → quiz → progresso/XP | `learning.spec.ts` | TESTED |
| C — simulador | Cálculo → salvar → reload → cenário persistido | `simulator.spec.ts` | TESTED |
| D — mercado/bitcoin | Página Cripto → fallback explícito → redirect legado | `market.spec.ts` | TESTED |
| E — perfil | Alterar nome → salvar → reload → persistência | `profile.spec.ts` | TESTED |
| F — ADMIN | Sem interface administrativa; API coberta por integração | `VideoAdminIntegrationTest` | TESTED (API) |

## 7. Segurança de banco e lacunas

| Item | Evidência | Status |
|---|---|---|
| RLS habilitada em 18 de 19 tabelas | Consulta `pg_class` no PostgreSQL 17 local; `flyway_schema_history` é a exceção | TESTED |
| Policy `app_rw USING (true)` | 18 policies permissivas para `investfacil_app` | TESTED |
| `FORCE ROW LEVEL SECURITY` | Ausente em todas as tabelas | HUMAN_REVIEW_REQUIRED |
| Isolamento per-user no banco | Não existe; depende da aplicação | HUMAN_REVIEW_REQUIRED |
| `investfacil_app` com `BYPASSRLS` | Não; `rolbypassrls=false` | TESTED |
| Dono das tabelas | `postgres`; owner bypassa RLS sem FORCE | TESTED |
| `lesson_articles` órfã | Tabela existe, sem entidade/repository/uso | IMPLEMENTED (não usada) |
| Endpoints sem consumidor frontend | `/auth/me`, `/gamification/achievements`, `/market/assets`, admin upload/list | IMPLEMENTED |
| CI remoto | Workflow atualizado, sem execução no GitHub nesta missão | IMPLEMENTED |

## 8. Resumo executivo

| Camada | Executado | Passou | Falhou | Ignorado |
|---|---|---|---|---|
| Backend (Maven) | 47 | 47 | 0 | 0 |
| Frontend (Vitest) | 12 | 12 | 0 | 0 |
| TypeScript | 1 | 1 | 0 | 0 |
| Build de produção | 1 | 1 | 0 | 0 |
| Contrato OpenAPI | 1 | 1 | 0 | 0 |
| Frontend contract | 1 | 1 | 0 | 0 |
| E2E Playwright | 5 | 5 | 0 | 0 |
| Docs validator | 1 | 1 | 0 | 0 |

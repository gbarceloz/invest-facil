# API MAP — INVEST FÁCIL

**Estilo:** REST JSON · prefixo `/api/v1` · 42 mappings em 9 controllers.
**Evidência:** `@RequestMapping`/`@*Mapping` dos controllers; DTOs; `SecurityConfig`.
**Uso pelo frontend:** confirmado por `api.get/post/patch/delete` em `frontend/**`.

---

## 1. Autenticação — `AuthController` (17)

| Método | Path | Auth | Controller → Service | Request → Response | Frontend | Teste |
|---|---|---|---|---|---|---|
| POST | `/api/v1/auth/register` | público | `AuthController.register` → `AuthService.register` | `RegisterRequest` → `RegisterResponse` | `app/cadastro` | `MvpFlow`, `RegisterValidation` |
| POST | `/api/v1/auth/login` | público | `login` → `AuthService.login` | `LoginRequest` → `AuthResponse` | `lib/api.loginRequest` | `MvpFlow` |
| POST | `/api/v1/auth/refresh` | público (cookie + `X-Requested-With`) | `refresh` → `AuthService.refresh` | — → `AuthResponse` | `lib/api.refreshAccessToken` | `MvpFlow` |
| POST | `/api/v1/auth/logout` | público | `logout` → `AuthService.logout` | — → 204 | `lib/api.logoutRequest` | — |
| POST | `/api/v1/auth/verify-email` | público | `verifyEmail` → `AuthService.verifyEmail` | `VerifyEmailRequest` → `MessageResponse` | `app/verificar-email` | `MvpFlow` |
| POST | `/api/v1/auth/resend-verification` | público | `resendVerification` | `ForgotPasswordRequest` → `MessageResponse` | `entrar`, `perfil` | — |
| POST | `/api/v1/auth/forgot-password` | público | `forgotPassword` | `ForgotPasswordRequest` → `MessageResponse` | `app/recuperar-senha` | — |
| POST | `/api/v1/auth/reset-password` | público | `resetPassword` | `ResetPasswordRequest` → `MessageResponse` | `app/redefinir-senha` | `MvpFlow` |
| POST | `/api/v1/auth/mfa/verify` | público | `verifyMfa` | `MfaVerifyRequest` → `AuthResponse` | `lib/api.mfaVerifyRequest` | `TotpService` (unit) |
| POST | `/api/v1/auth/mfa/setup` | autenticado | `setupMfa` | `MfaSetupRequest` → `MfaSetupResponse` | `perfil` | — |
| POST | `/api/v1/auth/mfa/enable` | autenticado | `enableMfa` | `MfaCodeRequest` → `MessageResponse` | `perfil` | — |
| POST | `/api/v1/auth/mfa/disable` | autenticado | `disableMfa` | `MfaDisableRequest` → `MessageResponse` | `perfil` | — |
| POST | `/api/v1/auth/change-password` | autenticado | `changePassword` | `ChangePasswordRequest` → `MessageResponse` | `perfil` | — |
| GET | `/api/v1/auth/sessions` | autenticado | `sessions` → `AuthService.sessions` | — → `List<SessionView>` | `perfil` | — |
| DELETE | `/api/v1/auth/sessions/{id}` | autenticado | `revokeSession` | — → 204 | `perfil` | — |
| DELETE | `/api/v1/auth/sessions` | autenticado | `revokeAllSessions` | — → 204 | `perfil` | — |
| GET | `/api/v1/auth/me` | autenticado | `me` → `AuthService.me` | — → `UserView` | **não usado** | — |

---

## 2. Usuário — `UserController` (2)

| Método | Path | Auth | Controller → Service | Request → Response | Frontend | Teste |
|---|---|---|---|---|---|---|
| GET | `/api/v1/users/me` | autenticado | `UserController.me` → `UserService.require` | — → `UserView` | `lib/auth`, `perfil` | `MvpFlow` |
| PATCH | `/api/v1/users/me` | autenticado | `update` → `UserService.updateProfile` | `UpdateProfileRequest` → `UserView` | `perfil` | — |

---

## 3. Conteúdo — `ContentController` (6)

| Método | Path | Auth | Controller → Service | Request → Response | Frontend | Teste |
|---|---|---|---|---|---|---|
| GET | `/api/v1/content/categories` | público | `categories` → `ContentService.catalog` | — → `List<CategoryView>` | aprender, bitcoin, mercado-financeiro | `MvpFlow` (length 8) |
| GET | `/api/v1/content/modules/{slug}` | público | `module` → `ContentService.module` | — → `ModuleDetail` | módulo | — |
| GET | `/api/v1/content/lessons/{slug}` | público | `lesson` → `ContentService.lesson` | — → `LessonDetail` | aula, quiz | `MvpFlow` |
| GET | `/api/v1/content/articles` | público | `articles` → `ContentService.articleList` | — → `List<ArticleSummary>` | biblioteca | — |
| GET | `/api/v1/content/articles/{slug}` | público | `article` → `ContentService.article` | — → `ArticleDetail` | biblioteca/[slug] | — |
| GET | `/api/v1/content/search?q=` | público | `search` → `ContentService.search` | `q` (2–80) → `SearchResults` | aprender | — |

---

## 4. Vídeo — `VideoController` (3)

| Método | Path | Auth | Controller → Service | Request → Response | Frontend | Teste |
|---|---|---|---|---|---|---|
| GET | `/api/v1/content/lessons/{slug}/video` | público | `playback` → `VideoService.playbackBySlug` | — → `VideoView` | aula | — |
| POST | `/api/v1/admin/videos/{lessonId}` | ADMIN | `upload` → `VideoService.upload` | multipart `file` → `VideoAdminView` | **não usado** | — |
| GET | `/api/v1/admin/videos` | ADMIN | `list` → `VideoService.list` | — → `List<VideoAdminView>` | **não usado** | — |

---

## 5. Progresso — `ProgressController` (5)

| Método | Path | Auth | Controller → Service | Request → Response | Frontend | Teste |
|---|---|---|---|---|---|---|
| POST | `/api/v1/progress/lessons/{lessonId}` | autenticado | `complete` → `ProgressService.completeLesson` | — → `CompleteLessonResponse` (201/200) | aula | `MvpFlow` |
| GET | `/api/v1/progress/lessons/{lessonId}` | autenticado | `status` → `lessonStatus` | — → `LessonStatus` | aula, quiz | — |
| GET | `/api/v1/progress/lessons/{lessonId}/quiz` | autenticado | `quiz` → `ProgressService.quiz` | — → `QuizView` | quiz | `MvpFlow` |
| POST | `/api/v1/progress/lessons/{lessonId}/quiz` | autenticado | `submit` → `submitQuiz` | `QuizSubmitRequest` → `QuizResult` | quiz | `MvpFlow` |
| GET | `/api/v1/progress/summary` | autenticado | `summary` → `summary` | — → `ProgressSummary` | `app-data` | `MvpFlow` |

---

## 6. Gamificação — `GamificationController` (3)

| Método | Path | Auth | Controller → Service | Request → Response | Frontend | Teste |
|---|---|---|---|---|---|---|
| GET | `/api/v1/gamification/summary` | autenticado | `summary` → `GamificationService.summary` | — → `GamificationSummary` | `app-data`, shell, dashboard | `MvpFlow` (XP 120) |
| GET | `/api/v1/gamification/achievements` | autenticado | `achievements` → `summary().achievements()` | — → `List<AchievementView>` | **não usado** (summary já inclui) | — |
| GET | `/api/v1/gamification/xp` | autenticado | `xpHistory` | — → `List<XpEntry>` | progresso | — |

---

## 7. Simulador — `SimulatorController` (4)

| Método | Path | Auth | Controller → Service | Request → Response | Frontend | Teste |
|---|---|---|---|---|---|---|
| POST | `/api/v1/simulator/calculate` | público | `calculate` → `SimulatorService.calculate` | `ScenarioRequest` → `ScenarioResult` | simulador | `SimulatorServiceTest` |
| POST | `/api/v1/simulator/scenarios` | autenticado | `save` → `save` | `SaveScenarioRequest` → `SavedScenario` | simulador | `MvpFlow` (201) |
| GET | `/api/v1/simulator/scenarios` | autenticado | `list` → `list` | — → `List<SavedScenario>` | simulador | — |
| DELETE | `/api/v1/simulator/scenarios/{id}` | autenticado | `delete` → `delete` | — → 204 | simulador | — |

---

## 8. Mercado e Bitcoin — `MarketController` (1), `BitcoinController` (1)

| Método | Path | Auth | Controller → Service | Request → Response | Frontend | Teste |
|---|---|---|---|---|---|---|
| GET | `/api/v1/market/assets` | público | `assets` → `MarketService.assets` | — → `MarketResponse` | **não usado** (`/app/mercado` redireciona para `/app/bitcoin`) | — |
| GET | `/api/v1/bitcoin/market` | público | `market` → `BitcoinMarketService.market` | — → `BitcoinMarketResponse` | dashboard, bitcoin | — |

---

## 9. Endpoints sem uso confirmado no frontend

| Endpoint | Motivo |
|---|---|
| `GET /api/v1/auth/me` | frontend usa `/api/v1/users/me` |
| `GET /api/v1/gamification/achievements` | `gamification/summary` já devolve achievements |
| `GET /api/v1/market/assets` | página antiga `/app/mercado` foi substituída por `/app/bitcoin` |
| `POST /api/v1/admin/videos/{lessonId}` | não há UI/admin page |
| `GET /api/v1/admin/videos` | idem |

**Regra:** endpoint existir ≠ endpoint usado pela interface. A API tem 42 mappings; 37 têm
consumidor frontend confirmado, 5 não têm.

---

## 10. Contrato e lacunas

- Sem snapshot OpenAPI/contract test; `docs/api/README.md` é referência manual.
- DTOs são records; validação Jakarta nos requests.
- Erros usam `ApiError` (`status`, `code`, `message`, `details`, `requestId`).
- Não há versionamento além de `/v1`; não há depreciação formal.
- Testes cobrem um subconjunto: auth/progress/quiz/simulador básicos; market/bitcoin/video/
  artigos/sessões/perfil PATCH sem teste.

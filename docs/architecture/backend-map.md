# BACKEND MAP — INVEST FÁCIL

**Stack:** Java 21 · Spring Boot 3.5.6 · Spring MVC · Spring Security · Spring Data JPA ·
Jakarta Validation · Flyway · PostgreSQL 17.
**Evidência:** `backend/pom.xml`, `backend/src/main/java/**`, `backend/src/test/**`.
**Endpoints:** 42 mappings em 9 controllers.

---

## 1. Fluxo de request

```text
HTTP request
  ↓
RateLimitFilter (IP + path bucket, memória)
  ↓
SecurityFilterChain (JWT stateless, rota pública/autenticada/ADMIN)
  ↓
JwtAuthenticationFilter (Bearer → userId → User do banco → ROLE)
  ↓
Controller (@Valid DTO)
  ↓
Service (@Transactional, regra de negócio)
  ↓
Repository (Spring Data JPA)
  ↓
PostgreSQL (schema investfacil)
  ↓
DTO de resposta / GlobalExceptionHandler
```

- Erros: `BusinessException` + `GlobalExceptionHandler` → `ApiError` com code/message/
  requestId; sem stacktrace na resposta.
- Autenticação: `CurrentUser` é carregado do banco a cada request; o claim `role` do JWT
  não concede autoridade.
- Transações: services de escrita; leitura com `@Transactional(readOnly = true)`.
- Rate limit: em memória por IP+bucket; não distribuído.

---

## 2. Controllers

| Controller | Base | Endpoints | Serviço principal | Auth |
|---|---|---:|---|---|
| `AuthController` | `/api/v1/auth` | 17 | `AuthService` | público + autenticado (MFA setup/gestão) |
| `UserController` | `/api/v1/users/me` | 2 | `UserService` | autenticado |
| `ContentController` | `/api/v1/content` | 6 | `ContentService` | público |
| `VideoController` | `/api/v1/content` e `/api/v1/admin/videos` | 3 | `VideoService` | público (playback) + ADMIN (upload/list) |
| `ProgressController` | `/api/v1/progress` | 5 | `ProgressService` | autenticado |
| `GamificationController` | `/api/v1/gamification` | 3 | `GamificationService` | autenticado |
| `SimulatorController` | `/api/v1/simulator` | 4 | `SimulatorService` | calculate público; cenários autenticados |
| `MarketController` | `/api/v1/market` | 1 | `MarketService` | público |
| `BitcoinController` | `/api/v1/bitcoin` | 1 | `BitcoinMarketService` | público |

Mapa detalhado de cada endpoint: `api-map.md`.

---

## 3. Services, repositories e entidades

| Domínio | Services | Repositories | Entidades/tabelas |
|---|---|---|---|
| Auth | `AuthService`, `AuthAuditService`, `EmailService`, `JwtService`, `RefreshCookieService`, `TotpService`, `SecretCipher`, `TokenHasher` | `RefreshTokenRepository`, `EmailTokenRepository`, `AuthEventRepository`, `UserRepository` | `RefreshToken`, `EmailToken`, `AuthEvent`, `User` |
| Users | `UserService` | `UserRepository` | `User` |
| Content | `ContentService` (`ContentCatalog`), `ContentSeedService` | `CategoryRepository`, `CourseModuleRepository`, `LessonRepository`, `ArticleRepository` | `Category`, `CourseModule`, `Lesson`, `Article` |
| Video | `VideoService`, `SupabaseStorageClient` | `VideoAssetRepository` | `VideoAsset` |
| Progress | `ProgressService`, `ProgressMetricsService` (`ProgressMetrics`) | `UserProgressRepository`, `QuizQuestionRepository`, `QuizAttemptRepository`, `QuizAttemptAnswerRepository` | `UserProgress`, `QuizQuestion`, `QuizAttempt`, `QuizAttemptAnswer` |
| Gamification | `GamificationService` | `XpLedgerRepository`, `AchievementRepository`, `UserAchievementRepository` | `XpLedger`, `Achievement`, `UserAchievement` |
| Simulator | `SimulatorService` | `SimulationRepository` | `Simulation` |
| Market | `MarketService` | — (sem cache persistido) | — |
| Bitcoin | `BitcoinMarketService` | — | — |
| Seed | `ContentSeedService`, `DemoDataInitializer` | vários | conteúdo + conquistas + demo |

---

## 4. Regras de negócio confirmadas

| Regra | Implementação | Evidência |
|---|---|---|
| Cadastro exige e-mail único; duplicata retorna 409 genérico | `AuthService.register`, `UserService.create` | `RegisterValidationTest`, `MvpFlowIntegrationTest` |
| Login bloqueado até verificar e-mail | `AuthService.login` (`EMAIL_NOT_VERIFIED`) | `MvpFlowIntegrationTest` |
| Lockout após tentativas inválidas | `UserService.registerFailedLogin` (5 tentativas/15 min default) | `UserService`; sem teste dedicado |
| Refresh rotativo; reuso revoga família | `AuthService.refresh`, `RefreshTokenRepository.revokeFamily` | `MvpFlowIntegrationTest` |
| Token de e-mail é hash SHA-256, uso único, 24 h/1 h | `EmailToken`, `AuthService` | `MvpFlowIntegrationTest` (reset) |
| MFA TOTP com replay counter atômico | `TotpService`, `UserService.consumeMfaCounter` | `TotpServiceTest`; teste manual |
| Conclusão de aula é idempotente; 50 XP na primeira vez | `ProgressService.completeLesson` | `MvpFlowIntegrationTest` |
| Quiz exige todas as questões; 70% para passar; 30 XP na primeira aprovação | `ProgressService.submitQuiz` | `MvpFlowIntegrationTest` (100%) |
| XP por aula/quiz é único por usuário+aula+motivo | índice `ux_xp_once_per_lesson_reason` + `GamificationService.awardXp` | V3; `MvpFlowIntegrationTest` |
| Níveis 0/300/800/1500/2500/4000 XP | `GamificationService.LEVELS` | código; sem teste dedicado |
| Streak usa America/Sao_Paulo | `GamificationService.ZONE` | código; sem teste dedicado |
| Simulador 1–600 meses, taxas 0–100%, juros compostos + inflação | `SimulatorService.calculate`, `SimulatorDtos` | `SimulatorServiceTest` |
| Salvar cenário concede `FIRST_SIMULATION` | `SimulatorService.save`, `GamificationService.unlockByCode` | `MvpFlowIntegrationTest` (save) |
| Vídeo público usa URL assinada; upload ADMIN valida MIME/assinatura/tamanho | `VideoService` | código; sem teste |

---

## 5. Dependências internas

- `AuthService` → `UserService`, `RefreshTokenRepository`, `EmailTokenRepository`,
  `AuthAuditService`, `JwtService`, `EmailService`, `SecretCipher`, `TotpService`.
- `ProgressService` → `ContentCatalog`, `GamificationService`, `ProgressMetricsService`,
  repositories de progresso/quiz.
- `GamificationService` → `ProgressMetrics` (implementado por `ProgressMetricsService`),
  `XpLedgerRepository`, `AchievementRepository`, `UserAchievementRepository`.
- `SimulatorService` → `SimulationRepository`, `GamificationService`.
- `VideoService` → `VideoAssetRepository`, `SupabaseStorageClient`, `ContentCatalog`.
- `ContentService` implementa `ContentCatalog` para progresso/vídeo.

**Ciclo conceitual:** Progress → Gamification (XP) e Gamification → ProgressMetrics
(contagem). Não há ciclo de beans porque `ProgressMetricsService` é separado de
`ProgressService`; a dependência é conceitual e deve ser considerada em mudanças.

---

## 6. Testes backend (28)

| Classe | Testes | Cobre |
|---|---:|---|
| `MvpFlowIntegrationTest` | 1 | jornada completa: catálogo, cadastro, verificação, login, perfil, aula, conclusão idempotente, quiz, XP, simulador, refresh/reuso, reset |
| `FlywaySecurityIntegrationTest` | 5 | migrations, DML/DDL, append-only, RLS guest |
| `RegisterValidationTest` | 3 | validação de cadastro |
| `JwtServiceTest` | 4 | JWT válido, MFA≠access, expirado, segredo fraco |
| `TotpServiceTest` | 3 | RFC 6238, janela, segredo |
| `ClientIpResolverTest` | 3 | XFF confiável/não confiável |
| `GlobalExceptionHandlerTest` | 4 | 404/400/500 sem vazamento |
| `SimulatorServiceTest` | 3 | juros, inflação, sem juros |
| `SecretsScanTest` | 2 | `.env` ausente e padrões de segredo no subtree backend |

**Lacunas:** sem testes de market/bitcoin/video, MFA integrado, sessões, perfil PATCH,
artigos, níveis/streak, E2E, cobertura, concorrência de refresh/MFA.

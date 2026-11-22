# SYSTEM OVERVIEW — INVEST FÁCIL

**Data:** 22/11/2026
**Fonte de verdade:** código/configuração + testes; este mapa é uma representação operacional.
**Stack:** Next.js 16.4.6 / React 19 / TypeScript 5.7 + Spring Boot 3.5.6 / Java 21 / PostgreSQL 17.

---

## 1. Stack real (com evidência)

| Camada | Tecnologia | Evidência |
|---|---|---|
| Frontend | Next.js 16.4.6 (App Router), React 19.1, TypeScript estrito, Tailwind 3.4 | `frontend/package.json`, `frontend/tsconfig.json`, `frontend/next.config.ts` |
| Backend | Java 21, Spring Boot 3.5.6 (Web MVC, Security, Data JPA, Validation, Actuator) | `backend/pom.xml`, `backend/src/main/java/com/investfacil/api/InvestFacilApplication.java` |
| Banco | PostgreSQL 17, schema `investfacil`, Flyway V1–V7, Hibernate `validate` | `backend/src/main/resources/application.yml`, `backend/src/main/resources/db/migration/**` |
| Auth | JWT HS256 (15 min) + refresh opaco em cookie HttpOnly + TOTP + BCrypt | `JwtService`, `RefreshCookieService`, `TotpService`, `AuthService` |
| API | REST JSON versionada `/api/v1`, springdoc/OpenAPI | `@RequestMapping` dos controllers, `OpenApiConfig` |
| Testes | JUnit 5, MockMvc, Testcontainers PostgreSQL 17, Vitest/Testing Library | `backend/src/test/**`, `frontend/__tests__/**` |
| Infra | Dockerfile, Render/Vercel runbooks, CI GitHub Actions | `backend/Dockerfile`, `render.yaml`, `docs/DEPLOY.md`, `.github/workflows/ci.yml` |

### 1.1 Divergência Angular × Next.js

**Resolução:** o frontend real é **Next.js 16.4.6**. Não há Angular no `package.json`, no
`tsconfig`, no código ou em qualquer documento rastreado. A menção histórica a Angular
não tem evidência no repositório atual e deve ser tratada como erro de relato anterior.

Evidência: `frontend/package.json` contém `next`, `react`, `react-dom`; `npm run build`
produz rotas do App Router; não há `angular.json` nem dependências `@angular/*`.

---

## 2. Runtime local

```text
Browser
  ↓ (same-origin /api)
Next.js rewrite (API_PROXY_TARGET → http://localhost:8081)
  ↓
Spring Boot API :8081
  ├─ RateLimitFilter
  ├─ JwtAuthenticationFilter
  ├─ Controllers → Services → Spring Data JPA
  └─ PostgreSQL 17 (schema investfacil)
       ├─ Flyway V1–V7
       └─ RLS + roles
```

- Frontend: `frontend/next.config.ts` reescreve `/api/:path*` para `API_PROXY_TARGET`
  (default `http://localhost:8081`), mantendo o refresh cookie first-party.
- Backend: `server.port=${PORT:8080}`; `application.yml` usa `SPRING_DATASOURCE_URL`.
- Banco local de desenvolvimento: PostgreSQL 17; testes usam Testcontainers
  `postgres:17-alpine`.
- Produção: Supabase/Render/Vercel **configurados em runbook**, sem evidência de deploy.

---

## 3. Fronteiras de confiança

| Fronteira | Controle | Evidência | Limitação |
|---|---|---|---|
| Browser → API | cookie HttpOnly, SameSite=Strict, `X-Requested-With` | `RefreshCookieService`, `AuthController.refresh` | cookie real não testado em browser/HTTPS |
| API → usuário | JWT assinado; papel recarregado do banco | `JwtAuthenticationFilter` | access token em memória; XSS ainda é risco |
| API → banco | role `investfacil_runtime` (membro de `investfacil_app`), sem DDL; RLS/FORCE e policies `s24_*` | V6/V7; `RlsIsolationIntegrationTest` | V7 local, ainda não aplicada no Lab |
| API → externo | timeout/cache/fallback | `MarketService`, `BitcoinMarketService`, `SupabaseStorageClient`, `EmailService` | sem teste live; credenciais ausentes |
| Browser → conteúdo | CSP, X-Frame-Options, Referrer-Policy | `next.config.ts`, `SecurityConfig` | CSP do backend inclui `unsafe-inline` para Swagger |

---

## 4. Módulos do backend

| Pacote | Responsabilidade | Evidência |
|---|---|---|
| `auth` | cadastro, login, refresh, MFA, e-mail, reset, sessões, auditoria | `AuthController`, `AuthService`, `EmailService` |
| `users` | perfil, papel, lockout, hash de senha | `User`, `UserService` |
| `content` | categorias, módulos, aulas, artigos, busca | `ContentService`, `ContentCatalog` |
| `videos` | metadados e URL assinada do Supabase Storage | `VideoService`, `SupabaseStorageClient` |
| `progress` | conclusão, quiz, resumo | `ProgressService`, `ProgressMetricsService` |
| `gamification` | XP, níveis, conquistas, streak | `GamificationService` |
| `simulator` | juros compostos, cenários salvos | `SimulatorService` |
| `market` | BTC/ETH/SOL via Binance + FX | `MarketService` |
| `bitcoin` | Bitcoin via CoinGecko + gráficos | `BitcoinMarketService` |
| `common` | erros, JWT, TOTP, criptografia, rate limit, IP | `common/**` |
| `config` | segurança, propriedades, OpenAPI | `SecurityConfig`, `AppProperties`, `OpenApiConfig` |
| `seed` | seed idempotente de conteúdo/conquistas/demo | `ContentSeedService` |

---

## 5. Status e limites

- **Implementação:** `IMPLEMENTED` para os módulos acima.
- **Teste:** backend 63 testes; frontend 6; build 20 entradas.
- **Verificação:** `PARTIAL`; sem E2E, cobertura, teste live de integrações ou deploy.
- **Banco:** schema e RLS testados em Testcontainers; banco remoto **NOT VERIFIED**.
- **Produção:** **NOT DEPLOYED** / **NOT PUBLISHED**.

Mapas detalhados: `frontend-map.md`, `backend-map.md`, `database-map.md`,
`authentication-map.md`, `api-map.md`, `integration-map.md`, `dependency-map.md`,
`critical-paths.md` e `features/`.

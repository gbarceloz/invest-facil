# ARCHITECTURE — INVEST FÁCIL

**Data:** 22/11/2026
**Escopo:** representação rastreável do sistema que existe, com referências a código,
endpoints, migrations e testes.
**Stack real:** Next.js 16.4.6 / React 19 / TypeScript 5.7 + Spring Boot 3.5.6 / Java 21 /
PostgreSQL 17.

---

## 1. Mapas transversais

| Mapa | Conteúdo | Fonte principal |
|---|---|---|
| `system-overview.md` | stack, runtime, trust boundaries, módulos | `pom.xml`, `package.json`, `application.yml` |
| `frontend-map.md` | rotas, páginas, componentes, providers, fluxo de dados | `frontend/app/**`, `frontend/lib/**` |
| `backend-map.md` | controllers, services, repositories, regras, testes | `backend/src/main/java/**` |
| `database-map.md` | 18 tabelas, migrations, relações, índices, RLS | migrations + entidades |
| `authentication-map.md` | login, refresh, MFA, reset, roles, ownership | `auth/**`, `SecurityConfig` |
| `api-map.md` | 42 endpoints, DTOs, auth, consumidor frontend | controllers |
| `integration-map.md` | Supabase, Resend, Binance, FX, CoinGecko, deploy | `AppProperties`, clients |
| `dependency-map.md` | grafo entre features, shared services/tables | código |
| `critical-paths.md` | 7 caminhos de negócio com evidência | código + testes |

`overview.md` e `database.md` existentes permanecem como referência histórica/operacional;
os novos mapas são a visão de rastreabilidade. `database-map.md` não substitui as
migrations.

---

## 2. Feature maps

Índice completo: `features/README.md`.

| Domínio | Features |
|---|---|
| auth | `FEAT-AUTH-001` a `FEAT-AUTH-005` |
| user | `FEAT-USER-001` |
| learn | `FEAT-LEARN-001` a `FEAT-LEARN-003` |
| progress | `FEAT-PROGRESS-001`, `FEAT-PROGRESS-002` |
| gamification | `FEAT-GAME-001` |
| simulator | `FEAT-SIM-001`, `FEAT-SIM-002` |
| market | `FEAT-MARKET-001`, `FEAT-MARKET-002` |
| admin | `FEAT-ADMIN-001` |
| dashboard | `FEAT-DASH-001` |

**18 features** mapeadas. Cada mapa usa frontmatter com status independentes e seções de
frontend, API, backend, banco, segurança, testes, dependências e limitações.

---

## 3. Números verificados

| Fato | Valor | Evidência |
|---|---:|---|
| Endpoints | 42 | 9 controllers; `api-map.md` |
| Rotas frontend | 19 app + `_not-found` | build Next; `frontend-map.md` |
| Tabelas | 18 | V1–V7; `database-map.md` |
| Features | 18 | `features/README.md` |
| Testes backend | 63 | surefire |
| Testes frontend | 6 | Vitest |
| Integrações externas | 9 | `integration-map.md` |

---

## 4. Regras de leitura

1. O código/teste é a fonte; o mapa aponta e explica.
2. `IMPLEMENTED` ≠ `TESTED` ≠ `VERIFIED`.
3. Endpoint sem consumidor frontend é marcado como tal.
4. Tabela sem uso no código é marcada como órfã (`lesson_articles`).
5. RLS `USING (true)` não é apresentada como isolamento per-user.
6. Integração configurada não é integração operacional.
7. Caminho de arquivo existe ≠ comportamento testado.

## 5. Limitações

- Sem E2E de browser, cobertura, contract test ou teste de carga.
- Sem deploy/credenciais; Supabase/Resend/Binance/CoinGecko não testados live.
- Sem teste de autorização ADMIN ou ownership cruzado entre usuários.
- Sem feature map de design system/observabilidade (não existem como capacidade isolada).
- Mapas são documentação: precisam ser atualizados quando o código mudar.

---
feature_id: FEAT-LEARN-001
name: Catálogo e trilhas de aprendizagem
domain: learn
subdomain: catalog
status:
  discovery: MAPPED
  implementation: IMPLEMENTED
  test: TESTED
  verification: PARTIAL
  human_review: NOT REQUIRED
  deployment: NOT VERIFIED
  publication: NOT APPLICABLE
---

# FEAT-LEARN-001 — Catálogo e trilhas

## Resumo
Expõe categorias, módulos e aulas publicadas, com contagem de aulas e ordenação. O
frontend separa “mercado financeiro” (categorias exceto `cripto`) de “Bitcoin”
(categoria `cripto`).

## Frontend
| Item | Referência |
|---|---|
| Mapa | `frontend/app/app/aprender/page.tsx` |
| Módulo | `frontend/app/app/aprender/modulo/[slug]/page.tsx` |
| Mercado | `frontend/app/app/mercado-financeiro/page.tsx` |
| Bitcoin | `frontend/app/app/bitcoin/page.tsx` |
| Componentes | `LearningTrackList`, `LevelCards`, `PageHeader`, `ProgressBar` |

## API
| Método/path | Controller → Service | DTO | Auth |
|---|---|---|---|
| `GET /api/v1/content/categories` | `ContentController.categories` → `ContentService.catalog` | — → `List<CategoryView>` | público |
| `GET /api/v1/content/modules/{slug}` | `module` → `ContentService.module` | — → `ModuleDetail` | público |

## Backend
- `ContentService.catalog`: categorias ordenadas; módulos por categoria; `lessonCount` só
  de aulas publicadas.
- `ContentService.module`: módulo por slug; categoria; aulas publicadas ordenadas.
- `ContentSeedService`: seed idempotente de 8 categorias, 12 módulos, 31 aulas e 6 artigos.
- Aulas não publicadas não aparecem no catálogo/módulo.

## Database
`categories`, `modules`, `lessons` (V1). Relações `modules.category_id → categories`,
`lessons.module_id → modules`. Ordenação por `display_order`.

## Security
- Público por `SecurityConfig` (`/api/v1/content/**`).
- Nenhum dado de usuário; sem ownership.
- Conteúdo é somente leitura via API; seed é a escrita.

## Tests
| Teste | Cobertura |
|---|---|
| `MvpFlowIntegrationTest` | `GET /content/categories` retorna 8 categorias |
| seed/build | contagens verificadas: 8/12/31/62/6 |
| **módulo/ordenação** | sem teste dedicado |

## Dependencies
`FEAT-LEARN-002/003`; `PROGRESS-001` usa `ContentCatalog.publishedLessons`. Usa
`ContentSeedService`.

## Evidence / limitations
- Verificado: categorias no fluxo integrado; contagens no seed; build.
- Não verificado: módulo específico, ordenação, aulas não publicadas, UI E2E.

## Change impact
Alterar seed/slug/ordem afeta navegação, progresso, quiz e URLs de aula; slugs são
referências estáveis.

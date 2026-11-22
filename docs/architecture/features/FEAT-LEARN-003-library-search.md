---
feature_id: FEAT-LEARN-003
name: Biblioteca, artigos e busca
domain: learn
subdomain: library
status:
  discovery: MAPPED
  implementation: IMPLEMENTED
  test: NOT VERIFIED
  verification: PARTIAL
  human_review: NOT REQUIRED
  deployment: NOT VERIFIED
  publication: NOT APPLICABLE
---

# FEAT-LEARN-003 — Biblioteca, artigos e busca

## Resumo
Lista artigos publicados, renderiza Markdown e permite busca textual por aulas e artigos.
A busca é usada na página de aprendizagem; a biblioteca tem lista e detalhe.

## Frontend
| Item | Referência |
|---|---|
| Lista | `frontend/app/app/biblioteca/page.tsx` |
| Detalhe | `frontend/app/app/biblioteca/[slug]/page.tsx` |
| Busca | `frontend/app/app/aprender/page.tsx` (`?q=`) |
| Markdown | `frontend/components/markdown.tsx` |

## API
| Método/path | Controller → Service | DTO | Auth |
|---|---|---|---|
| `GET /api/v1/content/articles` | `ContentController.articles` → `ContentService.articleList` | — → `List<ArticleSummary>` | público |
| `GET /api/v1/content/articles/{slug}` | `article` → `ContentService.article` | — → `ArticleDetail` | público |
| `GET /api/v1/content/search?q=` | `search` → `ContentService.search` | `q` (2–80) → `SearchResults` | público |

## Backend
- `articleList`: apenas `published=true`, ordenados por `publishedAt` desc.
- `article`: `slug` + published; categoria opcional.
- `search`: mínimo 2 caracteres; consultas `searchPublished` em lessons/articles;
  retorna listas vazias para termo curto.
- `ArticleRepository.searchPublished` e `LessonRepository.searchPublished` usam JPQL.

## Database
`articles` (slug, título, `content_md`, source, published, reading_minutes), `categories`
(opcional), `lessons` para busca. Migrations V1.

## Security
- Público; conteúdo somente leitura.
- Artigos não publicados não são retornados.
- Sem sanitização server-side do Markdown; o frontend usa `react-markdown` + `remark-gfm`.
  XSS depende da política do renderer (sem `rehype-raw`).

## Tests
Nenhum teste backend para artigos/busca; nenhum teste frontend para as páginas.
Cobertura atual: build/TypeScript apenas.

## Dependencies
`FEAT-LEARN-001`; `articles`, `categories`, `lessons`.

## Evidence / limitations
- **NOT VERIFIED** funcionalmente: lista/detalhe/busca não têm teste.
- Não verificado: artigo não publicado, busca vazia/curta, Markdown malicioso, links,
  paginação (não existe), UI E2E.

## Change impact
Alterar DTO de artigo/search afeta biblioteca e busca; conteúdo é referência pública.

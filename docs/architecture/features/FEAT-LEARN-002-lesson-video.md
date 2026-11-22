---
feature_id: FEAT-LEARN-002
name: Aula e vídeo
domain: learn
subdomain: lesson
status:
  discovery: MAPPED
  implementation: IMPLEMENTED
  test: TESTED
  verification: PARTIAL
  human_review: NOT REQUIRED
  deployment: NOT VERIFIED
  publication: NOT APPLICABLE
---

# FEAT-LEARN-002 — Aula e vídeo

## Resumo
Exibe o conteúdo Markdown da aula, artigos relacionados, metadados e o vídeo (URL assinada
ou fallback demo/externa). A conclusão da aula é feature separada.

## Frontend
| Item | Referência |
|---|---|
| Página | `frontend/app/app/aprender/aula/[slug]/page.tsx` |
| Vídeo | `LessonVideo` na mesma página |
| Componentes | `Badge`, `Alert`, `Disclaimer`, `Spinner` |

## API
| Método/path | Controller → Service | DTO | Auth |
|---|---|---|---|
| `GET /api/v1/content/lessons/{slug}` | `ContentController.lesson` → `ContentService.lesson` | — → `LessonDetail` | público |
| `GET /api/v1/content/lessons/{slug}/video` | `VideoController.playback` → `VideoService.playbackBySlug` | — → `VideoView` | público |

## Backend
- `ContentService.lesson`: aula publicada por slug; módulo/categoria; artigos relacionados
  por **categoria** (não pela tabela `lesson_articles`).
- `VideoService.playbackBySlug`: resolve aula; procura `video_assets` `PUBLISHED`; tenta
  Supabase Storage (URL assinada), depois `external_url`, depois `VIDEO_DEMO_URL`; senão 404.
- Não expõe `storage_path` na resposta pública.

## Database
`lessons` (conteúdo, published), `video_assets` (`storage_path`, `status`, `mime`,
`external_url`), `articles`/`categories` para relacionados. `lesson_articles` existe, mas
**não é usada** pelo código.

## Security
- Conteúdo/vídeo público; URL assinada de curta duração (default 3600 s).
- Service role key do Supabase só no servidor.
- Fallback `external_url`/demo pode expor URL externa configurada; não é upload público.

## Tests
| Teste | Cobertura |
|---|---|
| `MvpFlowIntegrationTest` | `GET /content/lessons/por-que-educacao-financeira` |
| **vídeo** | sem teste |
| **artigos relacionados** | sem teste |

## Dependencies
`FEAT-LEARN-001`; `INT-03` (Supabase) opcional; `video_assets`, `lessons`.

## Evidence / limitations
- Verificado: aula pública no fluxo integrado; build/TS.
- Não verificado: playback real, URL assinada, MIME, vídeo demo, artigos relacionados,
  UI E2E. A tabela `lesson_articles` é órfã.

## Change impact
Alterar `LessonDetail`/video afeta aula, quiz (busca lesson), progresso e player.

---
feature_id: FEAT-ADMIN-001
name: Upload e administração de vídeo
domain: admin
subdomain: video-admin
status:
  discovery: MAPPED
  implementation: IMPLEMENTED
  test: NOT VERIFIED
  verification: NOT VERIFIED
  human_review: NOT REQUIRED
  deployment: NOT VERIFIED
  publication: NOT APPLICABLE
---

# FEAT-ADMIN-001 — Upload/admin de vídeo

## Resumo
Permite que `ADMIN` envie um vídeo para uma aula e liste os assets. O upload valida MIME,
assinatura de container e tamanho; grava no Supabase Storage e publica metadados. Não há
página administrativa no frontend atual.

## Frontend
Nenhum consumidor. Não existe rota `/app/admin`, formulário de upload ou chamada a
`/api/v1/admin/**` em `frontend/**`.

## API
| Método/path | Controller → Service | DTO | Auth |
|---|---|---|---|
| `POST /api/v1/admin/videos/{lessonId}` | `VideoController.upload` → `VideoService.upload` | multipart `file` → `VideoAdminView` | `ROLE_ADMIN` |
| `GET /api/v1/admin/videos` | `list` → `VideoService.list` | — → `List<VideoAdminView>` | `ROLE_ADMIN` |
| `GET /api/v1/content/lessons/{slug}/video` | `playback` (consumidor público) | — → `VideoView` | público |

## Backend
- `VideoService.upload`: valida aula, arquivo não vazio, tamanho máximo
  (`VIDEO_MAX_UPLOAD_BYTES`, default 50 MiB), MIME (`video/mp4|webm|quicktime`) e
  assinatura (`ftyp`/WebM magic); exige Supabase configurado.
- Caminho `videos/{lessonId}/{uuid}.{ext}`; upload com `x-upsert:false`; grava
  `video_assets.status=PUBLISHED`.
- `list`: todos os assets, ordem de criação desc.
- `playback`: URL assinada; fallback `external_url`/demo.

## Database
`video_assets` (V1 + `external_url` V3): lesson_id, storage_path, status, mime, size,
duration, external_url. Unique lesson/storage_path; check de status.

## Security
- Path `/api/v1/admin/**` exige `ROLE_ADMIN` (role lida do banco).
- Service role key do Supabase só no servidor.
- Upload valida tipo/assinatura/tamanho; não há antivírus/scan de conteúdo.
- Sem UI, o fluxo não foi exercitado ponta a ponta.

## Tests
Nenhum teste para upload/list/playback. `SecretsScanTest` cobre segredos, não upload.

## Dependencies
`FEAT-LEARN-001` (lesson), `INT-03` (Supabase Storage), `video_assets`; `FEAT-LEARN-002`
consome o playback.

## Evidence / limitations
- **IMPLEMENTED**, **NOT VERIFIED**: sem UI, credenciais, teste de upload real ou
  autorização ADMIN exercitada.
- Não verificado: MIME real, arquivo grande, path traversal, storage, URL assinada,
  listagem, vídeo publicado aparecendo na aula.

## Change impact
Alto em segurança/storage; qualquer alteração exige teste de autorização e validação de
arquivo. Não há UI para regressão visual.

# RELATÓRIO — MISSÃO COMPLEMENTAR (FIREBASE + MCP CAPCUT + VECTCUTAPI)

> **Atualização S2.8 (22/11/2026):** relatório histórico. Estado atual: V1-V7, 63 testes, RLS per-user; a V7 é local e ainda não foi aplicada no Lab. Ver docs/verification/S2.8/S2.8_DATABASE_FUNCTION_HARDENING_REPORT.md.

**Data:** 21/11/2026
**Escopo:** avaliar Firebase, automação CapCut e montagem programática com
VectCutAPI sem interromper o MVP, sem migrar o banco e sem substituir
autenticação.
**Veredito:** nenhuma integração Firebase foi habilitada. O MCP CapCut foi
instalado de forma local/endurecida e o VectCutAPI foi adicionado em diretório
isolado para montar drafts. Dois pilotos 9:16 foram validados; o piloto 02
(diversificação, 51,1 s) foi reaberto após o save e inspecionado em 52 amostras
visuais. A exportação do MP4 e o upload continuam dependendo de intervenção
humana/credenciais; o piloto 02 está **CONCLUÍDO COM RESSALVAS**.

---

## 1. O que foi pesquisado

### Firebase

- Planos Spark e Blaze, preços e quotas oficiais (20/11/2026).
- Firebase Hosting, Authentication, Cloud Storage, Analytics, App Check e
  Crashlytics.
- Comparação com Supabase Free/Pro e com a arquitetura atual.
- Requisito de Blaze para Cloud Storage for Firebase.
- Limitação de Crashlytics para web.
- Limite de 50 MB por arquivo no Supabase Storage Free.

### CapCut

- Versão local (9.8.0.4213, atualizada de 9.6.0.4097).
- Formato do draft (`draft_content.json`, `version=360000`, `new_version=189.0.0`).
- MCPs comunitários: `JmsLdrn/capcut-mcp` (MIT), `Atx-Guy/capcut-mcp-server`,
  `mrbuslov/capcut-ai-editor`, `pyCapCut`, `pyJianYingDraft`, entre outros.
- Licença, dependências, código, scripts de instalação e riscos do escolhido.
- Limitações de exportação automática e de texto nativo.
- VectCutAPI: instalação isolada, perfil `capcut_modern` para CapCut 9.8,
  bloqueio de mídia remota, save local e correção de legenda vertical.
- Interoperabilidade: VectCutAPI monta o draft; CapCut MCP lê, valida e salva;
  CapCut abre para conferência visual.

---

## 2. O que foi instalado

| Item | Local | Observação |
|---|---|---|
| MCP CapCut endurecido | `%LOCALAPPDATA%\InvestFacil\capcut-mcp` | clone MIT commit `50beafd`; `npm ci --ignore-scripts`; patches locais |
| Wrapper | `...\capcut-mcp\run-capcut-mcp.cmd` | define drafts/ffmpeg e inicia stdio |
| Config OpenCode | `~/.config/opencode/opencode.json` | entradas `capcut` e `vectcut-api`; backup em `_audit` |
| Config Gemini/Antigravity | `~/.gemini/config/mcp_config.json` | entrada `capcut`; backup em `_audit` |
| VectCutAPI | `%LOCALAPPDATA%\InvestFacil\tools\VectCutAPI` | venv Python 3.12.8; 11 ferramentas MCP; sem OSS/upload |
| Piloto 02 | `content/pilots/02-diversificacao` | 51,1 s, 3 slides, narração TTS e 12 legendas revisadas |
| Nenhum SDK/plano Firebase | — | nenhum cartão associado |

Nenhum script remoto foi executado; dependências foram instaladas com
`--ignore-scripts`. O CapCut não foi modificado.

---

## 3. O que realmente funcionou

- Consulta às fontes oficiais e decisão de **não** integrar Firebase.
- Ajuste do limite de upload do backend para **50 MB** (compatível com Supabase
  Free), configurável por env.
- Cliente MCP conectou ao servidor e listou **17 ferramentas**.
- `capcut_list_drafts` retornou os projetos locais.
- Draft descartável `if_mcp_smoke`: clone + vídeo + validação + save; CapCut
  reconheceu o projeto.
- Draft piloto `investfacil_piloto`: 33 s, 1080×1920, 3 slides + narração,
  `capcut_validate` **ok: true**; CapCut adicionou ao `root_meta_info.json`.
- VectCutAPI: `initialize`/`tools/list` com 11 ferramentas; criação de draft com
  3 imagens, áudio e SRT; bloqueio de URL remota confirmado.
- Draft piloto `if_piloto_diversificacao`: 51,1 s, 1080×1920, 3 imagens, 1 áudio
  e 12 legendas; reaberto no CapCut 9.8 após o save e conferido em 52 amostras.
- CapCut MCP leu o piloto 02 (3 vídeos, 1 áudio, 12 textos), validou
  `ok: true` e salvou o draft.
- O áudio do draft era um WAV renomeado como `.mp3`; foi convertido para MP3
  real (~160 kbps efetivos) e validado com `ffprobe` (51,147 s, mono, 22,05 kHz).
- `opencode mcp list` mostrou `capcut` e `vectcut-api` **connected**.
- Hash do `1023` original idêntico ao backup (não foi alterado).
- Build/testes do backend continuam verdes (**28 testes**).

---

## 4. O que foi testado (e o que não foi)

| Teste | Resultado |
|---|---|
| MCP stdio + listTools/callTool | **OK** |
| Backup dos drafts | **OK** (zip 61.457 bytes) |
| Clone de draft sem sobrescrever | **OK** |
| Adicionar vídeo/imagem/áudio e salvar | **OK** (validação true) |
| CapCut reconhecer o draft | **OK** (`root_meta_info`) |
| VectCutAPI stdio/JSON-RPC + 11 ferramentas | **OK** |
| VectCutAPI bloqueia mídia remota | **OK** (`VECTCUT_ALLOW_REMOTE_MEDIA=false`) |
| VectCutAPI cria draft com imagem/áudio/SRT | **OK** (piloto 02) |
| CapCut MCP lê/valida/salva draft do VectCutAPI | **OK** (`ok: true`) |
| Corrigir áudio WAV renomeado como `.mp3` | **OK** — MP3 real ~160 kbps; `ffprobe` 51,147 s |
| `opencode mcp list` | **OK** (`capcut` e `vectcut-api` connected) |
| Abrir visualmente a timeline do piloto 01 | **Parcial** — projeto listado; captura/foco de janela impediu confirmação inequívoca |
| Abrir visualmente a timeline do piloto 02 | **OK (pós-save)** — 52 amostras cobrindo 0–51 s |
| Reabrir o piloto 02 depois do save do CapCut MCP | **OK** — cena 1, timeline e estrutura confirmadas |
| Exportar MP4 pelo CapCut | **Pendente (manual)** — sem CLI; editor deixado pronto |
| Verificar MP4 com `scripts/verify-mp4.py` | **Preparado** — aguarda o arquivo exportado |
| Upload para Supabase | **Não executado** — sem credenciais |
| Firebase Storage/Blaze | **Não habilitado** — exige cartão |
| Firebase Hosting/SSR | **Não usado** — Spark é estático; Vercel é melhor |
| Crashlytics web | **Não aplicável** |

---

## 5. O que depende de intervenção humana

1. Abrir `investfacil_piloto` no CapCut em primeiro plano e conferir a timeline.
2. Exportar o MP4 do piloto 02 (editor aberto no início) e rodar
   `scripts/verify-mp4.py`.
3. Fazer a escuta humana da narração e ajustar TTS/SRT se necessário.
4. Exportar o MP4 do piloto 01 e revisar os dois arquivos no celular.
5. Provisionar Supabase e enviar o vídeo via `POST /api/v1/admin/videos/{id}`.
6. Validar reprodução no frontend em desktop/mobile.
7. Decidir se quer Firebase Analytics/App Check no futuro (com consentimento).
8. Autorizar push/merge/deploy.

---

## 6. Custos e limites

| Item | Custo | Limite |
|---|---|---|
| Firebase Spark | R$ 0 | Hosting 10 GB/360 MB dia; Storage indisponível; Auth 50K MAU |
| Firebase Blaze | Pago por uso | Exige cartão; Storage 5 GB/100 GB egress (3 regiões) |
| Supabase Free | R$ 0 | 500 MB DB, 1 GB storage, 5 GB egress, 50 MB/arquivo, pausa 1 semana |
| Supabase Pro | US$ 25+/mês | 100 GB storage/250 GB egress, spend cap |
| CapCut | R$ 0 (versão atual) | Pro/Ultra não adquirido |
| MCP CapCut | R$ 0 | MIT; roda local; sem export automático |
| VectCutAPI | R$ 0 | open source; roda local; sem OSS/upload |

Nenhum cartão foi associado; nenhum plano pago foi ativado.

---

## 7. Próximos passos

1. Exportar o MP4 do piloto 02 manualmente e rodar `scripts/verify-mp4.py`.
2. Fazer a escuta humana da narração e revisar o TTS/SRT se necessário.
3. Exportar o piloto 01 e subir os MP4s no Storage para testar o player.
4. Criar template de texto no CapCut se `capcut_add_text` for necessário.
4. Evoluir o pipeline com voz humana e revisão editorial.
5. Só considerar Firebase Storage se o egress do Supabase for o gargalo e houver
   orçamento/cartão aprovado.

## 8. Evidências

- `docs/FIREBASE_EVALUATION.md`
- `docs/CAPCUT_MCP_SETUP.md`
- `docs/VECTCUTAPI_INTEGRATION.md`
- `docs/CONTENT_PIPELINE.md`
- `content/pilots/01-volatilidade/**`
- `content/pilots/02-diversificacao/**`
- `content/templates/**`
- `scripts/generate-pilot-assets.ps1`
- `scripts/generate-pilot02-assets.py`
- `scripts/generate-pilot02-narration.ps1`
- `scripts/verify-mp4.py`
- `_audit/missao03-*.txt` e `_audit/missao03-*.png`
- `_audit/capcut-drafts-backup-20261120.zip`
- `_audit/capcut-mcp-src/` e `%LOCALAPPDATA%\InvestFacil\capcut-mcp`
- `%LOCALAPPDATA%\InvestFacil\tools\VectCutAPI`
- `_audit/vectcut-build-pilot02.py` e logs de execução
- `_audit/capcut-editor-pilot02-retry.png`, `_audit/capcut-scene2b.png`,
  `_audit/capcut-scene3-42s.png`
- `_audit/opencode-config-backup-20261120.json`
- `_audit/gemini-mcp-config-backup-20261120.json`

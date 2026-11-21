# RELATÓRIO — MISSÃO COMPLEMENTAR (FIREBASE + MCP CAPCUT)

**Data:** 20/11/2026
**Escopo:** avaliar Firebase e automação CapCut sem interromper o MVP, sem migrar
o banco e sem substituir autenticação.
**Veredito:** nenhuma integração Firebase foi habilitada; o MCP CapCut foi
instalado de forma local/endurecida e validado em um draft piloto. A exportação
final e o upload continuam dependendo de intervenção humana/credenciais.

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

---

## 2. O que foi instalado

| Item | Local | Observação |
|---|---|---|
| MCP CapCut endurecido | `%LOCALAPPDATA%\InvestFacil\capcut-mcp` | clone MIT commit `50beafd`; `npm ci --ignore-scripts`; patches locais |
| Wrapper | `...\capcut-mcp\run-capcut-mcp.cmd` | define drafts/ffmpeg e inicia stdio |
| Config OpenCode | `~/.config/opencode/opencode.json` | entrada `capcut`; backup em `_audit` |
| Config Gemini/Antigravity | `~/.gemini/config/mcp_config.json` | entrada `capcut`; backup em `_audit` |
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
| Abrir visualmente a timeline do piloto | **Parcial** — projeto listado; captura/foco de janela impediu confirmação inequívoca |
| Exportar MP4 pelo CapCut | **Não automatizado** — sem CLI; manual |
| Upload para Supabase | **Não executado** — sem credenciais |
| Firebase Storage/Blaze | **Não habilitado** — exige cartão |
| Firebase Hosting/SSR | **Não usado** — Spark é estático; Vercel é melhor |
| Crashlytics web | **Não aplicável** |

---

## 5. O que depende de intervenção humana

1. Abrir `investfacil_piloto` no CapCut em primeiro plano e conferir a timeline.
2. Substituir o TTS por narração humana revisada e revisar o SRT.
3. Exportar o MP4 (≤ 50 MB) manualmente.
4. Provisionar Supabase e enviar o vídeo via `POST /api/v1/admin/videos/{id}`.
5. Validar reprodução no frontend em desktop/mobile.
6. Decidir se quer Firebase Analytics/App Check no futuro (com consentimento).
7. Autorizar push/merge/deploy.

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

Nenhum cartão foi associado; nenhum plano pago foi ativado.

---

## 7. Próximos passos

1. Validar visualmente o piloto e exportá-lo.
2. Subir o MP4 no Storage e testar o player no Invest Fácil.
3. Criar template de texto no CapCut para habilitar `capcut_add_text`.
4. Evoluir o pipeline com voz humana e revisão editorial.
5. Só considerar Firebase Storage se o egress do Supabase for o gargalo e houver
   orçamento/cartão aprovado.

## 8. Evidências

- `docs/FIREBASE_EVALUATION.md`
- `docs/CAPCUT_MCP_SETUP.md`
- `docs/CONTENT_PIPELINE.md`
- `content/pilots/01-volatilidade/**`
- `content/templates/**`
- `scripts/generate-pilot-assets.ps1`
- `_audit/capcut-drafts-backup-20261120.zip`
- `_audit/capcut-mcp-src/` e `%LOCALAPPDATA%\InvestFacil\capcut-mcp`
- `_audit/opencode-config-backup-20261120.json`
- `_audit/gemini-mcp-config-backup-20261120.json`

# CAPCUT MCP — SETUP E VALIDAÇÃO

**Data:** 20/11/2026
**Objetivo:** avaliar automação segura de vídeos no CapCut desktop (Windows) e
produzir um piloto educativo para o Invest Fácil.
**Resultado:** MCP comunitário **MIT** avaliado, endurecido e conectado; draft
piloto de **33 s, 9:16, 3 slides + narração** criado e validado. A abertura visual
da timeline no CapCut foi **parcialmente** verificada (o projeto foi reconhecido e
listado; a captura da timeline foi prejudicada por modais/foco de janela).

---

## 1. Ambiente real encontrado

| Item | Valor |
|---|---|
| CapCut instalado | `%LOCALAPPDATA%\CapCut\Apps\9.8.0.4213\CapCut.exe` (atualizado de 9.6.0.4097 durante a sessão) |
| Drafts | `%LOCALAPPDATA%\CapCut\User Data\Projects\com.lveditor.draft` |
| Projetos existentes | `1023` (original preservado) e `1120` (apareceu durante a exploração de UI; não foi apagado) |
| Formato do draft | `draft_content.json`; `version=360000`, `new_version=189.0.0`; canvas observado 1920×1080 |
| ffmpeg do CapCut | existe, mas o build é uma biblioteca (`--disable-ffmpeg/--disable-ffprobe`); não serve como CLI de edição |
| ffprobe no PATH | **não existe** |
| Node | 26.13.0 |
| Backup dos drafts | `_audit\capcut-drafts-backup-20261120.zip` (61.457 bytes; criado antes de qualquer escrita) |

O projeto `1023` **não foi alterado**: o SHA-256 de `draft_content.json` no
workspace é `6454EA7F…AFE06D`, idêntico ao arquivo dentro do backup criado antes
das operações. Os drafts novos são `investfacil_piloto` (piloto) e
`if_mcp_smoke` (descartável), criados por cópia a partir de `1023` e claramente
nomeados.

---

## 2. MCPs comunitários avaliados

| Projeto | Licença | Sinais | Decisão |
|---|---|---|---|
| **JmsLdrn/capcut-mcp** | MIT | 17 ferramentas; Node 18+; clone-from-template; backup `.mcpbak`; validação; commits até 08/2026; 26 stars/21 forks no momento | **Selecionado, com hardening local** |
| Atx-Guy/capcut-mcp-server | não verificada em detalhe | Alternativa; menos evidência de manutenção | Não usado |
| mrbuslov/capcut-ai-editor | não verificada em detalhe | Foco em “talking head”/legendas | Não usado |
| pyCapCut/pyJianYingDraft | open source | Foco JianYing/CapCut chinês; formato muda | Não usado |
| MCPs que dependem de automação de UI | variadas | Frágil, difícil de auditar, pode clicar em projetos errados | Rejeitados |

### 2.1 Origem e código

- Repositório: <https://github.com/JmsLdrn/capcut-mcp>
- Commit auditado: `50beafd` (release v0.1.0)
- Licença: MIT (arquivo `LICENSE` presente)
- Dependências declaradas: `@modelcontextprotocol/sdk` e `zod` (lockfile presente)
- Sem script de pós-instalação; instalamos com `npm ci --ignore-scripts`.
- O servidor é stdio local, sem chamadas HTTP de runtime.

### 2.2 Riscos encontrados no upstream e correções locais

| Risco | Correção no clone endurecido |
|---|---|
| `execSync` com caminho de mídia interpolado em shell (injeção) | `execFileSync` com argumentos, sem shell |
| Dependência de `ffprobe` inexistente | probe via `ffmpeg -i` do CapCut, com `FFMPEG_PATH`; fallback seguro |
| Nome de draft poderia conter `../` e escapar da pasta | validação de nome + `path.resolve` deve começar em `DRAFTS_DIR` |
| `cloneDraft` podia sobrescrever destino | recusa se existir; `fs.cpSync` recursivo e `errorOnExist` |
| `cloneDraft` copiava só arquivos (perdia subpastas) | cópia recursiva |
| Meta do clone ficava com nome/ID antigos | atualiza `draft_name`, `draft_fold_path`, `draft_id`, timestamps e duração |
| `validate` não checava áudio | checa `videos` e `audios` |
| Clone vazio perdia templates | cachear templates antes de limpar a timeline |
| `addTrack('audio')` criava track com tipo errado | força `tk.type = type` |
| Texto depende de draft com camada de texto | limitação mantida e documentada |

O clone endurecido está em:

```
C:\Users\gabri\AppData\Local\InvestFacil\capcut-mcp
```

Configuração OpenCode (backup em `_audit/opencode-config-backup-20261120.json`):

```json
"capcut": {
  "type": "local",
  "command": ["C:/Users/gabri/AppData/Local/InvestFacil/capcut-mcp/run-capcut-mcp.cmd"],
  "cwd": "C:/Users/gabri/AppData/Local/InvestFacil/capcut-mcp",
  "codemode": false,
  "timeout": { "startup": 120000, "catalog": 60000 }
}
```

O wrapper define `CAPCUT_DRAFTS_DIR`, `FFMPEG_PATH` e `CAPCUT_TEMPLATE_DRAFT`
(sem segredo) e inicia `node src/server.js`.

---

## 3. Validação prática

### 3.1 Conexão MCP

Cliente SDK (`test-client.mjs`) conectou ao servidor stdio e listou:

```
capcut_list_drafts, capcut_read_timeline, capcut_clone_draft,
capcut_add_video, capcut_add_image, capcut_add_audio, capcut_add_text,
capcut_add_track, capcut_move_segment, capcut_trim_segment,
capcut_split_segment, capcut_delete_segment, capcut_set_props,
capcut_raw_patch, capcut_validate, capcut_save, capcut_discard
```

O `capcut_list_drafts` retornou `1023`, `1120`, `if_mcp_smoke` e
`investfacil_piloto`. O `capcut_validate` do piloto retornou `ok: true`, sem
issues/warnings.

### 3.2 Draft descartável

- `if_mcp_smoke` foi clonado de `1023`.
- Adicionado `example.mp4` em uma nova track.
- `capcut_validate` → `ok: true`.
- `capcut_save` → backup `.mcpbak` + escrita atômica.
- O CapCut reconheceu o projeto na lista (`root_meta_info.json`) e ele apareceu
  em **Projetos** na tela inicial.
- **Limitação:** a abertura da timeline não foi confirmada de forma inequívoca;
  a automação de clique abriu outro projeto (`1120`) enquanto um modal promocional
  cobria a tela. O `1120` foi preservado, não apagado.

### 3.3 Piloto educativo

| Item | Valor |
|---|---|
| Draft | `investfacil_piloto` |
| Canvas | 1080×1920 (9:16) |
| Duração | 33 s |
| Vídeo | 3 slides PNG (11 s cada) |
| Áudio | narração TTS pt-BR (`Microsoft Maria Desktop`), 32,55 s |
| Validação | `ok: true` |
| Backup | `.mcpbak` + backup geral em `_audit` |
| Reconhecimento | CapCut adicionou o draft ao `root_meta_info.json` |
| Abertura visual | **parcialmente verificada** (projeto listado; timeline não capturada por foco/modal) |

Assets e roteiro: `content/pilots/01-volatilidade/`.
Geração reproduzível dos slides/narração: `scripts/generate-pilot-assets.ps1`.

### 3.4 O que **não** foi validado

- Exportação automática do vídeo: o CapCut não expõe CLI de export; a exportação
  é manual (ou por UI automation, que não foi usada).
- Texto nativo no draft: `capcut_add_text` exige um draft com camada de texto;
  não havia um template confiável, então o texto foi **queimado nos PNGs**.
- Efeitos, transições e animações ricas: melhor esforço, não validados.
- Abertura visual da timeline do piloto: apenas reconhecimento/listagem.

---

## 4. Limitações e riscos

1. **Formato proprietário e mutável.** O CapCut pode mudar o schema; mantenha
   backups e revalide após updates.
2. **Sem export automatizado.** O MCP monta o draft; a exportação final é manual.
3. **Texto nativo** requer um draft template com text layer; não criamos um
   template artificial para não arriscar corromper o formato.
4. **Áudio TTS** é local (SAPI), não é narração humana; bom para protótipo, mas a
   versão final deve ter revisão de voz/pronúncia.
5. **UI automation** não foi usada para clicar/exportar; é frágil e pode abrir o
   projeto errado.
6. **Billing/capcut**: CapCut é gratuito para o uso atual; recursos “Pro”/Ultra
   não foram adquiridos. Nenhum cartão foi associado.

---

## 5. Como reproduzir

```powershell
# 1. Fechar o CapCut (o save recusa com ele aberto)
Get-Process CapCut -ErrorAction SilentlyContinue | Stop-Process

# 2. Backup dos drafts
Compress-Archive -Path "$env:LOCALAPPDATA\CapCut\User Data\Projects\com.lveditor.draft" `
  -DestinationPath "_audit\capcut-backup.zip" -Force

# 3. Servidor MCP endurecido (já instalado)
$env:CAPCUT_DRAFTS_DIR="$env:LOCALAPPDATA\CapCut\User Data\Projects\com.lveditor.draft"
$env:FFMPEG_PATH="$env:LOCALAPPDATA\CapCut\Apps\9.8.0.4213\ffmpeg.exe"
node "$env:LOCALAPPDATA\InvestFacil\capcut-mcp\src\server.js"

# 4. Teste de conexão (em outro terminal, no diretório do clone)
node test-client.mjs
```

Ao usar em um cliente MCP, reinicie o cliente para carregar a configuração.

---

## 6. Limpeza dos drafts de teste

Com o CapCut fechado, os drafts **criados nesta missão** podem ser removidos:

```powershell
$root="$env:LOCALAPPDATA\CapCut\User Data\Projects\com.lveditor.draft"
Remove-Item -Recurse -Force "$root\if_mcp_smoke"
Remove-Item -Recurse -Force "$root\investfacil_piloto"
```

**Não apague** `1023` nem `1120` sem autorização do proprietário. O backup
`_audit\capcut-drafts-backup-20261120.zip` permite restaurar o estado anterior.

## 7. Próximos passos

1. Criar um draft template com uma camada de texto revisada no CapCut e definir
   `CAPCUT_TEMPLATE_DRAFT` para habilitar `capcut_add_text`.
2. Adicionar legendas queimadas/importadas e revisar a narração TTS com voz humana.
3. Validar a abertura visual do piloto em um ambiente com CapCut em primeiro plano.
4. Exportar manualmente o piloto e revisar duração/legendas/áudio.
5. Subir o MP4 no Supabase Storage via `POST /api/v1/admin/videos/{lessonId}`.
6. Só depois automatizar lotes; nunca editar `1023` ou outros drafts do usuário.

---

## 8. Configuração para outros clientes

Claude Code / MCP clients que leem `.mcp.json`:

```json
{
  "mcpServers": {
    "capcut": {
      "command": "C:/Users/gabri/AppData/Local/InvestFacil/capcut-mcp/run-capcut-mcp.cmd"
    }
  }
}
```

Antigravity/Gemini (`C:\Users\gabri\.gemini\config\mcp_config.json`) recebeu a
entrada `capcut` ao lado de `blender-mcp`; backup em
`_audit/gemini-mcp-config-backup-20261120.json`. Reinicie o cliente para carregar.

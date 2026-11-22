# AGENT PERMISSION MATRIX — INVEST FÁCIL

**Data:** 21/11/2026
**Fonte:** `opencode debug agents` (lista resolvida), arquivos `.opencode/agents/*.md`,
config global e testes comportamentais registrados em `P0_3_VERIFICATION.md`.
**Runtime:** OpenCode desktop, servidor 2.3.2.

---

## 1. Inventário

| Categoria | Quantidade |
|---|---:|
| Agentes resolvidos | **43** |
| Built-in | 7 |
| Globais customizados | 28 |
| Locais (`.opencode/agents`) | 8 |
| Skills locais | 5 |
| Plugins | 0 |
| MCP servers | 3 |
| Aprovações salvas | 0 |

Built-in: `build`, `plan`, `general`, `explore`, `title`, `summary`, `compaction`.

Famílias globais: AURON (18), Blender (6), Antigravity (1), MCP/uv/Windows (3).

Família local: 8 agentes audiovisuais `if-*`.

---

## 2. Agentes locais — visão por agente

| Agente | Responsabilidade | Read | Edit | Shell | MCP | Rede | Delegar | Risco | Status |
|---|---|---|---|---|---|---|---|---|---|
| `if-quality-control` | Auditoria técnica/visual/sonora/editorial | `video/**`, `docs/**` | relatórios + `evaluation/**` | `ffprobe`/`ffmpeg` | CapCut **read-only** (3 tools) | negada | negado | MEDIUM | **VERIFIED** |
| `if-motion-designer` | Motion, tipografia, storyboard | `video/**`, `docs/**` | `video/src/variants`, `public/variants`, storyboards, relatórios | `ffprobe`/`ffmpeg` | negado | negada | negado | MEDIUM | **VERIFIED** |
| `if-sound-designer` | Voz, música, SFX, mixagem | `video/**`, `docs/**` | `assets/audio`, `scripts/audio`, relatórios | `ffprobe`/`ffmpeg` | negado | negada | negado | MEDIUM | **VERIFIED** |
| `if-video-editor` | Ritmo, cortes, continuidade, EDL | `video/**`, `docs/**` | relatórios | `ffprobe`/`ffmpeg` | negado | negada | negado | MEDIUM | **VERIFIED** |
| `if-creative-director` | Conceito, metáfora, arco emocional | `video/**`, `docs/**`, README/CLAUDE | relatórios | negado | negado | negada | negado | LOW | **VERIFIED** |
| `if-retention-specialist` | Atenção, loops, ritmo | `video/**`, `docs/**` | relatórios | negado | negado | negada | negado | LOW | **VERIFIED** |
| `if-storyteller` | Roteiro, arco, curiosity gap | `video/**`, `docs/**` | storyboards, relatórios | negado | negado | negada | negado | LOW | **VERIFIED** |
| `if-traffic-strategist` | Plataforma, público, CTA | `video/**`, `docs/**` | relatórios | negado | negado | negada | negado | LOW | **VERIFIED** |

"Status VERIFIED" = o padrão default-deny + paths + shell foi exercitado em teste
comportamental com o próprio agente (positivo e negativo). Não significa que todas as
ferramentas de terceiros foram testadas.

---

## 3. Matriz por ação e agente

Legenda: **A** = allow; **D** = deny; **I** = capacidade indireta; **NV** = não verificável
(ferramenta ausente); **NA** = não aplicável.

| Ação | QC | Motion | Sound | Editor | Creative | Retention | Storyteller | Traffic |
|---|---|---|---|---|---|---|---|---|
| Ler `video/**`, `docs/**` | A | A | A | A | A | A | A | A |
| Ler `backend/**`/`.opencode/**` | D | D | D | D | D | D | D | D |
| Editar diretório próprio | A | A | A | A | A | A | A | A |
| Editar fora do escopo | D | D | D | D | D | D | D | D |
| Executar `ffprobe`/`ffmpeg` | A | A | A | A | NV | NV | NV | NV |
| Executar shell arbitrário | D | D | D | D | NV | NV | NV | NV |
| Rede (webfetch/websearch/browser) | D (web) / NV (browser) | D (web) / NV (browser) | D (web) / NV (browser) | D (web) / NV (browser) | D (web) / NV (browser) | D (web) / NV (browser) | D (web) / NV (browser) | D (web) / NV (browser) |
| Banco de dados | D | D | D | D | D | D | D | D |
| Delegar | D | D | D | D | D | D | D | D |
| Deploy | D | D | D | D | D | D | D | D |
| Publicar | D | D | D | D | D | D | D | D |
| Excluir/sobrescrever | I (ffmpeg) | I (ffmpeg) | I (ffmpeg) | I (ffmpeg) | D | D | D | D |
| Alterar configurações | D | D | D | D | D | D | D | D |
| MCP não autorizado | D | D | D | D | D | D | D | D |
| `opencode_*` (admin) | D* | D* | D* | D* | D* | D* | D* | D* |

\* O default-deny remove as ferramentas administrativas do toolset; a verificação
comportamental pontual está registrada em `P0_3_VERIFICATION.md` (T-OC).

**Capacidade indireta de exclusão/escrita:** `ffmpeg` pode sobrescrever qualquer mídia que
o usuário do SO possa escrever, mesmo fora do escopo de `edit`. Isso foi comprovado com a
criação de um PNG em `docs/engineering/` pelo QC; o arquivo foi removido. Não há ferramenta
de exclusão textual no toolset local.

**Rede indireta:** `ffmpeg`/`ffprobe` suportam protocolos de rede. Não foi feito teste de
envio externo, por proibição da missão. Tratar como capacidade existente e não contida.

---

## 4. Agentes globais (28) — inventário de risco

Todos herdam a política base `* allow`; nenhum tem default-deny. Portanto, **todos podem
usar MCP, `opencode_*` e browser conforme as regras de sessão**, salvo negação específica.
Nenhum foi alterado nesta missão.

| Agente | Shell | Read | Edit | Web | Risco | Status |
|---|---|---|---|---|---|---|
| `antigravity-integration-specialist` | **allow** | allow | `.gemini/config`, scripts | allow | **HIGH** | PARTIAL |
| `auron-architect` | **ask** + scripts/git | AURON | AURON | allow | **HIGH** | PARTIAL |
| `auron-auditor` | deny + `node *.auron`, `git status` | AURON | relatórios AURON | deny | MEDIUM | **VERIFIED** |
| `auron-research` | deny | AURON | AURON | allow | MEDIUM | PARTIAL |
| `auron-resources` | deny | AURON | AURON | allow | MEDIUM | PARTIAL |
| `auron-archive` | deny | AURON | AURON | deny | MEDIUM | PARTIAL |
| `auron-areas` | deny | AURON | AURON | deny | MEDIUM | PARTIAL |
| `auron-asset-manager` | deny | AURON | AURON | deny | MEDIUM | PARTIAL |
| `auron-css-engineer` | deny | AURON | AURON | deny | MEDIUM | PARTIAL |
| `auron-daily` | deny | AURON | AURON | deny | MEDIUM | PARTIAL |
| `auron-designer` | deny | AURON | AURON | deny | MEDIUM | PARTIAL |
| `auron-goals` | deny | AURON | AURON | deny | MEDIUM | PARTIAL |
| `auron-inbox` | deny | AURON | AURON | deny | MEDIUM | PARTIAL |
| `auron-knowledge` | deny | AURON | AURON | deny | MEDIUM | PARTIAL |
| `auron-memory` | deny | AURON | AURON | deny | MEDIUM | PARTIAL |
| `auron-projects` | deny | AURON | AURON | deny | MEDIUM | PARTIAL |
| `auron-templates` | deny | AURON | AURON | deny | MEDIUM | PARTIAL |
| `auron-ui-architect` | deny | AURON | AURON | deny | MEDIUM | PARTIAL |
| `auron-visual-qa` | deny | AURON | AURON | deny | MEDIUM | PARTIAL |
| `blender-53-compatibility` | **allow** | allow | deny | allow | **HIGH** | PARTIAL |
| `blender-addon-specialist` | **allow** | allow | deny | allow | **HIGH** | PARTIAL |
| `blender-automation-recovery` | **allow** | allow | allow | allow | **HIGH** | PARTIAL |
| `blender-diagnostics-engineer` | **allow** | allow | deny | allow | **HIGH** | PARTIAL |
| `blender-integration-qa` | **allow** | allow | allow | allow | **HIGH** | PARTIAL |
| `blender-mcp-architect` | **allow** | allow | deny | allow | **HIGH** | PARTIAL |
| `mcp-server-engineer` | **allow** | allow | deny | allow | **HIGH** | PARTIAL |
| `uv-packaging-engineer` | **allow** | allow | deny | allow | **HIGH** | PARTIAL |
| `windows-python-specialist` | **allow** | allow | deny | allow | **HIGH** | PARTIAL |

**Achado de capacidade indireta (verificado):** `auron-auditor` teve leitura nativa negada
em `<repo>\backend\pom.xml`, mas leu o mesmo arquivo com
`auron-vault_read_text_file`. O MCP obedece ao próprio root, não às regras nativas. O mesmo
vale para escrita. Isso afeta os 28 globais e o `build`.

---

## 5. Built-in (7)

| Agente | Shell | Read | Edit | Web | Delegação | Risco | Observação |
|---|---|---|---|---|---|---|---|
| `build` | base allow | base allow | base allow | base allow | base allow | **CRITICAL** | Âncora de confiança; browser de sessão; MCP amplo |
| `plan` | base allow | base allow | deny | base allow | base allow | **HIGH** | Só escreve em `~/.opencode/plan`; shell/web amplos |
| `general` | base allow | base allow | base allow | base allow | deny | **HIGH** | Subagente de propósito geral |
| `explore` | **allow** | allow | deny (`* deny`) | allow | deny | **HIGH** | Exploração com shell/web; sem edição |
| `title` | deny (`* deny`) | deny | deny | deny | deny | LOW | Sem ferramentas |
| `summary` | deny (`* deny`) | deny | deny | deny | deny | LOW | Sem ferramentas |
| `compaction` | base allow | base allow | base allow | base allow | base allow | MEDIUM | Interno; não delegável pelo usuário |

---

## 6. Ferramentas

### 6.1 Nativas

| Ferramenta | Categorias | Risco | Observação |
|---|---|---|---|
| `read` | READ | LOW | Imagens/PDF; path-scoped |
| `glob` | READ (nomes) | LOW | Recurso é o padrão; allow por path é limitado |
| `grep` | READ (conteúdo) | MEDIUM | Recurso é a regex, não o path; permitir `*` lê qualquer arquivo |
| `write`/`edit`/`patch` | WRITE | MEDIUM | Mapeiam para a ação `edit` |
| `shell` | EXECUTE/READ/WRITE/NETWORK | HIGH | Sem sandbox; host authority |
| `webfetch`/`websearch` | NETWORK | HIGH | Exfiltração/entrada não confiável |
| `skill` | instruções | LOW | Conteúdo local; não concede permissão |
| `subagent` | DELEGATE | HIGH | Subagente usa as próprias regras |
| `question` | UI | LOW | Pode bloquear agentes não interativos |
| `execute` | meta (Code Mode) | HIGH | `deny` remove o Code Mode |
| `browser_*` | NETWORK/READ/WRITE | HIGH | 45 ferramentas; cliente desktop; indisponível em subagentes |
| `experimental_image_generate` | NETWORK/WRITE | HIGH | Modelo de imagem; não usado |
| `opencode_*` | ADMIN | HIGH | Sessões, worktrees, modelos, recursos MCP |

### 6.2 MCP

| Server | Tools | Categorias | Root | Risco |
|---|---:|---|---|---|
| `auron-vault` | 16 | READ/WRITE/DELETE | config: AURON BRAIN; observado: InvestFacil | **CRITICAL** |
| `capcut` | 17 | READ/WRITE/DELETE/EXECUTE | drafts do CapCut | **HIGH** |
| `vectcut-api` | 11 | WRITE/EXECUTE/NETWORK (remote off) | diretório de output | **HIGH** |

Ferramentas de escrita de alto risco: `auron-vault_write_file`, `auron-vault_edit_file`,
`auron-vault_move_file`, `auron-vault_copy_file`; `capcut_save`, `capcut_delete_segment`,
`capcut_raw_patch`, `capcut_add_*`; `vectcut-api_create_draft`, `save_draft`, `add_*`.

Ferramentas read-only úteis: `auron-vault_read_*`, `capcut_list_drafts`,
`capcut_read_timeline`, `capcut_validate`.

---

## 7. Capacidades indiretas

| Capacidade | Onde | Evidência | Controle |
|---|---|---|---|
| Ler/escrever projeto via MCP, ignorando `read`/`edit` | 28 globais + `build`/`plan`/`general`/`compaction` | `auron-auditor` leu `backend/pom.xml` via MCP após `read` nativo negar | Default-deny nos 8 locais; global não alterado |
| Escrever fora do escopo via `ffmpeg` | 4 agentes de vídeo | PNG criado em `docs/engineering/` pelo QC | Removido; risco documentado |
| Rede via `ffmpeg` | 4 agentes de vídeo | Não testado (proibição de envio externo) | Sem controle técnico |
| Shell interpretado (`node`, `python`, `powershell`) | 10 globais + `build`/`explore` | `shell * allow` na config | Fora do escopo local |
| Escrever drafts fora do projeto via CapCut | globais + `build`; QC read-only | Ferramentas `capcut_save`/`delete` | Negado nos 8 locais |
| Criar/publicar drafts via VectCut | globais + `build` | `save_draft` | Negado nos 8 locais |
| Administração de sessão/worktree | `build` + globais | `opencode_*` na base | Default-deny nos 8 locais |
| Browser/rede | `build` (sessão) | `browser allow` na sessão; subagente recebe erro de conexão, não `permission.rejected` | **NOT VERIFIED** — cliente sem browser conectado |
| Delegação | `auron-architect` (allowlist), `build` | regras `subagent` | Depth 1; locais negam |

---

## 8. Allowlist MCP aplicada (locais)

| Server | QC | Motion | Sound | Editor | Creative | Retention | Storyteller | Traffic |
|---|---|---|---|---|---|---|---|---|
| `auron-vault` | deny | deny | deny | deny | deny | deny | deny | deny |
| `capcut` | 3 read-only | deny | deny | deny | deny | deny | deny | deny |
| `vectcut-api` | deny | deny | deny | deny | deny | deny | deny | deny |

Qualquer ferramenta não listada é removida pelo `* * deny`. Isso foi observado nos testes:
`auron-vault_*` não aparece no toolset dos locais; `capcut_*` só aparece no QC.

---

## 9. Evidência de enforcement

| Classe | Evidência |
|---|---|
| Positivo local | Leitura `video/MEMORY.md`; escrita em relatório/evaluation/scripts/audio; `ffprobe -version`; `capcut_list_drafts` no QC |
| Negativo local | `backend/pom.xml` negado; escrita em `backend/` negada; `git`, `node -e`, `python -c`, `Set-Content` negados; MCP/subagent ausentes |
| Bypass | `ffmpeg` escreveu fora do escopo de `edit` (confirmado); MCP global leu projeto (confirmado); interpretadores negados nos locais |
| Injeção | Fixture fictício não induziu ação; shell negado; escrita não emitida (NOT TESTED no caminho de harness) |
| Admin | `opencode_worktree_remove` exposto, mas chamada negada por `Permission denied: edit`; `opencode_worktree_list`/`session_rename` ausentes |
| Browser | Chamada permitida até a camada de conexão; erro `browser.disconnected`, sem `permission.rejected`; deny `browser_*` não testável sem browser conectado |
| Global | `auron-auditor`: nativo `read` DENY, MCP `read` ALLOW, `git status` ALLOW (regra específica) |

Detalhes, IDs e mensagens em `docs/engineering/P0_3_VERIFICATION.md`.

# AGENT SECURITY POLICY — INVEST FÁCIL

**Data:** 21/11/2026
**Runtime:** OpenCode desktop
**Escopo:** permissões de agentes, shell, MCP, delegação, aprovação humana e prompt injection.
**Status:** **PASS WITH LIMITATIONS** — ver `docs/engineering/P0_3_VERIFICATION.md`.
**Fora de escopo:** agentes globais, configuração global, MCPs, plugins e credenciais não foram alterados.

---

## 1. Runtime e configuração

| Item | Valor observado |
|---|---|
| Cliente | OpenCode desktop (`OPENCODE_CLIENT=desktop`) |
| CLI | `@opencode/cli@2.2.5` (`opencode v2.2.5`) |
| Servidor em execução | **2.3.2** (`opencode api get /api/info`) |
| Sistema | Windows, `<repo>` |
| Config global | `<home>\.config\opencode\opencode.json` |
| Config de projeto | **inexistente** (`opencode.json(c)` e `.opencode/opencode.json(c)` não existem) |
| Agentes locais | `.opencode/agents/*.md` (8) |
| Agentes globais | `<home>\.config\opencode\agents\*.md` (28) |
| Skills locais | `.opencode/skills/*/SKILL.md` (5) |
| Plugins | **0** (`opencode plugin list`) |
| MCP servers | **3** (`auron-vault`, `capcut`, `vectcut-api`) |
| Aprovações salvas | **0** (`permission` table do `opencode.db`) |
| Diretório de dados | `<home>\.local\share\opencode` |

O CLI e o servidor em execução têm versões diferentes. O comportamento de permissões foi
verificado no servidor efetivo (2.3.2) por testes práticos; o CLI 2.2.5 foi usado apenas
para inspeção/administração.

### 1.1 Precedência

A documentação V2 define:

1. Configuração de sistema (`%ProgramData%\opencode`) tem precedência sobre projeto; projeto
   sobre global.
2. Arquivos `opencode.json(c)` diretos são mesclados do ancestral mais distante para o mais
   próximo; depois os `.opencode/opencode.json(c)` na mesma ordem. Um `.opencode` sobrepõe
   o direto.
3. Regras de permissão são uma **lista ordenada**: a **última regra que casa vence**.
4. A política base é carregada primeiro; regras globais são anexadas depois; regras do
   agente são anexadas por último.
5. Um subagente usa **as próprias permissões**, não um subconjunto das permissões do pai.

Neste projeto não há configuração de projeto nem regras globais de permissão. Portanto, o
resultado efetivo é: **política base + regras do agente + regras injetadas pela sessão**
(ex.: `browser`). O `opencode debug agents` mostra a lista resolvida.

### 1.2 Herança e sessão

- `opencode debug agents` lista **43 agentes**: 7 built-in, 28 globais e 8 locais.
- A sessão do agente principal `build` tem permissão de sessão
  `browser allow` + `skill browser allow`; 60 sessões históricas têm o mesmo padrão.
- Subagentes **não** herdam o `browser`: o runtime injeta `DENY browser` e
  `DENY skill browser` no fim da lista deles. Testes confirmaram que o browser não está
  disponível em subagentes.
- Não há `policies`, `ask` configurado, `--auto` ou aprovações salvas neste projeto.
- `deny` sempre prevalece sobre aprovação salva. Aprovações salvas nunca concedem o que uma
  regra `deny` proíbe.

---

## 2. Modelo de permissões

Cada regra tem `action`, `resource` e `effect` (`allow`, `deny`, `ask`). Os recursos usam
curingas de valor inteiro (`*`, `?`); em paths, barras invertidas são normalizadas para `/`
e a comparação é case-insensitive no Windows.

Ações relevantes observadas: `read`, `edit`, `glob`, `grep`, `shell`, `webfetch`,
`websearch`, `skill`, `subagent`, `question`, `execute`, `external_directory`, `browser`,
`experimental_image_generate`, `<server>_<tool>` (MCP) e `opencode_*` (administração).

### 2.1 Regra local adotada

Os 8 agentes locais agora começam com:

```yaml
- action: "*"
  resource: "*"
  effect: deny
```

e só recebem `allow` explícito depois. Isso fecha MCP e ferramentas administrativas por
padrão; browser recebe deny adicional, mas o gate não pôde ser verificado. Os `allow` de
leitura/escrita são por path (relativo e absoluto); `.env*` é negado no fim da lista.

---

## 3. Ferramentas e capacidades

| Ferramenta | Categorias | Risco | Controle local |
|---|---|---|---|
| `read` | READ | LOW | Paths `video/**`, `docs/**`; `backend/**` negado |
| `glob` | READ (nomes) | LOW | Apenas padrões absolutos em `video/**` |
| `grep` | READ (conteúdo) | MEDIUM | Negado nos agentes locais (o recurso é a regex, não o path; allow por path seria ineficaz) |
| `write`/`edit`/`patch` | WRITE | MEDIUM | Somente diretórios de relatório/evaluation/storyboard/variantes/áudio |
| `shell` | EXECUTE, READ, WRITE, NETWORK | HIGH/CRITICAL | Allowlist por comando; somente `ffprobe`/`ffmpeg` nos 4 agentes de vídeo; negado nos outros 4 |
| `webfetch`/`websearch` | NETWORK | HIGH | Negados nos 8 agentes locais |
| `skill` | instruções | LOW | Uma ou duas skills por agente |
| `subagent` | DELEGATE | HIGH | Negado nos 8 agentes locais |
| `question` | UI | LOW | Negado |
| `execute` (Code Mode) | meta | HIGH | Negado; remove Code Mode e expõe ferramentas aninhadas com suas regras |
| `browser` | NETWORK/READ/WRITE | HIGH | Runtime injeta `DENY browser`; chamadas de subagente falham por conexão antes de `permission.rejected` — **NOT VERIFIED** |
| MCP `auron-vault_*` | READ/WRITE/DELETE | CRITICAL | Fechado nos 8 locais; aberto nos 28 globais e em `build`/`plan`/`general`/`compaction` (explore/title/summary têm default-deny) |
| MCP `capcut_*` | READ/WRITE/DELETE/EXECUTE | HIGH | Fechado; exceção read-only no QC |
| MCP `vectcut_*` | WRITE/EXECUTE/NETWORK | HIGH | Fechado nos 8 locais |
| `opencode_*` | ADMIN | HIGH | Chamadas negadas nos 8 locais; `worktree_remove` exposto mas gated por `edit` |

---

## 4. Shell

**O shell não é sandbox.** Ele roda com a autoridade de filesystem, processo e rede do
usuário do host. O scanner do OpenCode analisa Bash, Zsh, `sh`, POSIX e PowerShell, mas
comandos com estrutura inválida ou avaliação dinâmica retornam erro em vez de executar
subcomandos não verificados. Ainda assim:

- `node`, `python`, `powershell`, `bash -c`, `cmd /c`, `npx` e scripts podem executar
  qualquer coisa, inclusive `git`, deploy e acesso à rede.
- `ffmpeg`/`ffprobe` leem e escrevem **qualquer path** permitido pelo SO e suportam
  protocolos de rede.
- Filtrar nomes de comandos não é isolamento.

### 4.1 Estado anterior

Os 4 agentes de vídeo (`if-motion-designer`, `if-quality-control`, `if-sound-designer`,
`if-video-editor`) tinham `shell * allow`. Evidência de uso real: PowerShell, `node -e`,
`python`, `ffmpeg`/`ffprobe`, `Set-Content`, scripts ad-hoc de pacing/density. O shell era
usado como shell geral, não apenas mídia.

### 4.2 Estado novo

Os 4 agora só podem executar `ffprobe`/`ffmpeg`, inclusive os binários do CapCut em
`%LOCALAPPDATA%/CapCut/Apps/*/`. `git`, `node -e`, `python -c`,
`Set-Content` e comandos compostos não permitidos são negados. Os outros 4 agentes não
têm shell.

**Limitação comprovada:** um teste autorizado executou `ffmpeg` e criou
`docs/engineering/P03_FFMPEG_BYPASS.png`, fora do escopo de `edit` nativo do QC. O arquivo
foi removido. Isso prova que a allowlist de mídia **não** impõe o escopo de paths e que
`ffmpeg` pode escrever fora do diretório permitido. Também pode usar rede por protocolos
do ffmpeg; isso não foi testado para não enviar dados a terceiros.

### 4.3 Fora do escopo local

- 10 agentes globais mantêm `shell * allow` (antigravity, 6 Blender, MCP server, uv,
  Windows/Python).
- `auron-architect` usa `shell ask` + allowlist de scripts do Vault.
- O built-in `explore` mantém `shell * allow`.
- O agente principal `build` tem a política base (allow) e é a âncora de confiança.

---

## 5. MCP e plugins

| Server | Origem | Versão | Root efetivo | Ferramentas | Risco |
|---|---|---|---|---|---|
| `auron-vault` | global, `npx -y @modelcontextprotocol/server-filesystem` | **não pinada** | config declara `<home>\AURON BRAIN`; observado `<repo>` | 16 | **CRITICAL** |
| `capcut` | local, `run-capcut-mcp.cmd` → `node src/server.js` | 0.1.0 | `%LOCALAPPDATA%\CapCut\User Data\Projects\...` | 17 | **HIGH** |
| `vectcut-api` | local, `.venv\Scripts\python.exe mcp_server.py` | 1.0.0 | `VECTCUT_OUTPUT_DIR`; `VECTCUT_ALLOW_REMOTE_MEDIA=false` | 11 | **HIGH** |

Observações:

- O `auron-vault` é um servidor de filesystem: lê, escreve, move e sobrescreve. Ele **não
  passa** pelas regras nativas `read`/`edit`; obedece apenas ao próprio root.
- Há **divergência não resolvida** entre a config global (AURON BRAIN) e o root efetivo
  observado (InvestFacil). Processos `server-filesystem` com AURON BRAIN existem, mas o
  namespace conectado nesta sessão respondeu `Allowed directories:
  <repo>`. A causa é **UNKNOWN**; o efeito está comprovado.
- O `auron-vault` é iniciado com `npx -y` **sem versão fixa** — risco de supply chain e de
  execução de versão diferente a cada start.
- O `vectcut-api` declara `requests` e aceita URLs de mídia, mas o ambiente está com
  `VECTCUT_ALLOW_REMOTE_MEDIA=false`. A eficácia dessa flag não foi testada com URL real.
- Não há plugins instalados.

### 5.1 Allowlist local proposta e aplicada

| Agente | MCP permitido |
|---|---|
| `if-quality-control` | `capcut_capcut_list_drafts`, `capcut_capcut_read_timeline`, `capcut_capcut_validate` (somente leitura) |
| `if-motion-designer` | nenhum |
| `if-sound-designer` | nenhum |
| `if-video-editor` | nenhum |
| `if-creative-director` | nenhum |
| `if-retention-specialist` | nenhum |
| `if-storyteller` | nenhum |
| `if-traffic-strategist` | nenhum |

Nos 8, qualquer ferramenta MCP não listada fica indisponível por default-deny. Isso foi
verificado: `auron-vault_*` e, para o editor, `capcut_*` não aparecem no toolset.

---

## 6. Delegação

- `subagent` é uma ação controlável por ID de agente.
- Um subagente usa **suas próprias permissões**, não as do pai. O QC negou `backend/`
  mesmo sendo filho de uma sessão `build` com acesso amplo.
- `experimental.subagent_depth` não está configurado; o padrão é 1, então subagente não
  cria subagente.
- Os 8 agentes locais negam `subagent` por default-deny; a ferramenta não é exposta.
- O `auron-architect` global permite apenas IDs explícitos após negar `*`.
- Não foi observado aumento de escopo por delegação; a ausência de teste com um agente
  explicitamente autorizado a delegar é uma limitação.

---

## 7. Política de aprovação humana

Operações que exigem autorização humana **antes** da execução:

| Operação | Risco | Controle técnico atual |
|---|---|---|
| Deploy, release, publicação de vídeo/asset | CRITICAL | Nenhum `ask`; processo humano |
| Push, merge, PR, alteração de branch protection | CRITICAL | Nenhum `ask`; processo humano |
| Exclusão de dados/arquivos, migrations destrutivas | CRITICAL | Default-deny local; shell negado ou só mídia |
| Banco de produção, secrets, credenciais | CRITICAL | Sem ferramenta de DB; `.env` negado nos locais |
| Instalação de dependências/plugins/MCP | HIGH | Sem shell geral nos locais; global tem shell |
| Compras, uploads externos, serviços externos | CRITICAL | Sem webfetch/websearch/MCP nos locais |
| Alteração de permissões globais/config | CRITICAL | Fora do escopo local; requer revisão |
| `capcut_save`, exportação e alteração de drafts | HIGH | Negado nos 8 locais, exceto leitura no QC |

Formato mínimo da aprovação: **operação, alvo, ambiente, impacto, escopo e
reversibilidade**. Aprovação genérica no início da tarefa não autoriza ações futuras.

**Limitação:** o runtime suporta `ask` e aprovações salvas, mas nenhum `ask` está
configurado neste projeto e a tabela de aprovações está vazia. Portanto, a política acima é
**operacional**, não enforcement técnico. O `build` e os agentes globais podem executar
operações críticas via shell sem prompt. Recomenda-se configurar `ask` para operações
críticas e/ou usar isolamento de SO.

---

## 8. Prompt injection

Fontes não confiáveis: README de dependências, issues/PRs, páginas web, resultados de
busca, arquivos enviados, logs, código de terceiros, documentos, respostas de MCP e
mensagens de outros agentes.

Controles efetivos nos agentes locais:

- default-deny fecha MCP, browser, `subagent`, `webfetch`, `websearch` e ferramentas
  administrativas;
- leitura restrita a `video/**` e `docs/**`;
- escrita restrita a diretórios de relatório/evaluation/storyboard/variantes/áudio;
- shell restrito a `ffprobe`/`ffmpeg` (4 agentes) ou negado (4 agentes);
- `.env*` negado no fim da lista.

**O que isso não resolve:**

- O runtime não marca proveniência/taint. O modelo não distingue tecnicamente uma instrução
  do usuário de uma instrução lida em um `.md`; a resistência observada é comportamento do
  modelo, não controle de segurança.
- `ffmpeg` pode ler/escrever mídia fora do escopo de `edit` e pode usar rede.
- O agente principal e os 28 agentes globais mantêm shell/MCP amplos; uma injeção neles
  tem muito mais alcance.

Teste realizado com fixture fictício: o conteúdo foi tratado como dado, o shell foi negado e
as ferramentas MCP/subagent não existiam. Nenhuma ação proibida foi induzida. O caminho de
escrita via harness não foi exercitado porque o modelo não emitiu a chamada; foi
classificado como **NOT TESTED**, não como PASS.

---

## 9. Limitações

1. Agentes globais não foram alterados: 10 mantêm `shell * allow` e 28 mantêm acesso
   implícito a MCP/browser/opencode. `build`, `plan`, `general` e `compaction` também têm
   acesso implícito; `explore`, `title` e `summary` têm default-deny.
2. O agente principal `build` tem política base ampla + browser de sessão; é a âncora de
   confiança e não foi restringido.
3. O root efetivo do `auron-vault` divergiu da config global; causa desconhecida.
4. O `auron-vault` usa `npx -y` sem versão fixa.
5. `ffmpeg`/`ffprobe` não respeitam o escopo de `edit`; escrita fora do escopo foi
   comprovada e o arquivo foi removido.
6. Não há sandbox de SO, taint tracking, aprovação `ask` configurada ou política de
   imutabilidade.
7. CLI 2.2.5 e servidor 2.3.2 divergem; o comportamento foi medido no servidor.
8. O browser está desconectado nesta sessão; o teste foi NOT AVAILABLE, não DENY. Um
deny explícito `browser_*` foi adicionado, mas não foi possível comprovar que ele (ou a
ação `browser`) bloqueia a chamada antes da camada de conexão.
9. Nenhum teste de rede do `ffmpeg`/`vectcut` foi feito, por proibição de envio externo.
10. Testes de injeção mediados por modelo não provam contenção; provam comportamento
    observado.
11. A ferramenta `opencode_worktree_remove` permanece exposta em agentes com default-deny,
    mas a chamada foi negada pelo gate `edit`. A exposição assimétrica (remove presente,
    list ausente) é uma limitação de superfície, não uma autorização.

---

## 10. Regras de manutenção

1. Todo agente local novo começa com `* * deny` e só recebe `allow` explícito.
2. Shell só com binários do domínio; nunca `node`, `python`, `powershell`, `bash`, `cmd`,
   `npx` ou curinga sem justificativa e revisão.
3. MCP é negado por padrão; permitir apenas ferramentas read-only necessárias.
4. Sempre declarar paths de leitura e escrita em forma relativa **e** absoluta.
5. Negar `.env*` no fim da lista de permissões.
6. Revisar `opencode debug agents` após qualquer mudança e rodar um teste positivo e um
   negativo por agente.
7. Não usar instruções em Markdown como controle de segurança.
8. Fixar versão de MCP e revisar o root efetivo, não apenas a config.
9. Reauditar após upgrade do runtime; a divergência CLI/servidor mostra que a versão
   importa.
10. Operações críticas exigem aprovação humana explícita e registrada.

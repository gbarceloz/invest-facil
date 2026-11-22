# P0.1 — MEDIA SAFETY / GIT HYGIENE — VERIFICATION REPORT

**Data:** 21/11/2026
**Status:** **PASS**

> **Nota P0.4 (22/11/2026):** relatório histórico. O build atual tem **20 entradas de rota**
> (19 app + not-found); as “17 rotas” abaixo são do snapshot de 21/11.

**Escopo:** proteção de mídia e assets grandes; sem alteração de produto, agentes, vídeos ou drafts.

---

## 1. Baseline

| Item | Valor |
|---|---|
| Raiz | `<repo>` |
| Branch | `feat/mvp-completo` |
| Staged | **0 arquivos** |
| Working tree | 55 entradas no início desta missão (31 modificadas, 24 não rastreadas) |
| Tracked >1 MB | `content/pilots/01-volatilidade/assets/narracao.wav` — 1,37 MB |
| `.gitattributes` | ausente |
| Git LFS | instalado 3.5.1; **não configurado**; não usado |
| `core.hooksPath` | vazio |
| Mídia não ignorada | ~0,81 GB (24 MP4, 430 WAV fora de `video/out`) |
| Workspace de vídeo total | 1,68 GB |

**Nenhum arquivo de mídia, asset, vídeo ou draft foi removido, movido ou alterado.**

---

## 2. Problemas identificados

| # | Problema | Evidência |
|---|---|---|
| 1 | `video/public` com 388 WAV (~238 MB) e 105 MP3 (~2,4 MB) não ignorados | inventário |
| 2 | `video/projects` com 24 MP4 (~311 MB), 26 WAV (~113 MB) e 355 PNG (~104 MB) não ignorados | inventário |
| 3 | `video/auditions` com 50 MB WAV e 2,5 MB M4A não ignorados | inventário |
| 4 | `frontend/tsconfig.tsbuildinfo` e `*.pyc` não ignorados | `git status` |
| 5 | Nenhum guard contra staged >5 MiB | ausência de hook/script |
| 6 | Risco de `git add .` incluir 0,81 GB de mídia | `.gitignore` anterior |

---

## 3. Arquivos alterados/criados

### Alterado

- `.gitignore` — regras de mídia, frames, caches e exceções de evidência.

### Criados

- `scripts/check-large-files.ps1` — guard de staged additions.
- `scripts/large-file-allowlist.txt` — exceções explícitas.
- `.githooks/pre-commit` — hook opcional que chama o guard.
- `docs/engineering/MEDIA_ASSET_POLICY.md`
- `docs/engineering/GIT_HYGIENE_POLICY.md`
- `docs/engineering/LARGE_FILE_POLICY.md`
- `docs/engineering/SIZE_GUARD.md`
- `docs/engineering/P0_1_VERIFICATION.md` (este relatório)

### Não alterado

- Nenhum código de aplicação.
- Nenhum agente/skill.
- Nenhum MP4/WAV/MP3/PNG/SVG/GLB.
- Nenhum draft CapCut.
- Nenhum commit/push/merge/deploy.

---

## 4. Regras implementadas

- Ignorar mídia gerada em `video/projects/**` (MP4, MOV, WebM, WAV, MP3, M4A, AAC, FLAC).
- Ignorar frames/contact sheets gerados:
  - `frames-*/`, `*-frames/`, `_frames/`, `reaudit-frames/`, `final-audit-frames/`, `final24-audit-frames/`, `render/*.png`.
- Preservar como evidência:
  - `V01..V10/render/contact-sheet.png`
  - `V01..V10/render/frame0.png`
- Ignorar áudio gerado em `video/public/**` e `video/auditions/voice-samples/**`.
- Preservar `video/public/fonts/**`, PNGs pequenos, JSON, SRT e relatórios.
- Ignorar `*.tsbuildinfo`, `*.pyc`, `__pycache__/`.
- `video/out`, `node_modules`, `piper-voices` permanecem ignorados.
- `content/pilots/**` permanece source asset; o WAV tracked de 1,37 MB foi preservado.

---

## 5. Testes executados

### 5.1 Ignore rules

`git check-ignore -q --no-index` por path:

| Path | Ignorado? | Esperado |
|---|---|---|
| `V01/render/V01-ticker-nao-para.mp4` | sim | sim |
| `V01/render/audio.wav` | sim | sim |
| `V01/render/contact-sheet.png` | **não** | não (evidência) |
| `V01/render/frame0.png` | **não** | não (evidência) |
| `V01/render/frames-polish/v01-000.png` | sim | sim |
| `reports/GATE4_PRODUCTION_REPORT.md` | **não** | não (texto) |
| `gate4-frames/v01-6s.png` | sim | sim |
| `video/public/.../v01/music.wav` | sim | sim |
| `video/public/fonts/PlusJakartaSans.ttf` | **não** | não (runtime) |
| `video/auditions/voice-samples/01-maria-lenta.wav` | sim | sim |
| `video/auditions/VOICE_OPTIONS.md` | **não** | não (texto) |
| `frontend/tsconfig.tsbuildinfo` | sim | sim |
| `content/pilots/01.../narracao.wav` | **não** | não (source tracked) |
| `video/out/anything.mp4` | sim | sim |

**Resultado: 14/14 corretos.**

`git add -n` confirmou que MP4 é ignorado e que a fonte TTF não é ignorada. Nada foi staged.

### 5.2 Size guard

Fixtures isoladas em `%TEMP%\p01-guard-test-*`, removidas ao final.

| Caso | Resultado |
|---|---|
| Arquivo pequeno (texto) | **PASS** — permitido |
| Arquivo grande 6 MiB não-mídia | **PASS** — bloqueado (exit 1) |
| Arquivo grande com `-Allow` | **PASS** — permitido |
| Arquivo grande já tracked, modificado | **PASS** — warning e permitido |
| Arquivo de mídia 6 MiB | **PASS** — bloqueado |
| Arquivo pequeno não-mídia | **PASS** — permitido |

### 5.3 Hook

- `sh -n .githooks/pre-commit` → **PASS**.
- Execução do hook via Git sh → **PASS** (`OK: no newly staged file above 5 MiB`, exit 0).
- Hook **não instalado** (`core.hooksPath` vazio); instalação documentada.

### 5.4 Build/runtime

| Verificação | Resultado |
|---|---|
| `mvn -B -q -DskipTests compile` | **PASS** (sem saída, exit 0) |
| `npm run build` | **PASS**, 17 rotas |
| `git diff --cached` | vazio |
| Assets de runtime | `video/public/fonts/PlusJakartaSans.ttf` presente e não ignorado |
| Source tracked | WAV de 1,37 MB preservado |

---

## 6. Preservação de assets

- Nenhum arquivo foi apagado.
- Nenhum asset foi movido.
- Nenhum vídeo/WAV/PNG foi re-codificado.
- O WAV tracked de `content/pilots/01-volatilidade` continua no índice e no disco.
- Os 10 MP4 finais e os drafts CapCut continuam no disco; apenas não serão rastreados por padrão.
- `video/public/fonts`, JSON, SRT, manifests e relatórios continuam rastreáveis.

---

## 7. Limitações

- Ignorar não remove arquivos já tracked; o histórico existente não foi alterado.
- O guard só vê staged additions; não é um antivírus nem um scanner de segredos.
- O hook é opcional e depende de PowerShell.
- Não houve migração para LFS.
- Não houve commit/push; as regras não foram validadas em um commit real.
- `video/` continua não rastreado como um todo; a política define o que pode ser adicionado depois.

---

## 8. Rollback

1. Reverter `.gitignore`: `git restore -- .gitignore`.
2. Remover hook local: `git config --unset core.hooksPath` (não estava setado).
3. Remover guard/allowlist: apagar `scripts/check-large-files.ps1`, `scripts/large-file-allowlist.txt`, `.githooks/pre-commit`.
4. Remover docs: apagar `docs/engineering/` somente após revisão.
5. Nenhum asset precisa ser restaurado; nada foi removido/alterado.

---

## 9. Veredito

**PASS.** O risco de inclusão acidental de mídia caiu de “0,81 GB sem regra” para “mídia gerada ignorada + 10 imagens de evidência preservadas + guard de 5 MiB testado”. Build e runtime assets permanecem acessíveis. Nenhum commit foi feito.

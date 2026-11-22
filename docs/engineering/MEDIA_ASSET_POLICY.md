# MEDIA ASSET POLICY — INVEST FÁCIL

**Data:** 21/11/2026
**Escopo:** vídeo, áudio, imagens, modelos e artefatos de produção.
**Regra:** mídia gerada não entra no Git por padrão; runtime essencial e fontes pequenas ficam preservados.

---

## 1. Categorias

| Categoria | Exemplos | Política |
|---|---|---|
| Runtime essencial | `video/public/fonts/PlusJakartaSans.ttf`, logos, pequenos PNGs | preservar; não ignorar |
| Source asset | `content/pilots/**` (roteiro, slides, narração de origem) | preservar quando abaixo do limite; acima, avaliar LFS/externo |
| Generated asset | renders, narração TTS, música, SFX, contact sheets, frames | ignorar |
| Large asset | MP4/WAV/MP3/ONNX acima do limite | ignorar; não usar Git tradicional |
| Evidence asset | `V01..V10/render/contact-sheet.png` e `frame0.png` | preservar para QC; são pequenos |
| Build artifact | `*.tsbuildinfo`, `*.pyc`, `__pycache__` | ignorar |

---

## 2. Inventário real

| Área | Conteúdo | Tamanho | Git | Decisão |
|---|---|---:|---|---|
| `video/projects` | 24 MP4, 26 WAV, 355 PNG, 155 MD | 528 MB | untracked | ignorar mídia/frames; manter relatórios e evidência QC |
| `video/public` | 388 WAV, 105 MP3, 4 PNG, 1 TTF | ~240 MB | untracked | ignorar áudio; preservar fonte e PNGs |
| `video/auditions` | 50,3 MB WAV, 2,5 MB M4A, 60,3 MB ONNX | ~113 MB | untracked | ignorar mídia; preservar metadados/MD |
| `video/out` | renders/exports | ignorado | untracked | manter ignorado |
| `content/pilots` | 10 WAV, 6 PNG | ~6 MB | 1 WAV tracked (1,37 MB) | preservar como source; não remover |
| `frontend/tsconfig.tsbuildinfo` | cache TypeScript | pequeno | untracked | ignorar |

**Tracked >1 MB:** apenas `content/pilots/01-volatilidade/assets/narracao.wav` (1,37 MB). Está abaixo do threshold de 5 MiB e **não será removido nem migrado**.

---

## 3. Regras de ignore

As regras completas estão no `.gitignore` raiz. Resumo:

- `video/projects/**/*.{mp4,mov,webm,wav,mp3,m4a,aac,flac}` — ignorados.
- `video/projects/**/frames-*/`, `*-frames/`, `_frames/`, `render/*.png` — ignorados.
- Exceções: `V01..V10/render/contact-sheet.png` e `frame0.png` — preservados.
- `video/public/**/*.{mp4,mov,webm,wav,mp3,m4a,aac,flac}` — ignorados.
- `video/public/fonts/**` e imagens pequenas — preservados.
- `video/auditions/voice-samples/**/*.{wav,mp3,m4a}` — ignorados; metadados preservados.
- `*.tsbuildinfo`, `*.pyc`, `__pycache__/` — ignorados.

Textos, JSON, SRT, manifests e relatórios **não** são ignorados.

---

## 4. Como adicionar um asset

1. Classifique: runtime, source, generated ou large.
2. Verifique o tamanho: `Get-Item <path> | Select-Object Length`.
3. Se for gerado, não adicione; gere por script.
4. Se for source >5 MiB, avalie LFS ou armazenamento externo; não force no Git.
5. Se for runtime pequeno, use `git add -- <path>` explicitamente.
6. Se precisar de exceção ao guard, adicione a `scripts/large-file-allowlist.txt` com justificativa.
7. Verifique: `git check-ignore -v --no-index <path>`.

## 5. Comandos de auditoria

```powershell
git status --short
git diff --cached --name-status
git check-ignore -v --no-index "video/projects/.../render/V01.mp4"
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check-large-files.ps1
```

## 6. Limitações

- Ignorar não apaga; os arquivos continuam no disco.
- Arquivos já tracked não são removidos por `.gitignore`.
- Não houve migração de histórico, LFS ou reescrita de commits.
- O hook é opcional e só roda após `git config core.hooksPath .githooks`.

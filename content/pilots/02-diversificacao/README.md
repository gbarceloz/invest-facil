# Piloto 02 — Diversificação não é comprar tudo

**Status:** **CONCLUÍDO COM RESSALVAS** — draft corrigido, reaberto e validado;
exportação MP4 e verificação independente do arquivo ainda dependem de ação
manual no CapCut.

## Arquivos

| Arquivo | Descrição |
|---|---|
| `roteiro.md` | roteiro, fontes e aviso |
| `storyboard.md` | cenas, assets e safe zones |
| `narracao.txt` | texto usado no TTS, uma frase por linha |
| `legendas.srt` | 12 legendas revisadas, máximo de 71 caracteres por entrada |
| `timings.json` | durações e limites de cena calculados do WAV |
| `metadata.json` | metadados de publicação |
| `assets/slide-01.png` | cena 1 (1080×1920) |
| `assets/slide-02.png` | cena 2 |
| `assets/slide-03.png` | cena 3 |
| `assets/narracao.wav` | narração TTS local (51,08 s) |
| `assets/tts/sentence-01..08.wav` | blocos de fala usados na concatenação |
| `export/` | destino do MP4 final (vazio até a exportação manual) |

## Geração reproduzível

```powershell
cd <repo>
powershell -ExecutionPolicy Bypass -File scripts\generate-pilot02-narration.ps1
& "$env:LOCALAPPDATA\InvestFacil\tools\VectCutAPI\.venv\Scripts\python.exe" `
  scripts\generate-pilot02-assets.py
```

O gerador mantém o áudio original de 51,08 s e divide apenas a **exibição** das
legendas longas. A entrada 4 do SRT foi dividida em três blocos; a narração não
foi regravada. Os tempos internos de cada bloco são distribuídos
proporcionalmente ao texto dentro da janela da frase original.

## Draft no CapCut

- Nome: `if_piloto_diversificacao`
- Canvas: 1080×1920 (9:16), 30 fps
- Duração: 51,1 s
- Timeline: 3 imagens (12,63 s / 17,03 s / 21,43 s) + 1 faixa de narração
- Legendas: 12 entradas nativas, horizontais, `transform_y=-0.55`
- Validação CapCut MCP: `ok: true` (sem issues)
- Estrutura: 3 vídeos, 1 áudio, 12 textos; sem lacunas ou sobreposições

### Dependência de mídia do draft

O CapCut referencia os arquivos em:

```
%LOCALAPPDATA%\InvestFacil\tools\VectCutAPI\output\dfd_cat_1795252139_8affaced\assets
```

Essa pasta **não deve ser apagada ou movida** antes da exportação. As cópias em
`assets/` dentro do draft são backup, mas o CapCut usa o caminho original do
VectCutAPI. Uma tentativa de apontar o JSON para as cópias locais foi revertida
pelo próprio CapCut ao abrir o projeto; o caminho original foi mantido.

O áudio original do VectCutAPI era um WAV com extensão `.mp3`. Ele foi
convertido para **MP3 real, ~160 kbps efetivos, mono, 22,05 kHz** e substituído no caminho
referenciado; o `ffprobe` confirma `codec_name=mp3`, duração 51,147 s.

## QA realizado

- SRT revisado: maior entrada tem 71 caracteres; nenhuma entrada acima de 84.
- Draft reaberto **depois** do último save do CapCut MCP.
- Inspeção visual segundo a segundo: 52 amostras cobrindo 0–51 s.
- Cenas 1, 2 e 3 conferidas; nenhuma tela preta inesperada.
- Legendas horizontais, legíveis e acima do rodapé.
- Áudio WAV analisado: 51,084 s, mono, 22,05 kHz, 16-bit, pico 0,5464, sem
  clipping; fala presente em todas as frases e silêncio de 0,3 s entre frases.
- Áudio do draft verificado com `ffprobe`: MP3 real, 51,147 s, 22,05 kHz, mono;
  o antigo WAV renomeado como `.mp3` foi substituído.
- Escuta humana e reprodução contínua com áudio **não** realizadas.

## Exportação manual

O CapCut 9.8 não oferece CLI de exportação; o CapCut MCP também não exporta.
O editor foi deixado aberto no draft, no início (0:00), com o botão **Exportar**
disponível. Configurações esperadas:

| Item | Valor |
|---|---|
| Resolução | 1080p — 1080×1920 (9:16) |
| Taxa de quadros | 30 fps |
| Formato | MP4 |
| Codec de vídeo | H.264 |
| Taxa de bits | recomendada / 8–12 Mbps |
| Áudio | AAC, 192 kbps, 48 kHz quando disponível |
| Nome | `if-aula-diversificacao-nao-e-comprar-tudo-v1.mp4` |
| Destino | `content/pilots/02-diversificacao/export/` |

Após exportar, validar o arquivo real:

```powershell
& "$env:LOCALAPPDATA\InvestFacil\tools\VectCutAPI\.venv\Scripts\python.exe" `
  scripts\verify-mp4.py `
  "content\pilots\02-diversificacao\export\if-aula-diversificacao-nao-e-comprar-tudo-v1.mp4"
```

O script confere tamanho, container, duração, resolução, codec, FPS e presença
de áudio sem depender de `ffprobe`.

## Evidências

- `_audit/missao03-audit-baseline.txt`
- `_audit/missao03-audit-after-srt.txt`
- `_audit/missao03-mcp-baseline.txt`
- `_audit/missao03-mcp-final-save.txt`
- `_audit/missao03-mcp-final-reopen.txt`
- `_audit/missao03-structure-final-reopen.txt`
- `_audit/missao03-audio-analysis.txt`
- `_audit/missao03-mp3-encode.log`
- `_audit/missao03-mcp-after-mp3.txt`
- `_audit/missao03-editor-mp3-final.png`
- `_audit/missao03-reopen-after-save.png`
- `_audit/missao03-contact-sheet-52s.png`
- `_audit/missao03-frame-brightness.csv`
- `_audit/missao03-final-frames.png`
- `_audit/missao03-ffprobe-audio.json`
- `_audit/missao03-timeline-chart.png`
- `_audit/missao03-editor-ready.png`
- `_audit/missao03-integrity-final.txt`
- `_audit/missao03-draft-before-20261121.zip`

## Riscos e limitações

- O draft fica bloqueado (`locked: true`) enquanto o CapCut está aberto.
- O hash de `draft_content.json` muda quando o CapCut abre/fecha e normaliza o
  arquivo; o hash não é um identificador estável do conteúdo.
- A narração é TTS local (`Microsoft Maria Desktop`), adequada a protótipo.
- Nenhum MP4 foi exportado e nenhum upload foi feito.
- Nenhum push, merge ou deploy foi realizado.

# RELATÓRIO TÉCNICO — INVEST FÁCIL HIGH IMPACT 01

**Data:** 21/11/2026
**Projeto:** `video/projects/investfacil-high-impact-01/`
**Formato:** 1080 × 1920 · 30 fps · 9:16 · H.264/AAC
**Duração:** 40,0 s
**Voz:** Thalita (edge-tts pt-BR, -12%) — escolhida pelo usuário
**Música/SFX:** originais, sintetizados localmente
**Status:** aprovado tecnicamente; publicação pendente de avaliação humana.

---

## 1. O que foi criado

- Composição Remotion `InvestFacilHighImpact01`, com 40 s e 1.200 frames.
- Seis cenas: Hook, Quebra de expectativa, Demonstração, Explicação, Impacto e Encerramento.
- Componentes reutilizáveis: `KineticText`, `AnimatedNumber`, `CameraMovement`, `SceneShell`, `BackgroundEffects`, `FinancialChart`, `ProductBasket`, `LogoReveal`, `SoundEffect`.
- Roteiro completo em `script/ROTEIRO.md`.
- Narração Thalita em `audio/narration/`.
- Música original em `audio/music/`.
- Biblioteca de SFX em `audio/sfx/`.
- Render Remotion final em `render/investfacil-high-impact-01-delivery.mp4`.
- Draft CapCut `if_high_impact_01_delivery_20261121`.
- Export CapCut final em `render/capcut-export-if_high_impact_01_delivery.mp4`.
- Contact sheets e capturas em `render/` e `capcut/`.

## 2. Especificações do render Remotion

| Item | Valor |
|---|---|
| Arquivo | `render/investfacil-high-impact-01-delivery.mp4` |
| Duração | 40,000 s |
| Resolução | 1080 × 1920 |
| FPS | 30 |
| Vídeo | H.264, yuv420p |
| Áudio | AAC 48 kHz estéreo, 192 kbps |
| Tamanho | 16.722.813 bytes (16,0 MB) |
| SHA-256 | `7A3E6511FEA29C70F1A1689CB37C72081D229D242E747412BBA88A21017F2C6D` |
| Loudness | -14,5 LUFS |
| True peak | -1,1 dBFS |

## 3. Especificações do export CapCut

| Item | Valor |
|---|---|
| Arquivo | `render/capcut-export-if_high_impact_01_delivery.mp4` |
| Cópia original | `%LOCALAPPDATA%\CapCut\Videos\if_high_impact_01_delivery_20261121.mp4` |
| Duração | 40,008 s |
| Resolução | 1080 × 1920 |
| FPS | 30 |
| Vídeo | H.264, 9,14 Mbps |
| Áudio | AAC 44,1 kHz estéreo, 197 kbps |
| Tamanho | 45.711.955 bytes (43,59 MB) |
| SHA-256 | `180BC0275108AD5870B60281692ACBEF0FF27232E35E49166708146432B1632F` |
| Loudness | -14,5 LUFS |
| True peak | -1,1 dBFS |
| Marca d'água | removida |
| Textos no draft | 0 |

## 4. Draft CapCut

- Nome: `if_high_impact_01_delivery_20261121`
- Timeline: 1 vídeo de 40 s + 1 áudio de 40 s + 0 textos.
- Mídia local dentro da pasta do draft:
  - `assets/video/video_dce079f32093862d.mp4`
  - `assets/audio/audio_583b459ed42a18ce.wav`
- Dimensões corrigidas para 1080×1920.
- CapCut MCP: 17 ferramentas; `validate: ok`; `save` concluído; leitura posterior confirmou 1 vídeo, 1 áudio, 0 textos.
- Reprodução no CapCut: 0 a 40 s; exportação manual em 1080P, H.264, 30 fps, mp4, sem marca d'água.

## 5. Áudio

| Stem | Arquivo | Loudness | Uso |
|---|---|---|---|
| Narração | `audio/narration/narracao-thalita-master.wav` | -16 LUFS | Voz principal |
| Música | `audio/music/music-bed-master.wav` | -30 LUFS | Bed com ducking |
| SFX | `audio/sfx/*.wav` | picos controlados | Impactos, whooshes, clicks, risers |
| Master | render final | -14,5 LUFS / -1,1 dBTP | Entrega |

- Narração: Thalita, -12%, 35,136 s.
- Música: 100 BPM, A menor, 40 s, sintetizada localmente.
- SFX: impact, whoosh, click, riser, bass hit, glitch, ui-pop, reverse impact, sweep, tick.
- Nenhum sample de terceiros.
- Sync Remotion ↔ CapCut: **lag 0 ms**, correlação **0,998924**, diferença RMS **-26,52 dB**.

## 6. Testes executados

| Teste | Resultado |
|---|---|
| Typecheck TypeScript | Passou |
| Render Remotion 1.200 frames | Passou |
| FFprobe Remotion | 40,000 s; 1080×1920; 30 fps; H.264/AAC |
| FFprobe CapCut | 40,008 s; 1080×1920; 30 fps; H.264/AAC |
| `verify-mp4.py` CapCut | Passou: `avc1`, 1080×1920, 30 fps, `mp4a` |
| CapCut MCP validate/save | `ok: true`, sem issues |
| Reprodução CapCut | 0–40 s; playhead no fim |
| PSNR Remotion vs CapCut | 49,59 dB (0–40 s) |
| SSIM Remotion vs CapCut | 0,9959 |
| Loudness/true peak | -14,5 LUFS / -1,1 dBFS |
| Sync de áudio | 0 ms / 0,998924 / -26,52 dB |
| Contact sheet | 40 frames; sem frames pretos inesperados |
| Colisão de texto | Nenhuma; margens laterais 78 px |

## 7. Estrutura de arquivos

```
video/projects/investfacil-high-impact-01/
├─ script/
│  ├─ ROTEIRO.md
│  ├─ narracao.txt
│  └─ build_music_sfx.py
├─ audio/
│  ├─ narration/
│  │  ├─ arracao-thalita-m12.mp3
│  │  ├─ arracao-thalita-m12.srt
│  │  └─ arracao-thalita-master.wav
│  ├─ music/
│  │  ├─ music-bed-40s.wav
│  │  └─ music-bed-master.wav
│  └─ sfx/
├─ render/
│  ├─ investfacil-high-impact-01-delivery.mp4
│  ├─ investfacil-high-impact-01-delivery-video-only.mp4
│  ├─ investfacil-high-impact-01-delivery-audio.wav
│  ├─ capcut-export-if_high_impact_01_delivery.mp4
│  ├─ contact-sheet-delivery.png
│  └─ frames-capcut-delivery/
├─ capcut/
│  ├─ build_delivery_draft.py
│  ├─ vectcut-build-delivery-summary.json
│  ├─ capcut-delivery-interop.log
│  ├─ capcut-delivery-open.png
│  ├─ delivery-play-3s.png
│  ├─ delivery-play-end.png
│  ├─ delivery-export-dialog.png
│  └─ delivery-export-dialog-1080.png
└─ docs/
   ├─ RELATORIO_TECNICO.md
   ├─ RELATORIO_QUALIDADE.md
   ├─ ASSETS_LICENSES.md
   ├─ ffprobe-delivery.json
   ├─ ffprobe-delivery.json
   └─ audio-sync-delivery.json
```

## 8. Limitações

- A voz Thalita é edge-tts, um serviço read-aloud não oficial; validar termos comerciais antes de publicar em escala.
- A avaliação perceptual final do áudio (escuta humana) ainda não foi registrada.
- O vídeo tem legendas abertas integradas; não há faixa CC/SRT separada.
- A música é original e funcional, mas não substitui uma trilha licenciada de biblioteca premium.
- O gráfico usa 5% ao ano como exemplo hipotético; está identificado como simulação.
- O export CapCut reencoda o áudio para AAC 44,1 kHz; o Remotion usa 48 kHz. A diferença é inaudível no teste técnico, mas o master é 48 kHz.
- Nenhum asset do Pokémon TCG foi usado. Nenhum upload/push/deploy foi feito.
- Higgsfield não foi usado: não havia acesso/créditos/autorização confirmados.

## 9. Status

- **APROVADO TECNICAMENTE**
- **APROVADO VISUALMENTE** (inspeção frame a frame e contact sheet)
- **APROVADO EM ÁUDIO** (métricas técnicas; escuta humana pendente)
- **PENDENTE DE AVALIAÇÃO HUMANA** para publicação

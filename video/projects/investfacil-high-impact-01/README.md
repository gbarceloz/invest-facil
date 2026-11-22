# INVEST FÁCIL — HIGH IMPACT 01

Produção audiovisual vertical de 40 s sobre perda de poder de compra.
Tema: “Por que R$ 100 hoje não compram a mesma coisa amanhã?”

**Formato:** 1080 × 1920 · 30 fps · 9:16 · H.264/AAC
**Voz:** Thalita (edge-tts pt-BR, -12%) — escolhida pelo usuário
**Música/SFX:** originais, sintetizados localmente
**Status:** aprovado tecnicamente/visualmente; publicação pendente de avaliação humana.

## Entregáveis

| # | Entregável | Caminho |
|---|---|---|
| 1 | Projeto Remotion | `video/src/high-impact/` |
| 2 | Roteiro completo | `script/ROTEIRO.md` |
| 3 | Composição | `src/high-impact/InvestFacilHighImpact01.tsx` |
| 4 | Narração | `audio/narration/narracao-thalita-master.wav` |
| 5 | Música | `audio/music/music-bed-master.wav` |
| 6 | SFX | `audio/sfx/` |
| 7 | Assets/licenças | `docs/ASSETS_LICENSES.md` |
| 8 | Render Remotion | `render/investfacil-high-impact-01-delivery.mp4` |
| 9 | Draft CapCut | `if_high_impact_01_delivery_20261121` |
| 10 | Export CapCut | `render/capcut-export-if_high_impact_01_delivery.mp4` |
| 11 | Contact sheet | `render/contact-sheet-delivery.png` |
| 12 | Capturas CapCut | `capcut/*.png` |
| 13 | Relatório técnico | `docs/RELATORIO_TECNICO.md` |
| 14 | Relatório de qualidade | `docs/RELATORIO_QUALIDADE.md` |

## Especificações finais

- **Remotion:** 40,000 s, 1080×1920, 30 fps, H.264/AAC 48 kHz, 16.722.813 bytes, hash `7A3E6511FEA29C70F1A1689CB37C72081D229D242E747412BBA88A21017F2C6D`.
- **CapCut:** 40,008 s, 1080×1920, 30 fps, H.264/AAC 44,1 kHz, 45.711.955 bytes, hash `180BC0275108AD5870B60281692ACBEF0FF27232E35E49166708146432B1632F`.
- **Loudness:** -14,5 LUFS; true peak -1,1 dBFS.
- **PSNR:** 49,59 dB; **SSIM:** 0,9959.
- **Sync:** lag 0 ms; correlação 0,998924; RMS -26,52 dB.
- **Draft:** 1 vídeo + 1 áudio + 0 textos; validação CapCut MCP `ok: true`.

## Como reproduzir

```powershell
cd <repo>\video
npx remotion studio src/index.ts
npx remotion render src/index.ts InvestFacilHighImpact01 projects/investfacil-high-impact-01/render/novo.mp4
```

O áudio final é normalizado após o render:

```powershell
ffmpeg -i novo.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=9" -c:a aac -b:a 192k final.mp4
```

O draft CapCut é montado por `capcut/build_delivery_draft.py`; os caminhos de mídia
são normalizados por `scripts/fix-capcut-draft-media.py`; a validação é feita
pelo CapCut MCP e a exportação é manual no CapCut 9.8.

## Observações

- Não há SRT separado; a tipografia aberta é a camada de leitura.
- A cesta de produtos é hipotética: R$ 100 → R$ 125 com +25%; R$ 100 compram 4 de 5.
- O gráfico usa 5% ao ano como exemplo, não como projeção.
- A voz Thalita é edge-tts; validar termos comerciais antes de publicação em escala.
- Nenhum asset do Pokémon TCG foi usado.
- Nenhum upload, push, deploy ou crédito pago.

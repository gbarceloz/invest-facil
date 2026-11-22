# Invest Fácil — laboratório audiovisual

Este diretório contém o laboratório experimental de motion graphics do Invest Fácil.
Não é a pipeline de produção final e não gera vídeos oficiais em escala.

## Stack

| Item | Versão/uso |
|---|---|
| Remotion | 4.0.545 |
| React | 19.1.0 |
| Node | 26.13.0 |
| Render | 1080×1920, 30 fps, H.264/AAC |
| Browser do render | Microsoft Edge (`remotion.config.ts`) |
| VectCutAPI | 1.12.3, isolado em `%LOCALAPPDATA%\InvestFacil\tools\VectCutAPI` |
| CapCut | 9.8.0.4213 |
| Blender | 5.3 + addon Blender MCP (teste isolado na porta 9877) |

Licença: o Remotion é gratuito para indivíduos e empresas com até 3 pessoas.
Para equipes maiores, é necessária licença comercial. Ver
`https://www.remotion.dev/docs/license/pricing`.

## Comandos

```powershell
cd <repo>\video
npm install
npx remotion studio src/index.ts
npx remotion still src/index.ts InvestFacilLabV2 out/still.png --frame=90
npx remotion still src/index.ts InvestFacilLabV2Guides out/guide.png --frame=300
npx remotion render src/index.ts InvestFacilLabV2 out/investfacil-lab-v2.mp4
```

## Composições

| ID | Uso |
|---|---|
| `InvestFacilLab` | Baseline original de 19 s; preservado, não sobrescrito |
| `InvestFacilLabV2` | Versão corrigida usada no draft CapCut; legendas abertas, sem SRT separado |
| `InvestFacilLabV2CC` | Variante de avaliação com faixa de legenda integrada; **não** usada no draft final |
| `InvestFacilLabV2Guides` | Variante com guia da área segura de legenda (`y ≥ 1680`) |

Tema: “Por que R$ 100 hoje não compram a mesma coisa amanhã?”

Elementos: tipografia cinética, máscaras, contador, barras, linha animada,
transições, partículas, sound design temporário e narração TTS temporária.

## Legendas

A colisão de 10–15 s foi causada pelo SRT convencional posicionado em
`transform_y = -0.55`, sobre a tipografia cinética inferior. A versão V2
**não adiciona SRT**: a tipografia aberta é o texto de leitura. A variante
`InvestFacilLabV2CC` foi testada e rejeitada para o draft final porque duplicava
o texto já exibido. A faixa segura, se uma legenda fechada for necessária no
futuro, é `y ≥ 1680 px` (`CAPTION_SAFE_TOP` em `InvestFacilLabV2.tsx`).

## Assets

- `public/audio/narracao-temp.wav` — narração temporária do laboratório antigo (Maria); a voz aprovada para produção é Thalita, no projeto High Impact 01.
- `public/audio/sfx-*.wav` — sound design temporário gerado localmente.
- `public/fonts/PlusJakartaSans.ttf` — fonte de identidade (OFL).

## Saídas

- `out/investfacil-lab.mp4` — baseline original (preservado).
- `out/investfacil-lab-v2.mp4` — render limpo da V2 (19,008 s).
- `out/lab-v2-video-only.mp4` — vídeo sem áudio usado no draft.
- `out/lab-v2-audio.wav` — PCM 48 kHz estéreo extraído da V2.
- `out/capcut-export-if_lab_v2_20261121.mp4` — exportação final do CapCut
  (21,014 s, 1080×1920, H.264/AAC).
- `out/v2cc-contact.png` — contact sheet da variante com legenda integrada.
- `out/v2-guide-contact.png` — contact sheet com a guia da área segura.
- `out/blender-isolated-mcp.png` — render do teste Blender isolado.
- `out/blender-isolated-test.glb` — GLB do teste Blender isolado.
- `out/blender-isolated-test.blend` — cena de teste Blender isolada.

## Produção High Impact 01

O projeto `projects/investfacil-high-impact-01/` contém a produção vertical de
40 s, com voz Thalita, música/SFX originais, render Remotion, draft CapCut
`if_high_impact_01_delivery_20261121` e export final. Ver o README do projeto para
entregáveis, hashes e relatórios.

## Voz

As opções e amostras estão em `auditions/VOICE_OPTIONS.md`.
Há 7 amostras normalizadas: edge-tts (Francisca, Antonio, Thalita), OneCore
(Daniel), Piper (Faber medium e Faber slow) e a baseline Maria SAPI.
**Thalita foi aprovada explicitamente pelo usuário em 21/11/2026** e é a voz
padrão das produções. As demais amostras continuam não aprovadas. ElevenLabs
está bloqueado por ausência de chave, créditos e autorização de custo; a
integração não foi chamada. A licença comercial do edge-tts continua pendente
de validação.

## Blender MCP

O teste anterior falhou porque a instância de teste tentou usar a porta 9876,
já ocupada pela instância do projeto Pokémon TCG. Na correção, a instância
isolada usou a porta **9877**, com `--factory-startup`, cena própria e gate que
aborta se encontrar objetos `MCHX_*`. O MCP criou esfera/material, renderizou
800×800, exportou GLB e o GLB foi reaberto em um Blender headless separado.
Nenhum arquivo do Pokémon TCG foi aberto, salvo ou exportado.

## Limitações conhecidas

- A narração é TTS local, com naturalidade insuficiente para produção.
- O roteiro contém um erro factual: “menos de sessenta e um” deveria ser
  “cerca de sessenta e um reais” (100 / 1,05^10 = 61,39). A correção está em
  `auditions/narracao-corrigida.txt`, mas nenhum áudio novo foi gerado.
- O gráfico de linha é simples e ainda não tem eixos/rótulos editoriais.
- A variante `InvestFacilLabV2CC` tem legendas legíveis, mas duplica a
  tipografia aberta; por isso não foi usada no draft final.
- O CapCut mostrou “Duração: 19s” no diálogo de exportação, mas o arquivo
  exportado tem 21,014 s; o rótulo do diálogo não é confiável.
- edge-tts é um serviço read-aloud não oficial; Piper tem licença de modelo a
  confirmar. Nenhum dos dois foi aprovado para produção.
- O Blender MCP está aprovado apenas no teste isolado; ainda não faz parte da
  pipeline oficial.

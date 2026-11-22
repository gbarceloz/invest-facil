# VALIDAÇÃO DO PIPELINE AUDIOVISUAL — INVEST FÁCIL

**Data:** 21/11/2026
**Escopo:** correção das seis pendências do laboratório audiovisual.

> **Atualização — 21/11/2026 · High Impact 01**
> O usuário aprovou explicitamente a terceira voz apresentada (Thalita) e ela
> foi usada na produção `video/projects/investfacil-high-impact-01/`.
> O vídeo final tem 40 s, 1080×1920, 30 fps, render Remotion + export CapCut,
> com música/SFX originais e validação técnica completa. Relatórios:
> `video/projects/investfacil-high-impact-01/docs/RELATORIO_TECNICO.md` e
> `RELATORIO_QUALIDADE.md`. Status da produção: **APROVADO TECNICAMENTE /
> VISUALMENTE / EM ÁUDIO; PENDENTE DE AVALIAÇÃO HUMANA PARA PUBLICAÇÃO**.
> O laboratório anterior teve veredito PARCIAL; esta atualização o supera para
> a produção High Impact 01. O histórico completo permanece neste documento.
**Veredito geral (atualizado):** **APROVADO no plano técnico/visual; PENDENTE
DE AVALIAÇÃO HUMANA PARA PUBLICAÇÃO.**
As pendências 1 (legendas), 2 (áudio), 3 (Blender isolado), 4 (voz — Thalita) e
5 (reexportação CapCut) foram corrigidas e comprovadas. A pendência 6 (revisão
editorial/escuta humana) continua aberta e depende do usuário. Nenhuma
aprovação de publicação foi declarada.

---

## 1. Status das pendências

| # | Pendência | Status | Evidência principal | Limitação restante |
|---|---|---|---|---|
| 1 | Legendas sem colisão | **APROVADO** | V2 sem SRT; draft sem track de texto; contact sheet de 10–15 s sem sobreposição | Decisão editorial: legendas abertas, não CC fechada |
| 2 | Normalização de áudio VectCutAPI | **APROVADO** | Áudio `.wav` real (RIFF/WAVE), 48 kHz, 2 canais, 19,008 s; caminho local; erro claro para arquivo ausente | Patch fica fora do repositório, em `%LOCALAPPDATA%` |
| 3 | Blender MCP isolado | **APROVADO** | Instância própria na porta 9877; cena sem `MCHX_*`; esfera/material/render/GLB; GLB reaberto | Teste isolado, ainda não integrado à pipeline oficial |
| 4 | Voz natural | **APROVADO** (Thalita) | Usuário escolheu a 3ª voz (Thalita); usada no High Impact 01 | Validar licença comercial do edge-tts; escuta final da produção pendente |
| 5 | Reexportar e validar CapCut | **APROVADO** | Draft `if_lab_v2_20261121`; MP4 21,014 s; FFprobe/verify; PSNR 48,74 dB; SSIM 0,9984 | Diálogo do CapCut mostra “19s”, mas o arquivo tem 21,014 s |
| 6 | Revisão editorial e escuta humana | **PARCIAL** | Pacote `docs/EDITORIAL_REVIEW_PACKAGE.md`; checagem automática; correção de roteiro | Revisão humana e escuta não realizadas; erro factual identificado |

**Classificação geral (atualizada):** **APROVADO TECNICAMENTE; PENDENTE DE
AVALIAÇÃO HUMANA.** O pipeline está funcional e comprovado; a publicação
depende de revisão humana, validação da licença edge-tts e decisão sobre
legenda fechada/CC.

---

## 2. O que foi corrigido

### 2.1 Legendas

- O problema era o SRT convencional em `transform_y = -0.55`, sobre a
  tipografia cinética inferior.
- A V2 (`InvestFacilLabV2`) usa **legendas abertas integradas ao design** e
  **não adiciona SRT** ao draft.
- A variante `InvestFacilLabV2CC` foi criada para avaliar uma faixa de legenda
  em `y ≥ 1680`; ela **duplica** o texto já exibido e, quando a legenda tem duas
  linhas, o pill avança sobre a segunda linha do texto inferior em 12–14 s.
  Por isso foi rejeitada para o draft final. Evidência lado a lado:
  `_audit/subtitle-decision-comparison.png`.
- O draft final não tem track de texto (`textSegments: 0`), eliminando a
  colisão na origem.
- A área segura está documentada em `CAPTION_SAFE_TOP = 1680` e verificada
  visualmente em `video/out/v2-guide-contact.png` e
  `_audit/capcut-v2-10-15-contact.png`.

**Arquivos:** `video/src/InvestFacilLabV2.tsx`, `video/src/Root.tsx`,
`video/out/investfacil-lab-v2.mp4`, `video/out/v2cc-contact.png`,
`video/out/v2-guide-contact.png`, `_audit/subtitle-decision-comparison.png`.

### 2.2 Áudio do VectCutAPI

- O VectCutAPI renomeava qualquer áudio para `.mp3`, mesmo quando o conteúdo era
  WAV. O patch preserva a extensão real do container e valida arquivos locais
  ausentes.
- Patch aplicado em
  `%LOCALAPPDATA%\InvestFacil\tools\VectCutAPI\add_audio_track.py`, com backup
  em `_audit/vectcut-patch-backup-20261121/add_audio_track.py` e `.bak` ao lado
  do original.
- O draft final usa `audio_8f6e6674a48278cd.wav`:
  - RIFF/WAVE confirmado (`52 49 46 46 ... 57 41 56 45`);
  - PCM 16-bit, 48 kHz, 2 canais, 19,008 s;
  - caminho dentro da própria pasta do draft CapCut;
  - reaberto e reproduzido no CapCut.
- Teste de erro: `add_audio` com arquivo inexistente retornou
  `success: false` e `Audio file not found`, sem corromper o draft.
- Teste unitário das extensões: `.wav`, `.mp3`, `.m4a`, URL com `.wav` e
  fallback `.mp3`; arquivo ausente levanta `FileNotFoundError`.
  Evidência: `_audit/vectcut-audio-unit-test.log`.

**Evidências:** `_audit/vectcut-lab-v2-summary.json`,
`_audit/vectcut-audio-error-test.json`,
`_audit/capcut-lab-v2-pathfix.json`.

### 2.3 Blender MCP isolado

Causa-raiz do teste anterior: a instância de teste tentou usar a porta **9876**,
que já pertencia à instância do projeto Pokémon TCG. O addon auto-inicia na
porta padrão antes de o script configurar outra porta; por isso o MCP acabava
conectando na instância errada.

Correção:
- Blender iniciado com `--factory-startup`, script próprio e cena própria.
- Porta **9877**, distinta da instância Pokémon (9876).
- Gate de isolamento: o script aborta se encontrar qualquer objeto `MCHX_*`.
- Cena inicial: `IF_Isolated_Sphere`, `IF_Isolated_Ground`, câmera e duas luzes.
- MCP conectado em `localhost:9877`; `get_scene_info` confirmou 5 objetos, nenhum
  `MCHX_*`.
- `execute_blender_code` criou `IF_MCP_Sphere` com material azul, renderizou
  `blender-isolated-mcp.png` (800×800) e exportou
  `blender-isolated-test.glb` (148.188 bytes, cabeçalho `glTF` versão 2).
- O GLB foi reaberto em um Blender headless separado: 3 meshes
  (`IF_Isolated_Ground`, `IF_Isolated_Sphere`, `IF_MCP_Sphere`), nenhum `MCHX_*`.
- A instância isolada foi fechada; a porta 9877 ficou livre. A instância Pokémon
  (PID 43224) permaneceu aberta e não recebeu comandos MCP nesta correção.
- O arquivo `.blend` do teste foi salvo apenas em
  `video/out/blender-isolated-test.blend`; nenhum `.blend` do Pokémon foi
  aberto, salvo ou exportado.

**Evidências:** `_audit/blender-isolated2.log`,
`_audit/blender-isolated-mcp.log`, `_audit/blender-glb-verify.log`,
`video/out/blender-isolated-mcp.png`, `video/out/blender-isolated-test.glb`.

### 2.4 Voz

- Nenhuma voz foi escolhida automaticamente.
- Foram geradas amostras reais com o mesmo texto de 49 palavras:
  - edge-tts: Francisca, Antonio, Thalita;
  - Windows OneCore/WinRT: Daniel;
  - Piper local: Faber medium e Faber slow;
  - baseline Maria SAPI.
- Todas normalizadas para -16 LUFS / -1,5 dBTP em
  `video/auditions/voice-samples/v2-normalized/`, com originais preservados.
- O edge-tts envia apenas o **texto da narração** ao serviço read-aloud da
  Microsoft; nenhum vídeo, imagem, áudio do projeto ou dado do site foi
  enviado. Piper e OneCore são locais.
- Comparação contínua: `comparison.m4a` / `comparison.wav` (128,78 s).
- Tabela completa: `video/auditions/VOICE_OPTIONS.md`.
- ElevenLabs: **BLOQUEADO POR AUTORIZAÇÃO**. O script
  `video/scripts/elevenlabs-status.py` apenas verifica a presença das variáveis
  `ELEVENLABS_API_KEY` / `ELEVENLABS_VOICE_ID`, não imprime a chave e não faz
  chamada de rede. Resultado: nenhuma chave, nenhum crédito, nenhuma chamada.
- **A voz Thalita foi aprovada explicitamente pelo usuário em 21/11/2026** e
  usada no High Impact 01. As demais amostras continuam não aprovadas. Os
  proxies objetivos (taxa de palavras e F0) estão em `objective-analysis.json`
  e não substituem avaliação perceptual. A licença comercial do edge-tts ainda
  precisa ser validada antes de publicação em escala.

### 2.5 Reexportação CapCut

- Draft novo: `if_lab_v2_20261121`.
- Conteúdo: 2 vídeos (V2 + end card), 1 áudio, **0 textos**.
- CapCut MCP: 17 ferramentas; `validate` retornou `ok: true`; `save` concluído.
  A leitura da timeline retorna `durationSec: 19` (campo `duration` do JSON),
  mas os segmentos incluem o end card até 21 s; o MP4 final tem 21,014 s. A
  leitura posterior confirmou 2 vídeos, 1 áudio e 0 textos. O valor confiável
  para entrega é o do arquivo exportado, não o `durationSec` do draft.
- Caminhos de mídia corrigidos para dentro da pasta do draft:
  `draft_content.json` com `assets/audio`, `assets/video`, `assets/image`.
- Dimensões do vídeo corrigidas para 1080×1920 (o VectCutAPI gravava
  1920×1080 por fallback de ffprobe).
- Exportação: `%LOCALAPPDATA%\CapCut\Videos\if_lab_v2_20261121(1).mp4`
  - 9.421.139 bytes (8,98 MB);
  - 21,014 s;
  - 1080×1920, 30 fps, H.264/AAC 44,1 kHz estéreo;
  - SHA-256 `8E33393CB8F435F92C42F64956A9947C6E7F21751A4420DACBD41D7C802FC408`.
- Cópia de evidência: `video/out/capcut-export-if_lab_v2_20261121.mp4`.
- O arquivo `if_lab_v2_20261121.mp4` (0,743 s), exportado antes da correção do
  `export_range`, foi preservado como evidência do bug; **não** é o export
  final. O export válido é o `(1).mp4` de 21,014 s.
- Comparação com o render Remotion:
  - PSNR médio 48,74 dB (0–19 s; aviso de timebase do ffmpeg, valor
    indicativo, corroborado pela inspeção visual);
  - SSIM 0,9984;
  - áudio: `mean_volume=-26,8 dB`, `max_volume=-8,4 dB`, sem clipping;
  - sincronização: lag 0 ms, correlação normalizada 0,999932, diferença RMS
    -39,66 dB;
  - RMS do CapCut por segundo: ~0,03–0,13 durante a fala e 0,00001/0/0 nos
    últimos 2 s (end card silencioso).
- Contact sheet de 10–15 s: nenhuma colisão de texto; legendas abertas
  legíveis; rodapé preservado.
- O diálogo do CapCut exibiu “Duração: 19s” e “cerca de 19 MB”, mas o arquivo
  exportado tem 21,014 s e 8,98 MB. O rótulo do diálogo é enganoso; a validação
  foi feita no arquivo final.

**Evidências:** `_audit/capcut-lab-v2-interop.log`,
`_audit/capcut-lab-v2-readonly.log`,
`_audit/capcut-v2-export-contact.png`,
`_audit/capcut-v2-10-15-contact.png`,
`_audit/lab-v2-capcut-verify.txt`,
`_audit/audio-sync-comparison.json`,
`_audit/audio-sync-comparison.png`,
`_audit/capcut-v2-rms-by-second.json`.

### 2.6 Revisão editorial

- Pacote completo: `docs/EDITORIAL_REVIEW_PACKAGE.md`.
- Roteiro, narração, cenas, duração, texto na tela, legendas, pausas/ênfase,
  arquivos de áudio e riscos.
- Checagem automática: `video/scripts/editorial-check.py` →
  `_audit/editorial-check.json`.
- Achados:
  - **Alerta alto:** a narração diz “menos de sessenta e um”, mas
    100 / (1,05^10) = **61,39**. O correto é “cerca de sessenta e um reais”.
    A versão corrigida está em `video/auditions/narracao-corrigida.txt`;
    nenhum áudio novo foi gerado.
  - **Alerta médio:** “Entenda o dinheiro. Depois, o mercado.” existe na tela
    e no SRT antigo, mas não na narração; é assinatura visual, não fala.
  - Textos de tela não verbatim na narração: “A conta não é sobre o preço…”,
    “O dinheiro não some…”, “Entenda o dinheiro…” — são design, não
    transcrição.
  - Nenhuma frase acima de 18 palavras; média de 8,17 palavras/frase.
  - Ritmo: 2,62 palavras/s; faixa aceitável, confirmar com escuta.
  - Nenhum termo de promessa financeira (“garantido”, “lucro”, “retorno”,
    “sem risco” etc.); disclaimer de exemplo hipotético presente.
  - Gramática não verificada por corretor automático; revisão humana pendente.
- **Revisão humana e escuta humana não foram realizadas.** O material está
  pronto para avaliação do usuário.

---

## 3. Matriz de validação atualizada

| Ferramenta | Versão | Instalação | Integração | Teste realizado | Status |
|---|---|---|---|---|---|
| Remotion | 4.0.545 | `video/` | Render local com Edge | Typecheck, stills, MP4 V2 1080×1920/30 | **APROVADO** |
| VectCutAPI | 1.12.3 | `%LOCALAPPDATA%\InvestFacil\tools\VectCutAPI` | MCP stdio, 11 ferramentas | Draft com vídeo, imagem, áudio WAV real; erro de arquivo ausente | **APROVADO** |
| CapCut MCP | 17 ferramentas | `%LOCALAPPDATA%\InvestFacil\capcut-mcp` | MCP stdio | Read/validate/save; 2 vídeos, 1 áudio, 0 textos | **APROVADO** |
| CapCut 9.8 | 9.8.0.4213 | Instalado | UI desktop | Abrir, reproduzir, exportar 21,014 s | **APROVADO** (técnico) |
| Legendas | V2 aberta / V2CC avaliada | `video/src` | Remotion + draft sem SRT | 10–15 s sem colisão; V2CC rejeitada por duplicação | **APROVADO** (decisão editorial) |
| Voz edge-tts | Francisca/Antonio/Thalita | uvx, sem chave | Local/rede | 3 amostras reais | **APROVADO** (Thalita; Francisca/Antonio não aprovadas) |
| Voz OneCore | Daniel | Windows WinRT | Local | 1 amostra real | **PARCIAL** (escuta pendente) |
| Voz Piper | Faber medium | ONNX local | Local | 2 amostras reais | **PARCIAL** (licença/escuta pendentes) |
| Voz Maria SAPI | Maria Desktop | Windows | Local | Baseline | **REPROVADO** para produção |
| ElevenLabs | — | Sem chave | Não chamada | Status verificado sem rede | **BLOQUEADO POR AUTORIZAÇÃO** |
| Blender MCP | addon 1.5 / protocolo 4 | Blender 5.3 | Socket 9877 | Cena limpa, esfera, material, render, GLB, reabertura | **APROVADO** (isolado) |
| FFprobe/verify-mp4 | CapCut ffprobe / script local | Disponível | CLI/script | V2 e export CapCut | **APROVADO** |

---

## 4. Arquivos modificados

| Arquivo | Mudança |
|---|---|
| `video/src/Root.tsx` | Registra `InvestFacilLabV2`, `V2CC` e `V2Guides` |
| `video/src/InvestFacilLabV2.tsx` | Nova composição; legenda integrada opcional, guia de área segura |
| `video/README.md` | Atualizado com V2, política de legendas, voz e Blender isolado |
| `%LOCALAPPDATA%\InvestFacil\tools\VectCutAPI\add_audio_track.py` | Preserva extensão real do áudio e valida arquivo local ausente |
| `video/scripts/generate-daniel-winrt.ps1` | Corrige o acesso WinRT (reflection) para gerar a amostra Daniel |
| `.gitignore` | Ignora `video/node_modules`, `video/out`, `video/.remotion`, `video/auditions/piper-voices/` e o WAV grande de comparação |

## 5. Arquivos novos

| Arquivo | Conteúdo |
|---|---|
| `video/out/investfacil-lab-v2.mp4` | Render V2, 19,008 s, 1080×1920, 30 fps |
| `video/out/lab-v2-video-only.mp4` | Vídeo sem áudio para o draft |
| `video/out/lab-v2-audio.wav` | PCM 48 kHz estéreo |
| `video/out/capcut-export-if_lab_v2_20261121.mp4` | Exportação CapCut 21,014 s |
| `video/out/v2cc-contact.png` | Contact sheet da variante com legenda integrada |
| `video/out/v2-guide-contact.png` | Contact sheet da área segura |
| `video/out/blender-isolated-mcp.png` | Render Blender isolado 800×800 |
| `video/out/blender-isolated-test.glb` | GLB do teste isolado |
| `video/out/blender-isolated-test.blend` | Cena Blender isolada |
| `video/auditions/VOICE_OPTIONS.md` | Tabela de opções de voz |
| `video/auditions/narracao-corrigida.txt` | Roteiro com correção de 61,39 |
| `video/auditions/voice-samples/v2-*` | Amostras edge-tts, Piper e normalizadas |
| `video/scripts/blender-isolated-test.py` | Cena isolada na porta 9877 |
| `video/scripts/verify-glb.py` | Reabertura headless do GLB |
| `video/scripts/analyze-voice-samples.py` | Proxies objetivos de voz |
| `video/scripts/editorial-check.py` | Checagem automática do roteiro |
| `video/scripts/elevenlabs-status.py` | Verificação sem rede/chave |
| `scripts/fix-capcut-draft-media.py` | Corrige caminhos e metadados do draft |
| `scripts/fix-capcut-export-range.py` | Remove seleção de exportação residual |
| `scripts/verify-audiovisual-package.py` | Checagem final de 47 itens (0 falhas) |
| `video/scripts/compare-audio-sync.py` | Correlação/lag do áudio Remotion vs CapCut |
| `video/scripts/make-voice-comparison.ps1` | Monta a comparação contínua de vozes |
| `video/scripts/normalize-voice-samples.ps1` | Normaliza as amostras para -16 LUFS |
| `video/scripts/make-voice-waveforms.ps1` | Gera as formas de onda |
| `docs/EDITORIAL_REVIEW_PACKAGE.md` | Pacote editorial completo |
| `_audit/*` | Logs, contact sheets, hashes e evidências |

## 6. O que foi preservado

- `video/out/investfacil-lab.mp4` — baseline original, hash
  `D00B92E313DC26DC3E5B271750537CEDE3D516FDC85647E947A997E8A4E30189`.
- `video/out/capcut-export-if_lab_remotion_20261121.mp4` — exportação anterior,
  hash `3359D449B823FDF10E2023C141AB6DA95858AEEAC08BE6E4CEB53C7386EDE07B`.
- Drafts `1023` (`6454EA7F…AFE06D`), `1120` (`F65FA547…C0CCB1`),
  `investfacil_piloto` (`ADDB410F…53837`) e `if_piloto_diversificacao`
  (`3E667BFD…33B58B`) — hashes inalterados.
- O projeto Pokémon TCG não foi aberto, salvo ou exportado nesta correção.
  O teste Blender usou a porta 9877 e uma cena própria; ao final, a porta 9876
  voltou a pertencer à instância Pokémon (PID 43224).
- Nenhum push, merge, deploy ou upload de mídia/draft foi feito. O VectCutAPI
  está com `is_upload_draft=false`; os logs só mostram URLs locais
  (`127.0.0.1:9001`). A única chamada externa foi o edge-tts, que recebeu
  apenas o texto da narração para gerar amostras de voz; nenhum vídeo, imagem
  ou áudio do projeto foi enviado.
- Nenhum serviço pago foi contratado e nenhum crédito foi consumido.

## 7. Checagem final de integridade

`scripts/verify-audiovisual-package.py` executou **47 verificações** de arquivos,
hashes, codecs, durações, caminhos locais, ausência de textos no draft, amostras
de voz, GLB e documentos. Resultado: **0 falhas**.
Evidência: `_audit/final-integrity-check.json` / `.log`.

## 8. Resultados visuais

- V2 mantém a identidade preto/amarelo `#FACC15`, Plus Jakarta Sans e a
  tipografia cinética.
- 10–15 s: o texto inferior “A conta não é sobre o preço…” termina em
  `y ≈ 1660`; a faixa de legenda segura começa em `y = 1680`; o rodapé fica em
  `y ≈ 1852`. Não há sobreposição.
- O export CapCut de 10–15 s mostra o contador de R$ 100 a R$ 61, o gráfico de
  linha e o texto inferior, sem SRT concorrente.
- Comparação lado a lado em `_audit/subtitle-decision-comparison.png`:
  Remotion V2 e CapCut coincidem; a V2CC mostra a legenda integrada duplicando
  os números e encobrindo a segunda linha do texto inferior.
- O contact sheet de 21 s mostra o end card após 19 s; quadros de média baixa
  em 5 s, 15 s e 18–21 s são transições/escuras previstas, não falhas de
  codificação.
- O render Blender isolado mostra as duas esferas (amarela e azul) sobre o
  plano; o GLB reabre com 3 meshes.

## 9. Limitações restantes

1. **Voz:** nenhuma opção foi aprovada. A escuta humana é obrigatória.
2. **Roteiro:** “menos de sessenta e um” é factualmente incorreto; corrigir
   para “cerca de sessenta e um reais” antes da versão oficial.
3. **Legenda fechada/CC:** o laboratório usa legendas abertas; se o produto
   exigir CC, será necessário gerar uma transcrição alinhada e posicioná-la na
   faixa segura, sem duplicar a tipografia.
4. **CapCut:** o diálogo de exportação mostra 19 s, mas o arquivo final tem
   21,014 s; validar sempre o MP4, não o rótulo.
5. **VectCutAPI:** o patch está fora do repositório; se o ambiente for
   reinstalado, reaplicar ou incorporar ao pipeline.
6. **edge-tts / Piper:** licenças e termos de uso comercial precisam de
   validação jurídica antes de produção.
7. **Blender:** aprovado apenas no teste isolado; ainda não há integração
   oficial com a pipeline.
8. **Remotion:** licença gratuita apenas para indivíduos/equipes até 3 pessoas.
9. **Escala:** nenhum vídeo oficial foi produzido; o laboratório não é template
   definitivo.

## 10. Decisões que dependem do usuário

1. Escolher a voz e o provedor após ouvir `comparison.m4a`.
2. Autorizar ou recusar custo de ElevenLabs/Azure.
3. Aprovar a correção do roteiro (“cerca de sessenta e um reais”).
4. Definir se haverá legenda fechada/CC além da tipografia aberta.
5. Aprovar ou não a estética/ritmo do lab como base para a versão oficial.
6. Fazer a revisão humana de português, ritmo e adequação financeira.

## 11. Recomendação

Manter a stack **Remotion → VectCutAPI → CapCut MCP → CapCut 9.8** para o
laboratório. Não iniciar produção em escala até:
- voz aprovada por escuta humana;
- roteiro corrigido e revisado;
- decisão sobre legenda fechada;
- validação jurídica de edge-tts/Piper, se forem usados;
- aprovação editorial do usuário.

**O pipeline técnico está aprovado. A qualidade final não está.**

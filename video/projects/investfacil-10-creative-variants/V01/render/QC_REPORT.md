# V01 — QC FINAL PÓS-TICKER 24

**Data:** 21/11/2026 · **Arquivo:** `V01-ticker-nao-para.mp4`
**Status:** correção do ticker de 24 itens verificada; **nenhuma aprovação humana declarada**.
**Histórico preservado:** `QC_REPORT_PRE_TICKER24.md` (FAIL anterior, duplicata de FEIJÃO em 7,0 s) e `QC_REPORT_DETAILED.md` (pré-correção).

## 1. Especificação verificada

| Item | Resultado |
|---|---|
| SHA-256 (16) | `0C7FC6EE1D242E56` |
| Tamanho | 7.187.894 bytes |
| Duração | 34,10 s |
| Resolução / FPS | 1080 × 1920 · 30/1 |
| Vídeo | H.264 High |
| Áudio | AAC 48 kHz, 2 canais, estéreo |
| Frames | 1.020 |
| Loudness | **−14,1 LUFS** |
| True peak | **−1,4 dBFS** |
| Pico `astats` | −1,446 dB (sem clipping) |

## 2. ANTES (FAIL) × DEPOIS

| Item | Antes — 20 cartões | Depois — 24 cartões |
|---|---|---|
| Itens únicos | 12 | **24** |
| Ciclo | 2.360 px | **2.832 px** |
| FEIJÃO duplicado em 7,0 s | **sim** (topo e rodapé) | **não** |
| ARROZ duplicado na janela 5,8–8,0 s | não | **não** |
| Rótulo superior | 64–70 px | **157 px** |
| Disclaimer (bottom) | 96–98 px | **323 px** |
| Margem esquerda | ~64–70 px | **71 px** |
| CTA “SIGA” em 30,5 s | visível | **visível** |
| Contador 5→4→3 | coerente | **coerente** |
| Hold R$ 61,39 | 23,2–24,3 s | **23,2–24,3 s** |
| Loudness / TP | −14,1 / −1,4 | **−14,1 / −1,4** |

## 3. Ticker — frames 5,8 / 6,5 / 7,0 / 7,5 / 8,0 s

- **5,8 s:** ÁGUA, CAFÉ, PÃO, LEITE, ARROZ, TRANSPORTE, OVOS, FEIJÃO.
- **6,5 s:** DETERGENTE (topo parcial), ÁGUA, CAFÉ, PÃO, LEITE, ARROZ, TRANSPORTE, OVOS, FEIJÃO.
- **7,0 s:** DETERGENTE, ÁGUA, CAFÉ, PÃO, LEITE, ARROZ, TRANSPORTE, OVOS, FEIJÃO.
- **7,5 s:** DETERGENTE, ÁGUA, CAFÉ, PÃO, LEITE, ARROZ, TRANSPORTE, OVOS, FEIJÃO.
- **8,0 s:** DETERGENTE, ÁGUA, CAFÉ, PÃO, LEITE, ARROZ, TRANSPORTE, OVOS.

Nenhum item se repete na janela; **FEIJÃO e ARROZ aparecem uma única vez** por frame. Não há sobreposição de rótulo/preço. A duplicata de FEIJÃO em 7,0 s foi eliminada.

**Observação menor:** no frame 0, o topo da coluna de fundo mostra o preço 27,90 com o rótulo cortado, e o rodapé mostra “ARROZ R$ 27,90”. Não é um cartão ARROZ completo duplicado, mas é um resíduo de seam do ciclo. Se o critério exigir zero repetição de preço no frame 0, ajustar o primeiro/último item; não bloqueia a janela principal.

## 4. Frame 0, safe zone e CTA

- **Frame 0:** “R$ 100” grande, nota ilustrativa, sem lavagem; rótulo superior em y=157.
- **Safe zone medida:** topo 157 px (≥130), disclaimer bottom 323 px (≥250), margem esquerda 71 px. Nada essencial acima de 130 px ou abaixo de 250 px.
- **CTA em 30,5 s:** “SIGA →” visível; “PRÓXIMO VÍDEO: DE ONDE VEM A INFLAÇÃO” cabe entre ~230 e ~850 px, sem transbordo. O mesmo vale em 31,5 s e 33,5 s.
- **Disclaimer:** “Conteúdo educacional. Não é recomendação de investimento. / Áudio de preview interno. Licença comercial pendente.” visível e acima da UI inferior.

## 5. Contador e hold

- **24,6 s:** 5 ícones acesos (café, pão, transporte, leite, ovos), “5 DE 5”.
- **25,6 s:** leite apagado; 4 acesos (café, pão, transporte, ovos), “4 DE 5”.
- **26,5 s:** leite e ovos apagados; 3 acesos (café, pão, transporte), “3 DE 5”.
- O número muda junto com a remoção. Não há “3 com 4 acesos”.
- **Hold de R$ 61,39:** confirmado em 23,2 / 23,7 / 24,3 s.

## 6. Áudio

- **−14,1 LUFS** integrado; **−1,4 dBFS** true peak; LRA 2,4 LU.
- Pico `astats` −1,446 dB; nenhum sample clipado.
- **Não houve escuta humana.** A medição não prova inteligibilidade, naturalidade da Thalita nem ausência de artefatos perceptuais.

## 7. Veredito

**PASS** — a duplicata de FEIJÃO em 7,0 s foi resolvida; a janela 5,8–8,0 s não repete itens, as safe zones estão corretas, o contador acompanha os ícones, o hold de 61,39 existe e o CTA não transborda.

Ressalvas que não bloqueiam o arquivo: resíduo de seam no frame 0 (preço 27,90 com rótulo cortado), ausência de reprodução integral/escuta humana e licença comercial do edge-tts pendente.

| Critério | Nota | Justificativa |
|---|---:|---|
| Técnica | **9** | Container, áudio, safe zone e ticker corretos; sem reprodução integral. |
| Marca | **9** | Sistema e acabamento consistentes; CTA e disclaimer no lugar. |
| Risco | **8** | Sem duplicata na janela principal; resta o seam do frame 0 e a licença de voz. |
| Viabilidade | **9** | Pronto para avaliação interna; publicação depende de escuta, licença e reprodução integral. |

## 8. Declarações

- **Não houve reprodução integral do vídeo** nem **escuta humana** do áudio; a auditoria é por ffprobe, ebur128/astats, frames extraídos e inspeção visual.
- **Nenhuma aprovação humana** é declarada.
- **Nenhuma licença de voz** (edge-tts) ou de Remotion é declarada aprovada.
- Nenhuma publicação, upload, deploy ou re-render foi realizado nesta auditoria.

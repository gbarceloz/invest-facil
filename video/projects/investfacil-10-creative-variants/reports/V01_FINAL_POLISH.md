# V01 — ACABAMENTO FINAL PÓS-DECISÃO

**Data:** 21/11/2026
**Vídeo:** V01 — O ticker não para
**Arquivo final:** `V01/render/V01-ticker-nao-para.mp4`
**Status:** acabamento executado; **não é aprovação de publicação**.

> **Decisão do usuário:** V01 escolhido como vencedor da coleção (nota interna 77,9/100).
> **Aprovação técnica:** PASS condicional, sem escuta humana.
> **Aprovação humana de publicação:** **não concedida**.
> **Publicação/upload/deploy:** **não realizados**.

---

## 1. O que foi preservado

- O ticker e a metáfora “dinheiro parado × preços em movimento”.
- O hook “R$ 100 parece pouco? Não é impressão.”
- A estrutura de 10 cenas e os cortes principais.
- A voz Thalita, sem re-geração e sem aceleração artificial.
- A identidade preto/amarelo/Plus Jakarta.
- O hold de **R$ 61,39**.
- A essência da edição e o CTA de marca.

Não houve reconstrução do conceito. As mudanças são de acabamento.

---

## 2. Auditoria de ritmo e narração

**Narração:** 10 linhas, 33,535 s, taxa -12%, Thalita. Nenhuma linha foi regravada.
**Pausas medidas:** 120–250 ms. As duas pausas maiores são intencionais (após “Isso é inflação” e após “O poder de compra, não”).

| Transição | Pausa | Avaliação |
|---|---:|---|
| L01 → L02 | 150 ms | ok |
| L02 → L03 | 120 ms | ok |
| L03 → L04 | 120 ms | ok |
| L04 → L05 | 140 ms | ok |
| L05 → L06 | 250 ms | intencional |
| L06 → L07 | 120 ms | ok |
| L07 → L08 | 160 ms | ok |
| L08 → L09 | 240 ms | intencional |
| L09 → L10 | 120 ms | ok |

**Nenhuma pausa acima de 300 ms.** Não havia tempo morto de fala a eliminar; o ajuste foi visual e de mixagem.

### Função de cada cena

| Tempo | Cena | Função |
|---|---|---|
| 0,00–3,33 | Hook | R$ 100 + “não é impressão” |
| 3,33–5,66 | Preços | preços em movimento |
| 5,66–8,20 | Mesmo número | nota parada × ticker |
| 8,20–12,33 | Menos café/pão/transporte | prova item a item |
| 12,33–13,83 | Inflação | nomear o fenômeno |
| 13,83–18,07 | Poder de compra | cesta 10 → 6 |
| 18,07–24,33 | Simulação | 100 → 61,39 |
| 24,33–27,89 | Contraste | 3 de 5 |
| 27,89–30,03 | Primeiro passo | ponte editorial |
| 30,03–34,10 | End card | CTA, marca e disclaimer |

O bloco de 6,3 s da simulação não é um hold morto: o número anima de 100 a 61,39, e o último 1,1 s é o hold intencional do payoff.

---

## 3. Mudanças aplicadas

### 3.1 Safe zones e legibilidade

| Item | Antes | Depois |
|---|---:|---:|
| Rótulo superior | top 64 px | **top 156 px** |
| Disclaimer | bottom 96 px | **bottom 320 px** |
| Kickers de cena | 22 px | **24 px** |
| Rótulos do ticker | 16 px | **18 px** |
| Preços do ticker | 26 px | **30 px** |
| Rodapés didáticos | 20 px | **22 px** |
| Labels da simulação | 19–24 px | **21–26 px** |
| “Próximo vídeo” | 22 px | **24 px** |

Margens laterais mantidas em 70 px (esquerda) e 120 px (direita).

### 3.2 Hook e ticker

- “NÃO É IMPRESSÃO.” antecipado de **1,33 s para 0,40 s**.
- Ticker passou de 8 para **24 itens únicos** (novos itens de cesta), eliminando a duplicata visível de Arroz.
- Máscara vertical no ticker da cena “MESMO NÚMERO”, para o corte do topo parecer intencional.
- Nenhuma colisão de rótulos ou preços.

### 3.3 Contador “3 de 5”

Antes, o texto “3 DE 5” aparecia enquanto quatro ícones ainda estavam acesos. Agora o contador é **5 → 4 → 3**, sincronizado com a remoção de leite e ovos.

### 3.4 CTA

- Texto trocado de “PRÓXIMO VÍDEO: A INFLAÇÃO” para **“PRÓXIMO VÍDEO: DE ONDE VEM A INFLAÇÃO”**, evitando prometer o mesmo tema que o vídeo acabou de explicar.
- O botão “SIGA” agora aparece por fade a partir de 30,1 s e está visível em 30,5 s.

### 3.5 Simulação

- `SIM_POINTS` corrigido de 61,4 para **61,39**.
- Pulso sutil do painel no momento em que o valor trava em 61,39.
- Hold preservado entre ~23,2 s e 24,3 s.

### 3.6 Áudio

| Item | Antes | Depois |
|---|---|---|
| Música | 0,23 | **0,20** |
| Impacto do hook | 0,50 | **0,42** |
| Bass hit / sub drop | 0,45 / 0,38 | **0,34 / 0,28** |
| Clicks da cesta | 0,10, fora do corte | **0,08, alinhados a 14,1/14,4/14,7/15,0** |
| Whooshes de card | 9,3 / 10,6 | **9,33 / 10,47** |
| Ticks sem evento | 4,2 / 4,8 | **removidos** |
| Whoosh sem evento | 7,5 | **removido** |
| Whoosh no corte para “Poder de compra” | ausente | **adicionado em 13,829** |

Narração intocada. Nenhum pico novo; loudness e true peak medidos no MP4 final.

---

## 4. Comparação antes/depois

| Métrica | Vencedor pré-acabamento | Final pós-acabamento |
|---|---|---|
| Arquivo | `V01-ticker-nao-para-pre-polish.mp4` | `V01-ticker-nao-para.mp4` |
| Duração | 34,10 s | 34,10 s |
| Tamanho | 6.813.508 bytes | 7.187.894 bytes |
| Loudness | -14,2 LUFS | **-14,1 LUFS** |
| True peak | -1,3 dBTP | **-1,4 dBTP** |
| LRA | 2,4 LU | 2,4 LU |
| SHA-256 | `AF4CCEB3FA04BD6F…` | `0C7FC6EE1D242E56…` |
| Ticker | 8 itens, duplicata visível | 24 itens, sem duplicata |
| Safe zone topo | 64 px | **156 px** |
| Disclaimer | 96 px do rodapé | **320 px do rodapé** |
| “3 de 5” | prematuro | **5→4→3 sincronizado** |
| CTA visível | ~30,7 s | **~30,5 s** |

Frames de inspeção: `V01/render/frames-polish/`.
Checklist: `V01/render/EDITORIAL_CHECKLIST.md`.
Safe zone: `V01/render/SAFE_ZONE_CHECK.md`.

---

## 5. Validação técnica

- 1080×1920, 30/1, H.264 High, AAC 48 kHz estéreo.
- 1.020 frames de vídeo; 34,10 s.
- Loudness integrado **-14,1 LUFS**; true peak **-1,4 dBTP**.
- `silencedetect` a -45 dB/1 s: nenhum silêncio longo.
- Nenhum clipping; TP dentro do teto.
- Whisper `small` no arquivo final: transcrição coerente, sem regressão de fala.
- **Não houve reprodução integral nem escuta humana.**

### 5.1 QC final independente

**PASS.** Técnica **9**, marca **9**, risco **8**, viabilidade **9**. A duplicata de FEIJÃO em 7,0 s foi eliminada com 24 itens únicos; safe zones, contador 5→4→3, hold de 61,39 e CTA foram confirmados.

**Ressalva menor:** no frame 0, o seam do ticker de fundo mostra o preço 27,90 com o rótulo cortado no topo. É decorativo e não bloqueia; se o critério exigir zero repetição de preço no frame 0, ajustar o primeiro/último item numa próxima passada.

---

## 6. CapCut — preparação, sem deploy

- Draft: `dfd_cat_1795291509_c004cef0` (`if_gate4_v01_ticker_nao_para`).
- Asset de vídeo do draft substituído pelo final; SHA-256 confere:
  `0C7FC6EE1D242E5608519ADC15D73856A5B6A7FD6A99674E6D5E22A420C9500B`.
- WAV do draft atualizado a partir do final.
- Estrutura revalidada: 1 vídeo, 1 áudio, 2 segmentos, caminhos existentes, 0 falhas.
- Duração do draft corrigida de 60 s para **34,1 s**; material de vídeo ajustado para **1080×1920**.
- **Não deployado à pasta do CapCut e não exportado.** O app estava aberto (8 processos) e não foi fechado à força.
- High Impact 01 preservado.

---

## 7. Pendências e limites

- **Escuta humana:** não realizada.
- **Licença comercial do edge-tts:** pendente; áudio é preview interno.
- **Licença Remotion:** elegibilidade individual declarada, não verificada juridicamente.
- **Safe zone real:** medidas de design aplicadas; overlay real de TikTok/Reels não testado.
- **Reprodução integral:** não realizada.
- **Export CapCut:** manual e pendente.
- **Aprovação de publicação:** não concedida.

Nada foi publicado, enviado, monetizado ou deployado.

---

## 8. Declarações

- V01 venceu o ranking interno com 77,9/100.
- O usuário escolheu V01 como vencedor da coleção.
- O acabamento foi autorizado e executado.
- **A escolha do usuário não é aprovação de publicação.**
- Nenhuma aprovação humana, licença comercial ou direito de distribuição foi declarado.
- O vencedor segue como referência de qualidade, não como molde obrigatório para as próximas produções.

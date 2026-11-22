# GATE 4 — AVALIAÇÃO DE SOM DOS 10 VÍDEOS REAIS

**Escopo:** MP4s Remotion de V01–V10. **Não houve escuta humana.** Whisper `small` é proxy de inteligibilidade, não de naturalidade.
**Transcrições:** existem para V01–V04; V05–V10 não têm `render/whisper/`. **Licença edge-tts pendente; nenhuma aprovação humana ou licença declarada.**

## 1. Medições e notas

| V | LUFS | True peak | LRA | Low120 vs full | Mid300–3k vs full | Whisper | Identidade | Thalita | Mixagem | Média |
|---|---:|---:|---:|---:|---:|---|---:|---:|---:|---:|
| V01 | -14,3 | -1,3 | 2,5 | -2,9 dB | -6,1 dB | sim | 8 | 8 | 6 | 7,33 |
| V02 | -14,0 | -1,4 | 2,7 | -5,8 dB | -3,9 dB | sim | 9 | 8 | 8 | **8,33** |
| V03 | -14,1 | -1,1 | 2,0 | -4,9 dB | -4,4 dB | sim | 8 | 7 | 7 | 7,33 |
| V04 | -14,1 | -1,4 | 2,2 | -4,2 dB | -5,1 dB | sim | 6 | 6 | 6 | **6,00** |
| V05 | -14,1 | -1,4 | 2,1 | -6,3 dB | -3,7 dB | não | 9 | 8 | 8 | **8,33** |
| V06 | -14,0 | -1,5 | 2,2 | -4,6 dB | -4,7 dB | não | 7 | 8 | 7 | 7,33 |
| V07 | -14,1 | -1,6 | 2,4 | -4,6 dB | -4,6 dB | não | 6 | 7 | 8 | 7,00 |
| V08 | -14,0 | -1,3 | 2,0 | -4,7 dB | -4,5 dB | não | 8 | 8 | 8 | 8,00 |
| V09 | -14,0 | -1,3 | 2,9 | -5,7 dB | -4,0 dB | não | 7 | 8 | 7 | 7,33 |
| V10 | -14,0 | -1,5 | 2,4 | -6,8 dB | -3,7 dB | não | 9 | 7 | 8 | 8,00 |

Low/Mid são RMS da banda menos RMS do mix completo; quanto mais perto de 0, mais energia na banda. Todos os LUFS/TP estão dentro da meta; TP de V03 é o mais próximo do limite.

## 2. Justificativa por vídeo

- **V01:** Whisper limpo; TP -1,3; LRA 2,5. Low -2,9 dB é o mix mais grave e o mid -6,1 dB é o mais fraco; hook a RMS -8,2 dB (6 dB acima do integrado). Pré-reveal -22,4 dB vs reveal -10,0 dB: contraste real e bom.
- **V02:** Whisper limpo, mas o SRT diz “61%” em “poder de compra cai para cerca de 61”; risco semântico. Low -5,8/mid -3,9: voz à frente; LRA 2,7; TP -1,4.
- **V03:** Whisper ouviu “Continua sem” (para “continua cem”) e “compra? Sim” (para “compra, sim”); são falhas de proxy, mas apontam articulação/pausa. TP -1,1 é a menor margem; low -4,9/mid -4,4 é equilibrado.
- **V04:** Whisper ouviu “Precios” (para “preços”) e transformou “Entender inflação muda…” em pergunta (“Se a sua inflação muda…”). Low -4,2/mid -5,1: mid fraco num vídeo de 30 s e fala densa; o mix mais frágil.
- **V05:** Sem transcript. Low -6,3/mid -3,7 é um dos balanços mais favoráveis à voz. Porém o “silence” em 18,8–19,4 s tem RMS -18,3 dB, mais alto que o número em 22,6–23,1 s (RMS -22,1 dB): o rótulo não corresponde à medição; revisar a automação.
- **V06:** Sem transcript. Low -4,6/mid -4,7: equilibrado; LRA 2,2; TP -1,5. Sem evidência de mascaramento, mas a naturalidade não foi verificada.
- **V07:** Sem transcript. Low -4,6/mid -4,6: equilibrado; TP -1,6 é a melhor margem do lote; LRA 2,4. Identidade de UI ainda se sobrepõe a V01.
- **V08:** Sem transcript. Low -4,7/mid -4,5: equilibrado; LRA 2,0 (empatado com V03) é o mais comprimido; TP -1,3. A identidade social é clara, mas a compressão pode achatar o humor.
- **V09:** Sem transcript. Low -5,7/mid -4,0: voz à frente; LRA 2,9 é o mais dinâmico; TP -1,3. O sub/impact ainda pede checagem em celular.
- **V10:** Sem transcript. Low -6,8/mid -3,7: o mix mais voz-à-frente; LRA 2,4; TP -1,5. A poesia depende de prosódia que o Whisper não avalia.

## 3. Top 3, mais fraco e must-fix

1. **V02 — 8,33:** transcript inteligível, com um único risco semântico (“61%”), e mix mid-forward.
2. **V05 — 8,33:** balanço espectral favorável à voz, mas o “silence” não tem dip mensurável no ponto do número; sem transcript.
3. **V08 — 8,00:** equilíbrio 8/8/8 e baixo risco de mixagem; desempata com V10 pela adequação à Thalita (8 vs 7).

**Mais fraco: V04 — 6,00.** Não é a voz isolada: é o conjunto de mid fraco, fala densa em 30 s e transcript com “precios” e entonação de pergunta.

**Must-fix:**
- **P0 — V02/V03:** trocar “cerca de 61” por “cerca de sessenta e um reais” na entrada do TTS; o SRT de V02 lê “61%”.
- **P0 — V03:** refazer “continua cem” e “compra, sim” com articulação mais clara e pausa menor; o proxy ouviu “sem” e “compra? Sim”.
- **P0 — V04:** refazer “preços” (ouvido “precios”) e “Entender inflação muda…” com entonação descendente; o proxy ouviu uma pergunta.
- **P1 — V05:** corrigir a automação: o dip deve anteceder o número e ficar abaixo dele, não 4 dB acima.
- **P1 — V01:** reduzir graves em 2–3 dB (low120 a -2,9 dB do full) e domar o hook (RMS -8,2 dB); high-pass nas camadas não-baixo em 120 Hz.
- **P1 — V03:** baixar 0,3–0,5 dB; TP -1,1 deixa só 0,1 dB até o teto antes de reencode CapCut.
- **P1 — cobertura:** gerar Whisper para V05–V10; 6/10 não têm SRT em `render/whisper/`, embora o QC afirme que o proxy foi usado.
- **P2 — V04:** presença de 2–3 dB em 1–3 kHz na voz ou corte de graves; o mid está 5,1 dB abaixo do full.
- **P2 — todos:** não há silêncio absoluto ≥0,25 s abaixo de -25 dB em nenhum arquivo; o bed preenche o fundo. Criar dips de 150–250 ms antes das revelações, exceto onde já há contraste (V01).
- **P2 — V08:** LRA 2,0; se soar plano, adicionar 1–2 dB de contraste no reveal, não no loudness geral.

## 4. Riscos

**Voz:** não houve escuta humana. O Whisper `small` confunde “cem” com “sem”, “preços” com “precios” e pontua frases como perguntas; isso não prova erro de TTS, mas impede declarar naturalidade ou pronúncia correta. V01 é o transcript mais limpo; V02 é inteligível, com a ressalva do “61%”; V03/V04 concentram desvios; V05–V10 não têm proxy.
**Música:** todos os arquivos têm LRA 2,0–2,9 LU e nenhum silêncio absoluto ≥0,25 s abaixo de -25 dB: o bed é contínuo e comprime a dinâmica. V01 é grave-demais; V04 tem mid fraco; V05/V10 são os mais voz-à-frente. Musicalidade, loop seams e fadiga não foram avaliados.
**SFX:** não há medição por SFX; o excesso de low em V01 e o mid fraco em V04 sugerem que impactos/sub podem competir com a voz. TP de V03 é o mais exposto a clipping no reencode. Sincronia e repetição de whoosh não foram verificadas sem escuta.
**Pausas:** não há pausa absoluta longa (≥0,25 s); o “silêncio” é relativo. V01 tem dip de 12,4 dB antes do reveal (funciona); V02 tem 7,5 dB (funciona); V05 não tem dip mensurável no ponto do número. As pausas de V05–V10 não podem ser verificadas sem transcript/escuta.
**Licença:** edge-tts é preview interno; uso comercial pendente. Nenhuma publicação autorizada.

## 5. Veredito

- **Nenhuma escuta humana foi realizada.** As notas são avaliação técnica/editorial sobre medições reais de loudness, banda e transcript proxy.
- **Licença edge-tts pendente; nenhuma aprovação humana ou liberação comercial declarada.**
- Top 3 sonoro: **V02, V05, V08**; mais fraco: **V04**. Ranking de som, não decisão final.

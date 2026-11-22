# GATE 3 — AVALIAÇÃO DE SOM (RODADA 2)

**Escopo:** V01–V10, documentos finais. **Nenhum áudio foi gerado.** Notas sobre plano sonoro, não sobre som renderizado.
**Limites:** escuta humana pendente; licença edge-tts pendente; nenhuma aprovação humana ou licença declarada.

## 1. Timing e densidade (fonte: GATE3_V2_CHANGELOG.md)

| V | Duração | Caract. falados | Caract./s | Fala estimada | Ocupação | Pausa média/intervalo | Linhas |
|---|---:|---:|---:|---:|---:|---:|---:|
| V01 | 33 s | 432 | 13,1 | 30,9 s | 93,5% | 177 ms | 10 |
| V02 | 42 s | 550 | 13,1 | 39,3 s | 93,5% | 197 ms | 12 |
| V03 | 33 s | 432 | 13,1 | 30,9 s | 93,5% | 159 ms | 11 |
| V04 | 30 s | 372 | 12,4 | 26,6 s | 88,6% | 288 ms | 11 |
| V05 | 36 s | 466 | 12,9 | 33,3 s | 92,5% | 271 ms | 9 |
| V06 | 37 s | 485 | 13,1 | 34,6 s | 93,6% | 226 ms | 9 |
| V07 | 40 s | 533 | 13,3 | 38,1 s | 95,2% | 172 ms | 9 |
| V08 | 41 s | 538 | 13,1 | 38,4 s | 93,7% | 225 ms | 10 |
| V09 | 37 s | 485 | 13,1 | 34,6 s | 93,6% | 201 ms | 10 |
| V10 | 39 s | 505 | 12,9 | 36,1 s | 92,5% | 216 ms | 12 |

Fala = caracteres/14,0; pausa média = (duração − fala − 0,55 s de cauda)/(linhas−1). É orçamento de roteiro, não medição de TTS.

## 2. Notas por vídeo (0–10)

| V | Identidade sonora | Adequação à Thalita | Viabilidade de mixagem | Média |
|---|---:|---:|---:|---:|
| V01 | 8 | 7 | 7 | 7,33 |
| V02 | 9 | 9 | 7 | **8,33** |
| V03 | 8 | 8 | 7 | 7,67 |
| V04 | 6 | 7 | 5 | **6,00** |
| V05 | 9 | 8 | 9 | **8,67** |
| V06 | 7 | 8 | 7 | 7,33 |
| V07 | 6 | 7 | 8 | 7,00 |
| V08 | 8 | 9 | 8 | **8,33** |
| V09 | 7 | 8 | 6 | 7,00 |
| V10 | 9 | 7 | 6 | 7,33 |

## 3. Justificativas

- **V01:** ticker/impacts é coerente e próprio; 10 acentos em 33 s; cluster 11,8→13,2 s. Voz urgente e seca agora cabe em 13,1 c/s.
- **V02:** café/piano/silêncio é a paleta mais emocional; 11 acentos + 1 silêncio em 42 s; risco de ambiência e piano mascararem a voz.
- **V03:** máquina/engrenagem é a identidade mais física; 11 eventos em 33 s; 12,9→14,9 s no limite; bed mecânico pode virar ruído.
- **V04:** 120 BPM/glitch é a paleta mais genérica; 3 clusters <2 s e 288 ms de pausa média; o quiz perde fluidez.
- **V05:** room tone/piano/silêncio é a proposta mais premium; 8 acentos + 1 silêncio em 36 s; mix mais limpo, mas o silêncio expõe o piso de ruído.
- **V06:** pulso/reversed/sub sustenta a tensão; 9 eventos em 37 s; subs em 0,0 e 18,8 s acumulam graves.
- **V07:** tick/UI é coerente, mas se sobrepõe a V01; 95,2% de ocupação e 172 ms de pausa dificultam a direção “calma”.
- **V08:** keyboard/pop é a assinatura social mais clara; 10 eventos em 41 s; 3 subs pedem controle de graves.
- **V09:** cinematic/impact/sub/sting dá gravitas; 10 eventos em 37 s; sting em 32,3 s deixa 4,7 s de end card.
- **V10:** drone/piano/reversed é a identidade mais poética; 12 acentos em 39 s; risco de saturar um texto que pede respiro.

## 4. Top 3, mais fraco e must-fix

1. **V05 — 8,67:** melhor combinação (identidade 9, voz 8, mix 9); silêncio controlado e poucos acentos.
2. **V02 — 8,33:** identidade 9 e voz 9; mix 7 por piano/ambiência; melhor arco emocional.
3. **V08 — 8,33:** equilíbrio 8/9/8; desempata com V02 pela identidade (9>8).

**Mais fraco: V04 — 6,00:** clusters de SFX, identidade genérica e pausa média de 288 ms; é problema de desenho, não de voz.

**Must-fix:**
- **P0 — TTS:** expandir números no texto enviado: “cem reais”, “cinco por cento”, “sessenta e um reais”; testar “R$” isolado.
- **P0 — V04:** remover 3 clusters <2 s (2,3/3,5; 17,2/18,9; 18,9/20,3); manter 8 acentos.
- **P0 — V01:** “whoosh x3” em 8,0 s é ambíguo; definir 1 acento empilhado ou 3 pontos com ≥2 s.
- **P1 — silêncio pré-revelação:** nenhuma das 10 tem silêncio corretamente posicionado; adicionar 200–300 ms nos pontos da tabela 3.
- **P1 — beds:** mechanical (V03), ambience (V02), room tone (V05), ambient (V10), piano e ticks são camas; mover para música/ambiência.
- **P1 — V07:** cortar ~25 caracteres ou +2 s; 95,2% de ocupação com 172 ms dificulta a direção “calma”.
- **P1 — V04/V05:** marcar quais pausas são intencionais (200–300 ms); 288/271 ms de média não pode ser todo “padrão”.
- **P2 — V09:** encurtar brand sting de 4,7 s para 1,5–2,5 s + cauda.
- **P2 — V08/V10:** V08 de 3 para 2 subs; V10 de 12 para 11 acentos (remover 1 whoosh).
- **P2 — assinatura:** criar motivo de 3 notas Invest Fácil, 1,2–1,8 s, reutilizado nos 10 end cards com instrumentação diferente.

## 5. Mapa de SFX — conformidade

| V | Acentos | Menor intervalo | <2 s? | Silêncio pré-revelação | Ação |
|---|---:|---|---|---|---|
| V01 | 10 | 1,4 s (11,8→13,2) | SIM | ausente em 11,8 | mover sub p/ 13,8; +silêncio 11,5–11,8 |
| V02 | 11 | 1,9 s (9,6→11,5) | SIM | 14,1 no ponto; antecipar | afastar clock p/ 11,7; +200 ms antes de 14,1 |
| V03 | 11 | 2,0 s (12,9→14,9) | NÃO | ausente em 12,9 | +silêncio 12,6–12,9; bed mecânico fora do SFX |
| V04 | 11 | 1,2 s (2,3→3,5) | SIM | ausente em 14,3 | remover clusters; +silêncio 14,0–14,3 |
| V05 | 8 | 4,0 s (7,0→11,0) | NÃO | 19,0 está 3,9 s antes do número | mover silêncio p/ 22,6–22,9 |
| V06 | 9 | 3,1 s (29,1→32,2) | NÃO | ausente em 15,4 | +silêncio 15,1–15,4 |
| V07 | 9 | 3,2 s (28,0→31,2) | NÃO | ausente em 17,7 | +silêncio 17,4–17,7 |
| V08 | 10 | 2,3 s (31,0→33,3) | NÃO | ausente em 14,0 | +silêncio 13,7–14,0; 2 subs |
| V09 | 10 | 2,0 s (2,7→4,7) | NÃO | ausente em 15,3 | +silêncio 15,0–15,3 |
| V10 | 12 | 2,2 s (2,6→4,8) | NÃO | ausente em 18,4 | +silêncio 18,1–18,4; −1 whoosh |

## 6. Riscos

**Voz:** 14 c/s é orçamento, não medição; TTS real não gerado. Se Thalita entregar 13,0 c/s, V07 estoura; se 15,0, sobra ar. Conflitos de direção: V05 “baixa/lenta” vs diretiva “contínua/energética”; V07 “calma” com 95,2%; V09 “gravitas” vs brilho padrão da Thalita; V10 “poética” vs prosódia TTS. Perguntas (V04/V05), citação (V08) e marca (V09) podem sair planas; testar pontuação e split por frase. Normalizar cada linha a -16 LUFS e unir com crossfade de 5 ms.
**Música:** só existe 1 bed (100 BPM, A menor); faltam 110 (V01), 120 (V04), piano (V02/V05), tech mínimo (V07), cinemático (V09), drone (V10). O bed de referência tem LRA 1,0 LU; V02/V09/V10 precisam de arco dinâmico. Piano (V02/V05/V10) e ticks (V01/V07) mascaram 250–400 Hz e 2,5–3,5 kHz; aplicar ducking -10 dB / 150/400 ms + EQ dinâmico. Sub drops <100 Hz não aparecem em celular; adicionar harmônico em 120–180 Hz e mono abaixo de 120 Hz.
**SFX:** 8 famílias ausentes (coin, paper, clock, mechanical, room tone, café, keyboard, piano); criar ou licenciar. Mesmo whoosh em V01/V04/V07/V09; variar ou remover em V02/V05/V10. Impacto sobre a primeira sílaba (V01/V04/V09 em 0,0 s) mascara o hook; entrar 40–80 ms depois. Caudas de SFX sobre fala; fade 40–80 ms e duck de -3 dB na música, não na voz.
**Pausas:** V04 288 ms, V05 271 ms, V06 226 ms, V08 225 ms, V10 216 ms estão acima de 140 ms; marcar como intencionais ou reduzir. V07 172 ms é apertado; “calma” não cabe. V01 177 ms, V03 159 ms, V09 201 ms são aceitáveis. O orçamento médio não indica pausa >300 ms; o risco agora é o oposto: média alta demais em V04/V05. O silêncio de V02 em 0,0 s deve ser ≤300 ms, ou atrasa o hook.

## 7. Loudness e mixagem

- **Meta:** -14 LUFS integrado; true peak ≤ -1,0 dBTP. **Não medido:** nenhum áudio das 10 variantes existe.
- **Pré-master:** voz -16 LUFS; música -30 a -27 LUFS; ambiência -40 LUFS; SFX pico -6 dBFS.
- **Limiter:** ceiling -1,5 dBTP antes do AAC; o encode pode subir 0,3–0,8 dB.
- **Medição:** I/LRA/TP depois do encode, não só no WAV; registrar os valores por variante.
- **Ducking:** -10 dB, attack 150 ms, release 400 ms; high-pass na música em 180–220 Hz, exceto sub.
- **Se poluir, remover nesta ordem:** ticks contínuos → whoosh → sub → piano sob a voz → impactos empilhados.

## 8. Veredito

- **Nenhum áudio das 10 variantes existe.** As notas avaliam plano sonoro e timing, não som renderizado.
- **Escuta humana pendente; licença edge-tts pendente; nenhuma aprovação humana ou licença declarada.**
- Top 3 sonoro: **V05, V02, V08**; mais fraco: **V04**. Este ranking é insumo, não decisão final.

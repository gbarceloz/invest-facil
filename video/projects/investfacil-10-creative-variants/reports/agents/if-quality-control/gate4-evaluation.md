# GATE 4 — AUDITORIA TÉCNICA DOS 10 VÍDEOS

**Data:** 21/11/2026 · **Escopo:** 10 MP4 finais, ffprobe, loudness, QC_REPORT, frame0 e contact sheets; ffprobe/ffmpeg executados por mim, com extração de frames e blackdetect/silencedetect.
**Evidência:** `reports/GATE4_PRODUCTION_INDEX.md`; 10 `render/ffprobe.json`; 10 `render/loudness.json`; 10 `render/QC_REPORT.md`; 10 `frame0.png`; 10 `contact-sheet.png`; frames em `reports/agents/if-quality-control/gate4-frames/`; hashes SHA-256 calculados localmente.

## 1. Tabela

| ID | Técnica | Marca | Risco (10 = baixo) | Viabilidade | Veredito |
|---|---:|---:|---:|---:|---|
| V01 | 6 | 8 | 4 | 5 | **FAIL visual / VETO** |
| V02 | 8 | 9 | 7 | 6 | PASS com ressalva |
| V03 | 9 | 9 | 8 | 8 | PASS |
| V04 | 9 | 9 | 8 | 9 | PASS |
| V05 | 9 | 9 | 8 | 8 | PASS |
| V06 | 9 | 9 | 7 | 8 | PASS |
| V07 | 8 | 8 | 7 | 7 | PASS com ressalva |
| V08 | 9 | 8 | 8 | 8 | PASS |
| V09 | 8 | 7 | 4 | 5 | PASS técnico / FAIL editorial |
| V10 | 9 | 9 | 8 | 8 | PASS |

**Técnica** = container, áudio, duração e integridade visual mensurável. **Marca** = aderência ao sistema preto/amarelo/Plus Jakarta, logo, disclaimer e tom. **Risco** = exposição editorial/compliance. **Viabilidade** = distância até finalização/publicação interna.

## 2. Especificação verificada (ffprobe próprio)

Todos os 10: **1080×1920 · 30/1 · H.264 High yuvj420p · AAC 48 kHz estéreo ~191 kb/s · duração 30,1–41,8 s**. Nenhum fora do formato.

| ID | Duração | Loudness | True peak | Tamanho | SHA-256 (16) |
|---|---:|---:|---:|---:|---|
| V01 | 34,10 s | −14,3 LUFS | −1,3 dBTP | 6,42 MiB | `80C37FF5C5A34827` |
| V02 | 41,80 s | −14,0 | −1,4 | 6,16 | `D4EC427B07E60973` |
| V03 | 33,30 s | −14,1 | −1,1 | 5,63 | `83271D2EF134A3BD` |
| V04 | 30,10 s | −14,1 | −1,4 | 4,58 | `11E08D7556AA09A3` |
| V05 | 35,00 s | −14,1 | −1,4 | 5,15 | `3AC507BC45BA463A` |
| V06 | 40,10 s | −14,0 | −1,5 | 5,94 | `5366610D94463156` |
| V07 | 40,20 s | −14,1 | −1,6 | 5,74 | `4A1161B1E861D5EB` |
| V08 | 41,30 s | −14,0 | −1,3 | 6,24 | `E2FE4F1C316D0396` |
| V09 | 39,10 s | −14,0 | −1,3 | 5,82 | `9BC966CDD4541EA7` |
| V10 | 40,20 s | −14,0 | −1,5 | 6,54 | `00476AE9086E173E` |

- `silencedetect` (−45 dB, ≥1 s): nenhum silêncio longo em nenhum dos 10.
- `blackdetect` (0,25 s): só V07 acusou 0,6 s em 7,57 s e 0,7 s em 17,1 s. Inspeção em 7,8 s e 17,4 s mostra gráfico e texto visíveis: são frames escuros de design, não dead frames. Não é falha.
- Não há clipping: todos os true peaks ≤ −1,1 dBTP.

## 3. Veredito por vídeo

- **V01 — PASS de container; FAIL visual / VETO.** Em 6,0 s e 7,0 s, o ticker da direita sobrepõe rótulos e preços: “CAFÉ” sobre “TRANSPORTE” (R$ 8,00 sobre R$ 5,00), “PÃO” sobre “OVOS”, “LEITE” sobre “FEIJÃO”, “ARROZ” sobre “MANTEIGA”. O painel de preços é a prova central do conceito e está ilegível por ~2,6 s (5,6–8,2 s). Evidência: `gate4-frames/v01-6s.png`, `v01-7s.png`. Exige re-render da cena e novo QC.
- **V02 — PASS técnico; ressalva de ritmo.** Entre 4,2 s e 9,4 s a tela fica no mesmo cartão “O MESMO PEDIDO. OS MESMOS R$ 100.”; frames em 6,0 s e 8,0 s são idênticos. São ~5,2 s sem mudança visual no bloco mais importante para reter. Não é falha de arquivo; é must-fix de edição.
- **V03 — PASS.** 33,3 s; 3/5 coerente com 61%; máquina, gráfico e consequência legíveis; sem colisão ou frame preto.
- **V04 — PASS.** 30,1 s; “4 DE 5” com selo “SIMULAÇÃO · PREÇOS +25%”; CTA único de comentário no fim; sem defeito encontrado.
- **V05 — PASS.** 35,0 s; “E esse poder não tem o mesmo tamanho…” está correto; nota, gráfico e CTA “SALVE” limpos.
- **V06 — PASS.** 40,1 s; o hook do render é “SEU SALÁRIO SUBIU. POR QUE O MÊS CONTINUA APERTADO?”, não o texto antigo do storyboard; R$ 3.200 está marcado “EXEMPLO DIDÁTICO”; sem defeito.
- **V07 — PASS técnico; ressalva de hook.** O frame 0 mostra “UMA LINHA PODE EXPLICAR.” e deixa o objeto da frase só no áudio; sem som, o hook fica incompleto. Os selos “SIMULAÇÃO · 5% AO ANO / R$ 78 / R$ 61” estão presentes. Contraste do gráfico é baixo; testar em celular.
- **V08 — PASS.** 41,3 s; o selo “SIMULAÇÃO · PREÇOS +25%” aparece no render; o CTA “MANDA PRA ELE” está visível em 40,5 s; sem defeito.
- **V09 — PASS técnico; FAIL editorial.** O recibo é legível em 1080 e o CTA “SIGA O INVEST FÁCIL” está presente. Mas “EXISTE UM IMPOSTO QUE NINGUÉM VOTOU” ocupa 0–4,4 s e a correção “NÃO É IMPOSTO LITERAL” entra em ~4,5 s: ~11% do vídeo afirma uma equivalência falsa antes de corrigi-la. Não é veto técnico; é must-fix editorial.
- **V10 — PASS.** 40,2 s; “E muda devagar.” está correto; cesta 3/5 e gráfico 100 → 61 coerentes; sem defeito.

## 4. Problemas transversais e must-fix

**P0 — bloqueiam finalização/publicação interna:**
1. **V01:** corrigir a sobreposição do ticker (CAFÉ/TRANSPORTE, PÃO/OVOS, LEITE/FEIJÃO, ARROZ/MANTEIGA) e re-renderizar. Veto visual até a correção.
2. **Disclaimer no rodapé:** nos end cards de V01/V03/V08/V09 o texto “Conteúdo educacional…” fica entre ~40 e ~130 px da borda inferior, abaixo da margem de 120–220 px do próprio projeto. Subir para ≥120 px (ideal 220 px) e conferir contraste. Vale para os 10.
3. **V09:** mover “não é imposto literal / metaforicamente” para os primeiros 2 s, na tela, ou trocar o hook por “custo invisível”. A correção em ~4,5 s ainda deixa 4,4 s de afirmação literal na janela de maior audiência.

**P1 — qualidade e processo:**
4. **V02:** quebrar o cartão estático de 4,2–9,4 s com um corte, micro-movimento ou mudança de enquadramento; hoje são ~5,2 s com a mesma composição.
5. **V07:** completar o hook no frame 0 (“UMA LINHA PODE EXPLICAR POR QUÊ…” ou equivalente visual) e aumentar o contraste do gráfico.
6. **Safe zone superior:** o rótulo “INVEST FÁCIL / …” está a ~60 px do topo em todos os frame0; fica sob a UI do TikTok. Subir para ≥120–220 px ou tratá-lo como elemento decorativo.
7. **QC_REPORT de V02–V10 é boilerplate:** textos idênticos, “sem colisão óbvia” e “PASS”, mas não registraram a colisão de V01 nem o estático de V02. Exigir evidência por vídeo (timestamp/frame, transcrição, caminho do loudness) antes de aceitar o PASS.
8. **Whisper proxy:** os relatórios citam Whisper `small`, mas não há transcrições armazenadas. Gerar e guardar as 10 transcrições; ainda assim, isso não substitui escuta humana.
9. **V07 blackdetect:** os 0,6/0,7 s são design escuro com conteúdo; manter o monitoramento para não confundir com dead frame em futuras versões.
10. **Loudness:** −14,0 a −14,3 LUFS e TP −1,1 a −1,6 estão corretos; LRA 2,0–2,9 é bastante comprimido. Sem problema técnico, mas a naturalidade dinâmica depende de escuta.

## 5. Declarações

- **Nenhuma aprovação humana** é declarada; nenhum vídeo foi publicado, enviado ou monetizado.
- **Nenhuma licença de voz** (edge-tts) ou de Remotion é declarada aprovada.
- **ffprobe, loudness, contact sheet e frames extraídos não substituem reprodução integral e escuta humana.** Não assisti aos 10 vídeos de ponta a ponta nem ouvi o áudio; a auditoria é baseada em arquivo, metadados, amostras visuais e detecção automática.
- O veto de V01 é **visual**, com evidência em frame; não é falha de container, codec ou loudness.
- Nenhum finalista foi escolhido.

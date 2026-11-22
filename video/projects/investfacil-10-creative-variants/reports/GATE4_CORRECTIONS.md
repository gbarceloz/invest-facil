# GATE 4 — CORREÇÕES E VERIFICAÇÕES PÓS-AVALIAÇÃO

**Data:** 21/11/2026
**Status:** produção interna; nenhuma aprovação humana.

## 1. V01 — ticker sobreposto (corrigido)

**Defeito confirmado:** em 5,6–8,2 s, a coluna de preços exibia dois cartões no mesmo espaço (CAFÉ/TRANSPORTE, PÃO/OVOS, LEITE/FEIJÃO, ARROZ/MANTEIGA), tornando ilegível a prova central do conceito. O QC classificou como FAIL visual / veto.

**Causa:** `TickerColumn` posicionava 16 cartões com espaçamento de 118 px (span de 1888 px), mas aplicava módulo de 1400 px. No retorno do ciclo, dois índices caíam no mesmo `top`.

**Correção:** 20 cartões, espaçamento 118 px e ciclo de 2360 px; o módulo agora usa o span real.

**Re-render:** `video/out/v01-raw-fix.mp4` → `video/out/v01-final-fix.mp4` (loudnorm dois passes) → `V01/render/V01-ticker-nao-para.mp4`.

**Atualização do acabamento final:** o ciclo foi ampliado para **24 itens / 2832 px** para eliminar a duplicata de FEIJÃO em 7,0 s. Ver `reports/V01_FINAL_POLISH.md`.

**Verificação:** frames em 6,0 s, 7,0 s e 8,0 s mostram uma linha por cartão, sem sobreposição. O hold de **R$ 61,39** foi confirmado em 24,0 s. Especificação final: 34,10 s, 1080×1920, 30 fps, H.264/AAC, -14,1 LUFS, TP -1,4 dBTP.

**Draft CapCut:** o asset de vídeo e o WAV do draft V01 foram substituídos pelos do arquivo corrigido; o draft continua estruturalmente válido.

## 2. Falsos positivos refutados com frame

### 2.1 “8/10” contra “6/10” em V01

Não é contradição: a fração é um contador animado. Em 16,0 s mostra 8/10 e em 18,0 s mostra 6/10, coerente com o payoff de R$ 61,39. Nenhuma correção necessária.

### 2.2 “INFLACÃO” em V01/V09

O texto renderizado é **INFLAÇÃO**, com cedilha. Em ampliação, a perna da cedilha fica sob o “A” e o til sobrepõe o glifo, criando a ilusão de um “C” extra. O código-fonte não contém “INFLAC”. Nenhuma correção necessária.

## 3. Defeitos reais que permanecem (não corrigidos nesta rodada)

- **V07:** gráfico domina 0–26 s na mesma composição; hold de 18,7 s; labels pequenos; hook “UMA LINHA PODE EXPLICAR.” sem objeto visível.
- **V05:** dois blocos de ~8 s e nota isolada em tela preta; automação de “silêncio” acima do número.
- **V02:** cartão “O MESMO PEDIDO” parado por ~5,2 s em 4,2–9,4 s; fala “61%” contra tela “R$ 61”.
- **V09:** hook afirma “imposto que ninguém votou” por 4–5 s antes da correção; recibo “+R$ 5,51” pode ser lido como cobrança.
- **V03:** Whisper ouve “continua sem” e “compra? Sim”; articulação de “cem”/“sim” não verificada por escuta humana.
- **V06:** split “SALÁRIO x PREÇOS” lado a lado em 9:16, imóvel por ~8 s.
- **V10:** hold de 8,4 s em 25,7–34,0 s e payoff tardio.
- **Transversal:** disclaimer a ~130 px da borda inferior nos end cards; safe zone real de TikTok/Reels não testada.
- **Transversal:** nenhuma escuta humana; licença comercial da voz pendente.

## 4. O que mudou no ranking

As notas dos agentes foram mantidas como foram emitidas sobre a versão avaliada. O V01 teve o defeito de ticker corrigido e re-renderizado; a nota técnica do QC será atualizada pela re-auditoria. O ranking final usa a versão corrigida para os finalistas.

## 5. Declarações

- Nenhuma publicação, upload, monetização, push, merge ou deploy.
- Nenhuma aprovação humana.
- Nenhum direito comercial declarado como resolvido.

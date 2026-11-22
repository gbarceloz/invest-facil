# GATE 4 — AVALIAÇÃO DE MOTION & TIPOGRAFIA (VÍDEOS REAIS)

**Agente:** if-motion-designer
**Data:** 21/11/2026
**Base:** `GATE4_PRODUCTION_INDEX.md`, 10 `frame0.png`, 10 `contact-sheet.png`, `QC_REPORT.md` e `TECHNICAL_REPORT.md`.
**Método:** inspeção visual do frame 0 e de 17 amostras a cada 2 s por vídeo. Sem playback integral, sem escuta humana e sem render. **Nenhuma aprovação humana.**

## 1. Notas

| # | Visual | Tipografia | Execução Remotion | Total /30 | Rank |
|---|---:|---:|---:|---:|---:|
| V01 | 8 | 7 | 8 | **23** | 1 |
| V02 | 6 | 7 | 5 | **18** | 4 |
| V03 | 6 | 7 | 5 | **18** | 5 |
| V04 | 7 | 8 | 8 | **23** | 2 |
| V05 | 6 | 7 | 4 | **17** | 7 |
| V06 | 6 | 6 | 4 | **16** | 9 |
| V07 | 5 | 5 | 3 | **13** | 10 |
| V08 | 6 | 7 | 5 | **18** | 6 |
| V09 | 7 | 6 | 4 | **17** | 8 |
| V10 | 7 | 7 | 5 | **19** | 3 |

**Critério:** “Execução Remotion” mede o que os stills provam — cortes, holds, escada de escala, colisões e acabamento. Easing fino e micro-movimento só o play prova.

## 2. Justificativa por vídeo

- **V01 — 23.** Melhor frame 0: herói “R$ 100”, nota ilustrativa e ticker com função. 24 cortes, média 1,4 s. Problema: no 2 s o hook e “NÃO É IMPRESSÃO” coexistem (duplicação/dupla exposição); ticker, eixos do gráfico e rodapé minúsculos; 4–5 camadas.
- **V02 — 18.** Cold open forte e xícara legível. Mas xícara, recibo e gráfico são pequenos e de baixo contraste; “O MESMO PEDIDO” e “INFLAÇÃO” ficam ~6 s na mesma composição; labels do gráfico ilegíveis.
- **V03 — 18.** Máquina legível e 3/5 coerente com 61. Mas o objeto é pequeno no meio de muito vazio; há 4–6 s de hold; “ENTRA/SAI MENOR” e eixos do gráfico são minúsculos.
- **V04 — 23.** O mais limpo e rápido; “QUATRO DE CINCO” e CTA único funcionam. O timer é um círculo grande, não rail; ícones da cesta e labels do gráfico são pequenos.
- **V05 — 17.** A nota é o herói, mas está cinza/apagada sobre preto — frame lavado. Oito segundos parados em “R$ 100 É PODER DE COMPRA” e oito em “O VALOR IMPRESSO”; gráfico e labels minúsculos; vazio excessivo.
- **V06 — 16.** Split “SALÁRIO x PREÇOS” lado a lado em 9:16, contra a regra de topo/base. Oito segundos no mesmo split e oito no gráfico; labels dos cards e eixos minúsculos.
- **V07 — 13.** Gráfico pequeno, labels ilegíveis e 8–10 s na mesma composição; quase nenhum movimento visível. Parece slide. **Mais fraco.**
- **V08 — 18.** Chat é claro e “GUARDAR É IMPORTANTE” salva o tom. Bolha, nota, ícones e labels do gráfico são pequenos/apagados; há 4 s de hold.
- **V09 — 17.** Recibo é bom artefato e “NÃO É IMPOSTO LITERAL” é forte. O texto do recibo é ilegível no feed; 8 s de hold e ~8 s de logo; gráfico minúsculo.
- **V10 — 19.** O espelho é a imagem mais distinta e o headline é forte. Mas o reflexo parece card duplicado, a nota está apagada, há ~8 s de hold e nenhum morph visível; gráfico minúsculo.

## 3. Top 3, mais fraco e must-fix

**Top 3:** **V01** (23), **V04** (23), **V10** (19).
- **V01:** é o scroll-stopper mais forte; corrigir a duplicação do 2 s, reduzir camadas e subir eixos/rodapé.
- **V04:** é o mais legível e o mais próximo de “premium rápido”; trocar o timer por rail, aumentar ícones e labels.
- **V10:** é o mais autoral; sem espelho convincente, nota mais clara e movimento interno, não se sustenta.

**Mais fraco:** **V07** (13). Sem recompor o gráfico e quebrar os holds, não deve avançar.

**Must-fix (P0):**
1. **Holds longos:** V05, V06, V07, V09 e V10 têm 8–10 s na mesma composição. Nenhuma cena deve passar de 2,5–3 s sem evento interno (push de 0,5–1,5%, linha, contador, parallax).
2. **Piso tipográfico:** eixos de gráfico, linhas de recibo, labels de card, ticker e disclaimers estão bem abaixo de 34 px. Aplicar 34 px labels / 44 px corpo ou remover o texto.
3. **V06:** o split lado a lado viola a regra de 9:16; usar topo/base com 120 px de seam ou um painel por vez.
4. **V05:** a nota está lavada; subir contraste, criar rim light amarela e reduzir o vazio central.
5. **V07:** recompor o gráfico em portrait, com 3 estados e labels ≥34 px; cortar se não houver movimento.
6. **V10:** o reflexo precisa de seam/luz de espelho; hoje lê como card duplicado. A nota “100” está apagada.
7. **V09:** recibo com no máximo 4 linhas legíveis ou 80% da largura; encurtar o end card de 8 s.
8. **V01:** eliminar a dupla mensagem do 2 s; manter um headline por beat.
9. **V04:** timer em rail de 4 px, não círculo; aumentar ícones e labels do gráfico.
10. **V02/V03/V08:** aumentar xícara/máquina/bolha; hoje o objeto-herói desaparece no feed.

## 4. O que só o vídeo em movimento/tela pequena prova

- **Easing e micro-movimento:** o contact sheet não distingue push de 0,5% de frame parado; só o play diz se os 8 s de V05/V07/V10 respiram ou morrem.
- **Ritmo real de corte:** 17 amostras a 2 s não provam a cadência entre cortes nem a sincronia com Thalita/SFX.
- **Tela pequena (25–33%):** só a reprodução no celular prova se eixos de gráfico, recibo, labels de card e disclaimers desaparecem — a hipótese é que desaparecem.
- **Frame 0 como capa:** os frames são top-heavy, com objeto pequeno e muito vazio; só o feed a 270×480 prova se o objeto ancora ou some.
- **Espelho de V10:** em still parece card duplicado; só o movimento prova se lê como reflexo.
- **Duplicação de V01 no 2 s:** pode ser transição de 4 frames ou mensagem dupla sustentada; só o play resolve.
- **Colisões de 1–2 frames:** não aparecem em amostragem de 2 s; exigem strip de 1 f ou playback.
- **Áudio/voz:** não avaliado; nenhuma escuta humana foi feita.

**Nenhuma aprovação humana foi concedida ou declarada.**

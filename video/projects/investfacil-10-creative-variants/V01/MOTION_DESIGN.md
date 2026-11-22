# MOTION DESIGN — V01 O ticker não para

**Duração calculada:** 33 s
**Formato:** 1080×1920 · 30 fps
**Linguagem:** Montagem de terminal: cortes de 1–2 s, punch-ins, whip pans, split-screen e micro-cortes sincronizados ao ticker.
**Tipografia:** Números grandes, ticker, palavras ‘PREÇO’ e ‘PODER DE COMPRA’ com highlight amarelo.
**Transições:** Whip pan, zoom punch, máscara horizontal; nenhuma transição decorativa.
**Status:** PLANEJADO — NÃO PRODUZIDO.

## Princípios

- Cada animação tem entrada, hold e saída; nada fica animando sem função.
- Tipografia mínima: 34 px para labels e 44 px para corpo.
- `line-height` ≥ 1,08 em textos com ç, g, p, q, j; não usar `overflow: hidden` que corte descendentes.
- No máximo dois elementos concorrentes por frame (número + label); o terceiro entra depois.
- Texto na tela é palavra-chave, não legenda da narração.
- Movimento motivado por fala, corte ou música; nenhuma transição decorativa.

## Contrato de frames

- Entrada: 8–12 frames.
- Hold: até a sílaba tônica ou 12–18 frames.
- Saída: 6–8 frames.
- Números: spring com damping alto; texto: `Easing.out(Easing.cubic)`.
- Contadores: 1 incremento a cada 2–3 frames, sem blur.

## Mapa de motion por bloco

| Tempo | Texto | Movimento | Entrada | Saída |
|---|---|---|---|---|
| 0,0–2,9 | R$ 100 / NÃO É IMPRESSÃO | Punch-in no número | Máscara horizontal + punch-in | Corte seco |
| 3,0–5,3 | OS PREÇOS SE MOVEM | Whip pan para o ticker | Máscara horizontal + punch-in | Corte seco |
| 5,4–7,9 | MESMO NÚMERO | Split-screen nota x preços | Máscara horizontal + punch-in | Corte seco |
| 8,0–11,7 | MENOS CAFÉ · PÃO · TRANSPORTE | Três cortes rápidos | Máscara horizontal + punch-in | Corte seco |
| 11,8–13,0 | INFLAÇÃO | Corte seco + bass hit | Máscara horizontal + punch-in | Corte seco |
| 13,2–17,4 | PODER DE COMPRA | Barra encolhendo | Máscara horizontal + punch-in | Corte seco |
| 17,5–23,0 | SIMULAÇÃO · 5% AO ANO | Contador 100 → 61 | Máscara horizontal + punch-in | Corte seco |
| 23,1–26,2 | MESMO NÚMERO / MENOS PODER | Split-screen | Máscara horizontal + punch-in | Corte seco |
| 26,4–28,8 | ENTENDER É O PRIMEIRO PASSO | Logo hint | Máscara horizontal + punch-in | Corte seco |
| 28,9–32,3 | SIGA | End card | Máscara horizontal + punch-in | Corte seco |

## Componentes Remotion sugeridos

- `KineticText` — revelação por máscara, sem cortar descendentes.
- `Counter` — 100 → 61, com hold final.
- `SplitScreen` — topo/base em 9:16.
- `ChartLine` — desenho progressivo com labels.
- `Basket` — remoção item a item, blur só no item removido.
- `Ticker` — movimento periférico, atrás do herói.
- `ChatBubble` — UI premium, sem estética de meme.
- `Mirror` — reflexo sem texto.

## Risco específico

- Ticker atrás do herói; nunca sobre o número principal.

## Regras de segurança visual

- Safe zone: 78 px laterais para Reels/Shorts; 120 px à direita para TikTok; 220 px no rodapé.
- CTA e disclaimer dentro da área segura.
- Frame 0 legível, sem flash lavado.
- Nenhum texto no seam de split ou em reflexo.

# MOTION DESIGN — V04 R$ 100 em 30 segundos

**Duração calculada:** 30 s
**Formato:** 1080×1920 · 30 fps
**Linguagem:** 0,8–1,8 s por corte; speed ramps; punch-ins; match cuts; glitch controlado.
**Tipografia:** Números grandes, ANTES/DEPOIS/HOJE, contagem regressiva.
**Transições:** Zoom, whip, glitch, hard cuts.
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
| 0,0–2,1 | R$ 100 | Punch-in | Wipe + punch-in | Glitch controlado |
| 2,3–3,3 | DEPENDE DO ANO | Whip pan | Wipe + punch-in | Glitch controlado |
| 3,5–5,0 | HOJE | Cesta entra | Wipe + punch-in | Glitch controlado |
| 5,1–9,9 | SIMULAÇÃO · PREÇOS +25% · 4 DE 5 | Itens somem | Wipe + punch-in | Glitch controlado |
| 10,1–14,9 | SIMULAÇÃO · R$ 61 | Contador | Wipe + punch-in | Glitch controlado |
| 15,1–18,4 | A RESPOSTA MUDOU | Split | Wipe + punch-in | Glitch controlado |
| 18,5–20,1 | NÃO É O QUANTO VOCÊ TEM | Texto grande | Wipe + punch-in | Glitch controlado |
| 20,2–21,6 | É O QUE ELE COMPRA | Cesta | Wipe + punch-in | Glitch controlado |
| 21,7–25,0 | OLHE O PREÇO | Recibo | Wipe + punch-in | Glitch controlado |
| 25,1–28,1 | COMENTE | End card | Wipe + punch-in | Glitch controlado |

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

- Máximo 2 elementos: timer, número ou pergunta.

## Regras de segurança visual

- Safe zone: 78 px laterais para Reels/Shorts; 120 px à direita para TikTok; 220 px no rodapé.
- CTA e disclaimer dentro da área segura.
- Frame 0 legível, sem flash lavado.
- Nenhum texto no seam de split ou em reflexo.

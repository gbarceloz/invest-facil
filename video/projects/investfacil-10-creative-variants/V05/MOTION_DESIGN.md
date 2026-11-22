# MOTION DESIGN — V05 Uma nota sobre a mesa

**Duração calculada:** 37 s
**Formato:** 1080×1920 · 30 fps
**Linguagem:** Planos de 2,5–4 s, slow push, cortes precisos; muito espaço negativo.
**Tipografia:** Poucas palavras, tipografia grande e elegante; uma ideia por plano.
**Transições:** Cortes secos, light sweep, fade.
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
| 0,0–2,1 | QUANTO ESSA NOTA AINDA COMPRA? | Slow push na nota | Fade + slow push | Light sweep |
| 2,3–7,3 | PODER DE COMPRA NO BOLSO | Nota na mesa | Fade + slow push | Light sweep |
| 7,4–11,1 | NÃO TEM O MESMO TAMANHO | Linha fina surge | Fade + slow push | Light sweep |
| 11,2–15,3 | PODER DE COMPRA | Linha desce | Fade + slow push | Light sweep |
| 15,4–19,1 | VALOR IMPRESSO | Macro na nota | Fade + slow push | Light sweep |
| 19,3–22,9 | O QUE ELE COMPRA | Espaço negativo | Fade + slow push | Light sweep |
| 23,1–28,6 | SIMULAÇÃO · 5% AO ANO | Número 61 | Fade + slow push | Light sweep |
| 28,8–32,5 | IMPRESSO / MENOR | Split minimalista | Fade + slow push | Light sweep |
| 32,7–35,7 | SALVE | Logo | Fade + slow push | Light sweep |

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

- Micro-movimento constante; não parecer still.

## Regras de segurança visual

- Safe zone: 78 px laterais para Reels/Shorts; 120 px à direita para TikTok; 220 px no rodapé.
- CTA e disclaimer dentro da área segura.
- Frame 0 legível, sem flash lavado.
- Nenhum texto no seam de split ou em reflexo.

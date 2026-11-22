# MOTION DESIGN — V10 O espelho do dinheiro

**Duração calculada:** 40 s
**Formato:** 1080×1920 · 30 fps
**Linguagem:** Match cuts, morphs, parallax, split-screen, speed ramps; 1,5–3 s.
**Tipografia:** Versos curtos, tipografia com profundidade e reflexo; palavras ‘NÃO SUMIU’, ‘ENCÓGHEU’.
**Transições:** Mirror/mask/morph, light sweep.
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
| 0,0–2,4 | SE O DINHEIRO FALASSE | Espelho | Morph + mirror + parallax | Fade |
| 2,6–4,6 | EU NÃO DESAPARECI | Reflexo | Morph + mirror + parallax | Fade |
| 4,8–8,2 | VOCÊ SÓ COMPRA MENOS | Cesta | Morph + mirror + parallax | Fade |
| 8,3–11,7 | O TAMANHO MUDA | Cesta | Morph + mirror + parallax | Fade |
| 11,8–15,1 | O NÚMERO CONTINUA | Nota | Morph + mirror + parallax | Fade |
| 15,2–18,3 | O PODER DE COMPRA MUDA | Linha | Morph + mirror + parallax | Fade |
| 18,4–21,4 | INFLAÇÃO | Morph | Morph + mirror + parallax | Fade |
| 21,7–25,2 | DIMINUI O QUE PODE COMPRAR | Cesta 3/5 | Morph + mirror + parallax | Fade |
| 25,4–30,0 | SIMULAÇÃO · R$ 61 | Gráfico | Morph + mirror + parallax | Fade |
| 30,1–33,1 | NÃO SOME | Espelho | Morph + mirror + parallax | Fade |
| 33,2–36,2 | MUDA DE TAMANHO | Fecho | Morph + mirror + parallax | Fade |
| 36,4–39,1 | SALVE | End card | Morph + mirror + parallax | Fade |

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

- Não refletir texto; testar morph em tela pequena.

## Regras de segurança visual

- Safe zone: 78 px laterais para Reels/Shorts; 120 px à direita para TikTok; 220 px no rodapé.
- CTA e disclaimer dentro da área segura.
- Frame 0 legível, sem flash lavado.
- Nenhum texto no seam de split ou em reflexo.

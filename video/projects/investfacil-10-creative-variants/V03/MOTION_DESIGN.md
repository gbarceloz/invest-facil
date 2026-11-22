# MOTION DESIGN — V03 A máquina de encolher dinheiro

**Duração calculada:** 33 s
**Formato:** 1080×1920 · 30 fps
**Linguagem:** Match cuts, morphing, macro, object transitions; 1,5–2,5 s.
**Tipografia:** Verbos de transformação: ENTRA, SAI, ENCOLHE; números só no fim.
**Transições:** Shape morph, match cut, mask; a cesta encolhe.
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
| 0,0–2,3 | ENTRA INTEIRA | Nota entra na máquina | Shape morph + mask | Corte seco |
| 2,4–4,3 | O QUE ELA COMPRA SAI MENOR | Cesta menor sai | Shape morph + mask | Corte seco |
| 4,5–6,3 | INFLAÇÃO | Engrenagens | Shape morph + mask | Corte seco |
| 6,5–9,8 | A MESMA QUANTIA | Itens da cesta somem | Shape morph + mask | Corte seco |
| 9,9–12,8 | O NÚMERO NÃO MUDA | Macro na nota | Shape morph + mask | Corte seco |
| 12,9–14,8 | O QUE ELE COMPRA MUDA | Split nota/cesta | Shape morph + mask | Corte seco |
| 14,9–17,5 | A MÁQUINA LEVA UM POUCO | Engrenagens lentas | Shape morph + mask | Corte seco |
| 17,6–23,3 | SIMULAÇÃO · 5% AO ANO | Contador | Shape morph + mask | Corte seco |
| 23,5–25,7 | NÃO RASGA | Nota intacta | Shape morph + mask | Corte seco |
| 25,9–28,0 | DIMINUI O QUE ELE COMPRA | Cesta 3/5 | Shape morph + mask | Corte seco |
| 28,2–32,1 | COMPARTILHE | End card | Shape morph + mask | Corte seco |

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

- Engrenagens em preto/amarelo; não parecer outra marca.

## Regras de segurança visual

- Safe zone: 78 px laterais para Reels/Shorts; 120 px à direita para TikTok; 220 px no rodapé.
- CTA e disclaimer dentro da área segura.
- Frame 0 legível, sem flash lavado.
- Nenhum texto no seam de split ou em reflexo.

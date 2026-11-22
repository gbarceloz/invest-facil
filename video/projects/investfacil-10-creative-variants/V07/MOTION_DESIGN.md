# MOTION DESIGN — V07 A linha que explica seu bolso

**Duração calculada:** 40 s
**Formato:** 1080×1920 · 30 fps
**Linguagem:** Chart draw contínuo, data transitions, punch-ins; 2–3 s.
**Tipografia:** Números tabulares, eixos, labels; tipografia técnica.
**Transições:** Chart wipes, zoom, cut.
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
| 0,0–4,0 | PODER DE COMPRA | Linha começa | Chart draw + label pop | Wipe |
| 4,1–8,0 | R$ 100 | Ponto 0 | Chart draw + label pop | Wipe |
| 8,1–12,2 | SIMULAÇÃO · 5% AO ANO | Linha desce | Chart draw + label pop | Wipe |
| 12,4–16,8 | SIMULAÇÃO · R$ 78 | Ponto 5a | Chart draw + label pop | Wipe |
| 16,9–23,2 | SIMULAÇÃO · R$ 61 | Ponto 10a | Chart draw + label pop | Wipe |
| 23,4–27,2 | O NÚMERO NÃO MUDOU | Split | Chart draw + label pop | Wipe |
| 27,3–30,3 | O QUE ELE COMPRA | Cesta | Chart draw + label pop | Wipe |
| 30,5–34,1 | INFLAÇÃO | Highlight | Chart draw + label pop | Wipe |
| 34,3–38,5 | SIMULAÇÃO · SALVE | End card | Chart draw + label pop | Wipe |

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

- Labels ≥34 px; máximo 3 por frame.

## Regras de segurança visual

- Safe zone: 78 px laterais para Reels/Shorts; 120 px à direita para TikTok; 220 px no rodapé.
- CTA e disclaimer dentro da área segura.
- Frame 0 legível, sem flash lavado.
- Nenhum texto no seam de split ou em reflexo.

# MOTION DESIGN — V08 Papo de mercado

**Duração calculada:** 41 s
**Formato:** 1080×1920 · 30 fps
**Linguagem:** Jump cuts, zooms, UI pops, texto como mensagem; 1,5–2,5 s.
**Tipografia:** Balões de mensagem, ‘NÃO PERDE VALOR?’, ‘PERDE SIM’, ‘4 DE 5’.
**Transições:** UI wipes, jump cuts, zoom.
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
| 0,0–4,1 | DINHEIRO PARADO NÃO PERDE VALOR? | Balão de chat | UI pop + chat bubble | Jump cut |
| 4,3–6,9 | PRECISA VER ISSO | Recibo | UI pop + chat bubble | Jump cut |
| 7,0–13,8 | SIMULAÇÃO · PREÇOS +25% · 4 DE 5 | Cesta | UI pop + chat bubble | Jump cut |
| 14,0–17,8 | O DINHEIRO NÃO SUMIU | Nota | UI pop + chat bubble | Jump cut |
| 17,9–21,0 | COMPRA MENOS | Itens somem | UI pop + chat bubble | Jump cut |
| 21,1–26,5 | SIMULAÇÃO · R$ 61 | Contador | UI pop + chat bubble | Jump cut |
| 26,7–30,8 | NÃO FICA IGUAL | Split | UI pop + chat bubble | Jump cut |
| 31,0–33,1 | É INFLAÇÃO | Linha | UI pop + chat bubble | Jump cut |
| 33,3–37,8 | GUARDAR É IMPORTANTE | Nota e cesta | UI pop + chat bubble | Jump cut |
| 38,0–39,8 | MANDA PRA ELE | End card | UI pop + chat bubble | Jump cut |

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

- UI premium; não parecer meme de creator.

## Regras de segurança visual

- Safe zone: 78 px laterais para Reels/Shorts; 120 px à direita para TikTok; 220 px no rodapé.
- CTA e disclaimer dentro da área segura.
- Frame 0 legível, sem flash lavado.
- Nenhum texto no seam de split ou em reflexo.

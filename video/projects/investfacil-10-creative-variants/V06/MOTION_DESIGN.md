# MOTION DESIGN — V06 Não é impressão

**Duração calculada:** 40 s
**Formato:** 1080×1920 · 30 fps
**Linguagem:** Jump cuts, split-screen, punch-ins, text overlays; 1,5–2,5 s.
**Tipografia:** SALÁRIO / CESTA / NÃO É IMPRESSÃO; palavras em conflito visual.
**Transições:** Split-screen, mask, jump cut.
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
| 0,0–1,3 | SALÁRIO | Close no contracheque | Split reveal + jump cut | Mask |
| 1,4–4,1 | POR QUÊ? | Split salário/cesta | Split reveal + jump cut | Mask |
| 4,3–8,0 | NÃO É IMPRESSÃO | Close text | Split reveal + jump cut | Mask |
| 8,1–11,6 | SALÁRIO x CESTA | Split salário/cesta | Split reveal + jump cut | Mask |
| 11,7–15,1 | SALÁRIO x PREÇOS | Split salário/preços | Split reveal + jump cut | Mask |
| 15,2–19,5 | CESTA | Split cesta | Split reveal + jump cut | Mask |
| 19,6–22,9 | INFLAÇÃO | Bass | Split reveal + jump cut | Mask |
| 23,1–26,5 | PODER DE COMPRA | Linha cai | Split reveal + jump cut | Mask |
| 26,6–33,2 | SIMULAÇÃO · R$ 61 | Contador | Split reveal + jump cut | Mask |
| 33,4–35,4 | NÃO É IMPRESSÃO | Espelho | Split reveal + jump cut | Mask |
| 35,6–39,2 | SALVE | End card | Split reveal + jump cut | Mask |

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

- Split topo/base; não lado a lado em 9:16.

## Regras de segurança visual

- Safe zone: 78 px laterais para Reels/Shorts; 120 px à direita para TikTok; 220 px no rodapé.
- CTA e disclaimer dentro da área segura.
- Frame 0 legível, sem flash lavado.
- Nenhum texto no seam de split ou em reflexo.

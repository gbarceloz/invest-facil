# MOTION DESIGN — V09 O imposto invisível

**Duração calculada:** 39 s
**Formato:** 1080×1920 · 30 fps
**Linguagem:** Cortes cinematográficos, speed ramps, light sweeps, logo reveal; 1,5–3 s.
**Tipografia:** Tipografia de campanha: IMPOSTO INVISÍVEL, INFLAÇÃO, INVEST FÁCIL.
**Transições:** Light sweep, match cut, logo reveal.
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
| 0,0–2,6 | UM IMPOSTO QUE NINGUÉM VOTOU | Dark; texto | Light sweep + logo reveal | Match cut |
| 2,7–4,6 | TODOS OS DIAS | Recibo | Light sweep + logo reveal | Match cut |
| 4,7–7,1 | NÃO É IMPOSTO LITERAL · É INFLAÇÃO | Recibo line | Light sweep + logo reveal | Match cut |
| 7,3–11,0 | NÃO APARECE NA NOTA | Price tags | Light sweep + logo reveal | Match cut |
| 11,2–15,2 | ELA ESTÁ NO PREÇO | Montagem de preços | Light sweep + logo reveal | Match cut |
| 15,3–18,3 | OS PREÇOS SOBEM | Bass | Light sweep + logo reveal | Match cut |
| 18,5–23,0 | SIMULAÇÃO · 5% AO ANO | Contador | Light sweep + logo reveal | Match cut |
| 23,2–27,2 | NÃO É PREVER O FUTURO | Line | Light sweep + logo reveal | Match cut |
| 27,4–32,1 | ENTENDER O DINHEIRO | Brand build | Light sweep + logo reveal | Match cut |
| 32,3–37,6 | INVEST FÁCIL · SIGA | Logo | Light sweep + logo reveal | Match cut |

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

- Logo reveal sem estética de anúncio de banco.

## Regras de segurança visual

- Safe zone: 78 px laterais para Reels/Shorts; 120 px à direita para TikTok; 220 px no rodapé.
- CTA e disclaimer dentro da área segura.
- Frame 0 legível, sem flash lavado.
- Nenhum texto no seam de split ou em reflexo.

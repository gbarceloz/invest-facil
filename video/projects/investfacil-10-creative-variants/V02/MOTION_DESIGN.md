# MOTION DESIGN — V02 O café de sempre

**Duração calculada:** 42 s
**Formato:** 1080×1920 · 30 fps
**Linguagem:** Planos de 2–4 s, match cuts na xícara/nota, slow push e cortes motivados pela luz.
**Tipografia:** Tipografia esparsa: R$ 100, MESMO CAFÉ, MENOS TROCO; uma palavra por plano.
**Transições:** Match cut, light sweep, fade curto; sem whip pan.
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
| 0,0–2,6 | ATÉ O DIA EM QUE NÃO DEU | Close na xícara vazia | Fade curto + match cut | Light sweep |
| 2,9–5,7 | O MESMO CAFÉ, TODO DIA | Flashback; luz quente | Fade curto + match cut | Light sweep |
| 5,9–9,4 | R$ 100 / A SEMANA | Nota no balcão | Fade curto + match cut | Light sweep |
| 9,6–11,3 | SOBRAVA TROCO | Recibo sobre a mesa | Fade curto + match cut | Light sweep |
| 11,5–13,9 | O TROCO DIMINUIU | Time-lapse de xícaras | Fade curto + match cut | Light sweep |
| 14,1–15,3 | NÃO DEU MAIS | Pausa; mão segura a nota | Fade curto + match cut | Light sweep |
| 15,6–19,9 | NÃO FOI O CAFÉ | Close na xícara | Fade curto + match cut | Light sweep |
| 20,0–24,0 | INFLAÇÃO | Linha sobe sobre o balcão | Fade curto + match cut | Light sweep |
| 24,1–30,7 | SIMULAÇÃO · 5% AO ANO | Gráfico minimalista | Fade curto + match cut | Light sweep |
| 30,8–33,8 | MESMO CAFÉ / TROCO MENOR | Match cut xícara/nota | Fade curto + match cut | Light sweep |
| 33,9–37,4 | ELA APARECE NO TROCO | Slow push no troco | Fade curto + match cut | Light sweep |
| 37,7–41,4 | SALVE | End card | Fade curto + match cut | Light sweep |

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

- Luz quente limitada a um acento; preto/amarelo dominam.

## Regras de segurança visual

- Safe zone: 78 px laterais para Reels/Shorts; 120 px à direita para TikTok; 220 px no rodapé.
- CTA e disclaimer dentro da área segura.
- Frame 0 legível, sem flash lavado.
- Nenhum texto no seam de split ou em reflexo.

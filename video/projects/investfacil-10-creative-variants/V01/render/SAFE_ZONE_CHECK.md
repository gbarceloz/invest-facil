# V01 — VERIFICAÇÃO DE SAFE ZONE

**Data:** 21/11/2026
**Arquivo:** `V01/render/V01-ticker-nao-para.mp4`
**Canvas:** 1080 × 1920

## 1. Medidas de design

| Elemento | Posição | Distância da borda |
|---|---|---:|
| Rótulo “INVEST FÁCIL / INFLAÇÃO” | top 156 px | 156 px do topo |
| Linha de progresso | top 0 | decorativa |
| CTA “SIGA” | centro vertical | fora das bordas |
| Disclaimer | bottom 320 px | 320 px do rodapé |
| Margem esquerda | 70 px | 70 px |
| Margem direita | 120 px | 120 px |

**Cálculo do disclaimer:** duas linhas de 23 px com `line-height: 1.45` ≈ 67 px de altura; o bloco começa em aproximadamente y=1533 e termina em y=1600, deixando 320 px livres até o rodapé.

## 2. Frames inspecionados

- `frames-polish/v01-000.png` — frame 0, rótulo superior.
- `frames-polish/v01-305.png` — CTA e disclaimer.
- `frames-polish/v01-315.png` — CTA e disclaimer.
- `frames-polish/v01-335.png` — end card final.
- `frames-polish/v01-058.png`, `v01-065.png`, `v01-070.png` — ticker no meio do ciclo.

## 3. Resultado

- Rótulo superior: **PASS** (156 px de design; 157 px medido no render > 130 px de referência).
- Disclaimer: **PASS** (320 px de design; 323 px medido no render > 250 px de referência).
- CTA: **PASS** (centralizado, sem tocar as bordas).
- Margens laterais: **PASS** (70/120 px).
- Nenhum texto essencial abaixo de 250 px ou acima de 130 px.

## 4. Limite

A verificação é por medidas de design e frames renderizados. **Não foi testada com overlay real de TikTok/Reels.** A aprovação visual em dispositivo continua pendente.

Nenhuma aprovação humana ou de publicação é declarada.

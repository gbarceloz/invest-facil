# GATE 4 — ÍNDICE DE ENTREGÁVEIS

**Data:** 21/11/2026
**Status:** produção interna concluída; nenhuma publicação, nenhuma aprovação humana.

## 1. Os 10 vídeos

| ID | Título | Arquivo no projeto | Cópia em `video/out` | Duração |
|---|---|---|---:|---:|
| V01 | O ticker não para | `V01/render/V01-ticker-nao-para.mp4` | `v01-final.mp4` | 34,10 s |
| V02 | O café de sempre | `V02/render/V02-cafe-de-sempre.mp4` | `v02-final.mp4` | 41,80 s |
| V03 | A máquina de encolher dinheiro | `V03/render/V03-maquina-de-encolher.mp4` | `v03-final.mp4` | 33,30 s |
| V04 | R$ 100 em 30 segundos | `V04/render/V04-100-em-30-segundos.mp4` | `v04-final.mp4` | 30,10 s |
| V05 | Uma nota sobre a mesa | `V05/render/V05-nota-sobre-a-mesa.mp4` | `v05-final.mp4` | 35,00 s |
| V06 | Não é impressão | `V06/render/V06-nao-e-impressao.mp4` | `v06-final.mp4` | 40,10 s |
| V07 | A linha que explica seu bolso | `V07/render/V07-linha-do-bolso.mp4` | `v07-final.mp4` | 40,20 s |
| V08 | Papo de mercado | `V08/render/V08-papo-de-mercado.mp4` | `v08-final.mp4` | 41,30 s |
| V09 | O imposto invisível | `V09/render/V09-imposto-invisivel.mp4` | `v09-final.mp4` | 39,10 s |
| V10 | O espelho do dinheiro | `V10/render/V10-espelho-do-dinheiro.mp4` | `v10-final.mp4` | 40,20 s |

## 2. Relatórios por vídeo

Cada pasta `Vxx/render/` contém:

- `TECHNICAL_REPORT.md` — pipeline, medições e especificação.
- `QC_REPORT.md` — validação técnica e visual.
- `frame0.png` — capa.
- `contact-sheet.png` — 17 amostras.
- `ffprobe.json` e `loudness.json`.
- `whisper/*.srt` — transcrição proxy.
- `manifest.json` e `capcut-draft-summary.json`.

## 3. Avaliações

- `evaluation/GATE4_FINAL_RANKING.md` — ranking /100 e 3 finalistas.
- `evaluation/GATE4_AGENT_SCORES.json` — notas e notas dos 8 agentes.
- `evaluation/V01_EVALUATION.md` … `V10_EVALUATION.md` — avaliação individual.
- `reports/agents/<agente>/gate4-evaluation.md` — 8 relatórios independentes.

## 4. Produção e pendências

- `reports/GATE4_PRODUCTION_REPORT.md` — relatório principal.
- `reports/GATE4_PRODUCTION_INDEX.md` — índice técnico com loudness/TP.
- `reports/GATE4_CORRECTIONS.md` — correção do ticker de V01 e falsos positivos.
- `reports/GATE4_PENDENCIAS.md` — licenças, escuta, CapCut e safe zone.
- `reports/CAPCUT_DRAFTS_VALIDATION.json` — 10/10 drafts válidos.
- `docs/GATE4_LICENSES.md` — análise de licenças.

## 5. Finalistas

1. **V01 — O ticker não para** — 77,9/100. **Vencedor escolhido pelo usuário; acabamento final executado.**
2. **V08 — Papo de mercado** — 73,3/100.
3. **V04 — R$ 100 em 30 segundos** — 72,6/100.

O vencedor é escolha do usuário. Nenhum arquivo foi publicado.

## 6. Acabamento do vencedor

- `reports/V01_FINAL_POLISH.md` — relatório do acabamento.
- `V01/render/POLISH_COMPARISON.md` — antes × depois.
- `V01/render/SAFE_ZONE_CHECK.md` — medidas de safe zone.
- `V01/render/EDITORIAL_CHECKLIST.md` — checklist editorial.
- `V01/render/CAPCUT_PREP.md` — draft preparado, sem deploy/export.
- `V01/render/LICENSING_PENDING.md` — licenças pendentes.
- `V01/render/frames-polish/` — frames de inspeção.

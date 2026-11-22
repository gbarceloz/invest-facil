"""Build per-video evaluation files and the Gate 4 final ranking."""

import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCORES = os.path.join(ROOT, "evaluation", "GATE4_AGENT_SCORES.json")
TITLES = {
    "V01": "O ticker não para",
    "V02": "O café de sempre",
    "V03": "A máquina de encolher dinheiro",
    "V04": "R$ 100 em 30 segundos",
    "V05": "Uma nota sobre a mesa",
    "V06": "Não é impressão",
    "V07": "A linha que explica seu bolso",
    "V08": "Papo de mercado",
    "V09": "O imposto invisível",
    "V10": "O espelho do dinheiro",
}


def fmt(value):
    return f"{value:.1f}".replace(".", ",")


with open(SCORES, encoding="utf-8") as handle:
    data = json.load(handle)

rows = []
for vid, s in data["scores"].items():
    hook = (s["creative_hook"] + s["retention_hook"] + s["traffic_hook"]) / 3
    brand = (s["creative_brand"] + s["qc_brand"]) / 2
    total = (
        hook * 1.5
        + s["retention"]
        + s["editing"] * 1.5
        + s["motion"]
        + s["sound"]
        + s["clarity"]
        + s["traffic_distribution"]
        + brand * 0.5
        + s["qc_technique"] * 0.5
    )
    rows.append({"id": vid, **s, "hook": hook, "brand": brand, "total": total})

rows.sort(key=lambda row: (-row["total"], -row["hook"], -row["retention"], -row["clarity"]))

# Per-video files
for row in rows:
    vid = row["id"]
    notes = row.get("notes", {})
    text = f"""# {vid} — {TITLES[vid]}

**Nota final:** {fmt(row['total'])} / 100
**Veredito do QC:** {row['qc_verdict']}

| Critério | Nota | Peso | Contribuição |
|---|---:|---:|---:|
| Hook | {fmt(row['hook'])} | 15 | {fmt(row['hook'] * 1.5)} |
| Retenção | {fmt(row['retention'])} | 20 | {fmt(row['retention'])} |
| Edição | {fmt(row['editing'])} | 15 | {fmt(row['editing'] * 1.5)} |
| Motion | {fmt(row['motion'])} | 10 | {fmt(row['motion'])} |
| Som | {fmt(row['sound'])} | 10 | {fmt(row['sound'])} |
| Clareza | {fmt(row['clarity'])} | 10 | {fmt(row['clarity'])} |
| Distribuição | {fmt(row['traffic_distribution'])} | 10 | {fmt(row['traffic_distribution'])} |
| Marca | {fmt(row['brand'])} | 5 | {fmt(row['brand'] * 0.5)} |
| Técnica | {fmt(row['qc_technique'])} | 5 | {fmt(row['qc_technique'] * 0.5)} |

## Leitura

- **Ponto forte:** {notes.get('strength', 'não registrado')}
- **Ponto fraco:** {notes.get('weakness', 'não registrado')}
- **Melhor momento:** {notes.get('best', 'não registrado')}
- **Maior risco:** {notes.get('risk', 'não registrado')}

## Limites

- A nota é julgamento editorial sobre o MP4, não métrica de audiência.
- A escuta humana não foi realizada.
- A licença comercial da voz não foi declarada.
"""
    with open(os.path.join(ROOT, "evaluation", f"{vid}_EVALUATION.md"), "w", encoding="utf-8") as handle:
        handle.write(text)

# Ranking
lines = [
    "# GATE 4 — RANKING FINAL",
    "",
    "**Data:** 21/11/2026",
    "**Status:** avaliação interna dos 10 MP4; nenhuma aprovação humana.",
    "**Método:** pesos do `GATE4_SCORING_TEMPLATE.md`; técnica pontuada pelo QC; total /100.",
    "",
    "| Rank | ID | Título | Hook | Retenção /20 | Edição | Motion | Som | Clareza | Distribuição | Marca | Técnica | Total | QC |",
    "|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|",
]
for index, row in enumerate(rows, start=1):
    lines.append(
        f"| {index} | {row['id']} | {TITLES[row['id']]} | {fmt(row['hook'])} | {fmt(row['retention'])} | "
        f"{fmt(row['editing'])} | {fmt(row['motion'])} | {fmt(row['sound'])} | {fmt(row['clarity'])} | "
        f"{fmt(row['traffic_distribution'])} | {fmt(row['brand'])} | {fmt(row['qc_technique'])} | "
        f"**{fmt(row['total'])}** | {row['qc_verdict']} |"
    )

lines += [
    "",
    "## Leitura",
    "",
    f"- **1º:** {rows[0]['id']} — {TITLES[rows[0]['id']]}.",
    f"- **2º:** {rows[1]['id']} — {TITLES[rows[1]['id']]}.",
    f"- **3º:** {rows[2]['id']} — {TITLES[rows[2]['id']]}.",
    f"- **Mais fraco:** {rows[-1]['id']} — {TITLES[rows[-1]['id']]}.",
    "",
    "## Limites",
    "",
    "- Nenhuma métrica de retenção, view, CTR ou campanha existe.",
    "- A escuta humana não foi realizada.",
    "- A licença comercial da voz e a validação jurídica do Remotion permanecem pendentes.",
    "- O ranking não escolhe o vencedor; entrega 3 finalistas ao usuário.",
]

with open(os.path.join(ROOT, "evaluation", "GATE4_FINAL_RANKING.md"), "w", encoding="utf-8") as handle:
    handle.write("\n".join(lines) + "\n")

print("\n".join(lines))

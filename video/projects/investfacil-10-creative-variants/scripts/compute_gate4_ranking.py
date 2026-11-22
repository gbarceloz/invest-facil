"""Compute the Gate 4 weighted ranking from actual-video agent scores."""

import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCORES = os.path.join(ROOT, "evaluation", "GATE4_AGENT_SCORES.json")

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
    rows.append({
        "id": vid,
        "hook": hook,
        "retention": s["retention"],
        "editing": s["editing"],
        "motion": s["motion"],
        "sound": s["sound"],
        "clarity": s["clarity"],
        "distribution": s["traffic_distribution"],
        "brand": brand,
        "technical": s["qc_technique"],
        "total": total,
        "qc_verdict": s.get("qc_verdict", "PASS"),
        "qc_risk": s.get("qc_risk"),
    })

rows.sort(key=lambda row: (-row["total"], -row["hook"], -row["retention"], -row["clarity"]))


def fmt(value):
    return f"{value:.1f}".replace(".", ",")


print("| Rank | ID | Hook | Retenção /20 | Edição | Motion | Som | Clareza | Distribuição | Marca | Técnica | Total /100 | QC |")
print("|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|")
for index, row in enumerate(rows, start=1):
    print(
        f"| {index} | {row['id']} | {fmt(row['hook'])} | {fmt(row['retention'])} | {fmt(row['editing'])} | "
        f"{fmt(row['motion'])} | {fmt(row['sound'])} | {fmt(row['clarity'])} | {fmt(row['distribution'])} | "
        f"{fmt(row['brand'])} | {fmt(row['technical'])} | {fmt(row['total'])} | {row['qc_verdict']} |"
    )

print()
print("Top 3:", ", ".join(row["id"] for row in rows[:3]))
print("Bottom 3:", ", ".join(row["id"] for row in rows[-3:]))

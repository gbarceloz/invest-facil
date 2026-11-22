"""Compute the preliminary Gate 3 weighted ranking from agent scores."""

import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(ROOT, "evaluation", "AGENT_SCORES.json"), encoding="utf-8") as handle:
    data = json.load(handle)

rows = []
for vid, s in data["scores"].items():
    hook = (s["creative_hook"] + s["retention_hook"] + s["traffic_hook"]) / 3
    brand = (s["creative_brand"] + s["qc_brand"]) / 2
    hook_pts = hook * 1.5
    retention_pts = s["retention"]  # already /20
    editing_pts = s["editing"] * 1.5
    motion_pts = s["motion"]
    sound_pts = s["sound"]
    clarity_pts = s["clarity"]
    distribution_pts = s["distribution"]
    brand_pts = brand * 0.5
    total = hook_pts + retention_pts + editing_pts + motion_pts + sound_pts + clarity_pts + distribution_pts + brand_pts
    normalized = total / 95 * 100
    rows.append({
        "id": vid,
        "hook": hook,
        "retention": s["retention"],
        "editing": s["editing"],
        "motion": s["motion"],
        "sound": s["sound"],
        "clarity": s["clarity"],
        "distribution": s["distribution"],
        "brand": brand,
        "hook_pts": hook_pts,
        "retention_pts": retention_pts,
        "editing_pts": editing_pts,
        "motion_pts": motion_pts,
        "sound_pts": sound_pts,
        "clarity_pts": clarity_pts,
        "distribution_pts": distribution_pts,
        "brand_pts": brand_pts,
        "total": total,
        "normalized": normalized,
        "qc_editorial": s["qc_editorial"],
        "qc_risk": s["qc_risk"],
    })

rows.sort(key=lambda r: (-r["normalized"], -r["hook"], -r["retention"], -r["clarity"]))


def fmt(value):
    return f"{value:.1f}".replace(".", ",")


print("| Rank | ID | Hook | Retenção /20 | Edição | Motion | Som | Clareza | Distribuição | Marca | Total /95 | Normalizado /100 | QC |")
print("|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|")
for index, r in enumerate(rows, start=1):
    print(
        f"| {index} | {r['id']} | {fmt(r['hook'])} | {fmt(r['retention'])} | {fmt(r['editing'])} | "
        f"{fmt(r['motion'])} | {fmt(r['sound'])} | {fmt(r['clarity'])} | {fmt(r['distribution'])} | "
        f"{fmt(r['brand'])} | {fmt(r['total'])} | {fmt(r['normalized'])} | {r['qc_editorial']} |"
    )

print()
print("Top 3:", ", ".join(r["id"] for r in rows[:3]))
print("Bottom 3:", ", ".join(r["id"] for r in rows[-3:]))

"""Create placeholder timing.json files from the Gate 3 script timecodes.

These are overwritten by the measured narration timings after TTS generation.
"""

import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "src", "variants")
IDS = [f"V{i:02d}" for i in range(2, 11)]

for vid in IDS:
    path = os.path.join(ROOT, vid, "SCRIPT.md")
    with open(path, encoding="utf-8") as handle:
        lines = handle.read().splitlines()
    rows = []
    for line in lines:
        if not line.startswith("| ") or "–" not in line:
            continue
        cells = [cell.strip() for cell in line.strip("|").split("|")]
        if len(cells) < 2 or cells[0] in ("Tempo", "---") or "Narração" in cells[0]:
            continue
        start_text, end_text = cells[0].replace(" s", "").split("–")
        start = float(start_text.replace(",", "."))
        end = float(end_text.replace(",", "."))
        rows.append({
            "id": f"L{len(rows) + 1:02d}",
            "display": cells[1],
            "start": start,
            "end": end,
            "duration": round(end - start, 3),
        })
    outdir = os.path.join(SRC, vid.lower())
    os.makedirs(outdir, exist_ok=True)
    with open(os.path.join(outdir, "timing.json"), "w", encoding="utf-8") as handle:
        json.dump({"variant": vid, "lines": rows, "placeholder": True}, handle, ensure_ascii=False, indent=2)
    print(vid, len(rows))

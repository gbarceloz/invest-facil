"""Build per-variant narration JSON from the Gate 3 SCRIPT.md tables.

The display text stays as written in the script. The TTS text expands numbers
to their spoken form so Edge TTS pronounces them correctly.
"""

import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDS = [f"V{i:02d}" for i in range(1, 11)]


def expand(text):
    t = text
    t = t.replace("R$ 100", "cem reais")
    t = t.replace("R$ 61,39", "sessenta e um reais e trinta e nove centavos")
    t = t.replace("R$ 61", "sessenta e um reais")
    t = t.replace("R$ 78", "setenta e oito reais")
    t = t.replace("25%", "vinte e cinco por cento")
    t = t.replace("39%", "trinta e nove por cento")
    t = t.replace("5%", "cinco por cento")
    t = re.sub(r"\b100\b", "cem", t)
    t = re.sub(r"\b78\b", "setenta e oito", t)
    t = re.sub(r"\b61\b", "sessenta e um", t)
    t = re.sub(r"\b10\b", "dez", t)
    t = re.sub(r"\b5\b", "cinco", t)
    return t


def parse_script(vid):
    path = os.path.join(ROOT, vid, "SCRIPT.md")
    with open(path, encoding="utf-8") as handle:
        lines = handle.read().splitlines()

    rows = []
    for line in lines:
        if not line.startswith("| ") or "–" not in line:
            continue
        cells = [cell.strip() for cell in line.strip("|").split("|")]
        if len(cells) < 6:
            continue
        if cells[0] in ("Tempo", "---") or "Narração" in cells[0]:
            continue
        time_value = cells[0].replace(" s", "")
        if "–" not in time_value:
            continue
        narration = cells[1]
        screen = cells[2]
        if not narration:
            continue
        rows.append({
            "display": narration,
            "screen": screen,
            "time": time_value,
        })
    return rows


def pause_for(row, is_last):
    if is_last:
        return 0
    screen = row["screen"].upper()
    if "INFLAÇÃO" in screen or "SIMULAÇÃO" in screen:
        return 220
    if "SIGA" in screen or "SALVE" in screen or "COMENTE" in screen:
        return 200
    return 120


def main():
    summary = []
    for vid in IDS:
        rows = parse_script(vid)
        payload = []
        for index, row in enumerate(rows):
            payload.append({
                "id": f"L{index + 1:02d}",
                "display": row["display"],
                "tts": expand(row["display"]),
                "pause_ms": pause_for(row, index == len(rows) - 1),
            })
        out = os.path.join(ROOT, "scripts", f"{vid.lower()}_narration.json")
        with open(out, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, ensure_ascii=False, indent=2)
        summary.append((vid, len(payload), out))
        print(f"{vid}: {len(payload)} lines -> {out}")
    return summary


if __name__ == "__main__":
    main()

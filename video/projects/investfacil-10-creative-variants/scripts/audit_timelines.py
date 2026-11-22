"""Verify that every Gate 3 timeline fits its declared duration and has no dead air."""

import importlib.util
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V2 = os.path.join(ROOT, "scripts", "generate_gate3_v2.py")

spec = importlib.util.spec_from_file_location("g3", V2)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

fail = 0
checks = 0


def check(name, condition, detail=""):
    global fail, checks
    checks += 1
    if not condition:
        fail += 1
        print(f"FAIL | {name} | {detail}")


def parse_md_span(value):
    value = value.replace(" s", "").strip()
    start, end = value.split("–")
    return float(start.replace(",", ".")), float(end.replace(",", "."))


for c in mod.prepare():
    vid = c["id"]
    duration = c["duration_seconds"]
    rows = c["rows"]

    # narration continuity
    for i in range(len(rows) - 1):
        gap = rows[i + 1]["start"] - rows[i]["end"]
        check(f"{vid} gap {i}", gap <= 0.36, f"{gap:.3f}s")
    check(f"{vid} last narration fits", rows[-1]["end"] <= duration + 0.01, f"{rows[-1]['end']:.2f} > {duration}")
    check(f"{vid} tail", duration - rows[-1]["end"] >= 0.3, f"{duration - rows[-1]['end']:.2f}s")

    # storyboard times from the generated document
    storyboard = open(os.path.join(ROOT, vid, "STORYBOARD.md"), encoding="utf-8").read()
    max_shot = 0.0
    shot_rows = 0
    for line in storyboard.splitlines():
        if line.startswith("| S") and "–" in line:
            cells = [cell.strip() for cell in line.strip("|").split("|")]
            if len(cells) >= 2:
                start, end = parse_md_span(cells[1])
                max_shot = max(max_shot, end)
                shot_rows += 1
    check(f"{vid} storyboard rows", shot_rows == len(c["shots"]), f"{shot_rows} != {len(c['shots'])}")
    check(f"{vid} storyboard fits", max_shot <= duration + 0.05, f"{max_shot:.2f} > {duration}")

    # retention times from the generated document
    retention = open(os.path.join(ROOT, vid, "RETENTION_MAP.md"), encoding="utf-8").read()
    max_block = 0.0
    for line in retention.splitlines():
        if line.startswith("| ") and "–" in line and "Intervalo" not in line:
            cells = [cell.strip() for cell in line.strip("|").split("|")]
            if len(cells) >= 2 and re.match(r"^\d", cells[0]):
                start, end = parse_md_span(cells[0])
                max_block = max(max_block, end)
    check(f"{vid} retention fits", max_block <= duration + 0.05, f"{max_block:.2f} > {duration}")

    print(f"{vid}: dur={duration:.1f}s last={rows[-1]['end']:.1f}s tail={duration - rows[-1]['end']:.1f}s shots={max_shot:.1f}s retention={max_block:.1f}s")

print(f"\n{checks} checks, {fail} failures")

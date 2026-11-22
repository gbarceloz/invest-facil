"""Gate 3 QC — narration pacing estimator.

Reads the SCRIPT.md tables of V01-V10 and computes words per second per segment.
Calibration: High Impact 01 Thalita narration = 95 words / 35.136 s = 2.70 w/s.
No rendering, no video writing.
"""
import re, os, json

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def words(t):
    t = t.replace("–", " ")
    toks = re.findall(r"[A-Za-zÀ-ÿ0-9%$]+", t)
    return [w for w in toks if re.search(r"[A-Za-zÀ-ÿ0-9]", w)]


rows_out = []
for i in range(1, 11):
    vid = f"V{i:02d}"
    path = os.path.join(ROOT, vid, "SCRIPT.md")
    txt = open(path, encoding="utf-8").read()
    total_words = 0
    total_sec = 0.0
    segs = []
    overload = []
    for line in txt.splitlines():
        if not line.strip().startswith("|"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) < 3:
            continue
        m = re.match(r"^(\d+),(\d+)\s*[–-]\s*(\d+),(\d+)$", cells[0])
        if not m:
            continue
        a = float(f"{m.group(1)}.{m.group(2)}")
        b = float(f"{m.group(3)}.{m.group(4)}")
        dur = b - a
        n = len(words(cells[1]))
        total_words += n
        total_sec += dur
        wps = n / dur if dur else 0
        segs.append((cells[0], dur, n, round(wps, 2)))
        if wps >= 3.2:
            overload.append((cells[0], dur, n, round(wps, 2), cells[1]))
    rows_out.append({
        "vid": vid,
        "script_span_s": round(total_sec, 1),
        "words": total_words,
        "avg_wps": round(total_words / total_sec, 2) if total_sec else 0,
        "segments": segs,
        "overload_ge_3_2_wps": overload,
    })

for r in rows_out:
    print(f"\n{r['vid']}: span={r['script_span_s']}s words={r['words']} avg={r['avg_wps']} w/s")
    for w in r["overload_ge_3_2_wps"]:
        print(f"  {w[0]} dur={w[1]}s words={w[2]} {w[3]} w/s | {w[4]}")

json.dump(rows_out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "gate3-pacing.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

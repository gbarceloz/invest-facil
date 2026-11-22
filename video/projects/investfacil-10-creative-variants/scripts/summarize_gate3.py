import importlib.util
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V2 = os.path.join(ROOT, "scripts", "generate_gate3_v2.py")

spec = importlib.util.spec_from_file_location("gate3_v2", V2)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

concepts = mod.prepare()
summary = []
for c in concepts:
    chars = sum(r["chars"] for r in c["rows"])
    speech = sum(r["speech"] for r in c["rows"])
    cuts = sum(mod.micro_cuts(c, r) for r in c["rows"])
    summary.append({
        "id": c["id"],
        "title": c["title"],
        "duration_s": c["duration_seconds"],
        "rows": len(c["rows"]),
        "chars": chars,
        "cps": round(chars / c["duration_seconds"], 2),
        "speech_s": round(speech, 2),
        "shots": len(c["shots"]),
        "retention_blocks": len(c["retention"]),
        "internal_cuts": cuts,
        "hook": c["hook"],
    })

print(json.dumps(summary, ensure_ascii=False, indent=2))
print("total docs", sum(1 for vid in summary for name in ["CONCEPT.md", "SCRIPT.md", "STORYBOARD.md", "EDITING_TIMELINE.md", "SOUND_DESIGN.md", "RETENTION_MAP.md", "QUALITY_CHECKLIST.md"] if os.path.exists(os.path.join(ROOT, vid["id"], name))))

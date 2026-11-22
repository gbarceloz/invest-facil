import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDS = [f"V{i:02d}" for i in range(1, 11)]
FILES = ["CONCEPT.md", "SCRIPT.md", "STORYBOARD.md", "MOTION_DESIGN.md", "EDITING_TIMELINE.md", "SOUND_DESIGN.md", "RETENTION_MAP.md", "QUALITY_CHECKLIST.md"]

docs = 0
missing = []
for vid in IDS:
    for name in FILES:
        path = os.path.join(ROOT, vid, name)
        if os.path.exists(path):
            docs += 1
        else:
            missing.append(f"{vid}/{name}")

mp4 = []
for base, _, files in os.walk(ROOT):
    for name in files:
        if name.lower().endswith((".mp4", ".mov", ".mkv")):
            mp4.append(os.path.join(base, name))

with open(os.path.join(ROOT, "reports", "GATE3_INTEGRITY.json"), encoding="utf-8") as handle:
    integrity = json.load(handle)

print("docs", docs, "expected", len(IDS) * len(FILES))
print("missing", missing)
print("mp4", mp4)
print("integrity", integrity["documents"], integrity["audits"])
print("preliminary_finalists", integrity["preliminary_finalists"])

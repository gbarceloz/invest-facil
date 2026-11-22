"""Copy measured narration timings into the Remotion configs."""

import json
import os

VIDEO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
PUBLIC = os.path.join(VIDEO_ROOT, "public", "projects", "investfacil-10-creative-variants")
SRC = os.path.join(VIDEO_ROOT, "src", "variants")

for number in range(2, 11):
    vid = f"V{number:02d}"
    measured = os.path.join(PUBLIC, vid.lower(), "narration", "narration-timing.json")
    target = os.path.join(SRC, vid.lower(), "timing.json")
    if not os.path.exists(measured):
        print(vid, "missing")
        continue
    with open(measured, encoding="utf-8") as handle:
        data = json.load(handle)
    payload = {"variant": vid, "lines": data["lines"], "placeholder": False}
    with open(target, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
    print(vid, "synced", len(data["lines"]), data["total_s"])

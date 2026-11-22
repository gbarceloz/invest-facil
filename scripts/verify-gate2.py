"""Gate 2 integrity check for the Invest Fácil audiovisual system."""

import json
import os
import re
import shutil
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AGENTS = os.path.join(ROOT, ".opencode", "agents")
SKILLS = os.path.join(ROOT, ".opencode", "skills")
MEMORY = os.path.join(ROOT, "video", "MEMORY.md")
COLLECTION = os.path.join(ROOT, "video", "projects", "investfacil-10-creative-variants")

EXPECTED_AGENTS = [
    "if-creative-director.md",
    "if-video-editor.md",
    "if-motion-designer.md",
    "if-sound-designer.md",
    "if-storyteller.md",
    "if-traffic-strategist.md",
    "if-retention-specialist.md",
    "if-quality-control.md",
]
EXPECTED_SKILLS = [
    "professional-video-editing",
    "traffic-strategy",
    "retention-engine",
    "creative-direction",
    "audiovisual-quality-control",
]
EXPECTED_DECISIONS = [
    "Thalita",
    "100–180 ms",
    "1–3 s",
    "10 vídeos",
    "project-local",
]


def main():
    checks = []
    failures = []

    def check(name, condition, detail):
        checks.append({"check": name, "ok": bool(condition), "detail": detail})
        if not condition:
            failures.append(name)

    for name in EXPECTED_AGENTS:
        path = os.path.join(AGENTS, name)
        exists = os.path.isfile(path)
        check(f"agent:{name}", exists, path)
        if exists:
            text = open(path, encoding="utf-8-sig").read()
            check(f"agent_frontmatter:{name}", text.startswith("---") and "mode: subagent" in text, "frontmatter")
            check(f"agent_skill:{name}", "action: \"skill\"" in text, "skill permission")

    for skill in EXPECTED_SKILLS:
        path = os.path.join(SKILLS, skill, "SKILL.md")
        exists = os.path.isfile(path)
        check(f"skill:{skill}", exists, path)
        if exists:
            text = open(path, encoding="utf-8-sig").read()
            check(f"skill_frontmatter:{skill}", text.startswith("---") and "description:" in text, "frontmatter")
            check(f"skill_content:{skill}", len(text) > 1000, len(text))

    check("memory", os.path.isfile(MEMORY), MEMORY)
    if os.path.isfile(MEMORY):
        text = open(MEMORY, encoding="utf-8-sig").read()
        for decision in EXPECTED_DECISIONS:
            check(f"memory:{decision}", decision in text, decision)

    for i in range(1, 11):
        path = os.path.join(COLLECTION, f"V{i:02d}")
        check(f"collection:V{i:02d}", os.path.isdir(path), path)
        # Gate 2 must not contain rendered collection videos.
        videos = [name for name in os.listdir(path)] if os.path.isdir(path) else []
        check(f"collection_empty:V{i:02d}", not any(name.lower().endswith(".mp4") for name in videos), videos)

    for doc in ("GATE1_AUDIT.md", "GATE2_VALIDATION.md"):
        path = os.path.join(ROOT, "docs", doc)
        check(f"doc:{doc}", os.path.isfile(path), path)

    check("scoring_template", os.path.isfile(os.path.join(COLLECTION, "evaluation", "SCORING_TEMPLATE.md")), "template")

    tools = {}
    tool_env = {
        "ffmpeg": "FFMPEG",
        "ffprobe": "FFPROBE",
        "yt-dlp": "YTDLP",
        "hyperframes": "HYPERFRAMES",
    }
    tool_paths = {
        command: os.environ.get(env_name) or shutil.which(command)
        for command, env_name in tool_env.items()
    }
    for command, path in tool_paths.items():
        if not path:
            tools[command] = "not found"
            check(f"tool:{command}", False, "not found")
            continue
        try:
            if path.lower().endswith((".cmd", ".bat")):
                result = subprocess.run(["cmd", "/c", path, "--version"], capture_output=True, text=True, timeout=30)
            else:
                result = subprocess.run([path, "--version"], capture_output=True, text=True, timeout=30)
            output = (result.stdout or result.stderr).strip().splitlines()
            tools[command] = output[0] if output else "no output"
            check(f"tool:{command}", bool(output), tools[command])
        except Exception as exc:
            tools[command] = str(exc)
            check(f"tool:{command}", False, str(exc))

    report = {"ok": not failures, "failures": failures, "checks": checks, "tools": tools}
    with open(os.path.join(ROOT, "docs", "GATE2_INTEGRITY.json"), "w", encoding="utf-8") as handle:
        json.dump(report, handle, ensure_ascii=False, indent=2)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()

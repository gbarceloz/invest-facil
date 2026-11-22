"""Final integrity check for Invest Fácil High Impact 01."""

import hashlib
import json
import os
import shutil
import subprocess

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RENDER = os.path.join(PROJECT, "render")
AUDIO = os.path.join(PROJECT, "audio")
LOCALAPPDATA = os.environ.get("LOCALAPPDATA")
DRAFTS = os.environ.get("CAPCUT_DRAFTS_DIR") or (
    os.path.join(LOCALAPPDATA, "CapCut", "User Data", "Projects", "com.lveditor.draft")
    if LOCALAPPDATA
    else None
)
FFPROBE = os.environ.get("FFPROBE") or shutil.which("ffprobe")
if not DRAFTS:
    raise SystemExit("CAPCUT_DRAFTS_DIR is required")
if not FFPROBE:
    raise SystemExit("ffprobe not found; set FFPROBE or add it to PATH")

DRAFT = os.path.join(DRAFTS, "if_high_impact_01_delivery_20261121")

EXPECTED = {
    "remotion": (
        os.path.join(RENDER, "investfacil-high-impact-01-delivery.mp4"),
        "7A3E6511FEA29C70F1A1689CB37C72081D229D242E747412BBA88A21017F2C6D",
        40.0,
    ),
    "capcut": (
        os.path.join(RENDER, "capcut-export-if_high_impact_01_delivery.mp4"),
        "180BC0275108AD5870B60281692ACBEF0FF27232E35E49166708146432B1632F",
        40.008,
    ),
    "narration": (
        os.path.join(AUDIO, "narration", "narracao-thalita-master.wav"),
        "4848413F7D2101964E4974682843145293DCB72CD695A51515CF901E9D264998",
        35.136,
    ),
    "music": (
        os.path.join(AUDIO, "music", "music-bed-master.wav"),
        "04820EDA7A45EFD704EE7B44319454FD109BCE69E171A4A8B22B101CD2979969",
        40.0,
    ),
}


def sha256(path):
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest().upper()


def probe(path):
    result = subprocess.run(
        [
            FFPROBE,
            "-v",
            "error",
            "-show_entries",
            "format=duration,size",
            "-show_entries",
            "stream=codec_name,codec_type,width,height,r_frame_rate,sample_rate,channels",
            "-of",
            "json",
            path,
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    return json.loads(result.stdout)


def main():
    checks = []
    failures = []

    def check(name, condition, detail):
        checks.append({"check": name, "ok": bool(condition), "detail": detail})
        if not condition:
            failures.append(name)

    for label, (path, expected_hash, expected_duration) in EXPECTED.items():
        check(f"file:{label}", os.path.isfile(path), path)
        if os.path.isfile(path):
            check(f"hash:{label}", sha256(path) == expected_hash, sha256(path))
            info = probe(path)
            check(
                f"duration:{label}",
                abs(float(info["format"]["duration"]) - expected_duration) < 0.1,
                info["format"]["duration"],
            )

    rem = probe(EXPECTED["remotion"][0])
    cap = probe(EXPECTED["capcut"][0])
    for label, info in (("remotion", rem), ("capcut", cap)):
        streams = {stream["codec_type"]: stream for stream in info["streams"]}
        check(f"{label}:video", streams.get("video", {}).get("codec_name") == "h264", streams.get("video"))
        check(f"{label}:audio", streams.get("audio", {}).get("codec_name") == "aac", streams.get("audio"))
        check(
            f"{label}:dimensions",
            streams.get("video", {}).get("width") == 1080 and streams.get("video", {}).get("height") == 1920,
            streams.get("video"),
        )
        check(f"{label}:fps", streams.get("video", {}).get("r_frame_rate") == "30/1", streams.get("video"))

    content_path = os.path.join(DRAFT, "draft_content.json")
    check("draft:content", os.path.isfile(content_path), content_path)
    if os.path.isfile(content_path):
        with open(content_path, "r", encoding="utf-8") as handle:
            content = json.load(handle)
        check("draft:duration", int(content.get("duration", 0)) == 40_000_000, content.get("duration"))
        check("draft:no_texts", len(content.get("materials", {}).get("texts", [])) == 0, len(content.get("materials", {}).get("texts", [])))
        videos = content.get("materials", {}).get("videos", [])
        audios = content.get("materials", {}).get("audios", [])
        check("draft:video_count", len(videos) == 1, len(videos))
        check("draft:audio_count", len(audios) == 1, len(audios))
        if videos:
            video = videos[0]
            check("draft:video_local", os.path.isfile(video.get("path", "")) and os.path.commonpath([DRAFT, video["path"]]) == DRAFT, video.get("path"))
            check("draft:video_dims", video.get("width") == 1080 and video.get("height") == 1920, (video.get("width"), video.get("height")))
        if audios:
            audio = audios[0]
            check("draft:audio_local", os.path.isfile(audio.get("path", "")) and os.path.commonpath([DRAFT, audio["path"]]) == DRAFT, audio.get("path"))
        check("draft:no_mchx", "MCHX_" not in json.dumps(content), "MCHX_ found")

    for name in ("contact-sheet-delivery.png",):
        check(f"artifact:{name}", os.path.isfile(os.path.join(RENDER, name)), os.path.join(RENDER, name))
    for name in ("RELATORIO_TECNICO.md", "RELATORIO_QUALIDADE.md", "ASSETS_LICENSES.md"):
        check(f"doc:{name}", os.path.isfile(os.path.join(PROJECT, "docs", name)), os.path.join(PROJECT, "docs", name))
    check("doc:ROTEIRO", os.path.isfile(os.path.join(PROJECT, "script", "ROTEIRO.md")), os.path.join(PROJECT, "script", "ROTEIRO.md"))
    check("voice:thalita", "Thalita" in open(os.path.join(PROJECT, "script", "ROTEIRO.md"), encoding="utf-8").read(), "Thalita")
    check("script:corrected", "cerca de sessenta e um" in open(os.path.join(PROJECT, "script", "ROTEIRO.md"), encoding="utf-8").read(), "correção 61,39")

    sfx = [name for name in os.listdir(os.path.join(AUDIO, "sfx")) if name.endswith(".wav")]
    check("sfx:count", len(sfx) >= 8, sfx)

    report = {"ok": not failures, "failures": failures, "checks": checks}
    with open(os.path.join(PROJECT, "docs", "final-integrity-check.json"), "w", encoding="utf-8") as handle:
        json.dump(report, handle, ensure_ascii=False, indent=2)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()

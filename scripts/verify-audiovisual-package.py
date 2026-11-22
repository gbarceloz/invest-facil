"""Final integrity check for the Invest Fácil audiovisual correction package."""

import hashlib
import json
import os
import shutil
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIDEO_OUT = os.path.join(ROOT, "video", "out")
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

EXPECTED = {
    "old_lab": (
        os.path.join(VIDEO_OUT, "investfacil-lab.mp4"),
        "D00B92E313DC26DC3E5B271750537CEDE3D516FDC85647E947A997E8A4E30189",
    ),
    "old_capcut": (
        os.path.join(VIDEO_OUT, "capcut-export-if_lab_remotion_20261121.mp4"),
        "3359D449B823FDF10E2023C141AB6DA95858AEEAC08BE6E4CEB53C7386EDE07B",
    ),
    "v2": (
        os.path.join(VIDEO_OUT, "investfacil-lab-v2.mp4"),
        "E4D950CE829761FDC43B104150C5E4824A05EE922A1EC05262F4509C669E1E6F",
    ),
    "capcut_v2": (
        os.path.join(VIDEO_OUT, "capcut-export-if_lab_v2_20261121.mp4"),
        "8E33393CB8F435F92C42F64956A9947C6E7F21751A4420DACBD41D7C802FC408",
    ),
}

PRESERVED_DRAFTS = {
    "1023": "6454EA7FE5311D8C8BFCDDE348BAC5D4BA075AC38D375534B57648D6B6AFE06D",
    "1120": "F65FA5470D3451054403C446D13BD05A58D28B96244ACD12AAFD4EB85DC0CCB1",
    "investfacil_piloto": "ADDB410F797EEE40BA746D697D61C92A1C765B2B9C4FBDFE60D18988FC453837",
    "if_piloto_diversificacao": "3E667BFDCCE9A850308F55B374A7B973E155F4A0C663B5273363B323CA33B58B",
}


def sha256(path):
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest().upper()


def ffprobe(path):
    result = subprocess.run(
        [
            FFPROBE,
            "-v",
            "error",
            "-show_entries",
            "format=duration,size",
            "-show_entries",
            "stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels",
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

    for name, (path, expected_hash) in EXPECTED.items():
        exists = os.path.isfile(path)
        check(f"file:{name}", exists, path)
        if exists:
            actual = sha256(path)
            check(f"hash:{name}", actual == expected_hash, actual)

    for name, expected_hash in PRESERVED_DRAFTS.items():
        path = os.path.join(DRAFTS, name, "draft_content.json")
        exists = os.path.isfile(path)
        check(f"preserved:{name}", exists, path)
        if exists:
            actual = sha256(path)
            check(f"preserved_hash:{name}", actual == expected_hash, actual)

    v2_info = ffprobe(EXPECTED["v2"][0])
    cap_info = ffprobe(EXPECTED["capcut_v2"][0])
    check("v2:duration", abs(float(v2_info["format"]["duration"]) - 19.008) < 0.05, v2_info["format"]["duration"])
    check("capcut:duration", abs(float(cap_info["format"]["duration"]) - 21.014) < 0.05, cap_info["format"]["duration"])
    for label, info in (("v2", v2_info), ("capcut", cap_info)):
        streams = {stream["codec_type"]: stream for stream in info["streams"]}
        check(f"{label}:video", streams.get("video", {}).get("codec_name") == "h264", streams.get("video"))
        check(f"{label}:audio", streams.get("audio", {}).get("codec_name") == "aac", streams.get("audio"))
        check(f"{label}:size", streams.get("video", {}).get("width") == 1080 and streams.get("video", {}).get("height") == 1920, streams.get("video"))

    draft_dir = os.path.join(DRAFTS, "if_lab_v2_20261121")
    content_path = os.path.join(draft_dir, "draft_content.json")
    check("draft:content", os.path.isfile(content_path), content_path)
    if os.path.isfile(content_path):
        with open(content_path, "r", encoding="utf-8") as handle:
            content = json.load(handle)
        audios = content.get("materials", {}).get("audios", [])
        check("draft:audio_count", len(audios) == 1, len(audios))
        if audios:
            audio_path = audios[0].get("path", "")
            check("draft:audio_local", os.path.isfile(audio_path) and os.path.commonpath([draft_dir, audio_path]) == draft_dir, audio_path)
            if os.path.isfile(audio_path):
                with open(audio_path, "rb") as handle:
                    header = handle.read(12)
                check("draft:audio_riff", header.startswith(b"RIFF") and b"WAVE" in header, header.hex())
        check("draft:no_texts", len(content.get("materials", {}).get("texts", [])) == 0, len(content.get("materials", {}).get("texts", [])))
        videos = content.get("materials", {}).get("videos", [])
        check("draft:video_count", len(videos) == 2, len(videos))
        for video in videos:
            check(f"draft:video_exists:{video.get('id')}", os.path.isfile(video.get("path", "")), video.get("path"))
            if video.get("type") == "video":
                check("draft:video_dims", video.get("width") == 1080 and video.get("height") == 1920, (video.get("width"), video.get("height")))

    for name in ("v2cc-contact.png", "v2-guide-contact.png", "blender-isolated-mcp.png", "blender-isolated-test.glb", "blender-isolated-test.blend"):
        check(f"artifact:{name}", os.path.isfile(os.path.join(VIDEO_OUT, name)), os.path.join(VIDEO_OUT, name))

    glb = os.path.join(VIDEO_OUT, "blender-isolated-test.glb")
    if os.path.isfile(glb):
        with open(glb, "rb") as handle:
            header = handle.read(12)
        check("blender:glb_header", header[:4] == b"glTF", header.hex())

    png_info = ffprobe(os.path.join(VIDEO_OUT, "blender-isolated-mcp.png"))
    png_stream = png_info["streams"][0]
    check("blender:render", png_stream.get("width") == 800 and png_stream.get("height") == 800, png_stream)

    voice_dir = os.path.join(ROOT, "video", "auditions", "voice-samples", "v2-normalized")
    voice_files = [name for name in os.listdir(voice_dir) if name.endswith(".wav") and name[:2].isdigit()]
    check("voice:samples", len(voice_files) >= 7, voice_files)
    comparison = os.path.join(voice_dir, "comparison.m4a")
    check("voice:comparison", os.path.isfile(comparison), comparison)
    if os.path.isfile(comparison):
        comparison_info = ffprobe(comparison)
        check("voice:comparison_duration", abs(float(comparison_info["format"]["duration"]) - 128.779) < 0.2, comparison_info["format"]["duration"])

    for doc in (
        os.path.join(ROOT, "docs", "AUDIOVISUAL_PIPELINE_VALIDATION.md"),
        os.path.join(ROOT, "docs", "EDITORIAL_REVIEW_PACKAGE.md"),
        os.path.join(ROOT, "video", "auditions", "VOICE_OPTIONS.md"),
        os.path.join(ROOT, "video", "auditions", "narracao-corrigida.txt"),
    ):
        check(f"doc:{os.path.basename(doc)}", os.path.isfile(doc), doc)

    report = {"ok": not failures, "failures": failures, "checks": checks}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    with open(os.path.join(ROOT, "_audit", "final-integrity-check.json"), "w", encoding="utf-8") as handle:
        json.dump(report, handle, ensure_ascii=False, indent=2)
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()

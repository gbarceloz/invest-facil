"""Transcribe each final MP4 with Whisper small as an intelligibility proxy."""

import os
import shutil
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WHISPER = os.environ.get("WHISPER_CTRANSLATE2") or shutil.which("whisper-ctranslate2")
if not WHISPER:
    raise SystemExit("whisper-ctranslate2 not found; set WHISPER_CTRANSLATE2 or add it to PATH")

SLUGS = {
    "V01": "ticker-nao-para",
    "V02": "cafe-de-sempre",
    "V03": "maquina-de-encolher",
    "V04": "100-em-30-segundos",
    "V05": "nota-sobre-a-mesa",
    "V06": "nao-e-impressao",
    "V07": "linha-do-bolso",
    "V08": "papo-de-mercado",
    "V09": "imposto-invisivel",
    "V10": "espelho-do-dinheiro",
}

for vid, slug in SLUGS.items():
    render_dir = os.path.join(ROOT, vid, "render")
    final = os.path.join(render_dir, f"{vid}-{slug}.mp4")
    out = os.path.join(render_dir, "whisper")
    os.makedirs(out, exist_ok=True)
    if not os.path.exists(final):
        print(vid, "missing")
        continue
    target = os.path.join(out, f"{vid}-{slug}.srt")
    if os.path.exists(target):
        print(vid, "exists")
        continue
    print(vid, "transcribing", flush=True)
    result = subprocess.run(
        [WHISPER, final, "--model", "small", "--language", "pt", "--output_format", "srt", "--output_dir", out, "--vad_filter", "False"],
        text=True,
        capture_output=True,
    )
    print(vid, "rc", result.returncode, flush=True)
    if result.returncode != 0:
        print(result.stderr[-2000:], flush=True)

"""Two-pass loudness normalization for a rendered MP4."""

import json
import os
import re
import shutil
import subprocess
import sys


def run(cmd):
    result = subprocess.run(cmd, text=True, capture_output=True)
    if result.returncode != 0:
        print(result.stdout)
        print(result.stderr)
        raise SystemExit(result.returncode)
    return result


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: normalize_loudness.py input.mp4 output.mp4")
    src, dst = sys.argv[1], sys.argv[2]
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise SystemExit("ffmpeg not found")

    pass1 = run([
        ffmpeg, "-hide_banner", "-nostats", "-i", src,
        "-af", "loudnorm=I=-14:TP=-1.8:LRA=7:print_format=json",
        "-f", "null", "-",
    ])
    match = re.search(r"\{[\s\S]*?\}", pass1.stderr)
    if not match:
        print(pass1.stderr[-4000:])
        raise SystemExit("could not parse loudnorm JSON")
    data = json.loads(match.group(0))
    print(json.dumps(data, indent=2))

    af = (
        "loudnorm=I=-14:TP=-1.8:LRA=7:"
        f"measured_I={data['input_i']}:"
        f"measured_TP={data['input_tp']}:"
        f"measured_LRA={data['input_lra']}:"
        f"measured_thresh={data['input_thresh']}:"
        f"offset={data['target_offset']}:"
        "linear=true:print_format=summary"
    )
    run([
        ffmpeg, "-y", "-hide_banner", "-loglevel", "error", "-i", src,
        "-c:v", "copy", "-af", af,
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        dst,
    ])
    print("written", dst)


if __name__ == "__main__":
    main()

"""Generate Thalita narration for one variant and build a measured timeline.

Usage:
  python generate_narration.py --variant V01 --lines scripts/v01_narration.json

The script calls edge-tts per line, trims leading/trailing silence, joins the
lines with the planned pauses, writes a 48 kHz mono WAV and a timing JSON.
It does not render video.
"""

import argparse
import array
import json
import math
import os
import shutil
import subprocess
import sys
import wave

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
PUBLIC = os.path.join(ROOT, "public", "projects", "investfacil-10-creative-variants")
VOICE = "pt-BR-ThalitaMultilingualNeural"
RATE = "-12%"
SR = 48000


def run(cmd, cwd=None):
    result = subprocess.run(cmd, cwd=cwd, text=True, capture_output=True)
    if result.returncode != 0:
        print("COMMAND FAILED:", " ".join(cmd))
        print(result.stdout)
        print(result.stderr)
        raise SystemExit(result.returncode)
    return result


def tts(text, out_mp3):
    uvx = shutil.which("uvx")
    if not uvx:
        raise SystemExit("uvx not found on PATH")
    run([
        uvx, "--from", "edge-tts", "edge-tts",
        "--voice", VOICE,
        "--rate=" + RATE,
        "--text", text,
        "--write-media", out_mp3,
    ])


def to_wav(src_mp3, out_wav):
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise SystemExit("ffmpeg not found on PATH")
    run([
        ffmpeg, "-y", "-hide_banner", "-loglevel", "error",
        "-i", src_mp3,
        "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s16le",
        out_wav,
    ])


def trim_wav(src_wav, out_wav):
    ffmpeg = shutil.which("ffmpeg")
    af = (
        "silenceremove=start_periods=1:start_silence=0.02:start_threshold=-50dB,"
        "areverse,"
        "silenceremove=start_periods=1:start_silence=0.02:start_threshold=-50dB,"
        "areverse"
    )
    run([
        ffmpeg, "-y", "-hide_banner", "-loglevel", "error",
        "-i", src_wav,
        "-af", af,
        "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s16le",
        out_wav,
    ])


def cap_internal_silences(path, max_ms=180, min_run_ms=220, threshold_db=-40):
    """Cap long internal silences without touching the first/last silence."""
    with wave.open(path, "rb") as handle:
        params = handle.getparams()
        frames = handle.readframes(handle.getnframes())
    samples = array.array("h")
    samples.frombytes(frames)
    if sys.byteorder == "big":
        samples.byteswap()

    window = int(params.framerate * 0.01)
    threshold = 32768 * (10 ** (threshold_db / 20))
    silent = []
    for offset in range(0, len(samples), window):
        chunk = samples[offset:offset + window]
        if not chunk:
            break
        rms = math.sqrt(sum(value * value for value in chunk) / len(chunk))
        silent.append(rms < threshold)

    runs = []
    start = None
    for index, is_silent in enumerate(silent):
        if is_silent and start is None:
            start = index
        elif not is_silent and start is not None:
            runs.append((start, index))
            start = None
    if start is not None:
        runs.append((start, len(silent)))

    max_frames = int(params.framerate * max_ms / 1000)
    min_run_frames = int(params.framerate * min_run_ms / 1000)
    removals = []
    for run_start, run_end in runs:
        start_frame = run_start * window
        end_frame = min(run_end * window, len(samples))
        length = end_frame - start_frame
        if length <= min_run_frames:
            continue
        if start_frame == 0 or end_frame >= len(samples):
            continue
        keep_each = max_frames // 2
        remove_start = start_frame + keep_each
        remove_end = end_frame - keep_each
        if remove_end > remove_start:
            removals.append((remove_start, remove_end))

    for remove_start, remove_end in sorted(removals, reverse=True):
        del samples[remove_start:remove_end]

    if removals:
        data = samples.tobytes()
        if sys.byteorder == "big":
            samples.byteswap()
            data = samples.tobytes()
        params = params._replace(nframes=len(samples))
        with wave.open(path, "wb") as handle:
            handle.setparams(params)
            handle.writeframes(data)


def wav_frames(path):
    with wave.open(path, "rb") as handle:
        if handle.getnchannels() != 1 or handle.getsampwidth() != 2 or handle.getframerate() != SR:
            raise SystemExit(f"Unexpected WAV format: {path}")
        return handle.readframes(handle.getnframes()), handle.getnframes()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--variant", required=True)
    parser.add_argument("--lines", required=True)
    args = parser.parse_args()

    variant = args.variant.upper()
    lines_path = os.path.abspath(args.lines)
    with open(lines_path, encoding="utf-8") as handle:
        lines = json.load(handle)

    base = os.path.join(PUBLIC, variant.lower(), "narration")
    os.makedirs(base, exist_ok=True)

    timing = []
    cursor_frames = 0
    all_frames = []

    for line in lines:
        line_id = line["id"]
        mp3 = os.path.join(base, f"{line_id}.mp3")
        raw_wav = os.path.join(base, f"{line_id}-raw.wav")
        trim_wav_path = os.path.join(base, f"{line_id}.wav")

        print(f"[{variant}] TTS {line_id}: {line['tts'][:70]}")
        tts(line["tts"], mp3)
        to_wav(mp3, raw_wav)
        trim_wav(raw_wav, trim_wav_path)
        cap_internal_silences(trim_wav_path)
        frames, count = wav_frames(trim_wav_path)

        start = cursor_frames / SR
        end = (cursor_frames + count) / SR
        timing.append({
            "id": line_id,
            "display": line["display"],
            "tts": line["tts"],
            "start": round(start, 3),
            "end": round(end, 3),
            "duration": round(count / SR, 3),
            "pause_after_ms": line["pause_ms"],
        })

        all_frames.append(frames)
        cursor_frames += count
        pause_frames = int(round(SR * line["pause_ms"] / 1000.0))
        if pause_frames:
            all_frames.append(b"\x00\x00" * pause_frames)
            cursor_frames += pause_frames

    tail_frames = int(round(SR * 0.35))
    all_frames.append(b"\x00\x00" * tail_frames)
    cursor_frames += tail_frames

    output_wav = os.path.join(base, "narracao.wav")
    with wave.open(output_wav, "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(SR)
        handle.writeframes(b"".join(all_frames))

    total_s = cursor_frames / SR
    report = {
        "variant": variant,
        "voice": VOICE,
        "rate": RATE,
        "sample_rate": SR,
        "total_s": round(total_s, 3),
        "tail_s": 0.35,
        "lines": timing,
    }
    with open(os.path.join(base, "narration-timing.json"), "w", encoding="utf-8") as handle:
        json.dump(report, handle, ensure_ascii=False, indent=2)

    with open(os.path.join(base, "narracao.srt"), "w", encoding="utf-8", newline="\n") as handle:
        for index, item in enumerate(timing, start=1):
            def stamp(value):
                ms = int(round(value * 1000))
                h, ms = divmod(ms, 3600000)
                m, ms = divmod(ms, 60000)
                s, ms = divmod(ms, 1000)
                return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
            handle.write(f"{index}\n{stamp(item['start'])} --> {stamp(item['end'])}\n{item['display']}\n\n")

    print(f"\n{variant}: {total_s:.3f}s -> {output_wav}")
    for item in timing:
        print(f"  {item['id']} {item['start']:7.3f} - {item['end']:7.3f}  ({item['duration']:.3f}s)  {item['display']}")


if __name__ == "__main__":
    main()

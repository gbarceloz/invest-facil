"""Generate slides, concatenated narration, SRT and timing data for pilot 02."""

import json
import math
import os
import wave

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                    "content", "pilots", "02-diversificacao")
ASSETS = os.path.join(ROOT, "assets")
TTS = os.path.join(ASSETS, "tts")

BG = "#050505"
TEXT = "#FAFAFA"
ACCENT = "#FACC15"
MUTED = "#A3A3A3"

WINDIR = os.environ.get("WINDIR") or os.environ.get("SystemRoot")
FONT_DIR = os.path.join(WINDIR, "Fonts") if WINDIR else ""
SEMIBOLD = os.environ.get("INVESTFACIL_FONT_SEMIBOLD") or os.path.join(FONT_DIR, "seguisb.ttf")
REGULAR = os.environ.get("INVESTFACIL_FONT_REGULAR") or os.path.join(FONT_DIR, "segoeui.ttf")
if not os.path.isfile(SEMIBOLD) or not os.path.isfile(REGULAR):
    raise SystemExit("Fontes Segoe UI nao encontradas; defina INVESTFACIL_FONT_SEMIBOLD/REGULAR")

GAP_SECONDS = 0.30
TAIL_SECONDS = 0.60

# Legendas exibidas em blocos curtos, sem alterar o áudio original.
# Chave = índice da frase (0-based); valor = blocos de exibição.
SUBTITLE_SPLITS = {
    1: [
        "É espalhar o risco entre ativos diferentes.",
        "Sem abrir mão de entender o que você tem.",
    ],
    3: [
        "Se a sua reserva e os seus investimentos",
        "dependem da mesma coisa,",
        "o risco também está concentrado.",
    ],
    5: [
        "Comece pela reserva, defina prazos e limites.",
        "E estude antes de decidir.",
    ],
}


def font(path, size):
    return ImageFont.truetype(path, size)


def wrap(draw, text, face, max_width):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        candidate = word if not current else current + " " + word
        if draw.textlength(candidate, font=face) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_block(draw, lines, face, fill, x, y, line_height):
    for offset, line in enumerate(lines):
        draw.text((x, y + offset * line_height), line, font=face, fill=fill)


def make_slide(path, eyebrow, title, body, footer):
    image = Image.new("RGB", (1080, 1920), BG)
    draw = ImageDraw.Draw(image)

    for x in range(0, 1080, 90):
        draw.line([(x, 0), (x, 1920)], fill=(255, 255, 255, 18), width=1)
    for y in range(0, 1920, 90):
        draw.line([(0, y), (1080, y)], fill=(255, 255, 255, 18), width=1)

    draw.rectangle([90, 150, 202, 160], fill=ACCENT)

    brand = font(SEMIBOLD, 30)
    eyebrow_face = font(SEMIBOLD, 30)
    title_face = font(SEMIBOLD, 88)
    body_face = font(REGULAR, 46)
    footer_face = font(REGULAR, 26)

    draw.text((90, 80), "INVEST FÁCIL", font=brand, fill=TEXT)
    draw.text((90, 210), eyebrow, font=eyebrow_face, fill=ACCENT)

    title_lines = wrap(draw, title, title_face, 900)
    draw_block(draw, title_lines, title_face, TEXT, 90, 340, 108)

    body_lines = wrap(draw, body, body_face, 900)
    draw_block(draw, body_lines, body_face, MUTED, 90, 1010, 64)

    footer_lines = wrap(draw, footer, footer_face, 900)
    draw_block(draw, footer_lines, footer_face, MUTED, 90, 1700, 38)
    draw.text((90, 1810), "educação financeira · sem promessas", font=footer_face, fill=MUTED)

    image.save(path, "PNG")


def wav_duration(path):
    with wave.open(path, "rb") as handle:
        return handle.getnframes() / float(handle.getframerate())


def read_wav(path):
    with wave.open(path, "rb") as handle:
        params = handle.getparams()
        frames = handle.readframes(handle.getnframes())
    return params, frames


def concat_wavs(paths, out_path, gap_seconds, tail_seconds):
    first_params, first_frames = read_wav(paths[0])
    channels, width, rate = first_params.nchannels, first_params.sampwidth, first_params.framerate
    gap_frames = b"\x00" * int(rate * gap_seconds) * channels * width
    tail_frames = b"\x00" * int(rate * tail_seconds) * channels * width

    pieces = []
    for path in paths:
        params, frames = read_wav(path)
        if (params.nchannels, params.sampwidth, params.framerate) != (channels, width, rate):
            raise SystemExit("WAV format mismatch: " + path)
        pieces.append(frames)
        pieces.append(gap_frames)

    with wave.open(out_path, "wb") as handle:
        handle.setnchannels(channels)
        handle.setsampwidth(width)
        handle.setframerate(rate)
        handle.writeframes(b"".join(pieces) + tail_frames)


def srt_time(seconds):
    millis = int(round(seconds * 1000))
    hours, rem = divmod(millis, 3600_000)
    minutes, rem = divmod(rem, 60_000)
    secs, ms = divmod(rem, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{ms:03d}"


def main():
    os.makedirs(ASSETS, exist_ok=True)
    make_slide(
        os.path.join(ASSETS, "slide-01.png"),
        "AULA 02 · DIVERSIFICAÇÃO",
        "Diversificação não é comprar tudo.",
        "É espalhar o risco entre ativos diferentes — sem abrir mão de entender o que você tem.",
        "Série Educação Financeira · Invest Fácil",
    )
    make_slide(
        os.path.join(ASSETS, "slide-02.png"),
        "O QUE ACONTECE",
        "Tudo em um só lugar concentra o risco.",
        "Se a reserva e os investimentos dependem da mesma coisa, um resultado ruim pesa no patrimônio inteiro.",
        "Diversificar não elimina o risco de mercado",
    )
    make_slide(
        os.path.join(ASSETS, "slide-03.png"),
        "MÉTODO",
        "Diversificar é hábito, não coleção.",
        "Reserva primeiro. Prazos e limites claros. Estude antes de decidir.",
        "Conteúdo educativo. Não é recomendação de investimento.",
    )

    sentences = []
    with open(os.path.join(ROOT, "narracao.txt"), encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                sentences.append(line)

    tts_paths = [os.path.join(TTS, f"sentence-{i:02d}.wav") for i in range(1, len(sentences) + 1)]
    for path in tts_paths:
        if not os.path.exists(path):
            raise SystemExit("missing TTS file: " + path)

    concat_wavs(tts_paths, os.path.join(ASSETS, "narracao.wav"), GAP_SECONDS, TAIL_SECONDS)

    timings = []
    cursor = 0.0
    for text, path in zip(sentences, tts_paths):
        duration = wav_duration(path)
        timings.append({"text": text, "start": cursor, "end": cursor + duration})
        cursor += duration + GAP_SECONDS
    total = cursor + TAIL_SECONDS

    subtitle_entries = []
    for sentence_index, item in enumerate(timings):
        parts = SUBTITLE_SPLITS.get(sentence_index, [item["text"]])
        total_chars = sum(len(part) for part in parts)
        duration = item["end"] - item["start"]
        cursor_time = item["start"]
        for part_index, part in enumerate(parts):
            if part_index == len(parts) - 1:
                part_end = item["end"]
            else:
                part_end = cursor_time + duration * len(part) / total_chars
            subtitle_entries.append({"text": part, "start": cursor_time, "end": part_end})
            cursor_time = part_end

    with open(os.path.join(ROOT, "legendas.srt"), "w", encoding="utf-8", newline="\n") as handle:
        for index, item in enumerate(subtitle_entries, start=1):
            handle.write(f"{index}\n{srt_time(item['start'])} --> {srt_time(item['end'])}\n{item['text']}\n\n")

    # Cena 1 = frases 0-1; cena 2 = frases 2-3; cena 3 = frases 4-7.
    scene_indices = [0, 2, 4]
    scene_starts = [timings[index]["start"] for index in scene_indices]
    scenes = [
        {"image": "slide-01.png", "start": scene_starts[0], "end": scene_starts[1]},
        {"image": "slide-02.png", "start": scene_starts[1], "end": scene_starts[2]},
        {"image": "slide-03.png", "start": scene_starts[2], "end": total},
    ]
    data = {"total": total, "scenes": scenes, "sentences": timings}
    with open(os.path.join(ROOT, "timings.json"), "w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)

    print(json.dumps(data, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

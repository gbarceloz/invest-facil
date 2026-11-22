"""Generate license-safe music beds for V02-V10.

Each mood changes tempo, drums, arp and pad. All sounds are synthesized with numpy.
"""

import json
import os
import wave

import numpy as np

SR = 48_000
DURATION = 46.0
ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "public", "projects", "investfacil-10-creative-variants")
rng = np.random.default_rng(20261123)

MOODS = {
    "V02": ("cinematic", 78.0, [55.00, 43.65, 65.41, 49.00]),
    "V03": ("mechanical", 104.0, [49.00, 55.00, 43.65, 65.41]),
    "V04": ("fast", 124.0, [55.00, 65.41, 49.00, 43.65]),
    "V05": ("minimal", 68.0, [55.00, 43.65, 65.41, 49.00]),
    "V06": ("tense", 108.0, [49.00, 46.25, 55.00, 43.65]),
    "V07": ("data", 100.0, [55.00, 49.00, 43.65, 65.41]),
    "V08": ("social", 112.0, [55.00, 43.65, 65.41, 49.00]),
    "V09": ("manifesto", 88.0, [43.65, 49.00, 55.00, 65.41]),
    "V10": ("ambient", 72.0, [55.00, 43.65, 65.41, 49.00]),
}


def adsr(n, attack=0.01, decay=0.1, sustain=0.7, release=0.2):
    attack_n = max(1, int(attack * SR))
    decay_n = max(1, int(decay * SR))
    release_n = max(1, int(release * SR))
    sustain_n = max(0, n - attack_n - decay_n - release_n)
    env = np.concatenate([
        np.linspace(0, 1, attack_n, endpoint=False),
        np.linspace(1, sustain, decay_n, endpoint=False),
        np.full(sustain_n, sustain),
        np.linspace(sustain, 0, release_n, endpoint=False),
    ])
    if len(env) < n:
        env = np.pad(env, (0, n - len(env)))
    return env[:n]


def sine(freq, n):
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * freq * t)


def saw(freq, n):
    t = np.arange(n) / SR
    return 2 * ((t * freq) % 1.0) - 1.0


def lowpass(x, cutoff):
    alpha = 1 - np.exp(-2 * np.pi * min(cutoff, SR / 2 - 100) / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, value in enumerate(x):
        acc += alpha * (value - acc)
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def soft_clip(x, drive=1.0):
    return np.tanh(x * drive) / np.tanh(drive)


def place(buffer, start_s, sample, pan=0.0, gain=1.0):
    start = int(start_s * SR)
    end = min(len(buffer), start + len(sample))
    if start >= len(buffer) or end <= start:
        return
    chunk = sample[: end - start] * gain
    left = np.sqrt((1 - pan) / 2)
    right = np.sqrt((1 + pan) / 2)
    buffer[start:end, 0] += chunk * left
    buffer[start:end, 1] += chunk * right


def kick(duration=0.38, freq=52):
    n = int(duration * SR)
    t = np.arange(n) / SR
    f = freq + 95 * np.exp(-t * 32)
    phase = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(phase) * np.exp(-t * 8.5)
    click = rng.normal(0, 0.3, n) * np.exp(-t * 110)
    return soft_clip(body * 1.25 + click, 1.3)


def hat(duration=0.06, open_hat=False):
    n = int(duration * SR)
    t = np.arange(n) / SR
    noise = highpass(rng.normal(0, 1, n), 7200)
    return noise * np.exp(-t * (16 if open_hat else 60)) * 0.28


def clap(duration=0.25):
    n = int(duration * SR)
    t = np.arange(n) / SR
    noise = highpass(rng.normal(0, 1, n), 900)
    return noise * np.exp(-t * 30) * 0.35


def pluck(freq, duration=0.22):
    n = int(duration * SR)
    t = np.arange(n) / SR
    env = np.exp(-t * 18) * (1 - np.exp(-t * 500))
    tone = saw(freq, n) * 0.3 + sine(freq, n) * 0.7
    return lowpass(tone, 4800) * env * 0.28


def pad_chord(notes, duration, cutoff=1200, gain=1.0):
    n = int(duration * SR)
    out = np.zeros(n)
    for index, freq in enumerate(notes):
        detune = 1.0 + (index - 1) * 0.0022
        out += saw(freq * detune, n) * 0.22
        out += sine(freq * 0.5, n) * 0.10
    env = adsr(n, attack=0.5, decay=0.5, sustain=0.7, release=0.8)
    return lowpass(out, cutoff) * env * gain


def impact(duration=1.2, freq=46):
    n = int(duration * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * freq * t) * np.exp(-t * 3.2)
    low = np.sin(2 * np.pi * freq * 0.5 * t) * np.exp(-t * 2.2) * 0.5
    noise = lowpass(rng.normal(0, 1, n), 2800) * np.exp(-t * 7) * 0.3
    return soft_clip((body + low + noise) * 1.5, 1.4)


def write_wav(path, stereo):
    stereo = np.asarray(stereo, dtype=np.float64)
    peak = float(np.max(np.abs(stereo))) or 1.0
    if peak > 0.95:
        stereo = stereo * (0.95 / peak)
    pcm = (np.clip(stereo, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, "wb") as handle:
        handle.setnchannels(2)
        handle.setsampwidth(2)
        handle.setframerate(SR)
        handle.writeframes(pcm.tobytes())


def build(vid, mood, bpm, roots):
    total = np.zeros((int(DURATION * SR), 2), dtype=np.float64)
    beat = 60.0 / bpm
    bar = beat * 4
    sparse = mood in ("cinematic", "minimal", "ambient", "manifesto")

    for bar_index in range(int(np.ceil(DURATION / bar))):
        start = bar_index * bar
        root = roots[bar_index % len(roots)]
        if mood in ("cinematic", "minimal", "ambient", "manifesto", "tense"):
            chord = [root * 4, root * 4 * 1.2, root * 4 * 1.5]
            place(total, start, pad_chord(chord, bar + 0.5, cutoff=1000 if sparse else 1400, gain=0.55), 0.0, 0.9)
        if mood not in ("ambient", "minimal"):
            for eighth in range(8):
                at = start + eighth * beat / 2
                if at >= DURATION:
                    break
                bass = sine(root * (2 if eighth % 2 == 0 else 1), int(beat * 0.42 * SR)) * adsr(
                    int(beat * 0.42 * SR), attack=0.005, decay=0.08, sustain=0.35, release=0.18
                )
                place(total, at, bass, 0.0, 0.45 if sparse else 0.55)

    for beat_index in range(int(np.ceil(DURATION / beat))):
        start = beat_index * beat
        if start >= DURATION:
            break
        if mood in ("fast", "mechanical", "social", "data", "tense"):
            place(total, start, kick(freq=50 if mood != "fast" else 56), 0.0, 0.72)
        elif mood == "cinematic":
            if beat_index % 4 == 0:
                place(total, start, kick(freq=42), 0.0, 0.45)
        elif mood == "manifesto":
            if beat_index % 8 == 0:
                place(total, start, impact(duration=0.9, freq=40), 0.0, 0.4)
        if mood in ("fast", "social", "data", "mechanical"):
            for sixteenth in range(4):
                offset = start + sixteenth * beat / 4
                if offset >= DURATION:
                    break
                place(total, offset, hat(open_hat=(sixteenth == 2)), -0.12, 0.34 if sixteenth % 2 == 0 else 0.20)
        if mood == "social" and beat_index % 4 in (1, 3):
            place(total, start, clap(), 0.08, 0.28)

    arp_notes = [440.00, 523.25, 659.25, 783.99]
    if mood in ("fast", "data", "social", "mechanical"):
        for step in range(int(np.ceil(DURATION / (beat / 4)))):
            start = step * beat / 4
            if start >= DURATION:
                break
            if step % 8 in (0, 2, 3, 6, 7):
                place(total, start, pluck(arp_notes[step % 4]), 0.24 if step % 2 else -0.24, 0.18)
    elif mood in ("cinematic", "minimal", "ambient"):
        for step in range(int(np.ceil(DURATION / (beat * 2)))):
            start = step * beat * 2
            if start >= DURATION:
                break
            place(total, start, pluck(arp_notes[(step * 2) % 4], duration=0.7), 0.2 if step % 2 else -0.2, 0.12)

    for at, gain in ((0.0, 0.45), (DURATION * 0.55, 0.35), (DURATION - 2.0, 0.35)):
        if at < DURATION:
            place(total, at, impact(duration=1.1, freq=44), 0.0, gain)

    texture = lowpass(rng.normal(0, 1, len(total)), 1500) * (0.004 if sparse else 0.007)
    total[:, 0] += texture
    total[:, 1] += np.roll(texture, 71)

    fade_in = int(0.5 * SR)
    fade_out = int(1.4 * SR)
    total[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
    total[-fade_out:] *= np.linspace(1, 0, fade_out)[:, None]
    total = soft_clip(total, 1.04)
    peak = float(np.max(np.abs(total))) or 1.0
    total *= 0.60 / peak
    outdir = os.path.join(ROOT, vid.lower())
    os.makedirs(outdir, exist_ok=True)
    path = os.path.join(outdir, "music.wav")
    write_wav(path, total)
    return {"variant": vid, "mood": mood, "bpm": bpm, "file": path, "duration": DURATION}


if __name__ == "__main__":
    report = [build(vid, *spec) for vid, spec in MOODS.items()]
    with open(os.path.join(ROOT, "music-report.json"), "w", encoding="utf-8") as handle:
        json.dump(report, handle, ensure_ascii=False, indent=2)
    print(json.dumps(report, ensure_ascii=False, indent=2))

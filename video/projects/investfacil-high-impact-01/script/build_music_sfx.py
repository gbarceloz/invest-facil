"""Original, license-safe music bed and SFX for Invest Fácil High Impact 01.

All sounds are synthesized from scratch with numpy. No samples, no external
music, no copyright dependencies.
"""

import json
import os
import wave

import numpy as np

SR = 48_000
DURATION = 40.0
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_DIR = os.path.join(ROOT, "audio", "music")
SFX_DIR = os.path.join(ROOT, "audio", "sfx")
os.makedirs(MUSIC_DIR, exist_ok=True)
os.makedirs(SFX_DIR, exist_ok=True)
rng = np.random.default_rng(20261121)


def t_axis(duration):
    return np.arange(int(duration * SR), dtype=np.float64) / SR


def adsr(n, attack=0.01, decay=0.1, sustain=0.7, release=0.2):
    attack_n = max(1, int(attack * SR))
    decay_n = max(1, int(decay * SR))
    release_n = max(1, int(release * SR))
    sustain_n = max(0, n - attack_n - decay_n - release_n)
    env = np.concatenate(
        [
            np.linspace(0, 1, attack_n, endpoint=False),
            np.linspace(1, sustain, decay_n, endpoint=False),
            np.full(sustain_n, sustain),
            np.linspace(sustain, 0, release_n, endpoint=False),
        ]
    )
    if len(env) < n:
        env = np.pad(env, (0, n - len(env)))
    return env[:n]


def sine(freq, n, phase=0.0):
    t = np.arange(n, dtype=np.float64) / SR
    return np.sin(2 * np.pi * freq * t + phase)


def saw(freq, n):
    t = np.arange(n, dtype=np.float64) / SR
    return 2 * ((t * freq) % 1.0) - 1.0


def lowpass(x, cutoff):
    cutoff = np.clip(cutoff, 20, SR / 2 - 100)
    alpha = 1 - np.exp(-2 * np.pi * cutoff / SR)
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


def kick(duration=0.42):
    n = int(duration * SR)
    t = np.arange(n) / SR
    freq = 55 + 80 * np.exp(-t * 28)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    body = np.sin(phase) * np.exp(-t * 7.5)
    click = rng.normal(0, 0.35, n) * np.exp(-t * 90)
    return soft_clip(body * 1.25 + click, 1.3)


def clap(duration=0.28):
    n = int(duration * SR)
    t = np.arange(n) / SR
    noise = rng.normal(0, 1, n)
    noise = highpass(noise, 900)
    noise = lowpass(noise, 5200)
    env = np.exp(-t * 28) * (1 - np.exp(-t * 400))
    return noise * env * 0.7


def hat(duration=0.07, open_hat=False):
    n = int(duration * SR)
    t = np.arange(n) / SR
    noise = highpass(rng.normal(0, 1, n), 6500)
    env = np.exp(-t * (18 if open_hat else 55))
    return noise * env * 0.35


def pluck(freq, duration=0.32, bright=0.6):
    n = int(duration * SR)
    t = np.arange(n) / SR
    env = np.exp(-t * 10) * (1 - np.exp(-t * 300))
    tone = saw(freq, n) * bright + sine(freq, n) * (1 - bright)
    return lowpass(tone, 4200) * env * 0.45


def pad_chord(notes, duration, cutoff=1100, gain=1.0):
    n = int(duration * SR)
    out = np.zeros(n)
    for index, freq in enumerate(notes):
        detune = 1.0 + (index - 1) * 0.0025
        out += saw(freq * detune, n) * 0.22
        out += sine(freq * 0.5, n) * 0.12
    env = adsr(n, attack=0.35, decay=0.4, sustain=0.72, release=0.5)
    return lowpass(out, cutoff) * env * gain


def impact(duration=1.2, freq=48, noise_amount=0.4):
    n = int(duration * SR)
    t = np.arange(n) / SR
    phase = 2 * np.pi * freq * t
    body = np.sin(phase) * np.exp(-t * 3.2)
    sub = np.sin(phase * 0.5) * np.exp(-t * 2.2) * 0.5
    noise = lowpass(rng.normal(0, 1, n), 3000) * np.exp(-t * 7) * noise_amount
    return soft_clip((body + sub + noise) * 1.5, 1.4)


def whoosh(duration=0.75):
    n = int(duration * SR)
    t = np.arange(n) / SR
    noise = rng.normal(0, 1, n)
    cutoff = 250 + 5200 * np.sin(np.pi * t / duration) ** 2
    # Slow time-varying filter approximated in blocks.
    out = np.zeros(n)
    block = 256
    acc = 0.0
    for start in range(0, n, block):
        c = cutoff[min(start, n - 1)]
        alpha = 1 - np.exp(-2 * np.pi * c / SR)
        for i in range(start, min(start + block, n)):
            acc += alpha * (noise[i] - acc)
            out[i] = acc
    env = np.sin(np.pi * t / duration) ** 2
    return out * env * 0.55


def riser(duration=2.2):
    n = int(duration * SR)
    t = np.arange(n) / SR
    sweep = 180 + 2400 * (t / duration) ** 2
    phase = 2 * np.pi * np.cumsum(sweep) / SR
    tone = np.sin(phase) * 0.25 + saw(220 + 800 * t / duration, n) * 0.12
    noise = highpass(rng.normal(0, 1, n), 1200) * 0.18
    env = (t / duration) ** 2.2
    return lowpass(tone + noise, 6000) * env


def glitch(duration=0.28):
    n = int(duration * SR)
    noise = rng.normal(0, 1, n)
    hold = 6
    held = np.repeat(noise[::hold], hold)[:n]
    gate = (rng.random(n) > 0.35).astype(float)
    return (held * gate) * 0.45


def ui_pop(duration=0.18):
    n = int(duration * SR)
    t = np.arange(n) / SR
    freq = 900 - 2200 * t / duration
    phase = 2 * np.pi * np.cumsum(freq) / SR
    env = np.exp(-t * 18)
    return np.sin(phase) * env * 0.5


def reverse_impact(duration=1.4):
    forward = impact(duration=duration, freq=55, noise_amount=0.3)
    return forward[::-1] * 0.8


def write_wav(path, stereo):
    stereo = np.asarray(stereo, dtype=np.float64)
    peak = float(np.max(np.abs(stereo))) or 1.0
    if peak > 0.95:
        stereo = stereo * (0.95 / peak)
    pcm = np.clip(stereo, -1, 1)
    pcm = (pcm * 32767).astype(np.int16)
    with wave.open(path, "wb") as handle:
        handle.setnchannels(2)
        handle.setsampwidth(2)
        handle.setframerate(SR)
        handle.writeframes(pcm.tobytes())


def build_music():
    total = np.zeros((int(DURATION * SR), 2), dtype=np.float64)
    bpm = 100.0
    beat = 60.0 / bpm
    bar = beat * 4
    chords = [
        (55.00, [220.00, 261.63, 329.63]),  # Am
        (43.65, [174.61, 220.00, 261.63]),  # F
        (65.41, [261.63, 329.63, 392.00]),  # C
        (49.00, [196.00, 246.94, 293.66]),  # G
    ]

    # Pads and bass.
    for bar_index in range(int(np.ceil(DURATION / bar))):
        start = bar_index * bar
        root, notes = chords[bar_index % len(chords)]
        pad = pad_chord(notes, bar + 0.4, cutoff=1300, gain=0.55)
        place(total, start, pad, pan=0.0, gain=0.9)
        for eighth in range(8):
            if start + eighth * beat / 2 >= DURATION:
                break
            note = root * (2 if eighth % 2 else 1)
            bass = sine(note, int(beat * 0.55 * SR)) * adsr(
                int(beat * 0.55 * SR), attack=0.005, decay=0.08, sustain=0.35, release=0.12
            )
            place(total, start + eighth * beat / 2, bass, pan=0.0, gain=0.6)

    # Drums.
    for beat_index in range(int(np.ceil(DURATION / beat))):
        start = beat_index * beat
        if start >= DURATION:
            break
        place(total, start, kick(), pan=0.0, gain=0.9)
        if beat_index % 4 in (1, 3):
            place(total, start, clap(), pan=0.08, gain=0.55)
        for sixteenth in range(4):
            offset = start + sixteenth * beat / 4
            if offset >= DURATION:
                break
            gain = 0.42 if sixteenth % 2 == 0 else 0.26
            place(total, offset, hat(open_hat=(sixteenth == 2)), pan=-0.18, gain=gain)

    # Arpeggio.
    arp_notes = [440.00, 523.25, 659.25, 783.99]
    for step in range(int(np.ceil(DURATION / (beat / 4)))):
        start = step * beat / 4
        if start >= DURATION:
            break
        note = arp_notes[step % len(arp_notes)]
        if (step // 4) % 2 == 1:
            note *= 0.5
        place(total, start, pluck(note, duration=0.26), pan=0.28 if step % 2 else -0.28, gain=0.42)

    # Section impacts and risers.
    for at in (0.0, 9.0, 20.5, 27.1, 35.0):
        place(total, at, impact(duration=1.4, freq=46, noise_amount=0.35), pan=0.0, gain=0.8)
    for at in (8.2, 19.9, 30.2):
        place(total, at, riser(duration=2.2), pan=0.0, gain=0.35)

    # Subtle noise texture.
    texture = lowpass(rng.normal(0, 1, len(total)), 1800) * 0.012
    total[:, 0] += texture
    total[:, 1] += np.roll(texture, 97)

    # Global fades.
    fade_in = int(0.6 * SR)
    fade_out = int(2.5 * SR)
    total[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
    total[-fade_out:] *= np.linspace(1, 0, fade_out)[:, None]

    # Gentle bus compression / soft clip.
    total = soft_clip(total, 1.05)
    peak = float(np.max(np.abs(total))) or 1.0
    total *= 0.72 / peak
    write_wav(os.path.join(MUSIC_DIR, "music-bed-40s.wav"), total)
    return {
        "file": os.path.join(MUSIC_DIR, "music-bed-40s.wav"),
        "duration": DURATION,
        "bpm": bpm,
        "sample_rate": SR,
        "channels": 2,
        "peak_dbfs": round(20 * np.log10(float(np.max(np.abs(total)))), 2),
    }


def build_sfx():
    sounds = {
        "impact.wav": impact(duration=1.2, freq=48, noise_amount=0.4),
        "whoosh.wav": whoosh(duration=0.8),
        "click.wav": ui_pop(duration=0.08),
        "riser.wav": riser(duration=2.0),
        "bass-hit.wav": impact(duration=1.5, freq=38, noise_amount=0.2),
        "glitch.wav": glitch(),
        "ui-pop.wav": ui_pop(),
        "reverse-impact.wav": reverse_impact(),
        "sweep.wav": whoosh(duration=1.2),
        "tick.wav": hat(duration=0.035) * 0.8,
    }
    rows = []
    for name, mono in sounds.items():
        stereo = np.stack([mono, np.roll(mono, 41)], axis=1)
        path = os.path.join(SFX_DIR, name)
        write_wav(path, stereo)
        rows.append({"file": path, "duration": round(len(mono) / SR, 3), "size": os.path.getsize(path)})
    return rows


if __name__ == "__main__":
    report = {"music": build_music(), "sfx": build_sfx()}
    with open(os.path.join(ROOT, "audio", "audio-build-report.json"), "w", encoding="utf-8") as handle:
        json.dump(report, handle, ensure_ascii=False, indent=2)
    print(json.dumps(report, ensure_ascii=False, indent=2))

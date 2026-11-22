"""Original, license-safe music bed and SFX for V01.

Synthesized from scratch with numpy. No samples, no external music.
"""

import json
import os
import wave

import numpy as np

SR = 48_000
DURATION = 35.0
ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "public", "projects", "investfacil-10-creative-variants", "v01")
os.makedirs(ROOT, exist_ok=True)
os.makedirs(os.path.join(ROOT, "sfx"), exist_ok=True)
rng = np.random.default_rng(20261122)


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


def kick(duration=0.38):
    n = int(duration * SR)
    t = np.arange(n) / SR
    freq = 52 + 95 * np.exp(-t * 32)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    body = np.sin(phase) * np.exp(-t * 8.5)
    click = rng.normal(0, 0.3, n) * np.exp(-t * 110)
    return soft_clip(body * 1.25 + click, 1.3)


def hat(duration=0.06, open_hat=False):
    n = int(duration * SR)
    t = np.arange(n) / SR
    noise = highpass(rng.normal(0, 1, n), 7200)
    env = np.exp(-t * (16 if open_hat else 60))
    return noise * env * 0.30


def click_tick(duration=0.045, freq=2400):
    n = int(duration * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * freq * t) * np.exp(-t * 130) * 0.32


def pluck(freq, duration=0.18):
    n = int(duration * SR)
    t = np.arange(n) / SR
    env = np.exp(-t * 22) * (1 - np.exp(-t * 500))
    tone = saw(freq, n) * 0.35 + sine(freq, n) * 0.65
    return lowpass(tone, 5200) * env * 0.30


def sub(freq, duration):
    n = int(duration * SR)
    t = np.arange(n) / SR
    env = adsr(n, attack=0.01, decay=0.12, sustain=0.42, release=0.2)
    return sine(freq, n) * env * 0.42


def impact(duration=1.1, freq=46, noise_amount=0.35):
    n = int(duration * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * freq * t) * np.exp(-t * 3.4)
    low = np.sin(2 * np.pi * freq * 0.5 * t) * np.exp(-t * 2.2) * 0.5
    noise = lowpass(rng.normal(0, 1, n), 2800) * np.exp(-t * 7) * noise_amount
    return soft_clip((body + low + noise) * 1.5, 1.4)


def riser(duration=1.8):
    n = int(duration * SR)
    t = np.arange(n) / SR
    sweep = 170 + 2500 * (t / duration) ** 2
    phase = 2 * np.pi * np.cumsum(sweep) / SR
    tone = np.sin(phase) * 0.20 + saw(180 + 900 * t / duration, n) * 0.10
    noise = highpass(rng.normal(0, 1, n), 1500) * 0.14
    env = (t / duration) ** 2.4
    return lowpass(tone + noise, 6500) * env


def sub_drop(duration=1.2):
    n = int(duration * SR)
    t = np.arange(n) / SR
    freq = 95 * np.exp(-t * 2.4) + 28
    phase = 2 * np.pi * np.cumsum(freq) / SR
    env = np.exp(-t * 2.2) * (1 - np.exp(-t * 60))
    return np.sin(phase) * env * 0.8


def stamp(duration=0.5):
    n = int(duration * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * 90 * t) * np.exp(-t * 22)
    noise = lowpass(rng.normal(0, 1, n), 2200) * np.exp(-t * 35) * 0.35
    return soft_clip((body + noise) * 1.4, 1.2)


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
    bpm = 110.0
    beat = 60.0 / bpm
    bar = beat * 4
    roots = [55.00, 43.65, 65.41, 49.00]

    for bar_index in range(int(np.ceil(DURATION / bar))):
        start = bar_index * bar
        root = roots[bar_index % len(roots)]
        # Low drone, barely audible, for warmth.
        drone = sine(root, int(bar * SR)) * 0.045
        drone += sine(root * 2, int(bar * SR)) * 0.025
        place(total, start, drone, 0.0, 1.0)

        for eighth in range(8):
            at = start + eighth * beat / 2
            if at >= DURATION:
                break
            bass = sub(root * (2 if eighth % 2 == 0 else 1), beat * 0.42)
            place(total, at, bass, 0.0, 0.55)

    for beat_index in range(int(np.ceil(DURATION / beat))):
        start = beat_index * beat
        if start >= DURATION:
            break
        place(total, start, kick(), 0.0, 0.78)
        for sixteenth in range(4):
            offset = start + sixteenth * beat / 4
            if offset >= DURATION:
                break
            place(total, offset, hat(open_hat=(sixteenth == 2)), -0.12, 0.42 if sixteenth % 2 == 0 else 0.25)

    # Ticker arpeggio: high, dry, syncopated.
    arp = [880.00, 1046.50, 1318.51, 1567.98]
    for step in range(int(np.ceil(DURATION / (beat / 4)))):
        start = step * beat / 4
        if start >= DURATION:
            break
        if step % 8 in (0, 2, 3, 6, 7):
            note = arp[step % len(arp)]
            place(total, start, pluck(note), 0.22 if step % 2 else -0.22, 0.22)

    # Section accents.
    for at, gain in ((0.0, 0.55), (12.33, 0.5), (18.07, 0.45), (30.03, 0.55)):
        place(total, at, impact(duration=1.2, freq=46), 0.0, gain)
    for at in (11.0, 17.0, 28.8):
        place(total, at, riser(duration=1.8), 0.0, 0.20)

    texture = lowpass(rng.normal(0, 1, len(total)), 1400) * 0.006
    total[:, 0] += texture
    total[:, 1] += np.roll(texture, 83)

    fade_in = int(0.35 * SR)
    fade_out = int(1.2 * SR)
    total[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
    total[-fade_out:] *= np.linspace(1, 0, fade_out)[:, None]

    total = soft_clip(total, 1.05)
    peak = float(np.max(np.abs(total))) or 1.0
    total *= 0.62 / peak
    path = os.path.join(ROOT, "music.wav")
    write_wav(path, total)
    return {
        "file": path,
        "duration": DURATION,
        "bpm": bpm,
        "sample_rate": SR,
        "channels": 2,
        "peak_dbfs": round(20 * np.log10(float(np.max(np.abs(total)))), 2),
    }


def build_sfx():
    sounds = {
        "sub-drop.wav": sub_drop(),
        "stamp.wav": stamp(),
        "riser-short.wav": riser(duration=1.0),
        "impact-short.wav": impact(duration=0.8, freq=52),
    }
    rows = []
    for name, mono in sounds.items():
        stereo = np.stack([mono, np.roll(mono, 31)], axis=1)
        path = os.path.join(ROOT, "sfx", name)
        write_wav(path, stereo)
        rows.append({"file": path, "duration": round(len(mono) / SR, 3), "size": os.path.getsize(path)})
    return rows


if __name__ == "__main__":
    report = {"music": build_music(), "sfx": build_sfx()}
    with open(os.path.join(ROOT, "audio-build-report.json"), "w", encoding="utf-8") as handle:
        json.dump(report, handle, ensure_ascii=False, indent=2)
    print(json.dumps(report, ensure_ascii=False, indent=2))

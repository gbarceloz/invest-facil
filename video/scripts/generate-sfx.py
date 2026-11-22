import os
import wave

import numpy as np

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "audio")
RATE = 48000


def write(name, data):
    data = np.clip(data, -1.0, 1.0)
    pcm = (data * 32767).astype(np.int16)
    path = os.path.join(OUT, name)
    with wave.open(path, "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(RATE)
        handle.writeframes(pcm.tobytes())
    print(path, len(pcm) / RATE)


def envelope(length, attack=0.01, release=0.2):
    attack_n = max(1, int(attack * RATE))
    release_n = max(1, int(release * RATE))
    env = np.ones(length)
    env[:attack_n] = np.linspace(0, 1, attack_n)
    env[-release_n:] *= np.linspace(1, 0, release_n)
    return env


def whoosh(duration=0.7):
    n = int(duration * RATE)
    rng = np.random.default_rng(7)
    noise = rng.normal(0, 0.35, n)
    # simple low-pass to make it airy
    filtered = np.convolve(noise, np.ones(24) / 24, mode="same")
    t = np.linspace(0, 1, n)
    env = np.sin(np.pi * t) ** 2
    return filtered * env * 0.9


def click(duration=0.05, freq=1900):
    n = int(duration * RATE)
    t = np.arange(n) / RATE
    return np.sin(2 * np.pi * freq * t) * np.exp(-t * 90) * 0.5


def tick(duration=0.04, freq=2600):
    n = int(duration * RATE)
    t = np.arange(n) / RATE
    return np.sin(2 * np.pi * freq * t) * np.exp(-t * 130) * 0.35


def boom(duration=0.9):
    n = int(duration * RATE)
    t = np.arange(n) / RATE
    low = np.sin(2 * np.pi * 52 * t) * np.exp(-t * 5)
    thump = np.sin(2 * np.pi * 110 * t) * np.exp(-t * 18)
    return (low * 0.9 + thump * 0.25)


def riser(duration=1.4):
    n = int(duration * RATE)
    t = np.arange(n) / RATE
    freq = np.linspace(160, 900, n)
    phase = 2 * np.pi * np.cumsum(freq) / RATE
    tone = np.sin(phase) * 0.18
    rng = np.random.default_rng(11)
    noise = np.convolve(rng.normal(0, 0.2, n), np.ones(12) / 12, mode="same")
    env = np.linspace(0, 1, n) ** 1.7
    return (tone + noise) * env


write("sfx-whoosh.wav", whoosh())
write("sfx-click.wav", click())
write("sfx-tick.wav", tick())
write("sfx-boom.wav", boom())
write("sfx-riser.wav", riser())

#!/usr/bin/env python3
"""Generate an original 56-second cinematic electronic score with embedded transition SFX."""

import math
import random
import struct
import wave
from pathlib import Path

SR = 44100
DURATION = 56.0
TAU = math.tau
BPM = 116.0
BEAT = 60.0 / BPM
CUTS = [4.2, 9.8, 15.7, 21.8, 28.4, 34.9, 39.0, 42.0, 48.0]
ROOTS = [38, 34, 41, 36]  # D, Bb, F, C — dark, optimistic progression.
OUT = Path(__file__).with_name("soundtrack-v2.wav")
random.seed(260813)


def hz(midi: float) -> float:
    return 440.0 * (2.0 ** ((midi - 69.0) / 12.0))


def clamp(value: float) -> float:
    return max(-0.98, min(0.98, value))


with wave.open(str(OUT), "wb") as wav:
    wav.setnchannels(2)
    wav.setsampwidth(2)
    wav.setframerate(SR)

    block = bytearray()
    prev_noise = 0.0
    total = int(DURATION * SR)

    for i in range(total):
        t = i / SR
        beat_pos = (t % BEAT) / BEAT
        beat_index = int(t / BEAT)
        eighth_pos = (t % (BEAT / 2.0)) / (BEAT / 2.0)
        eighth_index = int(t / (BEAT / 2.0))
        bar_index = beat_index // 4
        root = ROOTS[bar_index % len(ROOTS)]

        # Section arc: establish, accelerate, breathe, then resolve.
        if t < 4.2:
            energy = 0.42
            drums = 0.0
        elif t < 15.7:
            energy = 0.62
            drums = 0.62
        elif t < 34.9:
            energy = 0.84
            drums = 0.94
        elif t < 42.0:
            energy = 0.66
            drums = 0.70
        elif t < 48.0:
            energy = 0.50 + 0.20 * ((t - 42.0) / 6.0)
            drums = 0.42
        else:
            energy = 0.92
            drums = 0.88

        # Wide glassy pad. Slightly different chord voicings on each channel.
        chord = (root, root + 3, root + 7, root + 14)
        slow = 0.76 + 0.24 * math.sin(TAU * 0.075 * t)
        pad_l = sum(math.sin(TAU * hz(n - 12) * t + j * 0.41) for j, n in enumerate(chord))
        pad_r = sum(math.sin(TAU * hz(n - 12) * 1.0018 * t + j * 0.63) for j, n in enumerate(chord))
        pad_l *= 0.027 * energy * slow
        pad_r *= 0.027 * energy * slow

        # Eighth-note crystalline arpeggio, with silence between short notes.
        arp_notes = (root + 12, root + 19, root + 15, root + 22, root + 12, root + 24, root + 19, root + 27)
        arp_midi = arp_notes[eighth_index % len(arp_notes)]
        arp_env = math.exp(-7.5 * eighth_pos)
        arp_gate = 1.0 if eighth_pos < 0.72 else 0.0
        arp = math.sin(TAU * hz(arp_midi) * t) + 0.34 * math.sin(TAU * hz(arp_midi + 12) * t)
        arp *= 0.050 * energy * arp_env * arp_gate * (0.35 if t < 4.2 else 1.0)

        # Sub pulse and pitch-dropping cinematic kick.
        sub_env = math.exp(-5.2 * beat_pos)
        sub = math.sin(TAU * hz(root - 24) * t) * 0.082 * energy * sub_env
        kick = 0.0
        if beat_pos < 0.43 and t >= 4.2:
            kick_t = beat_pos * BEAT
            kick_freq = 48.0 + 62.0 * math.exp(-20.0 * kick_t)
            kick = math.sin(TAU * kick_freq * kick_t) * math.exp(-14.0 * kick_t) * 0.24 * drums

        # Fine metallic hats on the off-beats.
        noise = random.uniform(-1.0, 1.0)
        high_noise = noise - prev_noise
        prev_noise = noise
        hat = 0.0
        if eighth_index % 2 == 1 and t >= 4.2:
            hat = high_noise * math.exp(-24.0 * eighth_pos) * 0.032 * drums

        # Snare texture on beats two and four.
        snare = 0.0
        if beat_index % 4 in (1, 3) and beat_pos < 0.30 and t >= 9.8:
            snare = high_noise * math.exp(-22.0 * beat_pos) * 0.075 * drums

        # Sweeps into scene changes and deep impacts directly on the cut.
        sweep_l = sweep_r = impact = 0.0
        for cut in CUTS:
            before = cut - t
            if 0.0 < before < 0.42:
                rise = (1.0 - before / 0.42) ** 2
                sweep_l += high_noise * rise * 0.075
                sweep_r -= high_noise * rise * 0.062
            after = t - cut
            if 0.0 <= after < 0.72:
                impact += (
                    math.sin(TAU * (42.0 - 8.0 * after) * after) * math.exp(-5.2 * after) * 0.20
                    + high_noise * math.exp(-20.0 * after) * 0.10
                )

        # Opening hit and subtle final shimmer.
        opening = 0.0
        if t < 1.1:
            opening = math.sin(TAU * (34.0 - 5.0 * t) * t) * math.exp(-3.1 * t) * 0.21
        shimmer = 0.0
        if t >= 48.0:
            shimmer = math.sin(TAU * hz(root + 31) * t) * 0.020 * (1.0 - (t - 48.0) / 12.0)

        # Leave clear centre space for the voiceover; music blooms at the ending.
        mix_gain = 0.72 if t < 1.4 or t >= 48.0 else 0.50
        left = (pad_l + arp * 0.86 + sub + kick + hat + snare + sweep_l + impact + opening + shimmer) * mix_gain
        right = (pad_r + arp * 1.06 + sub + kick + hat * 0.78 + snare + sweep_r + impact + opening - shimmer) * mix_gain

        block.extend(struct.pack("<hh", int(clamp(left) * 32767), int(clamp(right) * 32767)))
        if len(block) >= 65536:
            wav.writeframesraw(block)
            block.clear()

    if block:
        wav.writeframesraw(block)

print(f"Wrote {OUT} ({DURATION:.1f}s, {SR} Hz stereo)")

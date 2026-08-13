import math
import struct
import wave

RATE = 44_100
DURATION = 60.0
FRAMES = int(RATE * DURATION)
CHORD_SECONDS = 7.5

# Warm C-major-inspired ambient progression.
chords = [
    [130.81, 164.81, 196.00, 246.94],  # Cmaj7
    [110.00, 130.81, 164.81, 196.00],  # Am7
    [87.31, 130.81, 164.81, 196.00],   # Fmaj7
    [98.00, 146.83, 196.00, 261.63],   # Gsus
    [130.81, 164.81, 196.00, 246.94],
    [110.00, 130.81, 164.81, 196.00],
    [87.31, 130.81, 164.81, 196.00],
    [98.00, 146.83, 196.00, 261.63],
]


def chord_value(notes, t, phase_shift):
    value = 0.0
    for i, frequency in enumerate(notes):
        phase = phase_shift + i * 0.63
        fundamental = math.sin(2 * math.pi * frequency * t + phase)
        harmonic = 0.22 * math.sin(2 * math.pi * frequency * 2 * t + phase * 1.3)
        value += fundamental + harmonic
    return value / (len(notes) * 1.22)


with wave.open("deliverables/portfolio-ad/music-bed.wav", "wb") as audio:
    audio.setnchannels(2)
    audio.setsampwidth(2)
    audio.setframerate(RATE)

    chunk = bytearray()
    for n in range(FRAMES):
        t = n / RATE
        chord_index = min(int(t / CHORD_SECONDS), len(chords) - 1)
        local = t - chord_index * CHORD_SECONDS
        blend_start = CHORD_SECONDS - 1.15
        blend = 0.0 if local <= blend_start else (local - blend_start) / 1.15
        next_index = min(chord_index + 1, len(chords) - 1)

        slow_lfo = 0.72 + 0.18 * math.sin(2 * math.pi * 0.075 * t)
        fade = min(1.0, t / 2.2, (DURATION - t) / 2.5)
        fade = max(0.0, fade)

        left_now = chord_value(chords[chord_index], t, 0.0)
        left_next = chord_value(chords[next_index], t, 0.0)
        right_now = chord_value(chords[chord_index], t, 0.18)
        right_next = chord_value(chords[next_index], t, 0.18)

        left = ((1 - blend) * left_now + blend * left_next) * slow_lfo
        right = ((1 - blend) * right_now + blend * right_next) * slow_lfo

        # A very soft high shimmer adds motion without competing with narration.
        shimmer_gate = (0.5 + 0.5 * math.sin(2 * math.pi * 0.11 * t)) ** 5
        shimmer_l = math.sin(2 * math.pi * 523.25 * t) * shimmer_gate * 0.06
        shimmer_r = math.sin(2 * math.pi * 659.25 * t + 0.4) * shimmer_gate * 0.06

        amplitude = 0.12 * fade
        sample_l = int(max(-1.0, min(1.0, (left + shimmer_l) * amplitude)) * 32767)
        sample_r = int(max(-1.0, min(1.0, (right + shimmer_r) * amplitude)) * 32767)
        chunk += struct.pack("<hh", sample_l, sample_r)

        if len(chunk) >= 65_536:
            audio.writeframesraw(chunk)
            chunk.clear()

    if chunk:
        audio.writeframesraw(chunk)

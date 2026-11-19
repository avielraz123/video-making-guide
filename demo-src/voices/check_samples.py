"""Sanity-check every MP3 in media/audio: duration, loudness, format.

Flags clips that are suspiciously short/long or silent (mean volume near -91 dB).
Run:  python check_samples.py
"""
import re
import subprocess

from common import AUDIO, duration

bad = 0
for mp3 in sorted(AUDIO.glob("*.mp3")):
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a:0",
         "-show_entries", "stream=channels,bit_rate", "-of", "csv=p=0", str(mp3)],
        capture_output=True, text=True).stdout.strip()
    vol = subprocess.run(
        ["ffmpeg", "-i", str(mp3), "-af", "volumedetect", "-f", "null", "-"],
        capture_output=True, text=True).stderr
    mean = float(re.search(r"mean_volume: (-?[\d.]+)", vol).group(1))
    dur = duration(mp3)
    ok = 3.5 <= dur <= 14 and mean > -40
    bad += not ok
    print(f"{'OK ' if ok else 'BAD'} {mp3.name:45s} {dur:6.2f}s  mean {mean:6.1f} dB  [{probe}]  {mp3.stat().st_size // 1024} KB")

print(f"\n{bad} problem clip(s)")

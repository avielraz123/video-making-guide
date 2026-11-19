"""Step 1: script -> speech with Kokoro (offline TTS), saved as public/narration.mp3.

Run with a Python env that has kokoro-onnx + soundfile and the two model files:
    python narration/tts.py path/to/models
"""
import subprocess
import sys
from pathlib import Path

import soundfile as sf
from kokoro_onnx import Kokoro

SCRIPT = (
    "Claude writes the code. Kokoro reads the script out loud. "
    "Whisper finds when every word is spoken. "
    "And Remotion turns it all into a video."
)

models = Path(sys.argv[1])
kokoro = Kokoro(str(models / "kokoro-v1.0.int8.onnx"), str(models / "voices-v1.0.bin"))
samples, rate = kokoro.create(SCRIPT, voice="af_heart", speed=1.0, lang="en-us")
public = Path(__file__).parent.parent / "public"
wav = public / "narration.wav"
sf.write(wav, samples, rate)
# Loudness-normalized small MP3 (mono, 96 kbps), then drop the big WAV
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
                "-ar", "24000", "-ac", "1", "-b:a", "96k",
                str(public / "narration.mp3")], check=True)
wav.unlink()
print(f"narration.mp3: {len(samples) / rate:.2f} s")

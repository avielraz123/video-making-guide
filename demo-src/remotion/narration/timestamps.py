"""Step 2: speech -> word timestamps with faster-whisper, saved as src/captions.json.

    python narration/timestamps.py
The JSON is a list of {text, startMs, endMs} (Remotion's Caption shape, minus
optional fields) that the video imports directly to time captions and visuals.
"""
import json
import subprocess
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

ROOT = Path(__file__).parent.parent
audio_file = ROOT / "public" / "narration.mp3"
# Decode to 16 kHz mono float32 with ffmpeg (Whisper's input format). Passing an
# array also sidesteps PyAV version mismatches inside faster-whisper.
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(audio_file), "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
                     capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, dtype=np.float32)

model = WhisperModel("base.en", device="cpu", compute_type="int8")  # ~140 MB, downloads once
segments, _ = model.transcribe(
    audio,
    word_timestamps=True,
    initial_prompt="Claude, Kokoro, Whisper, Remotion.",  # helps spell the names right
)
words = [
    {"text": w.word.strip(), "startMs": round(w.start * 1000), "endMs": round(w.end * 1000)}
    for seg in segments
    for w in seg.words
]
# one word per line keeps the file easy to read and diff
(ROOT / "src" / "captions.json").write_text("[\n" + ",\n".join(json.dumps(w) for w in words) + "\n]\n")
print(" ".join(w["text"] for w in words))

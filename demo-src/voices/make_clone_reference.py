"""Make the ~10 s reference clip for the voice-cloning demo.

The reference is itself synthetic (Kokoro voice bf_isabella), so no real
person's voice is ever cloned. Run with the main venv (kokoro-onnx).
Output: out/clone-reference.wav (fed to the cloner) + media/audio/clone-reference.mp3
"""
import soundfile as sf
from kokoro_onnx import Kokoro

from common import MODELS, tmp_wav, to_mp3, duration

REFERENCE_TEXT = (
    "Hi there. I am a synthetic voice, made only for this demo. "
    "Nobody real sounds exactly like me, so I am a safe voice to clone. "
    "Listen to my tone, my accent, and the way I pace each sentence."
)

kokoro = Kokoro(str(MODELS / "kokoro-v1.0.int8.onnx"), str(MODELS / "voices-v1.0.bin"))
samples, rate = kokoro.create(REFERENCE_TEXT, voice="bf_isabella", lang="en-gb")
wav = tmp_wav("clone-reference")
sf.write(wav, samples, rate)
print("clone-reference", duration(to_mp3(wav, "clone-reference")))

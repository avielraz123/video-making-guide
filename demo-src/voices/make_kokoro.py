"""Kokoro samples (local, offline, CPU is enough).

Setup:  pip install kokoro-onnx soundfile
Models: kokoro-v1.0.int8.onnx + voices-v1.0.bin from
        https://github.com/thewh1teagle/kokoro-onnx/releases  ->  models/
Run:    python make_kokoro.py
"""
import soundfile as sf
from kokoro_onnx import Kokoro

from common import MODELS, SENTENCES, tmp_wav, to_mp3, duration

# (voice id, language key, kokoro lang code)
CLIPS = [
    ("af_heart",   "en", "en-us"),
    ("af_bella",   "en", "en-us"),
    ("af_nicole",  "en", "en-us"),
    ("am_michael", "en", "en-us"),
    ("am_fenrir",  "en", "en-us"),
    ("am_puck",    "en", "en-us"),
    ("bf_emma",    "en", "en-gb"),
    ("bm_george",  "en", "en-gb"),
    ("bm_fable",   "en", "en-gb"),
    ("ef_dora",    "es", "es"),
    ("em_alex",    "es", "es"),
]

kokoro = Kokoro(str(MODELS / "kokoro-v1.0.int8.onnx"), str(MODELS / "voices-v1.0.bin"))

for voice, lang, code in CLIPS:
    clip_id = f"kokoro-{voice.replace('_', '-')}-{lang}"
    samples, rate = kokoro.create(SENTENCES[lang], voice=voice, speed=1.0, lang=code)
    wav = tmp_wav(clip_id)
    sf.write(wav, samples, rate)
    print(clip_id, duration(to_mp3(wav, clip_id)))

"""Piper samples (local, offline, very fast on CPU, one small model per voice).

Setup:  pip install piper-tts
Voices: python -m piper.download_voices --download-dir models/piper en_US-lessac-medium ...
        (catalog: https://huggingface.co/rhasspy/piper-voices)
CLI:    piper -m models/piper/en_US-lessac-medium.onnx -f out.wav -- "Hello there"
Run:    python make_piper.py
"""
import wave

from piper import PiperVoice

from common import MODELS, SENTENCES, tmp_wav, to_mp3, duration

# (piper voice name, language key)
CLIPS = [
    ("en_US-lessac-medium",   "en"),
    ("en_US-amy-medium",      "en"),
    ("en_US-ryan-medium",     "en"),
    ("es_MX-claude-high",     "es"),
    ("he_IL-saspeech-medium", "he"),   # adds niqqud automatically, then speaks
    ("fa_IR-gyro-medium",     "fa"),
]

for name, lang in CLIPS:
    voice = PiperVoice.load(str(MODELS / "piper" / f"{name}.onnx"))
    clip_id = "piper-" + name.lower().replace("_", "-")
    wav_path = tmp_wav(clip_id)
    with wave.open(str(wav_path), "wb") as wf:
        voice.synthesize_wav(SENTENCES[lang], wf)
    print(clip_id, duration(to_mp3(wav_path, clip_id)))

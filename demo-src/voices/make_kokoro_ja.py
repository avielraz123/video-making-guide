"""Kokoro Japanese sample.

Kokoro's Japanese voices were trained on misaki phonemes, so we convert the
text with misaki's Japanese G2P first and pass phonemes to Kokoro.

Setup (on top of make_kokoro.py's):
    pip install pyopenjtalk-plus misaki fugashi unidic-lite jaconv mojimoji
    (pyopenjtalk-plus has Windows wheels; plain `misaki[ja]` tries to compile pyopenjtalk)
"""
import soundfile as sf
from kokoro_onnx import Kokoro
from misaki import ja

from common import MODELS, SENTENCES, tmp_wav, to_mp3, duration

kokoro = Kokoro(str(MODELS / "kokoro-v1.0.int8.onnx"), str(MODELS / "voices-v1.0.bin"))
g2p = ja.JAG2P()
phonemes, _ = g2p(SENTENCES["ja"])

for voice in ["jf_alpha", "jm_kumo"]:
    clip_id = f"kokoro-{voice.replace('_', '-')}-ja"
    samples, rate = kokoro.create(phonemes, voice=voice, lang="ja", is_phonemes=True)
    wav = tmp_wav(clip_id)
    sf.write(wav, samples, rate)
    print(clip_id, duration(to_mp3(wav, clip_id)))

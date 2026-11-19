"""Chatterbox voice cloning (Resemble AI, MIT license, local, NVIDIA GPU recommended).

Clones the synthetic reference clip made by make_clone_reference.py and reads the
standard sentences with it. Uses its own venv because PyTorch is large:

    py -3.12 -m venv clone/.venv
    clone/.venv/Scripts/pip install chatterbox-tts
    # PyPI's torch on Windows is CPU-only; swap in the CUDA build:
    clone/.venv/Scripts/pip install --force-reinstall --no-deps torch==2.6.0 torchaudio==2.6.0 \
        --index-url https://download.pytorch.org/whl/cu124
    # its watermark lib still imports pkg_resources, removed in setuptools 81+:
    clone/.venv/Scripts/pip install "setuptools<81"
    clone/.venv/Scripts/python make_chatterbox.py

Models (a few GB) download from Hugging Face on the first run.
"""
import torch
import torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
from chatterbox.tts import ChatterboxTTS

from common import SENTENCES, tmp_wav, to_mp3, duration

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
REF = str(tmp_wav("clone-reference"))   # the ~10 s synthetic reference voice


def save(wav, sr, clip_id):
    path = tmp_wav(clip_id)
    ta.save(str(path), wav.cpu(), sr)
    print(clip_id, duration(to_mp3(path, clip_id)))


SEED = 7   # takes vary run to run; a fixed seed per clip makes them repeatable

# 1) English model: the cloned voice, plus the "exaggeration" (emotion) knob.
#    Default is 0.5; high exaggeration works best with a lower cfg_weight.
en = ChatterboxTTS.from_pretrained(device=DEVICE)
for clip_id, exaggeration, cfg in [
    ("chatterbox-clone-en",       0.5, 0.5),
    ("chatterbox-clone-en-calm",  0.25, 0.5),
    ("chatterbox-clone-en-drama", 1.0, 0.3),
]:
    torch.manual_seed(SEED)
    wav = en.generate(SENTENCES["en"], audio_prompt_path=REF,
                      exaggeration=exaggeration, cfg_weight=cfg)
    save(wav, en.sr, clip_id)
del en
torch.cuda.empty_cache()

# 2) Multilingual model (23 languages, incl. Hebrew): same cloned voice, other languages.
mtl = ChatterboxMultilingualTTS.from_pretrained(device=DEVICE)
for lang in ["he", "es"]:
    torch.manual_seed(SEED)
    wav = mtl.generate(SENTENCES[lang], language_id=lang, audio_prompt_path=REF)
    save(wav, mtl.sr, f"chatterbox-clone-{lang}")

"""edge-tts samples (Microsoft Edge "Read aloud" neural voices; needs internet, no key).

Setup:  pip install edge-tts
List:   edge-tts --list-voices
CLI:    edge-tts --voice en-US-AriaNeural --text "Hello" --write-media hello.mp3
Run:    python make_edge.py
"""
import asyncio

import edge_tts

from common import SENTENCES, tmp_wav, to_mp3, duration

# (voice, language key, extra options, clip-id suffix)
CLIPS = [
    ("en-US-AriaNeural",               "en", {}, ""),
    ("en-US-GuyNeural",                "en", {}, ""),
    ("en-US-AvaMultilingualNeural",    "en", {}, ""),
    ("en-US-AndrewMultilingualNeural", "en", {}, ""),
    ("en-GB-SoniaNeural",              "en", {}, ""),
    ("en-AU-NatashaNeural",            "en", {}, ""),
    ("he-IL-HilaNeural",               "he", {}, ""),
    ("he-IL-AvriNeural",               "he", {}, ""),
    ("es-MX-DaliaNeural",              "es", {}, ""),
    ("ja-JP-NanamiNeural",             "ja", {}, ""),
    ("ar-SA-HamedNeural",              "ar", {}, ""),
    ("fa-IR-DilaraNeural",             "fa", {}, ""),
    # Same voice, faster and slightly higher: shows the rate/pitch knobs.
    ("en-US-AriaNeural",               "en", {"rate": "+20%", "pitch": "+5Hz"}, "-fast"),
]


async def main():
    for voice, lang, opts, suffix in CLIPS:
        clip_id = f"edge-{voice[:-len('Neural')].lower()}-{lang}{suffix}"
        raw = tmp_wav(clip_id).with_suffix(".mp3")   # edge-tts streams MP3
        await edge_tts.Communicate(SENTENCES[lang], voice, **opts).save(str(raw))
        print(clip_id, duration(to_mp3(raw, clip_id)))


asyncio.run(main())

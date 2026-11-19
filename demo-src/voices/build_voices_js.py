"""Write js/data/voices.js from the metadata below + the real MP3 durations (ffprobe).

Run after the make_*.py scripts:  python build_voices_js.py
Clips whose MP3 is missing are skipped, so a failed engine never breaks the site.
"""
import json

from common import AUDIO, ROOT, SENTENCES, duration

ENGINES = [
    {
        "id": "kokoro", "name": "Kokoro", "kind": "local",
        "summary": "A tiny (82M-parameter) open model that sounds close to commercial voices and runs offline on a normal laptop CPU.",
        "quality": 4,
        "speed": "About real time on a laptop CPU (int8 model); much faster on a GPU",
        "languages": ["en", "es", "fr", "hi", "it", "ja", "pt", "zh"],
        "cloning": False,
        "cost": "Free (Apache-2.0 weights)",
        "license": "Apache-2.0 model weights, MIT kokoro-onnx wrapper: commercial use OK",
        "needs": "Python, ~120 MB of model files (int8 model + voices), no GPU",
        "howClaudeUsesIt": "Claude writes a short Python script that loads the ONNX model, calls kokoro.create(text, voice='af_heart') for each narration line, saves WAVs and reads their lengths so scenes can be timed to the audio.",
        "setup": "pip install kokoro-onnx soundfile\n# download kokoro-v1.0.int8.onnx + voices-v1.0.bin from\n# github.com/thewh1teagle/kokoro-onnx/releases\npython make_kokoro.py",
        "pros": ["Very natural for its size, best free offline English", "Runs offline, no account, no per-character cost",
                 "54 voices (US/UK English plus a few per other language)", "Permissive license, fine for videos you publish"],
        "cons": ["No Hebrew, Arabic or Farsi", "Non-English voices are thinner (Japanese needs the extra misaki[ja] phonemizer)",
                 "No voice cloning, no emotion control beyond speed"],
        "url": "https://huggingface.co/hexgrad/Kokoro-82M",
        "demoUrl": None,
    },
    {
        "id": "edge-tts", "name": "edge-tts (Microsoft neural voices)", "kind": "online-free",
        "summary": "A Python library/CLI that uses the free Read Aloud service behind Microsoft Edge: the same neural voices Azure sells, with no API key.",
        "quality": 4,
        "speed": "A second or two per sentence (network-bound)",
        "languages": ["en", "he", "ar", "fa", "es", "ja", "fr", "de", "ru", "zh", "hi", "it", "pt", "ko", "tr", "+ ~100 more locales"],
        "cloning": False,
        "cost": "Free, no account or key (unofficial use of Edge's service)",
        "license": "edge-tts library is LGPL-3.0; the voices belong to Microsoft and the service is not an official API, so it could change or be rate-limited",
        "needs": "Python and an internet connection",
        "howClaudeUsesIt": "Claude runs `edge-tts --voice he-IL-HilaNeural --text \"...\" --write-media line.mp3` (or the async Python API) per narration line, optionally with --rate/--pitch, and can also save word-timed subtitles.",
        "setup": "pip install edge-tts\nedge-tts --list-voices\nedge-tts --voice en-US-AriaNeural --text \"Hello\" --write-media hello.mp3",
        "pros": ["~320 voices in ~140 locales, including both Hebrew voices (Hila, Avri)", "Quality on par with paid cloud TTS",
                 "Rate, pitch and volume knobs; can output subtitles (SRT/VTT)", "Zero setup beyond pip"],
        "cons": ["Needs internet; text is sent to Microsoft", "Unofficial: no SLA, may break or be throttled",
                 "No cloning, no SSML styles/emotions (those need paid Azure)"],
        "url": "https://github.com/rany2/edge-tts",
        "demoUrl": None,
    },
    {
        "id": "piper", "name": "Piper", "kind": "local",
        "summary": "A fast, lightweight offline TTS with one small model per voice and the widest language list of the local options, including Hebrew and Farsi.",
        "quality": 3,
        "speed": "Many times faster than real time on CPU (runs even on a Raspberry Pi)",
        "languages": ["ar", "bg", "bn", "ca", "cs", "cy", "da", "de", "el", "en", "es", "et", "eu", "fa", "fi", "fr", "he", "hi",
                      "hu", "hy", "id", "is", "it", "ja", "ka", "kk", "ko", "ku", "lb", "lt", "lv", "ml", "mr", "ne", "nl", "no",
                      "pl", "pt", "ro", "ru", "sk", "sl", "sq", "sr", "sv", "sw", "te", "th", "tr", "uk", "ur", "vi", "zh"],
        "cloning": False,
        "cost": "Free",
        "license": "piper-tts is GPL-3.0; each voice has its own license (see its MODEL_CARD; some are non-commercial)",
        "needs": "Python, ~60 MB per voice (medium quality), no GPU",
        "howClaudeUsesIt": "Claude downloads the voice it needs with `python -m piper.download_voices`, then runs the `piper` CLI or PiperVoice.synthesize_wav() for each line. Good for long drafts where speed matters more than polish.",
        "setup": "pip install piper-tts\npython -m piper.download_voices en_US-lessac-medium\npiper -m en_US-lessac-medium.onnx -f out.wav -- \"Hello there\"",
        "pros": ["Very fast and tiny; fully offline", "~180 voices in ~58 locales, incl. Hebrew (auto-adds niqqud), Farsi, Arabic",
                 "Simple CLI, easy to script"],
        "cons": ["Noticeably more synthetic and flat than Kokoro/edge-tts", "Hebrew voice can mispronounce words when the automatic niqqud guesses wrong",
                 "Check each voice's license before commercial use"],
        "url": "https://github.com/OHF-Voice/piper1-gpl",
        "demoUrl": "https://rhasspy.github.io/piper-samples/",
    },
    {
        "id": "sapi", "name": "Windows built-in voices (SAPI)", "kind": "builtin",
        "summary": "The classic voices that ship with Windows (David, Zira, Hazel), included here as a robotic baseline to hear how far TTS has come.",
        "quality": 1,
        "speed": "Instant",
        "languages": ["en", "+ other languages via Windows language packs"],
        "cloning": False,
        "cost": "Free (part of Windows)",
        "license": "Part of Windows",
        "needs": "Windows only; nothing to install",
        "howClaudeUsesIt": "Claude can call PowerShell's System.Speech SpeechSynthesizer to write a WAV. Useful only for quick timing placeholders, not for a final video.",
        "setup": "Add-Type -AssemblyName System.Speech\n$s = New-Object System.Speech.Synthesis.SpeechSynthesizer\n$s.SetOutputToWaveFile(\"$PWD\\out.wav\"); $s.Speak(\"Hello\"); $s.Dispose()",
        "pros": ["Already installed, zero setup", "Works offline, instantly"],
        "cons": ["Clearly robotic", "Few voices", "Windows only"],
        "url": "https://learn.microsoft.com/en-us/dotnet/api/system.speech.synthesis.speechsynthesizer",
        "demoUrl": None,
    },
    {
        "id": "chatterbox", "name": "Chatterbox (Resemble AI)", "kind": "local",
        "summary": "Open-source voice cloning: give it ~10 seconds of a voice and it reads any text in that voice, with an 'exaggeration' knob for emotion.",
        "quality": 4,
        "speed": "Roughly real time on an RTX 4050 laptop GPU; very slow on CPU",
        "languages": ["en", "ar", "da", "de", "el", "es", "fi", "fr", "he", "hi", "it", "ja", "ko", "ms", "nl", "no", "pl", "pt",
                      "ru", "sv", "sw", "tr", "zh"],
        "cloning": True,
        "cost": "Free (MIT)",
        "license": "MIT, commercial use OK; output carries an inaudible Perth watermark. Only clone voices you have permission to use.",
        "needs": "Python + PyTorch with CUDA, NVIDIA GPU (used ~4 GB VRAM on a 6 GB RTX 4050), ~6 GB of model downloads (Hugging Face cache)",
        "howClaudeUsesIt": "Claude sets up a separate venv with CUDA PyTorch, then runs a script calling model.generate(text, audio_prompt_path='reference.wav', exaggeration=0.5) per line. The English model is the strongest; ChatterboxMultilingualTTS adds 22 more languages incl. Hebrew.",
        "setup": "pip install chatterbox-tts\n# Windows: replace CPU torch with the CUDA build\npip install --force-reinstall --no-deps torch==2.6.0 torchaudio==2.6.0 --index-url https://download.pytorch.org/whl/cu124\npython make_chatterbox.py",
        "pros": ["Zero-shot cloning from a short clip", "Emotion/exaggeration control", "Multilingual model covers Hebrew and Arabic",
                 "Permissive MIT license"],
        "cons": ["Needs an NVIDIA GPU to be practical", "Big install (PyTorch + models)", "Takes vary run to run; long texts should be split into sentences",
                 "Non-English output is weaker than English"],
        "url": "https://github.com/resemble-ai/chatterbox",
        "demoUrl": "https://resemble-ai.github.io/chatterbox_demopage/",
    },
    {
        "id": "f5-tts", "name": "F5-TTS", "kind": "local",
        "summary": "A research voice-cloning model that copies a voice from a short reference clip plus its transcript.",
        "quality": 4,
        "speed": "Fast on an NVIDIA GPU; slow on CPU",
        "languages": ["en", "zh", "+ community fine-tunes for other languages"],
        "cloning": True,
        "cost": "Free",
        "license": "Code MIT, but the official pretrained weights are CC-BY-NC-4.0 (non-commercial) because of their training data",
        "needs": "Python + PyTorch with CUDA, NVIDIA GPU, ~1-2 GB of models",
        "howClaudeUsesIt": "Claude would run `f5-tts_infer-cli --ref_audio ref.wav --ref_text \"...\" --gen_text \"...\"` per line after installing it in its own venv.",
        "setup": "pip install f5-tts\nf5-tts_infer-cli --ref_audio ref.wav --ref_text \"transcript of ref\" --gen_text \"New line to speak\"",
        "pros": ["High-quality zero-shot cloning", "Active open-source project with a Gradio UI"],
        "cons": ["Official weights are non-commercial", "Officially English + Chinese only", "Needs a GPU and a transcript of the reference clip"],
        "url": "https://github.com/SWivid/F5-TTS",
        "demoUrl": "https://swivid.github.io/F5-TTS/",
    },
    {
        "id": "xtts-v2", "name": "XTTS-v2 (Coqui)", "kind": "local",
        "summary": "A popular multilingual voice-cloning model from the former Coqui company; clones from ~6 seconds of audio in 17 languages.",
        "quality": 3,
        "speed": "Faster than real time on an NVIDIA GPU; slow on CPU",
        "languages": ["en", "es", "fr", "de", "it", "pt", "pl", "tr", "ru", "nl", "cs", "ar", "zh", "ja", "hu", "ko", "hi"],
        "cloning": True,
        "cost": "Free for non-commercial use",
        "license": "Coqui Public Model License (CPML): non-commercial only. Coqui shut down in early 2024, so a commercial license can no longer be bought.",
        "needs": "Python + PyTorch, NVIDIA GPU recommended, ~2 GB model",
        "howClaudeUsesIt": "Claude would install the community-maintained `coqui-tts` package and call TTS('tts_models/multilingual/multi-dataset/xtts_v2').tts_to_file(text, speaker_wav='ref.wav', language='en').",
        "setup": "pip install coqui-tts\ntts --model_name tts_models/multilingual/multi-dataset/xtts_v2 --text \"Hello\" --speaker_wav ref.wav --language_idx en --out_path out.wav",
        "pros": ["Cloning in 17 languages incl. Arabic", "Lots of tutorials and community support"],
        "cons": ["Non-commercial license (CPML)", "No Hebrew or Farsi", "Original company is gone; maintained by the community",
                 "Occasional artifacts/hallucinations on long text"],
        "url": "https://huggingface.co/coqui/XTTS-v2",
        "demoUrl": "https://huggingface.co/spaces/coqui/xtts",
    },
    {
        "id": "elevenlabs", "name": "ElevenLabs", "kind": "paid",
        "summary": "The quality leader in commercial TTS: very expressive voices, instant cloning, and a huge shared voice library.",
        "quality": 5,
        "speed": "Fast cloud API (seconds per paragraph)",
        "languages": ["en", "he", "ar", "es", "ja", "fr", "de", "zh", "hi", "+ ~65 more (about 74 in total on the newest models)"],
        "cloning": True,
        "cost": "Free tier with a small monthly character allowance (no commercial license); paid plans from a few dollars a month; cloning needs a paid plan",
        "license": "Commercial use requires a paid plan",
        "needs": "Account + API key, internet",
        "howClaudeUsesIt": "Claude calls the ElevenLabs REST API (or the `elevenlabs` Python/JS SDK) with your API key from an environment variable, one request per narration line, and saves the returned MP3s.",
        "setup": "pip install elevenlabs\n# set ELEVENLABS_API_KEY, then client.text_to_speech.convert(voice_id=..., text=...)",
        "pros": ["Most natural and emotional delivery", "Instant voice cloning from a short clip", "Hebrew and many other languages"],
        "cons": ["Costs money at any real volume", "Text goes to a cloud service", "Free tier is small and not for commercial use"],
        "url": "https://elevenlabs.io",
        "demoUrl": "https://elevenlabs.io/text-to-speech",
    },
    {
        "id": "openai-tts", "name": "OpenAI TTS", "kind": "paid",
        "summary": "OpenAI's speech API with a dozen built-in voices; the newer model can be steered with plain-English instructions (tone, accent, pacing).",
        "quality": 4,
        "speed": "Fast cloud API, supports streaming",
        "languages": ["en", "he", "ar", "fa", "es", "ja", "+ most languages Whisper supports (voices are tuned for English)"],
        "cloning": False,
        "cost": "Pay per use (per character or per audio token, depending on the model); no free tier",
        "license": "Commercial use OK; OpenAI's policy requires telling listeners the voice is AI-generated",
        "needs": "Account + API key, internet",
        "howClaudeUsesIt": "Claude calls client.audio.speech.create(model=..., voice='marin', input=text, instructions='calm, friendly narrator') via the openai SDK and writes each response to an MP3.",
        "setup": "pip install openai\n# set OPENAI_API_KEY, then client.audio.speech.create(...)",
        "pros": ["Simple API, good quality", "Style controlled by a text prompt", "Many input languages"],
        "cons": ["Paid only", "No general cloning (custom voices are a restricted, consent-based feature)",
                 "OpenAI's docs mark the current TTS models as deprecated in favor of its realtime audio models, so check what's current"],
        "url": "https://developers.openai.com/api/docs/guides/text-to-speech",
        "demoUrl": "https://openai.fm",
    },
    {
        "id": "azure-speech", "name": "Azure AI Speech", "kind": "paid",
        "summary": "Microsoft's official TTS service: the same neural voices as edge-tts plus SSML speaking styles, an SLA, and custom/personal voices.",
        "quality": 4,
        "speed": "Fast cloud API",
        "languages": ["en", "he", "ar", "fa", "es", "ja", "+ ~140 locales in total"],
        "cloning": True,
        "cost": "Free tier of 0.5 million neural characters per month, then pay per character",
        "license": "Commercial use OK; custom and personal (cloned) voices are limited-access and need an application",
        "needs": "Azure account + Speech resource key, internet",
        "howClaudeUsesIt": "Claude uses the azure-cognitiveservices-speech SDK (or REST) with your key and region, sending SSML so it can set voice, style (cheerful, whispering...), rate and pauses per line.",
        "setup": "pip install azure-cognitiveservices-speech\n# set SPEECH_KEY and SPEECH_REGION",
        "pros": ["Official and reliable version of the edge-tts voices", "SSML styles and fine control", "Generous free tier"],
        "cons": ["Azure account setup is more work", "Cloning is gated behind an approval process"],
        "url": "https://azure.microsoft.com/en-us/products/ai-services/text-to-speech",
        "demoUrl": "https://azure.microsoft.com/en-us/products/ai-services/text-to-speech",
    },
    {
        "id": "google-tts", "name": "Google Cloud Text-to-Speech", "kind": "paid",
        "summary": "Google's cloud TTS with several voice tiers, from basic Standard voices up to high-definition generative voices.",
        "quality": 4,
        "speed": "Fast cloud API",
        "languages": ["en", "he", "ar", "es", "ja", "+ 50+ languages in total"],
        "cloning": True,
        "cost": "Monthly free tier, then pay per character; the price depends on the voice tier",
        "license": "Commercial use OK; custom (cloned) voices are a restricted-access feature",
        "needs": "Google Cloud project with billing + credentials, internet",
        "howClaudeUsesIt": "Claude uses the google-cloud-texttospeech client library with your service-account credentials to synthesize each line (plain text or SSML) to MP3.",
        "setup": "pip install google-cloud-texttospeech\n# set GOOGLE_APPLICATION_CREDENTIALS to your key file",
        "pros": ["Wide language coverage incl. Hebrew", "Free monthly allowance", "Reliable, well documented"],
        "cons": ["Cloud project + billing setup", "Best voice tiers cost more", "Cloning is not generally available"],
        "url": "https://cloud.google.com/text-to-speech",
        "demoUrl": "https://cloud.google.com/text-to-speech",
    },
]

# (id, engine, engine voice id, label, lang, tags, note)
VOICES = [
    ("kokoro-af-heart-en",   "kokoro", "af_heart",   "Heart (US female)",   "en", ["female", "US"], "Kokoro's top-graded voice (A)."),
    ("kokoro-af-bella-en",   "kokoro", "af_bella",   "Bella (US female)",   "en", ["female", "US"], "Graded A- by Kokoro's authors."),
    ("kokoro-af-nicole-en",  "kokoro", "af_nicole",  "Nicole (US female, soft)", "en", ["female", "US", "soft"], "A soft, close-mic style; noticeably slower."),
    ("kokoro-am-michael-en", "kokoro", "am_michael", "Michael (US male)",   "en", ["male", "US"], None),
    ("kokoro-am-fenrir-en",  "kokoro", "am_fenrir",  "Fenrir (US male)",    "en", ["male", "US"], None),
    ("kokoro-am-puck-en",    "kokoro", "am_puck",    "Puck (US male)",      "en", ["male", "US"], None),
    ("kokoro-bf-emma-en",    "kokoro", "bf_emma",    "Emma (UK female)",    "en", ["female", "UK"], None),
    ("kokoro-bm-george-en",  "kokoro", "bm_george",  "George (UK male)",    "en", ["male", "UK"], None),
    ("kokoro-bm-fable-en",   "kokoro", "bm_fable",   "Fable (UK male)",     "en", ["male", "UK"], None),
    ("kokoro-ef-dora-es",    "kokoro", "ef_dora",    "Dora (Spanish female)", "es", ["female", "Spanish"], None),
    ("kokoro-em-alex-es",    "kokoro", "em_alex",    "Alex (Spanish male)",   "es", ["male", "Spanish"], None),
    ("kokoro-jf-alpha-ja",   "kokoro", "jf_alpha",   "Alpha (Japanese female)", "ja", ["female", "Japanese"], "Text converted to phonemes with misaki[ja] first."),
    ("kokoro-jm-kumo-ja",    "kokoro", "jm_kumo",    "Kumo (Japanese male)",    "ja", ["male", "Japanese"], "Text converted to phonemes with misaki[ja] first."),

    ("edge-en-us-aria-en",   "edge-tts", "en-US-AriaNeural",  "Aria (US female)",  "en", ["female", "US"], None),
    ("edge-en-us-guy-en",    "edge-tts", "en-US-GuyNeural",   "Guy (US male)",     "en", ["male", "US"], None),
    ("edge-en-us-avamultilingual-en",    "edge-tts", "en-US-AvaMultilingualNeural",    "Ava Multilingual (US female)", "en", ["female", "US", "conversational"], "One of the newer conversational voices."),
    ("edge-en-us-andrewmultilingual-en", "edge-tts", "en-US-AndrewMultilingualNeural", "Andrew Multilingual (US male)", "en", ["male", "US", "conversational"], "One of the newer conversational voices."),
    ("edge-en-gb-sonia-en",  "edge-tts", "en-GB-SoniaNeural", "Sonia (UK female)", "en", ["female", "UK"], None),
    ("edge-en-au-natasha-en", "edge-tts", "en-AU-NatashaNeural", "Natasha (Australian female)", "en", ["female", "Australian"], None),
    ("edge-en-us-aria-en-fast", "edge-tts", "en-US-AriaNeural", "Aria, faster + higher", "en", ["female", "US", "rate/pitch"], "Same voice with --rate=+20% --pitch=+5Hz, to show the speed and pitch knobs."),
    ("edge-he-il-hila-he",   "edge-tts", "he-IL-HilaNeural",  "Hila (Hebrew female)", "he", ["female", "Hebrew"], None),
    ("edge-he-il-avri-he",   "edge-tts", "he-IL-AvriNeural",  "Avri (Hebrew male)",   "he", ["male", "Hebrew"], None),
    ("edge-es-mx-dalia-es",  "edge-tts", "es-MX-DaliaNeural", "Dalia (Mexican Spanish female)", "es", ["female", "Spanish"], None),
    ("edge-ja-jp-nanami-ja", "edge-tts", "ja-JP-NanamiNeural", "Nanami (Japanese female)", "ja", ["female", "Japanese"], None),
    ("edge-ar-sa-hamed-ar",  "edge-tts", "ar-SA-HamedNeural", "Hamed (Saudi Arabic male)", "ar", ["male", "Arabic"], None),
    ("edge-fa-ir-dilara-fa", "edge-tts", "fa-IR-DilaraNeural", "Dilara (Farsi female)", "fa", ["female", "Farsi"], None),

    ("piper-en-us-lessac-medium", "piper", "en_US-lessac-medium", "Lessac (US female, medium)", "en", ["female", "US"], None),
    ("piper-en-us-amy-medium",    "piper", "en_US-amy-medium",    "Amy (US female, medium)",    "en", ["female", "US"], None),
    ("piper-en-us-ryan-medium",   "piper", "en_US-ryan-medium",   "Ryan (US male, medium)",     "en", ["male", "US"], None),
    ("piper-es-mx-claude-high",   "piper", "es_MX-claude-high",   "Claude (Mexican Spanish male, high)", "es", ["male", "Spanish"], "'claude' is just the dataset's name, unrelated to Anthropic."),
    ("piper-he-il-saspeech-medium", "piper", "he_IL-saspeech-medium", "SASpeech (Hebrew male, medium)", "he", ["male", "Hebrew"], "Piper adds niqqud automatically; it guesses some vowels wrong and puts the pause in the wrong place."),
    ("piper-fa-ir-gyro-medium",   "piper", "fa_IR-gyro-medium",   "Gyro (Farsi male, medium)",  "fa", ["male", "Farsi"], None),

    ("sapi-david-en", "sapi", "Microsoft David Desktop", "David (US male)",   "en", ["male", "US", "robotic"], None),
    ("sapi-zira-en",  "sapi", "Microsoft Zira Desktop",  "Zira (US female)",  "en", ["female", "US", "robotic"], None),
    ("sapi-hazel-en", "sapi", "Microsoft Hazel Desktop", "Hazel (UK female)", "en", ["female", "UK", "robotic"], None),

    ("clone-reference", "chatterbox", "reference", "Reference clip (synthetic, from Kokoro bf_isabella)", "custom",
     ["reference", "synthetic"], "The ~10 s clip given to the cloner. It is itself AI-generated, so no real person is cloned."),
    ("chatterbox-clone-en",       "chatterbox", "clone", "Cloned voice (default settings)", "en", ["cloned"], "Cloned from the reference clip above (exaggeration 0.5)."),
    ("chatterbox-clone-en-calm",  "chatterbox", "clone", "Cloned voice, calm",     "en", ["cloned", "exaggeration"], "Exaggeration 0.25: flatter, calmer delivery."),
    ("chatterbox-clone-en-drama", "chatterbox", "clone", "Cloned voice, dramatic", "en", ["cloned", "exaggeration"], "Exaggeration 1.0 with cfg_weight 0.3: more emotional, faster delivery."),
    ("chatterbox-clone-he", "chatterbox", "clone", "Cloned voice speaking Hebrew", "he", ["cloned", "Hebrew"], "Multilingual model, same English reference clip. Hebrew is its weakest language here: a few words come out slurred or swallowed (best of several seeds)."),
    ("chatterbox-clone-es", "chatterbox", "clone", "Cloned voice speaking Spanish", "es", ["cloned", "Spanish"], "Multilingual model, same English reference clip."),
]

REFERENCE_TEXT = (
    "Hi there. I am a synthetic voice, made only for this demo. "
    "Nobody real sounds exactly like me, so I am a safe voice to clone. "
    "Listen to my tone, my accent, and the way I pace each sentence."
)

voices = []
for vid, engine, voice, label, lang, tags, note in VOICES:
    mp3 = AUDIO / f"{vid}.mp3"
    if not mp3.exists():
        print("skip (no file):", vid)
        continue
    voices.append({
        "id": vid, "engine": engine, "voice": voice, "label": label, "lang": lang,
        "text": REFERENCE_TEXT if lang == "custom" else None,
        "file": f"media/audio/{vid}.mp3", "durationSec": duration(mp3), "tags": tags, "note": note,
    })


def js(value):
    return json.dumps(value, ensure_ascii=False, indent=2)


out = ROOT / "js" / "data" / "voices.js"
out.write_text(
    "// Generated by demo-src/voices/build_voices_js.py (edit there, then re-run).\n"
    "window.VG = window.VG || {};\n"
    f"VG.sentences = {js(SENTENCES)};\n"
    f"VG.engines = {js(ENGINES)};\n"
    f"VG.voices = {js(voices)};\n",
    encoding="utf-8",
)
print(f"wrote {out} ({len(ENGINES)} engines, {len(voices)} voices)")

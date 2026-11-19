"""Shared helpers for the voice-sample scripts.

Every engine script writes a temporary WAV, then calls `to_mp3()` which
loudness-normalizes it and encodes the site's standard format:
MP3, mono, 64 kbps, 24 kHz, -16 LUFS (ffmpeg loudnorm).
"""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]          # video-making-guide/
AUDIO = ROOT / "media" / "audio"                     # final MP3s live here
TMP = Path(__file__).resolve().parent / "out"        # scratch WAVs (gitignored)
MODELS = Path(__file__).resolve().parent / "models"  # downloaded models (gitignored)

# The same sentences as docs/CONTRACT.md, so every voice can be compared.
SENTENCES = {
    "en": "Every great video starts with one clear idea. Keep it short, show instead of tell, and give the visuals room to breathe.",
    "he": "כל סרטון טוב מתחיל ברעיון אחד ברור. שמרו על זה קצר, הראו במקום לספר, ותנו לתמונה לנשום.",
    "es": "Todo buen video empieza con una idea clara. Hazlo corto, muestra en lugar de contar y deja respirar a las imágenes.",
    "ja": "良い動画は、ひとつの明確なアイデアから始まります。短くまとめて、説明するより見せましょう。",
    "ar": "كل فيديو جيد يبدأ بفكرة واحدة واضحة. اجعله قصيرًا، وأظهر بدلًا من أن تشرح.",
    "fa": "هر ویدیوی خوب با یک ایده‌ی روشن شروع می‌شود. کوتاهش کن، نشان بده به جای اینکه توضیح بدهی.",
}


def tmp_wav(name: str) -> Path:
    TMP.mkdir(parents=True, exist_ok=True)
    return TMP / f"{name}.wav"


def to_mp3(src: Path, clip_id: str) -> Path:
    """Normalize loudness and encode `src` as media/audio/<clip_id>.mp3."""
    AUDIO.mkdir(parents=True, exist_ok=True)
    dst = AUDIO / f"{clip_id}.mp3"
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(src),
         "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
         "-ac", "1", "-ar", "24000", "-c:a", "libmp3lame", "-b:a", "64k", str(dst)],
        check=True,
    )
    return dst


def duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout
    return round(float(json.loads(out)["format"]["duration"]), 2)

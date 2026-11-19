"""Windows built-in SAPI voices (David, Zira, Hazel): the robotic baseline.

No install needed on Windows. Python just drives PowerShell's System.Speech.
List voices in PowerShell:
    Add-Type -AssemblyName System.Speech
    (New-Object System.Speech.Synthesis.SpeechSynthesizer).GetInstalledVoices().VoiceInfo.Name
Run:    python make_sapi.py
"""
import subprocess

from common import SENTENCES, tmp_wav, to_mp3, duration

VOICES = ["Microsoft David Desktop", "Microsoft Zira Desktop", "Microsoft Hazel Desktop"]

PS = """
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.SelectVoice('{voice}')
$s.SetOutputToWaveFile('{wav}')
$s.Speak('{text}')
$s.Dispose()
"""

for voice in VOICES:
    short = voice.split()[1].lower()                 # david / zira / hazel
    clip_id = f"sapi-{short}-en"
    wav = tmp_wav(clip_id)
    script = PS.format(voice=voice, wav=wav, text=SENTENCES["en"].replace("'", "''"))
    subprocess.run(["powershell", "-NoProfile", "-Command", script], check=True)
    print(clip_id, duration(to_mp3(wav, clip_id)))

/* Test fixture for js/data/voices.js (fake entries, no real audio). */
window.VG = window.VG || {};
VG.sentences = {
  en: "Every great video starts with one clear idea. Keep it short, show instead of tell, and give the visuals room to breathe.",
  he: "כל סרטון טוב מתחיל ברעיון אחד ברור.",
  ja: "良い動画は、ひとつの明確なアイデアから始まります。"
};
VG.engines = [
  { id: "kokoro", name: "Kokoro (fixture)", kind: "local", summary: "Fixture engine: small local model.", quality: 4, speed: "Fast on CPU",
    languages: ["en", "ja", "es", "fr", "hi", "it", "pt", "zh", "ko"], cloning: false, cost: "Free", license: "Apache-2.0", needs: "Python",
    howClaudeUsesIt: "Runs a Python script per scene.", setup: "pip install kokoro-onnx soundfile", pros: ["Free", "Offline"], cons: ["No Hebrew"], url: "https://example.com", demoUrl: null },
  { id: "edge-tts", name: "edge-tts (fixture)", kind: "online-free", summary: "Fixture engine: online neural voices.", quality: 4, speed: "Fast",
    languages: ["en", "he", "ar", "fa", "es", "ja"], cloning: false, cost: "Free", license: "Unofficial API", needs: "Internet",
    howClaudeUsesIt: "Calls the edge-tts CLI.", setup: "pip install edge-tts\nedge-tts --voice he-IL-HilaNeural --text \"שלום\" --write-media out.mp3", pros: ["Hebrew"], cons: ["Needs internet"], url: "https://example.com", demoUrl: null },
  { id: "paidco", name: "PaidCo (fixture)", kind: "paid", summary: "Fixture paid engine.", quality: 5, languages: ["en", "he"], cloning: true,
    cost: "Paid", license: "Commercial", needs: "API key", howClaudeUsesIt: "Calls the REST API.", setup: "export PAIDCO_KEY=...", pros: ["Expressive"], cons: ["Costs money"], url: "https://example.com", demoUrl: "https://example.com/samples" },
  { id: "sapi", name: "Windows SAPI (fixture)", kind: "builtin", summary: "Fixture built-in engine.", quality: 2, languages: ["en"], cloning: false, cost: "Free", setup: "", pros: [], cons: ["Robotic"], url: null, demoUrl: null }
];
VG.voices = [
  { id: "kokoro-af-heart-en", engine: "kokoro", voice: "af_heart", label: "Heart (US female)", lang: "en", text: null, file: "media/audio/fixture-missing-1.mp3", durationSec: 6.4, tags: ["female", "US", "warm"] },
  { id: "kokoro-am-michael-en", engine: "kokoro", voice: "am_michael", label: "Michael (US male)", lang: "en", text: null, file: "media/audio/fixture-missing-2.mp3", durationSec: 6.1, tags: ["male", "US"] },
  { id: "kokoro-jf-alpha-ja", engine: "kokoro", voice: "jf_alpha", label: "Alpha (JP female)", lang: "ja", text: null, file: "media/audio/fixture-missing-3.mp3", durationSec: 5.0, tags: ["female"] },
  { id: "edge-aria-en", engine: "edge-tts", voice: "en-US-AriaNeural", label: "Aria (US female)", lang: "en", text: null, file: "media/audio/fixture-missing-4.mp3", durationSec: 6.6, tags: ["female", "US", "clear"] },
  { id: "edge-hila-he", engine: "edge-tts", voice: "he-IL-HilaNeural", label: "Hila (IL female)", lang: "he", text: null, file: "media/audio/fixture-missing-5.mp3", durationSec: 5.2, tags: ["female"] },
  { id: "edge-avri-he", engine: "edge-tts", voice: "he-IL-AvriNeural", label: "Avri (IL male)", lang: "he", text: null, file: "media/audio/fixture-missing-6.mp3", durationSec: 5.0, tags: ["male"] },
  { id: "paidco-clone", engine: "paidco", voice: "clone-1", label: "Cloned voice demo", lang: "custom", text: "This voice was cloned from a ten second reference clip.", file: "media/audio/fixture-missing-7.mp3", durationSec: 4.0, tags: ["cloned"], note: "Cloned from the 10 s reference clip." }
];

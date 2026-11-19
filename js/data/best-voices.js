/* best-voices.js: content for "Best of AI voices" (#/best-voices).
   This site hosts free engines only; this page points to where you can HEAR the top models. */
window.VG = window.VG || {};
VG.bestVoices = {
  asOf: "November 2026",
  intro: "The free voices on this site are genuinely good, and for most student videos they're enough. This page is for hearing the current state of the art: the top (mostly paid) models we don't host samples of. You can listen to all of them for free in your browser, no API key needed.",
  rankingNote: "Rankings change often, sometimes month to month. Leaders as of late 2026 included Cartesia Sonic, Speechify Simba, Alibaba Fun-Realtime-TTS and ElevenLabs, but the top models are within a few Elo points of each other: effectively tied. Check the live leaderboard rather than trusting any list, including this one.",
  places: [
    {
      name: "Artificial Analysis Speech Arena",
      url: "https://artificialanalysis.ai/text-to-speech/leaderboard",
      start: true,
      login: "No login to browse",
      what: "A public leaderboard built from blind A/B votes: people hear two voices without knowing which model is which and pick the better one.",
      can: ["See which models currently rank highest", "Do blind comparisons yourself and train your ear", "Filter for open-weights models you could run locally"]
    },
    {
      name: "OpenAI.fm",
      url: "https://www.openai.fm",
      login: "Reportedly no login",
      what: "OpenAI's demo page for its gpt-4o-mini-tts model. You type your own text and give it style instructions.",
      can: ["Hear your own script read aloud", "Steer delivery with instructions like “calm teacher” or “excited sports commentator”", "Hear how much tone changes with one sentence of direction"]
    },
    {
      name: "ElevenLabs",
      url: "https://elevenlabs.io",
      login: "Previews: no login · your own text: free account",
      what: "One of the best-known paid TTS companies. Preset voice previews play right on the site; typing your own text needs a free account.",
      can: ["Listen to preset voice previews", "Try Eleven v3, their most expressive model", "Hear audio tags like [whispers] and [laughs] change the delivery"]
    },
    {
      name: "Cartesia (Sonic)",
      url: "https://cartesia.ai",
      login: "Playground requires signup",
      what: "Very fast, low-latency voices built for real-time use. Sonic was at the top of the arena in a September 2026 snapshot.",
      can: ["Hear a top-ranked model", "Try it in the playground after signing up", "Notice how speed doesn't have to cost quality"]
    },
    {
      name: "Fish Audio",
      url: "https://fish.audio",
      login: "Browse samples; some features need an account",
      what: "Its S2 Pro is the highest-ranked open-weights model on the Artificial Analysis board, so beyond the website it can also be run locally.",
      can: ["Hear the best open-weights voice quality", "Browse community voices", "Consider it if you want top quality without a per-use bill (and have a capable GPU)"]
    }
  ],
  judge: [
    { t: "Prosody", d: "Does the tone follow the meaning? Questions should sound like questions, and the important word in a sentence should get the stress." },
    { t: "Pauses & breathing", d: "Natural pauses at commas and periods, not a breathless stream or random gaps mid-phrase." },
    { t: "Consistency over a long passage", d: "Listen to a minute or more, not one sentence. Many voices drift in pitch, speed or energy over time." },
    { t: "Pronunciation", d: "Test names, technical terms (SQL, NumPy, Dijkstra) and numbers (2024, 3.5, 10^6). These are where engines differ most." },
    { t: "Emotional range", d: "Can it sound curious, serious, excited, and does it do so when the text calls for it, without overacting?" },
    { t: "Artifacts", d: "Metallic or buzzy sound, clicks, words skipped or repeated, a garbled last syllable." },
    { t: "Language support", d: "Quality varies a lot by language. If you need Hebrew (or any non-English language), test it yourself; English rankings don't carry over." },
    { t: "Fit for YOUR video", d: "A calm 2-minute explainer doesn't need a voice actor. Judge the voice against what your video actually needs." }
  ],
  paidVsFree: {
    gapSmall: "For short, calm English explainers, the gap between a good free voice and a top paid one is small. Most viewers won't notice.",
    paidBetter: [
      "Emotion and acting (characters, storytelling, humor)",
      "Long narration (10+ minutes without drifting)",
      "Voice cloning that actually sounds like the person",
      "Non-English languages, where free options are thinner"
    ],
    bottomLine: "Whatever engine you use, the script matters more: short spoken sentences, deliberate punctuation and phonetic spellings improve every voice."
  },
  exercise: [
    "Write one line of 2–3 sentences from your own script, ideally with a name or a number in it.",
    "Play it on the Speech Arena or OpenAI.fm (try a style instruction on OpenAI.fm).",
    "Compare it with the same line read by the free voices on our Voices page (or ask Claude to render it with Kokoro or edge-tts).",
    "Use the checklist above. Is the difference worth paying for, for this video?"
  ]
};

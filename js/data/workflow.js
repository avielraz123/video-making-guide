/* workflow.js: content for "Working with Claude" (#/claude). */
window.VG = window.VG || {};
VG.workflow = {
  intro: "Claude Code can write the script draft, run the voice, write the animation code, render, mix and caption. What it can't do is watch and listen like a viewer. So the workflow is a loop: Claude builds, you watch and listen, you write precise notes, Claude fixes.",
  steps: [
    {
      id: "brief",
      title: "Write a brief",
      who: "you",
      what: "Half a page: who the video is for, the one sentence it must deliver, length, platform and aspect ratio, tone, voice preference, and what material already exists (notes, slides, code). Ask Claude to ask questions before it starts.",
      outputs: ["brief.md"],
      vague: "make me a video about recursion",
      good: "I'm making a 2-minute explainer for first-year CS students who have written loops but never recursion. Goal: after watching, they can trace factorial(4) by hand. 16:9, 1080p, calm and friendly. English narration with a free local voice. Read brief.md and ask me any questions before you start.",
      why: "Audience, goal, length, format and tone are decisions only you can make. Without them, Claude guesses, and you'll rewrite everything."
    },
    {
      id: "script",
      title: "Draft the script",
      who: "both",
      what: "Claude drafts a two-column script (narration | on screen) at a target word count. You edit it: cut, reorder, make it sound like you. Lock the script before moving on; every later step depends on it.",
      outputs: ["script/script.md", "script/pronunciations.md"],
      vague: "write a script",
      good: "Draft a two-column script (narration | on screen) for brief.md. About 280 words (2 min at 140 wpm). Open with a hook that shows the call stack growing. Short spoken sentences, no jargon beyond 'function' and 'return'. Put 3 alternative hooks at the top so I can choose.",
      why: "A word count gives a length, the two columns force visual thinking, and alternatives give you a real choice."
    },
    {
      id: "voice",
      title: "Choose the voice",
      who: "both",
      what: "Claude renders the same two sentences with 3–4 candidate voices. You listen (Claude can't) and pick one. Decide speed now, too.",
      outputs: ["audio/tests/*.mp3"],
      vague: "pick a good voice",
      good: "Render the first two sentences of script.md with Kokoro af_heart, Kokoro am_michael and edge-tts en-US-AriaNeural into audio/tests/, same text, loudness-normalized, file names = voice ids. I'll listen and tell you which one to use.",
      why: "Claude can't judge how a voice sounds. Same text and same loudness make your comparison fair."
    },
    {
      id: "narration",
      title: "Generate narration + timestamps",
      who: "claude",
      what: "One audio file per scene, using the phonetic spellings. Then word-level timestamps (from the engine, or from Whisper) so animations can sync to words. Claude reports the total duration and any word Whisper heard differently from the script.",
      outputs: ["audio/narration/scene-01.mp3", "audio/narration/scene-01.words.json"],
      vague: "make the audio",
      good: "Generate the narration with Kokoro am_michael at speed 0.95, one MP3 per scene from script.md, into audio/narration/. Use the spellings in pronunciations.md. Then run Whisper with word timestamps on each file, save scene-XX.words.json, and report the total duration plus any words that don't match the script.",
      why: "Per-scene files make fixes cheap; timestamps make sync exact; the Whisper check catches skipped words without anyone listening yet."
    },
    {
      id: "scenes",
      title: "Build scenes synced to the audio",
      who: "claude",
      what: "Claude writes one code file per scene, using a shared theme file and the timestamps. Scene length comes from the audio, never hard-coded guesses.",
      outputs: ["scenes/s03_stack.py", "scenes/theme.py"],
      vague: "animate scene 3",
      good: "Build scene 3 in Manim (scenes/s03_stack.py) from storyboard row 3. Use the colors and fonts in theme.py. Time animations from audio/narration/scene-03.words.json: the 'factorial of three' frame appears on that word. Scene length = audio length + 0.5 s. Use ease-out for entrances.",
      why: "Pointing to the storyboard row, theme and timestamps removes almost all guesswork."
    },
    {
      id: "stills",
      title: "Review still frames",
      who: "both",
      what: "Before rendering the whole video, render a few key frames as PNGs. Claude can look at images and catch overlaps, cut-off text and tiny type; you judge the look. Stills take seconds; full renders take minutes.",
      outputs: ["renders/stills/s03_t2.5.png"],
      vague: "does it look ok?",
      good: "Render stills of scene 3 at 0.5 s, at the word 'returns six', and the last frame into renders/stills/. Check them yourself for overlapping elements, text outside the 90% safe area and text smaller than ~40 px at 1080p. Fix what you find, then give me the paths.",
      why: "Specific checks turn “look at it” into something Claude can actually verify in an image."
    },
    {
      id: "render",
      title: "Full render, mix and captions",
      who: "claude",
      what: "Render all scenes, join them, mix narration with music (ducked), normalize loudness, add captions, and save as a numbered version. Never overwrite an older version.",
      outputs: ["renders/drafts/v003.mp4", "subtitles/video.srt"],
      vague: "render the video",
      good: "Render all scenes at 1080p30, concatenate them, mix the narration with music/calm.mp3 ducked about 20 dB under the voice, normalize to -14 LUFS (true peak -1 dB), burn in captions from subtitles/video.srt, and save as renders/drafts/v003.mp4. Print the measured loudness and duration.",
      why: "Concrete numbers (fps, dB, LUFS) and a version number make the result reproducible and checkable."
    },
    {
      id: "watch",
      title: "Watch it and write notes",
      who: "you",
      what: "Watch the whole draft at normal speed, with headphones, without stopping. Then go back and write timestamped notes: what's wrong, and what it should be instead. This is the step only a human can do.",
      outputs: ["notes/feedback-v003.md"],
      vague: "it feels a bit off, make it better",
      good: "Notes on v003:\n0:12 the bar appears ~0.5 s late, should land on 'six'.\n0:31–0:40 drags: cut the second example.\n0:52 'Dijkstra' is mispronounced, use 'Dike-struh'.\n1:10 the caption covers the code; move the code up.\nEverything else: keep as is.",
      why: "Timestamps, the problem and the desired result: Claude can fix each note precisely. “Keep the rest” protects what already works."
    },
    {
      id: "revise",
      title: "Revise (and repeat)",
      who: "both",
      what: "Claude applies only the notes, re-renders only the affected scenes, and logs what changed. Two or three rounds is normal. Stop when the notes get tiny.",
      outputs: ["renders/drafts/v004.mp4", "notes/changelog.md"],
      vague: "fix everything",
      good: "Apply the notes in notes/feedback-v003.md and change nothing else. Re-render only the affected scenes, rebuild the full video as v004, and add a short list of what changed to notes/changelog.md.",
      why: "Scoped changes avoid fixing one thing while breaking another, and the changelog tells you where to look."
    }
  ],
  can: [
    { t: "Write animation code", d: "Manim, Remotion, Motion Canvas, HTML canvas/SVG, matplotlib: scenes, layouts, timing from data." },
    { t: "Run TTS", d: "Local engines (e.g. Kokoro, Piper) and free online ones (edge-tts), with rate and pronunciation tweaks." },
    { t: "Edit with ffmpeg", d: "Cut, join, crop, scale, speed up, fade, overlay, mix and duck audio, convert formats." },
    { t: "Render and re-render", d: "Preview quality while iterating, final quality at the end, several aspect ratios from one codebase." },
    { t: "Check still frames", d: "It can look at PNG frames and spot overlaps, cut-off or tiny text, bad contrast, misalignment." },
    { t: "Make subtitles", d: "Transcribe with Whisper, align to the script, export SRT/VTT or burn them in." },
    { t: "Measure", d: "Duration, loudness (LUFS), resolution, frame rate, file size: and report the numbers." },
    { t: "Write the words", d: "Script drafts, storyboards, pronunciation sheets, video descriptions, transcripts." }
  ],
  cant: [
    { t: "Watch motion in real time", d: "It sees individual frames, not whether movement feels smooth or a scene drags. You watch." },
    { t: "Hear audio", d: "It can't judge tone, emotion, music mood, or a weird pronunciation by ear (Whisper only catches wrong words)." },
    { t: "Generate photoreal / AI video by itself", d: "It writes code that draws graphics. Photoreal footage or AI video needs a separate tool or service that you choose." },
    { t: "Judge voice quality", d: "“Which voice sounds most natural?” is your call. Listen to the candidates yourself." },
    { t: "Know your taste", d: "Without references it defaults to generic. Show examples or screenshots of styles you like." },
    { t: "Guarantee current platform rules", d: "Length limits, safe zones and policies change. Check the platform's help pages." }
  ],
  folder: [
    ["my-video/", ""],
    ["  CLAUDE.md", "conventions: voice, theme, format, commands"],
    ["  brief.md", "audience, one sentence, length, format"],
    ["  script/", ""],
    ["    script.md", "two-column script (locked before animating)"],
    ["    pronunciations.md", "SQL -> \"sequel\", Dijkstra -> \"Dike-struh\""],
    ["    storyboard.md", "one row per scene"],
    ["  audio/", ""],
    ["    tests/", "voice candidates"],
    ["    narration/", "scene-01.mp3 + scene-01.words.json ..."],
    ["    music/  sfx/", "licensed tracks + credits.txt"],
    ["  scenes/", "one code file per scene + theme file"],
    ["  assets/", "images, logos, fonts"],
    ["  subtitles/", "video.srt"],
    ["  renders/", "keep out of git (large)"],
    ["    stills/", "PNG frames for review"],
    ["    drafts/", "v001.mp4, v002.mp4, ... never overwrite"],
    ["    final/", "the published file"],
    ["  notes/", "feedback-v001.md, changelog.md"]
  ],
  tips: [
    { t: "Iterate on stills, not full renders", d: "A still takes seconds and shows 80% of the problems. Render the full video only when the stills look right." },
    { t: "Lock the script before animating", d: "A changed sentence changes the audio length, which shifts every animation after it." },
    { t: "Keep narration and scenes separate, one file per scene", d: "Fixing scene 4 shouldn't touch scenes 1–3. Small files also keep Claude's context focused." },
    { t: "Version every render", d: "v001, v002, … plus a notes file per version. You can always go back, and compare." },
    { t: "Put every style decision in one theme file", d: "Colors, fonts, sizes, standard durations. One edit restyles the whole video." },
    { t: "Use preview quality while iterating", d: "e.g. manim -ql or a lower Remotion scale. Switch to full quality for the final render." },
    { t: "Give references", d: "“Dark background, one accent color, like a 3Blue1Brown video” or a screenshot works better than “make it look nice”." },
    { t: "Write a CLAUDE.md for the project", d: "Voice, settings, theme, format and render commands. Every new session then starts with the right context." },
    { t: "Ask for questions and assumptions first", d: "Before a big step, ask Claude to list what it's assuming. Correcting an assumption is cheaper than correcting a render." },
    { t: "Use git for the code, not the renders", d: "Commit scripts and scene code after each good version; ignore renders/ and model files." }
  ]
};

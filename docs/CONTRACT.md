# Video Making Guide: build contract

Static site (plain HTML/CSS/JS, no build step, hash routing), hosted later on GitHub Pages
at `/video-making-guide/`. So use **relative paths only** (`media/audio/x.mp3`, never `/media/...`).
English only. Audience: a CS student who wants to learn how to make good videos with Claude
(Claude Code writes the code, renders, generates narration).

## File ownership (agents must not edit each other's files)

| Owner | Files |
|---|---|
| Voices agent | `js/data/voices.js`, `media/audio/**`, `demo-src/voices/**` |
| Animations agent | `js/data/animations.js`, `media/video/**`, `demo-src/<tool>/**` (not voices) |
| Site agent | everything else: `index.html`, `css/**`, `js/*.js`, `js/demos/**`, `js/data/guide*.js`, `js/data/workflow.js`, `tests/**`, `README.md` |

Heavy stuff (`node_modules/`, `.venv/`, model files, render output) must stay out of the repo
(see `.gitignore`). Put venvs / node_modules inside `demo-src/<tool>/` (ignored) or outside the repo.

## Media budget
- Audio: MP3, mono, 64 kbps (≈ 0.5 MB/min). Loudness-normalized (`ffmpeg -af loudnorm=I=-16:TP=-1.5:LRA=11`).
- Video: MP4 H.264 + AAC, `-movflags +faststart`, 1280×720 (or 1080×1080 / 1080×1920 if the demo is about formats),
  5–15 s, target < 2 MB each, plus a poster `media/video/<id>.jpg` (first meaningful frame, ≤ 80 KB).
- Whole repo should stay < 80 MB.

## Standard sentences (every voice reads the same text so they can be compared)
- `en`: "Every great video starts with one clear idea. Keep it short, show instead of tell, and give the visuals room to breathe."
- `he`: "כל סרטון טוב מתחיל ברעיון אחד ברור. שמרו על זה קצר, הראו במקום לספר, ותנו לתמונה לנשום."
- `es`: "Todo buen video empieza con una idea clara. Hazlo corto, muestra en lugar de contar y deja respirar a las imágenes."
- `ja`: "良い動画は、ひとつの明確なアイデアから始まります。短くまとめて、説明するより見せましょう。"
- `ar`: "كل فيديو جيد يبدأ بفكرة واحدة واضحة. اجعله قصيرًا، وأظهر بدلًا من أن تشرح."
- `fa`: "هر ویدیوی خوب با یک ایده‌ی روشن شروع می‌شود. کوتاهش کن، نشان بده به جای اینکه توضیح بدهی."

## `js/data/voices.js`
```js
window.VG = window.VG || {};
VG.sentences = { en: "...", he: "...", ... };        // copy of the table above
VG.engines = [{
  id: "kokoro",                 // slug
  name: "Kokoro",
  kind: "local",                // "local" | "online-free" | "paid" | "builtin"
  summary: "one sentence",
  quality: 4,                   // 1–5, honest
  speed: "Fast on CPU",         // short text
  languages: ["en", "ja", ...], // ISO-ish codes it supports (all, not just sampled)
  cloning: false,               // can clone a voice from a sample
  cost: "Free (Apache-2.0)",
  license: "Apache-2.0",        // note commercial-use limits honestly
  needs: "Python, ~120 MB model, no GPU",
  howClaudeUsesIt: "one or two sentences: what Claude runs",
  setup: "pip install kokoro-onnx ...",   // short shell snippet
  pros: ["..."], cons: ["..."],
  url: "https://...",           // official page / repo
  demoUrl: null                 // for paid engines: their own official sample page
}];
VG.voices = [{
  id: "kokoro-af-heart-en",     // unique, also the file basename
  engine: "kokoro",
  voice: "af_heart",            // engine's own voice id
  label: "Heart (US female)",   // human label
  lang: "en",                   // key into VG.sentences, or "custom"
  text: null,                   // only if lang === "custom" (e.g. a cloning demo explanation)
  file: "media/audio/kokoro-af-heart-en.mp3",
  durationSec: 6.4,
  tags: ["female", "US", "warm"],
  note: "optional short note, e.g. 'cloned from the 10 s reference clip above'"
}];
```

## `js/data/animations.js`
```js
window.VG = window.VG || {};
VG.animTools = [{
  id: "manim",
  name: "Manim",
  language: "Python",
  summary: "one sentence",
  bestFor: ["math explainers", "..."],
  notGreatFor: ["..."],
  difficulty: 2,               // 1–5 for Claude-assisted use
  cost: "Free (MIT)",
  needs: "Python, ffmpeg (+ LaTeX for equations)",
  howClaudeUsesIt: "...",
  setup: "pip install manim",
  url: "https://...",
  examplesUrl: "https://...",  // official gallery
  pros: ["..."], cons: ["..."],
  demos: [{
    id: "manim-equation",
    title: "Equation transform",
    file: "media/video/manim-equation.mp4",
    poster: "media/video/manim-equation.jpg",
    durationSec: 8,
    source: "demo-src/manim/equation.py",   // main source file, shown on the site as code
    sourceLang: "python",
    description: "what it shows and which technique it teaches",
    renderCmd: "manim -qm equation.py EquationScene"
  }]
}];
```
Tools without a rendered demo (e.g. not installed) still get an entry with `demos: []`.

## Site agent expectations
Code against these schemas. If a data file is missing or empty, the page shows a friendly
"samples coming soon" state rather than crashing. Load data via plain `<script>` tags.

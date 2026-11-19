// Animation tools for making videos with Claude Code.
// Every rendered demo below was written by Claude, rendered locally on Windows 11,
// and its full source lives in demo-src/<tool>/ (renderCmd is the command actually used).
//
// Optional fields beyond docs/CONTRACT.md (the site may ignore them):
//   tool.note           - one extra caveat / context sentence
//   demo.extraSources   - other files in the demo worth showing (paths)
//   demo.tags           - e.g. ["formats"] for the aspect-ratio demo
window.VG = window.VG || {};
VG.animTools = [
  {
    id: "remotion",
    name: "Remotion",
    language: "TypeScript / React",
    summary: "Write videos as React components: every frame is a render of your UI at a given frame number, then Remotion exports it to MP4.",
    bestFor: ["explainers and promos with text, charts and UI", "narrated videos with synced captions", "templated / data-driven videos (same layout, many variants)", "one scene exported to several aspect ratios"],
    notGreatFor: ["math-heavy animation (Manim is nicer)", "3D scenes (possible with three.js, but more work)", "large companies that don't want to buy a license"],
    difficulty: 2,
    cost: "Free for individuals and companies of up to 3 people (commercial use included); larger companies need a paid company license",
    needs: "Node.js, a code editor; Remotion downloads its own headless Chrome for rendering",
    howClaudeUsesIt: "Claude writes the compositions (React components + spring/interpolate timing), runs `npx remotion render <id> out/video.mp4`, extracts a few frames with ffmpeg to check the layout, and fixes what it sees. You preview and steer in Remotion Studio (`npx remotion studio`).",
    setup: "npx create-video@latest\ncd my-video\nnpx remotion studio            # live preview in the browser\nnpx remotion render MyComp out/video.mp4",
    url: "https://www.remotion.dev/",
    examplesUrl: "https://www.remotion.dev/showcase",
    pros: ["Plain React + CSS: anything you can build on a web page can be animated", "Frame-exact, deterministic rendering (no screen recording)", "Great for audio-synced work: <Audio>, captions, timing from JSON", "Studio preview with a timeline; official agent skills for Claude"],
    cons: ["Rendering runs a headless browser, so it is slower than a native renderer", "Company license needed above 3 people", "You need to think in frames (useCurrentFrame), which takes a moment to click"],
    demos: [
      {
        id: "remotion-kinetic",
        title: "Kinetic typography + growing bar chart",
        file: "media/video/remotion-kinetic.mp4",
        poster: "media/video/remotion-kinetic.jpg",
        durationSec: 8,
        source: "demo-src/remotion/src/KineticChart.tsx",
        sourceLang: "tsx",
        description: "Words pop in one by one with a bouncy spring(), the title slides up, then five bars grow from zero while their numbers count up. Teaches spring() vs interpolate(), staggering with a per-item delay, and <Sequence> to place parts on the timeline.",
        renderCmd: "npx remotion render KineticChart out/KineticChart.mp4 --crf=23",
        extraSources: ["demo-src/remotion/src/Root.tsx", "demo-src/remotion/src/theme.ts"]
      },
      {
        id: "remotion-narrated",
        hasAudio: true,
        title: "Narrated explainer, end to end (Kokoro + Whisper + Remotion)",
        file: "media/video/remotion-narrated.mp4",
        poster: "media/video/remotion-narrated.jpg",
        durationSec: 10,
        source: "demo-src/remotion/src/NarratedExplainer.tsx",
        sourceLang: "tsx",
        description: "The whole pipeline in 10 seconds: Kokoro (offline TTS) speaks the script, faster-whisper finds the start/end time of every word (captions.json), and Remotion plays the audio while word-by-word captions highlight in sync and each pipeline card lights up exactly when its name is spoken. Change the script, re-run the two Python steps, re-render: everything re-times itself. Has sound.",
        renderCmd: "python narration/tts.py <kokoro-models-dir> && python narration/timestamps.py && npx remotion render NarratedExplainer out/NarratedExplainer.mp4 --crf=23",
        extraSources: ["demo-src/remotion/narration/tts.py", "demo-src/remotion/narration/timestamps.py", "demo-src/remotion/src/captions.json"]
      },
      {
        id: "remotion-formats",
        title: "One scene, three aspect ratios (16:9, 1:1, 9:16)",
        file: "media/video/remotion-formats.mp4",
        poster: "media/video/remotion-formats.jpg",
        durationSec: 6,
        source: "demo-src/remotion/src/Formats.tsx",
        sourceLang: "tsx",
        description: "The same responsive component registered as three compositions: 1920×1080 for YouTube, 1080×1080 for square feeds, 1080×1920 for TikTok / Reels / Shorts. Layout switches from row to column and text sizes come from the shorter side. This preview shows all three scaled down side by side; each can also be rendered full size (e.g. `npx remotion render Format-9x16 out/vertical.mp4`). Note: Instagram's feed now also favors 4:5 (1080×1350); vertical platforms cover the bottom and right edges with UI, so keep text away from them.",
        renderCmd: "npx remotion render FormatsSideBySide out/FormatsSideBySide.mp4 --crf=23",
        tags: ["formats"]
      }
    ]
  },
  {
    id: "manim",
    name: "Manim (Community Edition)",
    language: "Python",
    summary: "The Python library behind 3Blue1Brown-style math videos: equations, graphs and shapes that morph smoothly into each other.",
    bestFor: ["math and CS explainers", "equation derivations (LaTeX)", "function plots, geometry, algorithm visualizations"],
    notGreatFor: ["UI / marketing videos with lots of styled text", "photo or footage-based videos", "precise audio sync (doable, but manual)"],
    difficulty: 2,
    cost: "Free (MIT)",
    needs: "Python 3.10+; a LaTeX install (MiKTeX / TeX Live) only if you use MathTex / Tex",
    howClaudeUsesIt: "Claude writes a Scene class (create objects, then self.play(...) animations), renders with `manim -qm file.py SceneName` (720p, fast), checks frames, then re-renders at -qh for the final 1080p version.",
    setup: "pip install manim\n# optional, for equations: install MiKTeX (Windows) or TeX Live (Mac/Linux)\nmanim -qm scene.py MyScene     # -ql = quick draft, -qh = 1080p",
    url: "https://www.manim.community/",
    examplesUrl: "https://docs.manim.community/en/stable/examples.html",
    pros: ["Beautiful math typesetting and morphing (TransformMatchingTex)", "Updaters / ValueTracker make 'live' diagrams easy", "Fast to render, pure Python, huge community"],
    cons: ["Not meant for general motion design or UI", "LaTeX install is big", "API differs from the original 3b1b manimgl version, so old tutorials can mislead"],
    demos: [
      {
        id: "manim-equation",
        title: "Equation transform: expanding (a + b)²",
        file: "media/video/manim-equation.mp4",
        poster: "media/video/manim-equation.jpg",
        durationSec: 12.8,
        source: "demo-src/manim/equation.py",
        sourceLang: "python",
        description: "(a+b)² morphs step by step into a² + 2ab + b², the matching terms ab and ba get boxed and merged, then the result is shown as the area of a square. Teaches MathTex split into parts, TransformMatchingTex, SurroundingRectangle and LaggedStart.",
        renderCmd: "manim -qm equation.py EquationScene"
      },
      {
        id: "manim-tangent",
        title: "Function plot with a moving tangent",
        file: "media/video/manim-tangent.mp4",
        poster: "media/video/manim-tangent.jpg",
        durationSec: 11.2,
        source: "demo-src/manim/tangent.py",
        sourceLang: "python",
        description: "A cubic is drawn on axes, then a tangent line slides along it while the slope readout updates live; it pauses at the local minimum where the slope is 0. Teaches Axes.plot, ValueTracker and always_redraw (objects that rebuild every frame from one animated number).",
        renderCmd: "manim -qm tangent.py TangentScene"
      }
    ]
  },
  {
    id: "motion-canvas",
    name: "Motion Canvas (rendered with Revideo)",
    language: "TypeScript",
    summary: "Animations written as generator functions (each `yield*` plays a step), with an especially good animated code-block component.",
    bestFor: ["programming tutorials (animated code, highlights, diffs)", "diagrams and explainer graphics", "precise, script-like timing"],
    notGreatFor: ["fully automated rendering with plain Motion Canvas (it renders from its editor UI)", "footage-heavy editing"],
    difficulty: 3,
    cost: "Free (MIT) for both Motion Canvas and Revideo",
    needs: "Node.js; Motion Canvas renders from its browser editor, Revideo can render headless with Chrome + ffmpeg",
    howClaudeUsesIt: "Claude writes the scene (a generator function with code.append / selection / replace steps). With plain Motion Canvas you press Render in its editor; for a hands-off pipeline Claude used Revideo, a fork with the same scene API plus a renderVideo() function, and ran `node render.mjs`.",
    setup: "# Motion Canvas (editor UI):\nnpm init @motion-canvas@latest\n# Revideo (headless render, used for this demo):\nnpm install @revideo/core @revideo/2d @revideo/renderer @revideo/vite-plugin @revideo/ui\nnode render.mjs",
    url: "https://motioncanvas.io/",
    examplesUrl: "https://motioncanvas.io/docs/",
    pros: ["Scenes read like a script: one step after another", "Best-in-class animated code blocks (typing, highlighting, diffing)", "Signals make values and layout react to each other"],
    cons: ["Plain Motion Canvas has no official headless render, so you press a button in the editor", "Revideo needed setup workarounds on Windows (see note)", "Smaller community; Motion Canvas releases have been slow lately"],
    note: "This demo was rendered with Revideo 0.11 (scene code is Motion Canvas-style, imports from @revideo/*). Two workarounds were needed on Windows: force the ffmpeg exporter (the default in-browser exporter wrote empty files) and point puppeteer at the installed Chrome. Revideo is reportedly now developed as the engine of the Midrender editor, so check its repo activity before relying on it.",
    demos: [
      {
        id: "motion-canvas-code",
        title: "Animated code block with a live value",
        file: "media/video/motion-canvas-code.mp4",
        poster: "media/video/motion-canvas-code.jpg",
        durationSec: 9.1,
        source: "demo-src/motion-canvas/src/scenes/code.tsx",
        sourceLang: "tsx",
        description: "A small JavaScript function types itself in, then the loop line is highlighted on each pass while the value card counts 0 → 12 → 20 → 35; finally one line is edited in place (sum += p * 2) with an animated diff and the value jumps to 70. Teaches Code + LezerHighlighter, lines()/word() selections, code.replace, and tween().",
        renderCmd: "node render.mjs",
        extraSources: ["demo-src/motion-canvas/render.mjs", "demo-src/motion-canvas/src/project.ts"]
      }
    ]
  },
  {
    id: "ffmpeg",
    name: "ffmpeg (on its own)",
    language: "Shell (command line)",
    summary: "The Swiss-army knife of video: slideshows, crossfades, text, subtitles, resizing and encoding, all from one command.",
    bestFor: ["slideshows from images (Ken Burns zoom + crossfades)", "burning in subtitles and adding title / name cards", "trimming, joining, resizing, compressing, adding music", "the final step of every other tool's pipeline"],
    notGreatFor: ["complex animated graphics (use Remotion / Manim and finish with ffmpeg)", "anything you want to tweak visually: filter graphs are hard to read"],
    difficulty: 1,
    cost: "Free (LGPL/GPL)",
    needs: "Just the ffmpeg binary (here, Python + Pillow only to generate the demo images)",
    howClaudeUsesIt: "Claude writes the ffmpeg command (or a small script around it), runs it, and checks the result with ffprobe and extracted frames. It knows the filters (zoompan, xfade, drawtext, subtitles, overlay) and the escaping rules, which is the hard part for humans.",
    setup: "winget install Gyan.FFmpeg      # Windows (or: brew install ffmpeg / apt install ffmpeg)\nbash slideshow.sh",
    url: "https://ffmpeg.org/",
    examplesUrl: "https://ffmpeg.org/ffmpeg-filters.html",
    pros: ["Installed once, works everywhere, very fast", "Handles every format and codec", "Perfect for batch jobs (100 videos from 100 folders)"],
    cons: ["Filter syntax and quoting (especially on Windows) are cryptic", "No preview: you render to see", "Not a motion-graphics tool"],
    demos: [
      {
        id: "ffmpeg-slideshow",
        title: "Ken Burns slideshow with crossfades",
        file: "media/video/ffmpeg-slideshow.mp4",
        poster: "media/video/ffmpeg-slideshow.jpg",
        durationSec: 13,
        source: "demo-src/ffmpeg/slideshow.sh",
        sourceLang: "bash",
        description: "Four images (generated with Pillow by gen_images.py, so no copyright issues) each get a slow zoom or pan with zoompan, joined by xfade transitions, with a fade in/out. Teaches upscaling before zoompan to avoid jitter and how xfade offsets add up.",
        renderCmd: "python gen_images.py && bash slideshow.sh",
        extraSources: ["demo-src/ffmpeg/gen_images.py"]
      },
      {
        id: "ffmpeg-subtitles",
        title: "Burned-in subtitles + animated name card",
        file: "media/video/ffmpeg-subtitles.mp4",
        poster: "media/video/ffmpeg-subtitles.jpg",
        durationSec: 10,
        source: "demo-src/ffmpeg/subtitles.sh",
        sourceLang: "bash",
        description: "Subtitles from a plain .srt file are burned in with the subtitles filter (styled with force_style), and a lower-third name card built with drawbox + drawtext slides in and out using an overlay x-expression over time. The background clip is ffmpeg's own animated gradients source, so the demo needs no footage.",
        renderCmd: "bash subtitles.sh",
        extraSources: ["demo-src/ffmpeg/subs.srt"]
      }
    ]
  },
  {
    id: "canvas-capture",
    name: "HTML / CSS / Canvas captured to video",
    language: "JavaScript (+ Node.js)",
    summary: "Any web animation can become a video: open the page in a headless browser, draw it frame by frame, and pipe the frames into ffmpeg.",
    bestFor: ["generative art and particle effects", "reusing an existing web animation, chart or game", "effects that are easiest in Canvas / WebGL"],
    notGreatFor: ["timeline-based editing with audio (use Remotion, which is this idea, productized)", "animations that depend on real time (they must be made frame-steppable first)"],
    difficulty: 2,
    cost: "Free (Playwright: Apache-2.0, ffmpeg: LGPL/GPL)",
    needs: "Node.js, Playwright (or Puppeteer), an installed Chrome / Edge, ffmpeg",
    howClaudeUsesIt: "Claude writes the animation as a pure drawFrame(n) function (no clock, seeded randomness), plus a small Node script that calls it for every frame inside a headless browser and streams the PNGs to ffmpeg. The same HTML file still plays live when opened in a browser.",
    setup: "npm install playwright-core     # uses your installed Edge/Chrome\nnode capture.mjs",
    url: "https://playwright.dev/",
    examplesUrl: "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial",
    pros: ["Unlimited visual freedom (Canvas, WebGL, SVG, CSS)", "Frame-perfect: no dropped frames, unlike screen recording", "Tiny toolchain"],
    cons: ["You build the timeline and audio handling yourself", "Animations must be written to be stepped by frame number", "Large PNG streams make long renders slow"],
    demos: [
      {
        id: "canvas-particles",
        title: "Particles forming a word",
        file: "media/video/canvas-particles.mp4",
        poster: "media/video/canvas-particles.jpg",
        durationSec: 8,
        source: "demo-src/canvas/particles.html",
        sourceLang: "html",
        description: "About 1,500 particles fly in from random spots to spell VIDEO (targets sampled from text drawn on a hidden canvas), ripple gently, then scatter. Recorded with Playwright by calling drawFrame(n) for each of the 240 frames and piping canvas.toDataURL() PNGs into ffmpeg.",
        renderCmd: "node capture.mjs",
        extraSources: ["demo-src/canvas/capture.mjs"]
      }
    ]
  },
  {
    id: "blender",
    name: "Blender (Python scripting)",
    language: "Python (bpy)",
    summary: "Full 3D suite that can be driven entirely from Python: build scenes, animate cameras and objects, and render without opening the UI.",
    bestFor: ["3D product shots, logos and flythroughs", "realistic lighting and materials", "procedural / data-driven 3D scenes"],
    notGreatFor: ["quick 2D text-and-chart videos", "fast iteration: renders can take minutes per second of video", "beginners with no 3D background"],
    difficulty: 4,
    cost: "Free (GPL)",
    needs: "Blender install (a few hundred MB), a decent GPU for Cycles; EEVEE is faster",
    howClaudeUsesIt: "Claude writes a bpy script that builds the scene and keyframes, then renders headless with `blender -b -P scene.py -a` (or renders a frame range to PNGs and joins them with ffmpeg). Claude can't see the 3D viewport, so checking rendered frames matters even more here.",
    setup: "# install Blender from blender.org, then:\nblender -b -P scene.py -a        # -b = no UI, -P = run script, -a = render animation",
    url: "https://www.blender.org/",
    examplesUrl: "https://docs.blender.org/api/current/",
    pros: ["Real 3D: lighting, materials, physics, cameras", "Everything is scriptable, so it automates well", "Free, huge community and asset ecosystem"],
    cons: ["Steep learning curve, big API", "Slow renders compared to 2D tools", "Hard for Claude to judge composition without many test renders"],
    note: "Not installed on the machine that built this guide, so there is no demo.",
    demos: []
  },
  {
    id: "after-effects",
    name: "Adobe After Effects (scripts & templates)",
    language: "JavaScript (ExtendScript) + expressions",
    summary: "The industry-standard motion-graphics app; scripts and expressions can automate it, and templates can be filled with new text and media.",
    bestFor: ["professional motion design and VFX", "teams that already use Adobe tools", "filling an existing template with new text / images in bulk"],
    notGreatFor: ["free or fully code-driven pipelines", "running on a server or in CI", "people without a Creative Cloud subscription"],
    difficulty: 4,
    cost: "Paid (Adobe Creative Cloud subscription)",
    needs: "After Effects installed and licensed (Windows or macOS)",
    howClaudeUsesIt: "Claude can write ExtendScript (.jsx) scripts that create layers, keyframes and render-queue items, and expressions for procedural motion; renders can run from the command line with aerender. Claude can't operate the app's UI itself, so you run the scripts and send back screenshots or renders.",
    setup: "# inside After Effects: File > Scripts > Run Script File... (your .jsx)\n# command-line render of a saved project:\naerender -project my.aep -comp \"Main\" -output out.mov",
    url: "https://www.adobe.com/products/aftereffects.html",
    examplesUrl: "https://ae-scripting.docsforadobe.dev/",
    pros: ["Unmatched tooling for motion design", "Huge template and plugin market", "Exports Lottie via the Bodymovin plugin"],
    cons: ["Subscription cost", "Scripting API is old-style JavaScript (ExtendScript)", "Hard to automate end to end compared with code-first tools"],
    demos: []
  },
  {
    id: "lottie-rive",
    name: "Lottie & Rive (vector animation for web / apps)",
    language: "JSON (Lottie) / Rive editor + runtimes",
    summary: "Lightweight vector animation formats that play inside websites and apps; they can also be rendered into videos.",
    bestFor: ["animated icons, logos and UI micro-animations", "interactive animations in apps (Rive state machines)", "reusing a designer's animation inside a Remotion video"],
    notGreatFor: ["long narrated videos on their own", "photo-real content", "writing complex animations by hand in JSON"],
    difficulty: 3,
    cost: "Lottie: free open format (lottie-web is MIT). Rive: runtimes are open source, the editor has a free tier with paid plans (check rive.app for what exporting requires)",
    needs: "A browser or app runtime; animations are usually made in After Effects (Bodymovin), LottieFiles, or the Rive editor",
    howClaudeUsesIt: "Claude doesn't draw these animations well from scratch, but it can embed them: play a .json Lottie in a web page or inside Remotion with @remotion/lottie (then render to MP4), change colors or text in the JSON, or wire a Rive state machine into an app.",
    setup: "npm install lottie-web            # play Lottie on a web page\nnpx remotion add @remotion/lottie  # use a Lottie inside a Remotion video",
    url: "https://lottiefiles.com/",
    examplesUrl: "https://rive.app/community",
    pros: ["Tiny files, crisp at any size", "Thousands of ready-made animations", "Rive adds interactivity (state machines)"],
    cons: ["Needs a design tool to create good animations", "Not a video tool by itself", "Some After Effects features don't export to Lottie"],
    demos: []
  },
  {
    id: "ai-video",
    name: "AI video generators (Runway, Google Veo, Kling, …)",
    language: "Text prompts (+ optional API calls)",
    summary: "Models that generate video clips from a text prompt or an image; useful for footage-like shots that can't be coded.",
    bestFor: ["b-roll and atmospheric shots", "concept / mood videos", "animating a still image"],
    notGreatFor: ["exact text, numbers, diagrams or code on screen", "consistency across many shots", "anything that must be precise or reproducible"],
    difficulty: 2,
    cost: "Paid (credits or subscriptions; some offer limited free trials). Prices change often, so check each provider",
    needs: "An account and usually an API key with credits; the generation runs on the provider's servers",
    howClaudeUsesIt: "Claude can't generate these videos itself. It can write and refine prompts, write a script that calls a provider's API with your key, download the clips, and cut them together with ffmpeg or Remotion. This guide contains no AI-generated video.",
    setup: "# example shape (each provider differs; read its API docs):\nexport PROVIDER_API_KEY=...\npython generate_clip.py \"slow aerial shot over a misty forest at dawn\"",
    url: "https://runwayml.com/",
    examplesUrl: "https://deepmind.google/models/veo/",
    pros: ["Footage-style shots in minutes, no camera needed", "Image-to-video brings stills to life", "Easy to combine with code-made graphics"],
    cons: ["Costs per second of video", "Hands, text and physics can still glitch", "Results vary run to run; licensing / usage terms differ per provider"],
    note: "The landscape moves fast: OpenAI announced in March 2026 that it was shutting down Sora (the app closed in April and the API was scheduled to end in September 2026). Check each provider's current docs before planning around it.",
    demos: []
  }
];

/* guide.js: content for "Making good videos" (#/guide).
   Each chapter: id, title, minutes (reading time), summary, body (trusted HTML),
   optional tool ("script-timer"), checklist[], mistakes[], interactive (for the final checklist). */
window.VG = window.VG || {};
VG.guide = {
  intro: "Ten short chapters, in the order you'd actually make a video. Each ends with a checklist and the mistakes we see most. Read them in order the first time; later, use them as reference.",
  chapters: [
    {
      id: "idea",
      title: "One idea, one audience",
      minutes: 4,
      summary: "Most weak videos fail before the first frame: they try to say three things to everyone. Pick one idea and one viewer.",
      body: `
<p>A good video is a promise kept: the viewer clicks because of one idea, and leaves understanding it. Before you open any tool, write down <b>who</b> the video is for and <b>what they'll be able to do</b> afterwards.</p>

<h2>Name the viewer precisely</h2>
<p>“Students” is not an audience. “Second-year CS students who know recursion but have never seen dynamic programming” is. A precise viewer tells you what to skip (no need to explain what a function is), which examples land (Fibonacci, not stock trading), and how fast you can go.</p>

<h2>The one-sentence test</h2>
<p>Complete this sentence: <em>“After watching, the viewer will understand / be able to ______.”</em> If you need an “and”, you probably have two videos. Two short videos beat one long confusing one.</p>
<table class="data">
  <thead><tr><th scope="col">Too vague</th><th scope="col">Sharp</th></tr></thead>
  <tbody>
    <tr><td>A video about sorting algorithms</td><td>Why quicksort usually beats merge sort in practice, for students who already know both</td></tr>
    <tr><td>Explaining my final project</td><td>Show how our app finds a free study room in 3 taps, for classmates who'd use it</td></tr>
    <tr><td>What is machine learning</td><td>How a spam filter learns from examples, with no math, for first-year students</td></tr>
  </tbody>
</table>

<h2>Scope by length</h2>
<p>Narration runs at roughly 130–150 words per minute. A 3-minute video is only about 400–450 words: room for <b>one idea with two or three supporting points</b> and one good example. If your outline has seven sections, either cut or make a series.</p>

<h2>Find the angle</h2>
<p>The same topic can be told many ways. Strong angles are usually one of these:</p>
<ul>
  <li><b>A question the viewer already has</b>: “Why is my Python loop so slow?”</li>
  <li><b>A surprising result</b>: “This 5-line change made our site 3× faster.”</li>
  <li><b>A visible transformation</b>: before → after, problem → fix.</li>
  <li><b>A concrete story</b>: one real example, followed from start to finish.</li>
</ul>

<h2>Know what “done” means</h2>
<p>A class assignment has a rubric and a time limit; a YouTube video has a thumbnail and a title to live up to; a portfolio demo has a recruiter who will watch 30 seconds. Write the goal next to your one sentence. It decides length, tone and format later.</p>

<div class="callout"><p><b>With Claude:</b> give it the audience and the one sentence, and ask for five different angles plus a title for each. Pick one yourself. Choosing is your job; generating options is cheap for Claude.</p></div>
`,
      checklist: [
        "I can name my viewer in one specific sentence.",
        "I can finish “After watching, the viewer will…” without using “and”.",
        "My planned length fits: ~140 words per minute of narration.",
        "I chose an angle (question, surprise, transformation or story).",
        "I know the target platform and any time limit."
      ],
      mistakes: [
        "Trying to cover a whole lecture in one video.",
        "Writing for “everyone”, which ends up too basic for some and too fast for others.",
        "Starting in the animation tool before knowing what the video says.",
        "Picking the topic you find impressive instead of the one your viewer needs."
      ]
    },
    {
      id: "script",
      title: "Writing the script",
      minutes: 7,
      summary: "Hook in the first 5 seconds, write for the ear, and time it. The script is the cheapest place to fix a video.",
      tool: "script-timer",
      body: `
<p>Everything downstream (narration, scene timing, captions) comes from the script. An hour on the script saves five hours of re-rendering. Write it as words that will be <em>heard</em>, not read.</p>

<h2>A structure that works</h2>
<ol>
  <li><b>Hook (0–5 s):</b> why should I keep watching? Show the result, ask the question, or state the surprise.</li>
  <li><b>Promise (5–15 s):</b> what the viewer will get. “By the end you'll be able to read any Big-O chart.”</li>
  <li><b>Body:</b> two or three points. For each: the claim, a concrete example, and what's on screen.</li>
  <li><b>Payoff:</b> come back to the hook. Answer the question, show the result again, now understood.</li>
  <li><b>Close (optional, short):</b> one line recap or next step. No long goodbyes.</li>
</ol>

<h2>Hooks that work</h2>
<ul>
  <li><b>Result first:</b> “This animation took 40 lines of Python. Here's how.”</li>
  <li><b>A question:</b> “Why does your phone know it's you, but not your twin?”</li>
  <li><b>A surprising fact:</b> “Half a second of extra load time can noticeably drop how many people stay on a page.”</li>
  <li><b>A shared pain:</b> “You wrote the recursion. It works. You still don't know why.”</li>
</ul>
<p>Weak hooks: “Hi, in this video I'm going to talk about…”, a long logo intro, or background context before the viewer cares.</p>

<h2>Write for the ear</h2>
<ul>
  <li><b>Short sentences.</b> Average around 15 words. One idea per sentence.</li>
  <li><b>Spoken words:</b> contractions (“it's”, “you'll”), active voice, “you” and “we”.</li>
  <li><b>Signposts:</b> “First…”, “Here's the trick…”, “So what happened?” Listeners can't scroll back.</li>
  <li><b>Round numbers:</b> say “about a third”, not “32.7 percent”. Put the exact number on screen if it matters.</li>
  <li><b>No parentheses, no long lists.</b> Three items maximum in a spoken list.</li>
  <li><b>Don't narrate the screen.</b> If the viewer can see “Step 2: install”, say <em>why</em>, not “step two, install.”</li>
</ul>
<p><b>Read it out loud.</b> Every place you stumble or run out of breath is a sentence to rewrite. TTS voices stumble at exactly the same places.</p>

<h2>Timing: words per minute</h2>
<p>Conversational narration runs at about <b>130–160 words per minute</b>. Plan with <b>~140 wpm</b> for teaching content (slower for dense material or non-native audiences) and leave a little silence for visuals to land.</p>
<table class="data">
  <thead><tr><th scope="col">Target length</th><th scope="col">Words at ~140 wpm</th></tr></thead>
  <tbody>
    <tr><td>30 seconds</td><td>~70</td></tr>
    <tr><td>1 minute</td><td>~140</td></tr>
    <tr><td>3 minutes</td><td>~420</td></tr>
    <tr><td>5 minutes</td><td>~700</td></tr>
  </tbody>
</table>

<h2>Use a two-column script</h2>
<p>Write what's <b>said</b> on the left and what's <b>shown</b> on the right. It forces you to think visually, and it's the perfect format to hand to Claude for building scenes.</p>
<table class="data">
  <thead><tr><th scope="col">Narration</th><th scope="col">On screen</th></tr></thead>
  <tbody>
    <tr><td>Your code works. It's just slow.</td><td>Terminal: a progress bar crawling. Timer: 12.4 s.</td></tr>
    <tr><td>The culprit is one line.</td><td>Zoom into the loop; one line highlighted red.</td></tr>
    <tr><td>Swap the list for a set, and lookups become instant.</td><td>Line morphs <code>list</code> → <code>set</code>. Timer drops to 0.3 s.</td></tr>
  </tbody>
</table>

<h2>Try it: the script timer</h2>
<p>Paste your script below. It estimates the narration length at your speaking rate and breaks it down per sentence, so you can spot the one 40-word sentence that needs splitting.</p>
`,
      checklist: [
        "The first sentence works as a hook on its own.",
        "Every body point has a concrete example and a planned visual.",
        "I read it out loud and rewrote every sentence I stumbled on.",
        "No sentence over ~25 words; most are around 15.",
        "The word count fits the target length at ~140 wpm.",
        "The ending pays off the hook."
      ],
      mistakes: [
        "Opening with “Hi, in this video…” or a 10-second logo intro.",
        "Writing an essay and having the voice read it. Written style sounds stiff when spoken.",
        "Narrating exactly what's on screen word for word.",
        "Packing in every detail. If it's on screen and in the voice and in a caption, it's three times as slow.",
        "Leaving no silence: visuals need a beat to land."
      ]
    },
    {
      id: "storyboard",
      title: "Storyboarding",
      minutes: 5,
      summary: "Sketch every beat before you build it. A storyboard catches the boring parts while they're still free to fix.",
      body: `
<p>A storyboard is your video as a comic strip: one small frame per <b>beat</b> (a new idea or a new visual), with the line of narration under it. It doesn't need to be pretty. Stick figures and boxes are fine. What matters is that you decide <em>what is on screen at every moment</em> before anyone writes animation code.</p>

<h2>What goes in each frame</h2>
<ul>
  <li><b>What's visible</b>: the main element, text on screen, where things sit.</li>
  <li><b>What moves</b>: “arrow draws from A to B”, “bar grows”, “cut to code”.</li>
  <li><b>What's said</b>: the narration line(s) for this beat.</li>
  <li><b>Duration</b>: from the script timer, roughly.</li>
</ul>

<h2>A text storyboard Claude can build from</h2>
<p>You can skip drawing entirely and write a table. Claude can turn this directly into scene code, one scene per row:</p>
<table class="data">
  <thead><tr><th scope="col">#</th><th scope="col">Time</th><th scope="col">Narration</th><th scope="col">Visual &amp; motion</th></tr></thead>
  <tbody>
    <tr><td>1</td><td>0:00–0:05</td><td>“Your code works. It's just slow.”</td><td>Terminal, progress bar crawls; timer counts up in red.</td></tr>
    <tr><td>2</td><td>0:05–0:12</td><td>“Let's find out why, in one line.”</td><td>Camera pushes in on the code; all lines dim except one loop.</td></tr>
    <tr><td>3</td><td>0:12–0:24</td><td>“Checking <i>in</i> on a list looks at every item…”</td><td>List of 8 boxes; a pointer scans them one by one (stagger 80 ms).</td></tr>
    <tr><td>4</td><td>0:24–0:34</td><td>“…a set jumps straight to the answer.”</td><td>Boxes rearrange into buckets; pointer jumps directly. Timer turns green.</td></tr>
  </tbody>
</table>

<h2>Change the picture when the idea changes</h2>
<p>A good default is <b>one beat per new idea</b>, usually every few seconds. If a frame sits unchanged for 15 seconds while the voice explains, add a step: highlight, zoom, build the diagram piece by piece.</p>

<h2>Build a visual language</h2>
<p>Decide early what things <em>look like</em> and keep it consistent: inputs are always blue boxes, the “bad” path is always red, time always flows left to right. Viewers learn your language in the first minute and then understand later scenes faster.</p>

<h2>Make an animatic</h2>
<p>An <b>animatic</b> is your storyboard frames timed to the narration: a rough cut made of stills. Ask Claude to render one still per scene and join them with the narration audio using ffmpeg. Watch it once. You'll immediately feel which parts drag and which rush, before any animation work.</p>
<pre class="codeblock"><code>ffmpeg -f concat -safe 0 -i frames.txt -i narration.mp3 -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest animatic.mp4</code></pre>
<p class="small muted">(<code>frames.txt</code> lists each still with a <code>duration</code> line; Claude can generate it from the storyboard table.)</p>
`,
      checklist: [
        "Every narration line has a planned visual.",
        "No frame sits unchanged for more than ~10–15 seconds without a reason.",
        "I defined a small visual language (colors / shapes / directions).",
        "I watched an animatic (stills + narration) before animating."
      ],
      mistakes: [
        "Skipping the storyboard and discovering pacing problems after a long render.",
        "Visuals that only decorate (stock-ish shapes floating around) instead of explaining.",
        "Changing styles between scenes, so the video feels stitched together.",
        "Planning more on-screen text than anyone can read in the time."
      ]
    },
    {
      id: "visual-design",
      title: "Visual design",
      minutes: 6,
      summary: "Big type, strong contrast, one accent color, one idea per frame. Design for a phone screen and a 3-second glance.",
      body: `
<p>Viewers can't pause to study your frame (most won't). Every frame must be readable at a glance, on a small screen, while the voice keeps talking. That's a stricter standard than slides or web pages.</p>

<h2>One idea per frame</h2>
<p>Each frame should have one obvious focal point. If you show a headline, a diagram, three bullets and a logo, the eye doesn't know where to start, and by the time it decides, the narration has moved on. Put details in the voice, not on screen. Try the <a href="#/playground/hierarchy">before/after hierarchy demo</a>.</p>

<h2>Type size</h2>
<ul>
  <li>Think in pixels of a <b>1920×1080</b> frame. Body text should be at least about <b>40–50 px</b>; headlines <b>80–140 px</b>.</li>
  <li>Code on screen: around <b>32–40 px</b>, which fits roughly 15–20 lines. Show less code, bigger.</li>
  <li>Test: watch a still on your phone at arm's length. If you squint, it's too small.</li>
</ul>

<h2>Fonts</h2>
<ul>
  <li>One or two families: a clean sans-serif for text and a monospace for code.</li>
  <li>Use weight for hierarchy (regular vs bold), not five different sizes.</li>
  <li>Avoid thin/light weights: video compression and small screens eat them.</li>
</ul>

<h2>Contrast</h2>
<p>Aim for a contrast ratio of at least <b>4.5:1</b> between text and background (the WCAG level for normal text); large bold titles can go a bit lower but don't push it. Never put text straight onto a busy image or video: add a dark scrim, a solid box or an outline.</p>

<h2>Color</h2>
<ul>
  <li>Build a tiny palette: a background, a text color, and <b>one or two accents</b>.</li>
  <li>Use color to <b>mean</b> something, consistently: the accent marks “the thing to look at”, red is “bad path”, etc.</li>
  <li>Don't rely on red vs green alone: about 1 in 12 men has some color-vision deficiency. Add a label, shape or position difference.</li>
  <li>Dark backgrounds are popular for explainers (less glare, colors pop), but a light theme is fine if it's consistent.</li>
</ul>

<h2>Layout</h2>
<ul>
  <li>Use generous margins and keep important content inside the <b>90% title-safe area</b>.</li>
  <li>Align things to a few invisible lines. Random positions look accidental.</li>
  <li>White space is not wasted space: it groups and calms.</li>
  <li>Plan the format first: 16:9, 1:1 and 9:16 need different layouts (see <a href="#/playground/safe-areas">safe areas</a>).</li>
</ul>

<div class="callout"><p><b>With Claude:</b> ask it to create a single <code>theme</code> file (colors, fonts, sizes, durations) that every scene imports. Changing the accent color then means one edit, not twenty.</p></div>
`,
      checklist: [
        "Every frame has one obvious focal point.",
        "Body text ≥ ~40 px and code ≥ ~32 px at 1080p; checked on a phone.",
        "Text contrast ≥ 4.5:1; no text directly on busy backgrounds.",
        "Palette: one background, one text color, one or two accents, used consistently.",
        "Important content sits inside the title-safe area for every target format.",
        "Shared theme file for colors, fonts and sizes."
      ],
      mistakes: [
        "Slides pasted into a video: tiny text, six bullets, read aloud word for word.",
        "Rainbow colors with no meaning.",
        "Thin fonts that turn to mush after YouTube compression.",
        "Red/green as the only difference between two things."
      ]
    },
    {
      id: "motion",
      title: "Motion & pacing",
      minutes: 6,
      summary: "Change something every few seconds, but give text time to be read. Motion should explain, not decorate.",
      body: `
<p>Pacing is the hardest skill and the one that most separates amateur from professional videos. Too slow and people leave; too fast and they're lost. The fix is rarely “more animation”. It's <b>the right change at the right moment</b>.</p>

<h2>Keep the picture alive</h2>
<p>In explainers, something on screen should usually change every <b>few seconds</b> (roughly every 3–8 s; faster in social shorts). A change can be small: a highlight, a new label, a zoom, a cut to a new angle. A frame that's static for 15+ seconds while the voice explains feels like a stalled video.</p>

<h2>But give text time</h2>
<p>A viewer must read text <em>while</em> listening. Rule of thumb: keep on-screen text up for at least <b>~1 second plus ~0.3 s per word</b>, or long enough to read it twice slowly. A 10-word sentence needs about 4 seconds. If that feels too long, there's too much text.</p>

<h2>Motion must have a job</h2>
<ul>
  <li><b>Direct attention</b>: the thing that moves is the thing to look at.</li>
  <li><b>Show change or relationships</b>: morphing an equation, data flowing from A to B, a list being sorted.</li>
  <li><b>Connect scenes</b>: carrying an element from one scene into the next.</li>
</ul>
<p>Floating shapes, constant wiggles and spinning logos compete with your content. If you can't say what an animation explains, delete it.</p>

<h2>Timing and easing</h2>
<ul>
  <li>Use <b>ease-out</b> for things entering and <b>ease-in</b> for exits. Linear motion looks mechanical. See the <a href="#/playground/easing">easing demo</a>.</li>
  <li>Use a small set of standard durations, e.g. 0.4 s for small moves and 0.8 s for big ones, everywhere.</li>
  <li>Stagger groups with 40–120 ms delays (<a href="#/playground/stagger">stagger demo</a>).</li>
</ul>

<h2>Sync to the voice</h2>
<p>Visuals should land <b>when the word is said</b>, or a hair (~0.1–0.2 s) before. Never after: late visuals feel like a mistake. That's why the workflow on this site generates <b>word timestamps</b> with the narration; Claude uses them to place every animation.</p>

<h2>Rhythm</h2>
<ul>
  <li>Vary the pace: fast for familiar steps, slow for the key insight.</li>
  <li>After the most important sentence, <b>pause</b>: half a second to a second of silence while the visual holds.</li>
  <li>Cut on natural boundaries: the end of a sentence, or on movement.</li>
</ul>

<div class="callout warn"><p><b>Test:</b> watch your full render at normal speed without stopping. Note every moment your attention drifts, with the timestamp. If you get bored watching your own video, your viewers left earlier.</p></div>
`,
      checklist: [
        "Something changes on screen every few seconds.",
        "Every text block stays up long enough to read twice.",
        "Every animation has a job (attention, change, or connection).",
        "Animations land on (or just before) the matching word.",
        "Consistent durations and easing across scenes.",
        "I watched the whole thing in one go and noted where I got bored."
      ],
      mistakes: [
        "Linear easing everywhere: robotic motion.",
        "Visuals that appear a second after the narrator mentions them.",
        "Constant motion in the background that fights the content.",
        "Text that disappears before it can be read."
      ]
    },
    {
      id: "narration",
      title: "Narration: TTS and your own voice",
      minutes: 7,
      summary: "Punctuation is your remote control for TTS. Spell tricky words phonetically, render per scene, and listen to every line.",
      body: `
<p>The voice carries most of the information in an explainer. A clear, well-paced voice with simple visuals beats gorgeous visuals with a muddy voice. You can use a TTS engine (see <a href="#/voices">Voices</a>) or record yourself; both work.</p>

<h2>Getting good results from TTS</h2>
<h3>Punctuation controls rhythm</h3>
<ul>
  <li>Commas give short pauses; periods give longer ones. Break long sentences into two.</li>
  <li>Want a dramatic beat? End the sentence. “The answer is simple. Use a set.” works better than one long sentence.</li>
  <li>Dashes, ellipses and colons behave differently per engine. Test them, or use explicit pauses (below).</li>
</ul>

<h3>Spell for the ear</h3>
<p>TTS reads what's written, not what you mean. Keep a <b>pronunciation sheet</b> for your project and spell tricky words the way they sound:</p>
<table class="data">
  <thead><tr><th scope="col">Written</th><th scope="col">Write it as</th></tr></thead>
  <tbody>
    <tr><td>SQL</td><td>“sequel” or “S Q L” (pick one, stay consistent)</td></tr>
    <tr><td>O(n log n)</td><td>“O of n log n”</td></tr>
    <tr><td>2^10</td><td>“two to the power of ten”</td></tr>
    <tr><td>NumPy</td><td>“Num-pie”</td></tr>
    <tr><td>Dijkstra</td><td>“Dike-struh”</td></tr>
    <tr><td>v2.1.3</td><td>“version two point one” (or just “the latest version”)</td></tr>
    <tr><td>e.g. / i.e.</td><td>“for example” / “that is”</td></tr>
  </tbody>
</table>
<p>Keep the <b>on-screen text and captions</b> in normal spelling. Only the text sent to the TTS engine gets the phonetic version. Claude can maintain both automatically.</p>

<h3>Speed and pauses</h3>
<ul>
  <li>Most engines have a rate setting (e.g. edge-tts <code>--rate=-5%</code>, Kokoro <code>speed=0.95</code>). For teaching, slightly slower than default usually sounds better.</li>
  <li>Engines that support <b>SSML</b> (most cloud services) accept tags like <code>&lt;break time="400ms"/&gt;</code>, <code>&lt;prosody rate="90%"&gt;</code> and phoneme hints. Many local engines ignore SSML; then insert silence between clips with ffmpeg instead.</li>
</ul>

<h3>Render one clip per scene</h3>
<p>Generate a separate audio file per sentence or scene (<code>scene-03.mp3</code>). Fixing one mispronounced word then means re-rendering one short clip, and each scene can sync to its own clip. Keep the same voice and settings for the whole video.</p>

<h3>Listen to every line</h3>
<p>Claude can't hear audio. It can transcribe the generated audio with Whisper to catch skipped or repeated words, but only <b>you</b> can judge stress, emotion and odd artifacts. Listen once with headphones, note line numbers, and send them back.</p>

<h3>Licenses and ethics</h3>
<ul>
  <li>Check the model and voice license before publishing; some are non-commercial only.</li>
  <li>Only clone a voice with the owner's clear permission.</li>
  <li>Some platforms (YouTube, for example) ask you to disclose realistic synthetic or altered content. When in doubt, say the narration is AI-generated.</li>
</ul>

<h2>Recording your own voice</h2>
<ul>
  <li><b>Room:</b> small and soft beats big and bare. A room with a bed, curtains, or a closet full of clothes. Turn off fans and AC.</li>
  <li><b>Mic:</b> a USB mic, a headset, or even a phone close to your mouth beats a laptop mic across the desk. About a hand-span (10–20 cm) away, slightly to the side to avoid popping “p” and “b” sounds.</li>
  <li><b>Levels:</b> loud parts peaking around -12 to -6 dBFS; never touching 0 (clipping can't be fixed).</li>
  <li><b>Room tone:</b> record 10 seconds of silence first; it helps noise reduction later.</li>
  <li><b>Delivery:</b> stand if you can, drink water, smile slightly (you can hear it). If you stumble, pause and re-read the whole sentence: easy to cut.</li>
  <li><b>Clean-up:</b> cut mistakes and long breaths, apply light noise reduction, a high-pass around 80 Hz, gentle compression, then loudness-normalize (next chapter). Claude can do all of this with ffmpeg; you listen to the result.</li>
</ul>
`,
      checklist: [
        "Text sent to TTS uses phonetic spellings; on-screen text doesn't.",
        "Long sentences are split; pauses are where I want them.",
        "One audio clip per scene, same voice and settings throughout.",
        "I listened to every line with headphones and noted fixes by line number.",
        "License allows my use; voice cloning only with permission.",
        "(Own voice) Recorded in a quiet, soft room with peaks around -12 to -6 dBFS."
      ],
      mistakes: [
        "One giant TTS file for the whole script: impossible to fix one word.",
        "Acronyms and numbers read wrong (“S-Q-L” in one scene, “sequel” in the next).",
        "Trusting the narration without listening (Claude can't hear it).",
        "Recording with the laptop mic in an echoey room."
      ]
    },
    {
      id: "audio",
      title: "Audio: loudness, music, SFX",
      minutes: 6,
      summary: "Viewers forgive average visuals but not bad sound. Normalize to about -14 LUFS, duck the music under the voice, use SFX sparingly.",
      body: `
<p>Bad audio is the fastest way to lose viewers. Good audio isn't about expensive gear; it's about a clean voice, sensible levels, and music that stays out of the way.</p>

<h2>Loudness: LUFS in one paragraph</h2>
<p>Streaming platforms measure loudness in <b>LUFS</b> (loudness units relative to full scale) and turn loud videos down to a common level. YouTube normalizes playback to roughly <b>-14 LUFS</b> integrated; Spotify uses about -14 too; Apple Podcasts recommends about -16. Practical targets:</p>
<table class="data">
  <thead><tr><th scope="col">Where</th><th scope="col">Integrated loudness</th><th scope="col">True peak</th></tr></thead>
  <tbody>
    <tr><td>YouTube, social video</td><td>about -14 LUFS</td><td>≤ -1 dBTP</td></tr>
    <tr><td>Podcasts, voice-only</td><td>about -16 LUFS</td><td>≤ -1 dBTP</td></tr>
    <tr><td>Class presentation / projector</td><td>-16 to -14 LUFS</td><td>≤ -1 dBTP</td></tr>
  </tbody>
</table>
<p>Mastering much louder doesn't help: the platform just turns it down, and it sounds squashed. Much quieter, and viewers turn your video up and then get blasted by the next one.</p>
<pre class="codeblock"><code># measure, then normalize (single pass, close enough for most videos)
ffmpeg -i mix.wav -af loudnorm=I=-14:TP=-1:LRA=11 -ar 48000 mix_norm.wav</code></pre>
<p class="small muted">For exact results use two-pass loudnorm: run once with <code>print_format=json</code>, then feed the measured values into a second pass. Claude can script this.</p>

<h2>Music under narration</h2>
<ul>
  <li>Use <b>instrumental</b> music under speech. Lyrics compete with the voice.</li>
  <li>While someone talks, music should sit well below the voice, roughly <b>15–25 dB lower</b>. It should be felt more than heard.</li>
  <li><b>Ducking</b>: lower the music automatically while the voice plays, and let it come up in pauses and intros.</li>
  <li>Match energy to content: calm, steady tracks for explanations; save the dramatic ones for trailers.</li>
  <li><b>License:</b> use music you're allowed to use (e.g. the YouTube Audio Library or tracks with a clear free license) and give credit if required. Copyrighted songs can get your video muted or blocked.</li>
</ul>
<pre class="codeblock"><code># duck music under the voice with a sidechain compressor
ffmpeg -i voice.wav -i music.mp3 -filter_complex \\
 "[1:a]volume=0.35[m];[m][0:a]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[duck];\\
  [duck][0:a]amix=inputs=2:duration=first:normalize=0[out]" \\
 -map "[out]" mix.wav</code></pre>

<h2>Sound effects</h2>
<ul>
  <li>A soft whoosh on a transition, a click when an element pops in, a “ding” on the answer: small SFX make motion feel physical.</li>
  <li>Keep them quiet and short, and don't put one on every animation.</li>
  <li>Never let an effect cover a word of narration.</li>
</ul>

<h2>Check on real speakers</h2>
<p>Listen to the final mix on <b>phone speakers</b> (where bass disappears and harsh frequencies stick out) and on <b>headphones</b> (where noise and clicks become obvious). If the voice is clear on both, you're done.</p>

<div class="callout"><p><b>With Claude:</b> it can mix, duck, normalize and measure loudness with ffmpeg and report the numbers (e.g. <code>ebur128</code> output). It can't tell you if the music <em>feels</em> right. That's your ear.</p></div>
`,
      checklist: [
        "Final mix measured: about -14 LUFS integrated (or -16 for voice-only), true peak ≤ -1 dBTP.",
        "Music is instrumental, licensed, and ducked well under the voice.",
        "SFX are subtle and never cover narration.",
        "Checked on phone speakers and on headphones.",
        "No clipping, clicks, or sudden volume jumps between scenes."
      ],
      mistakes: [
        "Music as loud as the voice.",
        "Different loudness per scene, because clips were never normalized together.",
        "Using a popular song and getting the video muted or blocked.",
        "Mastering at -6 LUFS “to be loud” (platforms turn it down anyway, and it sounds crushed)."
      ]
    },
    {
      id: "captions",
      title: "Captions & accessibility",
      minutes: 5,
      summary: "Many people watch muted. Captions, contrast, no flashing, and describing what matters make your video work for everyone.",
      body: `
<p>Captions aren't an extra. Lots of people watch with the sound off (on a bus, in a library, late at night), and captions are essential for Deaf and hard-of-hearing viewers and a big help to non-native speakers. They also make your video searchable.</p>

<h2>Closed vs open captions</h2>
<ul>
  <li><b>Closed captions</b> are a separate file (<code>.srt</code> or <code>.vtt</code>) the viewer can turn on or off. Best for YouTube and course platforms.</li>
  <li><b>Open (burned-in) captions</b> are part of the picture. Best for social shorts, where auto-captions are hit-and-miss and big stylized captions are part of the look.</li>
</ul>

<h2>Making them with Claude</h2>
<p>Claude can run <b>Whisper</b> (or faster-whisper) on your narration to get an SRT with timestamps. Since you already have the script, ask it to correct the transcript against the script, especially names and technical terms. If the TTS engine returns word timestamps, captions can be built straight from those.</p>
<pre class="codeblock"><code>1
00:00:00,000 --> 00:00:02,400
Every great video starts
with one clear idea.

2
00:00:02,400 --> 00:00:05,100
Keep it short, and show
instead of tell.</code></pre>

<h2>Style rules</h2>
<ul>
  <li>Maximum <b>2 lines</b>, about <b>32–42 characters</b> per line.</li>
  <li>Break lines at natural phrase boundaries, not in the middle of “the | algorithm”.</li>
  <li>Reading speed under roughly <b>17–20 characters per second</b>; each caption on screen for at least ~1 second and not more than ~6–7 seconds.</li>
  <li>High contrast: white text with an outline, shadow or semi-transparent box (try the <a href="#/playground/captions">caption demo</a>).</li>
  <li>Keep them in the bottom area, inside the safe zone; on vertical video, above the app's own caption area.</li>
</ul>
<pre class="codeblock"><code># burn captions into the video
ffmpeg -i video.mp4 -vf "subtitles=captions.srt:force_style='FontName=Arial,FontSize=22,Bold=1,Outline=2,MarginV=40'" -c:a copy video_captioned.mp4</code></pre>

<h2>Beyond captions</h2>
<ul>
  <li><b>Describe what matters.</b> If the key point is only visual (“as you can see here”), blind and low-vision viewers miss it. Say what the chart shows.</li>
  <li><b>No rapid flashing.</b> Avoid anything that flashes more than 3 times per second; it can trigger seizures (WCAG 2.3.1).</li>
  <li><b>Don't rely on color alone</b> to tell things apart.</li>
  <li><b>Contrast and size</b> for all on-screen text, not only captions.</li>
  <li><b>Offer a transcript</b> in the description or alongside the video. Claude can generate it from the script.</li>
</ul>
`,
      checklist: [
        "Captions exist: SRT/VTT uploaded, or burned in for social.",
        "Proofread against the script: names, numbers and terms are right.",
        "Max 2 lines, ~42 characters per line, readable speed.",
        "Readable on any background (outline, shadow or box).",
        "Important visuals are also described in the narration.",
        "Nothing flashes more than 3 times per second."
      ],
      mistakes: [
        "Relying on auto-captions without proofreading (“python” becomes “pie thon”).",
        "Three-line captions in thin white text on a bright background.",
        "Captions hidden behind the app's buttons on vertical video.",
        "“As you can see here…” with no description."
      ]
    },
    {
      id: "formats",
      title: "Formats & lengths per platform",
      minutes: 5,
      summary: "16:9 for YouTube and class, 9:16 for shorts. Check current limits on the platform: they change often.",
      body: `
<p>Decide the platform before you design, because the aspect ratio changes the layout of every frame. Limits below are <b>approximate and change often</b>; always check the platform's current help page before you publish.</p>

<table class="data">
  <thead><tr><th scope="col">Platform</th><th scope="col">Aspect &amp; size</th><th scope="col">Length</th><th scope="col">Notes</th></tr></thead>
  <tbody>
    <tr><td>YouTube</td><td>16:9, 1920×1080 (or 4K)</td><td>Long is fine; explainers often 3–10 min</td><td>Unverified accounts are limited to 15 min uploads. Upload an SRT. Thumbnail 1280×720.</td></tr>
    <tr><td>YouTube Shorts</td><td>9:16 (or 1:1), 1080×1920</td><td>Up to about 3 min</td><td>Hook in the first second or two. Big captions.</td></tr>
    <tr><td>TikTok</td><td>9:16, 1080×1920</td><td>Often 15–60 s works best; uploads can be much longer</td><td>Keep text away from the bottom and right UI.</td></tr>
    <tr><td>Instagram Reels</td><td>9:16, 1080×1920</td><td>Up to a few minutes</td><td>Feed posts look best at 4:5 (1080×1350).</td></tr>
    <tr><td>LinkedIn</td><td>16:9, 1:1 or 4:5</td><td>30 s – 2 min works well</td><td>Many watch muted at work: burn in captions.</td></tr>
    <tr><td>Class presentation</td><td>16:9, 1920×1080</td><td>Exactly the assignment's limit (aim slightly under)</td><td>Bring an offline copy. Test on the actual projector and speakers.</td></tr>
  </tbody>
</table>

<h2>Length: as short as the idea allows</h2>
<p>There's no magic length. A video should end when the idea is delivered. Shorter is usually better for a single concept; tutorials that the viewer follows along with can be long, because the viewer is <em>doing</em> something.</p>

<h2>Export settings that play everywhere</h2>
<ul>
  <li><b>MP4</b> container, <b>H.264</b> video, <b>AAC</b> audio.</li>
  <li>Pixel format <b>yuv420p</b> (some players can't play anything else).</li>
  <li><b>30 fps</b> is a safe default for animation; 60 fps for fast motion or screen recordings with scrolling. Don't mix frame rates in one project.</li>
  <li><code>-movflags +faststart</code> so web players start before the whole file downloads.</li>
</ul>
<pre class="codeblock"><code>ffmpeg -i master.mov -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p \\
  -c:a aac -b:a 192k -movflags +faststart final.mp4</code></pre>

<h2>One video, several formats</h2>
<p>Don't just crop 16:9 into 9:16: titles and labels fall off the edges (try it in the <a href="#/playground/safe-areas">safe areas demo</a>). Instead, ask Claude to build the scenes from layout variables so it can render each format with its own layout.</p>
`,
      checklist: [
        "Aspect ratio chosen before designing.",
        "Checked the platform's current length and size limits.",
        "Exported MP4 / H.264 / AAC / yuv420p with +faststart.",
        "(Class) Under the time limit, tested on the real projector, offline copy ready.",
        "(Multi-format) Each format has its own layout, not a crop."
      ],
      mistakes: [
        "A 16:9 video posted as a Short with tiny letterboxed content.",
        "Going over a class time limit “by just a minute”.",
        "Exporting in an exotic codec that won't play on the classroom PC.",
        "Assuming last year's platform limits still apply."
      ]
    },
    {
      id: "checklist",
      title: "Pre-publish checklist",
      minutes: 3,
      summary: "Tick every box before you hit publish. Your progress is saved in this browser.",
      body: `
<p>Go through this with the <b>final render</b>, start to finish, ideally on a different device than the one you edited on. Your ticks are saved in this browser, so you can come back.</p>
`,
      interactive: [
        { group: "Story", items: [
          "The first 5 seconds give a reason to keep watching.",
          "The video delivers the one idea from the one-sentence test.",
          "Nothing in it could be cut without losing the idea.",
          "The ending pays off the hook, then stops."
        ] },
        { group: "Visuals", items: [
          "All text is readable on a phone at arm's length.",
          "Every frame has one clear focal point.",
          "Nothing important sits outside the safe area (or under platform UI).",
          "Animations land on or just before the matching words.",
          "No typos on screen (read every text frame once more)."
        ] },
        { group: "Audio", items: [
          "Every word of narration is clear and correctly pronounced.",
          "Loudness about -14 LUFS (or the target for your platform), no clipping.",
          "Music is licensed, instrumental, and well below the voice.",
          "Checked on phone speakers and on headphones."
        ] },
        { group: "Captions & accessibility", items: [
          "Captions proofread against the script.",
          "Max 2 lines, readable speed, good contrast.",
          "Key visuals described in the narration.",
          "No flashing more than 3 times per second."
        ] },
        { group: "Export & publish", items: [
          "MP4 (H.264 + AAC), correct resolution and aspect ratio.",
          "Played the exported file itself, start to end.",
          "Title and thumbnail match what the video actually delivers.",
          "Credits for music, voices or assets that require them.",
          "AI-generated voice or content disclosed where the platform requires it."
        ] }
      ]
    }
  ]
};

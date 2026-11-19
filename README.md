# Video Making Guide

A static website for students who want to learn **how to make good videos**, and **how to make them with Claude Code**: free TTS voices you can compare side by side, code-driven animation tools with real demo renders, an interactive animation-principles playground, and a practical collaboration workflow.

Live (GitHub Pages): https://avielraz123.github.io/video-making-guide/

## Pages

| Route | What's there |
|---|---|
| `#/` | Overview, the 4-step pipeline, "pick your stack" recommendations |
| `#/guide`, `#/guide/<chapter>` | 10 chapters on making good videos, a script timer, a pre-publish checklist |
| `#/voices` | TTS engines, sample players with filters, blind compare mode |
| `#/best-voices` | Where to hear today's top (paid) voices, and how to judge a voice |
| `#/animations`, `#/animations/<tool>` | Animation tools, demo videos, source-code viewer |
| `#/playground`, `#/playground/<demo>` | Live demos: easing, stagger, kinetic type, transitions, safe areas, captions, hierarchy |
| `#/claude` | Step-by-step workflow with Claude, example prompts, project layout, tips |

## Run it locally

No build step. Either:

- **Open `index.html`** in a browser. Everything works, except the source-code viewer on the Animations pages: browsers block `fetch()` from `file://`, so it links to the file on GitHub instead.
- **Or serve the folder** (recommended, also shows source code inline):
  ```bash
  python -m http.server 8000
  # then open http://localhost:8000/
  ```

## Project layout

```
index.html            app shell (header, nav, script tags)
css/style.css         all styles, light + dark theme tokens
js/core.js            DOM helpers, storage, copy button, one-at-a-time media manager
js/highlight.js       small hand-written syntax highlighter
js/app.js             hash router, theme toggle, mobile menu
js/page-*.js          one file per page
js/demos/*.js         playground demos (motion-lib.js = shared easing + tween helpers)
js/data/guide.js      guide chapters (content)
js/data/workflow.js   "Working with Claude" content
js/data/best-voices.js  "Best AI voices" content
js/data/voices.js     TTS engines + samples      (generated, see below)
js/data/animations.js animation tools + demos    (hand-written by the animations build)
media/audio, media/video   sample MP3s, demo MP4s + posters
demo-src/             the code that produced every sample and demo
docs/CONTRACT.md      data schemas for voices.js / animations.js
tests/                smoke test + fixtures
```

## Regenerating samples and demos

Everything in `media/` is reproducible from `demo-src/`:

- **Voices:** scripts in `demo-src/voices/` (`make_kokoro.py`, `make_edge.py`, `make_piper.py`, ...). After generating, run `python demo-src/voices/build_voices_js.py` to rebuild `js/data/voices.js`. Don't edit `voices.js` by hand.
- **Animations:** each tool has its own folder (`demo-src/manim/`, `demo-src/remotion/`, `demo-src/motion-canvas/`, `demo-src/ffmpeg/`, `demo-src/canvas/`). The exact command used for each demo is in its `renderCmd` field in `js/data/animations.js`.
- Media budget (bitrate, sizes, loudness) is in `docs/CONTRACT.md`. Keep `node_modules/`, venvs, models and render output out of git (see `.gitignore`).

## Tests

`tests/smoke.html` loads the app, visits every route, clicks through filters, compare mode, the script timer, checklist and every playground demo, and prints PASS/FAIL into the page.

```bash
# headless Edge (Chrome works the same way)
msedge --headless --disable-gpu --allow-file-access-from-files --virtual-time-budget=60000 \
  --dump-dom "file:///<path>/tests/smoke.html?data=fixture"
```

Options: `?data=fixture` (fake data in `tests/fixtures/`), `?data=real` (the real data files), `?data=none` (no voice/animation data, checks the "coming soon" states). Serve over http to also test the source viewer's fetch. `?view=%23%2Fvoices` renders one route without running tests (handy for screenshots).

If you add a script to `index.html`, add it to the list in `tests/smoke.html` too.

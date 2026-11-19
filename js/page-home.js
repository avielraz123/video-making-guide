/* page-home.js */
(function () {
  "use strict";
  var VG = window.VG, ui = VG.ui, h = ui.h;

  function hasTool(id) { return (VG.animTools || []).some(function (t) { return t.id === id; }); }
  function hasEngine(id) { return (VG.engines || []).some(function (e) { return e.id === id; }); }
  function toolLink(id, label) { return h("a", { href: hasTool(id) ? "#/animations/" + id : "#/animations" }, label); }
  function engineLink(id, label) { return h("a", { href: hasEngine(id) ? "#/voices?engine=" + encodeURIComponent(id) : "#/voices" }, label); }

  var PIPELINE = [
    { n: "01", title: "Script", who: "You decide, Claude drafts", text: "One idea, one audience. Write for the ear: short sentences, a hook in the first 5 seconds, ~140 words per minute.", tools: "Markdown, the script timer", link: "#/guide/script", linkText: "Writing the script" },
    { n: "02", title: "Narration", who: "Claude runs it, you listen", text: "Turn the script into audio with a TTS voice (or record yourself). Get word timestamps so visuals can sync to the voice.", tools: "Kokoro, edge-tts, Piper, Whisper", link: "#/voices", linkText: "Compare voices" },
    { n: "03", title: "Animation", who: "Claude writes the code", text: "Build scenes in code, timed to the narration. Check single still frames first: they're cheap to render and easy to judge.", tools: "Manim, Remotion, Motion Canvas", link: "#/animations", linkText: "Animation tools" },
    { n: "04", title: "Render & review", who: "You watch, Claude fixes", text: "Render, mix audio, add captions. Then you watch the whole thing and write timestamped notes. Repeat until it flows.", tools: "ffmpeg, captions (SRT), notes", link: "#/claude", linkText: "The workflow" }
  ];

  function heroViz() {
    return h("div", { class: "timeline-viz", role: "img", "aria-label": "Illustration of a video editor timeline: a preview screen showing a title and caption, and four tracks for video, narration, music and captions with a playhead moving across." },
      h("div", { class: "tv-top", "aria-hidden": "true" }, h("span", { class: "tv-rec", text: "REC" }), h("span", { text: "00:00:12:04" })),
      h("div", { class: "tv-screen", "aria-hidden": "true" },
        h("span", { class: "tv-shape", style: { width: "28%", "aspect-ratio": "1", left: "-6%", top: "-12%", background: "radial-gradient(circle, rgba(255,94,82,.55), transparent 70%)" } }),
        h("span", { class: "tv-shape", style: { width: "34%", "aspect-ratio": "1", right: "-8%", bottom: "-20%", background: "radial-gradient(circle, rgba(52,209,191,.45), transparent 70%)" } }),
        h("div", { class: "tv-title", html: "One idea.<br><span>Clearly shown.</span>" }),
        h("div", { class: "tv-cap", text: "Every great video starts with one clear idea." })
      ),
      h("div", { class: "tv-tracks", "aria-hidden": "true" },
        track("V1", [{ l: 2, w: 30, c: "#a891ff", t: "intro" }, { l: 33, w: 40, c: "#a891ff", t: "scene 2" }, { l: 74, w: 24, c: "#a891ff", t: "outro" }]),
        track("A1", [{ l: 4, w: 64, c: null, t: "" , wave: true }, { l: 70, w: 26, wave: true }]),
        track("A2", [{ l: 0, w: 100, c: "#f3b44a", t: "music (ducked)" }]),
        track("CC", [{ l: 4, w: 20, c: "#ecebe6", t: "Every great" }, { l: 26, w: 20, c: "#ecebe6", t: "video starts" }, { l: 48, w: 20, c: "#ecebe6", t: "with one" }, { l: 70, w: 26, c: "#ecebe6", t: "clear idea." }]),
        h("div", { class: "tv-playhead" })
      )
    );
    function track(name, clips) {
      var lane = h("div", { class: "lane" });
      clips.forEach(function (c) {
        lane.appendChild(h("span", { class: "tv-clip" + (c.wave ? " tv-wave" : ""), style: { left: c.l + "%", width: c.w + "%", background: c.wave ? null : c.c }, text: c.t || "" }));
      });
      return h("div", { class: "tv-track" }, h("span", { text: name }), lane);
    }
  }

  VG.pages.home = function () {
    var picks = [
      { s: "Math or CS explainer", r: ["Manim", "Kokoro"], why: "Manim animates equations, graphs and diagrams beautifully; Kokoro is a free local voice that sounds natural in English.", links: [toolLink("manim", "Manim"), engineLink("kokoro", "Kokoro")] },
      { s: "Hebrew (or Arabic, Persian) narration", r: ["edge-tts", "any animation tool"], why: "Microsoft's neural voices via edge-tts cover Hebrew (he-IL Hila / Avri) and many more languages, free with an internet connection.", links: [engineLink("edge-tts", "edge-tts"), h("a", { href: "#/guide/narration" }, "Narration tips")] },
      { s: "Social short (TikTok, Reels, Shorts)", r: ["Remotion 9:16", "big captions"], why: "Remotion is React for video: easy to template vertical videos with word-by-word captions from Whisper timestamps.", links: [toolLink("remotion", "Remotion"), h("a", { href: "#/playground/safe-areas" }, "Safe areas demo")] },
      { s: "Code walkthrough / dev explainer", r: ["Motion Canvas", "Kokoro"], why: "Motion Canvas has a code-block component that animates code changes line by line, driven by TypeScript.", links: [toolLink("motion-canvas", "Motion Canvas"), engineLink("kokoro", "Kokoro")] },
      { s: "Class presentation video", r: ["slides + your own voice", "ffmpeg"], why: "Your real voice builds trust with a class. Record per slide, then let Claude stitch slides and audio with ffmpeg.", links: [toolLink("ffmpeg", "ffmpeg"), h("a", { href: "#/guide/formats" }, "Formats & lengths")] },
      { s: "Want the best voice money can buy", r: ["a paid TTS", "short script"], why: "Paid engines win on emotion and long narration. Hear them first; for a calm 2-minute explainer, free is often enough.", links: [h("a", { href: "#/best-voices" }, "Best AI voices"), h("a", { href: "#/voices" }, "Free voices")] }
    ];

    var sections = [
      { href: "#/guide", icon: "🎬", title: "Making good videos", text: "Ten practical chapters: idea, script, storyboard, design, pacing, narration, audio, captions, formats and a pre-publish checklist." },
      { href: "#/voices", icon: "🎙️", title: "TTS voices", text: "Free and local text-to-speech engines with real samples of the same sentence, filters, and a blind compare mode." },
      { href: "#/best-voices", icon: "🏆", title: "Best AI voices", text: "Where to hear today's top paid voices, and a checklist for judging any voice with your own ears." },
      { href: "#/animations", icon: "🎨", title: "Animation tools", text: "Manim, Remotion, Motion Canvas and friends: what each is good at, real demo renders, and the code behind them." },
      { href: "#/playground", icon: "🧪", title: "Motion playground", text: "Interactive demos of easing, stagger, kinetic type, transitions, safe areas, captions and visual hierarchy." },
      { href: "#/claude", icon: "🤝", title: "Working with Claude", text: "The step-by-step workflow, what Claude can and can't do, copy-able prompts, and a project folder layout." }
    ];

    return h("div", { class: "page" },
      h("section", { class: "hero", "aria-labelledby": "hero-title" },
        h("div", null,
          h("div", { class: "timecode", text: "00:00 / Start here" }),
          h("h1", { id: "hero-title", tabindex: "-1", html: "Make videos people <em>actually finish</em>." }),
          h("p", { class: "lede", text: "A practical guide for students: what makes a video good (script, pacing, sound, captions), and how to build one together with Claude Code: free TTS voices, code-driven animation, and a review loop that works." }),
          h("div", { class: "row" },
            h("a", { class: "btn btn-primary", href: "#/guide" }, "Read the guide"),
            h("a", { class: "btn", href: "#/claude" }, "See the Claude workflow")
          )
        ),
        heroViz()
      ),

      h("section", { class: "section", "aria-labelledby": "pipe-title" },
        h("div", { class: "section-head" },
          h("h2", { id: "pipe-title", text: "The pipeline in 4 steps" }),
          h("p", { text: "Every video on this site follows the same path. Claude does a lot of the typing and rendering; you make the calls only a human can make." })
        ),
        h("ol", { class: "pipeline", style: { "list-style": "none", padding: "0" } },
          PIPELINE.map(function (s) {
            return h("li", { class: "pipe-step" },
              h("div", { class: "pipe-head" }, h("span", { class: "pipe-num", text: s.n }), h("span", { class: "pipe-line", "aria-hidden": "true" })),
              h("h3", { text: s.title }),
              h("div", { class: "who badge", text: s.who }),
              h("p", { text: s.text, style: { "margin-top": "8px" } }),
              h("div", { class: "tools", text: s.tools }),
              h("a", { href: s.link, class: "small", style: { "font-weight": "650" } }, s.linkText + " →")
            );
          })
        )
      ),

      h("section", { class: "section stack-picks", "aria-labelledby": "picks-title" },
        h("div", { class: "section-head" },
          h("h2", { id: "picks-title", text: "Pick your stack" }),
          h("p", { text: "Not sure where to begin? Start from what you're making." })
        ),
        h("div", { class: "grid" },
          picks.map(function (p) {
            return h("article", { class: "card stack-pick" },
              h("div", { class: "scenario", text: p.s }),
              h("div", { class: "recipe" }, p.r[0], h("span", { class: "plus", "aria-hidden": "true", text: "+" }), h("span", { class: "sr-only", text: " plus " }), p.r[1]),
              h("p", { text: p.why }),
              h("div", { class: "links" }, p.links)
            );
          })
        )
      ),

      h("section", { class: "section", "aria-labelledby": "sections-title" },
        h("div", { class: "section-head" }, h("h2", { id: "sections-title", text: "Explore" })),
        h("div", { class: "grid" },
          sections.map(function (s) {
            return h("a", { class: "card card-link section-card", href: s.href },
              h("div", { class: "sc-icon", "aria-hidden": "true", text: s.icon }),
              h("h3", { text: s.title }),
              h("p", { text: s.text }),
              h("span", { class: "go", text: "Open →" })
            );
          })
        )
      )
    );
  };
})();

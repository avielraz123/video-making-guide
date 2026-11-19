/* page-animations.js: tool overview + tool detail with demos and a source viewer. */
(function () {
  "use strict";
  var VG = window.VG, ui = VG.ui, h = ui.h;

  function tools() { return Array.isArray(VG.animTools) ? VG.animTools : []; }
  function toolById(id) { return tools().filter(function (t) { return t.id === id; })[0] || null; }

  function chips(items, neg) {
    if (!items || !items.length) return null;
    return h("ul", { class: "bf-list" + (neg ? " neg" : "") }, items.map(function (t) { return h("li", { text: t }); }));
  }

  function toolCard(t) {
    var n = (t.demos || []).length;
    var poster = n && t.demos[0].poster ? t.demos[0].poster : null;
    var thumb = poster ? h("img", { class: "tc-thumb", src: poster, alt: "", loading: "lazy", decoding: "async" }) : null;
    if (thumb) thumb.addEventListener("error", function () { thumb.remove(); });
    return h("a", { class: "card card-link tool-card", href: "#/animations/" + t.id },
      thumb,
      h("div", { class: "tc-head" },
        h("div", null, h("h3", { text: t.name }), h("div", { class: "tc-lang", text: t.language || "" })),
        h("span", { class: "badge" + (n ? " badge-accent" : ""), text: n ? n + " demo" + (n === 1 ? "" : "s") : "no demo" })
      ),
      h("p", { class: "muted", style: { margin: "10px 0 0", "font-size": ".95rem" } }, ui.rich(t.summary)),
      t.bestFor && t.bestFor.length ? h("div", { class: "tc-best" }, h("span", { class: "small muted", text: "Best for" }), chips(t.bestFor.slice(0, 4))) : null,
      h("div", { class: "tc-foot" },
        h("span", null, "Difficulty ", ui.dots(t.difficulty, 5, "Difficulty", "teal")),
        h("span", { text: t.cost || "" })
      )
    );
  }

  function overview() {
    var list = tools();
    var page = h("div", { class: "page" },
      ui.pageHead("02:00 / Animations", "Animation tools", "Code-driven animation is where Claude shines: it writes the scene code, renders it, and checks still frames. Here's what each tool is good at, with real demo renders and the code behind them.")
    );
    if (!list.length) {
      page.appendChild(ui.notice("Demo renders are being generated", "The animation tool list and its demo videos haven't been added yet. Meanwhile, try the motion playground: it teaches the same principles live in your browser.", "🎨"));
      page.appendChild(h("p", { style: { "margin-top": "16px" } }, h("a", { class: "btn", href: "#/playground" }, "Open the playground →")));
      return page;
    }
    page.appendChild(h("div", { class: "grid" }, list.map(toolCard)));

    // at-a-glance table
    page.appendChild(h("section", { class: "section", "aria-labelledby": "glance" },
      h("div", { class: "section-head" }, h("h2", { id: "glance", text: "At a glance" }), h("p", { text: "Difficulty is for Claude-assisted use: how much fiddling it usually takes to get a good result." })),
      h("div", { class: "table-wrap" },
        h("table", { class: "data stack-sm" },
          h("thead", null, h("tr", null, ["Tool", "Language", "Difficulty", "Best for", "Cost"].map(function (c) { return h("th", { scope: "col", text: c }); }))),
          h("tbody", null, list.map(function (t) {
            return h("tr", null,
              h("td", { "data-label": "Tool" }, h("a", { href: "#/animations/" + t.id, text: t.name })),
              h("td", { "data-label": "Language", text: t.language || "" }),
              h("td", { "data-label": "Difficulty" }, ui.dots(t.difficulty, 5, "Difficulty", "teal")),
              h("td", { "data-label": "Best for", text: (t.bestFor || []).slice(0, 3).join(", ") }),
              h("td", { "data-label": "Cost", text: t.cost || "" })
            );
          }))
        )
      )
    ));
    page.appendChild(h("div", { class: "callout" }, h("p", null, h("strong", { text: "Rule of thumb: " }), "pick the tool whose ", h("em", { text: "native shape" }), " matches your video. Equations and graphs → Manim. Templated, data-driven or vertical social videos → Remotion. Code walkthroughs and precise timing → Motion Canvas. Simple cuts, trims and overlays → ffmpeg.")));
    return page;
  }

  /* ---------- source viewer (main file + optional extraSources as tabs) ---------- */
  function ghUrl(path) { return VG.GITHUB_BLOB + path.split("/").map(encodeURIComponent).join("/"); }
  function sourceViewer(demo) {
    if (!demo.source) return null;
    var files = [demo.source].concat(Array.isArray(demo.extraSources) ? demo.extraSources : []).filter(Boolean);
    var langOf = function (path, i) { return i === 0 && demo.sourceLang ? demo.sourceLang : guessLang(path); };
    var cache = {};
    var current = 0;
    var tabs = files.length > 1 ? h("div", { class: "seg src-tabs", role: "tablist", "aria-label": "Source files" }) : null;
    var panel = h("div", { class: "src-panel", role: files.length > 1 ? "tabpanel" : null });
    var body = h("div", { class: "disclosure-body" }, tabs, panel);
    var det = h("details", { class: "disclosure source-viewer" },
      h("summary", null, "Source code ", h("code", { text: demo.source.split("/").pop() }), files.length > 1 ? h("span", { class: "small muted", text: " + " + (files.length - 1) + " more file" + (files.length > 2 ? "s" : "") }) : null),
      body
    );
    var offline = location.protocol === "file:" || !window.fetch;
    if (tabs) files.forEach(function (f, i) {
      var b = h("button", { type: "button", role: "tab", "aria-selected": String(i === 0), "aria-pressed": String(i === 0), text: f.split("/").pop() });
      b.addEventListener("click", function () {
        current = i;
        ui.$$("button", tabs).forEach(function (x, k) { x.setAttribute("aria-pressed", String(k === i)); x.setAttribute("aria-selected", String(k === i)); });
        show(i);
      });
      tabs.appendChild(b);
    });
    function show(i) {
      var path = files[i];
      if (offline) {
        panel.replaceChildren(
          h("p", { class: "small", text: "Pages opened from disk can't load local files, so here " + (files.length > 1 ? "are the files" : "is the file") + " on GitHub instead (or run a local server, see the README)." }),
          h("ul", { class: "small" }, files.map(function (f) { return h("li", null, ui.extLink(ghUrl(f), f)); }))
        );
        return;
      }
      if (cache[path] !== undefined) { render(i, cache[path]); return; }
      panel.replaceChildren(h("p", { class: "small muted", text: "Loading\u2026" }));
      fetch(path, { cache: "no-cache" }).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      }).then(function (text) { cache[path] = text; if (current === i) render(i, text); })
        .catch(function () {
          if (current !== i) return;
          panel.replaceChildren(h("p", { class: "small", text: "Couldn't load this file here." }), h("p", null, ui.extLink(ghUrl(path), "View " + path + " on GitHub", "btn btn-sm")));
        });
    }
    function render(i, text) {
      panel.replaceChildren(
        ui.codeBlock(text, langOf(files[i], i), { label: files[i], tall: true }),
        h("p", { class: "small" }, ui.extLink(ghUrl(files[i]), "Open on GitHub"))
      );
    }
    var opened = false;
    det.addEventListener("toggle", function () { if (det.open && !opened) { opened = true; show(0); } });
    return det;
  }
  function guessLang(p) {
    var ext = (p.split(".").pop() || "").toLowerCase();
    return { py: "python", ts: "ts", tsx: "tsx", js: "js", mjs: "js", cjs: "js", jsx: "jsx", sh: "bash", ps1: "powershell", json: "json", css: "css", html: "html", srt: "srt", vtt: "srt" }[ext] || "";
  }
  function demoHasAudio(d) { return d.hasAudio === true || (d.hasAudio !== false && /\bhas sound\b/i.test(d.description || "")); }

  function demoCard(d) {
    var ratioCls = "";
    if (/portrait|9x16|vertical|short/i.test(d.id + " " + (d.file || ""))) ratioCls = " portrait";
    else if (/square|1x1/i.test(d.id + " " + (d.file || ""))) ratioCls = " square";
    var video = h("video", { controls: true, preload: "none", poster: d.poster || null, playsinline: true, "aria-label": d.title + " demo video" },
      h("source", { src: d.file, type: "video/mp4" }),
      d.captions ? h("track", { kind: "captions", src: d.captions, srclang: "en", label: "English", default: true }) : null,
      "Your browser can't play this video. ", h("a", { href: d.file, text: "Download it" }), "."
    );
    var err = h("p", { class: "small", style: { color: "var(--bad)" }, hidden: true, text: "This video couldn't load (it may not be rendered yet)." });
    video.querySelector("source").addEventListener("error", function () { err.hidden = false; });
    // match frame to the real aspect once metadata loads
    video.addEventListener("loadedmetadata", function () {
      if (video.videoWidth && video.videoHeight) frame.style.aspectRatio = video.videoWidth + " / " + video.videoHeight;
    });
    var frame = h("div", { class: "video-frame" + ratioCls }, video);
    return h("article", { class: "card demo-card", id: "demo-" + d.id },
      h("div", null, frame, err,
        demoHasAudio(d) ? h("p", { class: "small muted", style: { margin: "8px 0 0" }, text: d.captions ? "Has narration. Captions: use the CC button in the player." : "Has narration; the word-by-word captions are part of the picture." }) : null),
      h("div", { class: "demo-meta" },
        h("h3", { text: d.title }),
        h("div", { class: "row small muted mono" },
          d.durationSec ? h("span", { text: Number(d.durationSec).toFixed(0) + " s" }) : null,
          demoHasAudio(d) ? h("span", { class: "badge badge-accent", text: "with narration \uD83D\uDD0A" }) : null),
        h("p", { style: { "margin-top": "8px" } }, ui.rich(d.description)),
        d.renderCmd ? [h("div", { class: "small", style: { "font-weight": "700" }, text: "Render command" }), ui.codeBlock(d.renderCmd, "bash", { wrap: true })] : null
      ),
      sourceViewer(d)
    );
  }

  function detail(id) {
    var t = toolById(id);
    var page = h("div", { class: "page" }, h("nav", { class: "breadcrumb", "aria-label": "Breadcrumb" }, h("a", { href: "#/animations" }, "← All animation tools")));
    if (!t) {
      page.appendChild(h("h1", { tabindex: "-1", text: "Tool not found" }));
      page.appendChild(ui.notice(tools().length ? "We don't have a page for “" + id + "”." : "Demo renders are being generated", tools().length ? "Pick one of the tools from the list." : "The tool list hasn't been added yet. Check back soon.", "🔎"));
      return page;
    }
    page.appendChild(h("header", { class: "page-head", style: { "max-width": "none" } },
      h("div", { class: "timecode", text: "02:00 / Animations / " + t.name }),
      h("div", { class: "tool-detail-head" }, h("h1", { tabindex: "-1", text: t.name, style: { margin: "0" } }), t.language ? h("span", { class: "badge", text: t.language }) : null),
      h("p", { class: "lede" }, ui.rich(t.summary))
    ));
    if (t.note) page.appendChild(h("div", { class: "callout warn", style: { "margin-top": "0" } }, h("p", null, h("strong", { text: "Note: " }), ui.rich(t.note))));
    page.appendChild(h("div", { class: "grid-2" },
      h("div", { class: "card" },
        h("dl", { class: "meta", style: { "margin-top": "0" } },
          h("dt", { text: "Difficulty" }), h("dd", null, ui.dots(t.difficulty, 5, "Difficulty", "teal")),
          h("dt", { text: "Cost" }), h("dd", { text: t.cost || "—" }),
          t.needs ? [h("dt", { text: "Needs" }), h("dd", { text: t.needs })] : null,
          h("dt", { text: "Best for" }), h("dd", null, chips(t.bestFor) || "—"),
          t.notGreatFor && t.notGreatFor.length ? [h("dt", { text: "Not great for" }), h("dd", null, chips(t.notGreatFor, true))] : null
        ),
        h("div", { class: "row" },
          t.url ? ui.extLink(t.url, "Official site", "btn btn-sm") : null,
          t.examplesUrl ? ui.extLink(t.examplesUrl, "Official examples", "btn btn-sm") : null
        )
      ),
      h("div", { class: "card" },
        ui.prosCons(t.pros, t.cons),
        t.howClaudeUsesIt ? [h("h3", { class: "small", style: { "text-transform": "uppercase", "letter-spacing": ".06em" }, text: "How Claude uses it" }), h("p", null, ui.rich(t.howClaudeUsesIt))] : null,
        t.setup ? [h("h3", { class: "small", style: { "text-transform": "uppercase", "letter-spacing": ".06em" }, text: "Setup" }), ui.codeBlock(t.setup, "bash")] : null
      )
    ));
    var demos = t.demos || [];
    page.appendChild(h("section", { class: "section", "aria-labelledby": "demos-title" },
      h("div", { class: "section-head" }, h("h2", { id: "demos-title", text: "Demos" }), demos.length ? h("p", { text: "Rendered with the code shown under each video. Open “Source code” to read it." }) : null),
      demos.length ? h("div", { class: "stack" }, demos.map(demoCard))
        : ui.notice("No rendered demo for " + t.name + " yet", h("span", null, "We couldn't render this one locally. ", t.examplesUrl ? ui.extLink(t.examplesUrl, "See the official examples") : null), "🎞️")
    ));
    // other tools
    var others = tools().filter(function (x) { return x.id !== t.id; });
    if (others.length) page.appendChild(h("section", { class: "section" }, h("h2", { text: "Other tools" }), h("div", { class: "row" }, others.map(function (o) { return h("a", { class: "chip", href: "#/animations/" + o.id }, o.name); }))));
    return page;
  }

  VG.pages.animations = function (param) { return param ? detail(param) : overview(); };
})();

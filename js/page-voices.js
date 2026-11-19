/* page-voices.js: engines, sample players with filters, compare mode. */
(function () {
  "use strict";
  var VG = window.VG, ui = VG.ui, h = ui.h;

  var KIND = {
    "local": { label: "Local / offline", cls: "badge-local", hint: "Runs on your own computer. No internet or account needed after setup." },
    "online-free": { label: "Online, free", cls: "badge-online-free", hint: "Free, but calls a web service, so it needs internet and the service could change." },
    "paid": { label: "Paid", cls: "badge-paid", hint: "Needs an account and API key; billed per character or by subscription." },
    "builtin": { label: "Built-in", cls: "badge-builtin", hint: "Ships with your operating system or browser. Zero setup, lower quality." }
  };
  function kindInfo(k) { return KIND[k] || { label: k || "Other", cls: "", hint: "" }; }
  function kindBadge(k) { var i = kindInfo(k); return h("span", { class: "badge " + i.cls, title: i.hint, text: i.label }); }

  function engineById(id) { return (VG.engines || []).filter(function (e) { return e.id === id; })[0] || null; }
  function voiceText(v) { return v.lang === "custom" ? (v.text || "") : ((VG.sentences || {})[v.lang] || v.text || ""); }

  function langList(langs) {
    langs = Array.isArray(langs) ? langs : (langs ? [langs] : []);
    if (!langs.length) return h("span", { class: "muted", text: "Not specified" });
    var codes = langs.filter(ui.isLangCode), extras = langs.filter(function (l) { return !ui.isLangCode(l); });
    var shown = codes.slice(0, 8).map(ui.langName).join(", ");
    return h("span", { class: "lang-list" }, shown,
      codes.length > 8 ? h("span", { class: "more", text: " +" + (codes.length - 8) + " more" }) : null,
      extras.length ? h("span", { class: "more", text: (shown ? "; " : "") + extras.join("; ") }) : null);
  }

  /* ---------- sample player row ---------- */
  function sampleRow(v, opts) {
    opts = opts || {};
    var eng = engineById(v.engine);
    var btn = h("button", { type: "button", class: "play-btn", "aria-label": "Play " + v.label + (eng ? " (" + eng.name + ")" : "") }, ui.icon("play"));
    var bar = h("i");
    var progress = h("div", { class: "progress", role: "presentation", title: "Click to seek" }, bar);
    var err = h("p", { class: "s-err", hidden: true, text: "Couldn't load this sample (the audio file may not be generated yet)." });
    var text = voiceText(v);
    var row = h("div", { class: "sample-row", "data-voice": v.id },
      btn,
      h("div", { class: "s-info" },
        h("div", { class: "s-label", text: v.label || v.voice || v.id }),
        h("div", { class: "s-sub" }, (opts.showEngine && eng ? eng.name + " · " : "") + (v.voice || "") + " · " + ui.langName(v.lang) + (v.durationSec ? " · " + Number(v.durationSec).toFixed(1) + " s" : "")),
        v.tags && v.tags.length ? h("div", { class: "s-tags" }, v.tags.map(function (t) { return h("span", { class: "tag", text: t }); })) : null
      ),
      progress,
      text ? h("p", { class: "s-text", lang: v.lang !== "custom" ? v.lang : null, dir: ui.isRtl(v.lang) ? "rtl" : null, text: "“" + text + "”" }) : null,
      v.note ? h("p", { class: "s-note", text: v.note }) : null,
      err
    );
    function onState(ev, a) {
      if (ev === "play") { row.classList.add("playing"); btn.replaceChildren(ui.icon("pause")); btn.setAttribute("aria-label", "Pause " + v.label); }
      else if (ev === "pause" || ev === "stopped" || ev === "ended") {
        row.classList.remove("playing"); btn.replaceChildren(ui.icon("play")); btn.setAttribute("aria-label", "Play " + v.label);
        if (ev !== "pause") bar.style.width = "0";
      } else if (ev === "timeupdate" && a && a.duration) { bar.style.width = (100 * a.currentTime / a.duration) + "%"; }
      else if (ev === "error") { err.hidden = false; row.classList.remove("playing"); btn.replaceChildren(ui.icon("play")); }
    }
    btn.addEventListener("click", function () { err.hidden = true; VG.media.play(v.file, v.id, onState); });
    progress.addEventListener("click", function (e) {
      var a = VG.media.audio;
      if (!a || !VG.media.current || VG.media.current.id !== v.id || !a.duration) return;
      var r = progress.getBoundingClientRect();
      a.currentTime = a.duration * Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    });
    return row;
  }

  /* ---------- engine card ---------- */
  function engineCard(e, nSamples, onShowSamples) {
    var setupBits = [];
    if (e.setup) setupBits.push(h("h4", { class: "small", text: "Setup" }), ui.codeBlock(e.setup, "bash"));
    if (e.howClaudeUsesIt) setupBits.push(h("h4", { class: "small", text: "How Claude uses it" }), h("p", { class: "small" }, ui.rich(e.howClaudeUsesIt)));
    return h("article", { class: "card engine-card", id: "engine-" + e.id },
      h("div", { class: "ec-head" }, h("h3", { text: e.name }), kindBadge(e.kind)),
      h("p", { class: "ec-summary" }, ui.rich(e.summary)),
      !nSamples ? h("p", { class: "small", style: { margin: "8px 0 0", color: "var(--warn)", "font-weight": "650" }, text: e.demoUrl ? "No samples hosted here: hear it on the official page." : "No samples hosted here." }) : null,
      h("dl", { class: "meta" },
        h("dt", { text: "Quality" }), h("dd", null, ui.dots(e.quality, 5, "Quality")),
        e.speed ? [h("dt", { text: "Speed" }), h("dd", { text: e.speed })] : null,
        h("dt", { text: "Languages" }), h("dd", null, langList(e.languages)),
        h("dt", { text: "Voice cloning" }), h("dd", { text: e.cloning ? "Yes" : "No" }),
        h("dt", { text: "Cost" }), h("dd", { text: e.cost || "—" }),
        e.license ? [h("dt", { text: "License" }), h("dd", { text: e.license })] : null,
        e.needs ? [h("dt", { text: "Needs" }), h("dd", { text: e.needs })] : null
      ),
      // on phones, pros/cons start collapsed so the 10+ cards don't bury the samples
      (function () {
        var pc = ui.prosCons(e.pros, e.cons);
        if (!pc) return null;
        var wide = !window.matchMedia || window.matchMedia("(min-width: 700px)").matches;
        return h("details", { class: "disclosure pc-details", open: wide }, h("summary", { text: "Pros & cons" }), h("div", { class: "disclosure-body" }, pc));
      })(),
      setupBits.length ? h("details", { class: "disclosure" }, h("summary", { text: "Setup & how Claude uses it" }), h("div", { class: "disclosure-body" }, setupBits)) : null,
      h("div", { class: "ec-actions" },
        nSamples ? h("button", { type: "button", class: "btn btn-sm", onclick: function () { onShowSamples(e.id); } }, ui.icon("play"), "Samples (" + nSamples + ")") : null,
        e.demoUrl ? ui.extLink(e.demoUrl, nSamples ? "Official samples" : "Hear official samples", nSamples ? "btn btn-sm btn-ghost" : "btn btn-sm btn-primary") : null,
        e.url ? ui.extLink(e.url, "Website", "btn btn-sm btn-ghost") : null
      )
    );
  }

  VG.pages.voices = function (param, route) {
    var engines = Array.isArray(VG.engines) ? VG.engines : [];
    var voices = Array.isArray(VG.voices) ? VG.voices.filter(function (v) { return v && v.file; }) : [];
    var query = (route && route.query) || {};

    var page = h("div", { class: "page" },
      ui.pageHead("01:00 / Voices", "Text-to-speech voices", "Every sample below reads the same sentence, so you can compare engines fairly. Listen on headphones, then pick by ear, not by spec sheet."),
      h("div", { class: "callout" },
        h("p", null, h("strong", { text: "Want to hear the very best (paid) voices too? " }), "We only host free engines here. ", h("a", { href: "#/best-voices" }, "Best AI voices"), " points you to the leaderboards and demos where you can hear today's top models, and how to judge a voice.")
      )
    );

    if (!engines.length) {
      page.appendChild(ui.notice("Voice samples are being generated", "The engine list and audio samples haven't been added yet. Check back soon, or read the narration chapter meanwhile.", "🎙️"));
      page.appendChild(h("p", { style: { "margin-top": "16px" } }, h("a", { class: "btn", href: "#/guide/narration" }, "Narration tips →")));
      return page;
    }

    var subnav = h("nav", { class: "subnav", "aria-label": "On this page" });
    page.appendChild(subnav);
    function jump(label, id) {
      subnav.appendChild(h("button", { type: "button", class: "chip", onclick: function () { var t = document.getElementById(id); if (t) t.scrollIntoView({ behavior: ui.reducedMotion() ? "auto" : "smooth", block: "start" }); } }, label));
    }
    jump("Engines", "v-engines"); jump("Samples", "v-samples"); jump("Compare", "v-compare");

    /* ----- engines ----- */
    var kindsPresent = {};
    engines.forEach(function (e) { kindsPresent[e.kind] = 1; });
    var countByEngine = {};
    voices.forEach(function (v) { countByEngine[v.engine] = (countByEngine[v.engine] || 0) + 1; });

    var engSection = h("section", { class: "section", id: "v-engines", "aria-labelledby": "eng-title", style: { "scroll-margin-top": "80px" } },
      h("div", { class: "section-head" }, h("h2", { id: "eng-title", text: "Engines" }),
        h("div", { class: "legend" }, Object.keys(KIND).filter(function (k) { return kindsPresent[k]; }).map(function (k) {
          return h("span", null, kindBadge(k), " ", h("span", { class: "small", text: KIND[k].hint.split(".")[0] }));
        }))
      ),
      h("div", { class: "grid" }, engines.map(function (e) { return engineCard(e, countByEngine[e.id] || 0, showEngineSamples); }))
    );
    page.appendChild(engSection);

    /* ----- samples ----- */
    var filters = { lang: "all", kind: "all", engine: query.engine && engineById(query.engine) ? query.engine : "all", cloning: false, tags: {} };
    var samplesSection = h("section", { class: "section", id: "v-samples", "aria-labelledby": "samp-title", style: { "scroll-margin-top": "80px" } });
    page.appendChild(samplesSection);
    var resultsEl = h("div", { "aria-live": "polite" });
    var countEl = h("p", { class: "small muted", style: { margin: "10px 0 16px" } });

    if (!voices.length) {
      samplesSection.appendChild(h("div", { class: "section-head" }, h("h2", { id: "samp-title", text: "Samples" })));
      samplesSection.appendChild(ui.notice("Samples are being generated", "Audio for these engines hasn't been rendered yet. The engine details above are already accurate.", "⏳"));
    } else {
      var langs = uniq(voices.map(function (v) { return v.lang; }));
      var tagCounts = {};
      voices.forEach(function (v) { (v.tags || []).forEach(function (t) { tagCounts[t] = (tagCounts[t] || 0) + 1; }); });
      var tags = Object.keys(tagCounts).sort(function (a, b) {
        var pri = function (t) { return t === "female" || t === "male" ? 0 : 1; };
        return pri(a) - pri(b) || tagCounts[b] - tagCounts[a] || a.localeCompare(b);
      }).slice(0, 14);

      var langSel = select("f-lang", [["all", "All languages"]].concat(langs.map(function (l) { return [l, ui.langName(l)]; })), filters.lang, function (v) { filters.lang = v; renderSamples(); });
      var kindSel = select("f-kind", [["all", "All kinds"]].concat(Object.keys(kindsPresent).map(function (k) { return [k, kindInfo(k).label]; })), filters.kind, function (v) { filters.kind = v; renderSamples(); });
      var engSel = select("f-engine", [["all", "All engines"]].concat(engines.filter(function (e) { return countByEngine[e.id]; }).map(function (e) { return [e.id, e.name]; })), filters.engine, function (v) { filters.engine = v; renderSamples(); });
      var cloneChk = h("input", { type: "checkbox", id: "f-clone", onchange: function (e) { filters.cloning = e.target.checked; renderSamples(); } });

      var tagWrap = h("div", { class: "row", role: "group", "aria-label": "Filter by tag" }, tags.map(function (t) {
        return h("button", { type: "button", class: "chip", "aria-pressed": "false", onclick: function (e) {
          var on = e.currentTarget.getAttribute("aria-pressed") !== "true";
          e.currentTarget.setAttribute("aria-pressed", String(on));
          if (on) filters.tags[t] = 1; else delete filters.tags[t];
          renderSamples();
        } }, t);
      }));

      samplesSection.appendChild(h("div", { class: "section-head" }, h("h2", { id: "samp-title", text: "Samples" }), h("p", { text: "Only one sample plays at a time. Click the bar to seek." })));
      samplesSection.appendChild(h("div", { class: "toolbar", role: "search", "aria-label": "Filter samples" },
        field("Language", "f-lang", langSel), field("Engine kind", "f-kind", kindSel), field("Engine", "f-engine", engSel),
        h("label", { class: "check", for: "f-clone", style: { "min-height": "40px" } }, cloneChk, "Can clone voices"),
        tags.length ? h("div", { class: "field", style: { flex: "1 1 100%" } }, h("span", { class: "label", text: "Tags" }), tagWrap) : null,
        h("button", { type: "button", class: "btn btn-sm btn-ghost", onclick: resetFilters }, "Reset filters")
      ));
      samplesSection.appendChild(countEl);
      samplesSection.appendChild(resultsEl);
      renderSamples();

      function resetFilters() {
        filters = { lang: "all", kind: "all", engine: "all", cloning: false, tags: {} };
        langSel.value = "all"; kindSel.value = "all"; engSel.value = "all"; cloneChk.checked = false;
        ui.$$(".chip", tagWrap).forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
        renderSamples();
      }
      VG.pages.voices._setEngine = function (id) { filters.engine = id; engSel.value = id; renderSamples(); };
    }

    function renderSamples() {
      VG.media.stop();
      var list = voices.filter(function (v) {
        var e = engineById(v.engine) || {};
        if (filters.lang !== "all" && v.lang !== filters.lang) return false;
        if (filters.kind !== "all" && e.kind !== filters.kind) return false;
        if (filters.engine !== "all" && v.engine !== filters.engine) return false;
        if (filters.cloning && !e.cloning) return false;
        for (var t in filters.tags) if ((v.tags || []).indexOf(t) < 0) return false;
        return true;
      });
      countEl.textContent = list.length + " of " + voices.length + " samples";
      resultsEl.replaceChildren();
      if (!list.length) { resultsEl.appendChild(ui.notice("No samples match these filters", "Try removing a tag or choosing “All”.", "🔍")); return; }
      var order = engines.map(function (e) { return e.id; });
      var groups = {};
      list.forEach(function (v) { (groups[v.engine] = groups[v.engine] || []).push(v); });
      Object.keys(groups).sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); }).forEach(function (eid) {
        var e = engineById(eid) || { name: eid };
        resultsEl.appendChild(h("div", { class: "voice-group" },
          h("div", { class: "voice-group-head" }, h("h3", { text: e.name }), e.kind ? kindBadge(e.kind) : null, h("span", { class: "small muted", text: groups[eid].length + " sample" + (groups[eid].length === 1 ? "" : "s") })),
          h("div", { class: "sample-list" }, orderGroup(groups[eid]).map(function (v) { return sampleRow(v); }))
        ));
      });
    }

    function showEngineSamples(id) {
      if (VG.pages.voices._setEngine) VG.pages.voices._setEngine(id);
      samplesSection.scrollIntoView({ behavior: ui.reducedMotion() ? "auto" : "smooth", block: "start" });
    }

    /* ----- compare ----- */
    page.appendChild(compareSection(voices));

    if (query.engine && engineById(query.engine)) {
      setTimeout(function () { var t = document.getElementById("engine-" + query.engine); if (t) t.scrollIntoView({ block: "start" }); }, 0);
    }
    return page;
  };

  function compareSection(voices) {
    var sec = h("section", { class: "section", id: "v-compare", "aria-labelledby": "cmp-title", style: { "scroll-margin-top": "80px" } });
    sec.appendChild(h("div", { class: "section-head" }, h("h2", { id: "cmp-title", text: "Compare" }), h("p", { text: "Pick 2–4 voices reading the same sentence and play them back to back. Try blind mode: you'll judge by sound, not by brand." })));
    var box = h("div", { class: "compare" });
    sec.appendChild(box);

    var byLang = {};
    voices.forEach(function (v) { if (v.lang !== "custom" && (VG.sentences || {})[v.lang]) (byLang[v.lang] = byLang[v.lang] || []).push(v); });
    var langs = Object.keys(byLang).filter(function (l) { return byLang[l].length >= 2; });
    if (!langs.length) {
      box.appendChild(ui.notice("Compare mode needs at least two samples in one language", "It will light up once the samples are generated.", "⚖️"));
      return sec;
    }
    langs.sort(function (a, b) { return a === "en" ? -1 : b === "en" ? 1 : byLang[b].length - byLang[a].length; });

    var state = { lang: langs[0], picked: [], blind: false, order: [], revealed: false };
    var seq = { token: 0, advancing: false, idx: -1 };
    var MAX = 4;

    var langSel = select("c-lang", langs.map(function (l) { return [l, ui.langName(l) + " (" + byLang[l].length + ")"]; }), state.lang, function (v) { state.lang = v; state.picked = []; stopSeq(); renderPick(); renderQueue(); });
    var blindChk = h("input", { type: "checkbox", id: "c-blind", onchange: function (e) { state.blind = e.target.checked; state.revealed = false; stopSeq(); renderQueue(); } });
    var quote = h("blockquote", { class: "sentence-quote" });
    var pickWrap = h("div", { class: "compare-pick", role: "group", "aria-label": "Choose voices to compare" });
    var playBtn = h("button", { type: "button", class: "btn btn-primary" }, ui.icon("play"), "Play in sequence");
    var stopBtn = h("button", { type: "button", class: "btn", onclick: stopSeq }, ui.icon("stop"), "Stop");
    var revealBtn = h("button", { type: "button", class: "btn", hidden: true, onclick: function () { state.revealed = true; renderQueue(); } }, "Reveal names");
    var queueEl = h("div", { class: "compare-queue", "aria-live": "polite" });
    var status = h("p", { class: "small muted", style: { margin: "10px 0 0" } });

    box.appendChild(h("div", { class: "row", style: { gap: "12px 20px", "align-items": "flex-end" } },
      field("Sentence language", "c-lang", langSel),
      h("label", { class: "check", for: "c-blind", style: { "min-height": "40px" } }, blindChk, "Blind mode (shuffle + hide names)")
    ));
    box.appendChild(quote);
    box.appendChild(pickWrap);
    box.appendChild(h("div", { class: "row" }, playBtn, stopBtn, revealBtn));
    box.appendChild(queueEl);
    box.appendChild(status);

    playBtn.addEventListener("click", function () {
      if (state.picked.length < 2) { status.textContent = "Pick at least two voices first."; return; }
      state.order = state.picked.slice();
      if (state.blind) shuffle(state.order);
      state.revealed = false;
      renderQueue();
      seq.token++;
      playIdx(0, seq.token);
    });

    function renderPick() {
      var s = (VG.sentences || {})[state.lang] || "";
      quote.textContent = s;
      quote.setAttribute("lang", state.lang);
      if (ui.isRtl(state.lang)) quote.setAttribute("dir", "rtl"); else quote.removeAttribute("dir");
      pickWrap.replaceChildren();
      byLang[state.lang].forEach(function (v) {
        var e = engineById(v.engine) || { name: v.engine };
        var checked = state.picked.indexOf(v.id) >= 0;
        var cb = h("input", { type: "checkbox", value: v.id, checked: checked, disabled: !checked && state.picked.length >= MAX });
        cb.addEventListener("change", function () {
          if (cb.checked) { if (state.picked.length < MAX) state.picked.push(v.id); }
          else state.picked = state.picked.filter(function (x) { return x !== v.id; });
          stopSeq(); renderPick(); renderQueue();
        });
        pickWrap.appendChild(h("label", null, cb, h("span", null, h("b", { text: e.name }), " · " + (v.label || v.voice))));
      });
      status.textContent = state.picked.length + " of max " + MAX + " selected.";
    }

    function renderQueue() {
      var ids = state.order.length && sameSet(state.order, state.picked) ? state.order : state.picked;
      queueEl.replaceChildren();
      ids.forEach(function (id, i) {
        var v = voices.filter(function (x) { return x.id === id; })[0];
        if (!v) return;
        var e = engineById(v.engine) || { name: v.engine };
        var hide = state.blind && !state.revealed;
        queueEl.appendChild(h("div", { class: "cq-item" + (seq.idx === i && seq.token ? " active" : ""), "data-idx": i },
          h("span", { class: "cq-letter", text: "ABCD"[i] }),
          h("span", { class: "cq-name", text: hide ? "Voice " + "ABCD"[i] : e.name + " · " + (v.label || v.voice) })
        ));
      });
      revealBtn.hidden = !(state.blind && !state.revealed && state.order.length);
    }

    function playIdx(i, token) {
      var ids = state.order;
      if (token !== seq.token) return;
      if (i >= ids.length) { seq.idx = -1; renderQueue(); status.textContent = state.blind ? "Done. Which did you prefer? Then reveal the names." : "Done."; return; }
      var v = voices.filter(function (x) { return x.id === ids[i]; })[0];
      seq.idx = i; renderQueue();
      status.textContent = "Playing " + "ABCD"[i] + " (" + (i + 1) + " of " + ids.length + ")…";
      seq.advancing = true;
      VG.media.play(v.file, "cmp-" + v.id + "-" + token + "-" + i, function (ev) {
        if (token !== seq.token) return;
        if (ev === "ended") setTimeout(function () { playIdx(i + 1, token); }, 650);
        else if (ev === "error") { status.textContent = "Sample " + "ABCD"[i] + " couldn't load; skipping."; setTimeout(function () { playIdx(i + 1, token); }, 400); }
        else if (ev === "stopped" && !seq.advancing) { seq.token++; seq.idx = -1; renderQueue(); status.textContent = "Stopped."; }
      });
      seq.advancing = false;
    }
    function stopSeq() {
      if (seq.idx >= 0) VG.media.stop();
      seq.token++; seq.idx = -1; renderQueue();
    }
    VG.app && VG.app.onLeave && VG.app.onLeave(function () { seq.token++; });

    renderPick(); renderQueue();
    return sec;
  }

  /* Order samples inside an engine group: custom-text clips (e.g. a cloning reference) first,
     then data order, with variants (id = otherId + "-suffix") placed right after their base clip. */
  function orderGroup(list) {
    var ids = {}; list.forEach(function (v) { ids[v.id] = v; });
    function baseOf(v) {
      var best = null;
      list.forEach(function (o) { if (o !== v && v.id.indexOf(o.id + "-") === 0 && (!best || o.id.length > best.id.length)) best = o; });
      return best;
    }
    var roots = list.filter(function (v) { return !baseOf(v); });
    roots.sort(function (a, b) { return (a.lang === "custom" ? 0 : 1) - (b.lang === "custom" ? 0 : 1) || list.indexOf(a) - list.indexOf(b); });
    var out = [];
    function add(v) { out.push(v); list.filter(function (c) { return baseOf(c) === v; }).forEach(add); }
    roots.forEach(add);
    return out;
  }

  /* ---------- helpers ---------- */
  function uniq(a) { var o = {}, r = []; a.forEach(function (x) { if (!o[x]) { o[x] = 1; r.push(x); } }); return r; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function sameSet(a, b) { return a.length === b.length && a.every(function (x) { return b.indexOf(x) >= 0; }); }
  function select(id, options, value, onChange) {
    var s = h("select", { id: id });
    options.forEach(function (o) { s.appendChild(h("option", { value: o[0], text: o[1], selected: o[0] === value })); });
    s.addEventListener("change", function () { onChange(s.value); });
    return s;
  }
  function field(label, id, control) {
    return h("div", { class: "field" }, h("label", { for: id, text: label }), control);
  }

  VG.voiceUi = { sampleRow: sampleRow, kindBadge: kindBadge };
})();

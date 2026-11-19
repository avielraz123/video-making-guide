/* page-guide.js: "Making good videos" index + chapters + script timer + checklist. */
(function () {
  "use strict";
  var VG = window.VG, ui = VG.ui, h = ui.h;

  function chapters() { return (VG.guide && VG.guide.chapters) || []; }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  /* ---------- script timer ---------- */
  var SAMPLE = "Your code works. It's just slow. Let's find out why, in one line. Checking whether an item is in a list means looking at every single item, one after another, which gets painfully slow when the list holds a million names and you do it inside another loop. A set jumps straight to the answer. Same code, one word changed, and it runs forty times faster.";

  function splitSentences(text) {
    var parts = text.replace(/\r/g, "").split(/(?<=[.!?\u2026\u061F\u3002\uFF01\uFF1F])\s+|\n+/);
    return parts.map(function (s) { return s.trim(); }).filter(Boolean);
  }
  function countWords(s) {
    // CJK has no spaces: count characters / 2.5 as a rough word-equivalent
    var cjk = (s.match(/[\u3040-\u30ff\u3400-\u9fff]/g) || []).length;
    var rest = s.replace(/[\u3040-\u30ff\u3400-\u9fff]/g, " ");
    var w = rest.split(/\s+/).filter(function (x) { return /[\p{L}\p{N}]/u.test(x); }).length;
    return w + Math.round(cjk / 2.5);
  }

  function scriptTimer() {
    var saved = VG.storage.get("timer-text", null);
    var st = { wpm: VG.storage.get("timer-wpm", 140), pauses: true };
    var ta = h("textarea", { id: "timer-text", rows: "7", spellcheck: "true", "aria-describedby": "timer-help" });
    ta.value = saved !== null ? saved : SAMPLE;
    var stats = h("div", { class: "timer-stats", "aria-live": "polite" });
    var hook = h("p", { class: "small", style: { margin: "0 0 10px" } });
    var tbody = h("tbody");
    var table = h("table", { class: "sentence-table" }, h("caption", { class: "sr-only", text: "Per-sentence timing" }), tbody);

    var wpmField = VG.demoUi ? VG.demoUi.range("timer-wpm", "Speaking rate", 100, 200, 5, st.wpm, function (v) { return v + " wpm"; }, function (v) { st.wpm = v; VG.storage.set("timer-wpm", v); update(); })
      : h("span");
    var pauseChk = h("input", { type: "checkbox", id: "timer-pauses", checked: true });
    pauseChk.addEventListener("change", function () { st.pauses = pauseChk.checked; update(); });
    var presets = h("div", { class: "row", role: "group", "aria-label": "Rate presets" },
      [["Slow & clear", 120], ["Teaching", 140], ["Conversational", 155], ["Fast", 175]].map(function (p) {
        return h("button", { type: "button", class: "chip", onclick: function () {
          var inp = document.getElementById("timer-wpm"); if (inp) { inp.value = p[1]; inp.dispatchEvent(new Event("input")); }
        } }, p[0] + " (" + p[1] + ")");
      }));

    function update() {
      var text = ta.value;
      VG.storage.set("timer-text", text);
      var sents = splitSentences(text);
      var totalWords = 0, t = 0, rows = [];
      var spw = 60 / st.wpm;
      sents.forEach(function (s) {
        var w = countWords(s);
        var commas = (s.match(/[,;:\u060C\u3001]/g) || []).length;
        var dur = w * spw + (st.pauses ? 0.35 + commas * 0.12 : 0);
        rows.push({ s: s, w: w, start: t, dur: dur });
        t += dur; totalWords += w;
      });
      var maxDur = rows.reduce(function (m, r) { return Math.max(m, r.dur); }, 0.001);
      stats.replaceChildren(
        stat(fmt(t), "Estimated length"),
        stat(String(totalWords), "Words"),
        stat(String(sents.length), "Sentences"),
        stat(sents.length ? (totalWords / sents.length).toFixed(1) : "0", "Words / sentence")
      );
      if (rows.length) {
        var first = rows[0].start + rows[0].dur;
        hook.innerHTML = first <= 5
          ? "\u2705 Your first sentence ends at <b>" + first.toFixed(1) + " s</b>: a hook fits in the first 5 seconds."
          : "\u26A0\uFE0F Your first sentence ends at <b>" + first.toFixed(1) + " s</b>. Consider a shorter opening line so the hook lands within 5 seconds.";
      } else hook.textContent = "";
      tbody.replaceChildren();
      rows.forEach(function (r, i) {
        var long = r.w > 25;
        tbody.appendChild(h("tr", { class: long ? "long" : null },
          h("td", { class: "t", text: fmt(r.start) }),
          h("td", null, r.s, long ? h("div", { class: "small", style: { color: "var(--warn)", "font-weight": "700" }, text: r.w + " words: consider splitting this sentence." }) : null,
            h("span", { class: "bar", style: { width: Math.max(4, 100 * r.dur / maxDur) + "%" } })),
          h("td", { class: "t", text: r.dur.toFixed(1) + " s" })
        ));
      });
    }
    function stat(v, label) { return h("div", { class: "stat" }, h("b", { text: v }), h("span", { text: label })); }
    function fmt(sec) { var m = Math.floor(sec / 60), s = sec - m * 60; return m + ":" + (s < 9.95 ? "0" : "") + s.toFixed(1); }
    var timerDeb;
    ta.addEventListener("input", function () { clearTimeout(timerDeb); timerDeb = setTimeout(update, 120); });

    var box = h("div", { class: "timer-tool", id: "script-timer" },
      h("h3", { style: { "margin-top": "0" }, text: "Script timer" }),
      h("div", { class: "field" }, h("label", { for: "timer-text", text: "Your script" }), ta),
      h("p", { id: "timer-help", class: "small muted", style: { margin: "6px 0 0" }, text: "Saved in this browser only. Works for any language; Japanese/Chinese are estimated from character count." }),
      h("div", { class: "timer-controls" }, wpmField, h("label", { class: "check", for: "timer-pauses" }, pauseChk, "Add natural pauses (sentence ends, commas)")),
      presets,
      stats, hook,
      h("div", { class: "row", style: { "justify-content": "flex-end", "margin-bottom": "6px" } },
        h("button", { type: "button", class: "btn btn-sm btn-ghost", onclick: function () { ta.value = SAMPLE; update(); } }, "Load example"),
        h("button", { type: "button", class: "btn btn-sm btn-ghost", onclick: function () { ta.value = ""; update(); ta.focus(); } }, "Clear")
      ),
      h("div", { class: "table-wrap", style: { border: "0" } }, table)
    );
    VG.guideTimer = { update: update, textarea: ta, stats: stats };
    update();
    return box;
  }

  /* ---------- interactive checklist ---------- */
  function interactiveChecklist(groups, key) {
    var state = VG.storage.get("check-" + key, {});
    var total = 0;
    groups.forEach(function (g) { total += g.items.length; });
    var bar = h("i");
    var label = h("p", { class: "small", style: { margin: "0", "font-weight": "700" }, "aria-live": "polite" });
    function refresh() {
      var done = Object.keys(state).filter(function (k) { return state[k]; }).length;
      bar.style.width = (100 * done / total) + "%";
      label.textContent = done + " of " + total + " done" + (done === total ? ": ship it! \uD83C\uDF89" : "");
    }
    var wrap = h("div", { class: "checklist-wrap" },
      label, h("div", { class: "check-progress", "aria-hidden": "true" }, bar),
      groups.map(function (g, gi) {
        return h("div", { class: "box checklist" },
          h("h3", { text: g.group }),
          h("ul", { class: "checklist-ui" }, g.items.map(function (it, ii) {
            var id = "chk-" + gi + "-" + ii;
            var cb = h("input", { type: "checkbox", id: id, checked: !!state[id] });
            cb.addEventListener("change", function () { state[id] = cb.checked; VG.storage.set("check-" + key, state); refresh(); });
            return h("li", null, h("label", { for: id }, cb, h("span", { text: it })));
          }))
        );
      }),
      h("button", { type: "button", class: "btn btn-sm", onclick: function () {
        state = {}; VG.storage.set("check-" + key, state);
        ui.$$("input[type=checkbox]", wrap).forEach(function (c) { c.checked = false; });
        refresh();
      } }, "Reset checklist")
    );
    refresh();
    return wrap;
  }

  /* ---------- prose post-processing ---------- */
  function enhanceProse(el) {
    ui.$$("pre.codeblock", el).forEach(function (pre) {
      var code = pre.textContent;
      var lang = /^\d+\s*\n\d\d:\d\d/.test(code) ? "" : "bash";
      pre.parentNode.replaceChild(ui.codeBlock(code, lang), pre);
    });
    ui.$$("table.data", el).forEach(function (t) {
      var heads = ui.$$("thead th", t).map(function (th) { return th.textContent; });
      if (heads.length >= 3) {
        t.classList.add("stack-sm");
        ui.$$("tbody tr", t).forEach(function (tr) { ui.$$("td", tr).forEach(function (td, i) { if (heads[i]) td.setAttribute("data-label", heads[i]); }); });
      }
      var w = h("div", { class: "table-wrap", style: { margin: "1em 0" } });
      t.parentNode.insertBefore(w, t); w.appendChild(t);
    });
  }

  function toc(currentId) {
    var list = h("ol", null, chapters().map(function (c) {
      return h("li", null, h("a", { href: "#/guide/" + c.id, "aria-current": c.id === currentId ? "page" : null }, c.title));
    }));
    var list2 = list.cloneNode(true);
    return h("nav", { class: "guide-toc", "aria-label": "Guide chapters" },
      h("div", { class: "toc-desktop" }, h("p", { class: "toc-title", text: "Chapters" }), list),
      h("details", { class: "disclosure toc-mobile" }, h("summary", { text: "All chapters" }), h("div", { class: "disclosure-body" }, list2))
    );
  }

  function index() {
    var chs = chapters();
    var page = h("div", { class: "page" }, ui.pageHead("00:30 / Guide", "Making good videos", (VG.guide && VG.guide.intro) || ""));
    if (!chs.length) { page.appendChild(ui.notice("Guide content is missing", "js/data/guide.js didn't load.")); return page; }
    var total = chs.reduce(function (s, c) { return s + (c.minutes || 0); }, 0);
    page.appendChild(h("p", { class: "small muted", text: chs.length + " chapters \u00b7 about " + total + " minutes of reading" }));
    page.appendChild(h("div", { class: "grid" }, chs.map(function (c, i) {
      return h("a", { class: "card card-link chapter-card", href: "#/guide/" + c.id },
        h("div", { class: "ch-num", text: pad2(i + 1) + " \u00b7 " + c.minutes + " min" }),
        h("h3", { text: c.title }),
        h("p", { text: c.summary }),
        c.tool === "script-timer" ? h("span", { class: "badge badge-accent", text: "Includes the script timer" }) : null,
        c.interactive ? h("span", { class: "badge badge-accent", text: "Interactive checklist" }) : null
      );
    })));
    page.appendChild(h("div", { class: "callout", style: { "margin-top": "28px" } }, h("p", null, h("strong", { text: "Just need the timer? " }), h("a", { href: "#/guide/script" }, "Jump to the script timer"), " in chapter 2.")));
    return page;
  }

  function chapter(id) {
    var chs = chapters();
    var idx = -1;
    chs.forEach(function (c, i) { if (c.id === id) idx = i; });
    if (idx < 0) {
      if (id === "timer" || id === "script-timer") return chapter("script");
      return h("div", { class: "page" }, h("h1", { tabindex: "-1", text: "Chapter not found" }), ui.notice("No chapter called \u201C" + id + "\u201D.", h("a", { href: "#/guide" }, "See all chapters")));
    }
    var c = chs[idx];
    var prose = h("div", { class: "prose" });
    prose.innerHTML = c.body || "";
    enhanceProse(prose);
    if (c.tool === "script-timer") prose.appendChild(scriptTimer());
    if (c.interactive) prose.appendChild(interactiveChecklist(c.interactive, c.id));
    if (c.checklist && c.checklist.length) prose.appendChild(h("div", { class: "box checklist" }, h("h3", { text: "Checklist" }), ui.list(c.checklist)));
    if (c.mistakes && c.mistakes.length) prose.appendChild(h("div", { class: "box mistakes" }, h("h3", { text: "Common mistakes" }), ui.list(c.mistakes)));
    var prev = chs[idx - 1], next = chs[idx + 1];
    prose.appendChild(h("nav", { class: "pager", "aria-label": "Chapter navigation" },
      prev ? h("a", { class: "prev", href: "#/guide/" + prev.id }, h("small", { text: "\u2190 Previous" }), prev.title) : h("span"),
      next ? h("a", { class: "next", href: "#/guide/" + next.id }, h("small", { text: "Next \u2192" }), next.title) : h("a", { class: "next", href: "#/claude" }, h("small", { text: "Next \u2192" }), "Working with Claude")
    ));
    return h("div", { class: "page" },
      h("div", { class: "guide-layout" },
        toc(c.id),
        h("article", { class: "chapter" },
          h("header", { class: "page-head chapter-head" },
            h("div", { class: "timecode", text: "Chapter " + pad2(idx + 1) + " / " + pad2(chs.length) }),
            h("h1", { tabindex: "-1", text: c.title }),
            h("p", { class: "lede", text: c.summary }),
            h("div", { class: "chapter-meta" }, h("span", { text: "\u23F1 " + c.minutes + " min read" }))
          ),
          prose
        )
      )
    );
  }

  VG.pages.guide = function (param) { return param ? chapter(param) : index(); };
})();

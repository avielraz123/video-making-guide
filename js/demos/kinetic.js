/* Demo: kinetic typography. Words timed like narration. */
(function () {
  "use strict";
  var VG = window.VG;

  VG.demos.push({
    id: "kinetic",
    title: "Kinetic typography",
    tag: "Type",
    intro: "Animated text works when it moves with the voice: each word lands when it's spoken. Type a line, wrap a *keyword* in asterisks, and set the speaking rate. In a real project, Claude takes the word timestamps from the TTS engine or from Whisper and uses them instead of an even rate.",
    render: function (root) {
      var ui = VG.ui, h = ui.h, M = VG.motion, D = VG.demoUi;
      var st = { text: "Show, don't tell. *One* idea per frame.", style: "pop", wpm: 150 };
      var textEl = h("div", { class: "kt-text", "aria-hidden": "true" });
      var stage = h("div", { class: "stage stage-16x9 kt-stage" }, textEl);
      var srText = h("p", { class: "sr-only", "aria-live": "polite" });
      var timing = h("p", { class: "small muted", style: { margin: "8px 0 0" } });

      function parse() {
        return st.text.trim().split(/\s+/).filter(Boolean).map(function (w) {
          var hl = /^\*.*\*[.,!?;:]*$/.test(w) || /^\*.+\*$/.test(w);
          return { raw: w.replace(/\*/g, ""), hl: hl };
        });
      }
      var run = null;
      function stop() { if (run) run.cancel(); run = null; }

      function render(p, words) {
        // p: elapsed seconds
        var spw = 60 / st.wpm;
        textEl.replaceChildren();
        if (st.style === "type") {
          var full = words.map(function (w) { return w.raw; }).join(" ");
          var cps = st.wpm * 5.5 / 60; // ~5.5 characters per spoken word incl. space
          var n = Math.min(full.length, Math.floor(p * cps));
          textEl.appendChild(document.createTextNode(full.slice(0, n)));
          textEl.appendChild(h("span", { class: "kt-cursor" }));
          return;
        }
        if (st.style === "punch") {
          var idx = Math.min(words.length - 1, Math.floor(p / spw));
          var local = Math.min(1, (p - idx * spw) / Math.min(0.25, spw));
          var s = M.EASINGS["back-out"].fn(local);
          var w = words[idx];
          textEl.appendChild(h("span", { class: "kt-word" + (w.hl ? " kt-hl" : ""), style: { transform: "scale(" + (0.6 + 0.4 * s).toFixed(3) + ")", opacity: Math.min(1, local * 2).toFixed(2), "font-size": "1.7em" }, text: w.raw }));
          return;
        }
        if (st.style === "lines") {
          var lines = [], cur = [];
          words.forEach(function (w, i) { cur.push({ w: w, i: i }); if (/[.,!?;:]$/.test(w.raw) || i === words.length - 1) { lines.push(cur); cur = []; } });
          lines.forEach(function (line) {
            var start = line[0].i * spw;
            var local = Math.min(1, Math.max(0, (p - start) / 0.45));
            var e = M.EASINGS["expo-out"].fn(local);
            var div = h("div", { style: { transform: "translateY(" + ((1 - e) * 60).toFixed(1) + "%)", opacity: local.toFixed(2), overflow: "hidden" } });
            line.forEach(function (x, j) { div.appendChild(h("span", { class: x.w.hl ? "kt-hl" : null, text: x.w.raw + (j < line.length - 1 ? " " : "") })); });
            textEl.appendChild(div);
          });
          return;
        }
        words.forEach(function (w, i) {
          var start = i * spw;
          var local = Math.min(1, Math.max(0, (p - start) / 0.3));
          var span;
          if (st.style === "highlight") {
            var active = p >= start;
            span = h("span", { class: "kt-word", style: { color: active && w.hl ? "#ffd166" : active ? "#fff" : "rgba(255,255,255,.35)", transform: w.hl && active ? "scale(" + (1 + 0.12 * M.EASINGS["back-out"].fn(local)).toFixed(3) + ")" : null }, text: w.raw });
          } else {
            var e = M.EASINGS["back-out"].fn(local);
            span = h("span", { class: "kt-word" + (w.hl ? " kt-hl" : ""), style: { opacity: Math.min(1, local * 2).toFixed(2), transform: "translateY(" + ((1 - e) * 0.4).toFixed(3) + "em) scale(" + (0.7 + 0.3 * e).toFixed(3) + ")" }, text: w.raw });
          }
          textEl.appendChild(span);
          if (i < words.length - 1) textEl.appendChild(document.createTextNode(" "));
        });
      }
      function duration(words) {
        var spw = 60 / st.wpm;
        return words.length * spw + 0.6;
      }
      function play() {
        stop();
        var words = parse();
        if (!words.length) return;
        var dur = duration(words);
        srText.textContent = words.map(function (w) { return w.raw; }).join(" ");
        run = M.tween(dur * 1000, function (p) { render(p * dur, words); }, function () { run = null; });
      }
      function showFinal() { stop(); var w = parse(); render(999, w); updateTiming(); }
      function updateTiming() {
        var n = parse().length;
        timing.textContent = n + " words at " + st.wpm + " wpm ≈ " + (n * 60 / st.wpm).toFixed(1) + " s of narration (" + (60 / st.wpm).toFixed(2) + " s per word).";
      }

      var input = h("input", { type: "text", id: "kt-text", value: st.text, maxlength: "120" });
      input.addEventListener("input", function () { st.text = input.value; showFinal(); });

      var controls = h("div", { class: "demo-controls" },
        h("div", { class: "field" }, h("label", { for: "kt-text", text: "Your line (wrap a *keyword*)" }), input),
        h("div", { class: "row" },
          h("button", { type: "button", class: "btn btn-primary", onclick: play }, ui.icon("play"), "Play"),
          h("button", { type: "button", class: "btn", onclick: showFinal }, "Show final frame")
        ),
        D.select("kt-style", "Style", [["pop", "Word by word (pop in)"], ["highlight", "Karaoke highlight"], ["lines", "Phrase lines slide up"], ["punch", "One-word punch"], ["type", "Typewriter"]], st.style, function (v) { st.style = v; showFinal(); }),
        D.range("kt-wpm", "Speaking rate", 90, 220, 5, st.wpm, function (v) { return v + " wpm"; }, function (v) { st.wpm = v; updateTiming(); }),
        D.lesson("Make it readable", [
          "Sync to the voice. Text that runs ahead of or behind the narrator splits attention.",
          "Emphasize <b>one</b> keyword per line with color or scale, not every word.",
          "One-word punches suit hooks and short social clips; for explanations, show whole phrases.",
          "Leave the final line on screen long enough to read it twice (about 1 s + 0.3 s per word).",
          "Typewriter reveals are slow to read. Keep them for code or a deliberate effect."
        ])
      );
      root.appendChild(h("div", { class: "demo-body" }, h("div", null, stage, srText, timing), controls));
      showFinal();
      return stop;
    }
  });
})();

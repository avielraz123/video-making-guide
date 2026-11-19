/* Demo: timing & stagger. */
(function () {
  "use strict";
  var VG = window.VG;

  VG.demos.push({
    id: "stagger",
    title: "Timing & stagger",
    tag: "Motion",
    intro: "When several things appear, bring them in one after another with a small delay: a stagger. It guides the eye in reading order and makes a group feel connected instead of popping in as a block. Too little delay looks like a glitch; too much makes viewers wait.",
    render: function (root) {
      var ui = VG.ui, h = ui.h, M = VG.motion, D = VG.demoUi;
      var N = 6;
      var st = { duration: 500, stagger: 80, easing: "expo-out", order: "ltr", effect: "rise" };
      var items = [];
      var stage = h("div", { class: "stage stage-16x9 stagger-stage", style: { "grid-template-columns": "repeat(" + N + ", minmax(0, 1fr))" }, role: "img", "aria-label": "Six colored cards that animate in one after another." });
      for (var i = 0; i < N; i++) { var it = h("div", { class: "stagger-item" }); items.push(it); stage.appendChild(it); }
      var tl = h("div", { class: "stagger-timeline", "aria-hidden": "true" });
      var total = h("p", { class: "small", style: { margin: "8px 0 0" } });
      var verdict = h("p", { class: "small muted", style: { margin: "4px 0 0" } });

      function orderIndex(i) {
        if (st.order === "rtl") return N - 1 - i;
        if (st.order === "center") return Math.abs(i - (N - 1) / 2) | 0;
        if (st.order === "random") return [3, 0, 5, 1, 4, 2][i];
        if (st.order === "all") return 0;
        return i;
      }
      function maxIdx() { var m = 0; for (var i = 0; i < N; i++) m = Math.max(m, orderIndex(i)); return m; }
      function drawTimeline() {
        var tot = st.duration + maxIdx() * st.stagger;
        tl.replaceChildren();
        for (var i = 0; i < N; i++) {
          var start = orderIndex(i) * st.stagger;
          tl.appendChild(h("div", { class: "st-row" }, h("i", { style: { left: (100 * start / tot) + "%", width: (100 * st.duration / tot) + "%" } })));
        }
        total.innerHTML = "Total: <b class=\"mono\">" + (tot / 1000).toFixed(2) + " s</b> = " + st.duration + " ms + " + maxIdx() + " × " + st.stagger + " ms";
        var s = st.order === "all" ? 0 : st.stagger;
        verdict.textContent = s === 0 ? "No stagger: the group lands as one block. Fine for a single unit, flat for a list."
          : s < 30 ? "Very tight: reads almost as one block, with a slight shimmer."
          : s <= 120 ? "Sweet spot: connected, and the eye follows the order."
          : s <= 200 ? "Slow: each item is its own beat. OK if the narration names each item."
          : "Too slow for a group: viewers wait. Use separate beats synced to the voice instead.";
      }
      function apply(el, v) {
        var o = Math.min(1, Math.max(0, v * 1.4));
        if (st.effect === "rise") el.style.transform = "translateY(" + ((1 - v) * 40).toFixed(2) + "%)";
        else if (st.effect === "scale") el.style.transform = "scale(" + (0.3 + 0.7 * v).toFixed(3) + ")";
        else el.style.transform = "translateX(" + ((1 - v) * -120).toFixed(2) + "%)";
        el.style.opacity = o.toFixed(3);
      }
      var run = null;
      function play() {
        if (run) run.cancel();
        var fn = M.EASINGS[st.easing].fn;
        var tot = st.duration + maxIdx() * st.stagger;
        items.forEach(function (el) { apply(el, 0); });
        run = M.tween(tot, function (p) {
          var t = p * tot;
          items.forEach(function (el, i) {
            var local = (t - orderIndex(i) * st.stagger) / st.duration;
            apply(el, fn(Math.min(1, Math.max(0, local))));
          });
        }, function () { run = null; });
      }
      function show() { if (run) run.cancel(); items.forEach(function (el) { apply(el, 1); }); }

      var controls = h("div", { class: "demo-controls" },
        h("div", { class: "row" },
          h("button", { type: "button", class: "btn btn-primary", onclick: play }, ui.icon("play"), "Play"),
          h("button", { type: "button", class: "btn", onclick: show }, "Show all")
        ),
        D.range("stg-dur", "Duration per item", 100, 1500, 50, st.duration, function (v) { return v + " ms"; }, function (v) { st.duration = v; drawTimeline(); }),
        D.range("stg-delay", "Stagger delay", 0, 400, 10, st.stagger, function (v) { return v + " ms"; }, function (v) { st.stagger = v; drawTimeline(); }),
        D.select("stg-order", "Order", [["ltr", "Left to right"], ["rtl", "Right to left"], ["center", "From the center"], ["random", "Random"], ["all", "All at once"]], st.order, function (v) { st.order = v; drawTimeline(); }),
        D.select("stg-effect", "Effect", [["rise", "Rise + fade"], ["scale", "Scale + fade"], ["slide", "Slide from left"]], st.effect, function (v) { st.effect = v; }),
        D.select("stg-ease", "Easing", Object.keys(M.EASINGS).map(function (k) { return [k, M.EASINGS[k].label]; }), st.easing, function (v) { st.easing = v; })
      );

      root.appendChild(h("div", { class: "demo-body" },
        h("div", null, stage, tl, total, verdict,
          D.lesson("Rules of thumb", [
            "Stagger of <b>40–120 ms</b> feels connected. Above ~200 ms each item becomes its own beat.",
            "Keep the <b>total</b> short: 6 items × 300 ms of delay is a 1.5 s wait.",
            "Stagger in <b>reading order</b> (left→right, top→bottom; right→left for Hebrew/Arabic layouts).",
            "If the narrator lists items, time each item to the word instead of a fixed stagger."
          ])),
        controls));
      drawTimeline();
      show();
      return function () { if (run) run.cancel(); };
    }
  });
})();

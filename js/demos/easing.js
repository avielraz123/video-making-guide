/* Demo: easing curves. Race lanes + a draggable cubic-bezier editor. */
(function () {
  "use strict";
  var VG = window.VG;

  VG.demos.push({
    id: "easing",
    title: "Easing: how things start and stop",
    tag: "Motion",
    intro: "Nothing in the real world starts or stops instantly. Easing is the speed curve of a movement, and it's the single biggest difference between motion that feels cheap and motion that feels designed. Race the lanes, change their curves, and watch the dots: each dot marks where the ball is at equal time steps, so dots close together mean slow, far apart mean fast.",
    render: function (root) {
      var ui = VG.ui, h = ui.h, M = VG.motion, D = VG.demoUi;
      var state = { duration: 900, lanes: ["linear", "ease-out", "spring"], custom: [0.2, 0.9, 0.3, 1] };
      var customFn = function (t) { return M.bezier(state.custom[0], state.custom[1], state.custom[2], state.custom[3])(t); };
      function fnFor(key) { return key === "custom" ? customFn : M.EASINGS[key].fn; }
      var COLORS = ["#ff5e52", "#34d1bf", "#a891ff", "#f3b44a"];
      var END = 0.75; // the finish line sits at 75% so overshooting curves stay inside the track

      var opts = Object.keys(M.EASINGS).map(function (k) { return [k, M.EASINGS[k].label]; }).concat([["custom", "Custom (editor below)"]]);
      var lanesEl = h("div", { class: "ease-lanes" });
      var laneRefs = [];

      function buildLanes() {
        lanesEl.replaceChildren(); laneRefs = [];
        state.lanes.forEach(function (key, i) {
          var curve = svgEl("svg", { class: "curve", viewBox: "0 0 76 76", "aria-hidden": "true" });
          curve.appendChild(svgEl("line", { x1: 8, y1: 8 + 60 * 0.3 / 1.6, x2: 68, y2: 8 + 60 * 0.3 / 1.6, stroke: "currentColor", "stroke-opacity": ".15" }));
          curve.appendChild(svgEl("line", { x1: 8, y1: 8 + 60 * 1.3 / 1.6, x2: 68, y2: 8 + 60 * 1.3 / 1.6, stroke: "currentColor", "stroke-opacity": ".15" }));
          var path = svgEl("path", { fill: "none", stroke: COLORS[i], "stroke-width": "2.5", "stroke-linecap": "round" });
          var dot = svgEl("circle", { r: 3.5, fill: COLORS[i], cx: 8, cy: 8 + 60 * 1.3 / 1.6 });
          curve.appendChild(path); curve.appendChild(dot);
          var ball = h("span", { class: "ball", style: { background: COLORS[i] } });
          var ghosts = h("span", { class: "ghosts", "aria-hidden": "true" });
          var finish = h("span", { class: "finish", "aria-hidden": "true", style: { left: "calc(16px + (100% - 32px) * " + END + ")" } });
          var track = h("div", { class: "ease-track" }, finish, ghosts, ball);
          var sel = h("select", { id: "ease-lane-" + i, "aria-label": "Easing for lane " + (i + 1) });
          opts.forEach(function (o) { sel.appendChild(h("option", { value: o[0], text: o[1], selected: o[0] === key })); });
          sel.addEventListener("change", function () { state.lanes[i] = sel.value; drawLane(i); });
          lanesEl.appendChild(h("div", { class: "ease-lane" }, curve,
            h("div", { class: "lane-main" }, h("div", { class: "lane-top" }, h("span", { class: "small", style: { "font-weight": "700" }, text: "Lane " + (i + 1) }), sel), track)));
          laneRefs.push({ path: path, dot: dot, ball: ball, ghosts: ghosts, track: track });
          drawLane(i);
        });
      }
      function drawLane(i) {
        var r = laneRefs[i], fn = fnFor(state.lanes[i]);
        r.path.setAttribute("d", M.curvePath(fn, 8, 8, 60, 60, -0.3, 1.3));
        r.ghosts.replaceChildren();
        for (var k = 0; k <= 12; k++) {
          var v = fn(k / 12);
          r.ghosts.appendChild(h("i", { style: { left: "calc(14px + (100% - 32px) * " + (v * END).toFixed(4) + ")" } }));
        }
        place(i, 0);
      }
      function place(i, t) {
        var r = laneRefs[i], v = fnFor(state.lanes[i])(t);
        var w = r.track.clientWidth - 32;
        r.ball.style.transform = "translateX(" + (Math.max(0, w) * v * END).toFixed(2) + "px)";
        r.dot.setAttribute("cx", (8 + 60 * t).toFixed(2));
        r.dot.setAttribute("cy", (8 + (1.3 - v) / 1.6 * 60).toFixed(2));
      }
      var running = null;
      function play() {
        if (running) running.cancel();
        running = M.tween(state.duration, function (p) { for (var i = 0; i < laneRefs.length; i++) place(i, p); }, function () { running = null; });
      }
      function reset() { if (running) running.cancel(); running = null; for (var i = 0; i < laneRefs.length; i++) place(i, 0); }

      /* ----- bezier editor ----- */
      var S = 200, PAD = 20, IN = 160, LO = -0.5, HI = 1.5;
      function px(x) { return PAD + x * IN; }
      function py(y) { return PAD + (HI - y) / (HI - LO) * IN; }
      function fromPx(X, Y) { return [(X - PAD) / IN, HI - (Y - PAD) / IN * (HI - LO)]; }
      var svg = svgEl("svg", { viewBox: "0 0 " + S + " " + S, role: "group", "aria-label": "Cubic bezier editor. Focus a handle and use arrow keys to move it." });
      svg.appendChild(svgEl("rect", { x: px(0), y: py(1), width: IN, height: py(0) - py(1), fill: "currentColor", "fill-opacity": ".05", stroke: "currentColor", "stroke-opacity": ".2" }));
      var l1 = svgEl("line", { stroke: "currentColor", "stroke-opacity": ".5", "stroke-width": 1.5 });
      var l2 = svgEl("line", { stroke: "currentColor", "stroke-opacity": ".5", "stroke-width": 1.5 });
      var cpath = svgEl("path", { fill: "none", stroke: COLORS[3], "stroke-width": 3, "stroke-linecap": "round" });
      svg.appendChild(l1); svg.appendChild(l2); svg.appendChild(cpath);
      svg.appendChild(svgEl("circle", { cx: px(0), cy: py(0), r: 4, fill: "currentColor" }));
      svg.appendChild(svgEl("circle", { cx: px(1), cy: py(1), r: 4, fill: "currentColor" }));
      var handles = [0, 1].map(function (k) {
        var g = svgEl("g", { class: "handle", tabindex: "0", role: "slider", "aria-label": "Control point " + (k + 1), "aria-valuetext": "" });
        g.appendChild(svgEl("circle", { r: 14, fill: "transparent" }));
        g.appendChild(svgEl("circle", { r: 8, fill: k ? "#a891ff" : "#ff5e52", stroke: "#fff", "stroke-width": 2 }));
        svg.appendChild(g);
        g.addEventListener("pointerdown", function (e) {
          e.preventDefault(); g.setPointerCapture(e.pointerId);
          function move(ev) {
            var r = svg.getBoundingClientRect();
            var p = fromPx((ev.clientX - r.left) / r.width * S, (ev.clientY - r.top) / r.height * S);
            setCP(k, p[0], p[1]);
          }
          function up() { g.removeEventListener("pointermove", move); g.removeEventListener("pointerup", up); g.removeEventListener("pointercancel", up); }
          g.addEventListener("pointermove", move); g.addEventListener("pointerup", up); g.addEventListener("pointercancel", up);
        });
        g.addEventListener("keydown", function (e) {
          var d = e.shiftKey ? 0.1 : 0.02, x = state.custom[k * 2], y = state.custom[k * 2 + 1];
          if (e.key === "ArrowLeft") x -= d; else if (e.key === "ArrowRight") x += d;
          else if (e.key === "ArrowUp") y += d; else if (e.key === "ArrowDown") y -= d; else return;
          e.preventDefault(); setCP(k, x, y);
        });
        return g;
      });
      var cssOut = h("code", { class: "mono" });
      function setCP(k, x, y) {
        state.custom[k * 2] = Math.round(Math.min(1, Math.max(0, x)) * 100) / 100;
        state.custom[k * 2 + 1] = Math.round(Math.min(HI, Math.max(LO, y)) * 100) / 100;
        drawEditor();
        state.lanes.forEach(function (key, i) { if (key === "custom") drawLane(i); });
      }
      function drawEditor() {
        var c = state.custom;
        l1.setAttribute("x1", px(0)); l1.setAttribute("y1", py(0)); l1.setAttribute("x2", px(c[0])); l1.setAttribute("y2", py(c[1]));
        l2.setAttribute("x1", px(1)); l2.setAttribute("y1", py(1)); l2.setAttribute("x2", px(c[2])); l2.setAttribute("y2", py(c[3]));
        handles[0].setAttribute("transform", "translate(" + px(c[0]) + " " + py(c[1]) + ")");
        handles[1].setAttribute("transform", "translate(" + px(c[2]) + " " + py(c[3]) + ")");
        handles[0].setAttribute("aria-valuetext", "x " + c[0] + ", y " + c[1]);
        handles[1].setAttribute("aria-valuetext", "x " + c[2] + ", y " + c[3]);
        var fn = M.bezier(c[0], c[1], c[2], c[3]);
        cpath.setAttribute("d", M.curvePath(fn, PAD, PAD, IN, IN, LO, HI));
        cssOut.textContent = "cubic-bezier(" + c.join(", ") + ")";
      }

      var presets = [["Gentle", [0.25, 0.1, 0.25, 1]], ["Snappy", [0.16, 1, 0.3, 1]], ["Anticipate", [0.6, -0.28, 0.74, 0.05]], ["Overshoot", [0.34, 1.56, 0.64, 1]]];
      var editor = h("div", { class: "bezier-editor" },
        svg,
        h("div", { class: "stack" },
          h("p", { class: "small", style: { margin: 0 }, html: "Drag the two handles (or focus one and use the arrow keys, <kbd>Shift</kbd> for bigger steps). Handles above the box make it <b>overshoot</b>; below makes it <b>anticipate</b> (pull back first)." }),
          h("div", { class: "row" }, presets.map(function (p) { return h("button", { type: "button", class: "chip", onclick: function () { state.custom = p[1].slice(); drawEditor(); state.lanes.forEach(function (key, i) { if (key === "custom") drawLane(i); }); } }, p[0]); })),
          h("div", { class: "row" }, cssOut, ui.copyButton(function () { return cssOut.textContent; }, "Copy CSS")),
          h("button", { type: "button", class: "btn btn-sm", onclick: function () { if (state.lanes.indexOf("custom") < 0) { state.lanes[2] = "custom"; buildLanes(); } play(); } }, "Race it in lane 3")
        )
      );

      var controls = h("div", { class: "demo-controls" },
        h("div", { class: "row" },
          h("button", { type: "button", class: "btn btn-primary", onclick: play }, ui.icon("play"), "Play"),
          h("button", { type: "button", class: "btn", onclick: reset }, ui.icon("replay"), "Reset")
        ),
        D.range("ease-dur", "Duration", 200, 2500, 50, state.duration, function (v) { return (v / 1000).toFixed(2) + " s"; }, function (v) { state.duration = v; }),
        D.lesson("Use it like this", [
          "<b>Ease-out</b> for things <em>entering</em>: fast start, soft landing. Your default.",
          "<b>Ease-in</b> for things <em>leaving</em>: they accelerate away.",
          "<b>Ease-in-out</b> to move something between two on-screen spots.",
          "<b>Linear</b> only for constant motion: spinning, scrolling credits, progress bars.",
          "<b>Spring / overshoot</b> adds energy. Great for one emphasis, tiring on everything.",
          "Typical video timing: small moves 0.3–0.5 s, big moves 0.6–1 s."
        ])
      );

      root.appendChild(h("div", { class: "demo-body" }, h("div", { class: "stack" }, lanesEl, h("h3", { style: { "margin-top": "22px" }, text: "Make your own curve" }), editor), controls));
      root.appendChild(h("details", { class: "disclosure" }, h("summary", { text: "The same idea in the tools Claude uses" }), h("div", { class: "disclosure-body" },
        ui.codeBlock("# Manim\nself.play(dot.animate.shift(RIGHT * 4), run_time=0.8, rate_func=rate_functions.ease_out_cubic)", "python"),
        ui.codeBlock("// Remotion\nconst x = interpolate(frame, [0, 24], [0, 400], {\n  easing: Easing.out(Easing.cubic),\n  extrapolateRight: \"clamp\",\n});\nconst pop = spring({ frame, fps, config: { damping: 12 } });", "tsx"),
        ui.codeBlock("/* CSS */\n.card { transition: transform 600ms cubic-bezier(0.16, 1, 0.3, 1); }", "css")
      )));

      buildLanes(); drawEditor();
      var onResize = function () { for (var i = 0; i < laneRefs.length; i++) place(i, 0); };
      window.addEventListener("resize", onResize);
      return function () { window.removeEventListener("resize", onResize); if (running) running.cancel(); };
    }
  });

  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  VG.svgEl = svgEl;
})();

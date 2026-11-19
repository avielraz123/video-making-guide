/* Demo: caption styles with a live readability check. */
(function () {
  "use strict";
  var VG = window.VG;

  var TEXT = "Every great video starts with one clear idea. Keep it short, show instead of tell, and give the visuals room to breathe.";
  // approximate background color behind each caption position (used for the contrast check)
  var BG_AT = { top: "#cfe6ff", middle: "#7d93b8", bottom: "#e9c89d" };

  var PRESETS = {
    bad: { label: "Unreadable", size: 1.9, weight: 300, bg: "none", color: "#ffffff", pos: "bottom", chars: 70, upper: false, pop: false },
    classic: { label: "Classic subtitles", size: 3.0, weight: 600, bg: "box", color: "#ffffff", pos: "bottom", chars: 42, upper: false, pop: false },
    social: { label: "Social word-pop", size: 5.2, weight: 900, bg: "outline", color: "#ffffff", pos: "middle", chars: 16, upper: true, pop: true }
  };

  function lum(hex) {
    var c = hex.replace("#", "");
    var rgb = [0, 2, 4].map(function (i) { var v = parseInt(c.substr(i, 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  }
  function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function mix(hexA, hexB, t) {
    var a = hexA.replace("#", ""), b = hexB.replace("#", ""), out = "#";
    for (var i = 0; i < 3; i++) {
      var v = Math.round(parseInt(a.substr(i * 2, 2), 16) * (1 - t) + parseInt(b.substr(i * 2, 2), 16) * t);
      out += (v < 16 ? "0" : "") + v.toString(16);
    }
    return out;
  }
  function wrap(text, max) {
    var words = text.split(/\s+/), lines = [], cur = "";
    words.forEach(function (w) {
      if (!cur) cur = w;
      else if ((cur + " " + w).length <= max) cur += " " + w;
      else { lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur);
    return lines;
  }

  VG.demos.push({
    id: "captions",
    title: "Caption styles",
    tag: "Accessibility",
    intro: "Lots of people watch with the sound off, and captions help everyone follow, including non-native speakers and Deaf or hard-of-hearing viewers. A caption only helps if it can be read in the time it's on screen. Start from a preset, then tweak and watch the checklist.",
    render: function (root) {
      var ui = VG.ui, h = ui.h, M = VG.motion, D = VG.demoUi;
      var st = Object.assign({}, PRESETS.bad, { boxOpacity: 0.7 });
      var bg = h("div", { class: "cap-bg", style: {
        background: "linear-gradient(180deg, #cfe6ff 0%, #a9c9ef 30%, #7d93b8 50%, #c9a57c 72%, #e9c89d 100%)"
      } },
        h("div", { style: { position: "absolute", left: "8%", top: "12%", width: "14%", "aspect-ratio": "1", "border-radius": "50%", background: "#fff6c9", "box-shadow": "0 0 40px #fff2a8" } }),
        h("div", { style: { position: "absolute", left: "0", right: "0", top: "48%", height: "12%", background: "linear-gradient(90deg, #5d6f94, #8396ba, #4c5d80)", "clip-path": "polygon(0 100%, 12% 20%, 24% 70%, 38% 0, 52% 60%, 66% 15%, 80% 65%, 92% 25%, 100% 100%)" } }),
        h("div", { style: { position: "absolute", right: "10%", bottom: "8%", width: "18%", height: "26%", background: "#f4f1ea", "border-radius": "6px", "box-shadow": "0 4px 12px rgba(0,0,0,.2)" } })
      );
      var lineWrap = h("div", { class: "cap-line-wrap" });
      var stage = h("div", { class: "stage stage-16x9 cap-stage", role: "img", "aria-label": "Example video frame with a bright, busy background and a caption drawn on top." }, bg, lineWrap);
      var scoreEl = h("ul", { class: "score-list", "aria-live": "polite" });
      var scoreHead = h("h4", null);
      var run = null, popIndex = -1;

      function textShadow() {
        if (st.bg === "outline") return "-0.12em -0.12em 0 #000, 0.12em -0.12em 0 #000, -0.12em 0.12em 0 #000, 0.12em 0.12em 0 #000, 0 0.12em 0 #000, 0 -0.12em 0 #000, 0.12em 0 0 #000, -0.12em 0 0 #000";
        if (st.bg === "shadow") return "0 0.06em 0.25em rgba(0,0,0,.9), 0 0 0.1em rgba(0,0,0,.8)";
        return "none";
      }
      function chunks() {
        // social style shows short chunks one at a time
        return wrap(TEXT, st.chars);
      }
      function draw() {
        lineWrap.replaceChildren();
        lineWrap.style.top = st.pos === "top" ? "6%" : st.pos === "middle" ? "auto" : "auto";
        lineWrap.style.bottom = st.pos === "bottom" ? "7%" : st.pos === "middle" ? "30%" : "auto";
        var lines;
        if (st.pop) {
          var all = chunks();
          var idx = popIndex >= 0 ? popIndex % all.length : 0;
          lines = [all[idx]];
        } else {
          lines = wrap(TEXT, st.chars);
        }
        var box = h("div", { class: "cap-text", style: {
          "font-size": st.size + "cqw", "font-weight": String(st.weight), color: st.color, "line-height": "1.25",
          "text-transform": st.upper ? "uppercase" : "none", "text-shadow": textShadow(),
          "letter-spacing": st.upper ? "0.01em" : "0"
        } });
        lines.forEach(function (l, i) {
          var line = h("div", null);
          var inner = h("span", { style: st.bg === "box" ? { background: "rgba(0,0,0," + st.boxOpacity + ")", padding: "0.1em 0.35em", "border-radius": "0.15em", "box-decoration-break": "clone", "-webkit-box-decoration-break": "clone" } : null });
          if (st.pop) {
            var ws = l.split(" ");
            ws.forEach(function (w, k) { inner.appendChild(h("span", { style: { color: k === ws.length - 1 ? "#ffd166" : null }, text: w })); if (k < ws.length - 1) inner.appendChild(document.createTextNode(" ")); });
          } else inner.textContent = l;
          line.appendChild(inner);
          box.appendChild(line);
        });
        lineWrap.appendChild(box);
        score(lines);
      }
      function score(lines) {
        var allLines = st.pop ? chunks() : lines;
        var longest = Math.max.apply(null, allLines.map(function (l) { return l.length; }));
        var bgCol = BG_AT[st.pos];
        var effBg = st.bg === "box" ? mix(bgCol, "#000000", st.boxOpacity) : bgCol;
        var cr = contrast(st.color, effBg);
        var localContrast = st.bg === "outline" || st.bg === "shadow";
        var pxAt1080 = Math.round(st.size / 100 * 1920);
        var checks = [
          [st.size >= 2.4, "Size ≈ " + pxAt1080 + " px on a 1080p frame (aim for ≥ ~46 px)"],
          [st.weight >= 500, "Weight " + st.weight + " (medium or bolder survives compression and small screens)"],
          [localContrast ? true : cr >= 4.5, localContrast ? "Outline/shadow gives the text its own contrast" : "Contrast " + cr.toFixed(1) + ":1 against what's behind it (aim for ≥ 4.5:1)"],
          [longest <= 42, "Longest line " + longest + " characters (aim for ≤ ~42)"],
          [st.pop || lines.length <= 2, st.pop ? "One short chunk at a time" : lines.length + " line" + (lines.length === 1 ? "" : "s") + " on screen (max 2)"],
          [st.pos !== "top", st.pos === "top" ? "Top position fights the content; use it only when the bottom has important visuals" : "Position: " + st.pos + " (where eyes expect captions)"]
        ];
        var pass = checks.filter(function (c) { return c[0]; }).length;
        scoreHead.textContent = "Readability: " + pass + " / " + checks.length;
        scoreHead.style.color = pass === checks.length ? "var(--good)" : pass >= 4 ? "var(--warn)" : "var(--bad)";
        scoreEl.replaceChildren();
        checks.forEach(function (c) { scoreEl.appendChild(h("li", { class: c[0] ? "" : "fail", text: c[1] })); });
      }
      function animate() {
        if (run) { run.cancel(); run = null; }
        var all = chunks();
        if (!st.pop) { popIndex = -1; draw(); return; }
        var per = 650, total = per * all.length;
        run = M.tween(total, function (p) { var i = Math.min(all.length - 1, Math.floor(p * all.length)); if (i !== popIndex) { popIndex = i; draw(); } }, function () { run = null; });
      }

      var ctrls = {};
      function applyPreset(k) {
        if (run) { run.cancel(); run = null; }
        st = Object.assign({ boxOpacity: 0.7 }, PRESETS[k]);
        popIndex = -1;
        ctrls.size.value = st.size; ctrls.size.dispatchEvent(new Event("input"));
        ctrls.weight.value = String(st.weight); ctrls.bg.value = st.bg; ctrls.pos.value = st.pos;
        ctrls.chars.value = st.chars; ctrls.chars.dispatchEvent(new Event("input"));
        ctrls.color.value = st.color;
        playBtn.hidden = !st.pop;
        draw();
      }
      var sizeF = D.range("cap-size", "Font size (% of frame width)", 1.2, 7, 0.1, st.size, function (v) { return v.toFixed(1) + "%"; }, function (v) { st.size = v; draw(); });
      var charsF = D.range("cap-chars", "Max characters per line", 12, 80, 1, st.chars, function (v) { return String(v); }, function (v) { st.chars = v; popIndex = -1; draw(); });
      var weightF = D.select("cap-weight", "Weight", [["300", "Light 300"], ["400", "Regular 400"], ["600", "Semibold 600"], ["800", "Bold 800"], ["900", "Black 900"]], String(st.weight), function (v) { st.weight = Number(v); draw(); });
      var bgF = D.select("cap-bg", "Background", [["none", "None"], ["shadow", "Drop shadow"], ["outline", "Outline"], ["box", "Box behind text"]], st.bg, function (v) { st.bg = v; draw(); });
      var posF = D.select("cap-pos", "Position", [["bottom", "Bottom"], ["middle", "Lower middle"], ["top", "Top"]], st.pos, function (v) { st.pos = v; draw(); });
      var colorF = D.select("cap-color", "Text color", [["#ffffff", "White"], ["#ffd166", "Yellow"], ["#cccccc", "Light gray"], ["#3a3a3a", "Dark gray"]], st.color, function (v) { st.color = v; draw(); });
      ctrls.size = sizeF.querySelector("input"); ctrls.chars = charsF.querySelector("input");
      ctrls.weight = weightF.querySelector("select"); ctrls.bg = bgF.querySelector("select"); ctrls.pos = posF.querySelector("select"); ctrls.color = colorF.querySelector("select");
      var playBtn = h("button", { type: "button", class: "btn btn-sm", hidden: true, onclick: animate }, ui.icon("play"), "Play word timing");

      var presetSeg = D.seg("Preset", Object.keys(PRESETS).map(function (k) { return [k, PRESETS[k].label]; }), "bad", applyPreset);

      root.appendChild(h("div", { class: "demo-body" },
        h("div", null, stage,
          h("div", { class: "lesson", style: { "margin-top": "12px" } }, scoreHead, scoreEl),
          D.lesson("Caption rules", [
            "Max <b>2 lines</b>, about <b>32–42 characters</b> per line, broken at natural phrase boundaries.",
            "Reading speed: keep it under ~<b>17–20 characters per second</b>; each caption on screen at least ~1 s.",
            "Burned-in (open) captions for social video; a separate <code>.srt</code>/<code>.vtt</code> file (closed captions) for YouTube, so viewers can turn them off.",
            "Claude can generate captions with Whisper from the narration audio. Always proofread names and technical terms."
          ])
        ),
        h("div", { class: "demo-controls" }, presetSeg, playBtn, sizeF, charsF, weightF, bgF, posF, colorF)
      ));
      draw();
      return function () { if (run) run.cancel(); };
    }
  });
})();

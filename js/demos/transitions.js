/* Demo: transitions between scenes. */
(function () {
  "use strict";
  var VG = window.VG;

  var INFO = {
    cut: "The default. Instant, invisible, keeps energy up. Most transitions in professional video are plain cuts.",
    fade: "Soft. Suggests time passing or a gentle change of topic. Don't crossfade between every scene.",
    wipe: "A visible, directional change, “next item”. Use one direction consistently.",
    push: "Like turning a page: the new scene pushes the old one out. Good for step 1 → step 2.",
    dip: "Fade through black: a big break, a new chapter, or the ending.",
    zoom: "Zoom into a detail of the current scene. Great for “let's look closer”; overused, it's dizzying."
  };

  VG.demos.push({
    id: "transitions",
    title: "Transitions: cut, crossfade, wipe…",
    tag: "Editing",
    intro: "A transition tells the viewer how two shots relate. A cut says “same story, next thing”. A crossfade says “some time later”. A dip to black says “new chapter”. Try each one and notice which ones you notice. That's usually the problem.",
    render: function (root) {
      var ui = VG.ui, h = ui.h, M = VG.motion, D = VG.demoUi;
      var st = { kind: "cut", duration: 600, showing: 0 };
      var a = h("div", { class: "scene scene-a" }, h("div", null, h("h3", { text: "Scene A: the problem" }), h("p", { text: "Our page takes 1.2 s to load" })));
      var b = h("div", { class: "scene scene-b" }, h("div", null, h("h3", { text: "Scene B: the fix" }), h("p", { text: "A cache cuts it to 0.4 s" })));
      var dip = h("div", { class: "dip" });
      var stage = h("div", { class: "stage stage-16x9 tr-stage", role: "img", "aria-label": "Two scenes; the button switches between them using the chosen transition." }, a, b, dip);
      var desc = h("p", { class: "small", style: { margin: "10px 0 0" }, "aria-live": "polite" });
      var scenes = [a, b];
      var run = null;

      function resetStyles(el) { el.style.opacity = ""; el.style.transform = ""; el.style.clipPath = ""; el.style.zIndex = ""; el.style.transformOrigin = ""; }
      function showOnly(i) {
        scenes.forEach(function (s, k) { resetStyles(s); s.style.opacity = k === i ? "1" : "0"; s.style.zIndex = k === i ? "2" : "1"; });
        dip.style.opacity = "0";
      }
      function go() {
        if (run) { run.cancel(); run = null; showOnly(st.showing); }
        var from = scenes[st.showing], to = scenes[1 - st.showing];
        st.showing = 1 - st.showing;
        var ease = M.EASINGS["ease-in-out"].fn;
        resetStyles(from); resetStyles(to);
        from.style.zIndex = "1"; to.style.zIndex = "2";
        from.style.opacity = "1"; to.style.opacity = "1";
        var k = st.kind;
        if (k === "cut") { showOnly(st.showing); return; }
        var frame = function (p) {
          var e = ease(p);
          if (k === "fade") { to.style.opacity = e.toFixed(3); }
          else if (k === "wipe") { to.style.clipPath = "inset(0 " + ((1 - e) * 100).toFixed(2) + "% 0 0)"; }
          else if (k === "push") { from.style.transform = "translateX(" + (-e * 100).toFixed(2) + "%)"; to.style.transform = "translateX(" + ((1 - e) * 100).toFixed(2) + "%)"; }
          else if (k === "dip") {
            if (p < 0.5) { to.style.opacity = "0"; dip.style.opacity = ease(p * 2).toFixed(3); }
            else { to.style.opacity = "1"; dip.style.opacity = (1 - ease((p - 0.5) * 2)).toFixed(3); }
          } else if (k === "zoom") {
            from.style.transformOrigin = "62% 58%";
            from.style.transform = "scale(" + (1 + e * 3).toFixed(3) + ")";
            from.style.opacity = (1 - Math.max(0, (p - 0.4) / 0.6)).toFixed(3);
            from.style.zIndex = "2"; to.style.zIndex = "1";
            to.style.transform = "scale(" + (0.85 + 0.15 * e).toFixed(3) + ")";
          }
        };
        frame(0);
        run = M.tween(st.duration, frame, function () { run = null; showOnly(st.showing); });
      }
      function setDesc() { desc.innerHTML = "<b>" + label(st.kind) + ":</b> " + INFO[st.kind]; }
      function label(k) { return { cut: "Cut", fade: "Crossfade", wipe: "Wipe", push: "Push / slide", dip: "Dip to black", zoom: "Zoom through" }[k]; }

      var controls = h("div", { class: "demo-controls" },
        D.seg("Transition", [["cut", "Cut"], ["fade", "Crossfade"], ["wipe", "Wipe"], ["push", "Push"], ["dip", "Dip to black"], ["zoom", "Zoom"]], st.kind, function (v) { st.kind = v; setDesc(); }),
        h("div", { class: "row" }, h("button", { type: "button", class: "btn btn-primary", onclick: go }, ui.icon("play"), "Switch scene")),
        D.range("tr-dur", "Duration (not used by cut)", 150, 2000, 50, st.duration, function (v) { return (v / 1000).toFixed(2) + " s"; }, function (v) { st.duration = v; }),
        D.lesson("Editing rules", [
          "Cut by default. Reach for a transition only when it <em>means</em> something.",
          "Pick 1–2 transition types for a whole video and stay consistent.",
          "Keep them short: about 0.3–0.7 s. Long transitions feel like waiting.",
          "Cut on motion or on a beat of the narration (end of a sentence) so it feels natural.",
          "Never use a transition to hide that a scene has nothing to show. Fix the scene."
        ])
      );
      root.appendChild(h("div", { class: "demo-body" }, h("div", null, stage, desc), controls));
      showOnly(0); setDesc();
      return function () { if (run) run.cancel(); };
    }
  });
})();

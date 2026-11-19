/* page-playground.js: hosts the live demos registered in js/demos/*.js */
(function () {
  "use strict";
  var VG = window.VG, ui = VG.ui, h = ui.h;

  VG.pages.playground = function () {
    var demos = VG.demos || [];
    var page = h("div", { class: "page" },
      ui.pageHead("03:00 / Playground", "Animation principles playground", "Seven small, live demos of the ideas behind good motion and good frames. Play with the controls; each one ends with rules you can hand straight to Claude (“use ease-out, 60 ms stagger, captions max 2 lines”)."),
      ui.reducedMotion() ? h("div", { class: "callout warn" }, h("p", null, "Your system asks for reduced motion, so nothing here plays on its own. The demos only move when you press Play.")) : null,
      h("nav", { class: "pg-index", "aria-label": "Demos on this page" }, demos.map(function (d) {
        return h("a", { class: "chip", href: "#/playground/" + d.id }, d.title.split(":")[0]);
      }))
    );
    var cleanups = [];
    demos.forEach(function (d, i) {
      var body = h("div", null);
      var sec = h("section", { class: "demo", id: "demo-" + d.id, "aria-labelledby": "demo-h-" + d.id },
        h("div", { class: "demo-head" },
          h("h2", { id: "demo-h-" + d.id, text: d.title }),
          h("span", { class: "timecode", style: { margin: 0 }, text: "Demo " + (i + 1) + " · " + (d.tag || "") })
        ),
        h("p", { class: "demo-intro", text: d.intro || "" }),
        body
      );
      page.appendChild(sec);
      try {
        var c = d.render(body);
        if (typeof c === "function") cleanups.push(c);
      } catch (err) {
        console.error(err);
        body.appendChild(ui.notice("This demo failed to load.", String(err && err.message || err), "⚠️"));
        VG.app.lastError = err;
      }
    });
    page.appendChild(h("div", { class: "callout" }, h("p", null, "Next: see how these ideas look in real renders on the ", h("a", { href: "#/animations" }, "Animations"), " page, or read ", h("a", { href: "#/guide/motion" }, "Motion & pacing"), " in the guide.")));
    VG.app.onLeave(function () {
      cleanups.forEach(function (c) { try { c(); } catch (e) {} });
      if (VG.motion) VG.motion.cancelAll();
    });
    return page;
  };
})();

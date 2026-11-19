/* page-claude.js: "Working with Claude" (#/claude). */
(function () {
  "use strict";
  var VG = window.VG, ui = VG.ui, h = ui.h;

  var WHO = { you: ["You", "who-you"], claude: ["Claude", "who-claude"], both: ["You + Claude", "who-both"] };

  function promptPair(s) {
    return h("div", { class: "prompt-pair" },
      h("div", { class: "prompt vague" },
        h("div", { class: "p-label" }, h("span", { text: "✗ Vague" })),
        h("p", { class: "p-text", text: s.vague })
      ),
      h("div", { class: "prompt good" },
        h("div", { class: "p-label" }, h("span", { text: "✓ Better" }), ui.copyButton(s.good)),
        h("p", { class: "p-text", text: s.good }),
        s.why ? h("p", { class: "p-why", text: s.why }) : null
      )
    );
  }

  VG.pages.claude = function () {
    var W = VG.workflow;
    var page = h("div", { class: "page" }, ui.pageHead("04:00 / Workflow", "Working with Claude", W ? W.intro : ""));
    if (!W) { page.appendChild(ui.notice("Workflow content is missing", "js/data/workflow.js didn't load.")); return page; }

    // legend
    page.appendChild(h("div", { class: "legend", style: { "margin-bottom": "18px" } },
      Object.keys(WHO).map(function (k) { return h("span", { class: "badge " + WHO[k][1], text: WHO[k][0] }); }),
      h("span", { class: "small", text: "= who does the step" })
    ));

    page.appendChild(h("section", { class: "section", "aria-labelledby": "wf-title", style: { "margin-top": "0" } },
      h("h2", { id: "wf-title", text: "The workflow, step by step" }),
      h("ol", { class: "wf-steps" }, W.steps.map(function (s, i) {
        var who = WHO[s.who] || WHO.both;
        return h("li", { class: "wf-step", id: "step-" + s.id },
          h("div", { class: "wf-num", "aria-hidden": "true" }, h("span", null, String(i + 1).padStart(2, "0"))),
          h("div", { class: "wf-body" },
            h("h3", null, s.title, h("span", { class: "badge " + who[1], text: who[0] })),
            h("p", { text: s.what }),
            s.outputs && s.outputs.length ? h("p", { class: "wf-out" }, "Produces: ", s.outputs.map(function (o, k) { return [k ? ", " : "", h("code", { text: o })]; })) : null,
            promptPair(s)
          )
        );
      }))
    ));

    page.appendChild(h("section", { class: "section", "aria-labelledby": "cando-title" },
      h("div", { class: "section-head" }, h("h2", { id: "cando-title", text: "What Claude can and can't do" }), h("p", { text: "Knowing the line makes the collaboration smooth: hand Claude everything on the left, and keep the right column for yourself." })),
      h("div", { class: "cando" },
        h("div", { class: "card can" }, h("h3", { text: "Claude can" }), h("ul", null, W.can.map(function (x) { return h("li", null, h("b", { text: x.t }), h("span", { text: x.d })); }))),
        h("div", { class: "card cant" }, h("h3", { text: "Claude can't (you do this)" }), h("ul", null, W.cant.map(function (x) { return h("li", null, h("b", { text: x.t }), h("span", { text: x.d })); })))
      )
    ));

    var treeText = W.folder.map(function (r) { return r[0] + (r[1] ? "   # " + r[1] : ""); }).join("\n");
    var pre = h("pre", { class: "tree", tabindex: "0" });
    W.folder.forEach(function (r, i) {
      pre.appendChild(document.createTextNode((i ? "\n" : "") + r[0]));
      if (r[1]) pre.appendChild(h("span", { class: "c", text: "   # " + r[1] }));
    });
    page.appendChild(h("section", { class: "section", "aria-labelledby": "folder-title" },
      h("div", { class: "section-head" }, h("h2", { id: "folder-title", text: "Recommended project layout" }), h("p", { text: "Separate the words, the sound, the scenes and the renders. Claude finds things faster, and you can redo one part without touching the rest." })),
      h("div", { class: "codeblock has-copy" }, pre, ui.copyButton(treeText))
    ));

    page.appendChild(h("section", { class: "section", "aria-labelledby": "tips-title" },
      h("h2", { id: "tips-title", text: "Tips that save hours" }),
      h("div", { class: "grid" }, W.tips.map(function (t, i) {
        return h("div", { class: "card" }, h("div", { class: "timecode", style: { "margin-bottom": "6px" }, text: "Tip " + String(i + 1).padStart(2, "0") }), h("h3", { text: t.t }), h("p", { class: "muted", style: { margin: "0" }, text: t.d }));
      }))
    ));

    page.appendChild(h("div", { class: "callout" }, h("p", null, "Ready to choose tools? Compare ", h("a", { href: "#/voices" }, "voices"), " and ", h("a", { href: "#/animations" }, "animation tools"), ", or go back to the ", h("a", { href: "#/guide/script" }, "script chapter"), " to time your script.")));
    return page;
  };
})();

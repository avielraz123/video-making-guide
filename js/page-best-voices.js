/* page-best-voices.js: "Best of AI voices" (#/best-voices). */
(function () {
  "use strict";
  var VG = window.VG, ui = VG.ui, h = ui.h;

  VG.pages.bestVoices = function () {
    var B = VG.bestVoices;
    var page = h("div", { class: "page" }, ui.pageHead("01:30 / Best AI voices", "Best of AI voices", B ? B.intro : ""));
    if (!B) { page.appendChild(ui.notice("Content is missing", "js/data/best-voices.js didn't load.")); return page; }

    page.appendChild(h("div", { class: "callout warn" },
      h("p", null, h("strong", { text: "As of " + B.asOf + ". " }), B.rankingNote)
    ));

    page.appendChild(h("section", { class: "section", "aria-labelledby": "listen-title" },
      h("div", { class: "section-head" }, h("h2", { id: "listen-title", text: "Listen here" }), h("p", { text: "All links open in a new tab. Nothing here needs an API key." })),
      h("div", { class: "grid" }, B.places.map(function (p) {
        return h("article", { class: "card place-card" + (p.start ? " start" : "") },
          h("div", { class: "ec-head row", style: { "justify-content": "space-between", "margin-bottom": "6px" } },
            h("h3", { style: { margin: 0 }, text: p.name }),
            p.start ? h("span", { class: "badge badge-accent", text: "★ Start here" }) : null
          ),
          h("div", { class: "small", style: { "font-weight": "650", color: "var(--accent-2)" }, text: p.login }),
          h("p", { class: "muted", style: { margin: "8px 0" }, text: p.what }),
          h("ul", { class: "small" }, p.can.map(function (c) { return h("li", { text: c }); })),
          h("div", { class: "place-foot" }, ui.extLink(p.url, "Open " + p.name.split(" (")[0], p.start ? "btn btn-primary btn-sm" : "btn btn-sm"))
        );
      }))
    ));

    page.appendChild(h("section", { class: "section", "aria-labelledby": "judge-title" },
      h("div", { class: "section-head" }, h("h2", { id: "judge-title", text: "How to judge a voice" }), h("p", { text: "Use the same text for every voice, listen on headphones, and score each point." })),
      h("ol", { class: "judge-list" }, B.judge.map(function (j) {
        return h("li", { class: "card" }, h("h3", { text: j.t }), h("p", { class: "muted", style: { margin: 0 }, text: j.d }));
      }))
    ));

    var P = B.paidVsFree;
    page.appendChild(h("section", { class: "section", "aria-labelledby": "paid-title" },
      h("h2", { id: "paid-title", text: "Paid vs free: when it's worth paying" }),
      h("div", { class: "grid-2" },
        h("div", { class: "card" },
          h("h3", { text: "The honest answer" }),
          h("p", { text: P.gapSmall }),
          h("p", { style: { margin: 0 } }, h("b", { text: "Bottom line: " }), P.bottomLine, " ", h("a", { href: "#/guide/narration" }, "Narration tips →"))
        ),
        h("div", { class: "card" },
          h("h3", { text: "Paid is clearly better for" }),
          h("ul", { style: { margin: 0 } }, P.paidBetter.map(function (x) { return h("li", { text: x }); }))
        )
      )
    ));

    page.appendChild(h("section", { class: "section", "aria-labelledby": "ex-title" },
      h("h2", { id: "ex-title", text: "Try it: a 10-minute listening exercise" }),
      h("div", { class: "card" },
        h("ol", { class: "exercise" }, B.exercise.map(function (x) { return h("li", { text: x }); })),
        h("div", { class: "row" },
          h("a", { class: "btn btn-primary", href: "#/voices" }, "Our free voices →"),
          ui.extLink(B.places[0].url, "Speech Arena", "btn")
        )
      )
    ));
    return page;
  };
})();

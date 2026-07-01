/* ===============================================================
   app.js — controller. Loads LAST.
   Boot order: hydrate saved data → apply theme → set page title
   from config → render (onboarding if no user yet).
   =============================================================== */
window.APP = window.APP || {};

(function () {
  const TABS = [
    { id: "home",   glyph: "⌂", label: "Home" },
    { id: "log",    glyph: "▦", label: "Log" },
    { id: "social", glyph: "◍", label: "Friends" },
    { id: "goals",  glyph: "◎", label: "Goals" },
    { id: "you",    glyph: "☻", label: "You" },
  ];

  APP.app = {
    go(id) {
      APP.state.tab = id;
      this.render();
    },

    render() {
      const onboarded = !!APP.data.user;

      APP.$("tabbar").hidden = !onboarded;
      APP.$("fab").hidden = !onboarded;

      if (!onboarded) {
        APP.$("screen").innerHTML = APP.screens.onboarding();
        return;
      }

      const tab = APP.state.tab;
      APP.$("tabbar").innerHTML = TABS.map((t) =>
        `<button class="tab ${t.id === tab ? "active" : ""}" data-t="${t.id}">
          <span class="glyph">${t.glyph}</span>${t.label}</button>`).join("");

      APP.$("screen").innerHTML = APP.screens[tab]();
      APP.$("screen").scrollTop = 0;

      if (tab === "home" && APP.data.projects.length) {
        requestAnimationFrame(() =>
          APP.progressVisual.place(APP.stats.pct(APP.stats.week())));
      }
      if (tab === "goals") APP.features.wireDrag();
    },

    init() {
      APP.data.hydrate(APP.storage.load());
      document.title = APP.config.name + " — prototype";
      APP.$("phone").dataset.theme = APP.state.theme;

      APP.$("tabbar").addEventListener("click", (e) => {
        const b = e.target.closest(".tab");
        if (b) APP.app.go(b.dataset.t);
      });
      APP.$("fab").addEventListener("click", APP.actions.openReflection);
      APP.$("overlay").addEventListener("click", APP.sheet.close);
      this.render();
    },
  };

  document.addEventListener("DOMContentLoaded", () => APP.app.init());
})();

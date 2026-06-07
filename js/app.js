/* ===============================================================
   app.js — wires everything together: builds the tab bar,
   renders the active screen, handles taps.
   =============================================================== */
window.SUMMIT = window.SUMMIT || {};

(function () {
  const TABS = [
    { id: "home",   glyph: "⌂", label: "Home" },
    { id: "log",    glyph: "▦", label: "Log" },
    { id: "social", glyph: "◍", label: "Friends" },
    { id: "goals",  glyph: "◎", label: "Goals" },
    { id: "you",    glyph: "☻", label: "You" },
  ];

  let current = "home";

  function renderTabs() {
    const bar = document.getElementById("tabbar");
    bar.innerHTML = TABS.map((t) =>
      `<button class="tab ${t.id === current ? "active" : ""}" data-screen="${t.id}">
        <span class="glyph">${t.glyph}</span>${t.label}</button>`
    ).join("");
  }

  function renderScreen() {
    document.getElementById("screen").innerHTML = SUMMIT.screens[current]();
  }

  SUMMIT.app = {
    go(id) {
      current = id;
      renderTabs();
      renderScreen();
    },

    // Show the log detail for a tapped cell.
    detail(pi, di) {
      const el = document.getElementById("detail");
      if (el) el.innerHTML = SUMMIT.screens.detailHtml(pi, di);
    },

    // Placeholder hook for "ask Claude" style buttons in a real build.
    ask(question) {
      alert(question);
    },

    init() {
      renderTabs();
      renderScreen();
      document.getElementById("tabbar").addEventListener("click", (e) => {
        const btn = e.target.closest(".tab");
        if (btn) SUMMIT.app.go(btn.dataset.screen);
      });
    },
  };

  document.addEventListener("DOMContentLoaded", SUMMIT.app.init);
})();

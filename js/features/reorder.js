/* ===============================================================
   reorder.js — drag ≡ to re-rank Goals (pointer events: mouse
   + touch). Row order in data.projects IS the stored priority.
   =============================================================== */
window.APP = window.APP || {};
APP.features = APP.features || {};

(function () {
  let dragging = null;
  let wiredGlobal = false;

  APP.features.wireDrag = function () {
    const list = APP.$("goal-list");
    if (!list) return;

    list.querySelectorAll(".handle").forEach((h) => {
      h.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        dragging = h.closest(".goal-row");
        dragging.classList.add("dragging");
      });
    });

    if (wiredGlobal) return;
    wiredGlobal = true;

    document.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const list = APP.$("goal-list");
      if (!list) { dragging = null; return; }
      const rows = [...list.querySelectorAll(".goal-row")];
      const over = rows.find((r) => {
        const b = r.getBoundingClientRect();
        return e.clientY > b.top && e.clientY < b.bottom && r !== dragging;
      });
      if (over) {
        const from = +dragging.dataset.i, to = +over.dataset.i;
        const [moved] = APP.data.projects.splice(from, 1);
        APP.data.projects.splice(to, 0, moved);
        APP.app.render();
        dragging = document.querySelector(`#goal-list .goal-row[data-i="${to}"]`);
        if (dragging) dragging.classList.add("dragging");
      }
    });

    document.addEventListener("pointerup", () => {
      if (dragging) {
        dragging.classList.remove("dragging");
        dragging = null;
        APP.storage.save();
        APP.toast("Priority updated");
      }
    });
  };
})();

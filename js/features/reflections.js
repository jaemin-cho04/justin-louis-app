/* ===============================================================
   reflections.js — FAB reflection logger with trait tagging.
   Traits come from config. Dates come from the real calendar.
   =============================================================== */
window.APP = window.APP || {};
APP.actions = APP.actions || {};

(function () {
  let tags = [];

  APP.actions.openReflection = function () {
    tags = [];
    APP.sheet.open(`
      <h3>New reflection</h3>
      <p class="sub">Capture it before it fades — tag the traits it showed.</p>
      <textarea id="refl-text" placeholder="What happened? What did it reveal about you?"></textarea>
      <div class="trait-wrap">
        ${APP.config.traits.map((t) =>
          `<button class="chip" data-tag="${t}"
            onclick="APP.actions.toggleTag(this)">${t}</button>`).join("")}
      </div>
      <button class="save-btn" onclick="APP.actions.saveReflection()">Save reflection</button>
    `);
  };

  APP.actions.toggleTag = function (btn) {
    const t = btn.dataset.tag;
    if (tags.includes(t)) {
      tags = tags.filter((x) => x !== t);
      btn.classList.remove("on");
    } else {
      tags.push(t);
      btn.classList.add("on");
    }
  };

  APP.actions.saveReflection = function () {
    const txt = APP.$("refl-text").value.trim();
    if (!txt) { APP.toast("Write a little first ✏️"); return; }
    APP.data.reflections.unshift({
      date: APP.dates.todayShort(),
      text: txt,
      tags: tags.length ? tags.slice() : ["Growth"],
    });
    APP.storage.save();
    APP.sheet.close();
    APP.toast("Reflection saved 🌱");
    if (APP.state.tab === "you") APP.app.render();
  };
})();

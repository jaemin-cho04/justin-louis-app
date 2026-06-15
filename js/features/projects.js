/* ===============================================================
   projects.js — the "+ New project" creation flow.
   Name, icon (from config palette), and type are all chosen by
   the user. New projects start with an empty 7-day log.
   =============================================================== */
window.APP = window.APP || {};
APP.actions = APP.actions || {};

(function () {
  let icon = null;
  let type = "habit";

  APP.actions.openNewProject = function () {
    icon = APP.config.icons[0];
    type = "habit";
    APP.sheet.open(`
      <h3>New project</h3>
      <p class="sub">A habit repeats. A project has a finish line.</p>
      <label class="field"><span>Name</span>
        <input id="np-name" type="text" placeholder="e.g. Morning runs" maxlength="28" /></label>

      <p class="note" style="margin-top:12px">Pick an icon</p>
      <div class="trait-wrap" id="np-icons">
        ${APP.config.icons.map((ic, i) =>
          `<button class="chip icon-chip ${i === 0 ? "on" : ""}"
            onclick="APP.actions.pickIcon(this,'${ic}')">${ic}</button>`).join("")}
      </div>

      <p class="note" style="margin-top:12px">Type</p>
      <div class="trait-wrap">
        <button class="chip on" id="np-habit" onclick="APP.actions.pickType('habit')">habit · recurring</button>
        <button class="chip" id="np-project" onclick="APP.actions.pickType('project')">project · finite</button>
      </div>

      <button class="save-btn" onclick="APP.actions.saveProject()">Create</button>
    `);
  };

  APP.actions.pickIcon = function (btn, ic) {
    icon = ic;
    document.querySelectorAll("#np-icons .chip").forEach((b) => b.classList.remove("on"));
    btn.classList.add("on");
  };

  APP.actions.pickType = function (t) {
    type = t;
    APP.$("np-habit").classList.toggle("on", t === "habit");
    APP.$("np-project").classList.toggle("on", t === "project");
  };

  APP.actions.saveProject = function () {
    const name = APP.$("np-name").value.trim();
    if (!name) { APP.toast("Name it first ✏️"); return; }
    APP.data.projects.push({
      id: "p" + Date.now(),
      icon, name, type,
      log:  ["", "", "", "", "", "", ""],
      note: ["", "", "", "", "", "", ""],
    });
    APP.storage.save();
    APP.sheet.close();
    APP.app.render();
    APP.toast(`${icon} ${name} created`);
  };
})();

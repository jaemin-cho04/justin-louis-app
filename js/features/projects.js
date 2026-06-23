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
  let visibility = "private";
  let critique = false;
  let editId = null;

  const VIS = [
    { v: "private", label: "🔒 Private" },
    { v: "friends", label: "👥 Friends" },
    { v: "public",  label: "🌐 Public" },
  ];

  function fields() {
    return `
      <p class="note" style="margin-top:12px">Pick an icon</p>
      <div class="trait-wrap" id="np-icons">
        ${APP.config.icons.map((ic) =>
          `<button class="chip icon-chip ${ic === icon ? "on" : ""}"
            onclick="APP.actions.pickIcon(this,'${ic}')">${ic}</button>`).join("")}
      </div>

      <p class="note" style="margin-top:12px">Type</p>
      <div class="trait-wrap">
        <button class="chip ${type === "habit" ? "on" : ""}" id="np-habit" onclick="APP.actions.pickType('habit')">habit · recurring</button>
        <button class="chip ${type === "project" ? "on" : ""}" id="np-project" onclick="APP.actions.pickType('project')">project · finite</button>
      </div>

      <p class="note" style="margin-top:12px">Who can see this?</p>
      <div class="trait-wrap" id="np-vis">
        ${VIS.map((o) =>
          `<button class="chip ${o.v === visibility ? "on" : ""}" data-v="${o.v}"
            onclick="APP.actions.pickVisibility(this,'${o.v}')">${o.label}</button>`).join("")}
      </div>

      <p class="note" style="margin-top:12px">Allow critique on this project?
      (Cheer and Credit are always available — Critique is opt-in.)</p>
      <div class="trait-wrap">
        <button class="chip ${critique ? "on" : ""}" id="np-crit"
          onclick="APP.actions.toggleProjectCritique(this)">💬 Critique allowed</button>
      </div>`;
  }

  APP.actions.openNewProject = function () {
    editId = null;
    icon = APP.config.icons[0];
    type = "habit";
    visibility = "private";
    critique = false;
    APP.sheet.open(`
      <h3>New project</h3>
      <p class="sub">A habit repeats. A project has a finish line.</p>
      <label class="field"><span>Name</span>
        <input id="np-name" type="text" placeholder="e.g. Morning runs" maxlength="28" /></label>
      ${fields()}
      <button class="save-btn" onclick="APP.actions.saveProject()">Create</button>
    `);
  };

  APP.actions.openEditProject = function (pi) {
    const p = APP.data.projects[pi];
    editId = p.id;
    icon = p.icon; type = p.type;
    visibility = p.visibility || "private";
    critique = !!p.critique_enabled;
    APP.sheet.open(`
      <h3>Edit project</h3>
      <p class="sub">Privacy and critique live on the project, not your account.</p>
      <label class="field"><span>Name</span>
        <input id="np-name" type="text" maxlength="28" value="${APP.esc(p.name)}" /></label>
      ${fields()}
      <button class="save-btn" onclick="APP.actions.saveProject()">Save</button>
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

  APP.actions.pickVisibility = function (btn, v) {
    visibility = v;
    document.querySelectorAll("#np-vis .chip").forEach((b) => b.classList.remove("on"));
    btn.classList.add("on");
  };

  APP.actions.toggleProjectCritique = function (btn) {
    critique = !critique;
    btn.classList.toggle("on", critique);
  };

  APP.actions.saveProject = function () {
    const name = APP.$("np-name").value.trim();
    if (!name) { APP.toast("Name it first ✏️"); return; }

    if (editId) {
      const p = APP.data.projects.find((x) => x.id === editId);
      Object.assign(p, { name, icon, type, visibility, critique_enabled: critique });
      APP.storage.save();
      APP.sheet.close();
      APP.app.render();
      APP.toast(`${icon} ${name} updated`);
      return;
    }

    APP.data.projects.push({
      id: "p" + Date.now(),
      icon, name, type, visibility,
      critique_enabled: critique,
      log:  ["", "", "", "", "", "", ""],
      note: ["", "", "", "", "", "", ""],
    });
    APP.storage.save();
    APP.sheet.close();
    APP.app.render();
    APP.toast(`${icon} ${name} created`);
  };
})();

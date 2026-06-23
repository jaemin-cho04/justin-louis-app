/* ===============================================================
   you.js — profile, stats, reflections-by-trait, settings
   (theme switch + reset). Trait list comes from config.
   =============================================================== */
window.APP = window.APP || {};
APP.screens = APP.screens || {};
APP.actions = APP.actions || {};

APP.screens.you = function () {
  const C = APP.config, D = APP.data, St = APP.state, S = APP.stats;
  const w = S.week();
  const stat = (k, v) => `<div class="stat"><div class="k">${k}</div><div class="v">${v}</div></div>`;

  const shown = St.reflFilter
    ? D.reflections.filter((r) => r.tags.includes(St.reflFilter))
    : D.reflections;

  return `
    <div class="profile">
      <div class="avatar lg">${APP.esc(D.user.name[0])}</div>
      <h2>${APP.esc(D.user.name)}</h2>
      <p class="handle-txt">${APP.esc(D.user.handle)} · ${D.friends.length} friend${D.friends.length === 1 ? "" : "s"}</p>
    </div>

    <div class="stat-grid">
      ${stat("This week", S.pct(w) + "%")}
      ${stat("Logs made", w.total)}
      ${stat("Active projects", D.projects.length)}
      ${stat("Reflections", D.reflections.length)}
    </div>

    <div class="sect">Reflections by trait</div>
    <div class="trait-wrap" style="margin-top:0;margin-bottom:12px">
      <button class="chip ${!St.reflFilter ? "on" : ""}" onclick="APP.actions.filterTrait(null)">All</button>
      ${C.traits.map((t) =>
        `<button class="chip ${St.reflFilter === t ? "on" : ""}"
          onclick="APP.actions.filterTrait('${t}')">${t}</button>`).join("")}
    </div>
    ${shown.length
      ? shown.map((r) => `
        <div class="card refl">
          <div class="when">${APP.esc(r.date)}</div>
          <div class="txt">${APP.esc(r.text)}</div>
          <div class="tags">${r.tags.map((t) => `<span class="mini-tag">${APP.esc(t)}</span>`).join("")}</div>
        </div>`).join("")
      : `<div class="card refl"><div class="txt" style="color:var(--text-3)">
          ${St.reflFilter
            ? `No reflections tagged "${APP.esc(St.reflFilter)}" yet — the ＋ button is waiting.`
            : `No reflections yet. The ＋ button captures moments before they fade.`}</div></div>`}

    <div class="sect">Settings</div>
    <div class="settings-row"><span>Appearance — ${St.theme} mode</span>
      <div class="switch ${St.theme === "dark" ? "on" : ""}" onclick="APP.actions.toggleTheme()"></div>
    </div>
    ${[
      ["Edit profile", "APP.actions.openEditProfile()"],
      ["Manage friends", "APP.actions.openManageFriends()"],
      ["Notifications", "APP.actions.openNotifications()"],
      ["Privacy", "APP.actions.openPrivacy()"],
    ].map(([s, fn]) =>
      `<div class="settings-row" style="cursor:pointer" onclick="${fn}"><span>${s}</span><span class="arrow">›</span></div>`).join("")}
    <div class="settings-row danger" onclick="APP.actions.resetAll()">
      <span>Reset prototype data</span><span class="arrow">↺</span></div>
  `;
};

APP.actions.filterTrait = function (t) {
  APP.state.reflFilter = t;
  APP.app.render();
};

APP.actions.toggleTheme = function () {
  APP.state.theme = APP.state.theme === "dark" ? "light" : "dark";
  APP.$("phone").dataset.theme = APP.state.theme;
  APP.storage.save();
  APP.app.render();
};

APP.actions.resetAll = function () {
  if (confirm("Wipe all prototype data and start over?")) APP.storage.reset();
};

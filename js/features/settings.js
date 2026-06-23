/* ===============================================================
   settings.js — the four You-screen settings rows that open sheets:
   edit profile, manage friends, notifications, privacy (per-project
   visibility, centralized). No new data sources — reads/writes the
   same user/friends/projects already in data.js.
   =============================================================== */
window.APP = window.APP || {};
APP.actions = APP.actions || {};

(function () {
  APP.actions.openEditProfile = function () {
    const u = APP.data.user;
    APP.sheet.open(`
      <h3>Edit profile</h3>
      <label class="field"><span>Your name</span>
        <input id="ep-name" type="text" maxlength="24" value="${APP.esc(u.name)}" /></label>
      <label class="field"><span>Handle</span>
        <input id="ep-handle" type="text" maxlength="24" value="${APP.esc(u.handle)}" /></label>
      <label class="field"><span>Term / season label</span>
        <input id="ep-term" type="text" maxlength="32" value="${APP.esc(u.term)}" /></label>
      <label class="field"><span>Term end date <em>(optional)</em></span>
        <input id="ep-end" type="date" value="${u.termEnd || ""}" /></label>
      <button class="save-btn" onclick="APP.actions.saveProfile()">Save</button>
    `);
  };

  APP.actions.saveProfile = function () {
    const name = APP.$("ep-name").value.trim();
    if (!name) { APP.toast("Name can't be empty ✏️"); return; }
    let handle = APP.$("ep-handle").value.trim() || "@" + name.toLowerCase().replace(/\s+/g, "");
    if (!handle.startsWith("@")) handle = "@" + handle;
    const u = APP.data.user;
    u.name = name; u.handle = handle;
    u.term = APP.$("ep-term").value.trim() || "Current term";
    u.termEnd = APP.$("ep-end").value || null;
    APP.storage.save();
    APP.sheet.close();
    APP.app.render();
    APP.toast("Profile updated");
  };

  APP.actions.openManageFriends = function () {
    const F = APP.data.friends;
    APP.sheet.open(`
      <h3>Manage friends</h3>
      <p class="sub">${F.length} friend${F.length === 1 ? "" : "s"} · demo data, no real invites yet.</p>
      ${F.length ? F.map((f, fi) => `
        <div class="settings-row">
          <span>${APP.esc(f.name)} <span style="color:var(--text-3)">${APP.esc(f.handle)}</span></span>
          <span class="arrow" style="cursor:pointer;color:var(--miss)" onclick="APP.actions.removeFriend(${fi})">remove</span>
        </div>`).join("") : `<p class="note">No friends yet.</p>`}
    `);
  };

  APP.actions.removeFriend = function (fi) {
    const f = APP.data.friends[fi];
    APP.data.friends.splice(fi, 1);
    APP.storage.save();
    APP.app.render();
    APP.actions.openManageFriends();
    APP.toast(`${f.name} removed`);
  };

  APP.actions.openNotifications = function () {
    const St = APP.state;
    APP.sheet.open(`
      <h3>Notifications</h3>
      <p class="sub">We notify for encouragement and nostalgia. We never nag you
      about unfinished tasks — that's a hard rule, not a setting.</p>
      <div class="settings-row"><span>Friend encouragement</span>
        <div class="switch ${St.notif.encouragement ? "on" : ""}" onclick="APP.actions.toggleNotif(this,'encouragement')"></div></div>
      <div class="settings-row"><span>"A year ago today"</span>
        <div class="switch ${St.notif.nostalgia ? "on" : ""}" onclick="APP.actions.toggleNotif(this,'nostalgia')"></div></div>
    `);
  };

  APP.actions.toggleNotif = function (btn, key) {
    APP.state.notif[key] = !APP.state.notif[key];
    btn.classList.toggle("on", APP.state.notif[key]);
    APP.storage.save();
  };

  APP.actions.openPrivacy = function () {
    const P = APP.data.projects;
    const visIcon = { private: "🔒", friends: "👥", public: "🌐" };
    APP.sheet.open(`
      <h3>Privacy</h3>
      <p class="sub">Privacy lives on each project, not your account.
      Tap a project on Goals to change it.</p>
      ${P.length ? P.map((p) => `
        <div class="settings-row">
          <span>${p.icon} ${APP.esc(p.name)}</span>
          <span style="color:var(--text-3)">${visIcon[p.visibility || "private"]} ${p.visibility || "private"}</span>
        </div>`).join("") : `<p class="note">No projects yet.</p>`}
    `);
  };
})();

/* ===============================================================
   onboarding.js — first run. EVERYTHING the app displays about
   the user is typed here by the user: name, handle, term label,
   optional term end date. No seed data anywhere.
   =============================================================== */
window.APP = window.APP || {};
APP.screens = APP.screens || {};
APP.actions = APP.actions || {};

APP.screens.onboarding = function () {
  const C = APP.config;
  return `
    <div class="onboard">
      <div class="logo xl">${APP.esc(C.name).toUpperCase()}</div>
      <p class="onboard-tag">${APP.esc(C.tagline)}</p>

      <label class="field">
        <span>Your name</span>
        <input id="ob-name" type="text" placeholder="e.g. Jaemin" maxlength="24" />
      </label>

      <label class="field">
        <span>Handle</span>
        <input id="ob-handle" type="text" placeholder="e.g. @jaemin" maxlength="24" />
      </label>

      <label class="field">
        <span>What are you working toward? <em>(term / season label)</em></span>
        <input id="ob-term" type="text" placeholder="e.g. Summer term" maxlength="32" />
      </label>

      <label class="field">
        <span>When does it end? <em>(optional — powers the long-term bar)</em></span>
        <input id="ob-end" type="date" />
      </label>

      <button class="save-btn" onclick="APP.actions.completeOnboarding()">Start climbing</button>
      <p class="onboard-note">Everything stays on this device. You add projects, friends,
      and logs yourself — nothing is pre-filled.</p>
    </div>`;
};

APP.actions.completeOnboarding = function () {
  const name = APP.$("ob-name").value.trim();
  if (!name) { APP.toast("What should we call you?"); return; }

  let handle = APP.$("ob-handle").value.trim() || "@" + name.toLowerCase().replace(/\s+/g, "");
  if (!handle.startsWith("@")) handle = "@" + handle;

  APP.data.user = {
    name,
    handle,
    term: APP.$("ob-term").value.trim() || "Current term",
    termEnd: APP.$("ob-end").value || null,
    firstDay: new Date().toISOString().slice(0, 10),
  };
  APP.storage.save();
  APP.app.render();
  APP.toast(`Welcome, ${name} 👋`);
};

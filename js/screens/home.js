/* ===============================================================
   home.js — Home screen. App name comes from config; user data
   comes from what the user entered. Empty state guides the
   first project creation.
   =============================================================== */
window.APP = window.APP || {};
APP.screens = APP.screens || {};
APP.actions = APP.actions || {};

APP.screens.home = function () {
  const C = APP.config, D = APP.data, St = APP.state, S = APP.stats;
  const d = S.day(APP.dates.todayIndex), w = S.week(), wp = S.pct(w);
  const term = APP.dates.termProgress();

  const head = `
    <div class="home-head">
      <span class="logo">${APP.esc(C.name).toUpperCase()}</span>
      <button class="theme-btn" onclick="APP.actions.toggleTheme()">
        ${St.theme === "dark" ? "☀️" : "🌙"}</button>
    </div>
    <h2>Hi ${APP.esc(D.user.name)} 👋</h2>
    <p class="sub">${APP.dates.todayLong()} · ${APP.esc(D.user.term)}</p>`;

  if (!D.projects.length) {
    return head + `
      <div class="card empty-card">
        <div class="empty-emoji">🏔️</div>
        <p class="empty-title">Your mountain is waiting</p>
        <p class="empty-sub">Add your first project or habit and the bars,
        the grid, and the climb all come to life.</p>
        <button class="save-btn" onclick="APP.actions.openNewProject()">＋ Create your first project</button>
      </div>`;
  }

  return head +
    (St.breakDay ? `<div class="rest-banner">☕ Break day — nothing is owed today. The mountain will wait.</div>` : "") + `
    <div class="card mountain-card">
      <div class="mtn-caption">
        <div class="big">${wp}%</div>
        <div class="small">of this week's climb</div>
      </div>
      ${APP.mountain.svg()}
    </div>

    <div class="card">
      <div class="row-flex"><span class="label">Today</span>
        <span class="value">${St.breakDay ? "—" : S.pct(d) + "%"}</span></div>
      ${S.barHtml(d)}
      <p class="note">${St.breakDay
        ? "Resting — today's goals are excluded, not missed."
        : (d.total ? `${d.done} achieved · ${d.try} attempted · ${d.miss} missed`
                   : "Nothing logged yet today — tap the Log tab to start.")}</p>
    </div>

    <div class="card">
      <div class="row-flex"><span class="label">This week</span>
        <span class="value">${S.pct(w)}%</span></div>
      ${S.barHtml(w)}
    </div>

    ${term !== null ? `
    <div class="card">
      <div class="row-flex"><span class="label">${APP.esc(APP.data.user.term)}</span>
        <span class="value muted">${term}%</span></div>
      <div class="seg"><i class="sd" style="width:${term}%"></i></div>
      <p class="note">🏔️ of the way to ${APP.esc(APP.data.user.termEnd)}</p>
    </div>` : ""}

    <button class="chip block ${St.breakDay ? "on" : ""}" onclick="APP.actions.toggleBreak()">
      ${St.breakDay ? "✓ Break day on — tap to resume" : "☕ Take a break day"}
    </button>`;
};

APP.actions.toggleBreak = function () {
  APP.state.breakDay = !APP.state.breakDay;
  APP.app.render();
  APP.toast(APP.state.breakDay ? "☕ Break day — guilt-free" : "Back on the mountain 🏔️");
};

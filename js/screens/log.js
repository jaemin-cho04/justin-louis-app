/* ===============================================================
   log.js — the grid + cell editor. Days come from dates.js
   (rolling 7-day window ending today). Rows come from the
   user's own projects.
   =============================================================== */
window.APP = window.APP || {};
APP.screens = APP.screens || {};
APP.actions = APP.actions || {};

APP.screens.log = function () {
  const D = APP.data, days = APP.dates.week(), ti = APP.dates.todayIndex;

  if (!D.projects.length) {
    return `<h2 style="font-size:18px">Daily log</h2>
      <div class="card empty-card">
        <div class="empty-emoji">▦</div>
        <p class="empty-title">No rows yet</p>
        <p class="empty-sub">The grid builds itself from your projects.</p>
        <button class="save-btn" onclick="APP.actions.openNewProject()">＋ New project</button>
      </div>`;
  }

  const head =
    `<div class="grid-row grid-head"><span></span>` +
    days.map((day, i) =>
      `<span class="col-day ${i === ti ? "today" : ""}">${day.split(" ")[1]}</span>`
    ).join("") + `</div>`;

  const rows = D.projects.map((p, pi) =>
    `<div class="grid-row"><span class="row-name">${p.icon} ${APP.esc(p.name)}</span>` +
    p.log.map((s, di) => {
      const cls = (APP.state.breakDay && di === ti && s) ? "skip" : s;
      return `<button class="cell ${cls}" onclick="APP.actions.openCell(${pi},${di})"
        aria-label="${APP.esc(p.name)} ${days[di]}"></button>`;
    }).join("") + `</div>`
  ).join("");

  return `
    <h2 style="font-size:18px">Daily log</h2>
    <p class="sub">Tap a cell to log or edit that day</p>
    ${head}${rows}
    <div class="legend">
      <span><i style="background:var(--done)"></i>achieved</span>
      <span><i style="background:var(--try)"></i>attempted</span>
      <span><i style="background:var(--miss)"></i>missed</span>
      <span><i style="background:var(--skip)"></i>skipped — never counted against you</span>
    </div>`;
};

/* ---- cell editor ---- */
let cellCtx = null;

APP.actions.openCell = function (pi, di) {
  cellCtx = { pi, di };
  const p = APP.data.projects[pi];
  const s = p.log[di];
  const days = APP.dates.week();
  const states = ["done", "try", "miss", "skip"];

  APP.sheet.open(`
    <h3>${p.icon} ${APP.esc(p.name)}</h3>
    <p class="sub">${days[di]}${
      s ? ` · currently <b style="color:var(--text-1)">${APP.STATUS_WORD[s]}</b>` : " · nothing logged"}</p>
    <div class="state-row">
      ${states.map((st) =>
        `<button class="state-btn ${s === st ? "sel b-" + st : ""}"
          onclick="APP.actions.setCell('${st}')">${APP.STATUS_WORD[st]}</button>`).join("")}
      <button class="state-btn" onclick="APP.actions.setCell('')">clear</button>
    </div>
    <p class="note" style="margin-top:2px">Skipped = a conscious choice. It's left out of your bars entirely.</p>
    <textarea id="cell-note" placeholder="Add a note for this day…">${APP.esc(p.note[di] || "")}</textarea>
    <button class="save-btn" onclick="APP.actions.saveCell()">Save</button>
  `);
};

APP.actions.setCell = function (st) {
  const { pi, di } = cellCtx;
  APP.data.projects[pi].log[di] = st;
  APP.actions.openCell(pi, di);
};

APP.actions.saveCell = function () {
  const { pi, di } = cellCtx;
  APP.data.projects[pi].note[di] = APP.$("cell-note").value;
  APP.storage.save();
  APP.sheet.close();
  APP.app.render();
  APP.toast("Logged ✓");
};

/* ===============================================================
   goals.js — priority-ordered project list (order = priority).
   Drag wiring lives in features/reorder.js; the creation flow
   lives in features/projects.js.
   =============================================================== */
window.APP = window.APP || {};
APP.screens = APP.screens || {};

APP.screens.goals = function () {
  const P = APP.data.projects;

  const addBtn = `<button class="chip block" onclick="APP.actions.openNewProject()">＋ New project</button>`;

  if (!P.length) {
    return `<h2>Goals</h2>
      <div class="card empty-card">
        <div class="empty-emoji">◎</div>
        <p class="empty-title">Nothing here yet</p>
        <p class="empty-sub">Projects have a finish line. Habits repeat.
        This page holds both — private until you choose to share.</p>
      </div>` + addBtn;
  }

  const visIcon = { private: "🔒", friends: "👥", public: "🌐" };

  return `<h2>Goals</h2>
    <p class="sub">Tap a project to edit · drag ≡ to set priority</p>
    <div id="goal-list">` +
    P.map((p, i) =>
      `<div class="goal-row" data-i="${i}">
        <span class="prio">${i + 1}</span>
        <span class="goal-name" onclick="APP.actions.openEditProject(${i})">${p.icon} ${APP.esc(p.name)}</span>
        <span class="tag">${visIcon[p.visibility || "private"]} ${p.visibility || "private"}</span>
        ${p.critique_enabled ? `<span class="tag">💬</span>` : ""}
        <span class="handle" data-handle="1">≡</span>
      </div>`).join("") +
    `</div>` + addBtn;
};

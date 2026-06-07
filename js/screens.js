/* ===============================================================
   screens.js — one render function per screen.
   Each returns an HTML string. app.js drops it into #screen.
   =============================================================== */
window.SUMMIT = window.SUMMIT || {};

(function () {
  const D = SUMMIT.data;
  const S = SUMMIT.stats;
  const STATUS_WORD = { done: "achieved", miss: "missed", try: "attempted" };

  function barCard(label, stat, opts) {
    opts = opts || {};
    const val = opts.fixed != null ? opts.fixed : S.percent(stat);
    const bar = opts.fixed != null
      ? `<div class="seg"><i class="done" style="width:${opts.fixed}%"></i></div>`
      : S.barHtml(stat);
    const note = opts.note ? `<p class="bar-note">${opts.note}</p>` : "";
    return `<div class="bar-card">
      <div class="bar-head"><span class="label">${label}</span>
      <span class="value ${opts.muted ? "muted" : ""}">${val}%</span></div>
      ${bar}${note}</div>`;
  }

  SUMMIT.screens = {
    home() {
      const d = S.day(D.today);
      const w = S.week();
      return `
        <h2>Hi ${D.user.name} 👋</h2>
        <p class="greeting">Monday, 1 June · ${D.user.term}</p>
        ${barCard("Today", d, { note: `${d.done} done · ${d.try} attempted · ${d.miss} missed` })}
        ${barCard("This week", w)}
        ${barCard("Summer term", null, { fixed: D.user.termProgress, muted: true, note: "🏔️ 6 weeks to the summit" })}
        <button class="chip block" onclick="SUMMIT.app.ask('How should a guilt-free break day work without punishing my streak?')">☕ Take a break day</button>
      `;
    },

    log() {
      const head =
        '<div class="grid-row grid-head"><span></span>' +
        D.days.map((day, i) =>
          `<span class="col-day ${i === D.today ? "today" : ""}">${day.split(" ")[1]}</span>`
        ).join("") + "</div>";

      const rows = D.projects.map((p, pi) =>
        `<div class="grid-row"><span class="row-name">${p.icon} ${p.name}</span>` +
        p.log.map((s, di) =>
          `<button class="cell ${s}" onclick="SUMMIT.app.detail(${pi},${di})" aria-label="${p.name} ${D.days[di]}"></button>`
        ).join("") + "</div>"
      ).join("");

      return `
        <h2 style="font-size:18px">Daily log</h2>
        <p class="log-sub">Tap a cell to see what you logged</p>
        ${head}${rows}
        <div class="detail" id="detail">Tap any cell above.</div>
      `;
    },

    detailHtml(pi, di) {
      const p = D.projects[pi];
      const s = p.log[di];
      if (!s) return `<b>${p.icon} ${p.name} · ${D.days[di]}</b><br>Nothing scheduled.`;
      const color = { done: "var(--done)", miss: "var(--miss)", try: "var(--try)" }[s];
      return `<b>${p.icon} ${p.name} · ${D.days[di]}</b>
        <span style="color:${color}"> ● ${STATUS_WORD[s]}</span><br>${p.note[di] || "(no note)"}`;
    },

    social() {
      return `<h2 style="font-size:18px;margin-bottom:14px">Friends</h2>` +
        D.friends.map((f) => {
          const initial = f.name[0];
          const seg = `<div class="seg">
            <i class="done" style="width:${f.week.done}%"></i>
            <i class="try" style="width:${f.week.try}%"></i>
            <i class="miss" style="width:${f.week.miss}%"></i></div>`;
          const comments = f.comments.length
            ? `<div class="comments"><p class="from">${f.name} on your week</p>${
                f.comments.map((c) => `<p>"${c}"</p>`).join("")
              }<div class="chips">
                  <button class="chip">👏 Cheer</button>
                  <button class="chip">⭐ Credit</button>
                  <button class="chip">💬 Critique</button></div></div>`
            : "";
          return `<div class="friend">
            <div class="friend-top">
              <div class="avatar ${f.comments.length ? "" : "plain"}">${initial}</div>
              <div><div class="friend-name">${f.name}</div>
              <div class="friend-meta">${f.handle} · ${f.week.done}% this week</div></div>
            </div>${seg}${comments}</div>`;
        }).join("");
    },

    goals() {
      return `<h2 style="font-size:18px">Goals</h2>
        <p class="log-sub">Private until you choose to share</p>` +
        D.projects.map((p) =>
          `<div class="goal-row"><span>${p.icon} ${p.name}</span>
           <span class="tag">${p.type}</span></div>`
        ).join("") +
        `<button class="chip block" onclick="SUMMIT.app.ask('Walk me through the new-project setup flow this Goals page should have')">+ New project</button>`;
    },

    you() {
      const w = S.week();
      const stat = (k, v) => `<div class="stat"><div class="k">${k}</div><div class="v">${v}</div></div>`;
      const setting = (x) => `<div class="settings-row"><span>${x}</span><span class="arrow">›</span></div>`;
      return `
        <div class="profile">
          <div class="avatar lg">${D.user.name[0]}</div>
          <h2>${D.user.name}</h2>
          <p class="handle">${D.user.handle} · ${D.friends.length} friends</p>
        </div>
        <div class="stat-grid">
          ${stat("This week", S.percent(w) + "%")}
          ${stat("Logs made", w.total)}
          ${stat("Active projects", D.projects.length)}
          ${stat("Best day", "Sun")}
        </div>
        ${["Edit profile", "Manage friends", "Notifications", "Appearance", "Privacy"].map(setting).join("")}
      `;
    },
  };
})();

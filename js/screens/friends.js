/* ===============================================================
   friends.js — social layer. Anti-anxiety rules:
   - % is always against the friend's OWN goals
   - critique only renders if that friend opted in
   Friends are added by the user (demo entries, since the
   prototype has no server yet).
   =============================================================== */
window.APP = window.APP || {};
APP.screens = APP.screens || {};
APP.actions = APP.actions || {};

APP.screens.social = function () {
  const F = APP.data.friends;

  const addBtn = `<button class="chip block" onclick="APP.actions.openAddFriend()">＋ Add a friend (demo)</button>`;

  if (!F.length) {
    return `<h2>Friends</h2>
      <div class="card empty-card">
        <div class="empty-emoji">◍</div>
        <p class="empty-title">No friends yet</p>
        <p class="empty-sub">Accountability works better with witnesses.
        Add a friend to see how the social layer will feel —
        their % is always against <b>their own</b> goals, never yours.</p>
      </div>` + addBtn;
  }

  return `<h2>Friends</h2>
    <p class="sub">Everyone's % is against <b>their own</b> goals — there's no leaderboard here.</p>` +
    F.map((f, fi) => {
      const comments = f.comments.length
        ? `<div class="comments"><p class="from">${APP.esc(f.name)} on your week</p>` +
          f.comments.map((c) => `<p class="c">"${APP.esc(c)}"</p>`).join("") + `</div>`
        : "";
      return `<div class="card friend">
        <div class="friend-top">
          <div class="avatar">${APP.esc(f.name[0])}</div>
          <div><div class="friend-name">${APP.esc(f.name)}</div>
          <div class="friend-meta">${APP.esc(f.handle)} · no logs yet (demo)</div></div>
          <span class="badge ${f.critique ? "" : "off"}">${f.critique ? "critique on" : "cheers only"}</span>
        </div>
        <div class="seg"></div>
        ${comments}
        <div class="chips">
          <button class="chip" onclick="APP.actions.react('👏 Cheered ${APP.esc(f.name)}')">👏 Cheer</button>
          <button class="chip" onclick="APP.actions.react('⭐ Credited ${APP.esc(f.name)}')">⭐ Credit</button>
          ${f.critique
            ? `<button class="chip" onclick="APP.actions.react('💬 Critique sent to ${APP.esc(f.name)}')">💬 Critique</button>`
            : ``}
        </div>
      </div>`;
    }).join("") + addBtn;
};

APP.actions.react = function (msg) { APP.toast(msg); };

/* ---- add friend (demo) ---- */
let friendCritique = false;

APP.actions.openAddFriend = function () {
  friendCritique = false;
  APP.sheet.open(`
    <h3>Add a friend</h3>
    <p class="sub">Demo only — real invites need the backend.</p>
    <label class="field"><span>Name</span>
      <input id="fr-name" type="text" placeholder="e.g. Louis" maxlength="24" /></label>
    <p class="note" style="margin-top:10px">Can this friend critique you, or cheers only?
    (Critique is opt-in, per person.)</p>
    <div class="trait-wrap">
      <button class="chip" id="fr-crit" onclick="APP.actions.toggleFriendCritique(this)">💬 Critique allowed</button>
    </div>
    <button class="save-btn" onclick="APP.actions.saveFriend()">Add friend</button>
  `);
};

APP.actions.toggleFriendCritique = function (btn) {
  friendCritique = !friendCritique;
  btn.classList.toggle("on", friendCritique);
};

APP.actions.saveFriend = function () {
  const name = APP.$("fr-name").value.trim();
  if (!name) { APP.toast("Give them a name ✏️"); return; }
  APP.data.friends.push({
    name,
    handle: "@" + name.toLowerCase().replace(/\s+/g, ""),
    critique: friendCritique,
    comments: [],
  });
  APP.storage.save();
  APP.sheet.close();
  APP.app.render();
  APP.toast(`${name} added 👋`);
};

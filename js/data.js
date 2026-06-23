/* ===============================================================
   data.js — the runtime data store. Starts EMPTY: every record
   here is created by the user through the UI (onboarding, the
   new-project flow, the reflection logger, add-friend).
   hydrate() restores whatever the user saved last session.

   Log states: "done" | "try" | "miss" | "skip" | ""
   "skip" is a conscious choice — EXCLUDED from all bars.
   =============================================================== */
window.APP = window.APP || {};

APP.data = {
  user: null,        // { name, handle, term, termEnd, firstDay }
  projects: [],      // { id, icon, name, type, log[7], note[7] }
  friends: [],       // { name, handle, critique, comments[] }
  reflections: [],   // { date, text, tags[] }

  hydrate(saved) {
    if (!saved) return;
    this.user = saved.user || null;
    this.projects = saved.projects || [];
    this.friends = saved.friends || [];
    this.reflections = saved.reflections || [];
    if (saved.theme) APP.state.theme = saved.theme;
    if (saved.notif) APP.state.notif = saved.notif;
  },
};

/* escape user-typed text before injecting into HTML */
APP.esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ===============================================================
   storage.js — the ONLY file that talks to persistence.
   Today: browser localStorage (works locally in VS Code preview).
   Later: replace these three functions with API calls and the
   rest of the app never knows the difference.
   =============================================================== */
window.APP = window.APP || {};

APP.storage = {
  load() {
    try {
      const raw = localStorage.getItem(APP.config.storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  },

  save() {
    try {
      localStorage.setItem(APP.config.storageKey, JSON.stringify({
        user: APP.data.user,
        projects: APP.data.projects,
        friends: APP.data.friends,
        reflections: APP.data.reflections,
        theme: APP.state.theme,
      }));
    } catch (e) { /* storage unavailable — app still works, just won't persist */ }
  },

  reset() {
    try { localStorage.removeItem(APP.config.storageKey); } catch (e) {}
    location.reload();
  },
};

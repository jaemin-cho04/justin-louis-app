/* ===============================================================
   state.js — runtime UI state only. Nothing here is user data.
   =============================================================== */
window.APP = window.APP || {};

APP.state = {
  theme: (window.APP.config && APP.config.defaultTheme) || "dark",
  tab: "home",
  breakDay: false,
  reflFilter: null,
  notif: { encouragement: true, nostalgia: true },
};

APP.$ = (id) => document.getElementById(id);

APP.STATUS_WORD = { done: "achieved", try: "attempted", miss: "missed", skip: "skipped" };

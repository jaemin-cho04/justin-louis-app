/* ===============================================================
   dates.js — real calendar, no hardcoded days.
   The visible week is a rolling window: the last 7 days, ending
   today. todayIndex is therefore always 6 (the last column).
   =============================================================== */
window.APP = window.APP || {};

APP.dates = {
  todayIndex: 6,

  // ["Fri 5", "Sat 6", ... "Thu 11"] — last 7 days ending today
  week() {
    const out = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      out.push(
        d.toLocaleDateString("en-US", { weekday: "short" }) + " " + d.getDate()
      );
    }
    return out;
  },

  todayLong() {
    return new Date().toLocaleDateString("en-US",
      { weekday: "long", month: "long", day: "numeric" });
  },

  todayShort() {
    const d = new Date();
    return d.toLocaleDateString("en-US",
      { weekday: "short", month: "short", day: "numeric" });
  },

  // % of the way from the user's first day to their term end date.
  termProgress() {
    const u = APP.data.user;
    if (!u || !u.termEnd || !u.firstDay) return null;
    const start = new Date(u.firstDay).getTime();
    const end = new Date(u.termEnd).getTime();
    const now = Date.now();
    if (end <= start) return null;
    return Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
  },
};

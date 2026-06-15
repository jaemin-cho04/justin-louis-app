/* ===============================================================
   stats.js — turns log entries into bars.
   THE RULE: bars are computed, never stored.
   "skip" is excluded from the denominator (skip ≠ miss).
   A break day excludes ALL of today (denominator = 0).
   =============================================================== */
window.APP = window.APP || {};

APP.stats = {
  day(i) {
    const out = { done: 0, try: 0, miss: 0, total: 0 };
    if (APP.state.breakDay && i === APP.dates.todayIndex) return out;
    APP.data.projects.forEach((p) => {
      const s = p.log[i];
      if (s && s !== "skip") { out[s]++; out.total++; }
    });
    return out;
  },

  week() {
    const out = { done: 0, try: 0, miss: 0, total: 0 };
    for (let i = 0; i < 7; i++) {
      const d = this.day(i);
      out.done += d.done; out.try += d.try;
      out.miss += d.miss; out.total += d.total;
    }
    return out;
  },

  pct(s) { return s.total ? Math.round((s.done / s.total) * 100) : 0; },

  barHtml(s) {
    const w = (v) => (s.total ? (v / s.total) * 100 : 0);
    return `<div class="seg">
      <i class="sd" style="width:${w(s.done)}%"></i>
      <i class="st" style="width:${w(s.try)}%"></i>
      <i class="sm" style="width:${w(s.miss)}%"></i></div>`;
  },
};

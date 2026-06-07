/* ===============================================================
   stats.js — turns log entries into the colored bars.

   The bar is never stored; it is COMPUTED from the logs every
   time. dayStats() counts a single column, weekStats() counts the
   whole grid. Change the data and the bars update for free.
   =============================================================== */
window.SUMMIT = window.SUMMIT || {};

SUMMIT.stats = {
  // Count done / try / miss for one day (column index `i`).
  day(i) {
    const out = { done: 0, try: 0, miss: 0, total: 0 };
    SUMMIT.data.projects.forEach((p) => {
      const s = p.log[i];
      if (s) { out[s]++; out.total++; }
    });
    return out;
  },

  // Count across the whole visible week.
  week() {
    const out = { done: 0, try: 0, miss: 0, total: 0 };
    SUMMIT.data.projects.forEach((p) =>
      p.log.forEach((s) => { if (s) { out[s]++; out.total++; } })
    );
    return out;
  },

  // Percentage of counted items that are "done".
  percent(stat) {
    return stat.total ? Math.round((stat.done / stat.total) * 100) : 0;
  },

  // Build the segmented bar HTML for a stat object.
  barHtml(stat) {
    const w = (v) => (stat.total ? Math.round((v / stat.total) * 100) : 0);
    return (
      '<div class="seg">' +
      `<i class="done" style="width:${w(stat.done)}%"></i>` +
      `<i class="try" style="width:${w(stat.try)}%"></i>` +
      `<i class="miss" style="width:${w(stat.miss)}%"></i>` +
      "</div>"
    );
  },
};

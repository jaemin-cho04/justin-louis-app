/* ===============================================================
   progress-visual.js — Home hero. Marker position = weekly %.
   Like the bars, the visual is a computed VIEW of the logs.
   =============================================================== */
window.APP = window.APP || {};

APP.progressVisual = {
  svg() {
    return `
    <svg viewBox="0 0 354 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="progress-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="var(--visual-a)"/>
          <stop offset="1" stop-color="var(--visual-b)"/>
        </linearGradient>
      </defs>
      <rect width="354" height="180" fill="url(#progress-bg)"/>
      <circle cx="300" cy="38" r="14" fill="var(--brand)" opacity=".55"/>
      <rect x="28" y="120" width="78" height="34" rx="17" fill="var(--visual-c)" opacity=".72"/>
      <rect x="120" y="92" width="92" height="62" rx="24" fill="var(--visual-d)" opacity=".68"/>
      <rect x="226" y="68" width="88" height="86" rx="28" fill="var(--visual-c)" opacity=".82"/>
      <path id="progress-path" d="M34 144 C 96 136, 154 110, 210 92 C 252 78, 284 62, 318 36"
        fill="none" stroke="var(--stroke)" stroke-width="1.5" stroke-dasharray="4 5"/>
      <circle id="progress-marker" class="progress-marker" r="6" fill="#fff" stroke="var(--brand)" stroke-width="3"/>
      <text id="progress-label" font-size="11" fill="var(--text-2)"></text>
    </svg>`;
  },

  place(pct) {
    const path = APP.$("progress-path"), dot = APP.$("progress-marker");
    if (!path || !dot) return;
    const L = path.getTotalLength();
    const p = path.getPointAtLength((L * Math.min(pct, 100)) / 100);
    dot.setAttribute("cx", p.x);
    dot.setAttribute("cy", p.y - 6);
    const flag = APP.$("progress-label");
    if (pct >= 100) {
      flag.setAttribute("x", p.x - 28);
      flag.setAttribute("y", p.y - 16);
      flag.textContent = "done";
    }
  },
};

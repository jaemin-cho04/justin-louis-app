/* ===============================================================
   mountain.js — Home hero. Climber position = weekly %.
   Like the bars, the visual is a computed VIEW of the logs.
   =============================================================== */
window.APP = window.APP || {};

APP.mountain = {
  svg() {
    return `
    <svg viewBox="0 0 354 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="var(--sky-a)"/>
          <stop offset="1" stop-color="var(--sky-b)"/>
        </linearGradient>
      </defs>
      <rect width="354" height="180" fill="url(#sky)"/>
      <circle cx="300" cy="38" r="14" fill="var(--brand)" opacity=".55"/>
      <path d="M-10 180 L90 95 L150 132 L230 60 L300 110 L370 70 L370 180 Z" fill="var(--mtn-c)" opacity=".7"/>
      <path d="M-10 180 L70 110 L130 150 L210 75 L290 130 L370 95 L370 180 Z" fill="var(--mtn-b)" opacity=".85"/>
      <path id="slope" d="M6 172 C 90 168, 160 130, 230 88 C 270 64, 300 48, 322 30"
        fill="none" stroke="var(--stroke)" stroke-width="1.5" stroke-dasharray="4 5"/>
      <path d="M-10 180 L120 140 L200 160 L370 120 L370 180 Z" fill="var(--mtn-a)"/>
      <polygon points="322,30 318,12 330,18" fill="var(--brand)"/>
      <circle id="climber" class="climber" r="6" fill="#fff" stroke="var(--brand)" stroke-width="3"/>
      <text id="climber-flag" font-size="11" fill="var(--text-2)"></text>
    </svg>`;
  },

  place(pct) {
    const path = APP.$("slope"), dot = APP.$("climber");
    if (!path || !dot) return;
    const L = path.getTotalLength();
    const p = path.getPointAtLength((L * Math.min(pct, 100)) / 100);
    dot.setAttribute("cx", p.x);
    dot.setAttribute("cy", p.y - 6);
    const flag = APP.$("climber-flag");
    if (pct >= 100) {
      flag.setAttribute("x", p.x - 28);
      flag.setAttribute("y", p.y - 16);
      flag.textContent = "summit! 🏔️";
    }
  },
};

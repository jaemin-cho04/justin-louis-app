/* ===============================================================
   config.js ★ THE ONE FILE TO EDIT WHEN YOU PICK A NAME ★
   Everything in the app reads from here — the logo, the page
   title, the onboarding headline, the saved-data key. Change
   `name` below and the whole app rebrands instantly.
   =============================================================== */
window.APP = window.APP || {};

APP.config = {
  /* ── identity ─────────────────────────────────────────── */
  name: "Prototype",            // ← your future app name goes here
  tagline: "productivity with friends",

  /* ── behavior defaults ────────────────────────────────── */
  defaultTheme: "dark",         // "dark" | "light"

  /* trait tags offered in the reflection logger.
     Edit freely — the UI builds itself from this list. */
  traits: ["Teamwork", "Communication", "Leadership", "Resilience",
           "Failure", "Growth", "Advocacy", "Scholarship"],

  /* a small emoji palette for the new-project picker */
  icons: ["📌", "🏃", "💪", "📚", "💻", "📈", "🛰️", "📨", "🎨", "🧪", "🎸", "🧠"],

  /* key the browser saves under. Changing it = fresh start. */
  storageKey: "app-prototype-v3",
};

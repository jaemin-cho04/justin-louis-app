/* ===============================================================
   data.js — the app's seed data, translated from Cho's Excel.

   In the real app this would come from a database (see the ERD:
   USER, PROJECT, TASK/HABIT, LOG_ENTRY, COMMENT). Here it's a
   plain object so the prototype runs with no backend.

   Each project is a column from the spreadsheet.
   Each project.log[i] is the status for day i of `days`:
     "done" = blue  (achieved)
     "miss" = red   (missed)
     "try"  = amber (attempted)
     ""     = nothing scheduled
   project.note[i] is the detail you logged that day.
   =============================================================== */
window.SUMMIT = window.SUMMIT || {};

SUMMIT.data = {
  user: { name: "Cho", handle: "@cho", term: "Summer term", termProgress: 18 },

  // The visible week. `today` is the index that's highlighted.
  days: ["Fri 29", "Sat 30", "Sun 31", "Mon 1", "Tue 2", "Wed 3", "Thu 4"],
  today: 3,

  projects: [
    { id: "runs", icon: "🏃", name: "Runs", type: "habit",
      log:  ["done", "done", "done", "miss", "done", "done", "miss"],
      note: ["5k", "5k", "5k", "Rest — legs sore", "5k", "5k", "Skipped"] },

    { id: "body", icon: "💪", name: "Body weight", type: "habit",
      log:  ["miss", "miss", "done", "done", "done", "miss", "done"],
      note: ["", "", "200 pushups", "200 pushups", "50 pullups", "", "200 pushups"] },

    { id: "jobs", icon: "📨", name: "Jobs", type: "habit",
      log:  ["miss", "done", "done", "miss", "", "", ""],
      note: ["", "17 applications", "10 — Tesla intern", "none", "", "", ""] },

    { id: "linkedin", icon: "🔗", name: "LinkedIn", type: "habit",
      log:  ["miss", "done", "done", "miss", "", "", ""],
      note: ["", "30 reachouts", "10 reachouts", "none", "", "", ""] },

    { id: "books", icon: "📚", name: "Books", type: "habit",
      log:  ["miss", "try", "done", "done", "done", "done", "done"],
      note: ["", "30 min", "1 hr", "30 min", "30 min", "30 min", "30 min"] },

    { id: "news", icon: "📰", name: "News", type: "habit",
      log:  ["miss", "miss", "done", "done", "", "", ""],
      note: ["", "", "Bezos fireball, Meta layoffs, Siri on-device",
             "Anthropic IPO, Opus 4.8, Google Spark", "", "", ""] },

    { id: "cpp", icon: "💻", name: "C++ LinAlg", type: "project",
      log:  ["miss", "done", "done", "miss", "", "", ""],
      note: ["", "Started project", "Vec3 done, defined operators", "", "", "", ""] },

    { id: "stocks", icon: "📈", name: "Stock study", type: "project",
      log:  ["miss", "miss", "miss", "done", "done", "", ""],
      note: ["", "", "", "FCX, CCJ, OKLO, FLNC, CRWV — AI / nuclear thesis",
             "SpaceX IPO June 12 plan", "", ""] },

    { id: "cubesat", icon: "🛰️", name: "Western CubeSat", type: "project",
      log:  ["done", "miss", "done", "done", "", "", ""],
      note: ["Refurbished GitHub", "", "Claude tool connections",
             "Mat3, Claude + Obsidian second brain", "", "", ""] },
  ],

  friends: [
    { name: "Louis", handle: "@louis", week: { done: 71, try: 12, miss: 17 },
      comments: [
        "Good shit. Be more specific about the articles you read — plan the topics so you have a schedule.",
        "Set some goals in advance this week so you have a plan to follow.",
      ] },
    { name: "Raymond", handle: "@ray", week: { done: 54, try: 0, miss: 46 }, comments: [] },
  ],
};

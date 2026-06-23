# App Prototype

A runnable mobile-style prototype for a social productivity app. No installation, no build step — pure HTML, CSS, and JavaScript.

## How to run and interact with the app

This prototype is already runnable as a browser app. You can interact with it locally in any modern browser.

**Option 1 — npm start:**
```bash
npm start
```
Then open `http://localhost:8000`.

**Option 2 — Python local server:**
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000`.

**Option 3 — just open it:**
Double-click `index.html`. Works in any modern browser, though the local server options above are more reliable.

If you are using a cloud editor or Codespaces-like environment, start the server with `npm start`, open/forward port `8000`, and use the forwarded URL to interact with the app.

## What you can do

First launch shows an onboarding screen — enter your name, handle, term label, and optional end date. Everything the app shows about you comes from what you type here, nothing is pre-filled.

- **Home** — mountain hero (climber position = weekly %), today's bar, week bar, term progress bar, break-day toggle
- **Log** — 7-day rolling grid (rows = your projects, columns = days). Tap any cell to log achieved / attempted / missed / skipped. Skipped is never counted against you.
- **Friends** — add demo friends, toggle critique vs cheers-only per person, react with cheer / credit / critique
- **Goals** — priority-ordered project list; drag ≡ to reorder
- **You** — stats, reflections filtered by trait, theme toggle, reset

## File structure

```
├── index.html
├── css/
│   ├── variables.css        design tokens — colors live here only (dark + light themes)
│   ├── base.css             reset + page background
│   ├── phone.css            phone shell, notch, tab bar, FAB
│   ├── components.css       shared: cards, bars, chips, sheet, toast
│   └── screens/
│       ├── onboarding.css
│       ├── home.css
│       ├── log.css
│       ├── friends.css
│       ├── goals.css
│       └── you.css
└── js/
    ├── config.js            ★ rename the app here — the only file to edit on rebrand
    ├── storage.js           persistence (localStorage today, swap for API later)
    ├── data.js              runtime store — starts empty, filled by the user
    ├── state.js             UI state (current tab, theme, break day, filter)
    ├── dates.js             real calendar dates — nothing hardcoded
    ├── stats.js             bar math — computed, never stored
    ├── components/
    │   ├── toast.js
    │   ├── sheet.js
    │   └── mountain.js
    ├── screens/
    │   ├── onboarding.js
    │   ├── home.js
    │   ├── log.js
    │   ├── friends.js
    │   ├── goals.js
    │   └── you.js
    ├── features/
    │   ├── projects.js      new project creation flow
    │   ├── reflections.js   FAB reflection logger
    │   └── reorder.js       drag-to-reorder goals
    └── app.js               controller — loads last
```

## Renaming the app

Open `js/config.js` and change the `name` field. The logo, page title, onboarding headline, and storage key all update automatically.

## How data flows

`data.js` starts empty. The user fills it in through the UI (onboarding, new-project flow, reflection logger, add-friend). `storage.js` persists it to `localStorage` — swap those three functions for API calls and the rest of the app never knows the difference.

Log states: `"done"` (achieved) · `"try"` (attempted) · `"miss"` (missed) · `"skip"` (conscious choice, excluded from all bars)

The bars in `stats.js` are a computed view of those logs — nothing about a bar is stored, it recalculates on every render.

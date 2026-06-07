# Summit — productivity app prototype

A rough, runnable prototype of the social productivity app, built from
Cho's daily-log spreadsheet. "Summit" is just a working name (a nod to
the little-guy-climbing-a-mountain progress-bar idea).

## How to run it

No installation, no build step. Two options:

1. **Easiest:** double-click `index.html` — it opens in your browser and works.
2. **If anything looks off** (some browsers are strict about local files),
   run a tiny local server from this folder:
   ```
   python3 -m http.server 8000
   ```
   then open http://localhost:8000 in your browser.

## What you can do

- **Home** — daily / weekly / term progress bars, computed live from the logs.
- **Log** — the spreadsheet, rebuilt: projects as rows, days as columns.
  Tap any colored cell to see the note you logged. Blue = achieved,
  red = missed, amber = attempted, empty = nothing scheduled.
- **Friends** — friends' bars and Louis's comments flowing in from the
  social layer, plus cheer / credit / critique actions.
- **Goals** — your projects, tagged habit vs project.
- **You** — account summary.

## How the files are organized

```
summit-prototype/
├── index.html          the page; loads everything, holds the phone frame
├── css/
│   ├── variables.css   colors + design tokens (change colors here once)
│   ├── base.css        reset + the "desk" the phone sits on
│   ├── phone.css       the iPhone shell: frame, notch, status bar, tabs
│   └── screens.css     styling for the screens inside the phone
└── js/
    ├── data.js         seed data, translated from the Excel
    ├── stats.js        computes the bars from the log entries
    ├── screens.js      one render function per screen
    └── app.js          navigation + tap handling
```

## How it maps to the data model

This mirrors the ERD we sketched: `data.js` holds the `USER`, the
`PROJECT`s (the columns), each with `log` + `note` arrays that stand in
for `LOG_ENTRY` records, plus `friends` and their `COMMENT`s. The bars in
`stats.js` are a *computed view* of those logs — nothing about the bar is
stored, it's recalculated from the data every render. Change a value in
`data.js`, reload, and every screen updates.

## To change the data

Open `js/data.js`. Each project has a `log` array (one entry per day:
`"done"`, `"miss"`, `"try"`, or `""`) and a matching `note` array. Edit
those and reload the page.

# Brand-Ready Mobile App

A mobile-first social productivity app prototype built with Expo, React Native, and TypeScript.

The final product name is intentionally undecided. Runtime copy, Expo metadata, bundle IDs, URL scheme, storage namespace, and brand colors are centralized in `src/config/brand.json` so the name can be replaced later without searching the whole codebase.

## Product Spine

- **Projects** are the main goal containers.
- **Tasks** are one-time deliverables with due dates.
- **Habits** recur on selected weekdays.
- **Log entries** are the core record: `done`, `attempted`, `missed`, `skipped`, or `deferred`.
- **Progress bars** are computed views of log entries, not separate stored state.
- **BreakDays** defer the day's scheduled items without turning them into failures.
- **Reflections** can be tagged with default and CanMEDS-style traits.
- **Friends** show progress relative to their own goals, with critique opt-in.

## Current Screens

- **Onboarding** - name, handle, term label.
- **Home** - daily progress, next scheduled items, rest-day toggle, date navigation, log and reflection entry.
- **Log** - scheduled tasks and habits for the selected day with five logging states.
- **Friends** - close-friend progress, cheer/credit/critique feedback model.
- **Goals** - project priority, privacy, and creation.
- **You** - private stats, trait counts, recent reflections, reset demo data.

## Architecture

The app is organized by feature and responsibility:

- `src/shell` - app shell and tab routing.
- `src/config` - brand config and feature flags.
- `src/domain` - model types, fixtures, and selectors.
- `src/features` - feature-specific screens/components.
- `src/services` - storage and app-state orchestration.
- `src/shared` - reusable UI, theme, and utilities.

Every source file must stay under 700 lines. Files approaching 500 lines should be split.

## How To Rename The App

Edit `src/config/brand.json`:

- `appDisplayName`
- `appTagline`
- `appSlug`
- `urlScheme`
- `iosBundleId`
- `androidPackage`
- `storageNamespace`
- `primaryColor`
- `secondaryColor`
- `icon`

Expo reads those values through `app.config.js`. Runtime UI reads them through `src/config/brand.ts`.

## Run It

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npm run start
```

Open on iOS Simulator:

```bash
npm run ios
```

Open on Android:

```bash
npm run android
```

## Preview In VS Code Or Expo Go

VS Code:

1. Install the recommended extensions when VS Code prompts you, especially **React Native Tools**.
2. Open the Run and Debug panel.
3. Choose **Debug Expo Go**.
4. Scan the QR code with Expo Go, or use the dev-server link shown by Expo.

Expo Go can be used with multiple app projects. Start whichever project you want, then open that project's QR/link in Expo Go. If another project is already running, Expo Go simply switches to the newly opened project.

If two projects fight over the same Metro port, stop one server or start this one with a new port:

```bash
npx expo start --port 8082
```

Desktop browser preview:

```bash
npx expo export --platform web --output-dir dist-web
cd dist-web
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173/`.

Static HTML prototype:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

Verify:

```bash
npm run verify
```

Bundle check:

```bash
npx expo export --platform ios --output-dir dist
```

## Next Product Work

- Finish task/habit editing flows.
- Add guided first-project setup.
- Build reflection search and CanMEDS retrieval views.
- Add invite-based friends, then backend sync.
- Add notification, widget, and App Intent surfaces only after the core loop feels excellent.

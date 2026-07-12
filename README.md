# Progress

Progress is a mobile-first social productivity app for tracking habits and projects with a small circle of friends. It combines daily logging, milestone-based goals, private reflection, and optional social accountability without turning progress into a leaderboard.

Built with Expo, React Native, and TypeScript, the current prototype runs on iOS, Android, and the web. Its interface follows the supplied Progress design specifications and adapts across compact and large iPhone screen sizes.

## Features

- **Home dashboard** with weekly progress, daily breakdowns, and bounded day navigation.
- **Progress Log** for marking scheduled work as done, attempted, missed, skipped, or deferred.
- **Goals** for creating recurring habits or finite projects with editable milestone lists.
- **Friends** with personal progress bars, shared task details, and persisted task comments.
- **Archives** organized by projects and habits, including drill-down history and editable notes.
- **You** profile with personal statistics, profile editing, notification preferences, privacy information, and local-data reset.
- **Local persistence** through SQLite on native devices and local storage on the web.
- **Responsive layout** with safe-area and home-indicator support across iPhone sizes.

## Product Principles

- Progress is measured against each person's own goals.
- Green means completed, purple means attempting or active, and gray means incomplete.
- Friends only see information that has been intentionally shared.
- Logging is flexible and supports retroactive updates without turning rest into failure.
- Progress summaries are calculated from log entries rather than stored as duplicate state.

## Tech Stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- Expo SQLite
- React Native Safe Area Context
- Expo Vector Icons

## Run On A Phone

Install the dependencies:

```bash
npm install
```

Start Expo:

```bash
npx expo start
```

Install Expo Go on your phone, connect the phone and computer to the same Wi-Fi network, and scan the displayed QR code. If the local connection is unavailable, use:

```bash
npx expo start --tunnel
```

To clear the Metro cache:

```bash
npx expo start --clear
```

## Other Run Commands

```bash
npm run ios
npm run android
npm run web
```

## Verification

Run the full local verification suite:

```bash
npm run verify
```

This runs TypeScript checking, source-size and brand-configuration checks, and progress-selector tests.

Create an export bundle when checking production bundling:

```bash
npx expo export --platform ios --output-dir dist
```

## Project Structure

```text
src/
  config/      Brand configuration and feature flags
  domain/      Models, fixtures, and progress selectors
  features/    Home, logging, goals, friends, archives, and profile screens
  services/    Persistent storage and app-state actions
  shared/      Reusable UI, theme tokens, and date utilities
  shell/       Application shell and tab routing
```

The older static HTML/CSS/JavaScript prototype remains in the repository as an early design and architecture reference. The Expo app under `src/` is the active implementation.

## Current Status

This repository contains a functional local-first prototype. Core interactions persist on the device, but friend data is still simulated and there is no remote account, authentication, synchronization, notification delivery, or production backend yet.

Likely next steps include editing existing goals, friend invitations and account management, backend synchronization, media support, richer archive filtering, and production notification flows.

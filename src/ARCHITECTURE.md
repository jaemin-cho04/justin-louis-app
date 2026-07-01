# Mobile App Architecture

This app is intentionally brand-ready and feature-organized.

## Rules

- Keep every file under 700 lines; split files around 500 lines.
- Keep screens as composition only: they receive data and callbacks.
- Put business rules in `src/domain`.
- Put storage and sync boundaries in `src/services`.
- Put reusable UI in `src/shared`.
- Put product areas in `src/features`.
- Keep brand/name metadata in `src/config/brand.json`.

## Current Layout

- `src/shell` - app shell and tab routing.
- `src/config` - brand config and feature flags.
- `src/domain` - model types, fixtures, and selectors.
- `src/features` - feature-specific screens/components.
- `src/services` - storage and state orchestration.
- `src/shared` - reusable UI, theme, and utilities.

## Rename Flow

Update `src/config/brand.json` first. Expo metadata reads from that file through `app.config.js`, and runtime UI reads it through `src/config/brand.ts`.

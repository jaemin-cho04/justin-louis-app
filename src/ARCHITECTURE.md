# Progress App Architecture

This app is intentionally brand-ready and feature-organized.

The complete runtime, backend, synchronization, security, and operational design is documented in [`docs/SYSTEM_DESIGN.md`](../docs/SYSTEM_DESIGN.md). The dependency rules below are enforced by `npm run check:architecture`.

## Rules

- Keep every file under 700 lines; split files around 500 lines.
- Keep screens as composition only: they receive data and callbacks.
- Put business rules in `src/domain`.
- Put storage and sync boundaries in `src/services`.
- Put reusable UI in `src/shared`.
- Put product areas in `src/features`.
- Keep brand/name metadata in `src/config/brand.json`.
- Treat `src/shell` as the composition root. It is the only layer that wires feature UI directly to infrastructure capabilities.
- Keep `src/domain` platform-independent and keep feature screens away from storage, remote, media, notification, privacy, and monitoring adapters.

## Current Layout

- `src/shell` - app shell and tab routing.
- `src/config` - brand config and feature flags.
- `src/domain` - model types, fixtures, and selectors.
- `src/features` - feature-specific screens/components.
- `src/services` - storage and state orchestration.
- `src/shared` - reusable UI, theme, and utilities.

## Rename Flow

Update `src/config/brand.json` first. Expo metadata reads from that file through `app.config.js`, and runtime UI reads it through `src/config/brand.ts`.

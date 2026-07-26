# Production runbook

## Architecture and permissions

- Private app state is local-first and synchronized to `app_snapshots`, one row per authenticated user.
- Friend requests, friendships, expiring invites, collaborators, shared projects, push tokens, and media metadata are normalized Postgres records.
- Every client-visible table has row-level security. Shared-project writes require ownership or an editor membership. Private media lives in the non-public `progress-media` bucket under the authenticated user's folder.
- Account deletion runs server-side, removes stored media, deletes the Auth user, and relies on foreign-key cascades for application records.

Apply and validate locally:

```bash
supabase start
supabase db reset
supabase db lint --level error
supabase test db
supabase functions serve
```

Deploy after linking the intended project:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
supabase functions deploy delete-account
supabase functions deploy export-account
supabase functions deploy send-notification
```

Never place the service-role key in Expo environment variables. Edge Functions receive it only from Supabase's server environment.

## Required environment

Configure development, preview, and production values separately:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_EAS_PROJECT_ID`
- `EXPO_PUBLIC_SENTRY_DSN`
- `EXPO_PUBLIC_APP_ENV`
- Sentry organization/project/auth token for source-map upload in the build environment

## Notifications

Create Android FCM v1 credentials and an Apple push notification key in EAS. Push notifications require a development or production build and a physical device; Expo Go is not a valid acceptance environment. Verify foreground, background, terminated, denied-permission, token-refresh, and revoked-token scenarios on both platforms.

## Quality gates

- GitHub CI runs TypeScript, domain/CRUD/migration/performance tests, accessibility source checks, high-severity dependency auditing, all-platform Expo exports, Supabase lint, and database schema tests.
- `.eas/workflows/quality.yml` builds Android and iOS preview artifacts and runs the Maestro user journeys.
- Exercise large Dynamic Type, VoiceOver, TalkBack, reduced motion, screen rotation, background/foreground, force quit, offline edits, conflict recovery, low storage, slow network, and media permission denial on real devices before release.
- Confirm Sentry receives a deliberately triggered non-production test error and resolves source maps before enabling production traffic.

## Store release

1. Confirm ownership of the configured slug, scheme, bundle ID, and Android package; provide final icon, adaptive icon, splash art, and release version before the first store build.
2. Supply support URL, privacy-policy URL, data-safety disclosures, App Privacy answers, screenshots, description, age rating, and review credentials.
3. Complete the first Google Play upload manually, then configure EAS Submit credentials.
4. Run the manual production workflow. It builds both stores and pauses for approval before submission.
5. Start with internal/TestFlight testing, then a staged rollout. Watch crash-free sessions, API/Edge Function errors, auth failures, sync-pending diagnostics, push receipt errors, and deletion failures.
6. Document rollback ownership. Native regressions require a replacement build; compatible JavaScript regressions may use an EAS Update only when the runtime version matches.

## Incident response

- User-visible render failures include an incident reference and are captured without default PII.
- Supabase logs cover database, Auth, Storage, and Edge Function failures. `security_events` is service-only and records sensitive account operations.
- For data incidents: pause rollout, preserve logs, identify affected user IDs without exporting unrelated records, repair through a reviewed migration, notify affected users when legally required, and rotate exposed secrets.

# Progress system design

## Goals and constraints

Progress is a local-first mobile application for private planning, reflective logging, and optional close-friend collaboration. The design prioritizes:

- useful offline behavior with no required account;
- explicit privacy boundaries between private snapshots and shared records;
- deterministic, testable domain mutations;
- recoverable persistence and visible synchronization failures;
- replaceable platform and backend adapters;
- small operational surface area suitable for an early production release.

The application is not designed as a real-time document editor. Whole-account snapshots use optimistic concurrency and shared projects use separate permissioned records. If collaborative editing becomes simultaneous and high-frequency, shared projects should move to operation-level changes or a CRDT rather than extending snapshot synchronization.

## Runtime context

```text
                    +-----------------------------+
                    |        Expo client          |
                    | iOS / Android / limited web |
                    +-------------+---------------+
                                  |
                    local-first reads and writes
                                  |
                  +---------------v---------------+
                  | SQLite (native) / localStorage|
                  | versioned AppData envelopes   |
                  +---------------+---------------+
                                  |
                         authenticated sync
                                  |
      +---------------------------v---------------------------+
      |                        Supabase                       |
      | Auth | Postgres/RLS | Realtime | Storage | Functions |
      +--------+-------------+----------+---------+-----------+
               |                                      |
      private account snapshot              push/export/deletion
      and permissioned social data             server operations
                                                      |
                                              Expo Push Service

      Client and function failures -> Sentry (when configured)
      Source, schema, and bundle checks -> GitHub Actions
```

## Client layering and dependency direction

The dependency direction is enforced by `scripts/check-architecture.mjs`.

| Layer | Responsibility | May depend on |
| --- | --- | --- |
| `config` | Runtime and brand configuration | static values only |
| `domain` | Types, invariants, operations, selectors | domain and pure shared utilities |
| `shared` | Reusable UI and pure utilities | config and domain |
| `features` | Screen composition and interaction state | domain and shared; capabilities arrive through props |
| `services` | Storage, authentication, synchronization, remote APIs, monitoring | config, domain, and pure shared utilities |
| `shell` | Composition root and navigation state | every layer |

Feature screens do not know whether data is stored in SQLite or Supabase. `App.tsx` selects adapters and supplies callbacks. This keeps local mode useful, makes infrastructure replaceable, and allows domain behavior to be tested without React Native.

## Core data model

`AppData` is the local aggregate. It owns the current profile, projects, memberships, work items, logs, reflections, local social fixtures, insights, achievements, break days, traits, and forward-compatible custom fields.

Important invariants:

- IDs are stable and relationships point to existing parents.
- A log is unique per work item and date after normalization.
- Project deletion cascades to its work items and their logs in domain operations.
- Reflections remain private unless a future explicit sharing model is added.
- Visibility is explicit: `private`, `closeFriends`, or `sharedCollaborators`.
- Remote data is rebound to the authenticated user ID before entering the store.
- Unknown optional data can survive through `metadata` and `customFields`; required fields remain typed.

Every persisted local value uses an envelope containing `schemaVersion`, `revision`, `savedAt`, and normalized `data`. Schema decoding repairs malformed or disconnected records and returns structured diagnostics rather than allowing invalid data into screens.

## Persistence and synchronization

### Local writes

1. A feature calls a domain action supplied by the shell.
2. The action produces the next immutable `AppData` value.
3. `useAppStore` queues a local save and exposes `saving`, `saved`, or `error` state.
4. SQLite serializes writes per repository instance. Web uses the same envelope in localStorage.

Local persistence is the durability boundary for user interaction. A remote outage does not discard the edit.

### Authenticated synchronization

1. Startup loads both local and remote snapshots.
2. The newest recorded snapshot is selected and normalized.
3. Saves commit locally first, then call `save_app_snapshot` with the expected remote revision.
4. Postgres locks the row and rejects stale revisions.
5. Network or permission failures produce a visible diagnostic while the local copy remains intact.
6. Synchronization retries on the next save and when the app returns to the foreground.
7. Realtime snapshot events update the local cache only when their revision is newer than the last accepted remote revision.

Whole-snapshot conflict behavior is intentionally last-writer-wins after optimistic conflict detection and refresh. This is acceptable for the private, single-user aggregate, but the limitation must remain visible in product documentation. Social and collaborative records do not use this mechanism.

### Shared projects

Shared projects live in `shared_projects` and `project_collaborators`, outside the private snapshot. Owners and editors update through permission-checked operations; viewers have read-only access. Invitations are expiring, revocable, usage-limited tokens. Owner-only deletion removes invitations and memberships before deleting shared data.

## Backend boundaries

| Capability | Storage/API | Authorization boundary |
| --- | --- | --- |
| Identity/profile | Supabase Auth + `profiles` | self-update; limited connected-user reads |
| Private app data | `app_snapshots` + `save_app_snapshot` | authenticated owner only |
| Friends | requests, friendships, preferences, comments | participant policies and RPC checks |
| Collaboration | shared projects, collaborators, invites | owner/editor/viewer policies |
| Notifications | preferences, push tokens, delivery ledger | self-managed tokens/preferences; server delivery |
| Media | private Storage bucket + `media_objects` | user-ID path ownership |
| Export/deletion | Edge Functions | authenticated server-side orchestration |
| Security audit | `security_events` | server writes; no direct client policy |

All public tables have row-level security enabled. Sensitive mutations use security-definer functions with an explicit `search_path`, revoked public execution, authenticated grants, record locking where required, and server-derived `auth.uid()` ownership.

## Privacy and threat model

Protected assets include private reflections, task history, account snapshots, friend comments, shared-project contents, media, tokens, and account identity.

Primary controls:

- only publishable Supabase configuration is embedded in the client;
- database authorization is enforced by RLS, not client UI;
- media is stored in a private bucket under the authenticated user path;
- profile lookup requires an exact handle and excludes the caller;
- exports are written to temporary storage and shared through the operating system;
- Sentry disables default PII collection and receives only an opaque user ID;
- account deletion is a server operation, followed by local account-cache removal;
- destructive UI actions require explicit confirmation.

Production review must verify function secrets, token redaction, storage policies, dependency audit results, retention expectations, privacy disclosures, and rate limits. Client-side validation improves usability but is never an authorization control.

## Reliability and failure behavior

| Failure | Expected behavior |
| --- | --- |
| Local record is malformed | Normalize/repair it, load safe data, show a diagnostic |
| Local database write fails | Keep UI state, expose persistence error, report incident |
| Network is unavailable | Continue locally and mark synchronization pending |
| Remote permission fails | Preserve local data and show a permission diagnostic |
| Revision conflict | Refresh remote revision and retry according to snapshot policy |
| Realtime cache write fails | Keep remote snapshot in memory and report cache failure |
| Render crashes | Error boundary shows a recoverable screen and incident ID |
| Push/media/export fails | Keep core data intact and show capability-specific feedback |

The app never treats a remote response as trusted domain data before normalization. Destructive account operations are separate from ordinary snapshot saving.

## Performance and scalability

- Selector indexes avoid repeated full-array scans for relationships and are tested at 10,000 log records.
- Screen rendering consumes precomputed selectors where repeated lookup matters.
- Realtime subscriptions are scoped by authenticated user or participant data.
- Friend comments are indexed by friendship and creation time.
- Notification deliveries have a rate-limit lookup index.
- Media is object storage, not database JSON.

The private snapshot is intentionally simple but will eventually become inefficient. Re-evaluate the aggregate when compressed payloads approach 2 MB, a user exceeds roughly 50,000 logs, synchronization latency regularly exceeds one second, or conflict frequency becomes noticeable. The migration path is append-only log rows plus paginated projections, while retaining the repository interface.

## Observability and operations

- Persistence state and diagnostics are visible in the Privacy panel.
- Unexpected errors receive an incident ID and are sent to Sentry when configured.
- Monitoring is tagged by environment and uses sampled tracing in production.
- CI runs type checks, domain tests, architecture, accessibility, brand, dependency audit, production bundles, database lint/tests, and Edge Function type checks.
- Maestro flows define critical user journeys; they should run on a macOS simulator CI job before release.

Release health should monitor crash-free sessions, startup latency, synchronization failures, Edge Function errors, notification delivery failures, database saturation, and storage growth. Alert thresholds and ownership belong in the production runbook once hosting projects exist.

## Deployment topology and environments

Use separate Supabase, Sentry, and EAS projects for development, staging, and production. Environment selection comes from build-time public configuration; service-role keys and provider secrets exist only in Supabase/EAS secret stores. Database migrations are forward-only and must pass schema tests before deployment.

Recommended release order:

1. Run source, architecture, domain, database, and Edge Function checks.
2. Build all platform bundles.
3. Deploy migrations to staging, then functions.
4. Run authenticated staging smoke tests and Maestro journeys.
5. Build signed store artifacts from an immutable commit.
6. Roll out gradually and inspect crash, sync, and notification metrics.
7. Promote the same migration/function versions to production.

Rollback favors application rollback for client defects and forward-fix migrations for database defects. Never depend on destructive database rollback after clients may have written the new schema.

## Design decisions and future triggers

| Decision | Current choice | Revisit when |
| --- | --- | --- |
| Offline storage | SQLite snapshot | payload or query thresholds above are reached |
| Private sync | optimistic whole snapshot | concurrent-device conflicts become material |
| Collaboration | separate permissioned records | live simultaneous editing is introduced |
| Navigation | shell-owned tab/modal state | deep-link graph or nested navigation expands |
| Backend | Supabase managed services | compliance, region, or scale requires separation |
| Monitoring | Sentry plus structured diagnostics | product analytics or formal SLOs are approved |

Any new feature must define ownership, privacy classification, offline behavior, authorization rule, failure UI, migration strategy, observability, deletion/export behavior, and automated tests before being considered complete.

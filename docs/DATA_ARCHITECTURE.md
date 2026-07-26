# Progress data architecture

Progress uses a local-first data layer with a stable boundary between storage and UI.

## Data flow

1. `AppDataRepository` loads a persisted local snapshot and, when signed in, compares it with the authenticated remote snapshot.
2. `appDataSchema` migrates legacy shapes, repairs invalid relationships, and returns typed `AppData` with structured diagnostics.
3. `useAppStore` owns persistence lifecycle state; `appActions` contains the independently testable mutations.
4. Screens receive data and callbacks only; they do not read SQLite or browser storage.
5. Selectors build lookup indexes for efficient project, work-item, log, and trait relationships.
6. Changes are written locally first inside a versioned persistence envelope, then remotely; failed network writes surface `sync_pending` and retry on the next save or foreground transition.

## Persistence envelope

Every saved snapshot includes:

- `schemaVersion`: identifies the storage contract.
- `revision`: increases with each queued save.
- `savedAt`: records when the snapshot was written.
- `data`: the normalized application data.

Legacy unwrapped snapshots remain readable. New migrations belong in `appDataSchema.ts`, keeping storage adapters and screens unchanged.

## Error visibility

Repository loads return diagnostics with stable codes, severity, collection, and a user-readable message. Development builds emit structured `[data]` console events. The Privacy panel shows current save state, revision, and the first data-health notice. Unexpected render failures are caught by `AppErrorBoundary`, which logs a component stack and gives the user an incident reference instead of a blank screen.

## Extension points

Core records support typed `metadata` with tags and custom JSON values. `AppData.customFields` supports future feature-level data without weakening required core fields.

The Supabase adapter implements the same boundary. Social data uses normalized, permissioned tables because friend requests and collaborators require multi-user transactions. Shared projects are isolated from private snapshots and use owner/viewer/editor policies plus permission-checked RPCs.

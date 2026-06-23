# [APP_NAME] — Claude Code Project Context
> **App name is NOT decided.** The placeholder used in early files was "Summit" — ignore it entirely.
> Always use `[APP_NAME]` in code constants, config, and comments until the real name is chosen.
> The single source of truth for the name is `src/config/app.ts` → `APP_NAME`. One edit, updates everywhere.
---
## What this app is
A **social productivity tracker** for close friend groups. Users log daily progress on personal habits and projects, and friends can see each other's progress and leave reactions. The core feeling is anti-anxiety accountability — progress tracking that motivates without punishing.
**Target users:** Students, pre-med applicants, researchers, athletes.
**Closest references:** Strava (social layer), our personal Excel habit-tracking spreadsheet (log grid), Duolingo (engagement feel) — but more minimal and less anxiety-inducing than all of them.
---
## Tech Stack
| Layer | Choice | Why |
|---|---|---|
| Framework | **React Native + Expo** | JavaScript (familiar), cross-platform iOS + Android, Linux-compatible dev |
| Language | **TypeScript** | Catch data model errors early; strongly type log states |
| Navigation | **Expo Router** | File-based routing, mirrors Next.js patterns |
| State | **Zustand** | Lightweight, no boilerplate; global store for user + logs |
| Backend/Auth | **Supabase** | Postgres + auth + realtime; swap-friendly if needed |
| Styling | **NativeWind** (Tailwind for RN) | Utility-first, fast iteration |
| Animations | **React Native Reanimated** | Smooth 60fps; needed for progress bar fills and gestures |
| Build / App Store | **Expo EAS Build** | Cloud builds — no Mac required for iOS compilation |
| Icons | **Expo Vector Icons** | Built-in, no extra setup |
### Development on Linux
- **You do not need a Mac to build for iOS.** EAS Build compiles in Anthropic's cloud.
- Test locally with **Expo Go** app on a physical iPhone — instant preview, no build needed.
- For production App Store submissions, use `eas build --platform ios` from your Linux terminal.
---
## Core Product Principles
These are decided. Do not introduce features that contradict them.
### 1. Skip ≠ Miss — first-class distinction
Four log states exist: `achieved` | `attempted` | `missed` | `skip`
- `skip` means "I consciously chose not to today" — no penalty
- `missed` means "I forgot or failed to log" — counts against
- **Skip is excluded from the bar denominator.** A day with 3 items where 1 is skipped has a denominator of 2, not 3.
- This is not a UX nicety. It shapes bar math throughout the entire app.
### 2. Bars are computed, never stored
Progress bars are always derived from `LOG_ENTRY` records at render time. Never cache or persist a bar value. Change the underlying logs, reload, bars update automatically.
```
bar % = achieved_weight / (total_weight - skip_weight)
```
### 3. Break days zero the denominator
A Break Day excludes all of a day's scheduled items from the denominator. Nothing turns red. The bar simply shows as a neutral rest state. It is mechanically identical to skipping every item simultaneously.
### 4. Friends see relative-to-their-own-goals progress
The Friends tab shows each person's completion percentage against their own scheduled items — not head-to-head raw counts. This is the anti-anxiety social design. Nobody is "behind" someone else; they're only measured against their own plan.
### 5. Privacy lives on the project, not the account
Each project has its own visibility setting (`private` | `friends` | `public`). Users can share fitness goals while hiding job applications. All-or-nothing privacy is not supported.
### 6. Critique is opt-in per project
The three social reactions are: **Cheer** (default, always available) · **Credit** (acknowledge achievement) · **Critique** (push for more). Critique can only be left if the project owner has enabled it for that project. This controls the app's culture.
### 7. Anti-anxiety notification rule
We notify for friend encouragement and nostalgia ("a year ago today"). We never nag about unfinished tasks. Every new notification type must pass this test: *would the user thank us for this, or feel pressured by it?*
---
## Data Model
### Core entities
```
USER
  id, username, display_name, avatar_url, timezone, created_at
PROJECT
  id, owner_id, title, icon, type: 'habit' | 'project',
  effort_weight: 1 | 2 | 3,  -- optional, defaults to 1
  visibility: 'private' | 'friends' | 'public',
  critique_enabled: boolean,
  color_tag, created_at, archived_at
  Note: habit = recurs on a cadence forever
        project = finite, has a completion state
MEMBERSHIP  -- enables joint projects
  project_id, user_id, role: 'owner' | 'collaborator', joined_at
LOG_ENTRY  -- the heart of the entire app
  id, project_id, user_id, date (user's local date, not UTC),
  status: 'achieved' | 'attempted' | 'missed' | 'skip',
  note: string?,
  duration_minutes?: number,
  satisfaction?: 1 | 2 | 3 | 4 | 5,
  logged_at (actual timestamp for late-logging detection)
REFLECTION  -- separate from log entries
  id, user_id, date, body, media_urls[],
  linked_project_id?,  -- optional link to a project
  tags: string[],      -- e.g. ["teamwork", "failure", "communication"]
  created_at
COMMENT
  id, author_id, target_user_id, project_id?,
  type: 'cheer' | 'credit' | 'critique',
  body, created_at
FRIENDSHIP
  user_a_id, user_b_id, status: 'pending' | 'accepted', created_at
```
### What every feature is actually derived from
| Feature | What it really is |
|---|---|
| Daily bar | `LOG_ENTRY` rows for today, aggregated |
| Weekly bar | `LOG_ENTRY` rows for this week, aggregated |
| Term bar | completed weight ÷ total project weight |
| Friends feed | Friends' recent `LOG_ENTRY` rows |
| "A year ago today" | `LOG_ENTRY` rows where `date = today - 365 days` |
| Account summary | All your `LOG_ENTRY` rows, sliced by date range |
| Reflections by tag | `REFLECTION` rows filtered by `tags` array |
---
## Navigation (5 tabs)
```
Home      — daily + weekly bars, today's log grid, break day button
Log       — spreadsheet view: projects as rows, days as columns, tap cell to log
Friends   — scrollable friend cards, each with their own relative bar + reactions
Goals     — create/edit projects and habits, set visibility and critique toggle
You       — account summary, stats, reflections archive, settings
```
Tab names are not finalized. The structure is.
---
## Design System
### Colors (design tokens in `src/theme/colors.ts`)
```typescript
// Status colors — used on log cells and bars ONLY
achieved: '#378ADD'   // blue
attempted: '#EF9F27'  // amber
missed:    '#E24B4A'  // red
skip:      '#9C9A92'  // grey
// Brand — purple, NEVER used as a status color
brand:         '#7C3AED'   // primary purple (exact shade TBD, test options)
brand_soft:    '#EDE9FE'
brand_glow:    '#A78BFA'   // for neon/glass highlights
// Surfaces
bg_dark:   '#0D0D0F'   // primary dark background
bg_card:   '#1A1A1F'   // card/glass surface
bg_soft:   '#242428'
text_1:    '#F5F5F5'
text_2:    '#A0A0A8'
text_3:    '#606068'
border:    'rgba(255,255,255,0.08)'
```
**Rule:** Purple is brand identity. Blue/amber/red/grey are status indicators. These must never mix. A purple progress bar is wrong. A purple button is correct.
### Aesthetic
- Dark background with glassmorphism surfaces (`backdrop-filter: blur`, semi-transparent cards)
- Neon purple accents on interactive elements
- Minimal — no visual clutter, generous whitespace
- Smooth animations on all state changes (Reanimated)
- Signature visual: figure ascending a mountain trail, trail fills with color proportional to weekly %
### Typography
Custom font (TBD — not system default Arial/Helvetica). Font family set once in theme, used everywhere.
---
## File Structure
```
/
├── app/                    Expo Router screens (file = route)
│   ├── (tabs)/
│   │   ├── index.tsx       Home
│   │   ├── log.tsx         Log grid
│   │   ├── friends.tsx     Friends
│   │   ├── goals.tsx       Goals
│   │   └── you.tsx         Account / You
│   ├── onboarding/
│   │   └── index.tsx
│   └── _layout.tsx         Root layout, tab bar config
│
├── src/
│   ├── config/
│   │   └── app.ts          ← APP_NAME lives here. One edit, updates everywhere.
│   ├── theme/
│   │   ├── colors.ts       All color tokens
│   │   └── typography.ts   Font scale
│   ├── store/              Zustand stores
│   │   ├── user.ts
│   │   ├── logs.ts
│   │   └── friends.ts
│   ├── lib/
│   │   ├── supabase.ts     Supabase client (sole DB touchpoint)
│   │   ├── barMath.ts      Bar computation logic — tested independently
│   │   └── dates.ts        Local-timezone date helpers
│   ├── components/
│   │   ├── ui/             Primitives (Button, Card, Avatar, Badge)
│   │   ├── bars/           ProgressBar, SegmentedBar
│   │   ├── log/            LogGrid, LogCell, LogDetailSheet
│   │   ├── friends/        FriendCard, ReactionChips
│   │   └── goals/          ProjectCard, NewProjectSheet
│   └── hooks/              useLogs, useFriends, useBarStats, etc.
│
├── assets/                 Icons, images, fonts
├── CLAUDE.md               This file
└── app.json                Expo config (app name placeholder until decided)
```
---
## Bar Math Reference
```typescript
// barMath.ts — canonical implementation
type LogStatus = 'achieved' | 'attempted' | 'missed' | 'skip';
interface LogEntry {
  status: LogStatus;
  weight: 1 | 2 | 3;  // effort weight, defaults to 1
}
function computeBar(entries: LogEntry[]) {
  const counted = entries.filter(e => e.status !== 'skip');
  const total   = counted.reduce((s, e) => s + e.weight, 0);
  const achieved = counted.filter(e => e.status === 'achieved')
                          .reduce((s, e) => s + e.weight, 0);
  const attempted = counted.filter(e => e.status === 'attempted')
                           .reduce((s, e) => s + e.weight, 0);
  const missed   = counted.filter(e => e.status === 'missed')
                          .reduce((s, e) => s + e.weight, 0);
  if (total === 0) return { achieved: 0, attempted: 0, missed: 0, percent: 0 };
  return {
    achieved:  Math.round((achieved  / total) * 100),
    attempted: Math.round((attempted / total) * 100),
    missed:    Math.round((missed    / total) * 100),
    percent:   Math.round((achieved  / total) * 100),  // headline %
  };
}
```
**Break day:** pass an empty `entries` array — returns all zeros, bar renders as neutral rest state.
---
## Midnight / Late Logging Rules
- "Today" is always the **user's local date** (use their timezone, stored on `USER`).
- At midnight, unlogged items do **not** auto-set to `missed`. They roll forward as a gentle "yesterday, unlogged" prompt on next app open.
- The user self-logs: `achieved / attempted / missed / skip`. The app never decides for them.
- Late logging is allowed (exact cutoff TBD — proposal: up to 3 days back).
---
## Open Design Questions (not yet decided)
- Exact app name and logo
- Exact purple shade (needs testing on dark background)
- Whether streaks exist at all (tension with anti-anxiety goal)
- Break day streak interaction (does it protect a streak if streaks exist?)
- New project setup flow on Goals tab
- Authentication method: email/password vs phone number
- Friend cap (intentional intimacy constraint vs open growth)
- Seasonal themes (Christmas, Halloween) — fun idea, not scheduled
- Sound effects on logging — not decided
- Reflections feature: CanMEDS tag set vs fully custom tags
---
## Things Claude Code Should Never Do
- Use "Summit" as the app name anywhere in code, comments, or strings — use `APP_NAME` from config
- Store a computed bar value in the database — always compute from `LOG_ENTRY`
- Treat `skip` as a form of `missed` in any calculation
- Use purple (`brand`) as a status color on log cells or progress bars
- Add notifications that nag users about their own unfinished tasks
- Show a friend's absolute progress number — always show relative to their own goals
- Make the UI more complex to add a feature — minimalism is a hard constraint

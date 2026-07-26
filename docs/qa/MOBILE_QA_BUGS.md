# Mobile QA Bugs

## QA-001

Bug ID: QA-001
Title: Home displays fixed mock progress and task details for every day
Severity: High
Status: Fixed and verified
Feature: Home
Environment: Web export, 390x844
Preconditions: Seed data loaded
Steps to reproduce: Open Home, tap Next day, inspect the expanded run detail.
Expected: Greeting, summary, scheduled items, status, and notes match persisted data for the selected date.
Actual: June 1, 62%, Runs, and the same run note remained visible for every date.
Reproduction rate: 2/2
Evidence: Browser assertion showed tomorrow label and stale current-day log simultaneously.
Logs: No runtime error.
Root cause: Home rendered hardcoded draft constants rather than selectors/store data.
Files changed: `src/features/home/screens/HomeScreen.tsx`, `src/shared/utils/dates.ts`
Fix: Derive dates, weekly summary, scheduled items, logs, status, notes, and empty state from AppData.
Regression test: Relative breakdown-label assertions.
Verification: Tomorrow displayed its own tasks and removed today's note; +/-2 bounds passed.
Remaining risk: Native rendering not exercised.

## QA-002

Bug ID: QA-002
Title: Four friend cards do not open detail
Severity: Medium
Status: Fixed and verified
Feature: Friends
Environment: Web export, 390x844
Preconditions: Friends list open
Steps to reproduce: Tap Michelle, Raymond, Justin, or Jay.
Expected: Selected friend detail opens.
Actual: List remained visible; only Louis had a detail branch.
Reproduction rate: 3/3 sampled before fix
Evidence: Michelle detail caption absent after tap.
Logs: None.
Root cause: Conditional rendering handled only `selectedFriend === "Louis"`.
Files changed: `src/features/social/screens/FriendsScreen.tsx`
Fix: Store the selected friend object and render the common detail/comment flow for all five.
Regression test: Interactive browser retest.
Verification: Michelle detail caption and persisted comment passed.
Remaining risk: Friend data remains simulated.

## QA-003

Bug ID: QA-003
Title: Archive project rows advertise drill-down but have no action
Severity: Medium
Status: Fixed and verified
Feature: Archives
Environment: Web export, 390x844
Preconditions: Archives / Projects open
Steps to reproduce: Tap any project row with a chevron.
Expected: Project archive detail opens.
Actual: Nothing happens.
Reproduction rate: 3/3
Evidence: Rows lacked button semantics/action in accessibility snapshot.
Logs: None.
Root cause: Project row `onPress` was undefined.
Files changed: `src/features/archives/screens/ArchivesScreen.tsx`
Fix: Added project selection/detail route and milestone/empty states.
Regression test: Interactive browser retest.
Verification: MCAT prep opens project detail.
Remaining risk: Seed projects have no milestone history.

## QA-004

Bug ID: QA-004
Title: Archive labels unrelated logs as running history
Severity: High
Status: Fixed and verified
Feature: Archives / Habits
Environment: Web export, 390x844
Preconditions: Seed logs exist
Steps to reproduce: Open Archives, Habits, Runs in the original build.
Expected: Only logs belonging to the selected habit appear.
Actual: Every app log was rendered as a 5K/3K run.
Reproduction rate: 2/2
Evidence: Seed MCAT notes appeared under Runs.
Logs: None.
Root cause: `RunsArchive` consumed `data.logs` without filtering and overlaid fixed run labels.
Files changed: `src/features/archives/screens/ArchivesScreen.tsx`, `src/domain/selectors/progress.ts`
Fix: Build habit categories from WorkItems and filter/sort entries by item ID.
Regression test: `logsForItem` isolation assertions.
Verification: CARS archive contains one CARS log and excludes Review missed cards.
Remaining risk: No delete/undo for notes.

## QA-005

Bug ID: QA-005
Title: Reset local data has no destructive confirmation
Severity: Medium
Status: Fixed and verified
Feature: You / Privacy
Environment: Web export, 390x844
Preconditions: User has local data
Steps to reproduce: Open Privacy and tap Reset local app data.
Expected: Explain scope and require confirmation.
Actual: Data reset immediately.
Reproduction rate: 1/1
Evidence: Code inspection and runtime action.
Logs: None.
Root cause: Reset callback executed directly from the first press.
Files changed: `src/features/profile/screens/YouScreen.tsx`
Fix: Added explicit warning, Cancel, and Reset everything actions.
Regression test: Interactive cancel/confirm/reload sequence.
Verification: Cancel preserved state; confirm removed disposable goal after reload.
Remaining risk: No undo after final confirmation, by design.

## QA-006

Bug ID: QA-006
Title: Profile metrics remain fixed when data changes
Severity: Medium
Status: Fixed and verified
Feature: You
Environment: Web export, 390x844
Preconditions: Create/reset goals and logs
Steps to reproduce: Reset data or add ten projects; inspect stat cards.
Expected: Metrics reflect current persisted data.
Actual: Cards always showed 62%, 56%, 5, and 12.
Reproduction rate: 2/2
Evidence: Screenshot/state comparison before fix.
Logs: None.
Root cause: Module-level static stats array.
Files changed: `src/features/profile/screens/YouScreen.tsx`
Fix: Compute week/day completion, active projects, and completed logs from selectors/AppData.
Regression test: Interactive post-reset/post-soak check.
Verification: Final state showed 0%, 0%, 13 active projects, and 1 completed log.
Remaining risk: Completion is effort-weighted, consistent with Home.

## QA-007

Bug ID: QA-007
Title: Core controls lack accessible names, states, or practical touch size
Severity: Medium
Status: Fixed and verified
Feature: Cross-app
Environment: Web accessibility tree, 390x844
Preconditions: Primary screens open
Steps to reproduce: Inspect icon buttons, selectors, fields, and element rectangles.
Expected: Understandable names/roles/states and at least 44x44 targets.
Actual: Glyph-only names, generic selectors, unlabeled fields, and four undersized controls.
Reproduction rate: Consistent
Evidence: DOM accessibility snapshots and rectangle audit.
Logs: None.
Root cause: Missing React Native accessibility props and 24-42px control dimensions.
Files changed: Home, Goals, Friends, Archives, You, `DraftUI.tsx`
Fix: Added roles, labels, selected/disabled states, field labels, and 44px targets.
Regression test: Final cross-tab DOM audit.
Verification: Zero visible interactive targets below 44x44 on five primary screens.
Remaining risk: Native VoiceOver could not be tested.

## QA-008

Bug ID: QA-008
Title: Whitespace-only comment send state is not exposed as disabled
Severity: Low
Status: Fixed and verified
Feature: Friend comments
Environment: Web export, 390x844
Preconditions: Friend detail open
Steps to reproduce: Enter spaces in comment field and inspect Send comment.
Expected: Control is disabled semantically and behaviorally.
Actual: Save function rejected whitespace, but the accessibility control reported enabled.
Reproduction rate: 1/1
Evidence: `isEnabled()` returned true before fix.
Logs: None.
Root cause: Missing button role and accessibility disabled state.
Files changed: `src/features/social/screens/FriendsScreen.tsx`
Fix: Added button role, disabled state, and 44px target.
Regression test: Browser enabled-state assertion.
Verification: Whitespace-only Send comment reports disabled.
Remaining risk: No maximum comment length is defined.

## QA-009

Bug ID: QA-009
Title: TypeScript verification races generated export replacement
Severity: Low
Status: Fixed and verified
Feature: Test/build infrastructure
Environment: macOS, concurrent Expo export and `tsc`
Preconditions: `dist-qa-web` exists while Metro replaces its worker file
Steps to reproduce: Run verification concurrently with export to a nonstandard dist directory.
Expected: Generated output is outside TypeScript source discovery.
Actual: TS6053 reported a generated worker file disappeared during compilation.
Reproduction rate: 1/1
Evidence: Final-prebuild terminal output.
Logs: TS6053 missing generated worker.
Root cause: `tsconfig.json` and `.gitignore` excluded only named dist paths.
Files changed: `tsconfig.json`, `.gitignore`
Fix: Exclude/ignore `dist-*` export directories.
Regression test: Sequential final verification with export directories present.
Verification: `npm run verify` passes after both exports exist.
Remaining risk: Concurrent tools can still contend if pointed at the same output directory.

## QA-010

Bug ID: QA-010
Title: Empty goal submission fails silently
Severity: Medium
Status: Fixed and verified
Feature: Goals / New goal
Environment: Web export, 390x844
Preconditions: New Goal sheet open, title empty
Steps to reproduce: Tap Create goal.
Expected: Invalid data is rejected with clear feedback.
Actual: Sheet remained open with no explanation.
Reproduction rate: 2/2
Evidence: Empty submission browser test.
Logs: None.
Root cause: Guard returned without setting validation state.
Files changed: `src/features/projects/screens/GoalsScreen.tsx`
Fix: Added accessible inline error cleared on title edit.
Regression test: Interactive empty-submit retest.
Verification: Error appears and invalid goal is not saved.
Remaining risk: Product has not defined maximum lengths or required project metadata.

## QA-011 Through QA-016

| ID | Severity | Gap | Resolution | Verification |
| --- | --- | --- | --- | --- |
| QA-011 | Medium | Onboarding existed but was unreachable | First-run shell routing, validation, handle normalization, and persistence added | Native required-field error and completion passed |
| QA-012 | Medium | Reflection sheet had no entry point | Home action plus empty-text validation and accessible trait states added | Native open/error/save flow passed |
| QA-013 | Medium | Existing goals could not be edited or deleted | Prefilled edit flow, confirmation, recurrence updates, and cascading delete added | Domain cascade/monthly regressions pass |
| QA-014 | Medium | Profile photo control did not select a photo | SDK-matched image picker, permission copy, crop, display, and remove action added | Native module links and app builds |
| QA-015 | Low | Friends were fixed fixtures with no management | Local add/remove flow with name/handle validation added | Store/UI path verified |
| QA-016 | Low | Native app failed from undeclared Babel/font runtime modules | Declared `@babel/runtime` and `expo-font`; linked ExpoFont pod; made SQLite initialization recoverable | Debug and Release simulator builds launch; Home native hierarchy captured |

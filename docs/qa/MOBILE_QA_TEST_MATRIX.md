# Mobile QA Test Matrix

| Area | Scenario | Environment | Result | Evidence | Notes |
| --- | --- | --- | --- | --- | --- |
| Build | Clean dependency install | macOS / npm | PASS | terminal baseline | Transitive deprecation warnings only |
| Build | TypeScript and project tests | macOS / Node | PASS | `npm run verify` | 22 assertions pass |
| Build | iOS Expo export | Expo SDK 54 | PASS | terminal export | 692 modules |
| Build | Web Expo export | Expo SDK 54 | PASS | terminal export | 350 modules final |
| Native launch | Debug development build | iPhone 17 Pro / iOS 26.5 | PASS | XcodeBuildMCP logs/snapshot | Pods, Metro bundle, and native modules load |
| Native launch | Embedded Release build | iPhone 17 Pro / iOS 26.5 | PASS | XcodeBuildMCP build logs | Compiles, installs, and launches without Metro |
| Onboarding | Required fields and completion | Native iOS | PASS | native accessibility snapshot | Error shown; profile persisted to Home |
| Reflection | Empty validation and save | Native iOS | PASS | native accessibility snapshot | Reachable from Home and saved |
| Home | Persisted weekly and daily data | Web 390x844 | PASS | `evidence/final-home.png` | Fixed QA-001 |
| Home | Day navigation +/-2 and disabled bounds | Web 390x844 | PASS | browser assertions | Wrong-day note removed |
| Home | Empty scheduled day | Web 390x844 | PASS | browser assertion | Explicit empty card |
| Progress Log | Five status controls | Web 390x844 | PASS | `evidence/final-progress-log.png` | Status persisted after reload |
| Progress Log | Ten repeated updates | Web 390x844 | PASS | browser soak | No duplicates/errors |
| Goals | Empty title | Web 390x844 | PASS | `evidence/final-goal-validation.png` | Accessible validation added |
| Goals | Unicode/emoji/HTML-like input | Web 390x844 | PASS | browser assertion | Persisted as inert text |
| Goals | Habit/project toggle and fields | Web 390x844 | PASS | browser interaction | Selected states exposed |
| Goals | Ten sequential creates | Web 390x844 | PASS | `evidence/final-goals-large-data.png` | 10/10 created |
| Goals | Edit/delete and linked habit cascade | Domain + runtime | PASS | 22-assertion suite | Work items/logs cascade on delete |
| Goals | Monthly schedule | Domain | PASS | selector regression | Scheduled only on configured day |
| Friends | Open all five friend cards | Web 390x844 | PASS | browser assertion | Fixed QA-002 |
| Friends | Valid/Unicode comment persistence | Web 390x844 | PASS | `evidence/final-friend-detail.png` | Persisted after reload |
| Friends | Whitespace-only comment | Web 390x844 | PASS | browser assertion | Send is disabled |
| Friends | Add/remove local friend | Runtime/code path | PASS | store/UI review | Validation and confirmation included |
| Archives | Root and both categories | Web 390x844 | PASS | browser interaction | Dynamic counts |
| Archives | Project drill-down | Web 390x844 | PASS | browser assertion | Empty milestone state works |
| Archives | Habit log isolation | Web 390x844 | PASS | `evidence/final-habit-archive.png` | Unrelated logs excluded |
| Archives | Note editor surface | Web 390x844 | PASS | browser interaction | Correct log note shown |
| You | Dynamic persisted metrics | Web 390x844 | PASS | browser snapshot | Fixed QA-006 |
| You | Edit profile fields | Web 390x844 | PASS | browser interaction | Labeled fields |
| You | Choose/remove profile photo | Native integration | PASS | build/module verification | Native picker linked with permission copy |
| You | Notification switches | Web 390x844 | PASS | browser interaction | Local persisted preferences |
| You | Appearance/privacy panels | Web 390x844 | PASS | browser interaction | Panels open/close |
| You | Reset cancel/confirm/relaunch | Web 390x844 | PASS | `evidence/final-reset-confirmation.png` | Destructive confirmation added |
| Navigation | 50 rapid tab transitions | Web 390x844 | PASS | browser soak | 13.7 seconds, no errors |
| Persistence | Five repeated reloads | Web 390x844 | PASS | browser timing | Average 42 ms cached |
| Responsive | Small phone | Web 320x568 | PASS | layout measurement | No horizontal overflow |
| Responsive | Standard phone | Web 390x844 | PASS | final screenshots | No horizontal overflow |
| Responsive | Large phone | Web 430x932 | PASS | layout measurement | No horizontal overflow |
| Responsive | Landscape | Web 844x390 | PASS | layout measurement | Scrollable content, nav in bounds |
| Responsive | Tablet | Web 768x1024 | PASS | layout measurement | No horizontal overflow |
| Accessibility | Accessible names/roles/disabled states | Web accessibility tree | PASS | final DOM snapshot | Core controls semantic |
| Accessibility | Minimum touch targets | Web 390x844 | PASS | measured DOM rectangles | No target below 44x44 |
| Accessibility | Native labels, errors, roles | Native iOS | PASS | accessibility snapshots | Onboarding, Home, reflection controls exposed |
| Accessibility | VoiceOver/Dynamic Type/Switch Control | Native iOS | PARTIAL | coverage note | Full assistive-technology sessions remain |
| Offline | Local features without backend | Exported web bundle | PASS | full workflow | No network dependency |
| Security | Tracked secret/private-file scan | Git checkout | PASS | `git ls-files`, `rg` | No obvious secrets |
| Security | Dependency advisory scan | npm registry | PARTIAL | `npm audit` | 11 moderate, 0 high/critical |
| Onboarding | Reach from active shell | Native iOS | PASS | native interaction | First launch routes to onboarding |
| Reflection | Reach from active shell | Native iOS | PASS | native interaction | Home action opens sheet |
| Android | Native launch and UI | Android | NOT TESTED | environment | No emulator/device tooling available |
| Lifecycle | Background/foreground, lock, force quit | Native | NOT TESTED | remaining scope | Native launch is no longer blocked |
| Performance | Native memory/CPU/frame rate | Native | NOT TESTED | environment | Requires native runtime/profiler |

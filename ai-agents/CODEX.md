# CODEX.md

## Project context

This is an existing mobile app repository. Do not treat this as a new brand-new app or branding project. Work with the current architecture, existing file structure, current dependencies, and existing product direction unless explicitly told otherwise.

Read the detailed Codex workflow guide before making larger changes:

`docs/codex-mobile-app-workflow.md`

## General rules

* Prefer small, safe, reviewable changes.
* Do not rewrite major architecture unless the task explicitly asks for it.
* Do not remove existing features unless the task explicitly asks for it.
* Do not touch secrets, API keys, environment files, production credentials, or signing keys.
* Do not make assumptions about the app’s business logic. Inspect the existing code first.
* When changing UI, preserve the existing navigation and state flow unless asked otherwise.
* When fixing bugs, explain the root cause and make the smallest safe fix.
* When adding dependencies, explain why the dependency is necessary.
* When unsure, leave a note in the final response instead of guessing.

## Mobile app checklist

Before finalizing changes, check for:

* broken navigation
* loading states
* error states
* empty states
* authentication state handling
* platform-specific behavior
* iOS and Android differences
* date/time bugs
* permission handling
* network failure handling
* stale state or cache issues
* accessibility regressions
* layout issues on small screens

## Testing and verification

When possible, run the existing tests, type checks, lint checks, and build commands. If a command cannot be run in the Codex environment, explain what was not run and why.

Do not claim that the mobile app works on a real device unless it was actually tested on a device, simulator, emulator, Expo Go, Android Studio, or Xcode.

## Review guidelines

Focus reviews on serious issues:

* bugs that can break app behavior
* security or privacy risks
* incorrect state handling
* missing validation
* broken navigation
* incorrect API usage
* data loss risks
* missing tests for risky logic
* platform-specific mobile bugs

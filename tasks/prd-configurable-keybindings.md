# PRD: Configurable Keybindings

## Introduction

Currently, the keybindings for which-key are hardcoded in `package.json` under `contributes.keybindings`. Users who want to change these keybindings must manually edit their VS Code `settings.json` with custom keybindings, requiring them to know the internal command names and structure. This feature adds first-class settings so users can configure the trigger key and search keybindings directly through the settings UI.

## Goals

- Add `whichkey.triggerKey` setting to configure the menu trigger key
- Add `whichkey.searchKey` setting to configure the search bindings key
- Remove hardcoded keybindings from `package.json` and replace with programmatic registration
- Default values match current behavior (Tab for trigger, Ctrl+H for search)
- Settings are discoverable in VS Code settings UI

## User Stories

### US-001: Add keybinding configuration constants

**Description:** As a developer, I need to add the new configuration keys so they can be used throughout the codebase.

**Acceptance Criteria:**

- [ ] Add `TriggerKey` and `SearchKey` to `ConfigKey` enum in `src/constants.ts`
- [ ] Add `triggerKey` and `searchKey` to `Configs` object in `src/constants.ts`
- [ ] Typecheck passes

### US-002: Add keybinding settings to package.json

**Description:** As a user, I want to discover and configure the keybindings in VS Code settings.

**Acceptance Criteria:**

- [ ] Add `whichkey.triggerKey` setting to configuration in `package.json`
- [ ] Add `whichkey.searchKey` setting to configuration in `package.json`
- [ ] Type: string (VS Code keybinding format, e.g., "tab", "ctrl+h")
- [ ] Default for `whichkey.triggerKey`: "tab"
- [ ] Default for `whichkey.searchKey`: "ctrl+h"
- [ ] Markdown descriptions explain the setting format
- [ ] Typecheck passes

### US-003: Remove hardcoded keybindings from package.json

**Description:** As a developer, I need to remove the static keybinding definitions so they can be registered programmatically.

**Acceptance Criteria:**

- [ ] Remove `contributes.keybindings` array from `package.json`
- [ ] Keep `contributes.commands` intact
- [ ] Typecheck passes

### US-004: Register keybindings programmatically on extension activation

**Description:** As a user, I want the keybindings to be registered based on my settings.

**Acceptance Criteria:**

- [ ] In `src/extension.ts`, register keybindings using `commands.registerCommand` with `when` clauses
- [ ] Read `Configs.TriggerKey` and `Configs.SearchKey` from configuration
- [ ] Handle configuration changes to re-register keybindings when settings change
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-005: Handle "when" conditions for keybindings

**Description:** As a user, I want the keybindings to work correctly with VS Code's when clauses.

**Acceptance Criteria:**

- [ ] Trigger key works only when `whichkeyVisible` is false (to open menu)
- [ ] Search key works only when `whichkeyVisible` is true (to search within menu)
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Add `whichkey.triggerKey` setting (string, default "tab")
- FR-2: Add `whichkey.searchKey` setting (string, default "ctrl+h")
- FR-3: Keybindings are registered programmatically based on settings
- FR-4: Settings changes are detected and keybindings are re-registered
- FR-5: Invalid keybinding values are handled gracefully (fallback to defaults)

## Non-Goals

- No support for complex keybinding chords (e.g., "ctrl+a b")
- No custom "when" condition support beyond the built-in ones
- No migration of existing user keybindings in settings.json

## Technical Considerations

- Use `vscode.commands.registerCommand` with keybinding args for trigger
- Need to track and dispose previous keybinding registrations on config change
- Keybinding format follows VS Code's keybinding string format
- The "when" clauses should mirror the current behavior from package.json

## Success Metrics

- Users can change trigger key via settings UI
- Users can change search key via settings UI
- Keybindings work immediately after changing setting
- No regression in keybinding functionality

## Open Questions

- Should we support modifier-only keys (e.g., just "ctrl")?
- How should we handle conflicting keybindings with other extensions?

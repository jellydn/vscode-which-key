# PRD: Configurable Menu Auto-Hide/Cleanup Timeout

## Introduction

Add a configurable timeout to automatically hide/dismiss the which-key menu after a period of inactivity. Currently, the menu stays visible until the user makes a selection or explicitly dismisses it. This feature allows users to configure the menu to auto-hide after X milliseconds, improving workflow for users who want hands-free menu dismissal.

## Goals

- Add a new `whichkey.autoHideDelay` setting (in milliseconds)
- When the menu is visible and no key is pressed within the configured delay, the menu automatically hides
- Default behavior remains unchanged (no auto-hide by default, i.e., delay = 0)
- Setting is discoverable in VS Code settings UI

## User Stories

### US-001: Add autoHideDelay to configuration constants

**Description:** As a developer, I need to add the new configuration key so it can be used throughout the codebase.

**Acceptance Criteria:**

- [ ] Add `AutoHideDelay` to `ConfigKey` enum in `src/constants.ts`
- [ ] Add `autoHideDelay` to `Configs` object in `src/constants.ts`
- [ ] Typecheck passes

### US-002: Add autoHideDelay setting to package.json

**Description:** As a user, I want to discover and configure the auto-hide delay in VS Code settings.

**Acceptance Criteria:**

- [ ] Add `whichkey.autoHideDelay` to configuration in `package.json`
- [ ] Type: number (milliseconds)
- [ ] Default: 0 (disabled/no auto-hide)
- [ ] Description explains it's in milliseconds and 0 disables the feature
- [ ] Typecheck passes

### US-003: Implement auto-hide logic in BaseWhichKeyMenu

**Description:** As a user, I want the menu to automatically hide after the configured delay of inactivity.

**Acceptance Criteria:**

- [ ] Add `autoHideDelay` field to `BaseWhichKeyMenuState` interface
- [ ] In `update()` method, set up a timeout that calls `hide()` when `autoHideDelay > 0`
- [ ] Clear the auto-hide timeout on any key press or menu interaction
- [ ] Clear the auto-hide timeout on dispose
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-004: Wire up autoHideDelay from configuration

**Description:** As a user, I want the auto-hide delay to read from the VS Code configuration.

**Acceptance Criteria:**

- [ ] In `WhichKeyMenu.update()` and `TransientMenu.update()`, read `Configs.AutoHideDelay` and pass to state
- [ ] Verify the setting value is correctly applied when menu is shown
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: Add `whichkey.autoHideDelay` setting (number, default 0, in milliseconds)
- FR-2: When `autoHideDelay > 0`, menu automatically hides after inactivity period
- FR-3: Any key press resets the auto-hide timer
- FR-4: Auto-hide timer is cleared when menu is hidden or disposed
- FR-5: Setting change is detected via VS Code configuration change listener

## Non-Goals

- No changes to transient menu timing (already uses delay: 0)
- No notification or warning before auto-hide
- No persistent "remember last state" across sessions

## Technical Considerations

- Reuse existing timeout infrastructure from `baseWhichKeyMenu.ts` (`_timeoutId`)
- Configuration reads via `getConfig<number>(Configs.AutoHideDelay)`
- Must handle the case where user changes setting while menu is visible

## Success Metrics

- Users can enable auto-hide via settings UI
- Menu hides automatically after configured delay
- No regression in existing delay functionality

## Open Questions

- Should the auto-hide delay apply to both the main menu and transient menus?
- Should there be a visual indicator (countdown) before auto-hide?

# Architecture

**Analysis Date:** 2026-04-07

## Pattern Overview

**Overall:** Event-Driven Extension Architecture with Registry Pattern

**Key Characteristics:**

- Command-based activation and interaction
- Registry for managing multiple menu configurations
- Event-driven menu state management
- Abstract base class for menu variants
- Queue-based dispatch for sequential key handling

## Layers

**Extension Layer:**

- Purpose: Entry point and command registration
- Location: `src/extension.ts`
- Contains: Command registrations, service initialization
- Depends on: VSCode API, all other layers
- Used by: VSCode host

**Registry Layer:**

- Purpose: Manage multiple which-key configurations
- Location: `src/whichKeyRegistry.ts`, `src/whichKeyCommand.ts`
- Contains: Registration logic, command routing
- Depends on: Menu layer, Config layer
- Used by: Extension layer

**Menu Layer:**

- Purpose: UI presentation and interaction handling
- Location: `src/menu/`
- Contains: Menu implementations (whichKey, transient, repeater, descBind)
- Depends on: Config layer, VSCode QuickPick API
- Used by: Registry layer

**Config Layer:**

- Purpose: Configuration parsing and validation
- Location: `src/config/`
- Contains: Binding types, condition evaluation, config loading
- Depends on: VSCode workspace configuration API
- Used by: Menu layer, Registry layer

**Utility Layer:**

- Purpose: Shared utilities and abstractions
- Location: `src/utils.ts`, `src/dispatchQueue.ts`, `src/version.ts`
- Contains: Command execution, async queues, version parsing
- Depends on: VSCode API
- Used by: All layers

## Data Flow

**Menu Display Flow:**

1. User triggers `whichkey.show` command (keybinding or palette)
2. `WhichKeyRegistry.show()` resolves config and delegates to `WhichKeyCommand`
3. `WhichKeyCommand.show()` creates `WhichKeyMenu` instance
4. `WhichKeyMenu` loads bindings from config, renders QuickPick items
5. User input flows through `CommandRelay` → `DispatchQueue` → `BaseWhichKeyMenu`
6. Accepted items execute commands via `executeCommands()` utility

**Key Input Flow:**

1. `CommandRelay.triggerKey()` emits key press event
2. `BaseWhichKeyMenu` receives event via `onDidKeyPressed`
3. Key pushed to `DispatchQueue` for sequential processing
4. `handleValueDispatch()` matches key to binding
5. `handleAccept()` or `handleMismatch()` determines next state
6. State updates flow back to QuickPick UI

**State Management:**

- Menu state stored in `BaseWhichKeyMenu._state` (items, title, delay, buttons)
- Navigation history tracked in `WhichKeyMenu._stateHistory` and `_itemHistory`
- VSCode context keys (`whichkeyActive`, `whichkeyVisible`) for conditional keybindings

## Key Abstractions

**BaseWhichKeyMenu<T>:**

- Purpose: Abstract base for all menu types
- Examples: `src/menu/baseWhichKeyMenu.ts`
- Pattern: Template Method - subclasses implement `handleAccept`, `handleMismatch`, `handleRender`

**CommandRelay:**

- Purpose: Decouple key input from menu handling
- Examples: `src/commandRelay.ts`
- Pattern: Event Emitter - allows multiple listeners for key events

**DispatchQueue:**

- Purpose: Sequential async processing without race conditions
- Examples: `src/dispatchQueue.ts`
- Pattern: Queue-based dispatch with promise-based handlers

**BindingItem Hierarchy:**

- Purpose: Type-safe configuration representation
- Examples: `src/config/bindingItem.ts`
- Pattern: Discriminated union with `ActionType` enum

## Entry Points

**Extension Activation:**

- Location: `src/extension.ts:activate()`
- Triggers: `onCommand:whichkey.show`, `onCommand:whichkey.showTransient`, `onCommand:whichkey.register`
- Responsibilities: Register all commands, initialize services, set up subscriptions

**Command Handlers:**

- Location: Registered in `extension.ts`, implemented in registry/menu classes
- Triggers: User keybindings or command palette
- Responsibilities: Route to appropriate menu instance

## Error Handling

**Strategy:** Graceful degradation with user notification

**Patterns:**

- Try-catch around external command execution with fallback (e.g., `openFile`)
- Status bar error messages for binding mismatches
- `window.showErrorMessage()` for fatal errors
- Silent failure for non-critical validation issues

## Cross-Cutting Concerns

**Logging:** Console-based, minimal structured logging

**Validation:** Runtime type checking via `toBindingItem`, `toWhichKeyConfig` functions

**Authentication:** None required

---

_Architecture analysis: 2026-04-07_

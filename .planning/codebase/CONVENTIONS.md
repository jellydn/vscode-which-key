# Coding Conventions

**Analysis Date:** 2026-04-07

## Naming Patterns

**Files:**

- camelCase for source files (e.g., `whichKeyMenu.ts`, `bindingItem.ts`, `commandRelay.ts`)
- Test files use `.test.ts` suffix

**Functions:**

- camelCase for all functions
- Private methods prefixed with underscore (e.g., `_handleAccept`, `_stateHistory`)
- Async functions explicitly marked with `async` keyword

**Variables:**

- camelCase for variables and parameters
- Private fields prefixed with underscore (e.g., `_qp`, `_disposables`)
- Readonly where appropriate (e.g., `readonly registry` would be preferred)

**Types:**

- PascalCase for interfaces, types, enums, and classes
- Enum members use PascalCase or camelCase consistently within each enum

## Code Style

**Formatting:**

- Tool: Prettier
- Tab width: 4 spaces (no tabs)
- Single quotes: false (uses double quotes)
- Semicolons: always required

**Linting:**

- Tool: ESLint with TypeScript plugin
- Extends: eslint:recommended, @typescript-eslint/recommended, prettier
- Key rules:
    - `semi: [2, "always"]` - Enforce semicolons
    - `eol-last: "error"` - Require newline at end of files
    - Disabled: `@typescript-eslint/no-unused-vars`, `@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-non-null-assertion`

## Import Organization

**Order:**

1. External dependencies (vscode, path, etc.)
2. Internal absolute imports (from "../constants")
3. Internal relative imports (from "./baseWhichKeyMenu")

**Path Aliases:**

- None - uses relative imports throughout

## Error Handling

**Patterns:**

- Silent try-catch for platform-specific fallbacks (e.g., `openFile`)
- Status bar messages for user feedback on errors
- Console warnings for configuration validation failures
- Non-null assertion operator (`!`) allowed for known-safe cases

**Examples:**

```typescript
// Silent fallback pattern
try {
    await commands.executeCommand("workbench.action.files.openFile");
} catch {
    await commands.executeCommand("workbench.action.files.openFileFolder");
}

// User feedback pattern
this._statusBar.setErrorMessage("No condition matched");
```

## Logging

**Framework:** Console only - no structured logging library

**Patterns:**

- `console.warn()` for configuration validation issues
- VSCode API (`window.showErrorMessage`) for user-facing errors

## Comments

**When to Comment:**

- JSDoc for public APIs and complex functions
- Inline comments explaining non-obvious logic (e.g., VSCode API version compatibility)
- Issue references for workarounds (e.g., `https://github.com/microsoft/vscode/issues/...`)

**Examples:**

```typescript
/**
 * If this is true, setting `this.value` should call `this.handleDidChangeValue`
 * to maintain backward compatibility.
 *
 * vscode 1.57+ changed API so setting QuickPick will trigger onDidChangeValue.
 * See https://github.com/microsoft/vscode/issues/122939.
 */
```

## Function Design

**Size:** Functions tend to be moderate (10-40 lines), with larger functions having clear sections

**Parameters:**

- Prefer destructured objects for multiple parameters
- Use `args: any` pattern for flexible command arguments

**Return Values:**

- Explicit return types on public methods
- Promise-based for async operations

## Module Design

**Exports:**

- Named exports preferred over default exports
- Main exports at bottom of file or inline

**Barrel Files:**

- No barrel files - direct imports from specific modules

---

_Convention analysis: 2026-04-07_

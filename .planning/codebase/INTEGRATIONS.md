# External Integrations

**Analysis Date:** 2026-04-07

## APIs & External Services

**VSCode Extension API:**

-   Primary integration - All functionality built on VSCode APIs
-   Commands API (`commands.executeCommand`, `commands.registerCommand`)
-   Window API (`window.createQuickPick`, `window.activeTextEditor`)
-   Extension Context API (`ExtensionContext.subscriptions`)
-   VSCode-provided commands (workbench._, editor._, etc.)

## Data Storage

**Databases:**

-   None - Pure VSCode extension, no external data storage

**File Storage:**

-   Local filesystem only - Extension reads/writes no files directly

**Caching:**

-   None explicit - Some in-memory state in registry and menus

## Authentication & Identity

**Auth Provider:**

-   None - Extension requires no authentication

## Monitoring & Observability

**Error Tracking:**

-   Console logging via `console.warn` for config validation errors
-   VSCode `window.showErrorMessage` for user-facing errors

**Logs:**

-   No structured logging framework - uses console and VSCode APIs

## CI/CD & Deployment

**Hosting:**

-   VSCode Marketplace (published by VSpaceCode publisher)

**CI Pipeline:**

-   GitHub Actions (`.github/workflows/build.yml`)
-   Runs: lint → format-check → test (with xvfb-run for headless)

## Environment Configuration

**Required env vars:**

-   None

**Secrets location:**

-   None required

## Webhooks & Callbacks

**Incoming:**

-   VSCode command invocations (registered commands)
-   QuickPick UI events (onDidAccept, onDidChangeValue, onDidHide, onDidTriggerButton)
-   Key relay events (CommandRelay event emitters)

**Outgoing:**

-   VSCode command executions (executeCommand calls)
-   VSCode context updates (setContext for whichkeyActive, whichkeyVisible, transientVisible)

---

_Integration audit: 2026-04-07_

# Testing Patterns

**Analysis Date:** 2026-04-07

## Test Framework

**Runner:**

- Mocha with TDD UI
- Config: Inline in `src/test/suite/index-node.ts` and `src/test/suite/index-web.ts`
- Colors enabled in output

**Assertion Library:**

- Node.js built-in `assert` module

**Run Commands:**

```bash
npm run test          # Run all tests (node + web)
npm run test-node     # Node extension tests only
npm run test-web      # Web extension tests only
```

## Test File Organization

**Location:**

- Pattern: Co-located in `src/test/suite/` directory
- Test files: `*.test.ts` suffix
- Test runners: `runTest-node.ts`, `runTest-web.ts`

**Structure:**

```
src/test/
├── runTest-node.ts       # Node test runner entry
├── runTest-web.ts        # Web test runner entry
└── suite/
    ├── index-node.ts     # Mocha setup for Node
    ├── index-web.ts      # Mocha setup for Web
    ├── extension.test.ts # Extension activation tests
    ├── testUtils.ts      # Test utilities
    ├── dispatchQueue.test.ts
    └── menu/
        └── whichkeyMenu.test.ts
```

## Test Structure

**Suite Organization:**

```typescript
import * as assert from "assert";
import * as vscode from "vscode";
import { extensionId } from "../../constants";

suite("Extension Test Suite", () => {
    vscode.window.showInformationMessage("Start all tests.");

    test("whichkey can be activated", async function () {
        this.timeout(1 * 60 * 1000);
        const extension = vscode.extensions.getExtension(extensionId);
        if (extension) {
            await extension.activate();
            assert.ok(extension.isActive);
        } else {
            assert.fail("Extension is not available");
        }
    });
});
```

**Patterns:**

- Use `suite()` and `test()` (TDD style, not describe/it)
- Set timeouts with `this.timeout()` for async tests
- Extension activation tests are standard pattern

## Mocking

**Framework:** None - uses real VSCode test host

**Patterns:**

- Tests run in actual VSCode instance (via @vscode/test-electron or @vscode/test-web)
- No mocking of VSCode APIs - integration test approach

**What to Mock:**

- N/A - integration tests with real VSCode environment

**What NOT to Mock:**

- VSCode APIs are real in test environment

## Fixtures and Factories

**Test Data:**

- `src/test/suite/testUtils.ts` contains shared test utilities
- Test bindings created inline in tests

**Location:**

- Utilities: `src/test/suite/testUtils.ts`

## Coverage

**Requirements:**

- No explicit coverage target enforced
- Coverage not mentioned in configuration

**View Coverage:**

- Not configured

## Test Types

**Unit Tests:**

- Limited - most tests are integration-style
- `dispatchQueue.test.ts` tests internal queue logic

**Integration Tests:**

- Primary test approach
- Tests run in real VSCode extension host
- `extension.test.ts` - Extension activation
- `whichkeyMenu.test.ts` - Menu functionality

**E2E Tests:**

- Not used - integration tests serve this purpose

## Common Patterns

**Async Testing:**

```typescript
test("async operation", async function () {
    this.timeout(5000);
    const result = await someAsyncOperation();
    assert.ok(result);
});
```

**Extension Activation Pattern:**

```typescript
test("extension activates", async function () {
    this.timeout(60000);
    const ext = vscode.extensions.getExtension("publisher.name");
    await ext?.activate();
    assert.ok(ext?.isActive);
});
```

**Test Environment Setup:**

- No beforeEach/afterEach patterns observed
- Tests are independent and self-contained

---

_Testing analysis: 2026-04-07_

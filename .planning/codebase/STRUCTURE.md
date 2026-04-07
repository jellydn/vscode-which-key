# Codebase Structure

**Analysis Date:** 2026-04-07

## Directory Layout

```
[project-root]/
├── .github/           # GitHub Actions CI configuration
├── .planning/         # Codebase documentation (this directory)
├── .vscode/           # VSCode workspace settings and launch configs
├── dist/              # Build output (extension-node, extension-web)
├── node_modules/      # npm dependencies
├── src/               # Source code
│   ├── config/        # Configuration parsing and validation
│   ├── menu/          # Menu UI components
│   ├── test/          # Test suite
│   └── [root files]   # Extension entry and core modules
├── tasks/             # VSCode task definitions
├── .eslintrc.js       # ESLint configuration
├── .prettierrc.json   # Prettier formatting config
├── package.json       # Extension manifest and dependencies
├── tsconfig.json      # TypeScript compiler options
└── webpack.config.js  # Build configuration (node + web targets)
```

## Directory Purposes

**src/:**

-   Purpose: All TypeScript source code
-   Contains: Extension logic, menus, config, tests
-   Key files: `extension.ts`, `whichKeyRegistry.ts`, `commandRelay.ts`

**src/config/:**

-   Purpose: Configuration type definitions and parsing
-   Contains: `bindingItem.ts`, `whichKeyConfig.ts`, `condition.ts`, `menuConfig.ts`
-   Key files: All config validation and transformation logic

**src/menu/:**

-   Purpose: Menu UI implementations
-   Contains: Menu classes extending BaseWhichKeyMenu
-   Key files: `baseWhichKeyMenu.ts` (368 lines), `whichKeyMenu.ts` (278 lines)

**src/test/:**

-   Purpose: Test infrastructure and suites
-   Contains: Test runners, test utilities, test suites
-   Key files: `suite/extension.test.ts`, `suite/menu/whichkeyMenu.test.ts`

**.vscode/:**

-   Purpose: VSCode workspace settings
-   Contains: `launch.json`, `settings.json`, `tasks.json`

## Key File Locations

**Entry Points:**

-   `src/extension.ts`: Extension activation and command registration
-   `dist/extension-node.js`: Built Node extension entry
-   `dist/extension-web.js`: Built Web extension entry

**Configuration:**

-   `package.json`: Extension manifest, commands, keybindings, contributes
-   `tsconfig.json`: TypeScript strict mode settings
-   `webpack.config.js`: Dual-target build configuration

**Core Logic:**

-   `src/whichKeyRegistry.ts`: Manages multiple which-key configurations
-   `src/whichKeyCommand.ts`: Handles show/repeat logic for a config
-   `src/commandRelay.ts`: Event-based key input relay
-   `src/menu/baseWhichKeyMenu.ts`: Abstract menu base class

**Testing:**

-   `src/test/suite/extension.test.ts`: Extension activation tests
-   `src/test/suite/menu/whichkeyMenu.test.ts`: Menu functionality tests
-   `src/test/runTest-node.ts` / `runTest-web.ts`: Test runners

## Naming Conventions

**Files:**

-   camelCase for all source files (e.g., `whichKeyMenu.ts`, `bindingItem.ts`)
-   Test files: `*.test.ts` suffix
-   Config files: kebab-case or dot-separated (e.g., `.eslintrc.js`)

**Directories:**

-   camelCase for source directories (e.g., `whichKeyRegistry.ts`)
-   Lowercase for top-level directories (e.g., `src/`, `dist/`)

**Classes:**

-   PascalCase (e.g., `WhichKeyMenu`, `BaseWhichKeyMenu`, `CommandRelay`)
-   Abstract base classes prefixed with "Base" (e.g., `BaseWhichKeyMenu`)

**Interfaces:**

-   PascalCase (e.g., `BindingItem`, `WhichKeyConfig`, `CommandItem`)

**Enums:**

-   PascalCase for enum name, PascalCase or camelCase for members
-   Examples: `ActionType`, `ConfigKey`, `CommandKey`, `SortOrder`

## Where to Add New Code

**New Menu Type:**

-   Primary code: `src/menu/[newMenu].ts`
-   Extend: `BaseWhichKeyMenu<T>`
-   Tests: `src/test/suite/menu/[newMenu].test.ts`

**New Config Option:**

-   Type definition: `src/config/whichKeyConfig.ts` or `src/config/menuConfig.ts`
-   Constants: `src/constants.ts` (add to ConfigKey enum and Configs object)
-   Usage: Update relevant menu class

**New Command:**

-   Constants: `src/constants.ts` (add to CommandKey enum and Commands object)
-   Registration: `src/extension.ts`
-   Implementation: Add to appropriate registry/menu class

**Utilities:**

-   Shared helpers: `src/utils.ts`

## Special Directories

**dist/:**

-   Purpose: Webpack build output
-   Generated: Yes (via `npm run compile` or `npm run watch`)
-   Committed: No (in .gitignore)
-   Contains: `extension-node/`, `extension-web/`, test bundles

**node_modules/:**

-   Purpose: npm dependencies
-   Generated: Yes (via `npm install`)
-   Committed: No (in .gitignore)

---

_Structure analysis: 2026-04-07_

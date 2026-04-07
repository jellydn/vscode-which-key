# Technology Stack

**Analysis Date:** 2026-04-07

## Languages

**Primary:**

- TypeScript (ES2018 target) - All extension source code

**Secondary:**

- JavaScript - Build configuration (webpack.config.js, .eslintrc.js)
- JSON - Configuration files (package.json, tsconfig.json)

## Runtime

**Environment:**

- VSCode Extension Host (Node.js for desktop, WebWorker for web)
- VSCode Engine: ^1.45.0 (minimum version 1.45.0)

**Package Manager:**

- npm (package-lock.json present)
- Node.js (implied by VSCode extension development)

## Frameworks

**Core:**

- VSCode Extension API - Primary integration point
- TypeScript 4.x (inferred from @typescript-eslint packages)

**Testing:**

- Mocha - Test runner (TDD UI)
- glob - Test file discovery

**Build/Dev:**

- Webpack 5 - Bundler for both Node and Web targets
- ts-loader - TypeScript compilation
- ESLint - Linting with TypeScript plugin
- Prettier - Code formatting

## Key Dependencies

**Critical:**

- `vscode` - VSCode Extension API (external, provided by host)
- `webpack` + `ts-loader` - Build pipeline for dual-target (node + web)

**Infrastructure:**

- `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin` - TypeScript linting
- `prettier` - Code formatting
- `mocha`, `glob`, `@vscode/test-electron`, `@vscode/test-web` - Testing infrastructure
- `process`, `assert` - Node polyfills for web target

## Configuration

**Environment:**

- No environment variables required
- Extension configuration via VSCode settings (whichkey.\* namespace)

**Build:**

- `webpack.config.js` - Dual-target webpack config (webworker + node)
- `tsconfig.json` - Strict TypeScript settings
- `.eslintrc.js` - Linting rules
- `.prettierrc.json` - Formatting (4-space tabs, double quotes)

## Platform Requirements

**Development:**

- VSCode 1.45.0 or later
- Node.js and npm for building

**Production:**

- Desktop: VSCode with Node.js extension host
- Web: VSCode for Web with WebWorker extension host

---

_Stack analysis: 2026-04-07_

# AGENTS.md - vscode-which-key

## Dev Commands

```sh
npm install           # First-time setup
npm run compile       # Build with webpack
npm run watch         # Watch mode for development
npm run lint          # ESLint
npm run format-check # Prettier
npm run test          # Run node + web tests
npm run test-node     # Node extension tests only
npm run test-web      # Web extension tests only
```

## VSCode Debug

Use "Launch Extension" in VSCode debug view (requires `npm run watch` running first).

## Build Output

- `dist/extension-node` - Node extension bundle
- `dist/extension-web` - Web extension bundle
- `package.json` defines both `main` and `browser` entries

## Project Structure

- `src/extension.ts` - Entry point, registers commands
- `src/menu/` - Menu UI components (whichKeyMenu, transientMenu, etc.)
- `src/config/` - Configuration parsing (whichKeyConfig, bindingItem)
- `src/test/suite/` - Mocha tests

## Extension Commands

- `whichkey.show` - Show main menu
- `whichkey.showTransient` - Show transient (context-aware) menu
- `whichkey.register` - Register custom bindings (for other extensions)

## CI (build.yml)

Order: lint → format-check → test (with xvfb-run for headless)

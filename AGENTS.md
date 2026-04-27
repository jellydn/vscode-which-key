# AGENTS.md - vscode-which-key

## Dev Commands

```sh
npm install           # First-time setup
npm run compile       # Build with webpack
npm run watch         # Watch mode for development
npm run lint          # oxlint
npm run format-check # oxfmt
npm run test          # Runs compile + test-node + test-web
npm run test-node     # Node extension tests only
npm run test-web      # Web extension tests only
```

## VSCode Debug

Use "Launch Extension" in VSCode debug view (requires `npm run watch` running first).

## Build Output

- `dist/extension-node` - Node extension bundle
- `dist/extension-web` - Web extension bundle

## Project Structure

- `src/extension.ts` - Entry point
- `src/menu/` - Menu UI components
- `src/config/` - Configuration parsing
- `src/test/suite/` - Mocha tests

## Extension Commands

- `whichkey.show` - Show main menu
- `whichkey.showTransient` - Show transient menu
- `whichkey.register` - Register custom bindings

## CI / Deploy

CI runs: lint → format-check → test (with xvfb-run for headless)
Deploy builds, tests, then publishes to VSCode Marketplace + Open VSX

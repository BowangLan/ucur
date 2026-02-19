# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Overview

Turborepo monorepo with Bun as the package manager. Two workspaces: `apps/*` and `packages/*`.

- **apps/web** — Vite + React 18 + TypeScript application
- **apps/backend** — Express API server (chat, conversations, settings) with Drizzle + Anthropic
- **apps/desktop** — Electron + React + Vercel AI SDK desktop app
- **packages/types** — Centralized shared types (`@repo/types`)
- **packages/db** — Drizzle ORM schema, migrations, repositories (`@repo/db`)
- **packages/ui** — Shared React component library (`@repo/ui`)
- **packages/eslint-config** — Shared ESLint configuration (`@repo/eslint-config`)
- **packages/typescript-config** — Shared TypeScript base configs (`@repo/typescript-config`)

## Commands

```bash
bun run dev          # Start all dev servers (turbo)
bun run build        # Build all packages (turbo, outputs to dist/)
bun run lint         # Lint all packages (turbo)
bun run format       # Format with Prettier (ts, tsx, md files)
```

Run commands for a single package:

```bash
bun run dev --filter=web
bun run build --filter=@repo/ui
```

## Architecture

- Workspace dependencies use `"*"` version protocol (e.g., `"@repo/ui": "*"`)
- Turbo build tasks have `dependsOn: ["^build"]` — upstream packages build first
- All packages use ESM (`"type": "module"`) with bundler module resolution
- Components in `@repo/ui` use barrel exports from `index.ts`
- TypeScript strict mode is enabled via shared `typescript-config/base.json`
- ESLint extends `eslint:recommended` + `@typescript-eslint/recommended` + `prettier`
- No test framework is currently configured

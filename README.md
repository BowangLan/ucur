# Ucur

A vibe coding tool boilerplate — Electron desktop app with React, Zustand, PostgreSQL, Drizzle ORM, and AI chat.

## Architecture

- **packages/types** — Centralized shared types
- **packages/db** — Drizzle schema, migrations, repositories
- **apps/backend** — Express API (chat, conversations, settings) using Anthropic via Vercel AI SDK
- **apps/desktop** — Electron + React + Vercel AI SDK + Zustand + Tailwind v4

## Prerequisites

- [Bun](https://bun.sh)

## Setup

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Database (optional)**

   Uses SQLite by default at `./data/ucur.db`. Override with `DATABASE_URL`:

   ```
   DATABASE_URL=./data/ucur.db
   ```

   Push schema:

   ```bash
   cd packages/db && bun run db:push
   ```

4. **Set Anthropic API key**

   Either set `ANTHROPIC_API_KEY` in your environment, or configure it in the app Settings after launching.

## Development

Start the backend and desktop app in separate terminals:

```bash
# Terminal 1: Backend API
bun run dev --filter=backend

# Terminal 2: Desktop app
bun run dev --filter=desktop
```

Or run both:

```bash
bun run dev
```

## Build

```bash
bun run build
```

## Features

- **Chat** — AI chat with conversation management (create, list, delete)
- **Settings** — API key, model, theme
- Messages are persisted in PostgreSQL
- Frontend uses Vercel AI SDK (`useChat`); backend uses Anthropic via AI SDK `streamText`

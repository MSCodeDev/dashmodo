# Dashmodo

A companion homelab dashboard for [Komodo](https://komo.do). Lists servers and stacks with live status,
CPU/memory/disk graphs, and one-click links to each stack's actual running service — resolved from
Komodo's own quick-links config, or derived from the host's address and published container port when
Komodo doesn't have one configured. Includes an admin page for hiding stacks and overriding links by hand.

## Requirements

- Node.js 22+
- A running Komodo instance and an API key/secret pair (Komodo → Settings → API Keys)

## Setup

```bash
npm install
npm run dev             # runs server (:44000) + client (:54173) together
```

Open http://localhost:54173 — the Vite dev server proxies `/api` to the Express server on :44000. On
first run, Dashmodo shows an onboarding screen to collect the Komodo URL, API key/secret, and an
optional admin password. No env vars or manual config files needed — everything (including the
admin session secret) is generated on first boot and persisted, hashed/as-needed, to
`server/data/dashmodo.json`; connection details and the admin password are editable afterwards from
the Settings panel.

## How stack links are resolved

For each stack, in order:

1. Komodo's own "quick links" configured on the stack (or falls through if none set).
2. Derived from the stack's server — a link-host override set on Dashmodo's own `/settings` page,
   falling back to Komodo's `external_address`, falling back to `address` — plus the lowest
   published container port that isn't in the deny-list.
3. No link — the stack card renders without a click-through until Komodo has a quick-link or the
   server has a usable address.

## Production / Docker

```bash
docker compose up --build
```

No env vars to set. Serves the built client and the API from the same container on port `44000`
(mapped in `docker-compose.yml`). All config — including Komodo connection details and the admin
session secret — persists as a JSON file in a named volume (`dashmodo-data`), set via the
onboarding flow on first launch.

## Project layout

- `client/` — React 19 + Vite + Mantine + Recharts + TanStack Query
- `server/` — Node + Express, the only thing that talks to Komodo (via the official `komodo_client`
  package). Admin settings persist to a plain JSON file (`server/src/db/store.ts`) — no database
  server or native dependency needed.
- `.project/` — gitignored: local reference clones (Komodo, gethomepage) and the working milestone
  checklist, not part of the shipped app

See `AGENTS.md` for architectural notes and conventions.

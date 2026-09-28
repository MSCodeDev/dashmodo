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
cp .env.example .env   # optionally set ADMIN_SESSION_SECRET
npm run dev             # runs server (:4000) + client (:5173) together
```

Open http://localhost:5173 — the Vite dev server proxies `/api` to the Express server on :4000. On
first run, Dashmodo shows an onboarding screen to collect the Komodo URL, API key/secret, and an
optional admin password — these persist to a JSON file, not env vars, and are editable afterwards
from the Settings panel.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | no | Server port (default `4000`) |
| `ADMIN_SESSION_SECRET` | no (required if an admin password is set) | Secret used to sign the admin session cookie — a deployment-level concern distinct from the admin password itself |

Everything else — Komodo URL/API key/secret, admin password, and the extra port denylist for link
derivation — is set via the onboarding flow and stored (the password hashed) in
`server/data/dashmodo.json`.

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

Reads the same `.env` file as `npm run dev` (docker-compose auto-loads `.env` from the project root)
for `ADMIN_SESSION_SECRET`. Serves the built client and the API from the same container on `PORT`
(default `4000`). All other config — including Komodo connection details — persists as a JSON file
in a named volume (`dashmodo-data`), set via the onboarding flow on first launch.

## Project layout

- `client/` — React 19 + Vite + Mantine + Recharts + TanStack Query
- `server/` — Node + Express, the only thing that talks to Komodo (via the official `komodo_client`
  package). Admin settings persist to a plain JSON file (`server/src/db/store.ts`) — no database
  server or native dependency needed.
- `.project/` — gitignored: local reference clones (Komodo, gethomepage) and the working milestone
  checklist, not part of the shipped app

See `AGENTS.md` for architectural notes and conventions.

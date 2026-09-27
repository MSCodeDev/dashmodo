# dashmodo

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
cp .env.example .env   # fill in KOMODO_URL, KOMODO_API_KEY, KOMODO_API_SECRET
npm run db:push        # creates the sqlite database for admin settings
npm run dev             # runs server (:4000) + client (:5173) together
```

Open http://localhost:5173 — the Vite dev server proxies `/api` to the Express server on :4000.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `KOMODO_URL` | yes | Base URL of your Komodo instance |
| `KOMODO_API_KEY` / `KOMODO_API_SECRET` | yes | API key pair from Komodo (Settings → API Keys). Server-side only — never sent to the browser. |
| `PORT` | no | Server port (default `4000`) |
| `DASHMODO_DB_PATH` | no | SQLite file path for admin settings (default `./data/dashmodo.sqlite`) |
| `ADMIN_PASSWORD` | no | Password gating the `/settings` page. Leave unset to disable auth entirely (fine on a trusted LAN). |
| `ADMIN_SESSION_SECRET` | no (required if `ADMIN_PASSWORD` is set) | Secret used to sign the admin session cookie |
| `DASHMODO_PORT_DENYLIST` | no | Comma-separated extra ports to exclude when deriving a stack link from a published container port (merged with a built-in deny-list of ssh/db/queue ports) |

## How stack links are resolved

For each stack, in order:

1. A link override set on dashmodo's own `/settings` page.
2. Komodo's own "quick links" configured on the stack (or falls through if none set).
3. Derived from the stack's server (`external_address`, falling back to `address`) plus the lowest
   published container port that isn't in the deny-list.
4. No link — the stack card renders without a click-through until an override is set.

## Production / Docker

```bash
docker compose up --build
```

Reads the same `.env` file as `npm run dev` (docker-compose auto-loads `.env` from the project root).
Serves the built client and the API from the same container on `PORT` (default `4000`). Admin settings
persist in a named volume (`dashmodo-data`).

## Project layout

- `client/` — React 19 + Vite + Mantine + Recharts + TanStack Query
- `server/` — Node + Express + drizzle-orm + better-sqlite3, the only thing that talks to Komodo
  (via the official `komodo_client` package)
- `.project/` — gitignored: local reference clones (Komodo, gethomepage) and the working milestone
  checklist, not part of the shipped app

See `AGENTS.md` for architectural notes and conventions.

# dashmodo

A companion homelab dashboard for [Komodo](https://komo.do). Talks to a Komodo instance via API key and shows servers/stacks with status and one-click links to the services themselves — plus an admin page to hide stacks and override links Komodo doesn't know about.

## Stack

- `client/` — React 19 + Vite + TypeScript + Mantine + Recharts + TanStack Query. Chosen to match Komodo's own UI stack so chart/data-shaping logic can be ported from it. No router — it's a single page (top nav + Servers section + Stacks section), with Settings as a modal, not a route.
- `server/` — Node + TypeScript + Express + drizzle-orm + better-sqlite3. A BFF: it's the only thing that talks to Komodo (via the official `komodo_client` npm package), so the Komodo API key/secret never reach the browser. Also owns a small SQLite DB for admin settings.
- npm workspaces (`client`, `server`) at the root. `npm run dev` at the root runs both together (via `concurrently`); `npm run dev -w client` / `-w server` runs one.

## Key design decisions (don't relitigate without asking)

- **No `mogh_ui`.** Komodo's own UI components (stat bars, tables, dashboard summary) are built on a private internal package, `mogh_ui`, which is not a dependency here. When porting a Komodo UI file for reference, port the *data-shaping/Recharts config*, not the JSX — rebuild the surrounding widgets on plain Mantine components (`Progress`, `Table`, `RingProgress`, etc).
- **komodo_client runs server-side only.** The client never imports `komodo_client` or calls Komodo directly — it only calls dashmodo's own `/api/*` routes. This keeps the API key off the browser.
- **`komodo_client` needs a `localStorage` polyfill in plain Node.** Its dependency `mogh_auth_client` reads `localStorage` unconditionally at module-load time, which throws (`ReferenceError: localStorage is not defined`) outside a browser/Node-with-webstorage. `server/src/lib/komodo.ts` must `import './localstorage-polyfill.js'` as its *first* import, before `import { KomodoClient } from 'komodo_client'` — import order matters here (the polyfill module must fully evaluate before `komodo_client`'s module graph does). Verified working against the live `https://demo.komo.do` instance (got a real 401 for bad creds, not a crash).
- **Link resolution** (`server/src/lib/links.ts`) is a priority chain: dashmodo admin override (SQLite) > Komodo's own `links` config on the stack > derived from the server's `external_address`/`address` + the first published container port not in the deny-list > no link. Keep this a pure, testable function.
- **Admin auth is a single shared password, not multi-user.** `ADMIN_PASSWORD` env var gates the `/settings` write routes via a signed cookie (`server/src/lib/auth.ts`). No user table, no `better-auth` — this is a single-operator homelab tool, not a multi-tenant app. If `ADMIN_PASSWORD` is unset, admin routes are open.
- **One container, one port.** In production, Express serves the built client (`express.static` + SPA fallback) alongside `/api/*` from the same process — see the root `Dockerfile`. This is meant to run as a single `docker compose` service, same style as Komodo itself.
- **Stack icons come from selfh.st/icons**, not a bundled asset set. `server/src/lib/icons.ts` `slugifyIconRef()` auto-derives a reference from the stack name (their convention: lowercase, non-alphanumeric runs → one hyphen), overridable via the same per-resource-settings mechanism as link overrides (`icon_override` column). Client builds the actual image URL (`client/src/lib/icons.ts`) — `https://cdn.jsdelivr.net/gh/selfhst/icons/{format}/{ref}.{format}` — and relies on Mantine `Avatar`'s built-in fallback-to-initials on image load failure, since not every app has a matching icon there.

## Directory notes

- `.project/` is gitignored and never committed. It holds `reference/` (local clones of `komodo` and `gethomepage`, kept only for reading/porting patterns — not shipped) and `TASKS.md` (a working copy of the implementation milestones, checked off as they land). If you need to see how Komodo's UI does something, look there first before guessing.

## Commands

```bash
npm run dev            # root: server + client together
npm run dev -w server  # server only (tsx watch)
npm run dev -w client  # client only (vite)
npm run build          # build both workspaces
npm run db:push        # push drizzle schema to sqlite (server/src/db/schema.ts)
```

## Conventions

- Formatting: tabs, single quotes, no trailing commas (`prettier.config.js` at root).
- Git: this repo is local-only (not pushed) unless explicitly asked. Commit messages are short, one-line, imperative — **no AI attribution trailers on commits in this repo.**

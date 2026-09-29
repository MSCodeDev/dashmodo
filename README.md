# Dashmodo

A companion homelab dashboard for [Komodo](https://komo.do). Lists servers and stacks with live status,
CPU/memory/disk graphs, and one-click links to each stack's actual running service — resolved from
Komodo's own quick-links config, or derived from the host's address and published container port when
Komodo doesn't have one configured. Includes an admin page for hiding stacks and overriding links by hand.

## Deploy (Docker Compose)

This is the intended way to run Dashmodo. Every push to `master` builds and publishes a new
version to GHCR via `.github/workflows/docker-publish.yml`:

`docker-compose.yml`:

```yaml
services:
  dashmodo:
    image: ghcr.io/mscodedev/dashmodo:latest
    # Only used by `docker compose build` (e.g. testing a Dockerfile change) — `docker compose pull`
    # / `up -d` use the published image above instead of building locally.
    build: .
    ports:
      - '44000:44000'
    volumes:
      - dashmodo-data:/app/data
    restart: unless-stopped

volumes:
  dashmodo-data:
```

```bash
docker compose pull
docker compose up -d
```

Open http://localhost:44000. No env vars or manual config to set up front — the first visit shows
an onboarding screen that collects the Komodo URL, API key/secret, and an optional admin password.
Everything (including the admin session secret) is generated/persisted, hashed as needed, to a
JSON file in the `dashmodo-data` named volume, and is editable afterwards from the Settings panel.

Onboarding also asks for a **setup token**, printed to the container logs
(`docker compose logs dashmodo`) on first boot and required until onboarding completes. This
closes the obvious hole in "no manual config needed": without it, whoever reaches the URL first —
not necessarily you — could onboard the instance with their own Komodo credentials and an admin
password of their choosing, locking you out of your own deployment.

To build the image locally instead of pulling (e.g. testing a `Dockerfile` change), swap
`docker compose pull` for `docker compose build`.

GHCR packages are private by default. If `docker compose pull` gets a 401/403 on the homelab host,
either make the package public (repo → Packages → dashmodo → Package settings) or
`docker login ghcr.io` there first with a PAT that has `read:packages`.

### Versioning

Fully automated, no manual release step: every push to `master` tags and publishes
`<major>.<minor>.<run number>` (e.g. `1.0.7`), alongside a `latest` tag and a matching git tag
(`v1.0.7`). `<major>.<minor>` is a hardcoded `VERSION_PREFIX` in the workflow — bump it by hand
there for a deliberate milestone; the patch number always auto-increments. The running version is
shown at the bottom of the Settings modal.

## Development

Requires Node.js 22+ and a running Komodo instance with an API key/secret pair (Komodo → Settings
→ Users → click your user → API Keys). `npm install`/`npm run dev` is for local development only —
it is not the deployment path, see above for that.

```bash
npm install
npm run dev             # runs server (:44000) + client (:54173) together
```

Open http://localhost:54173 — the Vite dev server proxies `/api` to the Express server on :44000.
Same onboarding/config behavior as above (including the setup token, printed to this terminal
instead of `docker compose logs`), persisted to `server/data/dashmodo.json` on disk instead of a
Docker volume.

### Checks

```bash
npm run format         # prettier --write (tabs, single quotes, no trailing commas)
npm run format:check   # what CI runs
npm run lint           # oxlint, both workspaces
npm test               # vitest, both workspaces
npm run check -w server  # type-checks the server including its tests
npm run build          # type-checks + builds both workspaces
```

CI (`.github/workflows/ci.yml`) runs all of the above on every pull request, and the Docker
publish workflow won't run unless it passes on `master`.

Server tests run from a throwaway temp directory (`server/vitest.setup.ts`), so they can never
read or write your real `server/data/dashmodo.json`.

## Customizing

From the Settings panel (admin only):

- **Order** — servers and stacks are sorted A–Z by default. In the Servers/Stacks tabs, drag the
  handles to set your own order (it applies to the dashboard too); "Sort A–Z" goes back to the
  default. Anything you haven't ordered, like a stack newly added in Komodo, lands alphabetically
  after the ones you have.
- **Logo & favicon** — General tab. One image is used for both the header logo and the browser tab
  icon. A square PNG, JPEG, WebP or GIF up to 2 MB works best; SVG isn't accepted (see
  `AGENTS.md` for why). "Reset to default" restores the built-in logo.

## How stack links are resolved

For each stack, in order:

1. Komodo's own "quick links" configured on the stack (or falls through if none set).
2. Derived from the stack's server — a link-host override set on Dashmodo's own `/settings` page,
   falling back to Komodo's `external_address`, falling back to `address` — plus the lowest
   published container port that isn't in the deny-list.
3. No link — the stack card renders without a click-through until Komodo has a quick-link or the
   server has a usable address.

## Project layout

- `client/` — React 19 + Vite + Mantine + Recharts + TanStack Query
- `server/` — Node + Express, the only thing that talks to Komodo (via the official `komodo_client`
  package). Admin settings persist to a plain JSON file (`server/src/db/store.ts`) — no database
  server or native dependency needed.
- `.project/` — gitignored: local reference clones (Komodo, gethomepage) and the working milestone
  checklist, not part of the shipped app
- `.github/workflows/docker-publish.yml` — builds, versions, and pushes the image to GHCR on every
  push to `master`

See `AGENTS.md` for architectural notes and conventions.

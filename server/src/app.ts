import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieParser from 'cookie-parser';
import { serversRouter } from './routes/servers.js';
import { stacksRouter } from './routes/stacks.js';
import { adminRouter } from './routes/admin.js';
import { settingsRouter } from './routes/settings.js';
import { iconsRouter } from './routes/icons.js';
import { onboardingRouter } from './routes/onboarding.js';
import { store } from './db/store.js';
import { ICONS_DIR } from './lib/iconStorage.js';
import { requireAdmin } from './middleware/requireAdmin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// server/src/app.ts (dev) or server/dist/app.js (prod) — either way, two levels up + client/dist.
const clientDist = path.join(__dirname, '../../client/dist');

export const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
	res.json({ ok: true });
});

// Not secret (unlike the API key/secret) — safe to expose so every viewer can link to Komodo
// and render the admin-configured display settings (theme, columns, custom CSS, etc).
app.get('/api/config', (_req, res) => {
	const { komodoApiKey, komodoApiSecret, adminPasswordHash, ...publicAppSettings } =
		store.getAppSettings();
	res.json({
		komodoUrl: publicAppSettings.komodoUrl,
		needsOnboarding: !store.isKomodoConfigured(),
		appSettings: publicAppSettings
	});
});

app.use('/api/onboarding', onboardingRouter);
// The admin password (when set) gates the whole interface, not just Settings — servers/stacks
// data is the interface here, so these need the same guard as the write routes below.
app.use('/api/servers', requireAdmin, serversRouter);
app.use('/api/stacks', requireAdmin, stacksRouter);
app.use('/api/admin', adminRouter);
// More specific than /api/settings below, so must be registered first.
app.use('/api/settings/icons', iconsRouter);
app.use('/api/settings', settingsRouter);

// Uploaded custom icons — public read (same trust level as the selfh.st CDN icons), admin-only write.
app.use('/api/uploaded-icons', express.static(ICONS_DIR));

// Unmatched /api/* requests get a JSON 404 instead of falling through to the SPA below.
app.use('/api', (_req, res) => {
	res.status(404).json({ error: 'Not found' });
});

// In dev, client/dist doesn't exist (Vite's own dev server handles the SPA on :54173, proxying
// /api to this server on :44000) —
// these just no-op. In prod, the built client is served from the same origin/port as the API.
app.use(express.static(clientDist));
app.use((_req, res) => {
	res.sendFile(path.join(clientDist, 'index.html'), (err) => {
		if (err) res.status(404).end();
	});
});

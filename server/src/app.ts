import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieParser from 'cookie-parser';
import { serversRouter } from './routes/servers.js';
import { stacksRouter } from './routes/stacks.js';
import { adminRouter } from './routes/admin.js';
import { settingsRouter } from './routes/settings.js';
import { env } from './env.js';
import { store } from './db/store.js';

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
	res.json({ komodoUrl: env.KOMODO_URL, appSettings: store.getAppSettings() });
});

app.use('/api/servers', serversRouter);
app.use('/api/stacks', stacksRouter);
app.use('/api/admin', adminRouter);
app.use('/api/settings', settingsRouter);

// Unmatched /api/* requests get a JSON 404 instead of falling through to the SPA below.
app.use('/api', (_req, res) => {
	res.status(404).json({ error: 'Not found' });
});

// In dev, client/dist doesn't exist (Vite's own dev server handles the SPA on :5173) —
// these just no-op. In prod, the built client is served from the same origin/port as the API.
app.use(express.static(clientDist));
app.use((_req, res) => {
	res.sendFile(path.join(clientDist, 'index.html'), (err) => {
		if (err) res.status(404).end();
	});
});

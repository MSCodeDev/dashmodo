import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
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

// Trust exactly one hop (the reverse proxy) so `req.secure`/`req.ip` reflect the real client when
// deployed behind Traefik/Caddy/nginx/a tunnel — needed for the Secure cookie flag below and for
// the rate limiter to key on the actual client IP rather than the proxy's.
app.set('trust proxy', 1);

app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'"],
				// React inline `style={{...}}` props and the admin custom-CSS feature both need this —
				// it's CSS-only, not script execution.
				styleSrc: ["'self'", "'unsafe-inline'"],
				imgSrc: ["'self'", 'data:', 'https://cdn.jsdelivr.net'],
				fontSrc: ["'self'", 'data:'],
				connectSrc: ["'self'"],
				objectSrc: ["'none'"],
				baseUri: ["'self'"],
				formAction: ["'self'"],
				frameAncestors: ["'none'"]
			}
		},
		// Disabled: default (require-corp) would block the selfh.st icon CDN's <img> responses,
		// which don't send a matching Cross-Origin-Resource-Policy header.
		crossOriginEmbedderPolicy: false,
		frameguard: { action: 'deny' }
	})
);

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

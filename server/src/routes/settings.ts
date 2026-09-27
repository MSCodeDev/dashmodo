import { Router } from 'express';
import { z } from 'zod';
import { store } from '../db/store.js';
import { cachedRead, normalizeKomodoError } from '../lib/komodo.js';
import { slugifyIconRef } from '../lib/icons.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

export const settingsRouter = Router();

settingsRouter.use(requireAdmin);

function normalize(value: string | null | undefined) {
	return value === '' ? null : value;
}

// --- Stacks ---

const stackUpdateSchema = z.object({
	hidden: z.boolean().optional(),
	iconOverride: z.string().nullable().optional()
});

settingsRouter.get('/stacks', async (_req, res) => {
	try {
		const stacks = await cachedRead('ListStacks', {});
		const settingsById = new Map(store.listResourceSettings('stack').map((r) => [r.resourceId, r]));
		const merged = stacks.map((s) => ({
			id: s.id,
			name: s.name,
			state: s.info.state,
			hidden: settingsById.get(s.id)?.hidden ?? false,
			iconOverride: settingsById.get(s.id)?.iconOverride ?? null,
			defaultIcon: slugifyIconRef(s.name)
		}));
		res.json(merged);
	} catch (err) {
		const e = normalizeKomodoError(err);
		res.status(e.status).json({ error: e.message });
	}
});

settingsRouter.put('/stacks/:id', (req, res) => {
	const parsed = stackUpdateSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({ error: 'Invalid request body', detail: parsed.error.flatten() });
		return;
	}
	const { hidden } = parsed.data;
	const iconOverride = normalize(parsed.data.iconOverride);
	store.upsertResourceSettings('stack', req.params.id, {
		...(hidden !== undefined ? { hidden } : {}),
		...(iconOverride !== undefined ? { iconOverride } : {})
	});
	res.json({ ok: true });
});

// --- Servers ---

const serverUpdateSchema = z.object({
	linkOverride: z.string().nullable().optional()
});

settingsRouter.get('/servers', async (_req, res) => {
	try {
		const servers = await cachedRead('ListServers', {});
		const settingsById = new Map(store.listResourceSettings('server').map((r) => [r.resourceId, r]));
		const merged = servers.map((s) => ({
			id: s.id,
			name: s.name,
			state: s.info.state,
			// What link derivation currently sees, before any admin override — helps explain why
			// an override might be needed (e.g. shows an internal-only Periphery address).
			detectedAddress: s.info.external_address || s.info.address || null,
			linkOverride: settingsById.get(s.id)?.linkOverride ?? null
		}));
		res.json(merged);
	} catch (err) {
		const e = normalizeKomodoError(err);
		res.status(e.status).json({ error: e.message });
	}
});

settingsRouter.put('/servers/:id', (req, res) => {
	const parsed = serverUpdateSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({ error: 'Invalid request body', detail: parsed.error.flatten() });
		return;
	}
	const linkOverride = normalize(parsed.data.linkOverride);
	store.upsertResourceSettings('server', req.params.id, {
		...(linkOverride !== undefined ? { linkOverride } : {})
	});
	res.json({ ok: true });
});

// --- Global app settings ---

const appSettingsUpdateSchema = z.object({
	siteName: z.string().nullable().optional(),
	colorScheme: z.enum(['system', 'light', 'dark']).optional(),
	serversColumns: z.number().int().min(1).max(6).optional(),
	stacksColumns: z.number().int().min(1).max(6).optional(),
	defaultIconStyle: z.enum(['default', 'light', 'dark']).optional(),
	customCss: z.string().nullable().optional(),
	themeColor: z.string().nullable().optional()
});

settingsRouter.put('/app', (req, res) => {
	const parsed = appSettingsUpdateSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({ error: 'Invalid request body', detail: parsed.error.flatten() });
		return;
	}
	store.updateAppSettings(parsed.data);
	res.json({ ok: true });
});

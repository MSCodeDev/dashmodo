import { Router } from 'express';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { resourceSettings } from '../db/schema.js';
import { cachedRead, normalizeKomodoError } from '../lib/komodo.js';
import { slugifyIconRef } from '../lib/icons.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

export const settingsRouter = Router();

settingsRouter.use(requireAdmin);

const updateSchema = z.object({
	hidden: z.boolean().optional(),
	linkOverride: z.string().nullable().optional(),
	iconOverride: z.string().nullable().optional()
});

function normalize(value: string | null | undefined) {
	return value === '' ? null : value;
}

async function upsertSetting(
	resourceType: 'stack' | 'server',
	resourceId: string,
	data: z.infer<typeof updateSchema>
) {
	const { hidden } = data;
	const linkOverride = normalize(data.linkOverride);
	const iconOverride = normalize(data.iconOverride);

	const where = and(
		eq(resourceSettings.resourceType, resourceType),
		eq(resourceSettings.resourceId, resourceId)
	);
	const existing = await db.select().from(resourceSettings).where(where);

	if (existing.length === 0) {
		await db.insert(resourceSettings).values({
			resourceType,
			resourceId,
			hidden: hidden ?? false,
			linkOverride: linkOverride ?? null,
			iconOverride: iconOverride ?? null
		});
	} else {
		await db
			.update(resourceSettings)
			.set({
				...(hidden !== undefined ? { hidden } : {}),
				...(linkOverride !== undefined ? { linkOverride } : {}),
				...(iconOverride !== undefined ? { iconOverride } : {}),
				updatedAt: new Date()
			})
			.where(where);
	}
}

settingsRouter.get('/stacks', async (_req, res) => {
	try {
		const [stacks, settingsRows] = await Promise.all([
			cachedRead('ListStacks', {}),
			db.select().from(resourceSettings).where(eq(resourceSettings.resourceType, 'stack'))
		]);
		const settingsById = new Map(settingsRows.map((r) => [r.resourceId, r]));
		const merged = stacks.map((s) => ({
			id: s.id,
			name: s.name,
			server_name: s.info.server_name,
			state: s.info.state,
			hidden: settingsById.get(s.id)?.hidden ?? false,
			linkOverride: settingsById.get(s.id)?.linkOverride ?? null,
			iconOverride: settingsById.get(s.id)?.iconOverride ?? null,
			defaultIcon: slugifyIconRef(s.name)
		}));
		res.json(merged);
	} catch (err) {
		const e = normalizeKomodoError(err);
		res.status(e.status).json({ error: e.message });
	}
});

settingsRouter.put('/stacks/:id', async (req, res) => {
	const parsed = updateSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({ error: 'Invalid request body', detail: parsed.error.flatten() });
		return;
	}
	await upsertSetting('stack', req.params.id, parsed.data);
	res.json({ ok: true });
});

settingsRouter.get('/servers', async (_req, res) => {
	try {
		const [servers, settingsRows] = await Promise.all([
			cachedRead('ListServers', {}),
			db.select().from(resourceSettings).where(eq(resourceSettings.resourceType, 'server'))
		]);
		const settingsById = new Map(settingsRows.map((r) => [r.resourceId, r]));
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

settingsRouter.put('/servers/:id', async (req, res) => {
	const parsed = updateSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({ error: 'Invalid request body', detail: parsed.error.flatten() });
		return;
	}
	await upsertSetting('server', req.params.id, parsed.data);
	res.json({ ok: true });
});

import { Router } from 'express';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { resourceSettings } from '../db/schema.js';
import { cachedRead, normalizeKomodoError } from '../lib/komodo.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

export const settingsRouter = Router();

settingsRouter.use(requireAdmin);

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
			linkOverride: settingsById.get(s.id)?.linkOverride ?? null
		}));
		res.json(merged);
	} catch (err) {
		const e = normalizeKomodoError(err);
		res.status(e.status).json({ error: e.message });
	}
});

const updateSchema = z.object({
	hidden: z.boolean().optional(),
	linkOverride: z.string().nullable().optional()
});

settingsRouter.put('/stacks/:id', async (req, res) => {
	const parsed = updateSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({ error: 'Invalid request body', detail: parsed.error.flatten() });
		return;
	}
	const { hidden } = parsed.data;

	const where = and(
		eq(resourceSettings.resourceType, 'stack'),
		eq(resourceSettings.resourceId, req.params.id)
	);
	const existing = await db.select().from(resourceSettings).where(where);

	const normalizedLinkOverride = parsed.data.linkOverride === '' ? null : parsed.data.linkOverride;

	if (existing.length === 0) {
		await db.insert(resourceSettings).values({
			resourceType: 'stack',
			resourceId: req.params.id,
			hidden: hidden ?? false,
			linkOverride: normalizedLinkOverride ?? null
		});
	} else {
		await db
			.update(resourceSettings)
			.set({
				...(hidden !== undefined ? { hidden } : {}),
				...(normalizedLinkOverride !== undefined ? { linkOverride: normalizedLinkOverride } : {}),
				updatedAt: new Date()
			})
			.where(where);
	}

	res.json({ ok: true });
});

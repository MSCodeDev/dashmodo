import { Router } from 'express';
import { z } from 'zod';
import { store } from '../db/store.js';
import { hashPassword } from '../lib/auth.js';
import { testKomodoConnection } from '../lib/komodo.js';

export const onboardingRouter = Router();

const onboardingSchema = z.object({
	komodoUrl: z.string().url(),
	komodoApiKey: z.string().min(1),
	komodoApiSecret: z.string().min(1),
	adminPassword: z.string().min(1).optional()
});

/** Self-gated: refuses once Komodo is already configured, so a live instance can't be re-onboarded. */
onboardingRouter.post('/', async (req, res) => {
	if (store.isKomodoConfigured()) {
		res.status(409).json({ error: 'Already configured' });
		return;
	}

	const parsed = onboardingSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({ error: 'Invalid request body', detail: parsed.error.flatten() });
		return;
	}
	const { komodoUrl, komodoApiKey, komodoApiSecret, adminPassword } = parsed.data;

	try {
		await testKomodoConnection(komodoUrl, komodoApiKey, komodoApiSecret);
	} catch {
		res.status(400).json({ error: 'Could not connect to Komodo with the given URL/key/secret' });
		return;
	}

	store.updateAppSettings({
		komodoUrl,
		komodoApiKey,
		komodoApiSecret,
		...(adminPassword ? { adminPasswordHash: hashPassword(adminPassword) } : {})
	});
	res.json({ ok: true });
});

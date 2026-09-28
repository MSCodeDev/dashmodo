import { Router } from 'express';
import { z } from 'zod';
import { store } from '../db/store.js';
import { checkSetupToken, hashPassword } from '../lib/auth.js';
import { testKomodoConnection } from '../lib/komodo.js';
import { authRateLimit } from '../middleware/rateLimit.js';

export const onboardingRouter = Router();

const onboardingSchema = z.object({
	setupToken: z.string().min(1),
	komodoUrl: z.string().url(),
	komodoApiKey: z.string().min(1),
	komodoApiSecret: z.string().min(1),
	adminPassword: z.string().min(4).optional()
});

/**
 * Self-gated (refuses once Komodo is already configured) AND token-gated: without the setup
 * token — printed to the server console on boot, never exposed via any API — this would
 * otherwise be a "first request wins" race on any instance reachable before its operator visits
 * it, letting an attacker onboard it with their own credentials and lock the real operator out.
 */
onboardingRouter.post('/', authRateLimit, async (req, res) => {
	if (store.isKomodoConfigured()) {
		res.status(409).json({ error: 'Already configured' });
		return;
	}

	const parsed = onboardingSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({ error: 'Invalid request body', detail: parsed.error.flatten() });
		return;
	}
	const { setupToken, komodoUrl, komodoApiKey, komodoApiSecret, adminPassword } = parsed.data;

	if (!checkSetupToken(setupToken)) {
		res.status(401).json({ error: 'Incorrect setup token' });
		return;
	}

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

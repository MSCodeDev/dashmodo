import { Router } from 'express';
import { z } from 'zod';
import { store } from '../db/store.js';
import {
	checkPassword,
	createSessionCookie,
	COOKIE_NAME,
	COOKIE_OPTIONS,
	verifySessionCookie
} from '../lib/auth.js';
import { authRateLimit } from '../middleware/rateLimit.js';

export const adminRouter = Router();

const loginSchema = z.object({ password: z.string() });

adminRouter.post('/login', authRateLimit, (req, res) => {
	const parsed = loginSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({ error: 'Invalid request body' });
		return;
	}
	if (!checkPassword(parsed.data.password)) {
		res.status(401).json({ error: 'Incorrect password' });
		return;
	}
	res.cookie(COOKIE_NAME, createSessionCookie(), { ...COOKIE_OPTIONS, secure: req.secure });
	res.json({ ok: true });
});

adminRouter.post('/logout', (req, res) => {
	res.clearCookie(COOKIE_NAME, { ...COOKIE_OPTIONS, secure: req.secure });
	res.json({ ok: true });
});

adminRouter.get('/session', (req, res) => {
	const passwordRequired = Boolean(store.getAppSettings().adminPasswordHash);
	const authenticated = !passwordRequired || verifySessionCookie(req.cookies?.[COOKIE_NAME]);
	res.json({ authenticated, passwordRequired });
});

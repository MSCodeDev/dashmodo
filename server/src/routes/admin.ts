import { Router } from 'express';
import { z } from 'zod';
import { env } from '../env.js';
import {
	checkPassword,
	createSessionCookie,
	COOKIE_NAME,
	COOKIE_OPTIONS,
	verifySessionCookie
} from '../lib/auth.js';

export const adminRouter = Router();

const loginSchema = z.object({ password: z.string() });

adminRouter.post('/login', (req, res) => {
	const parsed = loginSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({ error: 'Invalid request body' });
		return;
	}
	if (!checkPassword(parsed.data.password)) {
		res.status(401).json({ error: 'Incorrect password' });
		return;
	}
	res.cookie(COOKIE_NAME, createSessionCookie(), COOKIE_OPTIONS);
	res.json({ ok: true });
});

adminRouter.post('/logout', (_req, res) => {
	res.clearCookie(COOKIE_NAME);
	res.json({ ok: true });
});

adminRouter.get('/session', (req, res) => {
	const passwordRequired = Boolean(env.ADMIN_PASSWORD);
	const authenticated = !passwordRequired || verifySessionCookie(req.cookies?.[COOKIE_NAME]);
	res.json({ authenticated, passwordRequired });
});

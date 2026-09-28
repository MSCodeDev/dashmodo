import type { Request, Response, NextFunction } from 'express';
import { store } from '../db/store.js';
import { COOKIE_NAME, verifySessionCookie } from '../lib/auth.js';

/** No-op when no admin password has been set yet (pre-onboarding) — fine on a trusted homelab LAN. */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
	if (!store.getAppSettings().adminPasswordHash) {
		next();
		return;
	}
	if (verifySessionCookie(req.cookies?.[COOKIE_NAME])) {
		next();
		return;
	}
	res.status(401).json({ error: 'Admin authentication required' });
}

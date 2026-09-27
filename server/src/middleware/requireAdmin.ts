import type { Request, Response, NextFunction } from 'express';
import { env } from '../env.js';
import { COOKIE_NAME, verifySessionCookie } from '../lib/auth.js';

/** No-op when ADMIN_PASSWORD is unset — fine on a trusted homelab LAN. */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
	if (!env.ADMIN_PASSWORD) {
		next();
		return;
	}
	if (verifySessionCookie(req.cookies?.[COOKIE_NAME])) {
		next();
		return;
	}
	res.status(401).json({ error: 'Admin authentication required' });
}

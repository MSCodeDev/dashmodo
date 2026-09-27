import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../env.js';

export const COOKIE_NAME = 'dashmodo_admin';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export const COOKIE_OPTIONS = {
	httpOnly: true,
	sameSite: 'lax' as const,
	maxAge: SESSION_TTL_MS
};

function sign(payload: string): string {
	return createHmac('sha256', env.ADMIN_SESSION_SECRET).update(payload).digest('base64url');
}

export function createSessionCookie(): string {
	const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS })).toString(
		'base64url'
	);
	return `${payload}.${sign(payload)}`;
}

export function verifySessionCookie(value: string | undefined): boolean {
	if (!value) return false;
	const [payload, sig] = value.split('.');
	if (!payload || !sig) return false;

	const expected = sign(payload);
	const sigBuf = Buffer.from(sig);
	const expectedBuf = Buffer.from(expected);
	if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
		return false;
	}

	try {
		const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
		return typeof exp === 'number' && exp > Date.now();
	} catch {
		return false;
	}
}

export function checkPassword(candidate: string): boolean {
	if (!env.ADMIN_PASSWORD) return false;
	const a = Buffer.from(candidate);
	const b = Buffer.from(env.ADMIN_PASSWORD);
	return a.length === b.length && timingSafeEqual(a, b);
}

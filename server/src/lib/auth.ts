import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { env } from '../env.js';
import { store } from '../db/store.js';

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

/** Password is stored hashed (JSON file on disk, not an ephemeral env var) — `salt:hash` hex pair. */
export function hashPassword(password: string): string {
	const salt = randomBytes(16).toString('hex');
	const hash = scryptSync(password, salt, 64).toString('hex');
	return `${salt}:${hash}`;
}

export function checkPassword(candidate: string): boolean {
	const stored = store.getAppSettings().adminPasswordHash;
	if (!stored) return false;
	const [salt, hash] = stored.split(':');
	if (!salt || !hash) return false;

	const hashBuf = Buffer.from(hash, 'hex');
	const candidateBuf = scryptSync(candidate, salt, 64);
	return hashBuf.length === candidateBuf.length && timingSafeEqual(hashBuf, candidateBuf);
}

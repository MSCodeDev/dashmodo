import { afterEach, describe, expect, it, vi } from 'vitest';
import { store } from '../db/store.js';
import {
	checkPassword,
	checkSetupToken,
	createSessionCookie,
	hashPassword,
	verifySessionCookie
} from './auth.js';

afterEach(() => {
	vi.useRealTimers();
	store.updateAppSettings({ adminPasswordHash: null });
});

describe('password hashing', () => {
	it('produces a salt:hash hex pair with a fresh salt each time', () => {
		const a = hashPassword('hunter22');
		const b = hashPassword('hunter22');
		expect(a).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/);
		expect(a).not.toBe(b);
		expect(a).not.toContain('hunter22');
	});

	it('accepts the right password and rejects the wrong one', () => {
		store.updateAppSettings({ adminPasswordHash: hashPassword('hunter22') });
		expect(checkPassword('hunter22')).toBe(true);
		expect(checkPassword('hunter23')).toBe(false);
		expect(checkPassword('')).toBe(false);
	});

	it('rejects everything when no password has been set', () => {
		expect(checkPassword('anything')).toBe(false);
		expect(checkPassword('')).toBe(false);
	});

	it('rejects (rather than throws) on a malformed stored hash', () => {
		store.updateAppSettings({ adminPasswordHash: 'not-a-valid-hash' });
		expect(checkPassword('x')).toBe(false);
	});
});

describe('session cookie', () => {
	it('verifies a freshly created cookie', () => {
		expect(verifySessionCookie(createSessionCookie())).toBe(true);
	});

	it.each([undefined, '', 'no-dot', 'a.b', '.', 'a.'])('rejects malformed value %j', (value) => {
		expect(verifySessionCookie(value)).toBe(false);
	});

	it('rejects a tampered signature', () => {
		const [payload, sig] = createSessionCookie().split('.');
		const flipped = (sig[0] === 'A' ? 'B' : 'A') + sig.slice(1);
		expect(verifySessionCookie(`${payload}.${flipped}`)).toBe(false);
	});

	it('rejects a forged payload that reuses a genuine signature', () => {
		const sig = createSessionCookie().split('.')[1];
		const forged = Buffer.from(JSON.stringify({ exp: Date.now() + 1e12 })).toString('base64url');
		expect(verifySessionCookie(`${forged}.${sig}`)).toBe(false);
	});

	it('expires after the 7 day TTL', () => {
		vi.useFakeTimers();
		const cookie = createSessionCookie();
		vi.advanceTimersByTime(6 * 24 * 60 * 60 * 1000);
		expect(verifySessionCookie(cookie)).toBe(true);
		vi.advanceTimersByTime(2 * 24 * 60 * 60 * 1000);
		expect(verifySessionCookie(cookie)).toBe(false);
	});
});

describe('setup token', () => {
	it('accepts the real token', () => {
		expect(checkSetupToken(store.getSetupToken())).toBe(true);
	});

	it('rejects wrong tokens of any length without throwing', () => {
		const real = store.getSetupToken();
		expect(checkSetupToken('')).toBe(false);
		expect(checkSetupToken('nope')).toBe(false);
		expect(checkSetupToken('x'.repeat(real.length))).toBe(false);
		expect(checkSetupToken(real + 'x')).toBe(false);
	});
});

import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from './app.js';
import { store } from './db/store.js';
import { COOKIE_NAME, createSessionCookie, hashPassword } from './lib/auth.js';

let server: Server;
let base: string;

beforeAll(async () => {
	await new Promise<void>((resolve) => {
		server = app.listen(0, () => resolve());
	});
	base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
	server.close();
});

const json = (body: unknown) => ({
	method: 'POST',
	headers: { 'content-type': 'application/json' },
	body: JSON.stringify(body)
});
const authed = () => ({ cookie: `${COOKIE_NAME}=${createSessionCookie()}` });

describe('security headers', () => {
	it('blocks framing and MIME sniffing, and restricts scripts to same-origin', async () => {
		const res = await fetch(`${base}/api/health`);
		expect(res.headers.get('x-frame-options')).toBe('DENY');
		expect(res.headers.get('x-content-type-options')).toBe('nosniff');
		const csp = res.headers.get('content-security-policy') ?? '';
		expect(csp).toContain("frame-ancestors 'none'");
		expect(csp).toContain("script-src 'self'");
		expect(csp).toContain("object-src 'none'");
	});
});

describe('with no admin password set (open by design on a trusted LAN)', () => {
	it('serves admin routes without a session', async () => {
		expect((await fetch(`${base}/api/settings/connection`)).status).toBe(200);
		expect(await (await fetch(`${base}/api/admin/session`)).json()).toEqual({
			authenticated: true,
			passwordRequired: false
		});
	});
});

describe('with an admin password set', () => {
	beforeAll(() => {
		store.updateAppSettings({
			komodoUrl: 'http://komodo.test:9120',
			komodoApiKey: 'KEY-abc123',
			komodoApiSecret: 'SECRET-xyz789',
			adminPasswordHash: hashPassword('hunter22')
		});
	});

	it('locks the whole interface, not just settings', async () => {
		for (const path of [
			'/api/servers',
			'/api/stacks',
			'/api/settings/connection',
			'/api/settings/stacks'
		]) {
			expect((await fetch(`${base}${path}`)).status, path).toBe(401);
		}
		const write = await fetch(`${base}/api/settings/app`, {
			...json({ siteName: 'x' }),
			method: 'PUT'
		});
		expect(write.status).toBe(401);
	});

	it('never exposes secrets through the public config endpoint', async () => {
		const res = await fetch(`${base}/api/config`);
		const text = await res.text();
		expect(res.status).toBe(200);
		expect(JSON.parse(text)).toMatchObject({
			komodoUrl: 'http://komodo.test:9120',
			needsOnboarding: false
		});
		for (const secret of [
			'KEY-abc123',
			'SECRET-xyz789',
			store.getAppSettings().adminPasswordHash!,
			store.getSessionSecret(),
			store.getSetupToken()
		]) {
			expect(text).not.toContain(secret);
		}
	});

	it('exposes only "is it set" flags on the admin connection endpoint', async () => {
		const res = await fetch(`${base}/api/settings/connection`, { headers: authed() });
		const text = await res.text();
		expect(JSON.parse(text)).toEqual({
			komodoUrl: 'http://komodo.test:9120',
			komodoApiKeySet: true,
			komodoApiSecretSet: true,
			adminPasswordSet: true,
			portDenylist: []
		});
		expect(text).not.toContain('KEY-abc123');
		expect(text).not.toContain('SECRET-xyz789');
	});

	it('rejects a wrong password and sets a hardened cookie on the right one', async () => {
		expect((await fetch(`${base}/api/admin/login`, json({ password: 'nope' }))).status).toBe(401);

		const plain = await fetch(`${base}/api/admin/login`, json({ password: 'hunter22' }));
		expect(plain.status).toBe(200);
		const plainCookie = plain.headers.get('set-cookie') ?? '';
		expect(plainCookie).toContain('HttpOnly');
		expect(plainCookie).toContain('SameSite=Lax');
		// Plain HTTP (local dev): Secure would stop the browser from ever storing it.
		expect(plainCookie).not.toContain('Secure');

		const behindProxy = await fetch(`${base}/api/admin/login`, {
			...json({ password: 'hunter22' }),
			headers: { 'content-type': 'application/json', 'x-forwarded-proto': 'https' }
		});
		expect(behindProxy.headers.get('set-cookie')).toContain('Secure');
	});

	describe('custom icon uploads', () => {
		function upload(type: string, name: string, headers: Record<string, string> = {}) {
			const form = new FormData();
			form.append('file', new Blob(['data'], { type }), name);
			return fetch(`${base}/api/settings/icons`, { method: 'POST', body: form, headers });
		}

		it('requires the admin session', async () => {
			expect((await upload('image/png', 'a.png')).status).toBe(401);
		});

		it('rejects SVG (stored-XSS vector) and HTML', async () => {
			for (const [type, name] of [
				['image/svg+xml', 'x.svg'],
				['text/html', 'x.html']
			]) {
				const res = await upload(type, name, authed());
				expect(res.status, type).toBe(400);
				expect(((await res.json()) as { error: string }).error).toContain('Unsupported file type');
			}
		});

		it('accepts a PNG under a server-generated filename', async () => {
			const res = await upload('image/png', '../../evil.png', authed());
			expect(res.status).toBe(200);
			expect(((await res.json()) as { ref: string }).ref).toMatch(/^upload:[0-9a-f-]{36}\.png$/);
		});
	});
});

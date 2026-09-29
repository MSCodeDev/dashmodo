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

describe('plain HTTP on a LAN address (the common self-hosted setup)', () => {
	// Regression: helmet's default `upgrade-insecure-requests` made browsers rewrite the page's own
	// CSS/JS/favicon to https:// on e.g. http://192.168.1.2, which nothing serves — a blank page.
	it('does not tell browsers to upgrade sub-resources to HTTPS', async () => {
		const csp = (await fetch(`${base}/api/health`)).headers.get('content-security-policy') ?? '';
		expect(csp).not.toContain('upgrade-insecure-requests');
	});

	it('omits the HTTPS-only headers browsers would warn about', async () => {
		const res = await fetch(`${base}/api/health`);
		expect(res.headers.get('strict-transport-security')).toBeNull();
		expect(res.headers.get('cross-origin-opener-policy')).toBeNull();
		expect(res.headers.get('origin-agent-cluster')).toBeNull();
	});

	it('still sends them when a TLS-terminating proxy says the request was HTTPS', async () => {
		const res = await fetch(`${base}/api/health`, { headers: { 'x-forwarded-proto': 'https' } });
		expect(res.headers.get('strict-transport-security')).toContain('max-age=');
		expect(res.headers.get('cross-origin-opener-policy')).toBe('same-origin');
		expect(res.headers.get('origin-agent-cluster')).toBe('?1');
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

	describe('custom logo and favicon', () => {
		async function uploadPng() {
			const form = new FormData();
			form.append('file', new Blob(['png-bytes'], { type: 'image/png' }), 'logo.png');
			const res = await fetch(`${base}/api/settings/icons`, {
				method: 'POST',
				body: form,
				headers: authed()
			});
			return ((await res.json()) as { ref: string }).ref;
		}
		const putApp = (body: unknown) =>
			fetch(`${base}/api/settings/app`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json', ...authed() },
				body: JSON.stringify(body)
			});
		const fileStatus = async (ref: string) =>
			(await fetch(`${base}/api/uploaded-icons/${ref.slice('upload:'.length)}`)).status;
		const configLogo = async () =>
			(
				(await (await fetch(`${base}/api/config`)).json()) as {
					appSettings: { logoRef: string | null };
				}
			).appSettings.logoRef;

		it('defaults to the built-in logo', async () => {
			expect(await configLogo()).toBeNull();
		});

		it.each([
			'https://evil.example/logo.png',
			'mdi:home',
			'upload:../../etc/passwd',
			'upload:abc.png',
			'upload:00000000-0000-0000-0000-000000000000.svg'
		])('rejects %j as a logo reference', async (ref) => {
			expect((await putApp({ logoRef: ref })).status).toBe(400);
		});

		it('rejects a well-formed reference to a file that was never uploaded', async () => {
			const res = await putApp({ logoRef: 'upload:00000000-0000-4000-8000-000000000000.png' });
			expect(res.status).toBe(400);
			expect(await configLogo()).toBeNull();
		});

		it('serves an uploaded logo publicly and exposes it in the public config', async () => {
			const ref = await uploadPng();
			expect((await putApp({ logoRef: ref })).status).toBe(200);
			expect(await configLogo()).toBe(ref);
			expect(await fileStatus(ref)).toBe(200);
			await putApp({ logoRef: null });
		});

		it('deletes the old file when the logo is replaced or reset', async () => {
			const first = await uploadPng();
			const second = await uploadPng();
			await putApp({ logoRef: first });
			await putApp({ logoRef: second });
			expect(await fileStatus(first)).toBe(404);
			expect(await fileStatus(second)).toBe(200);

			await putApp({ logoRef: null });
			expect(await fileStatus(second)).toBe(404);
			expect(await configLogo()).toBeNull();
		});

		it('keeps the file if a stack icon override still points at it', async () => {
			const ref = await uploadPng();
			await putApp({ logoRef: ref });
			await fetch(`${base}/api/settings/stacks/s1`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json', ...authed() },
				body: JSON.stringify({ iconOverride: ref })
			});
			await putApp({ logoRef: null });
			expect(await fileStatus(ref)).toBe(200);
		});
	});
});

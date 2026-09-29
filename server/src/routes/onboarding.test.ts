import express from 'express';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { store } from '../db/store.js';
import { checkPassword } from '../lib/auth.js';
import { testKomodoConnection } from '../lib/komodo.js';
import { onboardingRouter } from './onboarding.js';

vi.mock('../lib/komodo.js', () => ({ testKomodoConnection: vi.fn() }));

let server: Server;
let url: string;

beforeAll(async () => {
	const app = express();
	app.use(express.json());
	app.use('/api/onboarding', onboardingRouter);
	await new Promise<void>((resolve) => {
		server = app.listen(0, () => resolve());
	});
	url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/onboarding`;
});

afterAll(() => {
	server.close();
});

beforeEach(() => {
	vi.mocked(testKomodoConnection).mockReset();
});

function post(body: unknown) {
	return fetch(url, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body)
	});
}

const valid = () => ({
	setupToken: store.getSetupToken(),
	komodoUrl: 'http://komodo.test:9120',
	komodoApiKey: 'key',
	komodoApiSecret: 'secret'
});

// Kept under the shared auth rate limit (10 / 15 min) across the whole file.
describe('POST /api/onboarding', () => {
	it('requires a setup token', async () => {
		const { setupToken: _omit, ...withoutToken } = valid();
		expect((await post(withoutToken)).status).toBe(400);
		expect(testKomodoConnection).not.toHaveBeenCalled();
	});

	it('rejects a wrong setup token before touching Komodo (no SSRF probing)', async () => {
		const res = await post({ ...valid(), setupToken: 'wrong-token' });
		expect(res.status).toBe(401);
		expect(testKomodoConnection).not.toHaveBeenCalled();
		expect(store.isKomodoConfigured()).toBe(false);
	});

	it('enforces the 4 character admin password minimum', async () => {
		const res = await post({ ...valid(), adminPassword: 'abc' });
		expect(res.status).toBe(400);
		expect(store.isKomodoConfigured()).toBe(false);
	});

	it('does not persist anything when the Komodo connection test fails', async () => {
		vi.mocked(testKomodoConnection).mockRejectedValue(new Error('unreachable'));
		const res = await post(valid());
		expect(res.status).toBe(400);
		expect(store.isKomodoConfigured()).toBe(false);
		expect(store.getAppSettings().adminPasswordHash).toBeNull();
	});

	it('onboards with a valid token, storing the password hashed', async () => {
		vi.mocked(testKomodoConnection).mockResolvedValue(undefined);
		const res = await post({ ...valid(), adminPassword: 'hunter22' });
		expect(res.status).toBe(200);
		expect(testKomodoConnection).toHaveBeenCalledWith('http://komodo.test:9120', 'key', 'secret');
		expect(store.isKomodoConfigured()).toBe(true);
		expect(store.getAppSettings().adminPasswordHash).not.toContain('hunter22');
		expect(checkPassword('hunter22')).toBe(true);
	});

	it('refuses to re-onboard a configured instance, even with the right token', async () => {
		const res = await post({ ...valid(), komodoUrl: 'http://attacker.test' });
		expect(res.status).toBe(409);
		expect(testKomodoConnection).not.toHaveBeenCalled();
		expect(store.getAppSettings().komodoUrl).toBe('http://komodo.test:9120');
	});
});

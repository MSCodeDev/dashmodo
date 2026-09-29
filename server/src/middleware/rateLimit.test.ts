import express from 'express';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { authRateLimit } from './rateLimit.js';

let server: Server;
let url: string;

beforeAll(async () => {
	const app = express();
	app.post('/guess', authRateLimit, (_req, res) => {
		res.json({ ok: true });
	});
	await new Promise<void>((resolve) => {
		server = app.listen(0, () => resolve());
	});
	url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/guess`;
});

afterAll(() => {
	server.close();
});

describe('authRateLimit', () => {
	it('allows 10 attempts, then answers 429 with a JSON error', async () => {
		for (let i = 0; i < 10; i++) {
			expect((await fetch(url, { method: 'POST' })).status).toBe(200);
		}
		const blocked = await fetch(url, { method: 'POST' });
		expect(blocked.status).toBe(429);
		expect(await blocked.json()).toEqual({ error: 'Too many attempts — try again later' });
	});
});

import express from 'express';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cachedRead } from '../lib/komodo.js';
import { serversRouter } from './servers.js';
import { settingsRouter } from './settings.js';
import { stacksRouter } from './stacks.js';

vi.mock('../lib/komodo.js', async (importOriginal) => ({
	...(await importOriginal<typeof import('../lib/komodo.js')>()),
	cachedRead: vi.fn()
}));

const stack = (id: string, name: string) => ({
	id,
	name,
	info: { server_id: 'srv', state: 'running' }
});
const server = (id: string, name: string) => ({ id, name, info: { state: 'Ok' } });

const komodo = {
	ListStacks: [
		stack('s1', 'plex'),
		stack('s2', 'Grafana'),
		stack('s3', 'app10'),
		stack('s4', 'app2')
	],
	ListServers: [server('v1', 'nas'), server('v2', 'Alpha'), server('v3', 'beta')]
};

let http: Server;
let base: string;

beforeAll(async () => {
	vi.mocked(cachedRead).mockImplementation((async (type: string) => {
		if (type === 'ListStacks' || type === 'ListServers') return komodo[type];
		if (type === 'GetStack') return { config: {} };
		return [];
	}) as never);

	const app = express();
	app.use(express.json());
	app.use('/api/servers', serversRouter);
	app.use('/api/stacks', stacksRouter);
	app.use('/api/settings', settingsRouter);
	await new Promise<void>((resolve) => {
		http = app.listen(0, () => resolve());
	});
	base = `http://127.0.0.1:${(http.address() as AddressInfo).port}`;
});

afterAll(() => {
	http.close();
});

const names = async (path: string) =>
	((await (await fetch(`${base}${path}`)).json()) as Array<{ name: string }>).map((r) => r.name);

const put = (path: string, body: unknown) =>
	fetch(`${base}${path}`, {
		method: 'PUT',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body)
	});

async function setOrder(kind: 'stacks' | 'servers', ids: Array<string | null>) {
	for (const [index, id] of ids.entries()) {
		if (id) await put(`/api/settings/${kind}/${id}`, { sortOrder: index });
	}
}

async function resetOrder() {
	for (const id of ['s1', 's2', 's3', 's4'])
		await put(`/api/settings/stacks/${id}`, { sortOrder: null });
	for (const id of ['v1', 'v2', 'v3'])
		await put(`/api/settings/servers/${id}`, { sortOrder: null });
}

beforeEach(resetOrder);

describe('default ordering', () => {
	it('is alphabetical (case-insensitive, natural) everywhere', async () => {
		const stacks = ['app2', 'app10', 'Grafana', 'plex'];
		const servers = ['Alpha', 'beta', 'nas'];
		expect(await names('/api/stacks')).toEqual(stacks);
		expect(await names('/api/settings/stacks')).toEqual(stacks);
		expect(await names('/api/servers')).toEqual(servers);
		expect(await names('/api/settings/servers')).toEqual(servers);
	});
});

describe('custom ordering', () => {
	it('applies a dragged order to the dashboard and to the settings lists', async () => {
		await setOrder('stacks', ['s1', 's3', 's2', 's4']); // plex, app10, Grafana, app2
		await setOrder('servers', ['v1', 'v3', 'v2']); // nas, beta, Alpha
		expect(await names('/api/stacks')).toEqual(['plex', 'app10', 'Grafana', 'app2']);
		expect(await names('/api/settings/stacks')).toEqual(['plex', 'app10', 'Grafana', 'app2']);
		expect(await names('/api/servers')).toEqual(['nas', 'beta', 'Alpha']);
		expect(await names('/api/settings/servers')).toEqual(['nas', 'beta', 'Alpha']);
	});

	it('appends anything without an order alphabetically after the ordered ones', async () => {
		await setOrder('stacks', ['s1', 's2']); // plex, Grafana; app2/app10 are "new"
		expect(await names('/api/stacks')).toEqual(['plex', 'Grafana', 'app2', 'app10']);
	});

	it('returns to alphabetical when the order is cleared', async () => {
		await setOrder('stacks', ['s1', 's3', 's2', 's4']);
		await resetOrder();
		expect(await names('/api/stacks')).toEqual(['app2', 'app10', 'Grafana', 'plex']);
	});

	it('keeps hidden stacks out of the dashboard without disturbing the order', async () => {
		await setOrder('stacks', ['s1', 's3', 's2', 's4']);
		await put('/api/settings/stacks/s3', { hidden: true });
		expect(await names('/api/stacks')).toEqual(['plex', 'Grafana', 'app2']);
		expect(await names('/api/settings/stacks')).toEqual(['plex', 'app10', 'Grafana', 'app2']);
		await put('/api/settings/stacks/s3', { hidden: false });
	});

	it('exposes sortOrder on the settings rows', async () => {
		await setOrder('stacks', ['s2']);
		const rows = (await (await fetch(`${base}/api/settings/stacks`)).json()) as Array<{
			id: string;
			sortOrder: number | null;
		}>;
		expect(rows.find((r) => r.id === 's2')?.sortOrder).toBe(0);
		expect(rows.find((r) => r.id === 's1')?.sortOrder).toBeNull();
	});

	it.each([-1, 1.5, 'first'])('rejects an invalid sortOrder (%j)', async (bad) => {
		expect((await put('/api/settings/stacks/s1', { sortOrder: bad })).status).toBe(400);
		expect((await put('/api/settings/servers/v1', { sortOrder: bad })).status).toBe(400);
	});
});

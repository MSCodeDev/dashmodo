import { existsSync, readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { DATA_FILE_PATH, store } from './store.js';

afterEach(() => {
	store.updateAppSettings({ komodoUrl: null, komodoApiKey: null, komodoApiSecret: null });
});

describe('generated secrets', () => {
	it('creates a session secret and setup token on first boot and persists them', () => {
		expect(store.getSessionSecret()).toMatch(/^[0-9a-f]{64}$/);
		expect(store.getSetupToken()).toMatch(/^[A-Za-z0-9_-]{12}$/);

		const onDisk = JSON.parse(readFileSync(DATA_FILE_PATH, 'utf8'));
		expect(onDisk.sessionSecret).toBe(store.getSessionSecret());
		expect(onDisk.setupToken).toBe(store.getSetupToken());
	});

	it('keeps secrets out of appSettings so they can never leak via the settings API', () => {
		const settings = store.getAppSettings() as unknown as Record<string, unknown>;
		expect(settings).not.toHaveProperty('sessionSecret');
		expect(settings).not.toHaveProperty('setupToken');
	});
});

describe('isKomodoConfigured', () => {
	it('is false until URL, key and secret are all set', () => {
		expect(store.isKomodoConfigured()).toBe(false);
		store.updateAppSettings({ komodoUrl: 'http://komodo.test', komodoApiKey: 'key' });
		expect(store.isKomodoConfigured()).toBe(false);
		store.updateAppSettings({ komodoApiSecret: 'secret' });
		expect(store.isKomodoConfigured()).toBe(true);
	});
});

describe('persistence', () => {
	it('writes updates to disk atomically (no leftover temp file)', () => {
		store.updateAppSettings({ siteName: 'Homelab' });
		const onDisk = JSON.parse(readFileSync(DATA_FILE_PATH, 'utf8'));
		expect(onDisk.appSettings.siteName).toBe('Homelab');
		expect(existsSync(`${DATA_FILE_PATH}.tmp`)).toBe(false);
	});

	it('upserts per-resource settings without clobbering unrelated fields', () => {
		store.upsertResourceSettings('stack', 's1', { hidden: true });
		store.upsertResourceSettings('stack', 's1', { iconOverride: 'mdi:home' });
		expect(store.getResourceSettings('stack', 's1')).toMatchObject({
			hidden: true,
			iconOverride: 'mdi:home',
			linkOverride: null
		});
		expect(store.listResourceSettings('server')).toEqual([]);
	});
});

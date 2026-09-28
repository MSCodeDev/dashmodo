import './localstorage-polyfill.js';
import { KomodoClient, Types, type ReadResponses } from 'komodo_client';
import { store } from '../db/store.js';

export { Types };

export class KomodoNotConfiguredError extends Error {
	constructor() {
		super('Komodo is not configured yet — complete onboarding first.');
		this.name = 'KomodoNotConfiguredError';
	}
}

let clientCache: { fingerprint: string; client: ReturnType<typeof KomodoClient> } | undefined;

/**
 * Komodo connection details now live in the JSON store (set via onboarding or Settings) rather
 * than fixed env vars, so the client is built lazily and rebuilt whenever the config changes —
 * comparing a fingerprint each call is simpler and just as correct as an explicit invalidation hook.
 */
function getClient(): ReturnType<typeof KomodoClient> {
	const settings = store.getAppSettings();
	if (!settings.komodoUrl || !settings.komodoApiKey || !settings.komodoApiSecret) {
		throw new KomodoNotConfiguredError();
	}
	const fingerprint = `${settings.komodoUrl}:${settings.komodoApiKey}:${settings.komodoApiSecret}`;
	if (clientCache && clientCache.fingerprint === fingerprint) {
		return clientCache.client;
	}
	const client = KomodoClient(settings.komodoUrl, {
		type: 'api-key',
		params: { key: settings.komodoApiKey, secret: settings.komodoApiSecret }
	});
	clientCache = { fingerprint, client };
	return client;
}

const cache = new Map<string, { value: unknown; expires: number }>();

/** Wraps komodo.read() with a short TTL cache so dashboard polling doesn't hammer Komodo. */
export async function cachedRead<
	T extends Types.ReadRequest['type'],
	Req extends Extract<Types.ReadRequest, { type: T }>
>(type: T, params: Req['params'], ttlMs = 7000): Promise<ReadResponses[Req['type']]> {
	const key = `${type}:${JSON.stringify(params)}`;
	const hit = cache.get(key);
	if (hit && hit.expires > Date.now()) {
		return hit.value as ReadResponses[Req['type']];
	}
	const value = await getClient().read(type, params);
	cache.set(key, { value, expires: Date.now() + ttlMs });
	return value;
}

/**
 * komodo_client exposes no request timeout/AbortSignal, so an unreachable host (e.g. a typo'd IP)
 * would otherwise hang on the OS-level TCP timeout (minutes) instead of failing fast during
 * onboarding/settings. The underlying request isn't cancelled, just no longer waited on.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
	return Promise.race([
		promise,
		new Promise<never>((_, reject) =>
			setTimeout(() => reject(new Error('Timed out connecting to Komodo')), ms)
		)
	]);
}

/** Live call bypassing the cache — used to validate credentials during onboarding/settings edits. */
export async function testKomodoConnection(
	komodoUrl: string,
	komodoApiKey: string,
	komodoApiSecret: string
): Promise<void> {
	const client = KomodoClient(komodoUrl, {
		type: 'api-key',
		params: { key: komodoApiKey, secret: komodoApiSecret }
	});
	await withTimeout(client.read('ListServers', {}), 8000);
}

export interface KomodoError {
	status: number;
	message: string;
}

/** komodo_client rejects with `{ status, result: { error } }`, not an Error instance. */
export function normalizeKomodoError(err: unknown): KomodoError {
	if (err instanceof KomodoNotConfiguredError) {
		return { status: 503, message: err.message };
	}
	if (err && typeof err === 'object' && 'status' in err) {
		const e = err as { status: number; result?: { error?: string } };
		const validHttpStatus = e.status >= 100 && e.status < 600 && e.status !== 1;
		if (!validHttpStatus) {
			return { status: 502, message: unreachableMessage() };
		}
		return { status: e.status, message: e.result?.error ?? 'Komodo request failed' };
	}
	return { status: 502, message: unreachableMessage() };
}

function unreachableMessage(): string {
	const url = store.getAppSettings().komodoUrl;
	return `Could not reach Komodo at ${url} — check the connection settings and network connectivity.`;
}

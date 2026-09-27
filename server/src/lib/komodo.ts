import './localstorage-polyfill.js';
import { KomodoClient, Types, type ReadResponses } from 'komodo_client';
import { env } from '../env.js';

export const komodo = KomodoClient(env.KOMODO_URL, {
	type: 'api-key',
	params: { key: env.KOMODO_API_KEY, secret: env.KOMODO_API_SECRET }
});

export { Types };

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
	const value = await komodo.read(type, params);
	cache.set(key, { value, expires: Date.now() + ttlMs });
	return value;
}

import { Router } from 'express';
import { store } from '../db/store.js';
import { cachedRead, normalizeKomodoError } from '../lib/komodo.js';
import { resolveStackLink, type ResolvedLink } from '../lib/links.js';
import { slugifyIconRef } from '../lib/icons.js';
import { sortByOrder } from '../lib/sort.js';

export const stacksRouter = Router();

async function resolveLink(
	stackId: string,
	serverInfo: { address?: string; external_address?: string } | undefined,
	serverLinkOverride: string | null | undefined
): Promise<ResolvedLink> {
	let stackConfigLinks: string[] | undefined;
	try {
		const full = await cachedRead('GetStack', { stack: stackId }, 15000);
		stackConfigLinks = full.config?.links;
	} catch {
		// fall through to port-derived link below
	}
	if (stackConfigLinks && stackConfigLinks.length > 0) {
		return resolveStackLink({ stackConfigLinks });
	}

	let services;
	try {
		services = await cachedRead('ListStackServices', { stack: stackId }, 15000);
	} catch {
		services = undefined;
	}
	return resolveStackLink({
		server: serverInfo,
		services,
		serverLinkOverride,
		extraDenyPorts: store.getAppSettings().portDenylist
	});
}

stacksRouter.get('/', async (_req, res) => {
	try {
		const [stacks, servers] = await Promise.all([
			cachedRead('ListStacks', {}),
			cachedRead('ListServers', {})
		]);
		const serverInfoById = new Map(servers.map((s) => [s.id, s.info]));
		const stackSettings = new Map(
			store.listResourceSettings('stack').map((r) => [r.resourceId, r])
		);
		const serverSettings = new Map(
			store.listResourceSettings('server').map((r) => [r.resourceId, r])
		);
		const visible = stacks.filter((s) => !stackSettings.get(s.id)?.hidden);

		const enriched = await Promise.all(
			visible.map(async (stack) => {
				const setting = stackSettings.get(stack.id);
				const serverInfo = serverInfoById.get(stack.info.server_id);
				const serverLinkOverride = serverSettings.get(stack.info.server_id)?.linkOverride;
				const link = await resolveLink(stack.id, serverInfo, serverLinkOverride);
				const icon = setting?.iconOverride || slugifyIconRef(stack.name);
				return { ...stack, link, icon };
			})
		);

		res.json(
			sortByOrder(enriched, {
				name: (s) => s.name,
				order: (s) => stackSettings.get(s.id)?.sortOrder
			})
		);
	} catch (err) {
		const e = normalizeKomodoError(err);
		res.status(e.status).json({ error: e.message });
	}
});

stacksRouter.get('/:id', async (req, res) => {
	try {
		const [stack, services] = await Promise.all([
			cachedRead('GetStack', { stack: req.params.id }),
			cachedRead('ListStackServices', { stack: req.params.id }).catch(() => [])
		]);
		const setting = store.getResourceSettings('stack', req.params.id);

		let serverInfo: { address?: string; external_address?: string } | undefined;
		let serverLinkOverride: string | null | undefined;
		if (stack.config?.server_id) {
			try {
				const server = await cachedRead('GetServer', { server: stack.config.server_id });
				serverInfo = server.config;
			} catch {
				// server unreachable/deleted — link derivation just falls through to "none"
			}
			serverLinkOverride = store.getResourceSettings(
				'server',
				stack.config.server_id
			)?.linkOverride;
		}

		const link = resolveStackLink({
			stackConfigLinks: stack.config?.links,
			server: serverInfo,
			services,
			serverLinkOverride,
			extraDenyPorts: store.getAppSettings().portDenylist
		});

		const icon = setting?.iconOverride || slugifyIconRef(stack.name);

		res.json({ stack, services, link, icon });
	} catch (err) {
		const e = normalizeKomodoError(err);
		res.status(e.status).json({ error: e.message });
	}
});

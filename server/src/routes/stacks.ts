import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { resourceSettings } from '../db/schema.js';
import { cachedRead, normalizeKomodoError } from '../lib/komodo.js';
import { resolveStackLink, type ResolvedLink } from '../lib/links.js';

export const stacksRouter = Router();

async function getStackSettingsMap() {
	const rows = await db
		.select()
		.from(resourceSettings)
		.where(eq(resourceSettings.resourceType, 'stack'));
	return new Map(rows.map((r) => [r.resourceId, r]));
}

async function resolveLink(
	stackId: string,
	serverInfo: { address?: string; external_address?: string } | undefined,
	linkOverride: string | null | undefined
): Promise<ResolvedLink> {
	if (linkOverride) {
		return resolveStackLink({ linkOverride });
	}

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
	return resolveStackLink({ server: serverInfo, services });
}

stacksRouter.get('/', async (_req, res) => {
	try {
		const [stacks, servers, settings] = await Promise.all([
			cachedRead('ListStacks', {}),
			cachedRead('ListServers', {}),
			getStackSettingsMap()
		]);
		const serverInfoById = new Map(servers.map((s) => [s.id, s.info]));
		const visible = stacks.filter((s) => !settings.get(s.id)?.hidden);

		const enriched = await Promise.all(
			visible.map(async (stack) => {
				const setting = settings.get(stack.id);
				const serverInfo = serverInfoById.get(stack.info.server_id);
				const link = await resolveLink(stack.id, serverInfo, setting?.linkOverride);
				return { ...stack, link };
			})
		);

		res.json(enriched);
	} catch (err) {
		const e = normalizeKomodoError(err);
		res.status(e.status).json({ error: e.message });
	}
});

stacksRouter.get('/:id', async (req, res) => {
	try {
		const [stack, services, settingsRows] = await Promise.all([
			cachedRead('GetStack', { stack: req.params.id }),
			cachedRead('ListStackServices', { stack: req.params.id }).catch(() => []),
			db
				.select()
				.from(resourceSettings)
				.where(eq(resourceSettings.resourceId, req.params.id))
		]);
		const setting = settingsRows.find((r) => r.resourceType === 'stack');

		let serverInfo: { address?: string; external_address?: string } | undefined;
		if (stack.config?.server_id) {
			try {
				const server = await cachedRead('GetServer', { server: stack.config.server_id });
				serverInfo = server.config;
			} catch {
				// server unreachable/deleted — link derivation just falls through to "none"
			}
		}

		const link = setting?.linkOverride
			? resolveStackLink({ linkOverride: setting.linkOverride })
			: resolveStackLink({ stackConfigLinks: stack.config?.links, server: serverInfo, services });

		res.json({ stack, services, link });
	} catch (err) {
		const e = normalizeKomodoError(err);
		res.status(e.status).json({ error: e.message });
	}
});

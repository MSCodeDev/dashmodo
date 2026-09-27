import type { Types } from 'komodo_client';
import { env } from '../env.js';

const DEFAULT_DENY_PORTS = [
	22, 2222, 21, 25, 53, 111, 123, 137, 138, 139, 445, 465, 587, 636, 989, 990, 2049, 2181, 3306,
	5432, 5672, 6379, 9092, 9200, 9300, 11211, 15672, 27017
];

const denyPorts = new Set([...DEFAULT_DENY_PORTS, ...env.DASHMODO_PORT_DENYLIST]);

function extractHost(address: string): string | undefined {
	try {
		const url = new URL(address.includes('://') ? address : `http://${address}`);
		return url.hostname || undefined;
	} catch {
		return undefined;
	}
}

function urlFor(host: string, port: number): string {
	const scheme = port === 443 ? 'https' : 'http';
	return `${scheme}://${host}:${port}`;
}

export type LinkSource = 'override' | 'komodo' | 'derived' | 'none';

export interface ResolvedLink {
	url?: string;
	source: LinkSource;
}

export interface ResolveStackLinkInput {
	/** Full stack config, if fetched (only needed for the Komodo `links` field). */
	stackConfigLinks?: string[];
	server?: Pick<Types.ServerListItemInfo, 'address' | 'external_address'>;
	services?: Types.StackService[];
	linkOverride?: string | null;
}

/**
 * Priority: dashmodo admin override > Komodo's own `links` config > derived from the
 * server's external_address/address + first published container port > no link.
 */
export function resolveStackLink(input: ResolveStackLinkInput): ResolvedLink {
	if (input.linkOverride) {
		return { url: input.linkOverride, source: 'override' };
	}

	if (input.stackConfigLinks && input.stackConfigLinks.length > 0) {
		return { url: input.stackConfigLinks[0], source: 'komodo' };
	}

	const host = input.server
		? extractHost(input.server.external_address || input.server.address || '')
		: undefined;
	if (!host) {
		return { source: 'none' };
	}

	const ports = (input.services ?? [])
		.flatMap((s) => s.container?.ports ?? [])
		.filter(
			(p): p is Types.Port & { PublicPort: number } =>
				typeof p.PublicPort === 'number' &&
				(!p.Type || p.Type === 'tcp') &&
				!denyPorts.has(p.PublicPort)
		)
		.sort((a, b) => a.PublicPort - b.PublicPort);

	if (ports.length === 0) {
		return { source: 'none' };
	}

	return { url: urlFor(host, ports[0].PublicPort), source: 'derived' };
}

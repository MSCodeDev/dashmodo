import { describe, expect, it } from 'vitest';
import { DEFAULT_DENY_PORTS, resolveStackLink } from './links.js';

type Input = Parameters<typeof resolveStackLink>[0];

function services(...ports: Array<{ PublicPort?: number; Type?: string }>): Input['services'] {
	return [{ container: { ports } }] as unknown as Input['services'];
}

describe('resolveStackLink', () => {
	it("prefers Komodo's own links config over anything derived", () => {
		const link = resolveStackLink({
			stackConfigLinks: ['https://plex.example.com', 'https://other.example.com'],
			server: { address: 'http://10.0.0.5:8120' },
			services: services({ PublicPort: 32400, Type: 'tcp' })
		});
		expect(link).toEqual({ url: 'https://plex.example.com', source: 'komodo' });
	});

	it('falls through to derivation when the Komodo links list is empty', () => {
		const link = resolveStackLink({
			stackConfigLinks: [],
			server: { address: 'http://10.0.0.5:8120' },
			services: services({ PublicPort: 3000, Type: 'tcp' })
		});
		expect(link).toEqual({ url: 'http://10.0.0.5:3000', source: 'derived' });
	});

	it('prefers serverLinkOverride, then external_address, then address', () => {
		const base = { services: services({ PublicPort: 8080, Type: 'tcp' }) };
		const server = { address: 'http://internal:8120', external_address: 'public.example.com' };

		expect(resolveStackLink({ ...base, server, serverLinkOverride: '192.168.1.2' }).url).toBe(
			'http://192.168.1.2:8080'
		);
		expect(resolveStackLink({ ...base, server }).url).toBe('http://public.example.com:8080');
		expect(resolveStackLink({ ...base, server: { address: server.address } }).url).toBe(
			'http://internal:8080'
		);
	});

	it('picks the lowest eligible published port', () => {
		const link = resolveStackLink({
			server: { address: 'host' },
			services: services({ PublicPort: 9000 }, { PublicPort: 3000 }, { PublicPort: 8080 })
		});
		expect(link.url).toBe('http://host:3000');
	});

	it('uses https for port 443', () => {
		const link = resolveStackLink({
			server: { address: 'host' },
			services: services({ PublicPort: 443, Type: 'tcp' })
		});
		expect(link.url).toBe('https://host:443');
	});

	it('skips the built-in non-web ports', () => {
		const link = resolveStackLink({
			server: { address: 'host' },
			services: services(
				{ PublicPort: 22 },
				{ PublicPort: 5432 },
				{ PublicPort: 3306 },
				{ PublicPort: 8081 }
			)
		});
		expect(link.url).toBe('http://host:8081');
	});

	it('also skips admin-configured extra deny ports', () => {
		const input = {
			server: { address: 'host' },
			services: services({ PublicPort: 1234 }, { PublicPort: 5678 })
		};
		expect(resolveStackLink(input).url).toBe('http://host:1234');
		expect(resolveStackLink({ ...input, extraDenyPorts: [1234] }).url).toBe('http://host:5678');
	});

	it('does not leak extraDenyPorts into later calls (stays pure)', () => {
		const input = { server: { address: 'host' }, services: services({ PublicPort: 1234 }) };
		resolveStackLink({ ...input, extraDenyPorts: [1234] });
		expect(DEFAULT_DENY_PORTS).not.toContain(1234);
		expect(resolveStackLink(input).url).toBe('http://host:1234');
	});

	it('ignores UDP ports and ports with no public mapping', () => {
		const link = resolveStackLink({
			server: { address: 'host' },
			services: services(
				{ PublicPort: 5353, Type: 'udp' },
				{ Type: 'tcp' },
				{ PublicPort: 8000, Type: 'tcp' }
			)
		});
		expect(link.url).toBe('http://host:8000');
	});

	it('returns no link without a usable host', () => {
		expect(resolveStackLink({ services: services({ PublicPort: 8000 }) })).toEqual({
			source: 'none'
		});
	});

	it('returns no link when there are no eligible ports', () => {
		expect(resolveStackLink({ server: { address: 'host' } })).toEqual({ source: 'none' });
		expect(
			resolveStackLink({ server: { address: 'host' }, services: services({ PublicPort: 22 }) })
		).toEqual({ source: 'none' });
	});
});

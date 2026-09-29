import { describe, expect, it } from 'vitest';
import { resolveIconUrl, selfhstIconUrl } from './icons';

describe('resolveIconUrl', () => {
	it('uses direct URLs as-is', () => {
		expect(resolveIconUrl('https://example.com/i.png')).toBe('https://example.com/i.png');
		expect(resolveIconUrl('http://example.com/i.png')).toBe('http://example.com/i.png');
	});

	it('maps uploads to our own endpoint', () => {
		expect(resolveIconUrl('upload:abc.png')).toBe('/api/uploaded-icons/abc.png');
	});

	it('maps mdi: and si: references to their CDNs', () => {
		expect(resolveIconUrl('mdi:home')).toBe(
			'https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/home.svg'
		);
		expect(resolveIconUrl('si:plex')).toBe(
			'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/plex.svg'
		);
	});

	it('treats bare names and sh: as selfh.st, honoring the icon style', () => {
		const dark = 'https://cdn.jsdelivr.net/gh/selfhst/icons/webp/plex-dark.webp';
		const plain = 'https://cdn.jsdelivr.net/gh/selfhst/icons/webp/plex.webp';
		expect(resolveIconUrl('plex')).toBe(plain);
		expect(resolveIconUrl('sh:plex')).toBe(plain);
		expect(resolveIconUrl('plex', 'dark')).toBe(dark);
		expect(resolveIconUrl('sh:plex', 'dark')).toBe(dark);
	});
});

describe('selfhstIconUrl', () => {
	it('appends the style suffix only for non-default styles and supports other formats', () => {
		expect(selfhstIconUrl('plex', 'light', 'png')).toBe(
			'https://cdn.jsdelivr.net/gh/selfhst/icons/png/plex-light.png'
		);
		expect(selfhstIconUrl('plex', 'default', 'svg')).toBe(
			'https://cdn.jsdelivr.net/gh/selfhst/icons/svg/plex.svg'
		);
	});
});

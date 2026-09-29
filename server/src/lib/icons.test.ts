import { describe, expect, it } from 'vitest';
import { slugifyIconRef } from './icons.js';

describe('slugifyIconRef', () => {
	it('lowercases and hyphenates spaces', () => {
		expect(slugifyIconRef('Home Assistant')).toBe('home-assistant');
	});

	it('collapses runs of non-alphanumerics into a single hyphen', () => {
		expect(slugifyIconRef('nginx_proxy--manager')).toBe('nginx-proxy-manager');
	});

	it('trims leading and trailing separators', () => {
		expect(slugifyIconRef('  --Plex!!  ')).toBe('plex');
	});

	it('keeps existing hyphens and digits', () => {
		expect(slugifyIconRef('Paperless-ngx 2')).toBe('paperless-ngx-2');
	});

	it('returns an empty string when nothing usable remains', () => {
		expect(slugifyIconRef('!!!')).toBe('');
	});
});

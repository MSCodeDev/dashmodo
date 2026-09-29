import { describe, expect, it } from 'vitest';
import { extForMime, isAllowedMime } from './iconStorage.js';

describe('icon upload allowlist', () => {
	it.each([
		['image/png', 'png'],
		['image/jpeg', 'jpg'],
		['image/webp', 'webp'],
		['image/gif', 'gif']
	])('allows %s', (mime, ext) => {
		expect(isAllowedMime(mime)).toBe(true);
		expect(extForMime(mime)).toBe(ext);
	});

	// Regression: SVG can carry an inline <script> and is served publicly + same-origin, so it
	// must never be accepted (stored XSS).
	it('rejects SVG', () => {
		expect(isAllowedMime('image/svg+xml')).toBe(false);
	});

	it.each(['text/html', 'application/javascript', 'application/octet-stream', ''])(
		'rejects %j',
		(mime) => {
			expect(isAllowedMime(mime)).toBe(false);
		}
	);
});

// komodo_client's dependency `mogh_auth_client` reads `localStorage` unconditionally
// at module-load time, which throws outside a browser. Import this *before* importing
// komodo_client anywhere (see lib/komodo.ts) so its module graph finds a global already.
if (typeof globalThis.localStorage === 'undefined') {
	Object.defineProperty(globalThis, 'localStorage', {
		value: {
			getItem: () => null,
			setItem: () => {},
			removeItem: () => {},
			clear: () => {},
			key: () => null,
			length: 0
		},
		writable: true
	});
}

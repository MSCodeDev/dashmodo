import { useEffect } from 'react';
import { useMantineColorScheme } from '@mantine/core';
import { useConfig } from '../../hooks/useConfig';
import { resolveIconUrl } from '../../lib/icons';

const CUSTOM_CSS_ID = 'dashmodo-custom-css';

let defaultFavicon: { href: string; type: string | null } | undefined;

// Replace the element rather than mutating href — some browsers ignore an in-place change.
function setFavicon(href: string, type: string | null) {
	document.querySelectorAll('link[rel~="icon"]').forEach((el) => el.remove());
	const link = document.createElement('link');
	link.rel = 'icon';
	link.href = href;
	if (type) link.type = type;
	document.head.appendChild(link);
}

/** Applies admin-configured global settings (title, color scheme, custom CSS) as side effects. */
export function AppSettingsEffects() {
	const config = useConfig();
	const { setColorScheme } = useMantineColorScheme();
	const siteName = config.data?.appSettings.siteName;
	const colorScheme = config.data?.appSettings.colorScheme;
	const customCss = config.data?.appSettings.customCss;
	const logoRef = config.data?.appSettings.logoRef;

	useEffect(() => {
		document.title = siteName || 'Dashmodo';
	}, [siteName]);

	useEffect(() => {
		if (!colorScheme) return;
		setColorScheme(colorScheme === 'system' ? 'auto' : colorScheme);
	}, [colorScheme, setColorScheme]);

	useEffect(() => {
		let styleEl = document.getElementById(CUSTOM_CSS_ID) as HTMLStyleElement | null;
		if (!customCss) {
			styleEl?.remove();
			return;
		}
		if (!styleEl) {
			styleEl = document.createElement('style');
			styleEl.id = CUSTOM_CSS_ID;
			document.head.appendChild(styleEl);
		}
		styleEl.textContent = customCss;
	}, [customCss]);

	useEffect(() => {
		if (!defaultFavicon) {
			const link = document.querySelector('link[rel~="icon"]');
			defaultFavicon = {
				href: link?.getAttribute('href') ?? '/favicon.ico',
				type: link?.getAttribute('type') ?? null
			};
		}
		// No explicit type for a custom icon: the built-in one is declared as SVG, which would be
		// wrong for an uploaded PNG/JPEG/WebP/GIF, so let the browser sniff it.
		if (logoRef) setFavicon(resolveIconUrl(logoRef), null);
		else setFavicon(defaultFavicon.href, defaultFavicon.type);
	}, [logoRef]);

	return null;
}

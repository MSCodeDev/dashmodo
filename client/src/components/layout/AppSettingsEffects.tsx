import { useEffect } from 'react';
import { useMantineColorScheme } from '@mantine/core';
import { useConfig } from '../../hooks/useConfig';

const CUSTOM_CSS_ID = 'dashmodo-custom-css';

/** Applies admin-configured global settings (title, color scheme, custom CSS) as side effects. */
export function AppSettingsEffects() {
	const config = useConfig();
	const { setColorScheme } = useMantineColorScheme();
	const siteName = config.data?.appSettings.siteName;
	const colorScheme = config.data?.appSettings.colorScheme;
	const customCss = config.data?.appSettings.customCss;

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

	return null;
}

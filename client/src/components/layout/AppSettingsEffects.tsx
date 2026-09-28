import { useEffect } from 'react';
import { useMantineColorScheme } from '@mantine/core';
import { useConfig } from '../../hooks/useConfig';

const CUSTOM_CSS_ID = 'dashmodo-custom-css';

/** Applies admin-configured global settings (title, color scheme, custom CSS) as side effects. */
export function AppSettingsEffects() {
	const config = useConfig();
	const { setColorScheme } = useMantineColorScheme();
	const settings = config.data?.appSettings;

	useEffect(() => {
		document.title = settings?.siteName || 'Dashmodo';
	}, [settings?.siteName]);

	useEffect(() => {
		if (!settings) return;
		setColorScheme(settings.colorScheme === 'system' ? 'auto' : settings.colorScheme);
	}, [settings?.colorScheme, setColorScheme]);

	useEffect(() => {
		let styleEl = document.getElementById(CUSTOM_CSS_ID) as HTMLStyleElement | null;
		if (!settings?.customCss) {
			styleEl?.remove();
			return;
		}
		if (!styleEl) {
			styleEl = document.createElement('style');
			styleEl.id = CUSTOM_CSS_ID;
			document.head.appendChild(styleEl);
		}
		styleEl.textContent = settings.customCss;
	}, [settings?.customCss]);

	return null;
}

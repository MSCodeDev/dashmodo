export interface ThemeColorOption {
	name: string;
	value: string;
}

export const THEME_COLORS: ThemeColorOption[] = [
	{ name: 'Teal', value: '#2dd4bf' },
	{ name: 'Orange', value: '#f97316' },
	{ name: 'Blue', value: '#3b82f6' },
	{ name: 'Violet', value: '#8b5cf6' },
	{ name: 'Pink', value: '#ec4899' },
	{ name: 'Green', value: '#22c55e' },
	{ name: 'Red', value: '#ef4444' },
	{ name: 'Amber', value: '#f59e0b' },
	{ name: 'Cyan', value: '#06b6d4' },
	{ name: 'Indigo', value: '#6366f1' }
];

export const DEFAULT_THEME_COLOR = THEME_COLORS[0].value;

import { createTheme } from '@mantine/core';

// Background confirmed from Komodo's own source (ui/src/index.scss): #0f1115.
// The rest of the palette is calibrated around it — Komodo's actual color tokens live in
// a private package we don't have access to, so this matches the screenshot closely rather
// than being pixel-identical.
export const theme = createTheme({
	fontFamily: 'Inter, sans-serif',
	fontFamilyMonospace: 'ui-monospace, SFMono-Regular, Menlo, monospace',
	headings: {
		fontFamily: 'Space Grotesk, sans-serif',
		fontWeight: '700'
	},
	primaryColor: 'blue',
	colors: {
		dark: [
			'#e9eaed', // 0 — primary text
			'#c8cad0', // 1
			'#9a9ca6', // 2 — dimmed text
			'#6b6e79', // 3
			'#3a3d47', // 4 — borders
			'#262932', // 5 — hover surfaces
			'#1b1d24', // 6 — card/panel surfaces
			'#0f1115', // 7 — page background (matches Komodo)
			'#0a0b0e', // 8
			'#050608' // 9
		],
		green: [
			'#e6fbf0',
			'#c3f5da',
			'#8feabc',
			'#5edb9d',
			'#3ecf8b',
			'#2ecc82',
			'#22c55e', // 6 — status icon/progress color
			'#16a34a',
			'#0f7a38',
			'#0a5c2a'
		],
		yellow: [
			'#fff8e6',
			'#ffedb3',
			'#ffe080',
			'#ffd24d',
			'#ffc61f',
			'#f9b414',
			'#f5a524', // 6 — status icon/progress color
			'#d1860f',
			'#a8690c',
			'#7a4d09'
		],
		red: [
			'#feeceb',
			'#fcc9c7',
			'#f9a3a0',
			'#f57d78',
			'#f15c56',
			'#ef4f48',
			'#ef4444', // 6 — status icon/progress color
			'#dc2626',
			'#b91c1c',
			'#8a1414'
		],
		blue: [
			'#e8f1ff',
			'#c2ddff',
			'#99c7ff',
			'#70b0ff',
			'#4f9dff',
			'#3d90ff',
			'#3b82f6', // 6
			'#2f6fe0',
			'#255ac2',
			'#1c4494'
		]
	}
});

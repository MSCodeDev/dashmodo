// https://selfh.st/icons-about/
const SELFHST_ICONS_BASE = 'https://cdn.jsdelivr.net/gh/selfhst/icons';

export function selfhstIconUrl(ref: string, format: 'webp' | 'png' | 'svg' = 'webp'): string {
	return `${SELFHST_ICONS_BASE}/${format}/${ref}.${format}`;
}

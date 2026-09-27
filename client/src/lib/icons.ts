import type { IconStyle } from './types';

// https://selfh.st/icons-about/
const SELFHST_ICONS_BASE = 'https://cdn.jsdelivr.net/gh/selfhst/icons';

export function selfhstIconUrl(
	ref: string,
	style: IconStyle = 'default',
	format: 'webp' | 'png' | 'svg' = 'webp'
): string {
	const suffix = style === 'default' ? '' : `-${style}`;
	return `${SELFHST_ICONS_BASE}/${format}/${ref}${suffix}.${format}`;
}

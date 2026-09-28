import type { IconStyle } from './types';

// https://selfh.st/icons-about/
const SELFHST_ICONS_BASE = 'https://cdn.jsdelivr.net/gh/selfhst/icons';
const MDI_BASE = 'https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg';
const SIMPLE_ICONS_BASE = 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons';

export function selfhstIconUrl(
	ref: string,
	style: IconStyle = 'default',
	format: 'webp' | 'png' | 'svg' = 'webp'
): string {
	const suffix = style === 'default' ? '' : `-${style}`;
	return `${SELFHST_ICONS_BASE}/${format}/${ref}${suffix}.${format}`;
}

/**
 * Resolves an icon reference to an actual image URL, supporting multiple sources (like
 * gethomepage): a direct URL, an admin-uploaded file, Material Design Icons, Simple Icons, or
 * selfh.st/icons (the default when no source prefix is given).
 *
 *   https://example.com/icon.png  -> used as-is
 *   upload:<filename>              -> our own /api/uploaded-icons/<filename>
 *   mdi:<name>                     -> Material Design Icons
 *   si:<name>                      -> Simple Icons
 *   sh:<name>  or just  <name>     -> selfh.st/icons (default)
 */
export function resolveIconUrl(ref: string, style: IconStyle = 'default'): string {
	if (/^https?:\/\//.test(ref)) {
		return ref;
	}
	if (ref.startsWith('upload:')) {
		return `/api/uploaded-icons/${ref.slice('upload:'.length)}`;
	}
	if (ref.startsWith('mdi:')) {
		return `${MDI_BASE}/${ref.slice('mdi:'.length)}.svg`;
	}
	if (ref.startsWith('si:')) {
		return `${SIMPLE_ICONS_BASE}/${ref.slice('si:'.length)}.svg`;
	}
	if (ref.startsWith('sh:')) {
		return selfhstIconUrl(ref.slice('sh:'.length), style);
	}
	return selfhstIconUrl(ref, style);
}

import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { DATA_FILE_PATH } from '../db/store.js';

export const ICONS_DIR = path.join(path.dirname(DATA_FILE_PATH), 'icons');

export function ensureIconsDir() {
	mkdirSync(ICONS_DIR, { recursive: true });
}

const ALLOWED_MIME_TO_EXT: Record<string, string> = {
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/webp': 'webp',
	'image/svg+xml': 'svg',
	'image/gif': 'gif'
};

export function isAllowedMime(mime: string): boolean {
	return mime in ALLOWED_MIME_TO_EXT;
}

export function extForMime(mime: string): string {
	return ALLOWED_MIME_TO_EXT[mime];
}

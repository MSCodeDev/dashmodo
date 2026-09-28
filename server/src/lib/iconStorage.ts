import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { DATA_FILE_PATH } from '../db/store.js';

export const ICONS_DIR = path.join(path.dirname(DATA_FILE_PATH), 'icons');

export function ensureIconsDir() {
	mkdirSync(ICONS_DIR, { recursive: true });
}

// No SVG: it can carry an inline <script>, which executes if a browser is navigated directly to
// the uploaded file's URL (served statically, publicly readable) — a stored XSS vector, and this
// route was previously open to anyone whenever no admin password had been set.
const ALLOWED_MIME_TO_EXT: Record<string, string> = {
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/webp': 'webp',
	'image/gif': 'gif'
};

export function isAllowedMime(mime: string): boolean {
	return mime in ALLOWED_MIME_TO_EXT;
}

export function extForMime(mime: string): string {
	return ALLOWED_MIME_TO_EXT[mime];
}

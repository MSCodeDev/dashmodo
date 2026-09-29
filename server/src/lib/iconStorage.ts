import { existsSync, mkdirSync, rmSync } from 'node:fs';
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

// Matches only filenames our own upload route generates (random UUID + allowlisted extension), so
// a reference can be safely turned into a path under ICONS_DIR.
const UPLOAD_REF_RE =
	/^upload:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:png|jpg|webp|gif))$/;

export function isUploadRef(ref: string): boolean {
	return UPLOAD_REF_RE.test(ref);
}

function uploadPath(ref: string): string | null {
	const match = UPLOAD_REF_RE.exec(ref);
	return match ? path.join(ICONS_DIR, match[1]) : null;
}

export function uploadedIconExists(ref: string): boolean {
	const file = uploadPath(ref);
	return file !== null && existsSync(file);
}

export function deleteUploadedIcon(ref: string): void {
	const file = uploadPath(ref);
	if (file) rmSync(file, { force: true });
}

export function isAllowedMime(mime: string): boolean {
	return mime in ALLOWED_MIME_TO_EXT;
}

export function extForMime(mime: string): string {
	return ALLOWED_MIME_TO_EXT[mime];
}

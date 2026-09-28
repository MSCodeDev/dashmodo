import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { ICONS_DIR, ensureIconsDir, isAllowedMime, extForMime } from '../lib/iconStorage.js';

ensureIconsDir();

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, ICONS_DIR),
	filename: (_req, file, cb) => cb(null, `${randomUUID()}.${extForMime(file.mimetype)}`)
});

const upload = multer({
	storage,
	limits: { fileSize: 2 * 1024 * 1024 },
	fileFilter: (_req, file, cb) => {
		if (!isAllowedMime(file.mimetype)) {
			cb(new Error('Unsupported file type — use PNG, JPEG, WebP, or GIF'));
			return;
		}
		cb(null, true);
	}
});

export const iconsRouter = Router();

iconsRouter.use(requireAdmin);

iconsRouter.post('/', (req, res) => {
	upload.single('file')(req, res, (err: unknown) => {
		if (err) {
			res.status(400).json({ error: err instanceof Error ? err.message : 'Upload failed' });
			return;
		}
		if (!req.file) {
			res.status(400).json({ error: 'No file uploaded' });
			return;
		}
		res.json({ ref: `upload:${req.file.filename}` });
	});
});

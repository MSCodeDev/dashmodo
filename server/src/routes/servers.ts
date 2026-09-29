import { Router } from 'express';
import { store } from '../db/store.js';
import { cachedRead, normalizeKomodoError, Types } from '../lib/komodo.js';
import { sortByOrder } from '../lib/sort.js';

export const serversRouter = Router();

serversRouter.get('/', async (_req, res) => {
	try {
		const servers = await cachedRead('ListServers', {});
		const settingsById = new Map(
			store.listResourceSettings('server').map((r) => [r.resourceId, r])
		);
		res.json(
			sortByOrder(servers, { name: (s) => s.name, order: (s) => settingsById.get(s.id)?.sortOrder })
		);
	} catch (err) {
		const e = normalizeKomodoError(err);
		res.status(e.status).json({ error: e.message });
	}
});

serversRouter.get('/:id', async (req, res) => {
	try {
		const [server, stats] = await Promise.all([
			cachedRead('GetServer', { server: req.params.id }),
			cachedRead('GetSystemStats', { server: req.params.id }, 5000).catch(() => undefined)
		]);
		res.json({ server, stats });
	} catch (err) {
		const e = normalizeKomodoError(err);
		res.status(e.status).json({ error: e.message });
	}
});

serversRouter.get('/:id/history', async (req, res) => {
	try {
		const granularity =
			(req.query.granularity as Types.Timelength | undefined) ?? Types.Timelength.OneMinute;
		const page = req.query.page ? Number(req.query.page) : undefined;
		const history = await cachedRead(
			'GetHistoricalServerStats',
			{ server: req.params.id, granularity, page },
			30000
		);
		res.json(history);
	} catch (err) {
		const e = normalizeKomodoError(err);
		res.status(e.status).json({ error: e.message });
	}
});

import express from 'express';
import { serversRouter } from './routes/servers.js';
import { stacksRouter } from './routes/stacks.js';

export const app = express();

app.use(express.json());

app.get('/api/health', (_req, res) => {
	res.json({ ok: true });
});

app.use('/api/servers', serversRouter);
app.use('/api/stacks', stacksRouter);

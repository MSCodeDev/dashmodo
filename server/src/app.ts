import express from 'express';
import cookieParser from 'cookie-parser';
import { serversRouter } from './routes/servers.js';
import { stacksRouter } from './routes/stacks.js';
import { adminRouter } from './routes/admin.js';
import { settingsRouter } from './routes/settings.js';

export const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
	res.json({ ok: true });
});

app.use('/api/servers', serversRouter);
app.use('/api/stacks', stacksRouter);
app.use('/api/admin', adminRouter);
app.use('/api/settings', settingsRouter);

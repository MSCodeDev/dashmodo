import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import * as schema from './schema.js';
import { env } from '../env.js';

mkdirSync(dirname(env.DASHMODO_DB_PATH), { recursive: true });

const client = new Database(env.DASHMODO_DB_PATH);
client.pragma('journal_mode = WAL');

export const db = drizzle(client, { schema });

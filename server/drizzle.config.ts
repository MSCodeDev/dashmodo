import { defineConfig } from 'drizzle-kit';

const dbPath = process.env.DASHMODO_DB_PATH ?? './data/dashmodo.sqlite';

export default defineConfig({
	schema: './src/db/schema.ts',
	out: './drizzle',
	dialect: 'sqlite',
	dbCredentials: { url: dbPath },
	verbose: true,
	strict: true
});

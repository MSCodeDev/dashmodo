function required(name: string): string {
	const value = process.env[name];
	if (!value) {
		console.error(`Missing required env var: ${name} (see .env.example)`);
		process.exit(1);
	}
	return value;
}

export const env = {
	KOMODO_URL: required('KOMODO_URL'),
	KOMODO_API_KEY: required('KOMODO_API_KEY'),
	KOMODO_API_SECRET: required('KOMODO_API_SECRET'),
	PORT: Number(process.env.PORT ?? 4000),
	DASHMODO_DATA_FILE: process.env.DASHMODO_DATA_FILE ?? './data/dashmodo.json',
	ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || undefined,
	ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET || 'dev-insecure-secret-change-me',
	DASHMODO_PORT_DENYLIST: (process.env.DASHMODO_PORT_DENYLIST ?? '')
		.split(',')
		.map((p) => Number(p.trim()))
		.filter((p) => Number.isFinite(p) && p > 0)
};

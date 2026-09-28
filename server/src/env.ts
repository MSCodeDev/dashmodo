export const env = {
	PORT: Number(process.env.PORT ?? 4000),
	// The admin password itself now lives (hashed) in the JSON store, set via onboarding or
	// Settings — this is just the secret used to sign the session cookie, a deployment-level
	// concern distinct from the user-facing password.
	ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET || 'dev-insecure-secret-change-me'
};

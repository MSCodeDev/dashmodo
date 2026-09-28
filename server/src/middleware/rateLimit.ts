import rateLimit from 'express-rate-limit';

/** Guards the admin password and the onboarding setup token — both are guessable secrets. */
export const authRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: 'Too many attempts — try again later' }
});

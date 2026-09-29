import type { NextFunction, Request, Response } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { store } from '../db/store.js';
import { COOKIE_NAME, createSessionCookie, hashPassword } from '../lib/auth.js';
import { requireAdmin } from './requireAdmin.js';

function run(cookie?: string) {
	const req = { cookies: cookie ? { [COOKIE_NAME]: cookie } : undefined } as unknown as Request;
	const json = vi.fn();
	const status = vi.fn(() => ({ json }));
	const res = { status } as unknown as Response;
	const next = vi.fn() as unknown as NextFunction;
	requireAdmin(req, res, next);
	return { next, status, json };
}

afterEach(() => {
	store.updateAppSettings({ adminPasswordHash: null });
});

describe('requireAdmin', () => {
	it('lets everything through when no admin password is set', () => {
		const { next, status } = run();
		expect(next).toHaveBeenCalledOnce();
		expect(status).not.toHaveBeenCalled();
	});

	describe('with an admin password set', () => {
		const setPassword = () =>
			store.updateAppSettings({ adminPasswordHash: hashPassword('hunter22') });

		it('rejects requests without a session cookie', () => {
			setPassword();
			const { next, status } = run();
			expect(next).not.toHaveBeenCalled();
			expect(status).toHaveBeenCalledWith(401);
		});

		it('rejects an invalid session cookie', () => {
			setPassword();
			const { next, status } = run('garbage.value');
			expect(next).not.toHaveBeenCalled();
			expect(status).toHaveBeenCalledWith(401);
		});

		it('accepts a valid session cookie', () => {
			setPassword();
			const { next, status } = run(createSessionCookie());
			expect(next).toHaveBeenCalledOnce();
			expect(status).not.toHaveBeenCalled();
		});
	});
});

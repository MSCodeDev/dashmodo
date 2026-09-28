const BASE = '/api';

export class ApiError extends Error {
	status: number;
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${BASE}${path}`, {
		...init,
		headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
		credentials: 'same-origin'
	});

	if (!res.ok) {
		let message = res.statusText;
		try {
			const body = await res.json();
			if (typeof body?.error === 'string') message = body.error;
		} catch {
			// no JSON body — keep statusText
		}
		throw new ApiError(res.status, message);
	}

	if (res.status === 204) return undefined as T;
	return res.json();
}

export const api = {
	get: <T>(path: string) => request<T>(path),
	put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
	post: <T>(path: string, body?: unknown) =>
		request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
	// No content-type header here — the browser sets its own multipart boundary for FormData.
	async upload<T>(path: string, formData: FormData): Promise<T> {
		const res = await fetch(`${BASE}${path}`, {
			method: 'POST',
			body: formData,
			credentials: 'same-origin'
		});
		if (!res.ok) {
			let message = res.statusText;
			try {
				const body = await res.json();
				if (typeof body?.error === 'string') message = body.error;
			} catch {
				// no JSON body — keep statusText
			}
			throw new ApiError(res.status, message);
		}
		return res.json();
	}
};

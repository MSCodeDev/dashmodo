import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AdminSession } from '../lib/types';

export function useAdminSession() {
	return useQuery({
		queryKey: ['admin-session'],
		queryFn: () => api.get<AdminSession>('/admin/session')
	});
}

export function useAdminLogin() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (password: string) => api.post('/admin/login', { password }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-session'] })
	});
}

export function useAdminLogout() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => api.post('/admin/logout'),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-session'] })
	});
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { toast } from '../lib/toast';
import type { ServerSettingsRow, StackSettingsRow } from '../lib/types';

export function useSettingsStacks() {
	return useQuery({
		queryKey: ['settings-stacks'],
		queryFn: () => api.get<StackSettingsRow[]>('/settings/stacks')
	});
}

export function useUpdateStackSettings() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			...body
		}: {
			id: string;
			hidden?: boolean;
			linkOverride?: string | null;
			iconOverride?: string | null;
		}) => api.put(`/settings/stacks/${id}`, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['settings-stacks'] });
			qc.invalidateQueries({ queryKey: ['stacks'] });
			toast.success('Stack settings saved');
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to save stack settings')
	});
}

export function useSettingsServers() {
	return useQuery({
		queryKey: ['settings-servers'],
		queryFn: () => api.get<ServerSettingsRow[]>('/settings/servers')
	});
}

export function useUpdateServerSettings() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...body }: { id: string; linkOverride?: string | null }) =>
			api.put(`/settings/servers/${id}`, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['settings-servers'] });
			qc.invalidateQueries({ queryKey: ['stacks'] });
			toast.success('Server settings saved');
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to save server settings')
	});
}

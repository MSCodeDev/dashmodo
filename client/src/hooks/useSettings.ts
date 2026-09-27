import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { StackSettingsRow } from '../lib/types';

export function useSettingsStacks() {
	return useQuery({
		queryKey: ['settings-stacks'],
		queryFn: () => api.get<StackSettingsRow[]>('/settings/stacks')
	});
}

export function useUpdateStackSettings() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...body }: { id: string; hidden?: boolean; linkOverride?: string | null }) =>
			api.put(`/settings/stacks/${id}`, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['settings-stacks'] });
			qc.invalidateQueries({ queryKey: ['stacks'] });
		}
	});
}

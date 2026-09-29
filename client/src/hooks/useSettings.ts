import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { toast } from '../lib/toast';
import type {
	AppSettings,
	ConnectionSettings,
	ServerSettingsRow,
	StackSettingsRow
} from '../lib/types';

export function useConnectionSettings() {
	return useQuery({
		queryKey: ['settings-connection'],
		queryFn: () => api.get<ConnectionSettings>('/settings/connection')
	});
}

export function useSettingsStacks() {
	return useQuery({
		queryKey: ['settings-stacks'],
		queryFn: () => api.get<StackSettingsRow[]>('/settings/stacks')
	});
}

export function useSettingsServers() {
	return useQuery({
		queryKey: ['settings-servers'],
		queryFn: () => api.get<ServerSettingsRow[]>('/settings/servers')
	});
}

export interface PendingStackChange {
	hidden?: boolean;
	iconOverride?: string | null;
	sortOrder?: number | null;
}

export interface PendingServerChange {
	linkOverride?: string | null;
	sortOrder?: number | null;
}

export type PendingAppChange = Partial<AppSettings> & {
	komodoApiKey?: string;
	komodoApiSecret?: string;
	adminPassword?: string;
};

/** Batches every pending edit (stacks, servers, global settings) behind one Save action. */
export function useSaveAllSettings() {
	const qc = useQueryClient();
	const [isPending, setIsPending] = useState(false);

	async function save(
		pendingStacks: Record<string, PendingStackChange>,
		pendingServers: Record<string, PendingServerChange>,
		pendingApp: PendingAppChange
	) {
		setIsPending(true);
		try {
			await Promise.all([
				...Object.entries(pendingStacks).map(([id, patch]) =>
					api.put(`/settings/stacks/${id}`, patch)
				),
				...Object.entries(pendingServers).map(([id, patch]) =>
					api.put(`/settings/servers/${id}`, patch)
				),
				...(Object.keys(pendingApp).length > 0 ? [api.put('/settings/app', pendingApp)] : [])
			]);
			qc.invalidateQueries({ queryKey: ['settings-stacks'] });
			qc.invalidateQueries({ queryKey: ['settings-servers'] });
			qc.invalidateQueries({ queryKey: ['settings-connection'] });
			qc.invalidateQueries({ queryKey: ['stacks'] });
			qc.invalidateQueries({ queryKey: ['servers'] });
			qc.invalidateQueries({ queryKey: ['config'] });
			toast.success('Settings saved');
			return true;
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to save settings');
			return false;
		} finally {
			setIsPending(false);
		}
	}

	return { save, isPending };
}

/** Uploads a custom icon file, returning its `upload:<filename>` reference. */
export function useUploadIcon() {
	return useMutation({
		mutationFn: (file: File) => {
			const formData = new FormData();
			formData.append('file', file);
			return api.upload<{ ref: string }>('/settings/icons', formData);
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to upload icon')
	});
}

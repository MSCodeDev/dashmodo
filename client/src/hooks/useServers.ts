import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ServerListItem, ServerDetail, SystemStatsRecord } from '../lib/types';

export function useServers() {
	return useQuery({
		queryKey: ['servers'],
		queryFn: () => api.get<ServerListItem[]>('/servers'),
		refetchInterval: 15000
	});
}

export function useServerDetail(serverId: string, enabled: boolean) {
	return useQuery({
		queryKey: ['server-detail', serverId],
		queryFn: () => api.get<ServerDetail>(`/servers/${serverId}`),
		enabled,
		refetchInterval: enabled ? 10000 : false
	});
}

interface HistoricalResponse {
	stats: SystemStatsRecord[];
	next_page?: number;
}

export function useServerHistory(serverId: string, granularity: string, enabled: boolean) {
	return useQuery({
		queryKey: ['server-history', serverId, granularity],
		queryFn: () =>
			api.get<HistoricalResponse>(`/servers/${serverId}/history?granularity=${granularity}`),
		enabled,
		staleTime: 30000
	});
}

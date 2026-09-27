import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AppConfig } from '../lib/types';

export function useConfig() {
	return useQuery({
		queryKey: ['config'],
		queryFn: () => api.get<AppConfig>('/config'),
		staleTime: Infinity
	});
}

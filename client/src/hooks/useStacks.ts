import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { StackListItem } from '../lib/types';

export function useStacks() {
	return useQuery({
		queryKey: ['stacks'],
		queryFn: () => api.get<StackListItem[]>('/stacks'),
		refetchInterval: 15000
	});
}

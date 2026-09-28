import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface OnboardingPayload {
	komodoUrl: string;
	komodoApiKey: string;
	komodoApiSecret: string;
	adminPassword?: string;
}

export function useOnboarding() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: OnboardingPayload) => api.post('/onboarding', payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['config'] });
		}
	});
}

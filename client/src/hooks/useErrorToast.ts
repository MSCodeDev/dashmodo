import { useEffect, useRef } from 'react';
import { toast } from '../lib/toast';

/**
 * Toasts a query/fetch error once when it first occurs, not on every retry — queries here poll
 * every 10-15s, so toasting on every failed attempt while something's down would spam the screen.
 * The persistent `ApiErrorAlert` inline in the section still shows for as long as it's failing.
 */
export function useErrorToast(isError: boolean, error: unknown, fallbackMessage: string) {
	const wasError = useRef(false);

	useEffect(() => {
		if (isError && !wasError.current) {
			toast.error(error instanceof Error ? error.message : fallbackMessage);
		}
		wasError.current = isError;
	}, [isError, error, fallbackMessage]);
}

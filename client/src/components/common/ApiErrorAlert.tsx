import { Alert } from '@mantine/core';
import { ApiError } from '../../lib/api';

export function ApiErrorAlert({ error }: { error: unknown }) {
	const isServerSideFailure = error instanceof ApiError && error.status >= 500;
	const title = isServerSideFailure ? 'Could not reach Komodo' : 'Something went wrong';
	const message = error instanceof Error ? error.message : 'Unknown error';

	return (
		<Alert color="red" title={title}>
			{message}
		</Alert>
	);
}

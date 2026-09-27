import { Loader, Stack, Text, Title } from '@mantine/core';
import { useServers } from '../../hooks/useServers';
import { ServerCard } from './ServerCard';
import { ApiErrorAlert } from '../common/ApiErrorAlert';

export function ServersSection() {
	const { data, isLoading, isError, error } = useServers();

	return (
		<Stack>
			<Title order={2}>Servers</Title>

			{isLoading ? <Loader /> : null}

			{isError ? <ApiErrorAlert error={error} /> : null}

			{data && data.length === 0 ? <Text c="dimmed">No servers found.</Text> : null}

			{data && data.length > 0 ? (
				<Stack gap="md">
					{data.map((server) => (
						<ServerCard key={server.id} server={server} />
					))}
				</Stack>
			) : null}
		</Stack>
	);
}

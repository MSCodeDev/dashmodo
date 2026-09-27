import { Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useServers } from '../hooks/useServers';
import { ServerCard } from '../components/servers/ServerCard';
import { ApiErrorAlert } from '../components/common/ApiErrorAlert';

export function Servers() {
	const { data, isLoading, isError, error } = useServers();

	return (
		<Stack>
			<Title order={2}>Servers</Title>

			{isLoading ? <Loader /> : null}

			{isError ? <ApiErrorAlert error={error} /> : null}

			{data && data.length === 0 ? <Text c="dimmed">No servers found.</Text> : null}

			{data && data.length > 0 ? (
				<SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
					{data.map((server) => (
						<ServerCard key={server.id} server={server} />
					))}
				</SimpleGrid>
			) : null}
		</Stack>
	);
}

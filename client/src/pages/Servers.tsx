import { Alert, Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useServers } from '../hooks/useServers';
import { ServerCard } from '../components/servers/ServerCard';

export function Servers() {
	const { data, isLoading, isError, error } = useServers();

	return (
		<Stack>
			<Title order={2}>Servers</Title>

			{isLoading ? <Loader /> : null}

			{isError ? (
				<Alert color="red" title="Failed to load servers">
					{error instanceof Error ? error.message : 'Unknown error'}
				</Alert>
			) : null}

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

import { useState } from 'react';
import { ActionIcon, Group, Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { ChevronDown, ChevronUp, Server } from 'lucide-react';
import { useServers } from '../../hooks/useServers';
import { useConfig } from '../../hooks/useConfig';
import { useErrorToast } from '../../hooks/useErrorToast';
import { ServerCard } from './ServerCard';
import { ApiErrorAlert } from '../common/ApiErrorAlert';

export function ServersSection() {
	const { data, isLoading, isError, error } = useServers();
	const [expanded, setExpanded] = useState(false);
	const columns = useConfig().data?.appSettings.serversColumns ?? 2;
	useErrorToast(isError, error, 'Failed to load servers');

	return (
		<Stack>
			<Group justify="space-between">
				<Group gap="xs">
					<Server size={22} />
					<Title order={2}>Servers</Title>
				</Group>
				{data && data.length > 0 ? (
					<ActionIcon
						variant="subtle"
						color="gray"
						aria-label={expanded ? 'Collapse all' : 'Expand all'}
						onClick={() => setExpanded((v) => !v)}
					>
						{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
					</ActionIcon>
				) : null}
			</Group>

			{isLoading ? <Loader /> : null}

			{isError ? <ApiErrorAlert error={error} /> : null}

			{data && data.length === 0 ? <Text c="dimmed">No servers found.</Text> : null}

			{data && data.length > 0 ? (
				<SimpleGrid cols={{ base: 1, md: Math.min(columns, data.length) }} spacing="md">
					{data.map((server) => (
						<ServerCard key={server.id} server={server} expanded={expanded} />
					))}
				</SimpleGrid>
			) : null}
		</Stack>
	);
}

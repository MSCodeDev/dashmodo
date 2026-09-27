import { useState } from 'react';
import { ActionIcon, Group, Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useServers } from '../../hooks/useServers';
import { ServerCard } from './ServerCard';
import { ApiErrorAlert } from '../common/ApiErrorAlert';

export function ServersSection() {
	const { data, isLoading, isError, error } = useServers();
	const [expanded, setExpanded] = useState(false);

	return (
		<Stack>
			<Group justify="space-between">
				<Title order={2}>Servers</Title>
				{data && data.length > 0 ? (
					<ActionIcon
						variant="subtle"
						color="gray"
						aria-label={expanded ? 'Collapse all' : 'Expand all'}
						onClick={() => setExpanded((v) => !v)}
					>
						{expanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
					</ActionIcon>
				) : null}
			</Group>

			{isLoading ? <Loader /> : null}

			{isError ? <ApiErrorAlert error={error} /> : null}

			{data && data.length === 0 ? <Text c="dimmed">No servers found.</Text> : null}

			{data && data.length > 0 ? (
				<SimpleGrid cols={{ base: 1, md: data.length === 1 ? 1 : 2 }} spacing="md">
					{data.map((server) => (
						<ServerCard key={server.id} server={server} expanded={expanded} />
					))}
				</SimpleGrid>
			) : null}
		</Stack>
	);
}

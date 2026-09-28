import { Group, Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Layers } from 'lucide-react';
import { useStacks } from '../../hooks/useStacks';
import { useConfig } from '../../hooks/useConfig';
import { StackCard } from './StackCard';
import { ApiErrorAlert } from '../common/ApiErrorAlert';

export function StacksSection() {
	const { data, isLoading, isError, error } = useStacks();
	const columns = useConfig().data?.appSettings.stacksColumns ?? 3;

	return (
		<Stack>
			<Group gap="xs">
				<Layers size={22} />
				<Title order={2}>Stacks</Title>
			</Group>

			{isLoading ? <Loader /> : null}

			{isError ? <ApiErrorAlert error={error} /> : null}

			{data && data.length === 0 ? <Text c="dimmed">No stacks found.</Text> : null}

			{data && data.length > 0 ? (
				<SimpleGrid cols={{ base: 1, sm: Math.min(2, columns), lg: columns }} spacing="md">
					{data.map((stack) => (
						<StackCard key={stack.id} stack={stack} />
					))}
				</SimpleGrid>
			) : null}
		</Stack>
	);
}

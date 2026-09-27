import { Group, Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Layers } from 'lucide-react';
import { useStacks } from '../../hooks/useStacks';
import { StackCard } from './StackCard';
import { ApiErrorAlert } from '../common/ApiErrorAlert';

export function StacksSection() {
	const { data, isLoading, isError, error } = useStacks();

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
				<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
					{data.map((stack) => (
						<StackCard key={stack.id} stack={stack} />
					))}
				</SimpleGrid>
			) : null}
		</Stack>
	);
}

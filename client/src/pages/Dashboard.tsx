import { useMemo } from 'react';
import {
	Card,
	Group,
	RingProgress,
	SimpleGrid,
	Stack,
	Text,
	Title,
	UnstyledButton,
	type RingProgressSection
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useServers } from '../hooks/useServers';
import { useStacks } from '../hooks/useStacks';
import { serverStateColor, stackStateColor } from '../lib/colors';
import type { ServerState, StackState } from '../lib/types';

function countBy(states: string[]): Record<string, number> {
	const counts: Record<string, number> = {};
	for (const state of states) {
		counts[state] = (counts[state] ?? 0) + 1;
	}
	return counts;
}

interface Section {
	value: number;
	color: string;
	tooltip: string;
}

function SummaryCard({
	title,
	total,
	sections,
	onClick
}: {
	title: string;
	total: number;
	sections: Section[];
	onClick: () => void;
}) {
	return (
		<UnstyledButton onClick={onClick} style={{ display: 'block' }}>
			<Card withBorder padding="lg" radius="md">
				<Group>
					<RingProgress
						size={90}
						thickness={10}
						sections={sections.map(
							({ value, color }): RingProgressSection => ({ value, color })
						)}
						label={
							<Text ta="center" fw={700} size="lg">
								{total}
							</Text>
						}
					/>
					<Stack gap={2}>
						<Text fw={600}>{title}</Text>
						{sections.map((s) => (
							<Group key={s.tooltip} gap={6}>
								<div
									style={{
										width: 8,
										height: 8,
										borderRadius: 999,
										background: `var(--mantine-color-${s.color}-6)`
									}}
								/>
								<Text size="xs" c="dimmed">
									{s.tooltip}
								</Text>
							</Group>
						))}
					</Stack>
				</Group>
			</Card>
		</UnstyledButton>
	);
}

export function Dashboard() {
	const navigate = useNavigate();
	const servers = useServers();
	const stacks = useStacks();

	const serverCounts = useMemo(
		() => countBy(servers.data?.map((s) => s.info.state) ?? []),
		[servers.data]
	);
	const stackCounts = useMemo(
		() => countBy(stacks.data?.map((s) => s.info.state) ?? []),
		[stacks.data]
	);

	const serverSections: Section[] = Object.entries(serverCounts).map(([state, value]) => ({
		value,
		color: serverStateColor(state as ServerState),
		tooltip: `${state}: ${value}`
	}));
	const stackSections: Section[] = Object.entries(stackCounts).map(([state, value]) => ({
		value,
		color: stackStateColor(state as StackState),
		tooltip: `${state}: ${value}`
	}));

	return (
		<Stack>
			<Title order={2}>Dashboard</Title>
			<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
				<SummaryCard
					title="Servers"
					total={servers.data?.length ?? 0}
					sections={serverSections}
					onClick={() => navigate('/servers')}
				/>
				<SummaryCard
					title="Stacks"
					total={stacks.data?.length ?? 0}
					sections={stackSections}
					onClick={() => navigate('/stacks')}
				/>
			</SimpleGrid>
		</Stack>
	);
}

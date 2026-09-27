import { useState } from 'react';
import { ActionIcon, Badge, Card, Collapse, Group, SimpleGrid, Text } from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconCpu, IconDatabase, IconDeviceSdCard } from '@tabler/icons-react';
import { serverStateColor } from '../../lib/colors';
import { StatBar } from '../common/StatBar';
import { ServerExpanded } from './ServerExpanded';
import type { ServerListItem } from '../../lib/types';

export function ServerCard({ server }: { server: ServerListItem }) {
	const [expanded, setExpanded] = useState(false);
	const stats = server.info.stats;

	return (
		<Card withBorder padding="md" radius="md">
			<Group justify="space-between" mb="xs" wrap="nowrap">
				<Group gap="xs" wrap="nowrap">
					<Text fw={600}>{server.name}</Text>
					<Badge color={serverStateColor(server.info.state)} variant="light">
						{server.info.state}
					</Badge>
					{server.info.region ? (
						<Text size="xs" c="dimmed">
							{server.info.region}
						</Text>
					) : null}
				</Group>
				<ActionIcon
					variant="subtle"
					color="gray"
					aria-label={expanded ? 'Collapse' : 'Expand'}
					onClick={() => setExpanded((v) => !v)}
				>
					{expanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
				</ActionIcon>
			</Group>

			{stats ? (
				<SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
					<StatBar icon={IconCpu} label="CPU" percent={stats.cpu_perc} />
					<StatBar
						icon={IconDatabase}
						label="Memory"
						percent={(stats.mem_used_gb / stats.mem_total_gb) * 100}
						detail={`${stats.mem_used_gb.toFixed(1)} / ${stats.mem_total_gb.toFixed(1)} GB`}
					/>
					{stats.disk_total_gb ? (
						<StatBar
							icon={IconDeviceSdCard}
							label="Disk"
							percent={((stats.disk_used_gb ?? 0) / stats.disk_total_gb) * 100}
							detail={`${(stats.disk_used_gb ?? 0).toFixed(0)} / ${stats.disk_total_gb.toFixed(0)} GB`}
						/>
					) : null}
				</SimpleGrid>
			) : (
				<Text size="xs" c="dimmed">
					No stats available
				</Text>
			)}

			<Collapse expanded={expanded}>
				<ServerExpanded serverId={server.id} active={expanded} />
			</Collapse>
		</Card>
	);
}

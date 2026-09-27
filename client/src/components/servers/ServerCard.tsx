import { useState } from 'react';
import { Badge, Button, Card, Collapse, Group, Stack, Text } from '@mantine/core';
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
				</Group>
				<Button size="xs" variant="subtle" onClick={() => setExpanded((v) => !v)}>
					{expanded ? 'Collapse' : 'Expand'}
				</Button>
			</Group>

			{server.info.region ? (
				<Text size="xs" c="dimmed" mb="xs">
					{server.info.region}
				</Text>
			) : null}

			{stats ? (
				<Stack gap={6}>
					<StatBar label="CPU" percent={stats.cpu_perc} />
					<StatBar
						label="Memory"
						percent={(stats.mem_used_gb / stats.mem_total_gb) * 100}
						detail={`${stats.mem_used_gb.toFixed(1)} / ${stats.mem_total_gb.toFixed(1)} GB`}
					/>
					{stats.disk_total_gb ? (
						<StatBar
							label="Disk"
							percent={((stats.disk_used_gb ?? 0) / stats.disk_total_gb) * 100}
							detail={`${(stats.disk_used_gb ?? 0).toFixed(0)} / ${stats.disk_total_gb.toFixed(0)} GB`}
						/>
					) : null}
				</Stack>
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

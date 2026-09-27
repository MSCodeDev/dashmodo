import { Card, Collapse, Group, SimpleGrid, Text } from '@mantine/core';
import { Cpu, Database, MemoryStick } from 'lucide-react';
import { serverStateColor } from '../../lib/colors';
import { serverStateIcon } from '../../lib/statusIcons';
import { StatBar } from '../common/StatBar';
import { StatusIcon } from '../common/StatusIcon';
import { ServerExpanded } from './ServerExpanded';
import type { ServerListItem } from '../../lib/types';

export function ServerCard({ server, expanded }: { server: ServerListItem; expanded: boolean }) {
	const stats = server.info.stats;

	return (
		<Card
			withBorder
			padding="md"
			radius="md"
			bg="#15171b"
			style={{ borderColor: '#1d1f25' }}
		>
			<Group gap="xs" wrap="nowrap" mb="xs">
				<StatusIcon
					icon={serverStateIcon(server.info.state)}
					color={serverStateColor(server.info.state)}
					label={server.info.state}
				/>
				<Text fw={600}>{server.name}</Text>
				{server.info.region ? (
					<Text size="xs" c="dimmed">
						{server.info.region}
					</Text>
				) : null}
			</Group>

			{stats ? (
				<SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
					<StatBar icon={Cpu} label="CPU" percent={stats.cpu_perc} />
					<StatBar
						icon={MemoryStick}
						label="Memory"
						percent={(stats.mem_used_gb / stats.mem_total_gb) * 100}
						detail={`${stats.mem_used_gb.toFixed(1)} / ${stats.mem_total_gb.toFixed(1)} GB`}
					/>
					{stats.disk_total_gb ? (
						<StatBar
							icon={Database}
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

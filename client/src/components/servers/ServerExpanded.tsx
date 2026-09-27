import { lazy, Suspense, useState } from 'react';
import { Divider, Loader, Select, SimpleGrid, Stack, Text } from '@mantine/core';
import { useServerDetail, useServerHistory } from '../../hooks/useServers';
import { StatBar } from '../common/StatBar';

const HistoricalChart = lazy(() =>
	import('./HistoricalChart').then((m) => ({ default: m.HistoricalChart }))
);

const GRANULARITY_OPTIONS = [
	{ value: '1-min', label: '1 min' },
	{ value: '5-min', label: '5 min' },
	{ value: '15-min', label: '15 min' },
	{ value: '1-hr', label: '1 hour' }
];

export function ServerExpanded({ serverId, active }: { serverId: string; active: boolean }) {
	const [granularity, setGranularity] = useState('1-min');
	const detail = useServerDetail(serverId, active);
	const history = useServerHistory(serverId, granularity, active);

	if (!active) return null;
	if (detail.isLoading) return <Loader size="sm" mt="md" />;
	if (detail.isError) {
		return (
			<Text size="sm" c="red" mt="md">
				Failed to load server detail
			</Text>
		);
	}

	const stats = detail.data?.stats;

	return (
		<Stack mt="md" gap="sm">
			<Divider label="Current" />
			{stats ? (
				<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
					<StatBar label="CPU" percent={stats.cpu_perc} />
					<StatBar
						label="Memory"
						percent={(stats.mem_used_gb / stats.mem_total_gb) * 100}
						detail={`${stats.mem_used_gb.toFixed(1)} / ${stats.mem_total_gb.toFixed(1)} GB`}
					/>
					{stats.disks.map((d) => (
						<StatBar
							key={d.mount}
							label={`Disk (${d.mount})`}
							percent={(d.used_gb / d.total_gb) * 100}
							detail={`${d.used_gb.toFixed(0)} / ${d.total_gb.toFixed(0)} GB`}
						/>
					))}
				</SimpleGrid>
			) : (
				<Text size="sm" c="dimmed">
					No current stats
				</Text>
			)}

			<Divider label="History" />
			<Select
				data={GRANULARITY_OPTIONS}
				value={granularity}
				onChange={(v) => v && setGranularity(v)}
				w={140}
				size="xs"
				allowDeselect={false}
			/>
			<Suspense fallback={<Loader size="sm" />}>
				{history.data ? <HistoricalChart records={history.data.stats} /> : null}
			</Suspense>
		</Stack>
	);
}

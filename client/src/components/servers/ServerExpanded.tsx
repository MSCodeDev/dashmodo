import { lazy, Suspense, useState } from 'react';
import { Loader, Select, Stack, Text } from '@mantine/core';
import { useServerHistory } from '../../hooks/useServers';

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
	const [granularity, setGranularity] = useState('1-hr');
	const history = useServerHistory(serverId, granularity, active);

	if (!active) return null;

	return (
		<Stack mt="md" gap="sm">
			<Select
				data={GRANULARITY_OPTIONS}
				value={granularity}
				onChange={(v) => v && setGranularity(v)}
				w={140}
				size="xs"
				allowDeselect={false}
			/>
			{history.isLoading ? <Loader size="sm" /> : null}
			{history.isError ? (
				<Text size="sm" c="red">
					Failed to load history
				</Text>
			) : null}
			<Suspense fallback={<Loader size="sm" />}>
				{history.data ? <HistoricalChart records={history.data.stats} /> : null}
			</Suspense>
		</Stack>
	);
}

import { Group, Progress, Text } from '@mantine/core';
import { statColor } from '../../lib/colors';

interface StatBarProps {
	label: string;
	percent: number;
	detail?: string;
}

export function StatBar({ label, percent, detail }: StatBarProps) {
	const clamped = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
	return (
		<div>
			<Group justify="space-between" mb={2}>
				<Text size="xs" c="dimmed">
					{label}
				</Text>
				<Text size="xs" c="dimmed">
					{detail ?? `${clamped.toFixed(0)}%`}
				</Text>
			</Group>
			<Progress value={clamped} color={statColor(clamped)} size="sm" />
		</div>
	);
}

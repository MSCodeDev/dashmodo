import { Group, Progress, Text } from '@mantine/core';
import type { LucideIcon } from 'lucide-react';
import { statColor } from '../../lib/colors';

interface StatBarProps {
	label: string;
	percent: number;
	detail?: string;
	icon: LucideIcon;
}

export function StatBar({ label, percent, detail, icon: IconComponent }: StatBarProps) {
	const clamped = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
	return (
		<div>
			<Group justify="space-between" mb={2}>
				<Group gap={6}>
					<IconComponent size={14} />
					<Text size="xs" c="dimmed">
						{label}
					</Text>
				</Group>
				<Text size="xs" c="dimmed">
					{detail ?? `${clamped.toFixed(0)}%`}
				</Text>
			</Group>
			<Progress value={clamped} color={statColor(clamped)} size="sm" />
		</div>
	);
}

import { Tooltip } from '@mantine/core';
import type { LucideIcon } from 'lucide-react';

interface StatusIconProps {
	icon: LucideIcon;
	color: string;
	label: string;
	size?: number;
}

export function StatusIcon({ icon: IconComponent, color, label, size = 20 }: StatusIconProps) {
	return (
		<Tooltip label={label} withArrow>
			<IconComponent size={size} color={`var(--mantine-color-${color}-6)`} style={{ display: 'block' }} />
		</Tooltip>
	);
}

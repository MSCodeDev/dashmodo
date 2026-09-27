import { Tooltip } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';

interface StatusIconProps {
	icon: Icon;
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

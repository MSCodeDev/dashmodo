import { Avatar, Card, Group, Stack, Text, useComputedColorScheme } from '@mantine/core';
import { stackStateColor } from '../../lib/colors';
import { resolveIconUrl } from '../../lib/icons';
import { stackStateIcon } from '../../lib/statusIcons';
import { GLASS } from '../../lib/glass';
import { StatusIcon } from '../common/StatusIcon';
import { useConfig } from '../../hooks/useConfig';
import classes from './StackCard.module.css';
import type { StackListItem } from '../../lib/types';

export function StackCard({ stack }: { stack: StackListItem }) {
	const hasLink = Boolean(stack.link.url);
	const iconStyle = useConfig().data?.appSettings.defaultIconStyle;
	const scheme = useComputedColorScheme('dark');
	const glass = GLASS.card[scheme];

	return (
		<Card
			component={hasLink ? 'a' : 'div'}
			href={hasLink ? stack.link.url : undefined}
			target={hasLink ? '_blank' : undefined}
			rel={hasLink ? 'noreferrer' : undefined}
			withBorder
			padding="md"
			radius="md"
			className={hasLink ? classes.card : undefined}
			style={{
				cursor: hasLink ? 'pointer' : 'default',
				textDecoration: 'none',
				color: 'inherit',
				opacity: hasLink ? 1 : 0.7,
				...glass,
				backdropFilter: 'blur(10px)',
				WebkitBackdropFilter: 'blur(10px)'
			}}
		>
			<Group justify="space-between" align="flex-start" wrap="nowrap">
				<Group wrap="nowrap" align="center" style={{ flex: 1, minWidth: 0 }}>
					<Avatar src={resolveIconUrl(stack.icon, iconStyle)} radius="sm" size="md">
						{stack.name.slice(0, 2).toUpperCase()}
					</Avatar>
					<Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
						<Text fw={600} truncate>
							{stack.name}
						</Text>
						<Text size="xs" c="dimmed">
							{stack.info.server_name ?? '—'}
						</Text>
					</Stack>
				</Group>
				<StatusIcon
					icon={stackStateIcon(stack.info.state)}
					color={stackStateColor(stack.info.state)}
					label={stack.info.state}
				/>
			</Group>

			{!hasLink ? (
				<Text size="xs" c="dimmed" fs="italic" mt="sm">
					No link
				</Text>
			) : null}
		</Card>
	);
}

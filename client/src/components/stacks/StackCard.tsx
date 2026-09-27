import { Avatar, Badge, Card, Group, Stack, Text } from '@mantine/core';
import { stackStateColor } from '../../lib/colors';
import { selfhstIconUrl } from '../../lib/icons';
import type { StackListItem } from '../../lib/types';

export function StackCard({ stack }: { stack: StackListItem }) {
	const hasLink = Boolean(stack.link.url);

	return (
		<Card
			component={hasLink ? 'a' : 'div'}
			href={hasLink ? stack.link.url : undefined}
			target={hasLink ? '_blank' : undefined}
			rel={hasLink ? 'noreferrer' : undefined}
			withBorder
			padding="md"
			radius="md"
			style={{
				cursor: hasLink ? 'pointer' : 'default',
				textDecoration: 'none',
				color: 'inherit',
				opacity: hasLink ? 1 : 0.7
			}}
		>
			<Group wrap="nowrap" align="center">
				<Avatar src={selfhstIconUrl(stack.icon)} radius="sm" size="md">
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

			<Group justify="space-between" mt="sm" align="center">
				<Badge color={stackStateColor(stack.info.state)} variant="light">
					{stack.info.state}
				</Badge>
				{!hasLink ? (
					<Text size="xs" c="dimmed" fs="italic">
						No link
					</Text>
				) : null}
			</Group>
		</Card>
	);
}

import { Badge, Card, Group, Stack, Text } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import { stackStateColor } from '../../lib/colors';
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
			<Group justify="space-between" wrap="nowrap" align="flex-start">
				<Stack gap={2}>
					<Text fw={600}>{stack.name}</Text>
					<Text size="xs" c="dimmed">
						{stack.info.server_name ?? '—'}
					</Text>
				</Stack>
				{hasLink ? <IconExternalLink size={16} opacity={0.6} /> : null}
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

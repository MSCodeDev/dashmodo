import { Anchor, Badge, Table, Text } from '@mantine/core';
import { stackStateColor } from '../../lib/colors';
import type { StackListItem } from '../../lib/types';

export function StackTable({ stacks }: { stacks: StackListItem[] }) {
	return (
		<Table striped highlightOnHover verticalSpacing="sm">
			<Table.Thead>
				<Table.Tr>
					<Table.Th>Name</Table.Th>
					<Table.Th>Server</Table.Th>
					<Table.Th>Status</Table.Th>
					<Table.Th>Link</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{stacks.map((stack) => (
					<Table.Tr key={stack.id}>
						<Table.Td>{stack.name}</Table.Td>
						<Table.Td>{stack.info.server_name ?? '—'}</Table.Td>
						<Table.Td>
							<Badge color={stackStateColor(stack.info.state)} variant="light">
								{stack.info.state}
							</Badge>
							{stack.info.status ? (
								<Text size="xs" c="dimmed" mt={2}>
									{stack.info.status}
								</Text>
							) : null}
						</Table.Td>
						<Table.Td>
							{stack.link.url ? (
								<Anchor href={stack.link.url} target="_blank" rel="noreferrer">
									Open
								</Anchor>
							) : (
								<Text size="sm" c="dimmed">
									No link
								</Text>
							)}
						</Table.Td>
					</Table.Tr>
				))}
			</Table.Tbody>
		</Table>
	);
}

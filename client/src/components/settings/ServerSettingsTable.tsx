import { useState } from 'react';
import { Button, Group, Stack, Table, Text, TextInput } from '@mantine/core';
import { useUpdateServerSettings } from '../../hooks/useSettings';
import type { ServerSettingsRow } from '../../lib/types';

function ServerSettingsRowItem({ row }: { row: ServerSettingsRow }) {
	const [linkOverride, setLinkOverride] = useState(row.linkOverride ?? '');
	const update = useUpdateServerSettings();

	return (
		<Table.Tr>
			<Table.Td>{row.name}</Table.Td>
			<Table.Td>
				<Stack gap={2}>
					<TextInput
						placeholder={row.detectedAddress ?? 'no address detected'}
						value={linkOverride}
						onChange={(e) => setLinkOverride(e.currentTarget.value)}
						size="xs"
						w={220}
					/>
					{row.detectedAddress ? (
						<Text size="xs" c="dimmed">
							Komodo reports: {row.detectedAddress}
						</Text>
					) : null}
				</Stack>
			</Table.Td>
			<Table.Td>
				<Group gap="xs" wrap="nowrap">
					<Button
						size="xs"
						variant="light"
						disabled={linkOverride === (row.linkOverride ?? '')}
						loading={update.isPending}
						onClick={() => update.mutate({ id: row.id, linkOverride })}
					>
						Save
					</Button>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
}

export function ServerSettingsTable({ rows }: { rows: ServerSettingsRow[] }) {
	return (
		<Table verticalSpacing="sm">
			<Table.Thead>
				<Table.Tr>
					<Table.Th>Name</Table.Th>
					<Table.Th>Link host override</Table.Th>
					<Table.Th></Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{rows.map((row) => (
					<ServerSettingsRowItem key={row.id} row={row} />
				))}
			</Table.Tbody>
		</Table>
	);
}

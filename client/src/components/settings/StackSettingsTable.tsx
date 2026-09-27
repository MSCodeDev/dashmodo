import { useState } from 'react';
import { Button, Group, Switch, Table, TextInput } from '@mantine/core';
import { useUpdateStackSettings } from '../../hooks/useSettings';
import type { StackSettingsRow } from '../../lib/types';

function StackSettingsRowItem({ row }: { row: StackSettingsRow }) {
	const [linkOverride, setLinkOverride] = useState(row.linkOverride ?? '');
	const update = useUpdateStackSettings();

	return (
		<Table.Tr>
			<Table.Td>{row.name}</Table.Td>
			<Table.Td>{row.server_name ?? '—'}</Table.Td>
			<Table.Td>
				<Switch
					checked={row.hidden}
					onChange={(e) => update.mutate({ id: row.id, hidden: e.currentTarget.checked })}
				/>
			</Table.Td>
			<Table.Td>
				<Group gap="xs" wrap="nowrap">
					<TextInput
						placeholder="https://..."
						value={linkOverride}
						onChange={(e) => setLinkOverride(e.currentTarget.value)}
						size="xs"
						w={220}
					/>
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

export function StackSettingsTable({ rows }: { rows: StackSettingsRow[] }) {
	return (
		<Table verticalSpacing="sm">
			<Table.Thead>
				<Table.Tr>
					<Table.Th>Name</Table.Th>
					<Table.Th>Server</Table.Th>
					<Table.Th>Hidden</Table.Th>
					<Table.Th>Link override</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{rows.map((row) => (
					<StackSettingsRowItem key={row.id} row={row} />
				))}
			</Table.Tbody>
		</Table>
	);
}

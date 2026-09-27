import { useState } from 'react';
import { Avatar, Button, Group, Stack, Switch, Table, Text, TextInput } from '@mantine/core';
import { useUpdateStackSettings } from '../../hooks/useSettings';
import { selfhstIconUrl } from '../../lib/icons';
import type { StackSettingsRow } from '../../lib/types';

function StackSettingsRowItem({ row }: { row: StackSettingsRow }) {
	const [linkOverride, setLinkOverride] = useState(row.linkOverride ?? '');
	const [iconOverride, setIconOverride] = useState(row.iconOverride ?? '');
	const update = useUpdateStackSettings();

	const previewIconRef = iconOverride || row.defaultIcon;

	return (
		<Table.Tr>
			<Table.Td>
				<Group gap="xs" wrap="nowrap">
					<Avatar src={selfhstIconUrl(previewIconRef)} size="sm" radius="sm">
						{row.name.slice(0, 2).toUpperCase()}
					</Avatar>
					{row.name}
				</Group>
			</Table.Td>
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
						w={200}
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
			<Table.Td>
				<Stack gap={2}>
					<Group gap="xs" wrap="nowrap">
						<TextInput
							placeholder={row.defaultIcon}
							value={iconOverride}
							onChange={(e) => setIconOverride(e.currentTarget.value)}
							size="xs"
							w={160}
						/>
						<Button
							size="xs"
							variant="light"
							disabled={iconOverride === (row.iconOverride ?? '')}
							loading={update.isPending}
							onClick={() => update.mutate({ id: row.id, iconOverride })}
						>
							Save
						</Button>
					</Group>
					<Text size="xs" c="dimmed">
						selfh.st/icons reference, e.g. "jellyfin"
					</Text>
				</Stack>
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
					<Table.Th>Icon override</Table.Th>
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

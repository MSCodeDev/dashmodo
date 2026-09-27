import { Group, Table, TextInput, Tooltip } from '@mantine/core';
import { Info } from 'lucide-react';
import type { ServerSettingsRow } from '../../lib/types';
import type { PendingServerChange } from '../../hooks/useSettings';

interface Props {
	rows: ServerSettingsRow[];
	pending: Record<string, PendingServerChange>;
	onChange: (id: string, patch: PendingServerChange) => void;
}

export function ServerSettingsTable({ rows, pending, onChange }: Props) {
	return (
		<Table verticalSpacing="sm">
			<Table.Thead>
				<Table.Tr>
					<Table.Th>Name</Table.Th>
					<Table.Th>
						<Group gap={4} wrap="nowrap">
							Link host override
							<Tooltip
								label="Host used when deriving a stack's link from a published port, in place of what Komodo detects (shown as the placeholder below)."
								multiline
								w={260}
							>
								<Info size={14} style={{ opacity: 0.6, cursor: 'help' }} />
							</Tooltip>
						</Group>
					</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{rows.map((row) => {
					const effective = pending[row.id]?.linkOverride ?? row.linkOverride ?? '';
					return (
						<Table.Tr key={row.id}>
							<Table.Td>{row.name}</Table.Td>
							<Table.Td>
								<TextInput
									placeholder={row.detectedAddress ?? 'no address detected'}
									value={effective}
									onChange={(e) => onChange(row.id, { linkOverride: e.currentTarget.value })}
									size="xs"
									w={220}
								/>
							</Table.Td>
						</Table.Tr>
					);
				})}
			</Table.Tbody>
		</Table>
	);
}
